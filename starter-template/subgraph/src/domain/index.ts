import { Address, BigDecimal, BigInt, Bytes, Entity, store, Value} from '@graphprotocol/graph-ts';
import {  setContractsInfo } from '../contractsInfo';
import {
  NewContributionProposal,
  ProposalExecuted,
} from '../types/ContributionReward/ContributionReward';
import { Transfer } from '../types/DAOToken/DAOToken';
import { NewCallProposal } from '../types/GenericScheme/GenericScheme';
import {
  ExecuteProposal,
  GenesisProtocol,
  GPExecuteProposal,
  Stake,
  StateChange,
  VoteProposal,
} from '../types/GenesisProtocol/GenesisProtocol';
import { Burn, Mint } from '../types/Reputation/Reputation';
import { GenesisProtocolProposal, Proposal, ReputationContract, ReputationHolder } from '../types/schema';
import { equalsBytes, equalStrings, eventId, hexToAddress } from '../utils';
import * as daoModule from './dao';
import * as gpqueueModule from './gpqueue';
import {
  getProposal,
  parseOutcome,
  saveProposal,
  updateCRProposal,
  updateGPProposal,
  updateGSProposal,
  updateProposalAfterVote,
  updateProposalconfidence,
  updateProposalExecution,
  updateProposalExecutionState,
  updateProposalState,
  updateSRProposal,
} from './proposal';
import {
  getReputation,
  insertReputation,
  updateReputationTotalSupply,
} from './reputation';
import {
  daoBountyRedemption,
  insertGPRewards,
  insertGPRewardsToHelper ,
  reputationRedemption ,
  tokenRedemption,
} from './reward';
import { insertStake } from './stake';
import { getToken, insertToken, updateTokenTotalSupply } from './token';
import { insertVote } from './vote';

function isProposalValid(proposalId: string ): boolean {
  let p = Proposal.load(proposalId);
  return  ((p != null) && (equalsBytes(p.paramsHash, new Bytes(32)) === false));
}

function handleGPProposalPrivate(proposalId: string): void {
   let gpProposal = GenesisProtocolProposal.load(proposalId);
   if (gpProposal != null) {
    updateGPProposal(
      gpProposal.address as Address,
      gpProposal.proposalId,
      gpProposal.proposer as Address,
      gpProposal.daoAvatarAddress as Address,
      gpProposal.paramsHash,
      gpProposal.submittedTime,
    );
    insertGPRewardsToHelper(gpProposal.proposalId, gpProposal.proposer as Address);
    updateProposalState(
      gpProposal.proposalId,
      3, // Queued
      gpProposal.address as Address,
    );
   }
}

export function handleNewContributionProposal(
  event: NewContributionProposal,
): void {
  if (!daoModule.exists(event.params._avatar)) {
    return;
  }
  handleGPProposalPrivate(event.params._proposalId.toHex());
  updateCRProposal(
    event.params._proposalId,
    event.block.timestamp,
    event.params._avatar,
    event.params._intVoteInterface,
    event.params._descriptionHash,
    event.params._beneficiary,
    event.address,
  );
}

export function handleNewSchemeRegisterProposal(
   proposalId: string,
   timestamp: BigInt,
   avatar: Bytes,
   votingMachine: Bytes,
   descriptionHash: string,
   schemeAddress: Address,
 ): void {
    if (!daoModule.exists(avatar as Address)) {
      return;
    }
    handleGPProposalPrivate(proposalId);
    updateSRProposal(
      proposalId,
      timestamp,
      avatar as Address,
      votingMachine as Address,
      descriptionHash,
      schemeAddress,
    );
 }

export function handleNewCallProposal(
  event: NewCallProposal,
): void {
  if (!daoModule.exists(event.params._avatar)) {
    return;
  }
  handleGPProposalPrivate(event.params._proposalId.toHex());
  updateGSProposal(
    event.params._proposalId,
    event.block.timestamp,
    event.params._avatar,
    event.params._descriptionHash,
    event.address,
  );
}

export function handleStake(event: Stake): void {
  let proposal = getProposal(event.params._proposalId.toHex());
  if (equalsBytes(proposal.paramsHash, new Bytes(32))) {
    return;
  }
  if (event.params._vote.toI32() ===  1) {
    proposal.stakesFor = proposal.stakesFor.plus(event.params._amount);
  } else {
    proposal.stakesAgainst = proposal.stakesAgainst.plus(event.params._amount);
  }
  proposal.confidence =  (new BigDecimal(proposal.stakesFor)) / (new BigDecimal(proposal.stakesAgainst));
  saveProposal(proposal);
  insertStake(
    eventId(event),
    event.block.timestamp,
    event.params._staker,
    event.params._amount,
    event.params._proposalId.toHex(),
    event.params._organization.toHex(),
    parseOutcome(event.params._vote),
  );
  insertGPRewardsToHelper(event.params._proposalId, event.params._staker);
}

export function handleVoteProposal(event: VoteProposal): void {
  let proposal = getProposal(event.params._proposalId.toHex());

  if (equalsBytes(proposal.paramsHash, new Bytes(32))) {
    return;
  }
  updateProposalAfterVote(proposal, event.address, event.params._proposalId);
  if (event.params._vote.toI32() === 1) {
    proposal.votesFor = proposal.votesFor.plus(event.params._reputation);
  } else {
    proposal.votesAgainst = proposal.votesAgainst.plus(
      event.params._reputation,
    );
  }
  saveProposal(proposal);
  insertVote(
    eventId(event),
    event.block.timestamp,
    event.params._voter,
    event.params._proposalId.toHex(),
    event.params._organization.toHex(),
    parseOutcome(event.params._vote),
    event.params._reputation,
  );
  insertGPRewardsToHelper(event.params._proposalId, event.params._voter);
}

