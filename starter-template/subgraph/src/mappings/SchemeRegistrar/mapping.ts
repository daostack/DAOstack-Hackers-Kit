import { Address, BigInt, Bytes, store } from '@graphprotocol/graph-ts';

// Import event types from the Reputation contract ABI
import {
  NewSchemeProposal,
  ProposalExecuted,
  RemoveSchemeProposal,
} from '../../types/SchemeRegistrar/SchemeRegistrar';

import * as domain from '../../domain';

// Import entity types generated from the GraphQL schema
import {
   SchemeRegistrarNewSchemeProposal,
   SchemeRegistrarProposal,
   SchemeRegistrarProposalExecuted,
   SchemeRegistrarRemoveSchemeProposal,
} from '../../types/schema';
import { eventId } from '../../utils';

export function handleNewSchemeProposal(event: NewSchemeProposal): void {
  let ent = SchemeRegistrarNewSchemeProposal.load(eventId(event));
  if (ent == null) {
    ent = new SchemeRegistrarNewSchemeProposal(eventId(event));
  }
  ent.txHash = event.transaction.hash;
  ent.contract = event.address;
  ent.avatar = event.params._avatar;
  ent.proposalId = event.params._proposalId;
  ent.scheme = event.params._scheme;
  ent.paramsHash = event.params._parametersHash;
  ent.permission = event.params._permissions;
  ent.descriptionHash = event.params._descriptionHash;
  ent.votingMachine = event.params._intVoteInterface;
  // need to fill up other fileds.
  ent.save();

  domain.handleNewSchemeRegisterProposal(event.params._proposalId.toHex(),
                                         event.block.timestamp,
                                         ent.avatar,
                                         ent.votingMachine,
                                         ent.descriptionHash,
                                         event.address);
  insertNewProposalRegister(ent.avatar as Address,
                          ent.proposalId,
                          ent.scheme,
                          ent.paramsHash,
                          ent.permission);
}

export function handleRemoveSchemeProposal(event: RemoveSchemeProposal): void {
  let ent = SchemeRegistrarRemoveSchemeProposal.load(eventId(event));
  if (ent == null) {
    ent = new SchemeRegistrarRemoveSchemeProposal(eventId(event));
  }
  ent.txHash = event.transaction.hash;
  ent.contract = event.address;
  ent.avatar = event.params._avatar;
  ent.proposalId = event.params._proposalId;
  ent.descriptionHash = event.params._descriptionHash;
  ent.votingMachine = event.params._intVoteInterface;
  ent.scheme = event.params._scheme;
  // need to fill up other fileds.
  ent.save();

  insertNewProposalUnRegister(ent.avatar as Address,
                              ent.proposalId,
                              ent.scheme);

  domain.handleNewSchemeRegisterProposal(event.params._proposalId.toHex(),
                                         event.block.timestamp,
                                         ent.avatar,
                                         ent.votingMachine,
                                         ent.descriptionHash,
                                         event.address);
}

export function handleProposalExecuted(event: ProposalExecuted): void {
  let ent = SchemeRegistrarProposalExecuted.load(eventId(event));
  if (ent == null) {
    ent = new SchemeRegistrarProposalExecuted(eventId(event));
  }
  ent.txHash = event.transaction.hash;
  ent.contract = event.address;
  ent.avatar = event.params._avatar;
  ent.proposalId = event.params._proposalId;
  ent.decision = event.params._param;
  ent.save();
  updateProposalExecution(ent.proposalId,  ent.decision);
}

function insertNewProposalRegister(avatar: Address,
                                   proposalId: Bytes,
                                   scheme: Bytes,
                                   paramsHash: Bytes,
                                   permissions: Bytes): void {
  let ent = SchemeRegistrarProposal.load(proposalId.toHex());
  if (ent == null) {
    ent = new SchemeRegistrarProposal(proposalId.toHex());
  }
  ent.dao = avatar.toHex();
  ent.schemeToRegister = scheme;
  ent.schemeToRegisterParamsHash = paramsHash;
  ent.schemeToRegisterPermission = permissions;
  ent.save();
}

function insertNewProposalUnRegister(avatar: Address, proposalId: Bytes, scheme: Bytes): void {
  let ent = SchemeRegistrarProposal.load(proposalId.toHex());
  if (ent == null) {
    ent = new SchemeRegistrarProposal(proposalId.toHex());
  }

  ent.dao = avatar.toHex();
  ent.schemeToRemove = scheme;
  ent.save();
}

function updateProposalExecution(proposalId: Bytes, decision: BigInt): void {
  let ent = SchemeRegistrarProposal.load(proposalId.toHex());
  if (ent == null) {
    ent = new SchemeRegistrarProposal(proposalId.toHex());
  }
  ent.decision = decision;
  if (ent.schemeToRegister != null) {
    ent.schemeRegistered = true;
  } else {
    ent.schemeRemoved = true;
  }
  ent.save();
}
