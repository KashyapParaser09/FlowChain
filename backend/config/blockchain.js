require("dotenv").config();
const { ethers } = require("ethers");

const reputationArtifact = require("../abi/Reputation.json");

const provider = new ethers.JsonRpcProvider(
  process.env.RPC_URL
);

const contract = new ethers.Contract(
  process.env.CONTRACT_ADDRESS,
  reputationArtifact.abi,
  provider
);

module.exports = {
  provider,
  contract
};