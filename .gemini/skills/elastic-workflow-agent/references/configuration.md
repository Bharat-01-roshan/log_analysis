# Configuration for Elastic Workflow Agent

The following environment variables are used by the scripts in this skill:

- `ELASTIC_URL`: The URL of your Elasticsearch instance (default: `https://localhost:9200`).
- `ELASTIC_API_KEY`: Your Elasticsearch API Key for authentication.
- `ELASTIC_INDEX`: The index pattern to query or the index to write to (default: `logs-*` for querying, `logs-app` for writing).

## Example Setup

If you are using a local instance:

```powershell
$env:ELASTIC_URL = "https://localhost:9200"
$env:ELASTIC_INDEX = "my-app-logs"
```

If you are using Elastic Cloud:

```powershell
$env:ELASTIC_URL = "https://your-cloud-instance.es.us-east-1.aws.found.io"
$env:ELASTIC_API_KEY = "your-api-key"
```
