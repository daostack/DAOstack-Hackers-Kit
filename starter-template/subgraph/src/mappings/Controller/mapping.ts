import 'allocator/arena';

import {
  Address,
  BigInt,
  Bytes,
  crypto,
  Entity,
  store,
} from '@graphprotocol/graph-ts';

import { Avatar } from '../../types/Controller/Avatar';
import { DAOToken } from '../../types/Controller/DAOToken';
import { Reputation } from '../../types/Controller/Reputation';
import { GenesisProtocol } from '../../types/GenesisProtocol/GenesisProtocol';

import * as domain from '../../domain';

import {
  AvatarContract,
  ContractInfo,
  ContributionRewardParam,
  ControllerAddGlobalConstraint,
  ControllerGlobalConstraint,
  ControllerOrganization,
  ControllerRegisterScheme,
  ControllerRemoveGlobalConstraint,
  ControllerScheme,
  ControllerUnregisterScheme,
  ControllerUpgradeController,
  GenericSchemeParam,
  GenesisProtocolParam,
  ReputationContract,
  SchemeRegistrarParam,
  TokenContract,
} from '../../types/schema';

import {
  AddGlobalConstraint,
  Controller,
  RegisterScheme,
  RemoveGlobalConstraint,
  UnregisterScheme,
  UpgradeController,
} from '../../types/Controller/Controller';

import { concat, debug, equalsBytes, eventId } from '../../utils';

function insertScheme(
  controllerAddress: Address,
  avatarAddress: Address,
  scheme: Address,
  paramsHash: Bytes,
): void {
  let controller = Controller.bind(controllerAddress);
  let perms = controller.getSchemePermissions(scheme, avatarAddress);

  let ent = new ControllerScheme(crypto.keccak256(concat(avatarAddress, scheme)).toHex());
  ent.dao = avatarAddress.toHex();
  ent.paramsHash = paramsHash;
  /* tslint:disable:no-bitwise */
  ent.canRegisterSchemes = (perms[3] & 2) === 2;
  /* tslint:disable:no-bitwise */
  ent.canManageGlobalConstraints = (perms[3] & 4) === 4;
  /* tslint:disable:no-bitwise */
  ent.canUpgradeController = (perms[3] & 8) === 8;
  /* tslint:disable:no-bitwise */
  ent.canDelegateCall = (perms[3] & 16) === 16;
  ent.address = scheme;
  let contractInfo = ContractInfo.load(scheme.toHex());
  if (contractInfo != null) {
     ent.name = contractInfo.name;
     ent.version = contractInfo.version;
  }
  store.set('ControllerScheme', ent.id, ent);
}

function deleteScheme(avatarAddress: Address, scheme: Address): void {
  store.remove(
    'ControllerScheme',
    crypto.keccak256(concat(avatarAddress, scheme)).toHex(),
  );
}

function insertOrganization(
  controllerAddress: Address,
  avatarAddress: Address,
): void {

  let controller = Controller.bind(controllerAddress);
  let reputation = controller.nativeReputation();

  let reputationContract = new ReputationContract(reputation.toHex());
  let rep = Reputation.bind(reputation);
  reputationContract.address = reputation;
  reputationContract.totalSupply = rep.totalSupply();
  store.set('ReputationContract', reputationContract.id, reputationContract);

  let token = controller.nativeToken();

  let tokenContract = new TokenContract(token.toHex());
  let daotoken = DAOToken.bind(token);
  tokenContract.address = token;
  tokenContract.totalSupply = daotoken.totalSupply();
  tokenContract.owner = controllerAddress;
  store.set('TokenContract', tokenContract.id, tokenContract);

  let ent = new ControllerOrganization(avatarAddress.toHex());
  ent.avatarAddress = avatarAddress;
  ent.nativeToken = token.toHex();
  ent.nativeReputation = reputation.toHex();
  ent.controller = controllerAddress;

  store.set('ControllerOrganization', ent.id, ent);
}

function updateController(
  avatarAddress: Address,
  newController: Address,
): void {
  let ent = store.get(
    'ControllerOrganization',
    avatarAddress.toHex(),
  ) as ControllerOrganization;
  if (ent != null) {
    ent.controller = newController;
    store.set('ControllerOrganization', avatarAddress.toHex(), ent);
  }
}

