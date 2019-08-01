import { Address, BigInt, ByteArray, Bytes, crypto } from '@graphprotocol/graph-ts';
import { setContributionRewardParams,
         setGenericSchemeParams,
         setSchemeRegistrarParams } from '../mappings/Controller/mapping';
import {ContributionReward} from '../types/ContributionReward/ContributionReward';
import {GenericScheme} from '../types/GenericScheme/GenericScheme';
import { GenesisProtocol } from '../types/GenesisProtocol/GenesisProtocol';
import { ContractInfo, GPQueue } from '../types/schema';
import {SchemeRegistrar} from '../types/SchemeRegistrar/SchemeRegistrar';
import { concat, debug, equalStrings} from '../utils';

export function getGPQueue(id: string): GPQueue {
  let gpQueue = GPQueue.load(id) ;
  if (gpQueue == null) {
    gpQueue = new GPQueue(id);
    gpQueue.votingMachine = null;
    gpQueue.scheme = '';
  }
  return gpQueue as GPQueue;
}

export function updateThreshold(dao: string,
                                gpAddress: Address,
                                threshold: BigInt,
                                organizationId: Bytes,
                                scheme: string ): void {
  let gpQueue = getGPQueue(organizationId.toHex());
  gpQueue.threshold =  threshold;
  gpQueue.votingMachine = gpAddress;
  gpQueue.scheme = scheme;
  gpQueue.dao = dao;
  gpQueue.save();
}

export function create(dao: Address,
                       scheme: Address,
                       paramsHash: Bytes ): void {
   let contractInfo = ContractInfo.load(scheme.toHex());
   if (contractInfo ==  null) {
     return;
   }
   let gpAddress: Address;
   let isGPQue = false;
   let gpParamsHash: Bytes;
   let addressZero = '0x0000000000000000000000000000000000000000';
   if (equalStrings(contractInfo.name, 'ContributionReward')) {
     let contributionReward =  ContributionReward.bind(scheme);
     let parameters = contributionReward.parameters(paramsHash);
     if (!equalStrings(parameters.value1.toHex(), addressZero)) {
       gpAddress = parameters.value1;
       setContributionRewardParams(dao, scheme, gpAddress, parameters.value0);
       isGPQue = true;
     }

   }
   if (equalStrings(contractInfo.name, 'SchemeRegistrar')) {
     let schemeRegistrar =  SchemeRegistrar.bind(scheme);
     let parameters = schemeRegistrar.parameters(paramsHash);
     if (!equalStrings(parameters.value2.toHex(), addressZero)) {
         gpAddress = parameters.value2;
         setSchemeRegistrarParams(dao, scheme, gpAddress, parameters.value0, parameters.value1);
         isGPQue = true;
     }
   }
   if (equalStrings(contractInfo.name, 'GenericScheme')) {
     let genericScheme =  GenericScheme.bind(scheme);
     let parameters = genericScheme.parameters(paramsHash);
     if (!equalStrings(parameters.value0.toHex(), addressZero)) {
         gpAddress = parameters.value0;
         setGenericSchemeParams(dao, scheme, gpAddress, parameters.value1, parameters.value2);
         isGPQue = true;
     }
   }
   if (isGPQue) {
      let bigOne = new ByteArray(6);
      bigOne[0] = 0;
      bigOne[1] = 0;
      bigOne[2] = 0;
      bigOne[3] = 0;
      bigOne[4] = 0;
      bigOne[5] = 1;
      let organizationId = crypto.keccak256(concat(scheme, dao));
      updateThreshold(dao.toHex(),
                      gpAddress,
                      BigInt.fromUnsignedBytes(bigOne as Bytes),
                      organizationId as Bytes,
                      crypto.keccak256(concat(dao, scheme)).toHex());
   }
}
