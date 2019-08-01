import { Address, BigDecimal, BigInt, Bytes, crypto, ipfs, json, JSONValueKind, store } from '@graphprotocol/graph-ts';
import { GenesisProtocol } from '../types/GenesisProtocol/GenesisProtocol';
import { ControllerScheme, GenesisProtocolParam, Proposal } from '../types/schema';
import { concat, equalsBytes, equalStrings } from '../utils';
import { getDAO } from './dao';
import { updateThreshold } from './gpqueue';
import { getReputation } from './reputation';

export function parseOutcome(num: BigInt): string {
  if (num.toI32() === 1) {
    // Yes
    return 'Pass';
  } else {
    // No
    return 'Fail';
  }
}

export function getProposal(id: string): Proposal {
  let proposal = store.get('Proposal', id) as Proposal;
  if (proposal == null) {
    proposal = new Proposal(id);

    proposal.stage = 'Queued';
    proposal.executionState = 'None';

    proposal.votesFor = BigInt.fromI32(0);
    proposal.votesAgainst = BigInt.fromI32(0);
    proposal.winningOutcome = 'Fail';

    proposal.stakesFor = BigInt.fromI32(0);
    proposal.stakesAgainst = BigInt.fromI32(0);
    proposal.confidence = BigDecimal.fromString('0');
    proposal.confidenceThreshold = BigInt.fromI32(0);
    proposal.accountsWithUnclaimedRewards = new Array<Bytes>();
    proposal.paramsHash = new Bytes(32);
    proposal.organizationId = null;
    proposal.scheme = null;
    proposal.descriptionHash = '';
    proposal.title = '';
  }

  getProposalIPFSData(proposal);

  return proposal;
}

export function getProposalIPFSData(proposal: Proposal): Proposal {
    // IPFS reading
    if (!equalStrings(proposal.descriptionHash, '') && equalStrings(proposal.title, '')) {
      let ipfsData = ipfs.cat('/ipfs/' + proposal.descriptionHash);
      if (ipfsData != null && ipfsData.toString() !== '{}') {
        let descJson = json.fromBytes(ipfsData as Bytes);
        if (descJson.kind !== JSONValueKind.OBJECT) {
          return proposal;
        }
        if (descJson.toObject().get('title') != null) {
          proposal.title = descJson.toObject().get('title').toString();
        }
        if (descJson.toObject().get('description') != null) {
          proposal.description = descJson.toObject().get('description').toString();
        }
        if (descJson.toObject().get('url') != null) {
          proposal.url = descJson.toObject().get('url').toString();
        }
      }
    }
    return proposal;
}

export function saveProposal(proposal: Proposal): void {
  store.set('Proposal', proposal.id, proposal);
}

export function updateProposalAfterVote(
  proposal: Proposal,
  gpAddress: Address,
  proposalId: Bytes,
): void {
  let gp = GenesisProtocol.bind(gpAddress);
  let gpProposal = gp.proposals(proposalId);
  let prevOutcome = proposal.winningOutcome;
  proposal.votingMachine = gpAddress;
  // proposal.winningVote
  proposal.winningOutcome = parseOutcome(gpProposal.value3);
  if ((gpProposal.value2 === 6) && !equalStrings(proposal.winningOutcome, prevOutcome)) {
    setProposalState(proposal, 6, gp.getProposalTimes(proposalId));
  }
}

export function updateProposalconfidence(id: Bytes, confidence: BigInt): void {
   let proposal = getProposal(id.toHex());
   proposal.confidenceThreshold = confidence;
   saveProposal(proposal);
}

export function updateProposalState(id: Bytes, state: number, gpAddress: Address): void {
   let gp = GenesisProtocol.bind(gpAddress);
   let proposal = getProposal(id.toHex());
   updateThreshold(proposal.dao.toString(),
                    gpAddress,
                    gp.threshold(proposal.paramsHash, proposal.organizationId),
                    proposal.organizationId,
                    proposal.scheme,
                    );
   setProposalState(proposal, state, gp.getProposalTimes(id));
   if (state === 4) {
     proposal.confidenceThreshold = gp.proposals(id).value10;
   }
   saveProposal(proposal);
}

