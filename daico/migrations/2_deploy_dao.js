var ArcJS = require("@daostack/arc.js");

var DAICOScheme = artifacts.require("./ICOScheme.sol");

// Organization parameters:
const orgName = "DAICO TEMP";
const tokenName = "DAICOIN";
const tokenSymbol = "DCOI";
var founders;
var foundersTokens = [10000];
var foundersRep = [5];
const votePrec = 50; 

module.exports = async function(deployer) {
  deployer.then(async function() {
    await ArcJS.InitializeArcJs();

    var daicoAddress = "0x0000000000000000000000000000000000000000";

    var networkId;
    switch (deployer.network) {
      case "ganache":
      case "development":
        founders = [web3.eth.accounts[0]];
        networkId = "ganache";
        break;
      case "kovan":
      case "kovan-infura":
        networkId = "kovan";
        break;
    }

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

    console.log("Your DAICO was deployed successfuly!");
  });
};
