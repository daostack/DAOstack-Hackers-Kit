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

  // These are some basic configurations, feel free to edit as you need.
  // Learn more about the Arc.js configurations here: https://daostack.github.io/arc.js/Configuration/

  await web3.eth.getAccounts(function(err, res) { 
    accounts = res; 
  });

  ConfigService.set("estimateGas", true);
  ConfigService.set("txDepthRequiredForConfirmation", {kovan: 0});
  AccountService.subscribeToAccountChanges(() => { window.location.reload(); });

  daicoDAO = await DAO.at(avatarAddress);
  const daoSchemeAddress = "0xb09bCc172050fBd4562da8b229Cf3E45Dc3045A6"; 

  $("#daoAddress").text("The DAO address is: " + avatarAddress);
  $("#donateButton").click(donateFunction);
  $("#redeemButton").click(redeemFunction);

  ICOScheme.setProvider(web3.currentProvider);
  console.log(daoSchemeAddress);
  icoScheme = await ICOScheme.at(daoSchemeAddress);
}

//configure function either to ask user to enter their ETH and amount in the fields or load MetaMask
async function donateFunction() {
  console.log("donateFunction");
  var active = await icoScheme.isActive();
  if (active == true) {
    console.log("redeemFunction enabled");
    $('#redeemButton').removeAttr('disabled');
    web3.eth.defaultAccount = web3.eth.accounts[0]
    await web3.personal.unlockAccount(web3.eth.defaultAccount, async function(err, res) { 
      var donation = await icoScheme.donate($("#ethAdddress").val());
    })
  }
}

async function redeemFunction() {
  console.log("redeemFunction");
  var redeem = await icoScheme.redeemReputation(accounts[0]);
}


$(window).on("load", function() {
  initialize();
});
