const ArcJS = require("@daostack/arc.js");

const PeepScheme = artifacts.require("./PeepScheme.sol");
const Peepeth = artifacts.require("./Peepeth.sol");

// Organization parameters:
// The DAO name
const orgName = "Peepeth DAO";
// The DAO's token name
const tokenName = "Peepeth DAO Token";
// Token symbol
const tokenSymbol = "PDT";
// The ethereum addresses of the "founders"
// TODO: list your accounts to give initial reputation to
var founders;
// TODO: list the token amount per founder account
// In this example the tokens aren't relevant
// NOTE: the important thing is to make sure the array length match the number of founders
var foundersTokens;
// TODO: list the reputation amount per founder account
var foundersRep;

const votePercentage = 50; // The quorum (percentage) needed to pass a vote in the voting machine

// IPFS initialization:
const IPFS = require("ipfs-mini");
const ipfs = new IPFS({
  host: "ipfs.infura.io",
  port: 5001,
  protocol: "https"
});

module.exports = async function(deployer) {
  deployer.then(async function() {
    await ArcJS.InitializeArcJs();

    var peepethAddress = "0x0000000000000000000000000000000000000000";

    // Get web3 accounts
    var accounts = [];
    await web3.eth.getAccounts(function(err, res) {
      accounts = res;
    });

    const absoluteVote = ArcJS.ContractWrappers.AbsoluteVote;

    // TODO: edit this switch command based on the comments at the variables decleration lines
    switch (deployer.network) {
      case "ganache":
      case "development":
        founders = [accounts[0]];
        foundersTokens = [web3.utils.toWei("0")];
        foundersRep = [web3.utils.toWei("10")];
        await deployer.deploy(Peepeth);
        peepethAddress = (await Peepeth.deployed()).address;
        break;
      case "kovan":
      case "kovan-infura":
        founders = ["<YOUR_KOVAN_ADDRESS>"]; // TODO: Replace with your own address
        foundersTokens = [web3.utils.toWei("0")];
        foundersRep = [web3.utils.toWei("10")];
        peepethAddress = "0xb704a46B605277c718A68D30Cb731c8818217eC7";
        break;
    }

    // Set the voting parameters for the Absolute Vote Voting Machine
    await absoluteVote.setParameters(votePercentage, true);

    // Voting parameters and schemes params:
    var voteParametersHash = await absoluteVote.getParametersHash(
      votePercentage,
      true
    );

    // Deploy the Universal Peep Scheme
    await deployer.deploy(PeepScheme, peepethAddress);
    var peepSchemeInstance = await PeepScheme.deployed();

    // Set the scheme parameters
    await peepSchemeInstance.setParameters(
      voteParametersHash,
      absoluteVote.address
    );

    var peepSchemeParams = await peepSchemeInstance.getParametersHash(
      voteParametersHash,
      absoluteVote.address
    );

    // Create DAO:
    const peepethDao = await ArcJS.DAO.new({
      name: orgName,
      tokenName: tokenName,
      tokenSymbol: tokenSymbol,
      founders: [
        {
          address: founders[0],
          reputation: foundersRep[0],
          tokens: foundersTokens[0]
        }
        // TODO: If you add more founders don't forget to add them here as well
      ],
      // Set the DAO's initial schemes:
      schemes: [
        // Set the scheme in our DAO controller by using the DAO Creator we used to forge our DAO
        {
          address: peepSchemeInstance.address,
          parametersHash: peepSchemeParams,
          permissions: ArcJS.SchemePermissions.CanCallDelegateCall
        }
      ]
    });

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
        peepethDao.avatar.address,
        web3.utils.fromAscii("thepeepingdao"), // TODO: If you're using Kovan, please change the name here as this is already registered
        registrationMsgHash
      );

      // @note: You will need your Avatar and Voting Machine addresses to interact with them from the JS files
      console.log("Your Peep DAO was deployed successfuly!");
      console.log("Avatar address: " + peepethDao.avatar.address.address);
      console.log("Absolute Voting Machine address: " + absoluteVote.address);
    });
  });
};
