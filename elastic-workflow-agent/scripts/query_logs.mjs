import { writeFileSync } from 'fs';

async function queryLogs() {
  const url = process.env.ELASTIC_URL || 'https://localhost:9200';
  const apiKey = process.env.ELASTIC_API_KEY;
  const index = process.env.ELASTIC_INDEX || 'logs-*';

  const query = {
    size: 50,
    sort: [{ '@timestamp': { order: 'desc' } }],
    query: {
      bool: {
        must: [
          { match: { level: 'error' } }
        ]
      }
    }
  };

  const headers = {
    'Content-Type': 'application/json',
  };

  if (apiKey) {
    headers['Authorization'] = `ApiKey ${apiKey}`;
  }

  try {
    const response = await fetch(`${url}/${index}/_search`, {
      method: 'POST',
      headers,
      body: JSON.stringify(query)
    });

    if (!response.ok) {
      throw new Error(`Elasticsearch error: ${response.status} ${await response.text()}`);
    }

    const data = await response.json();
    console.log(JSON.stringify(data.hits.hits, null, 2));
  } catch (error) {
    console.error(`Error querying logs: ${error.message}`);
    process.exit(1);
  }
}

queryLogs();
