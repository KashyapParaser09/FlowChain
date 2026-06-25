const { ethers } = require("ethers");
const contractData = require("../abi/Reputation.json");
require("dotenv").config();

// ======================================
// PROVIDER
// ======================================

const provider = new ethers.JsonRpcProvider(
  process.env.RPC_URL
);

const signer = new ethers.Wallet(
  process.env.PRIVATE_KEY,
  provider
);

const contract = new ethers.Contract(
  process.env.CONTRACT_ADDRESS,
  contractData.abi,
  signer
);

// ======================================
// NODE FUNCTIONS
// ======================================

async function registerNode(nodeId) {
  const tx = await contract.registerNode(nodeId);
  await tx.wait();
  return true;
}

async function getNode(nodeId) {
  const node = await contract.getNode(nodeId);

  return {
    nodeId: node[0],
    reputation: Number(node[1]),
    status: node[2]
  };
}

async function getAllNodeIds() {
  return await contract.getAllNodeIds();
}

async function getAllNodes() {
  const ids = await getAllNodeIds();

  const nodes = [];

  for (const id of ids) {
    const node = await getNode(id);
    nodes.push(node);
  }

  return nodes;
}

// ======================================
// REPUTATION FUNCTIONS
// ======================================

async function increaseReputation(nodeId, points) {
  const tx = await contract.increaseReputation(
    nodeId,
    points
  );

  await tx.wait();

  return true;
}

async function decreaseReputation(nodeId, points) {
  const tx = await contract.decreaseReputation(
    nodeId,
    points
  );

  await tx.wait();

  return true;
}

async function getReputation(nodeId) {
  const reputation =
    await contract.getReputation(nodeId);

  return Number(reputation);
}

async function getStatus(nodeId) {
  return await contract.getStatus(nodeId);
}

// ======================================
// DASHBOARD STATS
// ======================================

async function getDashboardStats() {
  const nodes = await getAllNodes();

  const totalNodes = nodes.length;

  const trustedNodes =
    nodes.filter(node => node.status).length;

  const untrustedNodes =
    nodes.filter(node => !node.status).length;

  const logs = await getLogs();

  return {
    totalNodes,
    trustedNodes,
    untrustedNodes,
    totalEvents: logs.length
  };
}

// ======================================
// AUDIT LOGS
// ======================================

async function getLogs() {
  const registrationEvents =
    await contract.queryFilter(
      contract.filters.NodeRegistered()
    );

  const reputationEvents =
    await contract.queryFilter(
      contract.filters.ReputationUpdated()
    );

  const logs = [];

  // NodeRegistered

  registrationEvents.forEach(event => {
    logs.push({
      event: "REGISTERED",
      nodeId: event.args[0],
      reputation: Number(event.args[1]),
      status: event.args[2],
      blockNumber: event.blockNumber,
      transactionHash: event.transactionHash
    });
  });

  // ReputationUpdated

  reputationEvents.forEach(event => {
    logs.push({
      event: "REPUTATION_UPDATED",
      nodeId: event.args[0],
      oldReputation: Number(event.args[1]),
      newReputation: Number(event.args[2]),
      status: event.args[3],
      blockNumber: event.blockNumber,
      transactionHash: event.transactionHash
    });
  });

  logs.sort(
    (a, b) => b.blockNumber - a.blockNumber
  );

  return logs;
}

// ======================================
// EXPORTS
// ======================================

module.exports = {
  registerNode,
  getNode,
  getAllNodeIds,
  getAllNodes,
  increaseReputation,
  decreaseReputation,
  getReputation,
  getStatus,
  getLogs,
  getDashboardStats
};