import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.ensemble import IsolationForest
import joblib
import os

# --- 1. Representative Dataset ---
# In a real-world scenario, you would load these from Elasticsearch or a CSV file.
normal_logs = [
    "sshd: Accepted publickey for user admin from 192.168.1.5",
    "sshd: session opened for user admin",
    "sshd: session closed for user admin",
    "systemd: Started Session 1 of user admin.",
    "kernel: imklog 5.8.1, log source = /proc/kmsg started.",
    "cron: (root) CMD (   /usr/bin/python3 /opt/scripts/health_check.py)",
    "anacron: Job `cron.daily' terminated",
    "postfix/smtpd: connect from localhost[127.0.0.1]",
    "postfix/smtpd: disconnect from localhost[127.0.0.1]",
    "ntp: Synchronized to time server 162.159.200.1",
    "systemd: Starting Periodic Command Scheduler...",
    "systemd: Started Periodic Command Scheduler.",
] * 50 # Over-represent "normal" behavior

anomalous_logs = [
    "sshd: Failed password for root from 203.0.113.45 port 22 ssh2",
    "sshd: Invalid user guest from 198.51.100.12",
    "kernel: Out of memory: Kill process 1234 (java) score 900 or sacrifice child",
    "kernel: BUG: unable to handle kernel NULL pointer dereference",
    "sshd: fatal: Timeout before authentication for 45.33.32.156",
    "systemd: Failed to start Malicious Service.",
    "python: [CRITICAL] Database connection failed: Connection refused",
]

all_logs = normal_logs + anomalous_logs

# --- 2. Feature Engineering (TF-IDF) ---
print("[*] Vectorizing log data...")
vectorizer = TfidfVectorizer(
    max_features=500, 
    stop_words='english',
    ngram_range=(1, 2) # Capture phrases like "Failed password"
)
X = vectorizer.fit_transform(all_logs).toarray()

# --- 3. Training (Isolation Forest) ---
# contamination is the expected percentage of anomalies in the dataset
print("[*] Training Isolation Forest model...")
model = IsolationForest(
    n_estimators=100,
    contamination=0.05, 
    random_state=42
)
model.fit(X)

# --- 4. Evaluate (Simple check) ---
# Scores closer to -1 are anomalies, scores closer to 1 are normal.
test_anomalies = model.decision_function(vectorizer.transform(anomalous_logs).toarray())
test_normals = model.decision_function(vectorizer.transform(normal_logs[:5]).toarray())

print("--- Model Evaluation ---")
print(f"Avg Score for Normal Logs: {np.mean(test_normals):.4f}")
print(f"Avg Score for Anomalous Logs: {np.mean(test_anomalies):.4f}")

# --- 5. Save Models ---
os.makedirs("ml_pipeline/models", exist_ok=True)
joblib.dump(model, "ml_pipeline/models/isolation_forest.joblib")
joblib.dump(vectorizer, "ml_pipeline/models/tfidf_vectorizer.joblib")

print("[+] Success: Models saved to ml_pipeline/models/")
