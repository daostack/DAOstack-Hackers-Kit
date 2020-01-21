import { Address, BigInt, crypto, store } from '@graphprotocol/graph-ts';

// Import event types from the Reputation contract ABI
import {
  Burn,
  Mint,
  OwnershipTransferred,
  Reputation,
} from '../../types/Reputation/Reputation';
import { concat, eventId } from '../../utils';

import * as domain from '../../domain';

// Import entity types generated from the GraphQL schema
import {
  ReputationBurn,
  ReputationContract,
  ReputationHolder,
  ReputationMint,
} from '../../types/schema';

function update(contract: Address, owner: Address, timestamp: BigInt): void {
  let rep = Reputation.bind(contract);
  let reputationContract = ReputationContract.load(contract.toHex());

  if (reputationContract == null) {
    reputationContract = new ReputationContract(contract.toHex());
    // tslint:disable-next-line: ban-types
    reputationContract.reputationHolders = new Array<string>();
  }

  let reputationHolders = reputationContract.reputationHolders;

  let repHolderId = crypto.keccak256(concat(contract, owner)).toHex();
  let repHolder = ReputationHolder.load(repHolderId);
  let balance = rep.balanceOf(owner);
  if (repHolder == null) {
    repHolder = new ReputationHolder(repHolderId);
    repHolder.contract = contract;
    repHolder.address = owner;
    repHolder.balance = balance;
    repHolder.createdAt = timestamp;
    if (!balance.isZero()) {
      repHolder.save();
      reputationHolders.push(repHolder.id);
      domain.addDaoMember(repHolder as ReputationHolder);
      // create a new one
    }
  } else {

    repHolder.balance = balance;
    if (!balance.isZero()) {
      // update
      repHolder.save();
      reputationHolders.push(repHolder.id);
    } else {
      // remove
      store.remove('ReputationHolder', repHolder.id);
      domain.removeDaoMember(repHolder as ReputationHolder);
    }
  }

  reputationContract.reputationHolders = reputationHolders;
  reputationContract.address = contract;
  reputationContract.totalSupply = rep.totalSupply();
  reputationContract.save();
}

export function handleMint(event: Mint): void {
  domain.handleMint(event);
  update(event.address, event.params._to as Address, event.block.timestamp);

  let ent = new ReputationMint(eventId(event));
  ent.txHash = event.transaction.hash;
  ent.contract = event.address;
  ent.address = event.params._to;
  ent.amount = event.params._amount;

  store.set('ReputationMint', ent.id, ent);
}

export function handleBurn(event: Burn): void {
  domain.handleBurn(event);
  update(event.address, event.params._from as Address, event.block.timestamp);

  let ent = new ReputationBurn(eventId(event));
  ent.txHash = event.transaction.hash;
  ent.contract = event.address;
  ent.address = event.params._from;
  ent.amount = event.params._amount;

  store.set('ReputationBurn', ent.id, ent);
}

export function handleOwnershipTransferred(event: OwnershipTransferred): void {
  update(event.address, event.params.newOwner as Address, event.block.timestamp);
}
