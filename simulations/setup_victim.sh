#!/bin/bash
# SMA Lab - Victim Setup Script
# Run this on Metasploitable or Ubuntu VMs to forward logs to the Windows Host

HOST_IP="192.168.56.1"
SYSLOG_CONF="/etc/syslog.conf"

# Check if rsyslog is used instead
if [ -f "/etc/rsyslog.conf" ]; then
    SYSLOG_CONF="/etc/rsyslog.conf"
fi

echo "[*] Configuring log forwarding to $HOST_IP..."

# Check if already configured
if grep -q "@$HOST_IP:514" "$SYSLOG_CONF"; then
    echo "[!] Already configured in $SYSLOG_CONF"
else
    echo "*.*  @$HOST_IP:514" | sudo tee -a "$SYSLOG_CONF"
    echo "[+] Added forwarding rule to $SYSLOG_CONF"
fi

# Restart services
echo "[*] Restarting logging services..."
if [ -f "/etc/init.d/sysklogd" ]; then
    sudo /etc/init.d/sysklogd restart
elif [ -f "/etc/init.d/rsyslog" ]; then
    sudo /etc/init.d/rsyslog restart
else
    sudo systemctl restart rsyslog
fi

echo "[+] Victim Setup Complete. Send a test log with: logger 'SMA TEST'"
