
// require("dotenv").config();
// const HDWalletProvider = require("@truffle/hdwallet-provider");
// const { INFURA_API_KEY, MNEMONIC } = process.env;

module.exports = {
  networks: {
    development: {
      host: "127.0.0.1",
      port: 7545,
      network_id: "*" // Match any network id
    }
    // THIS IS NOT RECOMMENDED, Use a deployment tool like truffle dashboard
    // sepolia: {
    //   provider: () => new HDWalletProvider(MNEMONIC, INFURA_API_KEY),
    //   network_id: "11155111",
    //   gas: 4465030,
    // },
  },
  contracts_directory: './src/contracts/',
  contracts_build_directory: './src/abis/',
  compilers: {
    solc: {
      version: "0.8.19",
      settings: {
        optimizer: {
          enabled: true, // Default: false
          runs: 200      // Default: 200
        },
      }
    }
  }
};
