const HDWalletProvider = require("truffle-hdwallet-provider");
const env = require('dotenv').config()
module.exports = {
  networks: {
    development: {
      host: "127.0.0.1",
      port: 8545,
      network_id: "*"
    },
    // Use to deploy to the Kovan testnet using Infura
    // Note that truffle uses the m/44'/60'/0'/0 Path to get the account to deploy with
    kovan: {

      provider: () => new HDWalletProvider(
        process.env.SEED_PHRASE,
        process.env.KOVAN_INFURA_URL
      ),
      network_id: 42,
      gasPrice: 1000000000 // 1 Gwei
    },
    rinkeby: {

      provider: () => new HDWalletProvider(
        process.env.SEED_PHRASE,
        process.env.RINKEBY_INFURA_URL
      ),
      network_id: 4,
      gas: 4612388 // Gas limit used for deploys
    }
  },
  compilers: {
    solc: {
      version: "0.4.25",
      optimizer: {
        enabled: true,
        runs: 200
      }
      }
  }
};
