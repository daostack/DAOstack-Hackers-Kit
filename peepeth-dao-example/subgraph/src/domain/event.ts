import { Address, BigInt, ByteArray, Bytes, crypto } from '@graphprotocol/graph-ts';
import { Event, Proposal, ReputationHolder } from '../types/schema';
import { concat, fixJsonQuotes} from '../utils';

export function addNewDAOEvent(avatar: Address, daoName: string, timestamp: BigInt): void {
    addEvent(
        'NewDAO',
        avatar.toHex(),
        '{ "name": "' + fixJsonQuotes(daoName) + '" }',
        null,
        null,
        avatar.toHex(),
        timestamp,
    );
}

export function addProposalStateChangeEvent(proposalId: Bytes, user: Address, timestamp: BigInt): void {
    let proposal = Proposal.load(proposalId.toHex());
    addEvent(
        'ProposalStageChange',
        crypto.keccak256(concat(proposalId, timestamp as ByteArray)).toHex(),
        '{ "stage": "' + proposal.stage + '" }',
        proposalId.toHex(),
        user,
        proposal.dao,
        timestamp,
    );
}

export function addNewReputationHolderEvent(reputationHolder: ReputationHolder): void {
    addEvent(
        'NewReputationHolder',
        crypto.keccak256(concat(reputationHolder.address, reputationHolder.createdAt as ByteArray)).toHex(),
        '{ "reputationAmount": "' + reputationHolder.balance.toString() + '" }',
        null,
        reputationHolder.address,
        reputationHolder.dao,
        reputationHolder.createdAt,
    );
}

export function addVoteFlipEvent(proposalId: Bytes, proposal: Proposal, voter: Address, timestamp: BigInt): void {
    addEvent(
        'VoteFlip',
        crypto.keccak256(
            concat(concat(proposalId, proposal.votesFor as ByteArray), proposal.votesAgainst as ByteArray),
            ).toHex(),
        '{ "outcome": "' + proposal.winningOutcome + '", "votesFor": "' + proposal.votesFor.toString() + '", "votesAgainst": "' + proposal.votesAgainst.toString() + '" }',
        proposalId.toHex(),
        voter,
        proposal.dao,
        timestamp,
    );
}

export function addNewProposalEvent(proposalId: Bytes, proposal: Proposal, timestamp: BigInt): void {
    addEvent(
        'NewProposal',
        crypto.keccak256(concat(proposalId, timestamp as ByteArray)).toHex(),
        '{ "title": "' + fixJsonQuotes(proposal.title) + '" }',
        proposalId.toHex(),
        proposal.proposer,
        proposal.dao,
        timestamp,
    );
}

export function addStakeEvent(
    eventId: string,
    proposalId: string,
    outcome: string,
    amount: BigInt,
    staker: Address,
    daoId: string,
    timestamp: BigInt,
): void {
    addEvent(
        'Stake',
        eventId,
        '{ "outcome": "' + outcome + '", "stakeAmount": "' + amount.toString() + '" }',
        proposalId,
        staker,
        daoId,
        timestamp,
    );
}

export function addVoteEvent(
    eventId: string,
    proposalId: string,
    outcome: string,
    reputation: BigInt,
    voter: Address,
    daoId: string,
    timestamp: BigInt,
): void {
    addEvent(
        'Vote',
        eventId,
        '{ "outcome": "' + outcome + '", "reputationAmount": "' + reputation.toString() + '" }',
        proposalId,
        voter,
        daoId,
        timestamp,
    );
}

function addEvent(
    type: string,
    id: string,
    data: string,
    proposal: string,
    user: Bytes,
    dao: string,
    timestamp: BigInt,
): void {
    let eventEnt = new Event(id);
    eventEnt.type = type;
    eventEnt.data = data;
    eventEnt.proposal = proposal;
    eventEnt.user = user;
    eventEnt.dao = dao;
    eventEnt.timestamp = timestamp;
    eventEnt.save();
}