export function handleProposalExecuted(event: ProposalExecuted): void {
  // this already handled at handleExecuteProposal
  // updateProposalExecution(event.params._proposalId, null, event.block.timestamp,event.address);
}

export function confidenceLevelUpdate(proposalId: Bytes, confidenceThreshold: BigInt): void {
  if (isProposalValid(proposalId.toHex())) {
      updateProposalconfidence(proposalId, confidenceThreshold);
  }
}

export function handleRegisterScheme(avatar: Address,
                                     nativeTokenAddress: Address,
                                     nativeReputationAddress: Address,
                                     scheme: Address ,
                                     paramsHash: Bytes ): void {
  // Detect the first register scheme event which indicates a new DAO
  let isFirstRegister = store.get(
    'FirstRegisterSchemeFlag',
    avatar.toHex(),
  );
  if (isFirstRegister == null) {
    setContractsInfo();
    let dao = daoModule.insertNewDAO(avatar, nativeTokenAddress , nativeReputationAddress);
    insertToken(hexToAddress(dao.nativeToken), avatar.toHex());
    insertReputation(
      hexToAddress(dao.nativeReputation),
      avatar.toHex(),
    );
    // the following code handle cases where the reputation and token minting are done before the dao creation
    // (e.g using daocreator)
    // get reputation contract
    let repContract = store.get('ReputationContract', dao.nativeReputation) as ReputationContract;
    let holders: string[] = repContract.reputationHolders as string[];
    for (let i = 0; i < holders.length; i++) {
      let reputationHolder = store.get('ReputationHolder', holders[i]) as ReputationHolder;
      addDaoMember(reputationHolder);
    }
    updateTokenTotalSupply(hexToAddress(dao.nativeToken));
    let ent = new Entity();
    ent.set('id', Value.fromString(avatar.toHex()));
    store.set('FirstRegisterSchemeFlag', avatar.toHex(), ent);
  }
  gpqueueModule.create(avatar, scheme, paramsHash);
}

export function handleMint(event: Mint): void {
  let rep = getReputation(event.address.toHex());
  if (rep.dao == null) {
    // reputation that's not attached to a DAO
    return;
  }
  updateReputationTotalSupply(event.address);
}

export function handleBurn(event: Burn): void {
  let dao = getReputation(event.address.toHex()).dao;
  if (dao == null) {
    // reputation that's not attached to a DAO
    return;
  }
  updateReputationTotalSupply(event.address);
}

export function handleNativeTokenTransfer(event: Transfer): void {
  let dao = getToken(event.address.toHex()).dao;
  if (dao == null) {
    // reputation that's not attached to a DAO
    return;
  }

  // updateMemberTokens(event.params.from, hexToAddress(dao));
  // updateMemberTokens(event.params.to, hexToAddress(dao));
  updateTokenTotalSupply(event.address);
}

export function handleExecuteProposal(event: ExecuteProposal): void {
   if (isProposalValid(event.params._proposalId.toHex())) {
       updateProposalExecution(event.params._proposalId, event.params._totalReputation, event.block.timestamp);
    }
}

export function handleStateChange(event: StateChange): void {
  if (isProposalValid(event.params._proposalId.toHex())) {
      updateProposalState(event.params._proposalId, event.params._proposalState, event.address);
      if ((event.params._proposalState === 1) ||
          (event.params._proposalState === 2)) {
          insertGPRewards(event.params._proposalId, event.block.timestamp, event.address, event.params._proposalState);
      }
  }
}

export function handleExecutionStateChange(event: GPExecuteProposal): void {
  if (isProposalValid(event.params._proposalId.toHex())) {
    updateProposalExecutionState(event.params._proposalId.toHex(), event.params._executionState);
  }
}

export function handleGPRedemption(proposalId: Bytes, beneficiary: Address , timestamp: BigInt , type: string): void {
   if (isProposalValid(proposalId.toHex())) {
       if (type === 'token') {
           tokenRedemption(proposalId, beneficiary, timestamp);
       } else if (type === 'reputation') {
           reputationRedemption(proposalId, beneficiary, timestamp);
       } else {
           daoBountyRedemption(proposalId, beneficiary, timestamp);
       }
    }
}

export function daoRegister(dao: Address, tag: string): void {
   daoModule.register(dao, tag);
}

export function addDaoMember(reputationHolder: ReputationHolder): void {
  let dao = getReputation(reputationHolder.contract.toHex()).dao;
  if (dao == null) {
    // reputation that's not attached to a DAO
    return;
  }
  if (reputationHolder.dao == null) {
    reputationHolder.dao = dao;
    reputationHolder.save();
  }
  daoModule.increaseDAOmembersCount(dao);
}

export function removeDaoMember(reputationHolder: ReputationHolder): void {
   let dao = getReputation(reputationHolder.contract.toHex()).dao;
   if (dao == null) {
     // reputation that's not attached to a DAO
     return;
   }
   daoModule.decreaseDAOmembersCount(dao);
}
