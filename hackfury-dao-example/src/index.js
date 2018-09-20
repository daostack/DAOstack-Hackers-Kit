import {
  InitializeArcJs,
  LoggingService,
  LogLevel,
  DAO,
  ConfigService,
  AccountService,
  WrapperService
} from "@daostack/arc.js";

// Import the JSON file of our PeepScheme
const hackfurySchemeArtifacts = require("../build/contracts/Hackfury.json");
// Import truffle-contract, which we use to interact with non-ArcJS contracts
const contract = require("truffle-contract");

// Initializes the PeepScheme as a contract
// This is not a specific instance but the contract object which can be later initialized
let HackfuryScheme = contract(hackfurySchemeArtifacts);

// Default Avatar address when using Ganache cli.
// TODO: Paste here your own instance addresse which can be found in the logs at the end of the migration script.
const avatarAddress = "0xf81588ecd485cba1e7d27ae149f56767f8a07e30"; // "0x1dd9ad7f0d28aca9cc4cd1fecc44acf7c5bf5075";

var hackfuryDAO;
var hackfuryScheme;

async function initialize() {
  // Initialize the ArcJS library
  ConfigService.set("estimateGas", true);
  ConfigService.set("txDepthRequiredForConfirmation.kovan", 0);

  // TODO: If you use Kovan uncomment this line
  ConfigService.set("network", "kovan"); // Set the network used to Kovan

  await InitializeArcJs({
    watchForAccountChanges: true,
    filter: {
      // If you want to use only specific Arc contracts list them here
      DaoCreator: true,
      ControllerCreator: true,
      Avatar: true,
      Controller: true
    }
  });

  LoggingService.logLevel = LogLevel.all; // Remove or modify to change ArcJS logging

  AccountService.subscribeToAccountChanges(() => {
    window.location.reload();
  });
}

async function go() {
  hackfuryDAO = await DAO.at(avatarAddress);

  const daoSchemes = await hackfuryDAO.getSchemes(); // Returns all the schemes your DAO is registered to
  const hackfurySchemeAddress = daoSchemes[0].address; // Since our DAO has only 1 scheme it will be the first one

  HackfuryScheme.setProvider(web3.currentProvider); // Sets the Web3 Provider for a non-ArcJS contract
  hackfuryScheme = await HackfuryScheme.at(hackfurySchemeAddress); // Initializes a PeepScheme instance with our deployed scheme address

  var userAccount = web3.eth.accounts[0];

  // setup frontend
  // Get the user auditor username
  var auditorUsername = await hackfuryScheme.auditors.call(userAccount);

  if (auditorUsername != "") {
    $("#auditorUsername").text("Welcome " + auditorUsername);

    $("#registration").css("display", "none");

    $("#account").css("display", "block");

    $("#newAuditReport").click(submitReport);
    $("#auditorTip").click(auditorTip);
    $("#customerSign").click(customerSign);
    $("#auditorClaim").click(auditorClaim);
    $("#displayAccountReputation").click(displayAccountReputation);
  } else {
    $("#registration").css("display", "block");
    $("#newAuditorButton").click(registerAuditor);
  }
}

async function getUserReputation(account) {
  // Gets a list of the DAO participants with their reputation
  // Here we filter the list to get only the user account
  var participants = await hackfuryDAO.getParticipants({
    participantAddress: account,
    returnReputations: true
  });

  // If the user is part of the DAO return its reputation
  if (participants.length > 0) {
    return web3.fromWei(participants[0].reputation);
  }

  // If the user has no reputation in the DAO return 0
  return 0;
}

function registerAuditor() {
  // Get the proposal content and clears the text from the UI
  var auditorName = $("#newAuditorName").val();
  $("#newAuditorName").val("");

  hackfuryScheme
    .registerAsAuditor(auditorName, {
      gas: 300000 // Gas used by the transaction (including some safe margin)
    })
    .then(function(result) {
      // Display the auditors' UI
      // Please note that on non-local networks this would be updated faster than the transaction will be included in a block
      // To see changes there you'll need to add logic to wait for confirmation or manually refresh the page when the transaction is included

      // code to setup reloader
      console.log(result);

      hackfuryScheme.auditors.call(userAccount).then(function(auditorUsername) {
        if (auditorUsername != "") {
          $("#auditorUsername").text("Welcome " + auditorUsername);
        }
      });

      $("#registration").css("display", "none");

      $("#account").css("display", "block");
      $("#userInfo").css("display", "block");

      $("#newAuditReport").click(submitReport);

      $("#auditorTip").click(auditorTip);
      $("#customerSign").click(customerSign);

      console.log(hackfuryScheme.auditors);
    })
    .catch(console.log);
}

function submitReport() {
  var customerAddress = web3.toBigNumber($("#customerAddress").val());
  var reportURL = $("#reportURL").val();
  var codeVersion = $("#codeVersion").val();
  var reportHashsum = $("#reportHashsum").val();
  var auditPassed = false;
  $("#customerAddress").val("");
  $("#reportURL").val("");
  $("#codeVersion").val("");
  $("#reportHashsum").val("");

  var amountToStake = web3.toWei(0.001001, "ether");
  console.log("Trying to send", amountToStake, "wei");
  hackfuryScheme
    .submitReport(
      customerAddress,
      reportURL,
      codeVersion,
      reportHashsum,
      auditPassed,
      {
        gas: 300000,
        value: amountToStake
      }
    )
    .then(function(result) {
      console.log(result);
    })
    .catch(console.log);
}

function auditorTip() {
  var auditorAddress = web3.toBigNumber($("#auditorAddress").val());
  var tipAmount = parseInt($("#tipAmount").val());
  console.log("Trying to tip", tipAmount, "reputation");
  hackfuryScheme
    .tipAuditorWithReputation(avatarAddress, auditorAddress, tipAmount, {
      gas: 300000
    })
    .then(function(result) {
      console.log(result);
    })
    .catch(console.log);
}

function customerSign() {
  var reportId = parseInt($("#reportSignId").val());
  console.log("Trying to sign report id = ", reportId);
  hackfuryScheme
    .confirmReport(reportId, {
      gas: 300000
    })
    .then(function(result) {
      console.log(result);
    })
    .catch(console.log);
}

function auditorClaim() {
  var reportId = parseInt($("#reportClaimId").val());
  console.log("Trying to get ETH from report id = ", reportId);
  hackfuryScheme
    .claimEnd(web3.toBigNumber(avatarAddress), reportId, {
      gas: 300000
    })
    .then(function(result) {
      console.log(result);
    })
    .catch(console.log);
}

function displayAccountReputation() {
  var accountAddress = web3.toBigNumber($("#accountAddress").val());
  hackfuryScheme.getReputationByAddress
    .call(avatarAddress, accountAddress)
    .then(function(result) {
      $("#accountReputation").text(result["c"][0] / 10000);
    })
    .catch(console.log);
}

// Call our initialize method when the window is loaded
$(window).on("load", function() {
  initialize();
  go();
});

// TODO: Create a form to blame hack
