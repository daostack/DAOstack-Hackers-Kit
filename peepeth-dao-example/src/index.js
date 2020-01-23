import {
  Arc,
  DAO,
  IProposalOutcome,
  Input,
} from "@daostack/client";

// Import the JSON file of our PeepScheme
const peepSchemeArtifacts = require("../build/contracts/PeepScheme.json");
// Import truffle-contract, which we use to interact with non-ArcJS contracts

// Initializes the PeepScheme as a contract
// This is not a specific instance but the contract object which can be later initialized
let PeepScheme = contract(peepSchemeArtifacts);

// Default Avatar and Voting Machine addresses when using Ganache cli.
// TODO: Paste here your own instances addresses which can be found in the logs at the end of the migration script.
const avatarAddress = "0xf81588ecd485cba1e7d27ae149f56767f8a07e30";
const votingMachineAddress = "0x9de9beb3518afe870e6585f7890751bbabc3c02c";

const IPFS = require("ipfs-mini");
const ipfs = new IPFS({
  host: "ipfs.infura.io",
  port: 5001,
  protocol: "https"
});

var peepDAO;
var peepScheme;
var votingMachine;
var userRep;
var totalRep;

function getPeepProposalsList() {
  // clear the existing list
  $("#peepProposalList li").remove();

function upvotePeep(proposalId) {
  // Votes in favor of a proposal using the Absolute Voting Machine
  votingMachine
    .vote({ proposalId: proposalId, vote: BinaryVoteResult.Yes })
    .then(getPeepProposalsList);
}

function downvotePeep(proposalId) {
  // Votes against a proposal using the Absolute Voting Machine
  votingMachine
    .vote({ proposalId: proposalId, vote: BinaryVoteResult.No })
    .then(getPeepProposalsList());
}

async function getUserReputation(account) {
  // Gets a list of the DAO participants with their reputation
  // Here we filter the list to get only the user account
  var participants = await peepDAO.getParticipants({
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

function proposeNewPeep() {
// Call our initialize method when the window is loaded
$(window).on("load", function() {
  initialize();
});
