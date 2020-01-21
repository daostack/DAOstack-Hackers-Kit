import { Address, BigInt, crypto, store } from '@graphprotocol/graph-ts';
import { ProposalVote } from '../types/schema';
import { addVoteEvent } from './event';

export function getVote(id: string): ProposalVote {
  let vote = store.get('ProposalVote', id) as ProposalVote;
  if (vote == null) {
    vote = new ProposalVote(id);
  }
  return vote;
}

export function saveVote(vote: ProposalVote): void {
  store.set('ProposalVote', vote.id, vote);
}

export function insertVote(
  eventId: string,
  timestamp: BigInt,
  voter: Address,
  proposalId: string,
  daoId: string,
  outcome: string,
  reputation: BigInt,
): void {
  let vote = getVote(eventId);
  vote.createdAt = timestamp;
  vote.voter = voter;
  vote.reputation = reputation;
  vote.proposal = proposalId;
  vote.dao = daoId;
  vote.outcome = outcome;
  saveVote(vote);

  addVoteEvent(eventId, proposalId, outcome, reputation, voter, daoId, timestamp);
}
