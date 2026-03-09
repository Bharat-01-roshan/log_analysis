# System Design: Syslog ML Analysis

## 1. Architecture Overview
The system follows a producer-consumer architecture utilizing a message broker for decoupling.

### Components
- **Ingestion Layer:** [Vector.dev](https://vector.dev/) (Lightweight, high-performance).
- **Message Broker:** Redis (for simple setups) or Kafka (for high-scale).
- **Processing Engine:** Python workers using `Faust` or `Celery`.
- **ML Models:** Scikit-learn (Isolation Forest) and PyTorch (LSTM).
- **Storage:** 
  - **Elasticsearch:** Hot log data and full-text search.
  - **PostgreSQL:** Alerts, metadata, and user configs.
- **Dashboard:** React + Tailwind CSS.
- **API:** FastAPI.

## 2. ML Pipeline
### Feature Engineering
- **Temporal:** Hour of day, day of week, frequency.
- **Content:** TF-IDF on log messages, regex extraction of IPs/Processes.
- **Contextual:** Sequence of events within a rolling window.

### Severity Logic
| Severity | Criteria |
| :--- | :--- |
| **Severe** | Critical rule match (OOM, Root access) OR Extreme ML Anomaly Score (< -0.9). |
| **High** | Repeated failures OR High ML Anomaly Score (< -0.7). |
| **Medium** | Unusual pattern OR Moderate Anomaly Score. |
| **Low** | Standard info/notice logs. |

## 3. Data Flow
1. Syslog -> Vector -> Redis/Kafka.
2. Worker -> Parse -> ML Inference -> Enrich.
3. Worker -> Write to Elasticsearch + Postgres (if alert).
4. Frontend -> FastAPI -> Elasticsearch.
