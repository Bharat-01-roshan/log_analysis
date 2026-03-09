async function createLog() {
  const url = process.env.ELASTIC_URL || 'https://localhost:9200';
  const apiKey = process.env.ELASTIC_API_KEY;
  const index = process.env.ELASTIC_INDEX || 'logs-app';

  const logEntry = {
    '@timestamp': new Date().toISOString(),
    message: process.argv[2] || 'No message provided',
    level: process.argv[3] || 'info',
    metadata: process.argv[4] ? JSON.parse(process.argv[4]) : {}
  };

  const headers = {
    'Content-Type': 'application/json',
  };

  if (apiKey) {
    headers['Authorization'] = `ApiKey ${apiKey}`;
  }

  try {
    const response = await fetch(`${url}/${index}/_doc`, {
      method: 'POST',
      headers,
      body: JSON.stringify(logEntry)
    });

    if (!response.ok) {
      throw new Error(`Elasticsearch error: ${response.status} ${await response.text()}`);
    }

    const data = await response.json();
    console.log(`Log created successfully: ${data._id}`);
  } catch (error) {
    console.error(`Error creating log: ${error.message}`);
    process.exit(1);
  }
}

createLog();
