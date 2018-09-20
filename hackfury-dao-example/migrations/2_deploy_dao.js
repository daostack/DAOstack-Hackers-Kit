var Avatar = artifacts.require("@daostack/arc/Avatar.sol");
var Controller = artifacts.require("@daostack/arc/Controller.sol");
var DaoCreator = artifacts.require("@daostack/arc/DaoCreator.sol");
var ControllerCreator = artifacts.require(
  "@daostack/arc/ControllerCreator.sol"
);
var HackfuryScheme = artifacts.require("./Hackfury.sol");

const GAS_LIMIT = 5900000;

// Organization parameters:
const orgName = "Hackfury DAO";
const tokenName = "Hackfury DAO Token";
const tokenSymbol = "HFT";

// The ethereum addresses of the "founders"
var founders = []; // your accounts to give initial reputation to

var foundersTokens; // the token amount per founder account

// TODO: list the reputation amount per founder account
var foundersRep;

module.exports = async function(deployer) {
  // TODO: edit this switch command based on the comments at the variables decleration lines
  switch (deployer.network) {
    case "development":
      founders = [web3.eth.accounts[0]];
      foundersTokens = [web3.toWei(0)];
      foundersRep = [web3.toWei(100)];
      break;
    case "kovan-infura":
      founders = [
        "0xc73b23be8cd2a99c2b5a35d190c8684c87fafa04",
        "0x2b02EA775ffAF5f45FE97Fb938FFAea8756eF076",
        "0xd2bdfc2d407b6eeb949a44192bbbf874cd392a11"
      ]; // TODO: Replace with your own address
      foundersTokens = [web3.toWei(1), web3.toWei(2), web3.toWei(3)];
      foundersRep = [web3.toWei(101), web3.toWei(100), web3.toWei(99)];
      break;
  }

  deployer.deploy(ControllerCreator, { gas: GAS_LIMIT }).then(async function() {
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
      foundersRep, // Founders initial reputation
      0, // 0 because we don't use a UController
      0, // no token cap
      { gas: GAS_LIMIT }
    );
    var AvatarInst = await Avatar.at(returnedParams.logs[0].args._avatar); // Gets the Avatar address

    // Deploy the Scheme
    await deployer.deploy(HackfuryScheme);
    var hackfurySchemeInstance = await HackfuryScheme.deployed();

    var schemesArray = [hackfurySchemeInstance.address]; // The address of the scheme
    const paramsArray = [""]; // Defines which parameters should be granted in the scheme, here we don't need it
    const permissionArray = ["0x00000001"]; // Granting reputation and token minting permission to the Hackfury Scheme

    // set the DAO's initial schmes:
    await daoCreatorInst.setSchemes(
      AvatarInst.address,
      schemesArray,
      paramsArray,
      permissionArray
    ); // Sets the scheme in our DAO controller by using the DAO Creator we used to forge our DAO

    console.log("Your DAO was deployed successfuly!");
    console.log("Avatar address: " + AvatarInst.address);
  });
};
