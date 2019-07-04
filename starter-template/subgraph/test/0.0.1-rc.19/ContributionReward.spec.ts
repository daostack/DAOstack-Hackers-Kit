import { getContractAddresses, getOptions, getWeb3, sendQuery } from './util';

const AbsoluteVote = require('@daostack/arc/build/contracts/AbsoluteVote.json');
const Avatar = require('@daostack/arc/build/contracts/Avatar.json');
const ContributionReward = require('@daostack/arc/build/contracts/ContributionReward.json');
const DAOToken = require('@daostack/arc/build/contracts/DAOToken.json');
const Reputation = require('@daostack/arc/build/contracts/Reputation.json');
const UController = require('@daostack/arc/build/contracts/UController.json');

describe('ContributionReward', () => {
    let web3;
    let addresses;
    let opts;
    let contributionReward;
    beforeAll(async () => {
        web3 = await getWeb3();
        addresses = getContractAddresses();
        opts = await getOptions(web3);
        contributionReward = new web3.eth.Contract(ContributionReward.abi, addresses.ContributionReward, opts);
    });

    it('Sanity', async () => {
        const accounts = web3.eth.accounts.wallet;

        // START long setup ...
        const externalToken = await new web3.eth.Contract(DAOToken.abi, undefined, opts)
            .deploy({ data: DAOToken.bytecode, arguments: ['Test Token', 'TST', '10000000000'] })
            .send();
        await externalToken.methods.mint(accounts[0].address, '100000').send();

        const nativeToken = await new web3.eth.Contract(DAOToken.abi, undefined, opts)
            .deploy({ data: DAOToken.bytecode, arguments: ['Test Token', 'TST', '10000000000'] })
            .send();

        const reputation = await new web3.eth.Contract(Reputation.abi, undefined, opts)
            .deploy({ data: Reputation.bytecode, arguments: [] })
            .send();
        await reputation.methods.mint(accounts[1].address, 100000).send(); // to be able to pass a vote

        const avatar = await new web3.eth.Contract(Avatar.abi, undefined, opts)
            .deploy({ arguments: ['Test', nativeToken.options.address, reputation.options.address],
                      data: Avatar.bytecode,
                    })
            .send();
        await externalToken.methods.transfer(avatar.options.address, '100000').send();

        const controller = await new web3.eth.Contract(UController.abi, undefined, opts)
            .deploy({ data: UController.bytecode, arguments: [] })
            .send();

        const absVote = await new web3.eth.Contract(AbsoluteVote.abi, undefined, opts)
            .deploy({ data: AbsoluteVote.bytecode, arguments: [] })
            .send();

        const setParams = absVote.methods.setParameters(20, '0x0000000000000000000000000000000000000000');
        const absVoteParamsHash = await setParams.call();
        await setParams.send();
        const crSetParams = contributionReward.methods.setParameters(absVoteParamsHash, absVote.options.address);
        const paramsHash = await crSetParams.call();
        await crSetParams.send();
        await reputation.methods.transferOwnership(controller.options.address).send();
        await nativeToken.methods.transferOwnership(controller.options.address).send();
        await avatar.methods.transferOwnership(controller.options.address).send();
        await controller.methods.newOrganization(avatar.options.address).send();
        await controller.methods.registerScheme(
            contributionReward.options.address,
            paramsHash,
            '0x0000001F', // full permissions,
            avatar.options.address,
        ).send();
        // END setup

        const descHash = '0x0000000000000000000000000000000000000000000000000000000000000123';
        const rewards = {
            eth: 4,
            externalToken: 3,
            nativeToken: 2,
            periodLength: 13,
            periods: 5,
            rep: 1,
        };
        const propose = contributionReward.methods.proposeContributionReward(
            avatar.options.address,
            descHash,
            rewards.rep,
            [
                rewards.nativeToken,
                rewards.eth,
                rewards.externalToken,
                rewards.periodLength,
                rewards.periods,
            ],
            externalToken.options.address,
            accounts[1].address,
        );
        const proposalId = await propose.call();
        const { transactionHash: proposaTxHash } = await propose.send();

        const { contributionRewardNewContributionProposals } = await sendQuery(`{
            contributionRewardNewContributionProposals {
              txHash,
              contract,
              avatar,
              beneficiary,
              descriptionHash,
              externalToken,
              votingMachine,
              proposalId,
              reputationReward,
              nativeTokenReward,
              ethReward,
              externalTokenReward,
              periods,
              periodLength
            }
        }`);

        expect(contributionRewardNewContributionProposals).toContainEqual({
            avatar: avatar.options.address.toLowerCase(),
            beneficiary: accounts[1].address.toLowerCase(),
            contract: contributionReward.options.address.toLowerCase(),
            descriptionHash: descHash,
            ethReward: rewards.eth.toString(),
            externalToken: externalToken.options.address.toLowerCase(),
            externalTokenReward: rewards.externalToken.toString(),
            nativeTokenReward: rewards.nativeToken.toString(),
            periodLength: rewards.periodLength.toString(),
            periods: rewards.periods.toString(),
            proposalId,
            reputationReward: rewards.rep.toString(),
            txHash: proposaTxHash,
            votingMachine: absVote.options.address.toLowerCase(),
        });

        let { contributionRewardProposals } = await sendQuery(`{
            contributionRewardProposals {
                proposalId,
                contract,
                avatar,
                beneficiary,
                descriptionHash,
                externalToken,
                votingMachine,
                reputationReward,
                nativeTokenReward,
                ethReward,
                externalTokenReward,
                periods,
                periodLength,
                executedAt,
                alreadyRedeemedReputationPeriods,
                alreadyRedeemedNativeTokenPeriods,
                alreadyRedeemedEthPeriods,
                alreadyRedeemedExternalTokenPeriods
            }
        }`);

        expect(contributionRewardProposals).toContainEqual({
            alreadyRedeemedEthPeriods: null,
            alreadyRedeemedExternalTokenPeriods: null,
            alreadyRedeemedNativeTokenPeriods: null,
            alreadyRedeemedReputationPeriods: null,
            avatar: avatar.options.address.toLowerCase(),
            beneficiary: accounts[1].address.toLowerCase(),
            contract: contributionReward.options.address.toLowerCase(),
            descriptionHash: descHash,
            ethReward: rewards.eth.toString(),
            executedAt: null,
            externalToken: externalToken.options.address.toLowerCase(),
            externalTokenReward: rewards.externalToken.toString(),
            nativeTokenReward: rewards.nativeToken.toString(),
            periodLength: rewards.periodLength.toString(),
            periods: rewards.periods.toString(),
            proposalId,
            reputationReward: rewards.rep.toString(),
            votingMachine: absVote.options.address.toLowerCase(),
        });

        // pass the proposal
        const { transactionHash: executeTxHash, blockNumber } = await absVote.methods.vote(
                                                                proposalId,
                                                                1,
                                                                0,
                                                                accounts[0].address /* unused by the contract */)
                                                                .send({ from: accounts[1].address });
        const block = await web3.eth.getBlock(blockNumber);

        const { contributionRewardProposalResolveds } = await sendQuery(`{
            contributionRewardProposalResolveds {
              txHash
              contract
              avatar
              proposalId
              passed
            }
        }`);

        expect(contributionRewardProposalResolveds).toContainEqual({
            avatar: avatar.options.address.toLowerCase(),
            contract: contributionReward.options.address.toLowerCase(),
            txHash: executeTxHash,

            passed: true,
            proposalId,
        });

        contributionRewardProposals = (await sendQuery(`{
            contributionRewardProposals {
                executedAt
            }
        }`)).contributionRewardProposals;

        expect(contributionRewardProposals).toContainEqual({
            executedAt: block.timestamp.toString(),
        });

        // wait 2 periods
        await new Promise((res) => setTimeout(res, rewards.periodLength * 2 * 1000));
        const { transactionHash: redeemReputationTxHash } = await contributionReward
                                                                  .methods
                                                                  .redeemReputation(proposalId,
                                                                                    avatar.options.address)
                                                                                    .send();

        const { contributionRewardRedeemReputations } = await sendQuery(`{
            contributionRewardRedeemReputations {
              txHash,
              contract,
              avatar,
              beneficiary,
              proposalId,
              amount
            }
        }`);

        expect(contributionRewardRedeemReputations).toContainEqual({
            txHash: redeemReputationTxHash,
            contract: contributionReward.options.address.toLowerCase(),
            avatar: avatar.options.address.toLowerCase(),
            beneficiary: accounts[1].address.toLowerCase(),
            proposalId,
            amount: (rewards.rep * 2).toString(),
        });

        contributionRewardProposals = (await sendQuery(`{
            contributionRewardProposals {
                alreadyRedeemedReputationPeriods
            }
        }`)).contributionRewardProposals;

        expect(contributionRewardProposals).toContainEqual({
            alreadyRedeemedReputationPeriods: '2',
        });

        const { transactionHash: redeemNativeTokenTxHash } = await contributionReward
                                                                   .methods
                                                                   .redeemNativeToken(proposalId,
                                                                                      avatar.options.address)
                                                                   .send();

        const { contributionRewardRedeemNativeTokens } = await sendQuery(`{
            contributionRewardRedeemNativeTokens {
              txHash,
              contract,
              avatar,
              beneficiary,
              proposalId,
              amount
            }
        }`);

        expect(contributionRewardRedeemNativeTokens).toContainEqual({
            txHash: redeemNativeTokenTxHash,
            contract: contributionReward.options.address.toLowerCase(),
            avatar: avatar.options.address.toLowerCase(),
            beneficiary: accounts[1].address.toLowerCase(),
            proposalId,
            amount: (rewards.nativeToken * 2).toString(),
        });

        contributionRewardProposals = (await sendQuery(`{
            contributionRewardProposals {
                alreadyRedeemedNativeTokenPeriods
            }
        }`)).contributionRewardProposals;

        expect(contributionRewardProposals).toContainEqual({
            alreadyRedeemedNativeTokenPeriods: '2',
        });

        const { transactionHash: redeemExternalTokenTxHash } = await contributionReward
                                                                     .methods.
                                                                     redeemExternalToken(proposalId,
                                                                     avatar.options.address)
                                                                     .send();

        const { contributionRewardRedeemExternalTokens } = await sendQuery(`{
            contributionRewardRedeemExternalTokens {
              txHash,
              contract,
              avatar,
              beneficiary,
              proposalId,
              amount
            }
        }`);

        expect(contributionRewardRedeemExternalTokens).toContainEqual({
            txHash: redeemExternalTokenTxHash,
            contract: contributionReward.options.address.toLowerCase(),
            avatar: avatar.options.address.toLowerCase(),
            beneficiary: accounts[1].address.toLowerCase(),
            proposalId,
            amount: (rewards.externalToken * 2).toString(),
        });

        contributionRewardProposals = (await sendQuery(`{
            contributionRewardProposals {
                alreadyRedeemedExternalTokenPeriods
            }
        }`)).contributionRewardProposals;

        expect(contributionRewardProposals).toContainEqual({
            alreadyRedeemedExternalTokenPeriods: '2',
        });

        await web3.eth.sendTransaction({ from: accounts[0].address,
                                         to: avatar.options.address,
                                         value: web3.utils.toWei('10', 'ether'),
                                         data: '0xABCD', // data field is needed here due to bug in ganache
                                         gas: 50000});

        const { transactionHash: redeemEtherTxHash } = await contributionReward
                                                             .methods
                                                             .redeemEther(proposalId,
                                                              avatar.options.address)
                                                              .send({gas: 1000000});

        const receipt = await web3.eth.getTransactionReceipt(redeemEtherTxHash);

        let amountRedeemed = 0;
        await contributionReward.getPastEvents('RedeemEther', {
              fromBlock: receipt.blockNumber,
              toBlock: 'latest',
          })
          .then(function(events) {
              amountRedeemed = events[0].returnValues._amount;
          });

        const { contributionRewardRedeemEthers } = await sendQuery(`{
            contributionRewardRedeemEthers {
              txHash,
              contract,
              avatar,
              beneficiary,
              proposalId,
              amount
            }
        }`);

        expect(contributionRewardRedeemEthers).toContainEqual({
            txHash: redeemEtherTxHash,
            contract: contributionReward.options.address.toLowerCase(),
            avatar: avatar.options.address.toLowerCase(),
            beneficiary: accounts[1].address.toLowerCase(),
            proposalId,
            amount: (amountRedeemed).toString(),
        });

        contributionRewardProposals = (await sendQuery(`{
            contributionRewardProposals {
                alreadyRedeemedEthPeriods
            }
        }`)).contributionRewardProposals;

        expect(contributionRewardProposals).toContainEqual({
            alreadyRedeemedEthPeriods: '2',
        });

    }, 100000);
});
