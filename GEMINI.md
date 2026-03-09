# Syslog ML-Powered Analysis (SMA) - Workspace Context

This project is a complete pipeline for real-time syslog ingestion, ML-based anomaly detection, and interactive monitoring.

## 🏗️ Architecture
- **Ingestion:** Vector (running in Docker) on port `514` (UDP) sends logs to **Redis** (`syslog_stream`).
- **Processing:** `ml_pipeline/inference.py` (Python) pulls from Redis, calculates `anomaly_score`, determines `severity`, and indexes to **Elasticsearch**.
- **API:** `backend/main.py` (FastAPI) provides logs and statistics from Elasticsearch.
- **Dashboard:** `dashboard/` (React) provides the visual monitoring interface.

## 🚀 How to Start the System

### 1. Start Infrastructure (Redis & Vector)
```powershell
docker-compose up -d
```

### 2. Start ML Inference Worker
```powershell
cd ml_pipeline
pip install -r requirements.txt
python inference.py
```

### 3. Start FastAPI Backend
```powershell
cd backend
pip install -r requirements.txt
python main.py
```

### 4. Start React Dashboard
```powershell
cd dashboard
npm install
npm start
```

## 🛠️ Connectivity & Debugging
- **Elasticsearch:** `https://172.29.50.13:9200`
- **Check Status:** `python check_es.py`
- **Test Ingestion:** `.	est_ingestion.ps1`
