var arcContracts = require("../arc.json");

var Avatar = artifacts.require("@daostack/arc/Avatar.sol");
var Controller = artifacts.require("@daostack/arc/Controller.sol");
var DaoCreator = artifacts.require("@daostack/arc/DaoCreator.sol");
var AbsoluteVote = artifacts.require("@daostack/arc/AbsoluteVote.sol");
var DAICOScheme = artifacts.require("./ICOScheme.sol");

const GAS_LIMIT = 8000000;

// Organization parameters:
const orgName = "FINAL_TEST2";
const tokenName = "FINAL_TOKEN2";
const tokenSymbol = "FTT2";
var founders = ["0xb0c908140fe6fd6fbd4990a5c2e35ca6dc12bfb2"];
var foundersTokens = [100000];
var foundersRep = [5];
const votePrec = 50; 

// const IPFS = require("ipfs-mini");
// const ipfs = new IPFS({
//   host: "ipfs.infura.io",
//   port: 5001,
//   protocol: "https"
// });

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

    console.log("A");

    //Create DAO:
    var returnedParams = await daoCreatorInst.forgeOrg(
      orgName,
      tokenName,
      tokenSymbol,
      founders,
      foundersTokens,
      foundersRep,
      0,
      10000,
      { gas: GAS_LIMIT }
    );

    console.log("B");

    var avatarInst = await Avatar.at(returnedParams.logs[0].args._avatar); // Gets the Avatar address
    var controllerInst = await Controller.at(await avatarInst.owner()); // Gets the controller address
    var reputationAddress = await controllerInst.nativeReputation(); // Gets the reputation contract address

    // Load AbsoluteVote Voting Machine:
    var absoluteVoteInst = await AbsoluteVote.at(
      arcContracts.AbsoluteVote[networkId]
    );

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

    console.log("Your DAICO was deployed successfuly!");
    console.log("Avatar address: " + avatarInst.address);
    console.log("Absolue Voting Machine address: " + absoluteVoteInst.address);


    // await new Promise(function(resolve, reject) {
    //   ipfs.addJSON(
    //     {
    //       info: "The first DAOstack-based DAICO!",
    //       location: "Ethereum",
    //       realName: "The DAICO",
    //       website: "https://daostack.io",
    //       avatarUrl: "", // TODO: add ipfs hash of a profile picture
    //       backgroundUrl: "", // TODO: add ipfs hash of a background image
    //       messageToWorld: "DAOs are coming!",
    //       untrustedTimestamp: Math.trunc(new Date().getTime() / 1000)
    //     },
    //     (err, result) => {
    //       if (err) {
    //         reject(err);
    //       } else {
    //         resolve(result);
    //       }
    //     }
    //   );
    // }).then(async function(registrationMsgHash) {
    //   console.log("IPFS registration message hash: " + registrationMsgHash);

    //   await daicoSchemeInstance.registerPeepethAccount(
    //     avatarInst.address,
    //     web3.fromAscii("thedaico"), // TODO: If you're using Kovan, please change the name here as this is already registered
    //     registrationMsgHash
    //   );
    // });
  });
};
