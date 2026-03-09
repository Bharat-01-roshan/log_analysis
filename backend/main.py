from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from elasticsearch import Elasticsearch
import os
from typing import Optional

app = FastAPI(title="SMA - Syslog ML Analysis API")

# Add CORS to allow React (port 3000) to talk to FastAPI (port 8000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # For production, restrict to ["http://localhost:3000"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configuration
ES_HOST = os.getenv("ES_HOST", "http://elasticsearch:9200")
ES_INDEX = "sma_logs"

# Connect with authentication and SSL skip for local HTTPS
es_client = Elasticsearch(
    [ES_HOST],
    verify_certs=False,
    ssl_show_warn=False
)

@app.get("/")
def root():
    return {"message": "SMA API is online"}

@app.get("/logs")
async def get_logs(
    severity: Optional[str] = None,
    host: Optional[str] = None,
    analyzed_only: bool = False,
    size: int = 50
):
    """Retrieves logs from Elasticsearch with filtering."""
    must_queries = []
    if severity:
        must_queries.append({"match": {"severity": severity}})
    if host:
        must_queries.append({"match": {"host": host}})
    if analyzed_only:
        must_queries.append({"exists": {"field": "llm_analysis"}})
        
    query = {
        "size": size,
        "sort": [{"timestamp": {"order": "desc"}}],
        "query": {
            "bool": {
                "must": must_queries or [{"match_all": {}}]
            }
        }
    }
    
    try:
        resp = es_client.search(index=ES_INDEX, body=query)
        return [hit["_source"] for hit in resp["hits"]["hits"]]
    except Exception as e:
        return {"error": str(e)}

@app.get("/stats")
async def get_stats():
    """Returns aggregated stats for the dashboard."""
    agg_query = {
        "size": 0,
        "aggs": {
            "by_severity": {
                "terms": {"field": "severity.keyword"}
            },
            "top_anomalous_ips": {
                "terms": {
                    "field": "source_ip.keyword",
                    "order": {"avg_anomaly": "asc"}
                },
                "aggs": {
                    "avg_anomaly": {"avg": {"field": "anomaly_score"}}
                }
            }
        }
    }
    
    try:
        resp = es_client.search(index=ES_INDEX, body=agg_query)
        return resp["aggregations"]
    except Exception as e:
        return {"error": str(e)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
