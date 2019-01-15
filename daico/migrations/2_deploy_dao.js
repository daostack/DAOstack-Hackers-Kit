var ArcJS = require("@daostack/arc.js");
var Migration = require("@daostack/arc.js/migration.json");

var Avatar = artifacts.require("@daostack/arc/Avatar.sol");
var Controller = artifacts.require("@daostack/arc/Controller.sol");
var DaoCreator = artifacts.require("@daostack/arc/DaoCreator.sol");
var DAICOScheme = artifacts.require("./ICOScheme.sol");

// Organization parameters:
const orgName = "DAICO TEMP";
const tokenName = "DAICOIN";
const tokenSymbol = "DCOI";
var founders;
var foundersTokens = [10000];
var foundersRep = [5];
const GAS_LIMIT = 5900000;
const NULL_HASH =
  "0x0000000000000000000000000000000000000000000000000000000000000000";

module.exports = async function(deployer) {
  deployer.then(async function() {
    await ArcJS.InitializeArcJs();

    var accounts = [];
    await web3.eth.getAccounts(function(err, res) {
      accounts = res;
    });

    var networkId;
    switch (deployer.network) {
      case "ganache":
      case "development":
        founders = [accounts[0]];
        networkId = "private";
        break;
      case "kovan":
      case "kovan-infura":
        networkId = "kovan";
        break;
    }

    var daoCreatorInst = await DaoCreator.at(
      ArcJS.ContractWrappers.DaoCreator.address
    );

    // Create DAO:
    var returnedParams = await daoCreatorInst.forgeOrg(
      orgName,
      tokenName,
      tokenSymbol,
      founders,
      foundersTokens, // Founders token amounts
      foundersRep, // Founders initial reputation
      Migration[networkId].base.UController,
      0, // no token cap
      { gas: GAS_LIMIT }
    );

    var avatarInst = await Avatar.at(returnedParams.logs[0].args._avatar);

    await deployer.deploy(
      DAICOScheme,
      avatarInst.address,
      100000,
      1,
      0,
      500,
      50
    );

    daicoAddress = (await DAICOScheme.deployed()).address;

    var daicoSchemeInstance = await DAICOScheme.deployed();

    var schemesArray = [daicoSchemeInstance.address];
    const paramsArray = [NULL_HASH];
    const permissionArray = ["0x00000001"];

    console.log("OWNER " + (await avatarInst.owner.call()));

    // set the DAO's initial schmes:
    await daoCreatorInst.setSchemes(
      avatarInst.address,
      schemesArray,
      paramsArray,
      permissionArray
    );

    console.log("Avatar address: " + avatarInst.address);
    console.log("Your DAICO was deployed successfuly!");
  });
};
