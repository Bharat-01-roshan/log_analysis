import json
import time
import os
import re
import requests
import urllib3
from redis import Redis
from elasticsearch import Elasticsearch
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.ensemble import IsolationForest
import joblib
from google import genai
from dotenv import load_dotenv

# Load environment variables from .env
load_dotenv()

# Disable SSL warnings (even if using http, good for compatibility)
urllib3.disable_warnings()

# --- Configuration ---
REDIS_HOST = os.getenv("REDIS_HOST", "localhost")
REDIS_KEY = os.getenv("REDIS_KEY", "syslog_stream")
ES_USER = os.getenv("ES_USER", "elastic")
ES_PASS = os.getenv("ES_PASS", "2W-HFs8RGlThS9id=R9d")
ES_SERVER = os.getenv("ES_SERVER", "localhost")
ES_PORT = os.getenv("ES_PORT", "9200")
ES_INDEX = os.getenv("ES_INDEX", "sma_logs")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
ALERT_WEBHOOK_URL = os.getenv("ALERT_WEBHOOK_URL", "")

# Window for correlation (in seconds)
CORRELATION_WINDOW = 300 
HIT_THRESHOLD = 5 # 5 alerts from same IP in 5 mins = CRITICAL

geo_cache = {}

def send_alert(msg, severity, ip, device_id, llm_summary=None):
    """Sends a rich alert to Slack/Discord."""
    if not ALERT_WEBHOOK_URL: return
    
    payload = {
        "content": f"🚨 **CRITICAL SECURITY ALERT** 🚨\n"
                   f"**Device:** `{device_id}`\n"
                   f"**Source IP:** `{ip}`\n"
                   f"**Severity:** `{severity}`\n"
                   f"**Message:** {msg}\n"
                   f"**AI Insight:** {llm_summary or 'No AI summary available.'}"
    }
    try:
        requests.post(ALERT_WEBHOOK_URL, json=payload, timeout=2)
    except:
        pass

def track_correlation(ip, device_id):
    """Tracks frequency of alerts per IP/Device in Redis."""
    key = f"corr:{device_id}:{ip}"
    pipe = redis_client.pipeline()
    pipe.incr(key)
    pipe.expire(key, CORRELATION_WINDOW)
    res = pipe.execute()
    return res[0] # Returns the current count

def get_ip_location(ip):
    if ip == "unknown" or any(ip.startswith(p) for p in ["192.168.", "10.", "172.16.", "127."]):
        return {"country": "Internal", "city": "Private Network", "location": None}
    if ip in geo_cache: return geo_cache[ip]
    try:
        response = requests.get(f"http://ip-api.com/json/{ip}", timeout=2).json()
        if response.get("status") == "success":
            data = {"country": response.get("country"), "city": response.get("city"), "location": {"lat": response.get("lat"), "lon": response.get("lon")}}
            geo_cache[ip] = data
            return data
    except: pass
    return {"country": "Unknown", "city": "Unknown", "location": None}

# --- Gemini Setup ---
if GEMINI_API_KEY:
    client_gemini = genai.Client(api_key=GEMINI_API_KEY)
else:
    client_gemini = None

redis_client = Redis(host=REDIS_HOST, port=6379, db=0)

# Connect with basic_auth separately (fixes common 400 issues with passwords containing symbols)
es_client = Elasticsearch(
    [f"http://{ES_SERVER}:{ES_PORT}"],
    basic_auth=(ES_USER, ES_PASS),
    verify_certs=False
)

# --- Mock ML Setup ---
def load_model():
    try:
        return joblib.load("ml_pipeline/models/isolation_forest.joblib"), joblib.load("ml_pipeline/models/tfidf_vectorizer.joblib")
    except:
        clf = IsolationForest(contamination=0.1)
        dummy_data = ["sshd: Accepted", "sshd: Failed", "kernel: OOM", "cron: session"]
        vec = TfidfVectorizer()
        X = vec.fit_transform(dummy_data)
        clf.fit(X.toarray())
        return clf, vec

model, vectorizer = load_model()

def analyze_with_llm(log_entry, anomaly_score, geo_data):
    if not client_gemini: return None
    prompt = f"Analyze syslog: Score {anomaly_score:.4f}, Origin {geo_data['city']}, {geo_data['country']}. Log: {json.dumps(log_entry)}. Return JSON: summary, threat_category, is_anomaly, remediation, zero_day_potential (0-1), reasoning."
    try:
        response = client_gemini.models.generate_content(
            model='gemini-1.5-flash',
            contents=prompt
        )
        text = response.text.strip()
        if text.startswith("```json"): text = text[7:-3]
        elif text.startswith("```"): text = text[3:-3]
        return json.loads(text)
    except: return None

