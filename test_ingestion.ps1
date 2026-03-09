# SMA Ingestion Test Script
# Sends a mix of normal and suspicious logs via UDP to Vector (Port 514)

$udpClient = New-Object System.Net.Sockets.UdpClient
$targetHost = "localhost"
$targetPort = 514

function Send-Log($message) {
    $timestamp = Get-Date -Format "MMM dd HH:mm:ss"
    $hostname = "test-server-01"
    $syslogMsg = "$timestamp $hostname $message"
    $bytes = [System.Text.Encoding]::ASCII.GetBytes($syslogMsg)
    $udpClient.Send($bytes, $bytes.Length, $targetHost, $targetPort) > $null
    Write-Host "[Sent] $syslogMsg" -ForegroundColor Gray
}

Write-Host "--- Starting SMA Load Test ---" -ForegroundColor Cyan

# 1. Normal Logs (Should score as 'Low' or 'Medium')
Write-Host "`n[*] Sending Normal Traffic..." -ForegroundColor Green
Send-Log "systemd: Started Periodic Command Scheduler."
Send-Log "ntp: Synchronized to time server 162.159.200.1"
Send-Log "sshd: session opened for user admin"
Send-Log "cron: (root) CMD ( /usr/bin/python3 /opt/scripts/health_check.py )"

Start-Sleep -Seconds 2

# 2. Suspicious Logs (Should trigger 'High' or 'Severe')
Write-Host "`n[*] Sending Suspicious Events..." -ForegroundColor DarkYellow
Send-Log "sshd: Failed password for root from 192.168.50.122 port 22"
Send-Log "sshd: Invalid user guest from 45.33.12.5"
Send-Log "kernel: Out of memory: Kill process 9999 (java) score 950"

Start-Sleep -Seconds 2

# 3. Anomalous Log (High Anomaly Score)
Write-Host "`n[*] Sending Structural Anomaly..." -ForegroundColor Red
Send-Log "unknown_proc: payload: XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"

$udpClient.Close()
Write-Host "`n--- Test Complete. Check your Dashboard! ---" -ForegroundColor Cyan
