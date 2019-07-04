import { Address, store } from '@graphprotocol/graph-ts';
import { Reputation } from '../types/Reputation/Reputation';
import { Rep } from '../types/schema';

export function getReputation(id: string): Rep {
  let reputation = store.get('Rep', id) as Rep;
  if (reputation == null) {
    reputation = new Rep(id);
  }

  return reputation;
}

export function saveReputation(reputation: Rep): void {
  store.set('Rep', reputation.id, reputation);
}

export function insertReputation(
  reputationAddress: Address,
  daoId: string,
): void {
  let rep = Reputation.bind(reputationAddress);
  let reputation = getReputation(reputationAddress.toHex());
  reputation.dao = daoId;
  reputation.totalSupply = rep.totalSupply();
  saveReputation(reputation);
}

export function updateReputationTotalSupply(reputationAddress: Address): void {
  let rep = Reputation.bind(reputationAddress);
  let reputation = getReputation(reputationAddress.toHex());
  reputation.totalSupply = rep.totalSupply();
  saveReputation(reputation);
}
