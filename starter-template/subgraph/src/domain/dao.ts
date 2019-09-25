import { Address, BigInt, store } from '@graphprotocol/graph-ts';
import { DAO } from '../types/schema';
import { Avatar } from '../types/UController/Avatar';

export function getDAO(id: string): DAO {
  let dao = store.get('DAO', id) as DAO;
  if (dao == null) {
    dao = new DAO(id);
    dao.numberOfQueuedProposals = BigInt.fromI32(0);
    dao.numberOfPreBoostedProposals = BigInt.fromI32(0);
    dao.numberOfBoostedProposals = BigInt.fromI32(0);
  }

  return dao;
}

export function increaseDAOmembersCount(id: string): void {
  let dao = getDAO(id);
  dao.reputationHoldersCount = dao.reputationHoldersCount.plus(BigInt.fromI32(1));
  saveDAO(dao);
}

export function decreaseDAOmembersCount(id: string): void {
  let dao = getDAO(id);
  dao.reputationHoldersCount = dao.reputationHoldersCount.minus(BigInt.fromI32(1));
  saveDAO(dao);
}

export function saveDAO(dao: DAO): void {
  store.set('DAO', dao.id, dao);
}

export function insertNewDAO(
  avatarAddress: Address,
  nativeTokenAddress: Address,
  nativeReputationAddress: Address,
): DAO {
  let avatar = Avatar.bind(avatarAddress);
  let dao = getDAO(avatarAddress.toHex());
  dao.name = avatar.orgName().toString();
  dao.nativeToken = nativeTokenAddress.toHex();
  dao.nativeReputation = nativeReputationAddress.toHex();
  dao.reputationHoldersCount = BigInt.fromI32(0);
  dao.register = 'na';
  saveDAO(dao);

  return dao;
}

export function register(
  avatar: Address,
  tag: string,
): void {
  let dao = DAO.load(avatar.toHex());
  if (dao != null) {
    dao.register = tag;
    dao.save();
  }
}

export function exists(
  avatar: Address,
): boolean {
  return (DAO.load(avatar.toHex()) != null);
}
