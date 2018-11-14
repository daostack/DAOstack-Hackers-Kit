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
const avatarAddress = "0xf81588ecd485cba1e7d27ae149f56767f8a07e30";
const votingMachineAddress = "0x9de9beb3518afe870e6585f7890751bbabc3c02c";
var daicoDAO;
var icoScheme;

/*
Helper function for initializing ArcJS and your app.
*/
async function initialize() {
  await InitializeArcJs({
    watchForAccountChanges: true
    /*
    Edit this to filter imported contracts
    , filter: {
      
    }
    */
  });

  // These are some basic configurations, feel free to edit as you need.
  // Learn more about the Arc.js configurations here: https://daostack.github.io/arc.js/Configuration/

  ConfigService.set("estimateGas", true);
  ConfigService.set("txDepthRequiredForConfirmation", {kovan: 0, live: 0});
  AccountService.subscribeToAccountChanges(() => { window.location.reload(); });
  LoggingService.logLevel = LogLevel.all;

  daicoDAO = await DAO.at(avatarAddress);
  const daoSchemes = await daicoDAO.getSchemes();
  const daoSchemeAddress = daoSchemes[0].address; 

  $("#daoAddress").text("The DAO address is: " + avatarAddress);

  ICOScheme.setProvider(web3.currentProvider);
  icoScheme = await ICOScheme.at(daoSchemeAddress);

    // Gets the user reputation and the total reputation supply
  var userAccount = web3.eth.accounts[0];
  userRep = await getUserReputation(userAccount);
  totalRep = web3.fromWei(await daicoDAO.reputation.getTotalSupply());

  $("#userRep").text(
    "Your Reputation: " + userRep + " rep (" + (userRep / totalRep) * 100 + "%)"
  );
}

$(window).on("load", function() {
  initialize();
});


// (async () => {
//   await initialize();
// })();
