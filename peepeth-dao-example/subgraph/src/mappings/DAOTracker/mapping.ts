import { Address } from '@graphprotocol/graph-ts';
import {
  setBlacklistedDAOs,
  setContractsInfo,
  setTemplatesInfo,
} from '../../contractsInfo';
import {
  DAOTracker,
  TrackDAO,
} from '../../types/DAOTracker/DAOTracker';
import {
  AvatarContract,
  BlacklistedDAO,
  ContractInfo,
  DAOTrackerContract,
  UControllerOrganization,
} from '../../types/schema';
import { createTemplate, equalStrings, fetchTemplateName } from '../../utils';

export function getDAOTrackerContract(address: Address): DAOTrackerContract {
  let daoTracker = DAOTrackerContract.load(address.toHex()) as DAOTrackerContract;
  if (daoTracker == null) {
    daoTracker = new DAOTrackerContract(address.toHex());
    daoTracker.address = address;
    let daoTrackerSC = DAOTracker.bind(address);
    daoTracker.owner = daoTrackerSC.owner();
    daoTracker.save();
    setBlacklistedDAOs();
    setContractsInfo();
    setTemplatesInfo();
  }
  return daoTracker;
}

export function handleTrackDAO(event: TrackDAO): void {
  // Ensure the DAOTrackerContract has been added to the store
  getDAOTrackerContract(event.address);

  let avatar = event.params._avatar;
  let controller = event.params._controller;
  let reputation = event.params._reputation;
  let daoToken = event.params._daoToken;
  let sender = event.params._sender;
  let arcVersion = event.params._arcVersion;

  // If the avatar already exists, early out
  if (AvatarContract.load(avatar.toHex()) != null) {
    return;
  }

  // If the avatar is blacklisted, early out
  if (BlacklistedDAO.load(avatar.toHex()) != null) {
    return;
  }

  // If the sender of the 'track' call is the DaoCreator contract, use its arcVersion
  let daoCreatorInfo = ContractInfo.load(sender.toHex());
  if (daoCreatorInfo != null && equalStrings(daoCreatorInfo.name, 'DaoCreator')) {
    arcVersion = daoCreatorInfo.version;
  } else {
    // We've chosen to disable tracking new DAOs that don't come from the DaoCreator,
    // as it's a potential security vulnerability
    return;
  }

  let avatarTemplate = fetchTemplateName('Avatar', arcVersion);
  let controllerTemplate = fetchTemplateName('Controller', arcVersion);
  let reputationTemplate = fetchTemplateName('Reputation', arcVersion);
  let daoTokenTemplate = fetchTemplateName('DAOToken', arcVersion);

  let missingTemplate = avatarTemplate == null ||
                        reputationTemplate == null ||
                        daoTokenTemplate == null;

  let universalController = UControllerOrganization.load(controller.toHex()) != null;

  if (universalController === false) {
    missingTemplate = missingTemplate || controllerTemplate == null;
  }

  if (missingTemplate) {
    // We're missing a template version in the subgraph
    return;
  }

  // Tell the subgraph to start indexing events from the:
  // Avatar, Controller, DAOToken, and Reputation contracts
  createTemplate(avatarTemplate, avatar);
  createTemplate(reputationTemplate, reputation);
  createTemplate(daoTokenTemplate, daoToken);

  // Track the Controller if it isn't a UController we're already tracking
  if (universalController === false) {
    createTemplate(controllerTemplate, controller);
  }

  // Note, no additional work is needed here because...
  // * ControllerOrganization is added to the store by the 'RegisterScheme' event
  // * AvatarContract, ReputationContract, and TokenContract are added to the store
  //   by the 'RegisterScheme' or 'OwnershipTransfered' events
}
