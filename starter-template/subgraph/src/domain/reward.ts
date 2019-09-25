import { Address, BigInt, Bytes , crypto, EthereumValue, log , SmartContract, store} from '@graphprotocol/graph-ts';
import { GenesisProtocol } from '../types/GenesisProtocol/GenesisProtocol';
import { ContributionRewardProposal,
         ControllerScheme,
         GPReward,
         GPRewardsHelper,
         PreGPReward,
         Proposal } from '../types/schema';
import { concat , equalsBytes , equalStrings } from '../utils';
import { addRedeemableRewardOwner, getProposal, removeRedeemableRewardOwner } from './proposal';

function getGPRewardsHelper(proposalId: string): GPRewardsHelper {
    let gpRewardsHelper = GPRewardsHelper.load(proposalId);
    if (gpRewardsHelper == null) {
        gpRewardsHelper = new GPRewardsHelper(proposalId);
        // tslint:disable-next-line: ban-types
        gpRewardsHelper.gpRewards = new Array<string>();
    }
    return gpRewardsHelper as GPRewardsHelper;
}

export function insertGPRewardsToHelper(proposalId: Bytes, beneficiary: Address): void {
  let rewardId = crypto.keccak256(concat(proposalId, beneficiary)).toHex();
  let gpRewardsHelper = getGPRewardsHelper(proposalId.toHex());
  let gpRewards = gpRewardsHelper.gpRewards;
  // check if already exist
  let i = 0;
  for (i; i < gpRewards.length; i++) {
       if (equalStrings((gpRewards as string[])[i], rewardId)) {
           break;
       }
  }
  if (i === gpRewards.length) { // not exist
      updatePreGPReward(rewardId, beneficiary);
      gpRewards.push(rewardId);
      gpRewardsHelper.gpRewards = gpRewards;
      gpRewardsHelper.save();
   }
}

export function daoBountyRedemption(proposalId: Bytes, beneficiary: Address , timestamp: BigInt): void {
   let id = crypto.keccak256(concat(proposalId, beneficiary)).toHex();
   let reward = store.get('GPReward', id) as GPReward | null;
   if (reward == null) {
     return;
   }
   reward.daoBountyForStakerRedeemedAt = timestamp;
   reward.save();
   if (shouldRemoveAccountFromUnclaimed(reward as GPReward)) {
      removeRedeemableRewardOwner(proposalId, beneficiary);
   }
}

export function tokenRedemption(proposalId: Bytes, beneficiary: Address, timestamp: BigInt): void {
   let id = crypto.keccak256(concat(proposalId, beneficiary)).toHex();
   let reward = store.get('GPReward', id) as GPReward | null;
   if (reward == null) {
     return;
   }
   reward.tokensForStakerRedeemedAt = timestamp;
   reward.save();
   if (shouldRemoveAccountFromUnclaimed(reward as GPReward)) {
    removeRedeemableRewardOwner(proposalId, beneficiary);
   }
}

export function reputationRedemption(proposalId: Bytes, beneficiary: Address, timestamp: BigInt): void {
   let id = crypto.keccak256(concat(proposalId, beneficiary)).toHex();
   let reward = store.get('GPReward', id) as GPReward | null;
   if (reward == null) {
     return;
   }

   if (reward.reputationForProposer != null) {
       reward.reputationForProposerRedeemedAt = timestamp;
   }
   if (reward.reputationForVoter != null) {
       reward.reputationForVoterRedeemedAt = timestamp;
   }

   reward.save();
   if (shouldRemoveAccountFromUnclaimed(reward as GPReward)) {
      removeRedeemableRewardOwner(proposalId, beneficiary);
   }
}

export function shouldRemoveAccountFromUnclaimed(reward: GPReward): boolean {
  let proposal = ContributionRewardProposal.load(reward.proposal);
  if (proposal !== null) {
    if (equalsBytes(proposal.beneficiary, reward.beneficiary)) {
      if (!shouldRemoveContributorFromUnclaimed(proposal as ContributionRewardProposal)) {
        return false;
      }
    }
  }

  return ((reward.reputationForVoter == null ||
    reward.reputationForVoterRedeemedAt.isZero() === false) &&
     (reward.reputationForProposer == null ||
        reward.reputationForProposerRedeemedAt.isZero() === false) &&
        (reward.tokensForStaker == null ||
          reward.tokensForStakerRedeemedAt.isZero() === false) &&
          (reward.daoBountyForStaker == null ||
            reward.daoBountyForStakerRedeemedAt.isZero() === false)
     );
}

export function shouldRemoveContributorFromUnclaimed(proposal: ContributionRewardProposal): boolean {
  // Note: This doesn't support the period feature of ContributionReward
  return (
    (proposal.reputationReward.isZero() ||
    (proposal.alreadyRedeemedReputationPeriods !== null &&
      BigInt.compare(proposal.alreadyRedeemedReputationPeriods as BigInt, proposal.periods) === 0)) &&
    (proposal.nativeTokenReward.isZero() ||
    (proposal.alreadyRedeemedNativeTokenPeriods !== null &&
    BigInt.compare(proposal.alreadyRedeemedNativeTokenPeriods as BigInt, proposal.periods) === 0)) &&
    (proposal.externalTokenReward.isZero() ||
    (proposal.alreadyRedeemedExternalTokenPeriods !== null &&
    BigInt.compare(proposal.alreadyRedeemedExternalTokenPeriods as BigInt, proposal.periods) === 0)) &&
    (proposal.ethReward.isZero() ||
    (proposal.alreadyRedeemedEthPeriods !== null &&
    BigInt.compare(proposal.alreadyRedeemedEthPeriods as BigInt, proposal.periods) === 0)));
}