function insertGlobalConstraint(
  controllerAddress: Address,
  avatarAddress: Address,
  globalConstraint: Address,
  type: string,
): void {
  let controller = Controller.bind(controllerAddress);
  let paramsHash = controller.getGlobalConstraintParameters(
    globalConstraint,
    avatarAddress,
  );

  let ent = new ControllerGlobalConstraint(crypto.keccak256(concat(avatarAddress, globalConstraint)).toHex());
  ent.address = globalConstraint;
  ent.paramsHash = paramsHash;
  ent.type = type;

  store.set('ControllerGlobalConstraint', ent.id, ent);
}

function deleteGlobalConstraint(
  avatarAddress: Address,
  globalConstraint: Address,
): void {
  store.remove(
    'ControllerGlobalConstraint',
    crypto.keccak256(concat(avatarAddress, globalConstraint)).toHex(),
  );
}

export function handleRegisterScheme(event: RegisterScheme): void {
  let controller = Controller.bind(event.address);
  let avatar = controller.avatar();

  if (AvatarContract.load(avatar.toHex()) == null) {
      return;
  }
  let token = controller.nativeToken();
  let reputation = controller.nativeReputation();
  let paramsHash = controller.getSchemeParameters(event.params._scheme, avatar);
  insertScheme(event.address, avatar, event.params._scheme , paramsHash);

  domain.handleRegisterScheme(avatar, token, reputation, event.params._scheme, paramsHash);

  // Detect a new organization event by looking for the first register scheme event for that org.
  let isFirstRegister = store.get(
    'FirstRegisterScheme',
    avatar.toHex(),
  );
  if (isFirstRegister == null) {
    insertOrganization(event.address, avatar);
    store.set(
      'FirstRegisterScheme',
      avatar.toHex(),
      new Entity(),
    );
  }

  let ent = new ControllerRegisterScheme(eventId(event));
  ent.txHash = event.transaction.hash;
  ent.controller = event.address;
  ent.contract = event.params._sender;
  ent.scheme = event.params._scheme;
  store.set('ControllerRegisterScheme', ent.id, ent);
}

export function handleUnregisterScheme(event: UnregisterScheme): void {
  let controller = Controller.bind(event.address);
  let avatar = controller.avatar();
  deleteScheme(avatar, event.params._scheme);

  let ent = new ControllerUnregisterScheme(eventId(event));
  ent.txHash = event.transaction.hash;
  ent.controller = event.address;
  ent.contract = event.params._sender;
  ent.scheme = event.params._scheme;
  store.set('ControllerUnregisterScheme', ent.id, ent);
}

export function handleUpgradeController(event: UpgradeController): void {
  let controller = Controller.bind(event.address);
  let avatar = controller.avatar();
  updateController(avatar, event.params._newController);

  let ent = new ControllerUpgradeController(eventId(event));
  ent.txHash = event.transaction.hash;
  ent.controller = event.params._oldController;
  ent.newController = event.params._newController;
  store.set('ControllerUpgradeController', ent.id, ent);
}

export function handleAddGlobalConstraint(event: AddGlobalConstraint): void {
  let when = event.parameters[2].value.toBigInt().toI32();
  let type: string;

  if (when === 0) {
    type = 'Pre';
  } else if (when === 1) {
    type = 'Post';
  } else {
    type = 'Both';
  }
  let controller = Controller.bind(event.address);
  let avatar = controller.avatar();
  insertGlobalConstraint(
    event.address,
    avatar,
    event.params._globalConstraint,
    type,
  );

  let ent = new ControllerAddGlobalConstraint(eventId(event));
  ent.txHash = event.transaction.hash;
  ent.controller = event.address;
  ent.globalConstraint = event.params._globalConstraint;
  ent.paramsHash = event.params._params;
  ent.type = type;

  store.set('ControllerAddGlobalConstraint', ent.id, ent);
}

export function handleRemoveGlobalConstraint(
  event: RemoveGlobalConstraint,
): void {
  let controller = Controller.bind(event.address);
  let avatar = controller.avatar();
  deleteGlobalConstraint(avatar, event.params._globalConstraint);

  let ent = new ControllerRemoveGlobalConstraint(eventId(event));
  ent.txHash = event.transaction.hash;
  ent.controller = event.address;
  ent.globalConstraint = event.params._globalConstraint;
  ent.isPre = event.params._isPre;
  store.set('ControllerRemoveGlobalConstraint', ent.id, ent);
}

