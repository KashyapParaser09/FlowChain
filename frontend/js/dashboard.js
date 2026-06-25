// ======================================
// FLOWCHAIN DASHBOARD
// dashboard.js
// ======================================

let allNodes = [];
let allLogs = [];

// Backend URL
const API_BASE = "http://localhost:5000";

// ======================================
// PAGE LOAD
// ======================================

document.addEventListener("DOMContentLoaded", () => {
  loadData();

  const refreshBtn = document.getElementById("refreshBtn");
  if (refreshBtn) {
    refreshBtn.addEventListener("click", loadData);
  }

  const searchBox = document.getElementById("searchNode");
  if (searchBox) {
    searchBox.addEventListener("input", filterNodes);
  }

  setInterval(loadData, 10000);
});

// ======================================
// LOAD EVERYTHING
// ======================================

async function loadData() {
  try {
    await Promise.all([
      loadNodes(),
      loadLogs()
    ]);

    updateStats();
  } catch (error) {
    console.error("Load Error:", error);
  }
}

// ======================================
// LOAD NODES
// ======================================

async function loadNodes() {
  try {
    const response = await fetch(`${API_BASE}/nodes`);

    if (!response.ok) {
      throw new Error("Failed to fetch nodes");
    }

    allNodes = await response.json();

    renderNodes(allNodes);
  } catch (error) {
    console.error("Node Fetch Error:", error);

    const table = document.getElementById("nodeTable");

    if (table) {
      table.innerHTML = `
        <tr>
          <td colspan="4">Unable to load nodes</td>
        </tr>
      `;
    }
  }
}

// ======================================
// RENDER NODES
// ======================================

function renderNodes(nodes) {
  const table = document.getElementById("nodeTable");

  if (!table) return;

  if (!nodes || nodes.length === 0) {
    table.innerHTML = `
      <tr>
        <td colspan="4">
          No nodes registered
        </td>
      </tr>
    `;
    return;
  }

  table.innerHTML = nodes
    .map((node) => {
      const reputation = Number(node.reputation);

      const status =
        reputation >= 50 ? "Trusted" : "Untrusted";

      const statusClass =
        reputation >= 50
          ? "trusted"
          : "untrusted";

      return `
        <tr>
          <td>${node.nodeId}</td>
          <td>SDN Node</td>
          <td>${reputation}</td>
          <td>
            <span class="${statusClass}">
              ${status}
            </span>
          </td>
        </tr>
      `;
    })
    .join("");
}

// ======================================
// SEARCH FILTER
// ======================================

function filterNodes() {
  const search = document
    .getElementById("searchNode")
    .value
    .toLowerCase();

  const filtered = allNodes.filter((node) =>
    node.nodeId.toLowerCase().includes(search)
  );

  renderNodes(filtered);
}

// ======================================
// LOAD LOGS
// ======================================

async function loadLogs() {
  try {
    const response = await fetch(`${API_BASE}/logs`);

    if (!response.ok) {
      throw new Error("Failed to fetch logs");
    }

    allLogs = await response.json();

    renderLogs(allLogs);
  } catch (error) {
    console.error("Log Fetch Error:", error);

    const table = document.getElementById("auditTable");

    if (table) {
      table.innerHTML = `
        <tr>
          <td colspan="5">
            Unable to load logs
          </td>
        </tr>
      `;
    }
  }
}

// ======================================
// RENDER LOGS
// ======================================

function renderLogs(logs) {
  const table = document.getElementById("auditTable");

  if (!table) return;

  if (!logs || logs.length === 0) {
    table.innerHTML = `
      <tr>
        <td colspan="5">
          No audit logs found
        </td>
      </tr>
    `;
    return;
  }

  table.innerHTML = logs
    .slice()
    .reverse()
    .map((log) => {
      const reputation =
        log.newReputation ??
        log.reputation ??
        "-";

      const txHash =
        log.txHash ||
        log.transactionHash ||
        "-";

      const shortHash =
        txHash.length > 18
          ? txHash.substring(0, 18) + "..."
          : txHash;

      return `
        <tr>
          <td>${log.blockNumber || "-"}</td>
          <td>${log.event || "-"}</td>
          <td>${log.nodeId || "-"}</td>
          <td>${reputation}</td>
          <td>${shortHash}</td>
        </tr>
      `;
    })
    .join("");
}

// ======================================
// UPDATE DASHBOARD CARDS
// ======================================

function updateStats() {
  const totalNodes = allNodes.length;

  const trustedNodes = allNodes.filter(
    (n) => Number(n.reputation) >= 50
  ).length;

  const untrustedNodes = allNodes.filter(
    (n) => Number(n.reputation) < 50
  ).length;

  const totalEvents = allLogs.length;

  const totalEl = document.getElementById("totalNodes");
  const trustedEl = document.getElementById("trustedNodes");
  const untrustedEl = document.getElementById("untrustedNodes");
  const eventsEl = document.getElementById("totalEvents");

  if (totalEl) totalEl.textContent = totalNodes;
  if (trustedEl) trustedEl.textContent = trustedNodes;
  if (untrustedEl) untrustedEl.textContent = untrustedNodes;
  if (eventsEl) eventsEl.textContent = totalEvents;
}