require("@nomiclabs/hardhat-etherscan");
require("hardhat-deploy");
require("hardhat-deploy-ethers");
require("solidity-coverage");
require("hardhat-gas-reporter");
require("hardhat-contract-sizer");
require("dotenv").config();
require("@nomicfoundation/hardhat-toolbox");
require("prettier-plugin-solidity");

// here we add or so no error occurs and give clear idea of what is going on
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || "0x";
const POLYGONSCAN_API_KEY = process.env.POLYGONSCAN_API_KEY || "0x";
const COINMARKETCAP_API_KEY = process.env.COINMARKETCAP_API_KEY || "0x";

const PRIVATE_KEY = process.env.PRIVATE_KEY;
const PRIVATE_KEY2 = process.env.PRIVATE_KEY2;
const PRIVATE_KEY3 = process.env.PRIVATE_KEY3;
const PRIVATE_KEY4 = process.env.PRIVATE_KEY4;
if(!PRIVATE_KEY) {
  throw new Error('Private Key Not Found');
}


/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  defaultNetwork: "chaos",
  solidity: {
    compilers: [
      {
        version: "0.8.9",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200
          }
        },
      }, {
        version: "0.8.20",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200
          }
        },
      }, {
        version: "0.8.19",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200
          }
        },
      }, {
        version: "0.8.18",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200
          }
        },
      }, {
        version: "0.5.0",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200
          }
        },
      }
    ]
  },
  namedAccounts: {
    deployer: {
      default: 0,
    },
    player: {
      default: 1,
    },
    feeRecipient: {
      default: 2,
    },
    player2: {
      default: 3,
    },
  },
  networks: {
    localhost: {
      chainId: 31337,
      timeout: 12000,
      forking: {
        url: process.env.SKALE_ENDPOINT
      }
    },
    hardhat: {
      forking: {
        url: process.env.SKALE_ENDPOINT
      }
    },
    polygonMumbai: {
      url: "https://polygon-mumbai.g.alchemy.com/v2/oVz9wUAz6CM7Mc0hBaJ3HAtLmmkvQnrC",
      chainId: 80001,
      accounts: [PRIVATE_KEY, PRIVATE_KEY2, PRIVATE_KEY3, PRIVATE_KEY4],
      timeout: 1000000
    },
    chaos: {
      accounts: [PRIVATE_KEY, PRIVATE_KEY2, PRIVATE_KEY3, PRIVATE_KEY4],
      chainId: parseInt(process.env.SKALE_CHAIN_ID),
      url: process.env.SKALE_ENDPOINT
    }
  },
  etherscan: {
    apiKey: {
      polygonMumbai: POLYGONSCAN_API_KEY,
      chaos: ETHERSCAN_API_KEY,
    },
    customChains: [
      {
        network: "chaos",
        chainId: parseInt(process.env.SKALE_CHAIN_ID),
        urls: {
          apiURL: process.env.SKALE_API_URL,
          browserURL: process.env.SKALE_BLOCKEXPLORER_URL
        }
      }
    ],
  },
  gasReporter: {
    currency: "USD",
    gasPrice: 300000,
    // coin market cap to get api to get current usd value for gas
    outputFile: "gas-report.txt",
    enabled: true,
    noColors: true, // because it can mess up in txt file
    coinmarketcap: COINMARKETCAP_API_KEY, // to get usd
  },
  mocha: {
    timeout: 200000, // 200 seconds
  },
};

// IIM Ahmedabad
// guj startup gujrat
