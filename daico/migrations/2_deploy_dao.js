var arcContracts = require("../arc.json");

var Avatar = artifacts.require("@daostack/arc/Avatar.sol");
var Controller = artifacts.require("@daostack/arc/Controller.sol");
var DaoCreator = artifacts.require("@daostack/arc/DaoCreator.sol");
var AbsoluteVote = artifacts.require("@daostack/arc/AbsoluteVote.sol");
var DAICOScheme = artifacts.require("./ICOScheme.sol");

const GAS_LIMIT = 5900000;

// Organization parameters:
const orgName = "FINAL_TEST";
const tokenName = "FINAL_TOKEN";
const tokenSymbol = "FTT";
var founders = ["0xb0c908140fe6fd6fbd4990a5c2e35ca6dc12bfb2"];
var foundersTokens = [100000];
var foundersRep = [5];
const votePrec = 50; 

module.exports = async function(deployer) {
  deployer.then(async function() {
    var daicoAddress = "0x0000000000000000000000000000000000000000";
    var networkId;
    switch (deployer.network) {
      case "ganache":
      case "development":
        networkId = "ganache";
        break;
      case "kovan":
      case "kovan-infura":
        networkId = "kovan";
        break;
    }

    var daoCreatorInst = await DaoCreator.at(
      arcContracts.DaoCreator[networkId]
    );

    console.log("ABC 1");

    // Create DAO:
    var returnedParams = await daoCreatorInst.forgeOrg(
      orgName,
      tokenName,
      tokenSymbol,
      founders,
      foundersTokens,
      foundersRep,
      0, // 0 because we don't use a UController
      1000000,
      { gas: GAS_LIMIT }
    );

    console.log("ABC 2");
    var avatarInst = await Avatar.at(returnedParams.logs[0].args._avatar); // Gets the Avatar address
    var controllerInst = await Controller.at(await avatarInst.owner()); // Gets the controller address
    var reputationAddress = await controllerInst.nativeReputation(); // Gets the reputation contract address

    // Load AbsoluteVote Voting Machine:
    var absoluteVoteInst = await AbsoluteVote.at(
      arcContracts.AbsoluteVote[networkId]
    );

    console.log("DEF");

    await absoluteVoteInst.setParameters(reputationAddress, votePrec, true);

    var voteParametersHash = await absoluteVoteInst.getParametersHash(
      reputationAddress,
      votePrec,
      true
    );

    await deployer.deploy(DAICOScheme, daicoAddress);
    var daicoSchemeInstance = await DAICOScheme.deployed();

    await daicoSchemeInstance.setParameters(
      voteParametersHash,
      absoluteVoteInst.address
    );

    var daicoSchemeParams = await daicoSchemeInstance.getParametersHash(
      voteParametersHash,
      absoluteVoteInst.address
    );

    console.log("GHI");

    var schemesArray = [daicoSchemeInstance.address];
    const paramsArray = [daicoSchemeParams];
    const permissionArray = ["0x00000010"];

    // set the DAO's initial schmes:
    await daoCreatorInst.setSchemes(
      avatarInst.address,
      schemesArray,
      paramsArray,
      permissionArray
    ); // Sets the scheme in our DAO controller by using the DAO Creator we used to forge our DAO

    console.log("Your DAICOO was deployed successfuly!");
    console.log("Avatar address: " + avatarInst.address);
    console.log("Absolue Voting Machine address: " + absoluteVoteInst.address);
  });
};
