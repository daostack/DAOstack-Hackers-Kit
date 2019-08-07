module.exports = {
  compilers: {
    solc: {
      version: "0.5.4",
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
