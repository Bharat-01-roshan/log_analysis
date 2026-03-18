from elasticsearch import Elasticsearch
import urllib3
import json
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Disable SSL warnings for local network HTTPS
urllib3.disable_warnings()

# Configuration - Use environment variables or default to localhost
ES_USER = os.getenv("ES_USER", "elastic")
ES_PASS = os.getenv("ES_PASS", "2W-HFs8RGlThS9id=R9d")
ES_SERVER = os.getenv("ES_SERVER", "localhost")
ES_PORT = os.getenv("ES_PORT", "9200")
ES_INDEX = os.getenv("ES_INDEX", "sma_logs")

ES_URL = f"http://{ES_USER}:{ES_PASS}@{ES_SERVER}:{ES_PORT}"

# Connect
es = Elasticsearch(ES_URL)

try:
    print(f"[*] Testing connection to: http://{ES_SERVER}:{ES_PORT}")
    # 1. Check if index exists
    if not es.indices.exists(index=ES_INDEX):
        print(f"[!] Error: Index '{ES_INDEX}' does NOT exist.")
    else:
        # 2. Get document count
        count = es.count(index=ES_INDEX)["count"]
        print(f"[*] Total Documents in '{ES_INDEX}': {count}")

        # 3. Get recent logs
        res = es.search(index=ES_INDEX, body={"query": {"match_all": {}}, "size": 3, "sort": [{"timestamp": "desc"}]})
        print("\n[*] Recent Logs in Elasticsearch:")
        for hit in res['hits']['hits']:
            print(f" - {hit['_source']['timestamp']} | {hit['_source']['severity']} | {hit['_source']['message'][:60]}...")

        # 4. Check for Stats
        print("\n[*] Testing Aggregations (Dashboard Stats):")
        agg_res = es.search(index=ES_INDEX, body={
            "size": 0,
            "aggs": {
                "by_severity": {"terms": {"field": "severity.keyword"}}
            }
        })
        print(json.dumps(agg_res.get('aggregations', {}), indent=2))

except Exception as e:
    print(f"[!] Elasticsearch Connectivity Error: {e}")
