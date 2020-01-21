import {
  Address,
  BigInt,
  ByteArray,
  Bytes,
  crypto,
  EthereumValue,
  store,
} from '@graphprotocol/graph-ts';

import {
  ConfidenceLevelChange,
  ExecuteProposal,
  ExpirationCallBounty,
  GenesisProtocol,
  GPExecuteProposal,
  NewProposal,
  Redeem,
  RedeemDaoBounty,
  RedeemReputation,
  Stake,
  StateChange,
  VoteProposal,
} from '../../types/GenesisProtocol/GenesisProtocol';

import { concat, eventId } from '../../utils';

import {
  GenesisProtocolExecuteProposal,
  GenesisProtocolGPExecuteProposal,
  GenesisProtocolProposal,
  GenesisProtocolRedemption,
  GenesisProtocolReward,
  GenesisProtocolStake,
  GenesisProtocolVote,
} from '../../types/schema';

import * as domain from '../../domain';

export function handleNewProposal(event: NewProposal): void {
  let ent = new GenesisProtocolProposal(event.params._proposalId.toHex());
  ent.proposalId = event.params._proposalId;
  ent.submittedTime = event.block.timestamp;
  ent.proposer = event.params._proposer;
  ent.daoAvatarAddress = event.params._organization;
  ent.numOfChoices = event.params._numOfChoices;
  ent.address = event.address;
  ent.paramsHash = event.params._paramsHash;
  store.set('GenesisProtocolProposal', ent.id, ent);
}

export function handleVoteProposal(event: VoteProposal): void {
  domain.handleVoteProposal(event);
  let uniqueId = concat(event.params._proposalId, event.params._voter).toHex();
  let ent = new GenesisProtocolVote(uniqueId);

  let vote = store.get('GenesisProtocolVote', uniqueId) as GenesisProtocolVote;
  if (vote == null) {
    ent.avatarAddress = event.params._organization;
    ent.reputation = event.params._reputation;
    ent.voterAddress = event.params._voter;
    ent.voteOption = event.params._vote;
    ent.proposalId = event.params._proposalId.toHex();
  } else {
    // Is it possible someone will use 50% for one voteOption and rest for the other
    vote.reputation = vote.reputation.plus(event.params._reputation);
    store.set('GenesisProtocolVote', uniqueId, vote);
    return;
  }

  store.set('GenesisProtocolVote', uniqueId, ent);
}

export function handleStake(event: Stake): void {
  domain.handleStake(event);
  let uniqueId = concat(event.params._proposalId, event.params._staker).toHex();

  let ent = new GenesisProtocolStake(uniqueId);

  let stake = store.get(
    'GenesisProtocolStake',
    uniqueId,
  ) as GenesisProtocolStake;

  if (stake == null) {
    ent.avatarAddress = event.params._organization;
    ent.stakeAmount = event.params._amount;
    ent.stakerAddress = event.params._staker;
    ent.prediction = event.params._vote;
    ent.proposalId = event.params._proposalId.toHex();
  } else {
    // Is it possible someone will use 50% for one voteOption and rest for the other
    stake.stakeAmount = stake.stakeAmount.plus(event.params._amount);
    store.set('GenesisProtocolStake', uniqueId, stake);
    return;
  }

  let proposal = store.get(
    'GenesisProtocolProposal',
    event.params._proposalId.toHex(),
  ) as GenesisProtocolProposal;

  proposal.state = state(event.params._proposalId, event.address).toI32();

  store.set(
    'GenesisProtocolProposal',
    event.params._proposalId.toHex(),
    proposal,
  );

  store.set('GenesisProtocolStake', uniqueId, ent);
}

export function handleGPExecuteProposal(event: GPExecuteProposal): void {
  domain.handleExecutionStateChange(event);

  let proposal = store.get(
    'GenesisProtocolProposal',
    event.params._proposalId.toHex(),
  ) as GenesisProtocolProposal;
  // todo: figure out why reading uint8 event param does not work .
  // this is a workaround to by pass the auto generated getter.
  proposal.executionState = event.parameters[1].value.toBigInt().toI32();
  store.set(
    'GenesisProtocolProposal',
    event.params._proposalId.toHex(),
    proposal,
  );

  let genesisProtocolGPExecuteProposal = new GenesisProtocolGPExecuteProposal(eventId(event));
  genesisProtocolGPExecuteProposal.executionState = event.parameters[1].value
    .toBigInt()
    .toI32();
  genesisProtocolGPExecuteProposal.contract = event.address;
  genesisProtocolGPExecuteProposal.proposalId = event.params._proposalId;
  genesisProtocolGPExecuteProposal.txHash = event.transaction.hash;
  store.set(
    'GenesisProtocolGPExecuteProposal',
    genesisProtocolGPExecuteProposal.id,
    genesisProtocolGPExecuteProposal,
  );
}