export function setGPParams(gpAddress: Address,
                            gpParamsHash: Bytes): void {
    let gp = GenesisProtocol.bind(gpAddress);
    let gpParams = GenesisProtocolParam.load(gpParamsHash.toHex());
    if (gpParams == null && !equalsBytes(gpParamsHash, new Bytes(32))) {
        gpParams = new  GenesisProtocolParam(gpParamsHash.toHex());
        let params = gp.parameters(gpParamsHash);
        gpParams.queuedVoteRequiredPercentage = params.value0; // queuedVoteRequiredPercentage
        gpParams.queuedVotePeriodLimit = params.value1; // queuedVotePeriodLimit
        gpParams.boostedVotePeriodLimit = params.value2; // boostedVotePeriodLimit
        gpParams.preBoostedVotePeriodLimit = params.value3; // preBoostedVotePeriodLimit
        gpParams.thresholdConst = params.value4; // thresholdConst
        gpParams.limitExponentValue = params.value5; // limitExponentValue
        gpParams.quietEndingPeriod = params.value6; // quietEndingPeriod
        gpParams.proposingRepReward = params.value7;
        gpParams.votersReputationLossRatio = params.value8; // votersReputationLossRatio
        gpParams.minimumDaoBounty = params.value9; // minimumDaoBounty
        gpParams.daoBountyConst = params.value10; // daoBountyConst
        gpParams.activationTime = params.value11; // activationTime
        gpParams.voteOnBehalf = params.value12 as Bytes; // voteOnBehalf
        gpParams.save();
  }
}

export function setContributionRewardParams(avatar: Address,
                                            scheme: Address,
                                            vmAddress: Address,
                                            vmParamsHash: Bytes): void {
    setGPParams(vmAddress, vmParamsHash);
    let controllerScheme =  ControllerScheme.load(crypto.keccak256(concat(avatar, scheme)).toHex());
    let contributionRewardParams = new ContributionRewardParam(controllerScheme.paramsHash.toHex());
    contributionRewardParams.votingMachine = vmAddress;
    contributionRewardParams.voteParams = vmParamsHash.toHex();
    contributionRewardParams.save();
    controllerScheme.contributionRewardParams = contributionRewardParams.id;
    controllerScheme.save();
}

export function setSchemeRegistrarParams(avatar: Address,
                                         scheme: Address,
                                         vmAddress: Address,
                                         voteRegisterParams: Bytes,
                                         voteRemoveParams: Bytes): void {
   setGPParams(vmAddress, voteRegisterParams);
   setGPParams(vmAddress, voteRemoveParams);
   let controllerScheme =  ControllerScheme.load(crypto.keccak256(concat(avatar, scheme)).toHex());
   debug(controllerScheme.paramsHash.toHex());
   let schemeRegistrarParams = new SchemeRegistrarParam(controllerScheme.paramsHash.toHex());
   schemeRegistrarParams.votingMachine = vmAddress;
   schemeRegistrarParams.voteRegisterParams = voteRegisterParams.toHex();
   schemeRegistrarParams.voteRemoveParams = voteRemoveParams.toHex();
   schemeRegistrarParams.save();
   controllerScheme.schemeRegistrarParams = schemeRegistrarParams.id;
   controllerScheme.save();

}

export function setGenericSchemeParams(avatar: Address,
                                       scheme: Address,
                                       vmAddress: Address,
                                       vmParamsHash: Bytes,
                                       contractToCall: Bytes): void {
   setGPParams(vmAddress, vmParamsHash);
   let controllerScheme =  ControllerScheme.load(crypto.keccak256(concat(avatar, scheme)).toHex());
   let genericSchemeParams = new GenericSchemeParam(controllerScheme.paramsHash.toHex());
   genericSchemeParams.votingMachine = vmAddress;
   genericSchemeParams.voteParams = vmParamsHash.toHex();
   genericSchemeParams.contractToCall = contractToCall;
   genericSchemeParams.save();
   controllerScheme.genericSchemeParams = genericSchemeParams.id;
   controllerScheme.save();
}
