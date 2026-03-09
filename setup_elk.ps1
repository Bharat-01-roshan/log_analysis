# SMA - ELK Auto-Configuration Script
# This script automates the creation of Kibana Data Views and Index Patterns

Write-Host "[*] Waiting for Elasticsearch and Kibana to be ready..." -ForegroundColor Cyan

$ES_URL = "http://localhost:9200"
$KIBANA_URL = "http://localhost:5601"

# 1. Wait for Elasticsearch
while ($true) {
    try {
        $resp = Invoke-RestMethod -Uri "$ES_URL" -Method Get -ErrorAction Stop
        if ($resp.tagline -eq "You Know, for Search") {
            Write-Host "[+] Elasticsearch is ONLINE." -ForegroundColor Green
            break
        }
    } catch {
        Write-Host "[-] Waiting for Elasticsearch..." -ForegroundColor Gray
        Start-Sleep -Seconds 5
    }
}

# 2. Wait for Kibana
while ($true) {
    try {
        $resp = Invoke-WebRequest -Uri "$KIBANA_URL/api/status" -Method Get -Headers @{"kbn-xsrf"="true"} -ErrorAction Stop
        if ($resp.StatusCode -eq 200) {
            Write-Host "[+] Kibana is ONLINE." -ForegroundColor Green
            break
        }
    } catch {
        Write-Host "[-] Waiting for Kibana..." -ForegroundColor Gray
        Start-Sleep -Seconds 5
    }
}

# 3. Create Kibana Data View (Index Pattern)
Write-Host "[*] Creating Kibana Data View: 'sma_logs*'..." -ForegroundColor Cyan
$dataViewBody = @{
    data_view = @{
        title = "sma_logs*"
        name = "SMA Intelligence Stream"
        timeFieldName = "timestamp"
    }
} | ConvertTo-Json

try {
    Invoke-RestMethod -Uri "$KIBANA_URL/api/data_views/data_view" `
        -Method Post `
        -Headers @{"kbn-xsrf"="true"; "Content-Type"="application/json"} `
        -Body $dataViewBody
    Write-Host "[!] SUCCESS: Kibana Data View created. Open http://localhost:5601/app/discover" -ForegroundColor Green
} catch {
    Write-Host "[!] Note: Data view might already exist or needs data first." -ForegroundColor Yellow
}

Write-Host "`n[!] Integration Complete. You can now use Kibana for deep log forensics." -ForegroundColor Cyan
