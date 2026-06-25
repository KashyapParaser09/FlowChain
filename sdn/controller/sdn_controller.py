import requests
import time

BACKEND_URL = "http://localhost:5000"

known_nodes = set()


def register_node(node_id):
    try:
        response = requests.post(
            f"{BACKEND_URL}/register-node",
            json={"nodeId": node_id}
        )

        print(f"[+] Registered {node_id}")
        print(response.json())

    except Exception as e:
        print(f"[-] Failed to register {node_id}: {e}")


def discover_hosts():
    """
    Temporary simulation.
    Later Mininet will provide hosts dynamically.
    """

    hosts = [
        "h1",
        "h2",
        "h3",
        "h4"
    ]

    for host in hosts:

        if host not in known_nodes:

            register_node(host)

            known_nodes.add(host)


if __name__ == "__main__":

    print("FlowChain SDN Controller Started")

    while True:

        discover_hosts()

        time.sleep(10)
