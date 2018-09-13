const HDWalletProvider = require("truffle-hdwallet-provider");

module.exports = {
  networks: {
    development: {
      host: "127.0.0.1",
      port: 8545,
      network_id: "*"
    },
    // Use to deploy to the Kovan testnet using Infura
    "kovan-infura": {
      provider: () =>
        new HDWalletProvider(
          // Seed phrase with ETH (to pay gas) in its first account
          "arch gorilla include table parrot front neck cupboard panel cruel scheme wisdom",
          // Note that truffle uses the m/44'/60'/0'/0 Path to get the account to deploy with
          "https://kovan.infura.io/f190b88c93ec4570bb5f2d43abd46d62f190b88c93ec4570bb5f2d43abd46d62"
        ),
      network_id: 42,
      gasPrice: 7000000000 // 1 Gwei
    }
  }
};
