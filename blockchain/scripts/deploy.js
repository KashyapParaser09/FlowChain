const { ethers } = require("hardhat");

async function main() {
  console.log("Deploying Reputation...");

  const Reputation = await ethers.getContractFactory("Reputation");

  const reputation = await Reputation.deploy();

  await reputation.waitForDeployment();

  console.log(
    "Contract deployed to:",
    await reputation.getAddress()
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});