def determine_severity(msg, anomaly_score, hit_count):
    severity = "Low"
    msg_lower = msg.lower()
    
    if any(kw in msg_lower for kw in ["failed password", "invalid user", "root login"]): severity = "High"
    elif "oom killer" in msg_lower or "kernel panic" in msg_lower: severity = "Severe"
    elif "error" in msg_lower: severity = "Medium"
    elif anomaly_score < -0.8: severity = "High"
    
    # Stateful escalation: Many hits from same source
    if hit_count >= HIT_THRESHOLD and severity in ["High", "Severe"]:
        return "CRITICAL (Correlation Alert)"
    
    return severity

def create_index_if_not_exists():
    try:
        if not es_client.indices.exists(index=ES_INDEX):
            mapping = {"mappings": {"properties": {
                "timestamp": {"type": "date"}, "device_id": {"type": "keyword"}, "host": {"type": "keyword"},
                "source_ip": {"type": "keyword"}, "geo_location": {"type": "geo_point"},
                "country": {"type": "keyword"}, "city": {"type": "keyword"}, "severity": {"type": "keyword"},
                "message": {"type": "text"}, "anomaly_score": {"type": "float"}, "llm_analysis": {"properties": {
                    "summary": {"type": "text"}, "threat_category": {"type": "keyword"}, "is_anomaly": {"type": "boolean"},
                    "remediation": {"type": "text"}, "zero_day_potential": {"type": "float"}, "reasoning": {"type": "text"}
                }}
            }}}
            es_client.indices.create(index=ES_INDEX, body=mapping)
            print(f"[*] Created index: {ES_INDEX}")
    except Exception as e:
        print(f"[!] Warning: Could not verify or create index: {e}")

def process_logs():
    create_index_if_not_exists()
    print(f"[*] ML Inference Worker v3 (Alerting + Correlation) active...")
    while True:
        _, data = redis_client.blpop(REDIS_KEY)
        log_entry = json.loads(data)
        
        message = log_entry.get("message", "")
        host = log_entry.get("host", "unknown")
        device_id = log_entry.get("device_id") or log_entry.get("device_token") or "unregistered_device"
        timestamp = log_entry.get("timestamp") or time.strftime('%Y-%m-%dT%H:%M:%SZ')

        source_ip = log_entry.get("source_ip") or "unknown"
        if source_ip == "unknown":
            ip_match = re.search(r'(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})', message)
            if ip_match: source_ip = ip_match.group(1)

        # 1. Geolocation & Correlation
        geo_data = get_ip_location(source_ip)
        hit_count = track_correlation(source_ip, device_id)

        # 2. ML & Severity
        try:
            X = vectorizer.transform([message]).toarray()
            anomaly_score = model.decision_function(X)[0]
        except: anomaly_score = 0.0

        severity = determine_severity(message, anomaly_score, hit_count)

        # 3. LLM Analysis for High Threats
        llm_data = None
        if "High" in severity or "Severe" in severity or "CRITICAL" in severity:
            llm_data = analyze_with_llm(log_entry, anomaly_score, geo_data)
            
            # Send Real-time alert for Critical or High severity
            if "CRITICAL" in severity or (severity == "High" and llm_data and llm_data.get('is_anomaly')):
                llm_summary = llm_data.get('summary') if llm_data else None
                send_alert(message, severity, source_ip, device_id, llm_summary)

        # 4. Final Enrichment
        enriched_log = {
            "timestamp": timestamp, "device_id": device_id, "host": host, "message": message,
            "anomaly_score": float(anomaly_score), "severity": severity, "source_ip": source_ip,
            "country": geo_data["country"], "city": geo_data["city"], "geo_location": geo_data["location"],
            "llm_analysis": llm_data
        }

        try:
            es_client.index(index=ES_INDEX, body=enriched_log)
            status = f"[{severity}]" if "CRITICAL" in severity else severity
            print(f"[+] {status} | {device_id} | {source_ip} | Hits: {hit_count}")
        except Exception as e:
            print(f"[!] ES Error: {e}")

if __name__ == "__main__":
    process_logs()
