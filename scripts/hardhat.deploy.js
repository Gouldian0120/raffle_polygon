const { networkConfig, development_chain } = require("../helper-hardhat-config");
const { network, ethers } = require("hardhat");
const { verify } = require("../utils/verify");

const VRF_MOCK_FEE = ethers.utils.parseEther("20");
const BASE_FEE = ethers.utils.parseEther("0.25"); // 0.25 premium , its cost 0.25 links
const GAS_PRICE_LINK = 1e9; // calculated based on gas price of chain link
const approveAmount = "0xfffffffffffffffffffffffffffff"

// const { ethers } = require("hardhat");

const sleep = async (seconds) => {
  return new Promise(resolve => setTimeout(resolve, seconds * 1000))
}

async function main() {
  
  const [deployer, alice, bob, clark, david] = await ethers.getSigners();

  const { deploy } = deployments;

  const chainId = network.config.chainId;
  const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY;

  [owner, player, collector] = await ethers.getSigners();

  let 
    erc20Address = "", 
    erc721Address = "",
    wethAddress = "", 
    usdtAddress = "", 
    transferManagerAddress = "", 
    protocolFeeRecipientAddress = "";

  let vrfCoordinatorV2address = "", subscriptionID; // vrf coordinator address
  const entranceFee = networkConfig[chainId].entranceFee; // get from helper-hardhat-config.js
  const gaslane = networkConfig[chainId].gaslane; // get from helper-hardhat-config.js
  const callbackGasLimit = networkConfig[chainId].callbackGasLimit; // get from helper-hardhat-config.js
  const interval = networkConfig[chainId].interval; // get from helper-hardhat-config.js

  // for local only
  if (development_chain.includes(network.name)) {
    console.log("Local network is detected 🚀 deploying mock contracts");

    // deploy mock vrfcoodinator
    if(!vrfCoordinatorV2address) {
      await deploy("VRFCoordinatorV2Mock", {
        from: deployer.address,
        args: [BASE_FEE, GAS_PRICE_LINK],
        log: true,
        WaitForConfirmations: network.config.blockConfirmations || 1,
      });
      console.log("VRFCoordinatorV2Mock is deployed 👍");
    }

    // deploy mock USDT
    if(!usdtAddress) {
      await deploy("USDTMock", {
        from: deployer.address,
        args: ['tUSDT', 'tUSDT', '6'],
        log: true,
        WaitForConfirmations: network.config.blockConfirmations || 1,
      });
      console.log('USDT is deployed 👍');
    }
    
    // deploy mock ERC20
    if(!erc20Address) {
      await deploy("ERC20Mock", {
        from: deployer.address,
        args: ['MockErc20', 'MockErc20', '18'],
        log: true,
        WaitForConfirmations: network.config.blockConfirmations || 1,
      });
      console.log('MockErc20 is deployed 👍');
    }

    // deploy mock ERC721
    if(!erc20Address) {
      await deploy("ERC721Mock", {
        from: deployer.address,
        args: [],
        log: true,
        WaitForConfirmations: network.config.blockConfirmations || 1,
      });
      console.log('ERC721Mock is deployed 👍');
    }

    let usdt_mock_contract = await ethers.getContract("USDTMock");
    let vrf_mock_contract = await ethers.getContract("VRFCoordinatorV2Mock");
    let erc20_mock_contract = await ethers.getContract("ERC20Mock");
    let erc721_mock_contraact = await ethers.getContract("ERC721Mock");

    if(!vrfCoordinatorV2address) {
      const response = await vrf_mock_contract.createSubscription();
      const receipt = await response.wait(); // wait for 1 block
      subscriptionID = receipt.events[0].args.subId;
      vrfCoordinatorV2address = vrf_mock_contract.address;
  
      console.log('subscriptionID:', subscriptionID)
      console.log('vrfCoordinatorV2address:', vrfCoordinatorV2address)
      
      await vrf_mock_contract.fundSubscription(subscriptionID, VRF_MOCK_FEE);
    }
    
    // fund the subscription
    
    erc20Address = erc20_mock_contract.address;
    erc721Address = erc721_mock_contraact.address;
    usdtAddress = usdt_mock_contract.address;
    
    console.log('usdtAddress', usdtAddress)
    console.log('erc20Address', erc20Address)
    console.log('erc721Address', erc721Address)

  } // get from helper-hardhat-config.js
  else {
    vrfCoordinatorV2address = networkConfig[chainId].vrfCoordinator;
    subscriptionID = networkConfig[chainId].subscriptionID;
    usdtAddress = networkConfig[chainId].usdt_address;

    if(!usdtAddress) {
      // deploy mock USDT
      await deploy("USDTMock", {
        from: deployer.address,
        args: ['tUSDT', 'tUSDT', '6'],
        log: true,
        WaitForConfirmations: network.config.blockConfirmations || 1,
      });
      const usdt_mock_contract = await ethers.getContract("USDTMock");
      usdtAddress = usdt_mock_contract.address;
      console.log('USDT is deployed 👍');
    }
  }
  
  // deploy raffle contract
  const raffle_args = [
    gaslane,
    subscriptionID,
    vrfCoordinatorV2address,
    usdtAddress,
    deployer.address,
  ];

  const raffle = await deploy("Raffle", {
    from: deployer.address,
    args: raffle_args,
    log: true,
    WaitForconfimations: network.config.blockConfirmations || 1
  })
  console.log("raffle is deployed 👍", await raffle.address);
  
  if (development_chain.includes(network.name)) {
    const vrf_mock_contract = await ethers.getContract("VRFCoordinatorV2Mock");
    await vrf_mock_contract.addConsumer(subscriptionID, raffle.address); // add because automation chainlink update
    console.log("raffle contract is added to the consumer of the vrfcoordiner");
    
  }
}

main()
  .then(() => process.exit())
  .catch((error) => {
    console.error(error);
    process.exit(1);
});
