const { ethers } = require("hardhat");

const networkConfig = {
  137: {
    name: "polygon",
    pricefeed_address: "",
    vrfCoordinator: "0xAE975071Be8F8eE67addBC1A82488F1C24858067",
    entranceFee: ethers.utils.parseEther("0.01"),
    gaslane: "0xcc294a196eeeb44da2888d17c0625cc88d70d9760a69d58d853ba6581a9ab0cd",
    subscriptionID: "",
    callbackGasLimit: "2500000",
    interval: "30", // 30 seconds,
    usdt_address: "",
  },
  80001: {
    name: "mumbai",
    pricefeed_address: "",
    vrfCoordinator: "0x7a1BaC17Ccc5b313516C5E16fb24f7659aA5ebed",
    entranceFee: ethers.utils.parseEther("0.01"),
    gaslane: "0x4b09e658ed251bcafeebbc69400383d49f344ace09b9576fe248bb02c003fe9f",
    subscriptionID: "6006",
    callbackGasLimit: "2500000",
    interval: "30", // 30 seconds,
    usdt_address: "0x65ab985f59096e232ac4c7ea070c4c2245a72f2a",
  },
  31337: {
    name: "localhost",
    entranceFee: ethers.utils.parseEther("0.01"),
    gaslane:
      "0x4b09e658ed251bcafeebbc69400383d49f344ace09b9576fe248bb02c003fe9f",
    callbackGasLimit: "500000",
    interval: "30",
    lottery: "",
    vrfCoordinator: "",
    subscriptionID: "",
    usdt_address: "",
  },
  1351057110: {
    name: "chaos",
    pricefeed_address: "",
    interval: "30", // 30 seconds,
    usdt_address: "",
    feeRecipient: ethers.constants.AddressZero,
  }
};

const development_chain = ["hardhat", "localhost"];
// const DECIMALS = 8;
// const INITIAL_ANSWER = 200000000000;

module.exports = { networkConfig, development_chain };