export function setProposalState(proposal: Proposal, state: number, gpTimes: BigInt[]): void {
  // enum ProposalState { None, ExpiredInQueue, Executed, Queued, PreBoosted, Boosted, QuietEndingPeriod}
  if (state === 1) {
    // Closed
    proposal.stage = 'ExpiredInQueue';
  } else if (state === 2) {
    // Executed
    proposal.stage = 'Executed';
  } else if (state === 3) {
    // Queued
    proposal.stage = 'Queued';
    proposal.closingAt =  proposal.createdAt +
                          GenesisProtocolParam.load(proposal.genesisProtocolParams).queuedVotePeriodLimit;
  } else if (state === 4) {
    // PreBoosted
    proposal.stage = 'PreBoosted';
    proposal.preBoostedAt = gpTimes[2];
    proposal.closingAt =  proposal.preBoostedAt +
                          GenesisProtocolParam.load(proposal.genesisProtocolParams).preBoostedVotePeriodLimit;
  } else if (state === 5) {
    // Boosted
    proposal.boostedAt = gpTimes[1];
    proposal.stage = 'Boosted';
    proposal.closingAt =  proposal.boostedAt +
                          GenesisProtocolParam.load(proposal.genesisProtocolParams).boostedVotePeriodLimit;

  } else if (state === 6) {
    // QuietEndingPeriod
    proposal.quietEndingPeriodBeganAt = gpTimes[1];
    proposal.closingAt =  proposal.quietEndingPeriodBeganAt +
                          GenesisProtocolParam.load(proposal.genesisProtocolParams).quietEndingPeriod;
    proposal.stage = 'QuietEndingPeriod';
  }
}

export function updateGPProposal(
  gpAddress: Address,
  proposalId: Bytes,
  proposer: Address,
  avatarAddress: Address,
  paramsHash: Bytes,
  timestamp: BigInt,
): void {
  let gp = GenesisProtocol.bind(gpAddress);
  let proposal = getProposal(proposalId.toHex());
  proposal.proposer = proposer;
  proposal.dao = avatarAddress.toHex();
  let params = gp.parameters(paramsHash);
  let gpProposal = gp.proposals(proposalId);

  proposal.votingMachine = gpAddress;
  proposal.stakesAgainst = gp.voteStake(proposalId, BigInt.fromI32(2));
  proposal.confidenceThreshold = gpProposal.value10;
  proposal.paramsHash = paramsHash;
  proposal.organizationId = gpProposal.value0;
  proposal.expiresInQueueAt = timestamp.plus(params.value1);
  proposal.createdAt = timestamp;
  proposal.scheme = crypto.keccak256(concat(avatarAddress, gpProposal.value1)).toHex();

  proposal.genesisProtocolParams = paramsHash.toHex();

  updateThreshold(
    proposal.dao.toString(),
    gpAddress,
    gp.threshold(proposal.paramsHash, proposal.organizationId),
    proposal.organizationId,
    proposal.scheme,
  );
  proposal.gpQueue = proposal.organizationId.toHex();
  let scheme = ControllerScheme.load(proposal.scheme);
  if (scheme.gpQueue == null) {
    scheme.gpQueue = proposal.organizationId.toHex();
    scheme.save();
  }

  let dao = getDAO(avatarAddress.toHex());
  let reputation = getReputation(dao.nativeReputation);
  proposal.totalRepWhenCreated = reputation.totalSupply;
  proposal.closingAt =  proposal.createdAt +
                        GenesisProtocolParam.load(proposal.genesisProtocolParams).queuedVotePeriodLimit;

  saveProposal(proposal);
}