export function insertGPRewards(
  proposalId: Bytes,
  timestamp: BigInt,
  gpAddress: Address,
  state: number,
): void {
  let proposal = getProposal(proposalId.toHex());
  let genesisProtocol = GenesisProtocol.bind(gpAddress);
  let i = 0;
  let gpRewards: string[] = getGPRewardsHelper(proposalId.toHex()).gpRewards as string[];
  let controllerScheme = ControllerScheme.load(proposal.scheme.toString());
  if (proposal.contributionReward !== null && equalStrings(proposal.winningOutcome, 'Pass')) {
    let contributionRewardProposal = ContributionRewardProposal.load(proposal.contributionReward.toString());
    addRedeemableRewardOwner(proposal, contributionRewardProposal.beneficiary);
  }
  for (i = 0; i < gpRewards.length; i++) {
    let gpReward = PreGPReward.load(gpRewards[i]);
    if (gpReward === null) { continue; }
    let redeemValues: BigInt[];
    redeemValues[0] = BigInt.fromI32(0);
    redeemValues[1] = BigInt.fromI32(0);
    redeemValues[2] = BigInt.fromI32(0);
    let daoBountyForStaker: BigInt = BigInt.fromI32(0);

    if (controllerScheme !== null ) {
        let callResult = genesisProtocol.try_redeem(proposalId, gpReward.beneficiary as Address);
        if (callResult.reverted) {
            log.info('genesisProtocol try_redeem reverted', []);
        } else {
            redeemValues = callResult.value;
        }
        if (state === 2) {// call redeemDaoBounty only on execute
           let callResultRedeemDaoBounty =
           genesisProtocol.try_redeemDaoBounty(proposalId, gpReward.beneficiary as Address);
           if (callResultRedeemDaoBounty.reverted) {
              log.info('genesisProtocol try_redeemDaoBounty reverted', []);
           } else {
               daoBountyForStaker = callResultRedeemDaoBounty.value.value1;
           }
        }
    }
    if (!redeemValues[0].isZero() ||
        !redeemValues[1].isZero() ||
        !redeemValues[2].isZero() ||
        !daoBountyForStaker.isZero()) {
        updateGPReward(gpReward.id,
                     gpReward.beneficiary,
                     proposal.id,
                     redeemValues[0],
                     redeemValues[1],
                     redeemValues[2],
                     daoBountyForStaker,
                     gpAddress,
                     proposal.dao,
                     timestamp,
                  );
        let idx = 0;
        let accountsWithUnclaimedRewards: Bytes[] =
           proposal.accountsWithUnclaimedRewards as Bytes[];
        for (idx; idx < accountsWithUnclaimedRewards.length; idx++) {
            if (equalsBytes(accountsWithUnclaimedRewards[idx], gpReward.beneficiary)) {
              break;
            }
        }
        if (idx === accountsWithUnclaimedRewards.length) {
          addRedeemableRewardOwner(proposal, gpReward.beneficiary);
        }
    } else {
      // remove the gpReward entity
      store.remove('PreGPReward', gpReward.id);
    }
  }
  store.remove('GPRewardsHelper' , proposalId.toHex());
  proposal.save();
}

function updateGPReward(id: string,
                        beneficiary: Bytes,
                        proposalId: string,
                        tokensForStaker: BigInt,
                        reputationForVoter: BigInt,
                        reputationForProposer: BigInt,
                        daoBountyForStaker: BigInt,
                        gpAddress: Bytes,
                        dao: string,
                        createdAt: BigInt,
                        ): GPReward {
      let reward = store.get('GPReward', id) as GPReward;
      if (reward == null) {
        reward = new GPReward(id);
        reward.beneficiary = beneficiary;
        reward.proposal = proposalId;
        reward.dao = dao;
        reward.createdAt = createdAt;
        reward.tokensForStakerRedeemedAt = BigInt.fromI32(0);
        reward.reputationForVoterRedeemedAt = BigInt.fromI32(0);
        reward.reputationForProposerRedeemedAt = BigInt.fromI32(0);
        reward.daoBountyForStakerRedeemedAt = BigInt.fromI32(0);
      }
      if (reputationForVoter.isZero() === false) {
          reward.reputationForVoter = reputationForVoter;
      }
      if (tokensForStaker.isZero() === false) {
          reward.tokensForStaker = tokensForStaker;
      }
      if (reputationForProposer.isZero() === false) {
          reward.reputationForProposer = reputationForProposer;
      }
      if (daoBountyForStaker.isZero() === false) {
          reward.daoBountyForStaker = daoBountyForStaker;
          let genesisProtocol = GenesisProtocol.bind(gpAddress as Address);
          reward.tokenAddress = genesisProtocol.stakingToken();
      }
      reward.save();
      return reward;
}

function updatePreGPReward(id: string, beneficiary: Bytes): PreGPReward {
  let reward = new PreGPReward(id);
  reward.beneficiary = beneficiary;

  reward.save();
  return reward;
}
