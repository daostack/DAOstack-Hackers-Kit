require('babel-register');
require('babel-polyfill');
require('dotenv').config();

const NonceTrackerSubprovider = require("web3-provider-engine/subproviders/nonce-tracker");
const HDWalletProvider = require("truffle-hdwallet-provider");

module.exports = {
  networks: {
    development: {
      host: 'localhost',
      port: 8545,
      network_id: '*', // Match any network id
      gas: 7900000,
    },
    kovan: {
      provider: () => {
        const key = process.env.PRIVATEKEY;
        let wallet = new HDWalletProvider(key, "https://kovan.infura.io/")
        var nonceTracker = new NonceTrackerSubprovider()
        wallet.engine._providers.unshift(nonceTracker)
        nonceTracker.setEngine(wallet.engine)
        return wallet
      },
      network_id: '42', // Match any network id
      gas: 7900000,
      gasPrice: 5000000000
    },
  },
  compilers: {
    solc: {
      version: "0.5.8",
      settings: {
        optimizer: {
          enabled: true,
          runs: 200
        }
      }
    }
  },
  mocha: {
    enableTimeouts: false
  }
};
