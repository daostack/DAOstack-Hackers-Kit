import {
  InitializeArcJs,
  LoggingService,
  LogLevel,
  DAO,
  ConfigService,
  AccountService,
  WrapperService,
  BinaryVoteResult
} from "@daostack/arc.js";

const ICOSchemeArtifacts = require("../build/contracts/ICOScheme.json");
const contract = require("truffle-contract");
let ICOScheme = contract(ICOSchemeArtifacts);

// Default Avatar and Voting Machine addresses when using Ganache cli.
// TODO: Paste here your own instances addresses which can be found in the logs at the end of the migration script.
const avatarAddress = "0xcB4e66eCA663FDB61818d52A152601cA6aFEf74F";
const votingMachineAddress = "0x0251bac7403718d49ccae5f8c02e03cd020f7f01";
var daicoDAO;
var icoScheme;
var accounts = [];

/*
Helper function for initializing ArcJS and your app.
*/
console.log("A1");
async function initialize() {
  await InitializeArcJs({
    watchForAccountChanges: true,
      filter: {
        AbsoluteVote: true,
        DaoCreator: true,
        ControllerCreator: true,
        Avatar: true,
        Controller: true
    }
  });

  console.log("A2");

  // These are some basic configurations, feel free to edit as you need.
  // Learn more about the Arc.js configurations here: https://daostack.github.io/arc.js/Configuration/

  await web3.eth.getAccounts(function(err, res) { 
      console.log("A21");
    accounts = res; 
    console.log("A22");
  });

  console.log("A3");

  ConfigService.set("estimateGas", true);
  ConfigService.set("txDepthRequiredForConfirmation", {kovan: 0, live: 0});
  AccountService.subscribeToAccountChanges(() => { window.location.reload(); });
  //LoggingService.logLevel = LogLevel.all;

    console.log("A4");

  daicoDAO = await DAO.at(avatarAddress);
  const daoSchemes = await daicoDAO.getSchemes();
  const daoSchemeAddress = daoSchemes[0].address; 

  $("#daoAddress").text("The DAO address is: " + avatarAddress);

  ICOScheme.setProvider(web3.currentProvider);
  icoScheme = await ICOScheme.at(daoSchemeAddress);

  console.log("A5");

    // Gets the user reputation and the total reputation supply
  //var userAccount = "0xb0c908140fe6fd6fbd4990a5c2e35ca6dc12bfb2"; //web3.eth.accounts[0];
  //userRep = await getUserReputation(userAccount);
  //totalRep = web3.fromWei(await daicoDAO.reputation.getTotalSupply());

  // $("#userRep").text(
  //   "Your Reputation: " + userRep + " rep (" + (userRep / totalRep) * 100 + "%)"
  // );
}

$(window).on("load", function() {
  initialize();
});


// (async () => {
//   await initialize();
// })();
