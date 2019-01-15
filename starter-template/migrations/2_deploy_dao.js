const ArcJS = require("@daostack/arc.js");

// Organization parameters:
// The DAO name
const orgName = "YOUR_DAO";
// The DAO's token name
const tokenName = "YOUR_DAO_TOKEN_NAME";
// Token symbol
const tokenSymbol = "YOUR_DAO_TOKEN_SYMBOL";
// The ethereum addresses of the "founders"
// TODO: list your accounts to give initial reputation to
var founders = [];
// TODO: list the token amount per founder account
// NOTE: the important thing is to make sure the array length match the number of founders
var foundersTokens = [];
// TODO: list the reputation amount per founder account
var foundersRep = [];

module.exports = async function(deployer) {
  deployer.then(async function() {
    await ArcJS.InitializeArcJs();

    // TODO: edit this switch command based on the comments at the variables decleration lines
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
      schemes: []
    });
  });
};
