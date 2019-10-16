module.exports = {
  networks: {
    development: {
      network_id: "*",
      host: "localhost",
      port: 8545,
      gas: 4543760
    },
  },
  rpc: {
    host: "localhost",
    port: 8545
  },
  compilers: {
    solc: {
      version: "0.5.11",
      //docker: true,
      settings: {
        optimizer: {
          enabled: true,
          runs: 200
        },
      }
    }
  }
}
