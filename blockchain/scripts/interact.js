const { ethers } = require("hardhat");

async function main() {

    const contractAddress =
        "0x5FbDB2315678afecb367f032d93F642f64180aa3";

    const Reputation =
        await ethers.getContractFactory("Reputation");

    const reputation =
        await Reputation.attach(contractAddress);

    console.log("Registering S1...");

    const tx =
        await reputation.registerNode("S1");

    await tx.wait();

    console.log("Node Registered");

    const node =
        await reputation.getNode("S1");

    console.log(node);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});