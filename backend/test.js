const {
  registerNode,
  getNode
} = require("./services/blockchainService");

async function main() {

  await registerNode("S2");

  const node = await getNode("S2");

  console.log(node);
}

main();