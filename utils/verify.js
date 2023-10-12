const { run } = require("hardhat");

/**@dev using etherscan api to verify contract
 verify contract
 */
const sleep = async (seconds) => {
  return new Promise(resolve => setTimeout(resolve, seconds * 1000))
}

async function verify(contractAddress, args, retry = 3) {
  // https://hardhat.org/hardhat-runner/plugins/nomiclabs-hardhat-etherscan

  /// to do it mannully
  // npx hardhat verify --network mainnet DEPLOYED_CONTRACT_ADDRESS "Constructor argument 1"
  console.log("Verifying contract on etherscan...");
  // try catch for safety
  for (let i = 0; i < retry; i++) {
    try {
      await run("verify:verify", {
        // verfiy:verify is a task
        address: contractAddress,
        constructorArguments: args,
      });
      break;
    } catch (error) {
      if (error.message.includes("Contract source code already verified")) {
        console.log("Contract already verified, skipping...");
      }
      console.log(error);
      await sleep(5)
    }
  }
}

module.exports = { verify };
