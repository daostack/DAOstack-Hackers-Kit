var ArcJS = require("@daostack/arc.js");

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
const votePrec = 50; 
const GAS_LIMIT = 5900000;

module.exports = async function(deployer) {
  deployer.then(async function() {
    await ArcJS.InitializeArcJs();

    var daicoAddress = "0x0000000000000000000000000000000000000000";

    var accounts = [];
    await web3.eth.getAccounts(function(err, res) {
      accounts = res;
    });

    var networkId;
    switch (deployer.network) {
      case "ganache":
      case "development":
        founders = [accounts[0]];
        networkId = "ganache";
        break;
      case "kovan":
      case "kovan-infura":
        networkId = "kovan";
        break;
    }


    var daoCreatorInst = await DaoCreator.at("0xCfEB869F69431e42cdB54A4F4f105C19C080A601");

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
    var avatarInst = await Avatar.at(returnedParams.logs[0].args._avatar);


    await deployer.deploy(DAICOScheme, "0xcB4e66eCA663FDB61818d52A152601cA6aFEf74F", 100000, 1, 0, 500, 50);
        
    daicoAddress = (await DAICOScheme.deployed()).address;

    var daicoSchemeInstance = await DAICOScheme.deployed();

    const daico = await ArcJS.DAO.new({
      name: orgName,
      tokenName: tokenName,
      tokenSymbol: tokenSymbol,
      founders: [
        {
          address: founders[0],
          reputation: foundersRep[0],
          tokens: foundersTokens[0]
        }
      ],
      schemes: [
        { 
          address: daicoSchemeInstance.address, 
          parametersHash: [], 
          permissions: "0x00000001" 
        }
      ] 
    });
    console.log("Avatar address: " + avatarInst.address);
    console.log("Your DAICO was deployed successfuly!");
  });
};
