var arcContracts = require("../arc.json");

var Avatar = artifacts.require("@daostack/arc/Avatar.sol");
var Controller = artifacts.require("@daostack/arc/Controller.sol");
var DaoCreator = artifacts.require("@daostack/arc/DaoCreator.sol");
var AbsoluteVote = artifacts.require("@daostack/arc/AbsoluteVote.sol");
var PeepScheme = artifacts.require("./PeepScheme.sol");
var Peepeth = artifacts.require("./Peepeth.sol");

const GAS_LIMIT = 5900000;

// Organization parameters:
// The DAO name
const orgName = "Peepeth DAO";
// The DAO's token name
const tokenName = "Peepeth DAO Token";
// Token symbol
const tokenSymbol = "PDT";
// The ethereum addresses of the "founders"
// TODO: list your accounts to givve initial reputation to
var founders;
// TODO: list the token amount per founder account
// In this example the tokens aren't relevant
// NOTE: the important thing is to make sure the array length match the number of founders
var foundersTokens;
// TODO: list the reputation amount per founder account
var foundersRep;

const votePrec = 50; // The quorum (percentage) needed to pass a vote in the voting machine

// IPFS initialization:
const IPFS = require("ipfs-mini");
const ipfs = new IPFS({
  host: "ipfs.infura.io",
  port: 5001,
  protocol: "https"
});

module.exports = async function(deployer) {
  deployer.then(async function() {
    var peepethAddress = "0x0000000000000000000000000000000000000000";

    // TODO: edit this switch command based on the comments at the variables decleration lines
    var networkId;
    switch (deployer.network) {
      case "ganache":
      case "development":
        founders = [web3.eth.accounts[0]];
        foundersTokens = [web3.toWei(0)];
        foundersRep = [web3.toWei(10)];
        networkId = "ganache";
        await deployer.deploy(Peepeth);
        peepethAddress = (await Peepeth.deployed()).address;
        break;
      case "kovan":
      case "kovan-infura":
        founders = ["<YOUR_KOVAN_ADDRESS>"]; // TODO: Replace with your own address
        foundersTokens = [web3.toWei(0)];
        foundersRep = [web3.toWei(10)];
        networkId = "kovan";
        peepethAddress = "0xb704a46B605277c718A68D30Cb731c8818217eC7";
        break;
    }

    var daoCreatorInst = await DaoCreator.at(
      arcContracts.DaoCreator[networkId]
    );

    // Create DAO:
    var returnedParams = await daoCreatorInst.forgeOrg(
      orgName,
      tokenName,
      tokenSymbol,
      founders,
      foundersTokens, // Founders token amounts
      foundersRep, // Founders initial reputation
      0, // 0 because we don't use a UController
      0, // no token cap
      { gas: GAS_LIMIT }
    );
    var avatarInst = await Avatar.at(returnedParams.logs[0].args._avatar); // Gets the Avatar address
    var controllerInst = await Controller.at(await avatarInst.owner()); // Gets the controller address
    var reputationAddress = await controllerInst.nativeReputation(); // Gets the reputation contract address

    // Load AbsoluteVote Voting Machine:
    var absoluteVoteInst = await AbsoluteVote.at(
      arcContracts.AbsoluteVote[networkId]
    );

    // Set the voting parameters for the Absolute Vote Voting Machine
    await absoluteVoteInst.setParameters(reputationAddress, votePrec, true);

    // Voting parameters and schemes params:
    var voteParametersHash = await absoluteVoteInst.getParametersHash(
      reputationAddress,
      votePrec,
      true
    );

    // Deploy the Universal Peep Scheme
    await deployer.deploy(PeepScheme, peepethAddress);
    var peepSchemeInstance = await PeepScheme.deployed();

    // Set the scheme parameters
    await peepSchemeInstance.setParameters(
      voteParametersHash,
      absoluteVoteInst.address
    );

    var peepSchemeParams = await peepSchemeInstance.getParametersHash(
      voteParametersHash,
      absoluteVoteInst.address
    );

    var schemesArray = [peepSchemeInstance.address]; // The address of the scheme
    const paramsArray = [peepSchemeParams]; // Defines which parameters should be grannted in the scheme
    const permissionArray = ["0x00000010"]; // Granting full permissions to the Peep Scheme

    // set the DAO's initial schmes:
    await daoCreatorInst.setSchemes(
      avatarInst.address,
      schemesArray,
      paramsArray,
      permissionArray
    ); // Sets the scheme in our DAO controller by using the DAO Creator we used to forge our DAO

    await new Promise(function(resolve, reject) {
      ipfs.addJSON(
        {
          info: "The first DAO on social media! #LookAtMeImaDAO",
          location: "Ethereum",
          realName: "The Peeping DAO",
          website: "https://daostack.io",
          avatarUrl: "", // TODO: add ipfs hash of a profile picture
          backgroundUrl: "", // TODO: add ipfs hash of a background image
          messageToWorld: "DAOs are coming!",
          untrustedTimestamp: Math.trunc(new Date().getTime() / 1000)
        },
        (err, result) => {
          if (err) {
            reject(err);
          } else {
            resolve(result);
          }
        }
      );
    }).then(async function(registrationMsgHash) {
      console.log("IPFS registration message hash: " + registrationMsgHash);

      await peepSchemeInstance.registerPeepethAccount(
        avatarInst.address,
        web3.fromAscii("thepeepingdao"), // TODO: If you're using Kovan, please change the name here as this is already registered
        registrationMsgHash
      );

      // @note: You will need your Avatar and Voting Machine addresses to interact with them from the JS files
      console.log("Your Peep DAO was deployed successfuly!");
      console.log("Avatar address: " + avatarInst.address);
      console.log(
        "Absolue Voting Machine address: " + absoluteVoteInst.address
      );
    });
  });
};
