#!/usr/bin/python3
import socket
import time
import random

# CONFIGURATION
HOST_IP = "192.168.56.1"
PORT = 514
DEVICE_ID = socket.gethostname() # VM Name

def send_syslog(msg, priority=13): # 13 = user.notice
    timestamp = time.strftime("%b %d %H:%M:%S")
    full_msg = f"<{priority}>{timestamp} {DEVICE_ID} sshd[1234]: {msg}"
    sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    sock.sendto(full_msg.encode('ascii'), (HOST_IP, PORT))
    print(f"[Sent to Host] {msg}")

def simulate_brute_force():
    print(f"[*] Starting Brute Force Simulation from {DEVICE_ID}...")
    users = ["root", "admin", "guest", "webmaster", "oracle"]
    ips = ["192.168.1.50", "45.33.12.5", "103.11.22.33"]
    
    for _ in range(20):
        user = random.choice(users)
        ip = random.choice(ips)
        send_syslog(f"Failed password for invalid user {user} from {ip} port 54321 ssh2")
        time.sleep(random.uniform(0.1, 0.5)) # High frequency for ML to notice

def simulate_unauthorized_access():
    print(f"[*] Starting Unauthorized Database Access Simulation...")
    send_syslog("mysqld[999]: [Warning] Aborted connection 123 to db: 'production' user: 'attacker' host: '172.16.0.44'")

if __name__ == "__main__":
    try:
        while True:
            # Randomly trigger different attack patterns
            choice = random.randint(1, 10)
            if choice <= 7:
                simulate_brute_force()
            else:
                simulate_unauthorized_access()
            
            print("[*] Waiting for next wave...")
            time.sleep(10)
    except KeyboardInterrupt:
        print("\n[!] Stopping simulation.")