export function updateCRProposal(
  proposalId: Bytes,
  createdAt: BigInt,
  avatarAddress: Address,
  votingMachine: Address,
  descriptionHash: string,
  beneficiary: Address,
  schemeAddress: Address,
): void {
  let proposal = getProposal(proposalId.toHex());
  proposal.dao = avatarAddress.toHex();
  proposal.contributionReward = proposalId.toHex();
  proposal.createdAt = createdAt;
  proposal.votingMachine = votingMachine;
  proposal.descriptionHash = descriptionHash;
  proposal.scheme = crypto.keccak256(concat(avatarAddress, schemeAddress)).toHex();
  getProposalIPFSData(proposal);
  saveProposal(proposal);
}

export function updateGSProposal(
  proposalId: Bytes,
  createdAt: BigInt,
  avatarAddress: Address,
  descriptionHash: string,
  schemeAddress: Address,
): void {
  let proposal = getProposal(proposalId.toHex());
  proposal.dao = avatarAddress.toHex();
  proposal.genericScheme = proposalId.toHex();
  proposal.createdAt = createdAt;
  proposal.descriptionHash = descriptionHash;
  proposal.scheme = crypto.keccak256(concat(avatarAddress, schemeAddress)).toHex();
  getProposalIPFSData(proposal);

  saveProposal(proposal);
}

export function updateSRProposal(
  proposalId: string,
  createdAt: BigInt,
  avatarAddress: Address,
  votingMachine: Address,
  descriptionHash: string,
  schemeAddress: Address,
): void {
  let proposal = getProposal(proposalId);
  proposal.dao = avatarAddress.toHex();
  proposal.schemeRegistrar = proposalId;
  proposal.createdAt = createdAt;
  proposal.votingMachine = votingMachine;
  proposal.descriptionHash = descriptionHash;
  proposal.scheme = crypto.keccak256(concat(avatarAddress, schemeAddress)).toHex();
  getProposalIPFSData(proposal);

  saveProposal(proposal);
}

export function updateProposalExecution(
  proposalId: Bytes,
  totalReputation: BigInt,
  timestamp: BigInt,
): void {
  let proposal = getProposal(proposalId.toHex());
  proposal.executedAt = timestamp;
  proposal.closingAt = timestamp;
  if (totalReputation != null) {
    proposal.totalRepWhenExecuted = totalReputation;
  }
  saveProposal(proposal);
}

export function updateProposalExecutionState(id: string, executionState: number): void {
  let proposal = getProposal(id);
  // enum ExecutionState { None, QueueBarCrossed, QueueTimeOut, PreBoostedBarCrossed, BoostedTimeOut, BoostedBarCrossed}
  if (executionState === 1) {
    proposal.executionState = 'QueueBarCrossed';
  } else if (executionState === 2) {
    proposal.executionState = 'QueueTimeOut';
  } else if (executionState === 3) {
    proposal.executionState = 'PreBoostedBarCrossed';
  } else if (executionState === 4) {
    proposal.executionState = 'BoostedTimeOut';
  } else if (executionState === 5) {
    proposal.executionState = 'BoostedBarCrossed';
  }
  saveProposal(proposal);
}

export function addRedeemableRewardOwner(
  proposal: Proposal,
  redeemer: Bytes,
): Proposal {
  let accounts = proposal.accountsWithUnclaimedRewards;
  accounts.push(redeemer);
  proposal.accountsWithUnclaimedRewards = accounts;
  return proposal;
}

export function removeRedeemableRewardOwner(
  proposalId: Bytes,
  redeemer: Bytes,
): void {
  let proposal = getProposal(proposalId.toHex());
  let accounts: Bytes[] = proposal.accountsWithUnclaimedRewards as Bytes[];
  let idx = 0;
  for (idx; idx < accounts.length; idx++) {
      if (equalsBytes(accounts[idx], redeemer)) {
        break;
      }
  }
  if (idx !== accounts.length) {
    accounts.splice(idx, 1);
    proposal.accountsWithUnclaimedRewards = accounts;
    saveProposal(proposal);
  }
}
