import requests
import socket
import time
import psutil
import sys

# =====================================
# CONFIGURATION
# =====================================

BACKEND_URL = "http://192.168.1.24:5000"

if len(sys.argv) > 1:
    node_id = sys.argv[1]
else:
    node_id = socket.gethostname()

print(f"Node ID = {node_id}")

# =====================================
# HEARTBEAT
# =====================================

def heartbeat():
    try:

        response = requests.post(
            f"{BACKEND_URL}/heartbeat",
            json={
                "nodeId": node_id
            },
            timeout=5
        )

        print(
            f"[HEARTBEAT] Sent ({response.status_code})"
        )

    except Exception as e:

        print(
            f"[HEARTBEAT ERROR] {e}"
        )

# =====================================
# REPUTATION FUNCTIONS
# =====================================

def increase(points):
    try:

        requests.post(
            f"{BACKEND_URL}/reputation/increase",
            json={
                "nodeId": node_id,
                "points": points
            },
            timeout=5
        )

    except Exception as e:

        print(
            f"[INCREASE ERROR] {e}"
        )


def decrease(points):
    try:

        requests.post(
            f"{BACKEND_URL}/reputation/decrease",
            json={
                "nodeId": node_id,
                "points": points
            },
            timeout=5
        )

    except Exception as e:

        print(
            f"[DECREASE ERROR] {e}"
        )

# =====================================
# NODE HEALTH EVALUATION
# =====================================

def evaluate_node():

    cpu = psutil.cpu_percent(interval=1)

    memory = psutil.virtual_memory().percent

    print("\n==============================")
    print(f"Node: {node_id}")
    print(f"CPU Usage: {cpu}%")
    print(f"Memory Usage: {memory}%")

    score = 0

    # -------------------------
    # CPU SCORING
    # -------------------------

    if cpu < 60:

        score += 1

    elif cpu < 80:

        score += 0

    elif cpu < 95:

        score -= 2

    else:

        score -= 5

    # -------------------------
    # MEMORY SCORING
    # -------------------------

    if memory < 70:

        score += 1

    elif memory < 85:

        score += 0

    elif memory < 95:

        score -= 2

    else:

        score -= 5

    # -------------------------
    # UPDATE REPUTATION
    # -------------------------

    if score > 0:

        increase(score)

        print(f"Reputation +{score}")

    elif score < 0:

        decrease(abs(score))

        print(f"Reputation {score}")

    else:

        print("No reputation change")

    print("==============================")

# =====================================
# MAIN LOOP
# =====================================

if __name__ == "__main__":

    print("\n====================================")
    print("FLOWCHAIN NODE AGENT STARTED")
    print(f"Monitoring Node: {node_id}")
    print("====================================\n")

    while True:

        heartbeat()

        evaluate_node()

        time.sleep(10)
