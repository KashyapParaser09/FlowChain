# Running FlowChain

## System Architecture

```text
Windows Host
├── Hardhat Blockchain
├── Smart Contract
├── Backend API
└── Frontend Dashboard

Linux VM
├── Mininet Topology
├── SDN Network
└── Monitoring Agents
```

---

# Step 1: Start Blockchain

Open Terminal 1:

```powershell
cd blockchain

npx hardhat node
```

Keep this terminal running.

Expected:

```text
Started HTTP and WebSocket JSON-RPC server at http://127.0.0.1:8545/
```

---

# Step 2: Deploy Smart Contract

Open Terminal 2:

```powershell
cd blockchain

npx hardhat run scripts/deploy.js --network localhost
```

Copy the contract address.

Example:

```text
Contract deployed to:
0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
```

---

# Step 3: Configure Backend

Create `.env` inside `backend/`:

```env
RPC_URL=http://127.0.0.1:8545

PRIVATE_KEY=<Hardhat Account Private Key>

CONTRACT_ADDRESS=<Deployed Contract Address>
```

---

# Step 4: Start Backend

Open Terminal 3:

```powershell
cd backend

npm install

npm start
```

Expected:

```text
FlowChain backend running on port 5000
```

Verify:

```text
http://localhost:5000/
```

Response:

```json
{
  "success": true,
  "message": "FlowChain Backend Running"
}
```

---

# Step 5: Configure Linux Agent

Inside Linux VM edit:

```bash
nano agent.py
```

Set:

```python
BACKEND_URL = "http://<WINDOWS_IP>:5000"
```

Example:

```python
BACKEND_URL = "http://192.168.1.24:5000"
```

---

# Step 6: Start SDN Topology

Open Linux Terminal:

```bash
sudo python3 topology.py
```

Expected:

```text
*** Creating network
*** Adding hosts
*** Adding switch
*** Starting network
```

This launches:

```text
h1
h2
h3
...
```

and connects them to the SDN switch.

---

# Step 7: Start Monitoring Agents

Inside Mininet CLI:

```bash
mininet> h1 python3 agent.py &
mininet> h2 python3 agent.py &
mininet> h3 python3 agent.py &
```

Each host:

* Registers automatically
* Sends heartbeat
* Reports CPU usage
* Reports memory usage
* Updates reputation score

Expected:

```text
Node registered
Heartbeat sent
CPU: 10%
Memory: 35%
```

---

# Automatic Agent Startup (Optional)

If implemented in topology.py:

```python
host.cmd("python3 agent.py &")
```

then agents start automatically when topology starts.

No manual commands required.

---

# Step 8: Open Dashboard

Open:

```text
frontend/index.html
```

or launch with Live Server.

Dashboard displays:

* Total Nodes
* Trusted Nodes
* Untrusted Nodes
* Reputation Scores
* Audit Logs

---

# Adding New Nodes

Edit topology:

```python
hosts = [
    net.addHost('h1'),
    net.addHost('h2'),
    net.addHost('h3'),
    net.addHost('h4')
]
```

Restart topology:

```bash
sudo python3 topology.py
```

Start agent:

```bash
mininet> h4 python3 agent.py &
```

The node will:

1. Register automatically
2. Appear on blockchain
3. Appear in backend
4. Appear on dashboard

---

# Testing CPU Monitoring

Install stress:

```bash
sudo apt install stress -y
```

Run on a host:

```bash
mininet> h1 stress --cpu 2 --timeout 60
```

Expected:

* CPU threshold exceeded
* Reputation decreases
* Audit log created

---

# Testing Memory Monitoring

```bash
mininet> h1 stress --vm 1 --vm-bytes 500M --timeout 60
```

Expected:

* Memory threshold exceeded
* Reputation decreases
* Audit log created

---

# Testing Heartbeat Failure

Stop agent:

```bash
pkill -f agent.py
```

or:

```bash
Ctrl+C
```

Expected:

* Backend detects missing heartbeat
* Reputation decreases
* Audit log created

---

# Useful API Endpoints

Get all nodes:

```http
GET /nodes
```

Get audit logs:

```http
GET /logs
```

Register node:

```http
POST /register-node
```

Increase reputation:

```http
POST /reputation/increase
```

Decrease reputation:

```http
POST /reputation/decrease
```

---

# Full Startup Sequence

```text
1. Hardhat Node
2. Deploy Contract
3. Backend
4. Mininet Topology
5. Monitoring Agents
6. Dashboard
```

FlowChain is now fully operational.
