/* eslint-disable */
require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

const RPC_URL = process.env.BLOCKCHAIN_RPC_URL || "http://127.0.0.1:8545";
const PRIVATE_KEY = process.env.PRIVATE_KEY && !process.env.PRIVATE_KEY.includes("000000")
  ? [process.env.PRIVATE_KEY]
  : [];

module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    hardhat: {
      chainId: 31337,
    },
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 31337,
    },
    amoy: {
      url: RPC_URL,
      accounts: PRIVATE_KEY,
      chainId: 80002,
    },
    sepolia: {
      url: RPC_URL,
      accounts: PRIVATE_KEY,
      chainId: 11155111,
    },
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
};
