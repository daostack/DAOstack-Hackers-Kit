var ArcJS = require("@daostack/arc.js");

var DAICOScheme = artifacts.require("./ICOScheme.sol");

// Organization parameters:
const orgName = "FINAL_TEST3";
const tokenName = "FINAL_TOKEN3";
const tokenSymbol = "FTT3";
var founders = ["0xb0c908140fe6fd6fbd4990a5c2e35ca6dc12bfb2"];
var foundersTokens = [100000];
var foundersRep = [5];
const votePrec = 50; 

module.exports = async function(deployer) {
  deployer.then(async function() {
    await ArcJS.InitializeArcJs();

    var daicoAddress = "0x0000000000000000000000000000000000000000";

    var accounts = [];
    await web3.eth.getAccounts(function(err, res) { accounts = res; });
    var absoluteVote = ArcJS.ContractWrappers.AbsoluteVote;

    console.log("A");

    var networkId;
    switch (deployer.network) {
      case "ganache":
      case "development":
        founders = [accounts[0]];
        foundersTokens = [5];//[web3.utils.toWei("0")];
        foundersRep = [5];//[web3.utils.toWei("10")];
        break;
      case "kovan":
      case "kovan-infura":
        networkId = "kovan";
        break;
    }

    await absoluteVote.setParameters(votePrec, true);

    var voteParametersHash = await absoluteVote.getParametersHash(votePrec, true);

    //await deployer.deploy(DAICOScheme, daicoAddress);
    await deployer.deploy(DAICOScheme, 100000, 1, 0, 500, 5);
        
    daicoAddress = (await DAICOScheme.deployed()).address;

    var daicoSchemeInstance = await DAICOScheme.deployed();

    console.log("G");
    //console.log("G1: " + daicoSchemeInstance.address);

    // await daicoSchemeInstance.setParameters(
    //   voteParametersHash,
    //   absoluteVote.address
    // );

    // console.log("H");

    // var daicoSchemeParams = await daicoSchemeInstance.getParametersHash(
    //   voteParametersHash,
    //   absoluteVote.address
    // );

    console.log("I");

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
        // { 
        //   // address: daicoSchemeInstance.address, 
        //   // //parametersHash: [], 
        //   // permissions: "0x00000001" 
        // }
      ] 
    });

    console.log("Your DAICO was deployed successfuly!");
    //console.log("Avatar address: " + avatarInst.address);
    console.log("Absolue Voting Machine address: " + absoluteVote.address);

  });
};
