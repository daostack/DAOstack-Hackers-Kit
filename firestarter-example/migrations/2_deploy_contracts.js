var Firestarter = artifacts.require("./Firestarter.sol");

module.exports = function(deployer) {
  deployer.deploy(Firestarter);
};
