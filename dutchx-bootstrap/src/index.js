import {
  InitializeArcJs,
  LoggingService,
  LogLevel,
  ConfigService,
  AccountService,
  Utils
} from "@daostack/arc.js";

// CONSTANTS:
const externalLocking4ReputationSchemeAddress = "SHCEME_ADDRESS";
const lockingEth4ReputationAddress = "SHCEME_ADDRESS";
const lockingToken4ReputationAddress = "SHCEME_ADDRESS";
const standardTokenAddress = "TOKEN_ADDRESS";
const genTokenAddress = "GEN_TOKEN_ADDRESS";
const auction4ReputationAddress = "SHCEME_ADDRESS";
const fixReputationAllocationAddress = "SHCEME_ADDRESS";

var externalLocking4ReputationScheme;
var lockingEth4Reputation;
var lockingToken4Reputation;
var standardToken;
var auction4Reputation;
var genToken;
var fixReputationAllocation;

var userAccount;

async function initialize() {
  await InitializeArcJs({
    watchForAccountChanges: true
    /*
    Edit this to filter imported contracts
    , filter: {
      
    }
    */
  });

  ConfigService.set("estimateGas", true);
  ConfigService.set("txDepthRequiredForConfirmation", {
    kovan: 0,
    live: 0
  });

  LoggingService.logLevel = LogLevel.all;

  AccountService.subscribeToAccountChanges(() => {
    userAccount = web3.eth.accounts[0];
  });

  userAccount = web3.eth.accounts[0];

  var ExternalLocking4ReputationScheme = await Utils.requireContract(
    "ExternalLocking4Reputation"
  );

  var LockingEth4Reputation = await Utils.requireContract(
    "LockingEth4Reputation"
  );

  var LockingToken4Reputation = await Utils.requireContract(
    "LockingToken4Reputation"
  );

  var StandardToken = await Utils.requireContract("StandardToken");

  var Auction4Reputation = await Utils.requireContract("Auction4Reputation");

  var FixReputationAllocation = await Utils.requireContract(
    "FixReputationAllocation"
  );

  externalLocking4ReputationScheme = await ExternalLocking4ReputationScheme.at(
    externalLocking4ReputationSchemeAddress
  );

  lockingEth4Reputation = await LockingEth4Reputation.at(
    lockingEth4ReputationAddress
  );

  lockingToken4Reputation = await LockingToken4Reputation.at(
    lockingToken4ReputationAddress
  );

  standardToken = await StandardToken.at(standardTokenAddress);

  auction4Reputation = await Auction4Reputation.at(auction4ReputationAddress);

  genToken = await StandardToken.at(genTokenAddress);

  fixReputationAllocation = await FixReputationAllocation.at(
    fixReputationAllocationAddress
  );

  $("#elfrLockButton").click(async function() {
    await elfrLock();
  });

  $("#elfrRedeemButton").click(async function() {
    await elfrRedeem();
  });

  $("#lefrLockButton").click(async function() {
    await lefrLock();
  });

  $("#lefrReleaseButton").click(async function() {
    await lefrRelease();
  });

  $("#lefrRedeemButton").click(async function() {
    await lefrRedeem();
  });

  $("#ltfrApproveTokenButton").click(async function() {
    await ltfrApproveToken();
  });

  $("#ltfrLockButton").click(async function() {
    await ltfrLock();
  });

  $("#ltfrReleaseButton").click(async function() {
    await ltfrRelease();
  });

  $("#ltfrRedeemButton").click(async function() {
    await ltfrRedeem();
  });

  $("#auctionApproveTokenButton").click(async function() {
    await auctionApproveToken();
  });

  $("#auctionBidButton").click(async function() {
    await auctionBid();
  });

  $("#auctionRedeemButton").click(async function() {
    await auctionRedeem();
  });

  $("#fixRepRedeemButton").click(async function() {
    await fixRepRedeem();
  });
}

async function elfrLock() {
  var lockEvent = externalLocking4ReputationScheme.Lock({
    _locker: userAccount
  });

  lockEvent.watch(function(error, result) {
    console.log(result);
    alert("Locking Id: " + result.args._lockingId);
    lockEvent.stopWatching();
  });

  await externalLocking4ReputationScheme.lock();
}

async function elfrRedeem() {
  console.log(
    await externalLocking4ReputationScheme.redeem($("#elfrBeneficiary").val())
  );
}

async function lefrLock() {
  var lockEvent = lockingEth4Reputation.Lock({
    _locker: userAccount
  });

  lockEvent.watch(function(error, result) {
    console.log(result);
    alert("Locking Id: " + result.args._lockingId);
    lockEvent.stopWatching();
  });

  await lockingEth4Reputation.lock($("#lefrPeriod").val(), {
    value: web3.utils.toWei($("#lefrAmount").val(), "ether")
  });
}

async function lefrRelease() {
  console.log(
    await lockingEth4Reputation.release(
      $("#lefrBeneficiary").val(),
      $("#lefrLockingId").val()
    )
  );
}

async function lefrRedeem() {
  console.log(await lockingEth4Reputation.redeem($("#lefrBeneficiary").val()));
}

async function ltfrApproveToken() {
  console.log(
    await standardToken.approve(
      lockingToken4Reputation.address,
      web3.utils.toWei($("#ltfrAmount").val(), "ether")
    )
  );
}

async function ltfrLock() {
  var lockEvent = lockingToken4Reputation.Lock({
    _locker: userAccount
  });

  lockEvent.watch(function(error, result) {
    console.log(result);
    alert("Locking Id: " + result.args._lockingId);
    lockEvent.stopWatching();
  });

  await lockingToken4Reputation.lock(
    web3.utils.toWei($("#ltfrAmount").val(), "ether"),
    $("#ltfrPeriod").val()
  );
}

async function ltfrRelease() {
  console.log(
    await lockingToken4Reputation.release(
      $("#ltfrBeneficiary").val(),
      $("#ltfrLockingId").val()
    )
  );
}

async function ltfrRedeem() {
  console.log(
    await lockingToken4Reputation.redeem($("#ltfrBeneficiary").val())
  );
}

async function auctionApproveToken() {
  var approvalEvent = genToken.Approval({
    _owner: userAccount,
    _spender: auction4ReputationAddress
  });

  approvalEvent.watch(function(error, result) {
    console.log(result);
    alert("Token Amount Approved: " + result.args._value);
    approvalEvent.stopWatching();
  });

  await genToken.approve(
    auction4ReputationAddress,
    web3.utils.toWei($("#auctionAmount").val(), "ether")
  );
}

async function auctionBid() {
  var bidEvent = auction4Reputation.Bid({
    _bidder: userAccount
  });

  bidEvent.watch(function(error, result) {
    console.log(result);
    alert("Auction Id: " + result.args._auctionId);
    bidEvent.stopWatching();
  });

  await auction4Reputation.bid(
    web3.utils.toWei($("#auctionAmount").val(), "ether")
  );
}

async function auctionRedeem() {
  console.log(
    await auction4Reputation.redeem(
      $("#auctionBeneficiary").val(),
      $("#auctionAuctionId").val()
    )
  );
}

async function fixRepRedeem() {
  console.log(
    await fixReputationAllocation.redeem($("#fixRepBeneficiary").val())
  );
}

(async () => {
  await initialize();
})();
