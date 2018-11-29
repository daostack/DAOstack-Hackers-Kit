const ArcJS = require("@daostack/arc.js");

const AragonScheme = artifacts.require("./AragonScheme.sol");

// Organization parameters:
// The DAO name
const orgName = "Aragon Scheme";
// The DAO's token name
const tokenName = "Aragon Scheme Token";
// Token symbol
const tokenSymbol = "AST";

var foundersTokens = [web3.utils.toWei("100")];
var foundersRep = [web3.utils.toWei("100")];
var founders = [];

module.exports = async function(deployer) {
  deployer.then(async function() {
    await ArcJS.InitializeArcJs();

    // Get web3 accounts
    var accounts = [];
    await web3.eth.getAccounts(function(err, res) {
      founders.push(res[0]);
    });

    // TODO: edit this switch command based on the comments at the variables decleration lines
    const absoluteVote = ArcJS.ContractWrappers.AbsoluteVote;

    // TODO: edit this switch command based on the comments at the variables decleration lines
    var networkId;
    console.log(accounts[0])
    switch (deployer.network) {
      case "ganache":
      case "development":
      case "kovan":
      case "kovan-infura":
    }
    console.log(founders[0])
    // Set the voting parameters for the Absolute Vote Voting Machine
    await absoluteVote.setParameters(votePercentage, true);

    // Voting parameters and schemes params:
    var voteParametersHash = await absoluteVote.getParametersHash(
      votePercentage,
      true
    );

    // Deploy the Universal Aragon Scheme
    await deployer.deploy(AragonScheme);
    var aragonSchemeInstance = await AragonScheme.deployed();

    // Set the scheme parameters
    await aragonSchemeInstance.setParameters(
      voteParametersHash,
      absoluteVote.address
    );

    var aragonSchemeParams = await aragonSchemeInstance.getParametersHash(
      voteParametersHash,
      absoluteVote.address
    );

    // Create a new DAO:
    const dao = await ArcJS.DAO.new({
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
        // TODO: Don't forget to add at least 1 founder to the `founders`, foundersRep` and `foundersTokens` arrays
      ],
      // Set the DAO's initial schemes:
      schemes: [
        // Set the scheme in our DAO controller by using the DAO Creator we used to forge our DAO
        {
          address: aragonSchemeInstance.address,
          parametersHash: aragonSchemeParams,
          permissions: ArcJS.SchemePermissions.CanCallDelegateCall
        }
      ]
    });
  });
};
