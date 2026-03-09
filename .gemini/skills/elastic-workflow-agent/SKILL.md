---
name: elastic-workflow-agent
description: Workflow agent for error checking, anomaly detection, and log management using Elasticsearch and Kibana. Use when you need to query logs, report errors, or detect trends in application data.
---

# Elastic Workflow Agent

## Overview

The `elastic-workflow-agent` skill provides tools to interact with an existing Elasticsearch instance for monitoring application health and managing logs.

## Core Capabilities

### 1. Check for Errors
Query Elasticsearch for recent logs with the `error` level.

- **Action**: Run `node D:\npm\elastic-workflow-agent\scripts\query_logs.mjs`
- **Output**: Recent log entries matching the 'error' level.

### 2. Anomaly Detection
Perform simple statistical anomaly detection based on log volume in the last hour.

- **Action**: Run `node D:\npm\elastic-workflow-agent\scripts\anomaly_detect.mjs`
- **Output**: Indicates if a spike in log activity has occurred.

### 3. Create Logs
Send custom log entries to Elasticsearch.

- **Action**: Run `node D:\npm\elastic-workflow-agent\scripts\create_log.mjs "<message>" "<level>" "<json_metadata>"`
- **Example**: `node D:\npm\elastic-workflow-agent\scripts\create_log.mjs "Application started" "info" "{\"version\": \"1.0.0\"}"`

## Configuration

Refer to [references/configuration.md](references/configuration.md) for details on environment variables (`ELASTIC_URL`, `ELASTIC_API_KEY`, etc.).

## Workflow: Incident Investigation

1. **Detect**: Use `anomaly_detect.mjs` to check for unusual log activity.
2. **Analyze**: Use `query_logs.mjs` to fetch recent errors.
3. **Report**: Use `create_log.mjs` to log investigation findings or automated status updates.
