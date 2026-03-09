async function detectAnomaly() {
  const url = process.env.ELASTIC_URL || 'https://localhost:9200';
  const apiKey = process.env.ELASTIC_API_KEY;
  const index = process.env.ELASTIC_INDEX || 'logs-*';

  const query = {
    size: 0,
    aggs: {
      logs_over_time: {
        date_histogram: {
          field: '@timestamp',
          fixed_interval: '5m'
        }
      }
    },
    query: {
      range: {
        '@timestamp': {
          gte: 'now-1h'
        }
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
    
    if (!data.aggregations || !data.aggregations.logs_over_time) {
      console.log('No data found for the specified index and time range.');
      return;
    }

    const buckets = data.aggregations.logs_over_time.buckets;

    if (buckets.length < 2) {
      console.log('Not enough data for anomaly detection.');
      return;
    }

    const counts = buckets.map(b => b.doc_count);
    const mean = counts.reduce((a, b) => a + b, 0) / counts.length;
    const stdDev = Math.sqrt(counts.map(x => Math.pow(x - mean, 2)).reduce((a, b) => a + b, 0) / counts.length);

    const latest = counts[counts.length - 1];
    if (latest > mean + 2 * stdDev) {
      console.log(`Anomaly detected: ${latest} logs in the last bucket. Mean: ${mean.toFixed(2)}, StdDev: ${stdDev.toFixed(2)}`);
    } else {
      console.log(`No anomalies detected. Latest: ${latest}, Mean: ${mean.toFixed(2)}, StdDev: ${stdDev.toFixed(2)}`);
    }
  } catch (error) {
    console.error(`Error in anomaly detection: ${error.message}`);
    process.exit(1);
  }
}

detectAnomaly();
