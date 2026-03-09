# Syslog ML-Powered Analysis (SMA)

SMA is a complete pipeline for ingesting, processing, and analyzing syslog data using Machine Learning to detect anomalies and categorize event severity.

## Features
- **Real-time Ingestion:** Supports streaming syslog via Vector/Logstash.
- **ML Pipelines:** Uses Isolation Forest and sequence analysis for anomaly detection.
- **Dynamic Severity:** Combines heuristic rules with ML confidence scores.
- **Interactive Dashboard:** React-based UI for monitoring and alerting.

## Quick Start
*Detailed instructions will be added as components are implemented.*

## Project Structure
- `/backend`: FastAPI service for data retrieval and alerting.
- `/ml_pipeline`: Python scripts for model training and inference.
- `/dashboard`: React frontend.
- `/ingestion`: Configuration for log collectors (Vector).
- `docker-compose.yml`: Infrastructure orchestration.
