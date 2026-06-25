const express = require("express");
const cors = require("cors");

const {
  registerNode,
  getNode,
  increaseReputation,
  decreaseReputation,
  getReputation,
  getStatus,
  getLogs,
  getAllNodeIds
} = require("./services/blockchainService");

const app = express();

app.use(cors());
app.use(express.json());

const PORT = 5000;

/*
|--------------------------------------------------------------------------
| HEARTBEAT STORAGE
|--------------------------------------------------------------------------
*/

const lastSeen = {};

/*
|--------------------------------------------------------------------------
| ROOT
|--------------------------------------------------------------------------
*/

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "FlowChain Backend Running"
  });
});

/*
|--------------------------------------------------------------------------
| HEARTBEAT
|--------------------------------------------------------------------------
*/

app.post("/heartbeat", async (req, res) => {
  try {

    const { nodeId } = req.body;

    lastSeen[nodeId] = Date.now();

    console.log(
      `[HEARTBEAT] ${nodeId}`
    );

    res.json({
      success: true,
      nodeId,
      timestamp: lastSeen[nodeId]
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/*
|--------------------------------------------------------------------------
| REGISTER NODE
|--------------------------------------------------------------------------
*/

app.post("/register-node", async (req, res) => {

  try {

    const { nodeId } = req.body;

    await registerNode(nodeId);

    lastSeen[nodeId] = Date.now();

    res.json({
      success: true,
      message: "Node registered"
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      error: error.message
    });

  }

});

/*
|--------------------------------------------------------------------------
| GET NODE
|--------------------------------------------------------------------------
*/

app.get("/node/:id", async (req, res) => {

  try {

    const node = await getNode(req.params.id);

    res.json(node);

  } catch (error) {

    res.status(500).json({
      success: false,
      error: error.message
    });

  }

});

/*
|--------------------------------------------------------------------------
| REPUTATION
|--------------------------------------------------------------------------
*/

app.post("/reputation/increase", async (req, res) => {

  try {

    const { nodeId, points } = req.body;

    await increaseReputation(nodeId, points);

    res.json({
      success: true,
      message: "Reputation increased"
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      error: error.message
    });

  }

});

app.post("/reputation/decrease", async (req, res) => {

  try {

    const { nodeId, points } = req.body;

    await decreaseReputation(nodeId, points);

    res.json({
      success: true,
      message: "Reputation decreased"
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      error: error.message
    });

  }

});

app.get("/reputation/:id", async (req, res) => {

  try {

    const reputation = await getReputation(
      req.params.id
    );

    res.json({
      reputation
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      error: error.message
    });

  }

});

app.get("/status/:id", async (req, res) => {

  try {

    const status = await getStatus(
      req.params.id
    );

    res.json({
      status
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      error: error.message
    });

  }

});

/*
|--------------------------------------------------------------------------
| LOGS
|--------------------------------------------------------------------------
*/

app.get("/logs", async (req, res) => {

  try {

    const logs = await getLogs();

    res.json(logs);

  } catch (error) {

    res.status(500).json({
      success: false,
      error: error.message
    });

  }

});

/*
|--------------------------------------------------------------------------
| ALL NODES
|--------------------------------------------------------------------------
*/

app.get("/nodes", async (req, res) => {

  try {

    const ids = await getAllNodeIds();

    const nodes = [];

    for (const id of ids) {

      const node = await getNode(id);

      nodes.push(node);

    }

    res.json(nodes);

  } catch (error) {

    res.status(500).json({
      success: false,
      error: error.message
    });

  }

});

/*
|--------------------------------------------------------------------------
| DASHBOARD SUMMARY
|--------------------------------------------------------------------------
*/

app.get("/dashboard", async (req, res) => {

  try {

    const ids = await getAllNodeIds();

    const nodes = [];

    for (const id of ids) {

      const node = await getNode(id);

      nodes.push(node);

    }

    const logs = await getLogs();

    const trustedNodes =
      nodes.filter(node => node.status).length;

    const untrustedNodes =
      nodes.filter(node => !node.status).length;

    res.json({
      totalNodes: nodes.length,
      trustedNodes,
      untrustedNodes,
      totalEvents: logs.length
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      error: error.message
    });

  }

});

/*
|--------------------------------------------------------------------------
| WATCHDOG
|--------------------------------------------------------------------------
*/

setInterval(async () => {

  const now = Date.now();

  for (const nodeId in lastSeen) {

    const diff = now - lastSeen[nodeId];

    if (diff > 30000) {

      try {

        await decreaseReputation(nodeId, 5);

        console.log(
          `[WATCHDOG] ${nodeId} missed heartbeat. Reputation -5`
        );

      } catch (error) {

        console.log(error.message);

      }

      lastSeen[nodeId] = now;
    }
  }

}, 30000);

/*
|--------------------------------------------------------------------------
| START SERVER
|--------------------------------------------------------------------------
*/

app.listen(PORT, "0.0.0.0", () => {
  console.log(
    `FlowChain backend running on port ${PORT}`
  );
});