module.exports = {
  compilers: {
    solc: {
      version: "0.5.13",
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
