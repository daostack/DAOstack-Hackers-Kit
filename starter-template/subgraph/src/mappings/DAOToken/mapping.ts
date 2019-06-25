import { Address, BigInt, Bytes, crypto, store } from '@graphprotocol/graph-ts';

// Import event types from the Token contract ABI
import {
  Approval,
  DAOToken,
  OwnershipTransferred,
  Transfer,
} from '../../types/DAOToken/DAOToken';
import { concat, eventId } from '../../utils';

// Import entity types generated from the GraphQL schema
import {
  Allowance,
  TokenApproval,
  TokenContract,
  TokenHolder,
  TokenTransfer,
} from '../../types/schema';

import * as domain from '../../domain';

function update(contract: Address, owner: Address): void {
  let token = DAOToken.bind(contract);
  let ent = new TokenHolder(crypto.keccak256(concat(contract, owner)).toHex());
  ent.contract = contract;
  ent.address = owner;
  let balance = token.balanceOf(owner);
  ent.balance = balance;

  if (!balance.isZero()) {
    store.set('TokenHolder', ent.id, ent);
  } else {
    store.remove('TokenHolder', ent.id);
  }

  updateTokenContract(contract, ent.id);
}

export function handleTransfer(event: Transfer): void {
  domain.handleNativeTokenTransfer(event);

  update(event.address, event.params.to as Address);
  update(event.address, event.params.from as Address);
  let ent = new TokenTransfer(eventId(event));
  ent.txHash = event.transaction.hash;
  ent.contract = event.address;
  ent.from = event.params.from;
  ent.to = event.params.to;
  ent.value = event.params.value;

  store.set('TokenTransfer', ent.id, ent);

  if (event.params.from !== event.transaction.from) {
    updateAllowance(event.address, event.params.from, event.transaction.from);
  }
}

export function handleApproval(event: Approval): void {
  let ent = new TokenApproval(eventId(event));
  ent.txHash = event.transaction.hash;
  ent.contract = event.address;
  ent.spender = event.params.spender;
  ent.value = event.params.value;
  ent.owner = event.params.owner;

  store.set('TokenApproval', ent.id, ent);

  updateAllowance(event.address, event.params.owner, event.params.spender);
}

export function updateAllowance(contract: Bytes, owner: Bytes, spender: Bytes): void {
  let id = crypto.keccak256(concat(concat(contract, owner), spender)).toHex();
  let allowance = store.get('Allowance', id) as Allowance;

  let token = DAOToken.bind(contract as Address);
  let allowanceAmount = token.allowance(owner as Address, spender as Address);

  if (allowanceAmount.isZero()) {
    store.remove('Allowance', id);
    return;
  }

  if (allowance == null) {
    allowance = new Allowance(id);
    allowance.token = contract;
    allowance.owner = owner;
    allowance.spender = spender;
  }
  allowance.amount = allowanceAmount;

  store.set('Allowance', id, allowance);
}

export function handleOwnershipTransferred(event: OwnershipTransferred): void {
  updateTokenContract(event.address, null);
}

function updateTokenContract(contract: Address , tokenHolder: string): void {
  let token = DAOToken.bind(contract);
  let tokenContract = TokenContract.load(contract.toHex());
  if (tokenContract == null) {
    tokenContract = new TokenContract(contract.toHex());
    // tslint:disable-next-line: ban-types
    tokenContract.tokenHolders = new Array<string>();
  }
  if (tokenHolder != null) {
      let tokenHolders = tokenContract.tokenHolders;
      let i = tokenHolders.indexOf(tokenHolder);
      if (i === -1) {
          tokenHolders.push(tokenHolder);
      }
      tokenContract.tokenHolders = tokenHolders;
  }
  tokenContract.address = contract;
  tokenContract.totalSupply = token.totalSupply();
  tokenContract.owner = token.owner();
  tokenContract.save();
}
