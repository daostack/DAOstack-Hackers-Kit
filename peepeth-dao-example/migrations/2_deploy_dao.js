var Avatar = artifacts.require("@daostack/arc/Avatar.sol");
var Controller = artifacts.require("@daostack/arc/Controller.sol");
var DaoCreator = artifacts.require("@daostack/arc/DaoCreator.sol");
var ControllerCreator = artifacts.require(
  "@daostack/arc/ControllerCreator.sol"
);
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

var AvatarInst;
var AbsoluteVoteInst;
var peepSchemeInstance;

module.exports = async function(deployer) {
  // TODO: edit this switch command based on the comments at the variables decleration lines
  switch (deployer.network) {
    case "development":
      founders = [web3.eth.accounts[0]];
      foundersTokens = [web3.toWei(0)];
      foundersRep = [web3.toWei(10)];
      break;
    case "kovan-infura":
      founders = ["<YOUR_KOVAN_ADDRESS>"]; // TODO: Replace with your own address
      foundersTokens = [web3.toWei(0)];
      foundersRep = [web3.toWei(10)];
      break;
  }

  deployer
    .deploy(ControllerCreator, { gas: GAS_LIMIT })
    .then(async function() {
      var controllerCreator = await ControllerCreator.deployed();
      await deployer.deploy(DaoCreator, controllerCreator.address);
      var daoCreatorInst = await DaoCreator.deployed(controllerCreator.address);
      // Create DAO:
      var returnedParams = await daoCreatorInst.forgeOrg(
        orgName,
        tokenName,
        tokenSymbol,
        founders,
        foundersTokens, // Founders token amounts
        foundersRep, // FFounders initial reputation
        0, // 0 because we don't use a UController
        0, // no token cap
        { gas: GAS_LIMIT }
      );
      AvatarInst = await Avatar.at(returnedParams.logs[0].args._avatar); // Gets the Avatar address
      var ControllerInst = await Controller.at(await AvatarInst.owner()); // Gets the controller address
      var reputationAddress = await ControllerInst.nativeReputation(); // Gets the reputation contract address

      // Deploy AbsoluteVote Voting Machine:
      await deployer.deploy(AbsoluteVote);

      AbsoluteVoteInst = await AbsoluteVote.deployed();

      // Set the voting parameters for the Absolute Vote Voting Machine
      await AbsoluteVoteInst.setParameters(reputationAddress, votePrec, true);

      // Voting parameters and schemes params:
      var voteParametersHash = await AbsoluteVoteInst.getParametersHash(
        reputationAddress,
        votePrec,
        true
      );

      // Set the peepeth contract address to use
      var peepethAddress = "0x0000000000000000000000000000000000000000";

      switch (deployer.network) {
        case "development":
          await deployer.deploy(Peepeth);
          peepethInstance = await Peepeth.deployed();
          peepethAddress = peepethInstance.address;
          break;
        case "kovan-infura":
          peepethAddress = "0xb704a46B605277c718A68D30Cb731c8818217eC7";
          break;
      }

      // Deploy the Universal Peep Scheme
      await deployer.deploy(PeepScheme, peepethAddress);
      peepSchemeInstance = await PeepScheme.deployed();

      // Set the scheme parameters
      await peepSchemeInstance.setParameters(
        voteParametersHash,
        AbsoluteVoteInst.address
      );

      var schemePeepInstance = await peepSchemeInstance.getParametersHash(
        voteParametersHash,
        AbsoluteVoteInst.address
      );

      var schemesArray = [peepSchemeInstance.address]; // The address of the scheme
      const paramsArray = [schemePeepInstance]; // Defines which parameters should be grannted in the scheme
      const permissionArray = ["0x00000010"]; // Granting full permissions to the Peep Scheme

      // set the DAO's initial schmes:
      await daoCreatorInst.setSchemes(
        AvatarInst.address,
        schemesArray,
        paramsArray,
        permissionArray
      ); // Sets the scheme in our DAO controller by using the DAO Creator we used to forge our DAO

      return new Promise(function(resolve, reject) {
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
      });
    })
    .then(async function(registrationMsgHash) {
      console.log("IPFS registration message hash: " + registrationMsgHash);

      // Registeres the DAO to Peepeth using the PeepScheme
      await peepSchemeInstance.registerPeepethAccount(
        AvatarInst.address,
        web3.fromAscii("thepeepingdao"), // TODO: If you're using Kovan, please change the name here as this is already registered
        registrationMsgHash
      );

      // @note: You will need your Avatar and Voting Machine addresses to interact with them from the JS files
      console.log("Your Peep DAO was deployed successfuly!");
      console.log("Avatar address: " + AvatarInst.address);
      console.log(
        "Absolue Voting Machine address: " + AbsoluteVoteInst.address
      );
    });
};
