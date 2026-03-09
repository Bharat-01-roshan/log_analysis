# Attack Simulation Script for Syslog Monitoring (SMA)
# Use this from your VirtualBox machine (Linux/Unix) to generate logs

Write-Host "[*] Starting SMA Attack Simulator..." -ForegroundColor Cyan

$CENTRAL_IP = "YOUR_CENTRAL_MACHINE_IP"
$PORT = 5140

function Send-Syslog {
    param($msg)
    $timestamp = Get-Date -Format "MMM dd HH:mm:ss"
    $hostname = "VBox-Target-PC"
    # Added Token for Device Identification
    $fullMsg = "<13>$timestamp $hostname attack-sim: TOKEN:VBox-Core-01 $msg"
    Write-Host "[+] Sending [VBox-Core-01]: $msg" -ForegroundColor Gray
    
    # Send via UDP to Logstash
    $client = New-Object System.Net.Sockets.UdpClient
    $bytes = [System.Text.Encoding]::ASCII.GetBytes($fullMsg)
    $client.Send($bytes, $bytes.Length, $CENTRAL_IP, $PORT)
    $client.Close()
}

# --- 1. SSH Brute Force ---
Write-Host "`n[*] Simulating SSH Brute Force..." -ForegroundColor Yellow
for ($i=1; $i -le 10; $i++) {
    Send-Syslog "sshd[1234]: Failed password for invalid user admin from 192.168.1.50 port 56789 ssh2"
    Start-Sleep -Milliseconds 200
}

# --- 2. Zero-Day/Exploit Pattern (Web Shell Injection) ---
Write-Host "`n[*] Simulating Zero-Day/Web Exploit Pattern..." -ForegroundColor Yellow
Send-Syslog "apache2[567]: [error] client 10.0.0.99 (GET /cgi-bin/test.sh?cmd=rm%20-rf%20/ HTTP/1.1) 404"
Send-Syslog "apache2[567]: [notice] child pid 8888 exit signal Segmentation Fault (11)"

# --- 3. Privilege Escalation Attempt ---
Write-Host "`n[*] Simulating Privilege Escalation..." -ForegroundColor Yellow
Send-Syslog "sudo: user1 : TTY=pts/0 ; PWD=/home/user1 ; USER=root ; COMMAND=/usr/bin/cat /etc/shadow"

# --- 4. Database SQL Injection Attack ---
Write-Host "`n[*] Simulating Database SQL Injection Attack..." -ForegroundColor Yellow
Send-Syslog "mysqld[999]: [Audit] [user: 'guest'] [Query] SELECT * FROM users WHERE id = 1 OR 1=1; --"
Send-Syslog "mysqld[999]: [Audit] [user: 'guest'] [Query] DROP TABLE security_logs; --"
Send-Syslog "mysqld[999]: [Warning] Unauthenticated user attempted to DROP TABLE 'users' on production database."

# --- 5. Multiple Persistence/Correlation ---
Write-Host "`n[*] Simulating Persistent Attack Pattern (Correlation test)..." -ForegroundColor Yellow
for ($i=1; $i -le 6; $i++) {
    Send-Syslog "mysqld[999]: [Warning] Aborted connection 123 to db: 'production' user: 'unauthorized_user' host: '172.16.0.44'"
    Start-Sleep -Milliseconds 200
}

Write-Host "`n[!] Simulation Complete. Check your React Dashboard and Kibana." -ForegroundColor Green
Write-Host "[*] Tip: Filter by 'Database' category in Kibana to see SQL Injection hits." -ForegroundColor Cyan