export function handleExecuteProposal(event: ExecuteProposal): void {
  domain.handleExecuteProposal(event);

  let proposal = store.get(
    'GenesisProtocolProposal',
    event.params._proposalId.toHex(),
  ) as GenesisProtocolProposal;

  proposal.executionTime = event.block.timestamp;
  proposal.decision = event.params._decision;
  proposal.totalReputation = event.params._totalReputation;
  // todo:figure out why reading uint8 param does not work .
  // for now use a workaround.
  // https://github.com/graphprotocol/graph-node/issues/569
  proposal.state = state(event.params._proposalId, event.address).toI32();
  store.set(
    'GenesisProtocolProposal',
    event.params._proposalId.toHex(),
    proposal,
  );

  let genesisProtocolExecuteProposal = new GenesisProtocolExecuteProposal(eventId(event));
  genesisProtocolExecuteProposal.decision = event.params._decision;
  genesisProtocolExecuteProposal.contract = event.address;
  genesisProtocolExecuteProposal.organization = event.params._organization;
  genesisProtocolExecuteProposal.proposalId = event.params._proposalId;
  genesisProtocolExecuteProposal.totalReputation =
    event.params._totalReputation;
  genesisProtocolExecuteProposal.txHash = event.transaction.hash;
  store.set(
    'GenesisProtocolExecuteProposal',
    genesisProtocolExecuteProposal.id,
    genesisProtocolExecuteProposal,
  );
}

export function handleRedeem(event: Redeem): void {
  domain.handleGPRedemption(event.params._proposalId, event.params._beneficiary, event.block.timestamp, 'token');
  let rewardType = new Uint8Array(1);
  rewardType[0] = 5;
  updateRedemption(
    event.params._beneficiary,
    event.params._organization,
    event.params._amount,
    event.params._proposalId,
    rewardType as ByteArray,
    'gpGen',
  );
}

export function handleStateChange(event: StateChange): void {
  domain.handleStateChange(event);
}

export function handleExpirationCallBounty(event: ExpirationCallBounty): void {
  // todo
}

export function handleRedeemDaoBounty(event: RedeemDaoBounty): void {
  domain.handleGPRedemption(event.params._proposalId, event.params._beneficiary, event.block.timestamp, 'daobounty');
  let rewardType = new Uint8Array(1);
  rewardType[0] = 6;
  updateRedemption(
    event.params._beneficiary,
    event.params._organization,
    event.params._amount,
    event.params._proposalId,
    rewardType as ByteArray,
    'gpBounty',
  );
}

export function handleConfidenceLevelChange(event: ConfidenceLevelChange): void {
  domain.confidenceLevelUpdate(event.params._proposalId, event.params._confidenceThreshold);
}

export function handleRedeemReputation(event: RedeemReputation): void {
  domain.handleGPRedemption(event.params._proposalId, event.params._beneficiary, event.block.timestamp, 'reputation');
  let rewardType = new Uint8Array(1);
  rewardType[0] = 4;
  updateRedemption(
    event.params._beneficiary,
    event.params._organization,
    event.params._amount,
    event.params._proposalId,
    rewardType as ByteArray,
    'gpRep',
  );
}

function updateRedemption(
  beneficiary: Address,
  avatar: Address,
  amount: BigInt,
  proposalId: Bytes,
  rewardType: ByteArray,
  rewardString: string,
): void {
  let accountId = crypto.keccak256(concat(beneficiary, avatar));

  let rewardId = crypto.keccak256(concat(rewardType, amount as ByteArray));

  let uniqueId = crypto
    .keccak256(concat(proposalId, concat(accountId, rewardId)))
    .toHex();

  let redemption = store.get(
    'GenesisProtocolRedemption',
    uniqueId,
  ) as GenesisProtocolRedemption;
  if (redemption == null) {
    redemption = new GenesisProtocolRedemption(uniqueId);
    redemption.redeemer = beneficiary;
    redemption.proposalId = proposalId.toHex();
    redemption.rewardId = rewardId.toHex();
    store.set('GenesisProtocolRedemption', redemption.id, redemption);
  }

  let reward = store.get(
    'GenesisProtocolReward',
    rewardId.toHex(),
  ) as GenesisProtocolReward;
  if (reward == null) {
    reward = new GenesisProtocolReward(rewardId.toHex());
    reward.type = rewardString.toString();
    reward.amount = amount;

    store.set('GenesisProtocolReward', reward.id, reward);
  }
}

function state(proposalId: Bytes, address: Address): BigInt {
  let genesisProtocol = GenesisProtocol.bind(address);
  let result = genesisProtocol.call('state', [
    EthereumValue.fromFixedBytes(proposalId),
  ]);
  return result[0].toBigInt();
}
