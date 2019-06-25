import {
  getContractAddresses,
  getOptions,
  getOrgName,
  getWeb3,
  increaseTime,
  sendQuery,
  toFixed,
  waitUntilSynced,
  waitUntilTrue,
  writeProposalIPFS,
} from './util';

const ContributionReward = require('@daostack/arc/build/contracts/ContributionReward.json');
const GenesisProtocol = require('@daostack/arc/build/contracts/GenesisProtocol.json');
const DAOToken = require('@daostack/arc/build/contracts/DAOToken.json');
const Reputation = require('@daostack/arc/build/contracts/Reputation.json');
const Avatar = require('@daostack/arc/build/contracts/Avatar.json');
const DAORegistry = require('@daostack/arc-hive/build/contracts/DAORegistry.json');
const REAL_FBITS = 40;
describe('Domain Layer', () => {
  let web3;
  let addresses;
  let opts;
  const orgName = getOrgName();
  const tokenName = orgName + ' Token';
  const tokenSymbol = orgName[0] + orgName.split(' ')[1][0] + 'T';

  beforeAll(async () => {
    web3 = await getWeb3();
    addresses = getContractAddresses();
    opts = await getOptions(web3);
  });

  it('migration dao', async () => {
    await waitUntilSynced();
    const getMigrationDao = `{
      dao(id: "${addresses.Avatar.toLowerCase()}") {
        id
        name
        nativeToken {
          id
          dao {
            id
          }
        }
        nativeReputation {
          id
          dao {
            id
          }
        }
        reputationHoldersCount
      }
    }`;
    let dao = (await sendQuery(getMigrationDao, 5000)).dao;
    expect(dao).toMatchObject({
      id: addresses.Avatar.toLowerCase(),
      name: orgName,
      nativeToken: {
        id: addresses.NativeToken.toLowerCase(),
        dao: {
          id: addresses.Avatar.toLowerCase(),
        },
      },
      nativeReputation: {
        id: addresses.NativeReputation.toLowerCase(),
        dao: {
          id: addresses.Avatar.toLowerCase(),
        },
      },
      reputationHoldersCount: '5',
    });

    const getMigrationDaoMembers = `{
      dao(id: "${addresses.Avatar.toLowerCase()}") {
        reputationHolders {
          balance
        }
      }
    }`;
    let reputationHolders = (await sendQuery(getMigrationDaoMembers)).dao.reputationHolders;
    expect(reputationHolders).toContainEqual({
      balance: '1000000000000000000000',
    });
    const getMigrationDaoMembersAddress = `{
      dao(id: "${addresses.Avatar.toLowerCase()}") {
        reputationHolders {
          address
        }
      }
    }`;

    const getRegister = `{
      dao(id: "${addresses.Avatar.toLowerCase()}") {
        register
      }
    }`;
    let register;
    register = (await sendQuery(getRegister)).dao.register;
    expect(register).toEqual('na');

    const accounts = web3.eth.accounts.wallet;

    const daoRegistry = new web3.eth.Contract(
      DAORegistry.abi,
      addresses.DAORegistry,
      opts,
    );

    await daoRegistry.methods.propose(addresses.Avatar).send();
    register = (await sendQuery(getRegister, 2000)).dao.register;
    expect(register).toEqual('proposed');

    await daoRegistry.methods.register(addresses.Avatar, 'test').send();
    register = (await sendQuery(getRegister, 2000)).dao.register;
    expect(register).toEqual('registered');

    await daoRegistry.methods.unRegister(addresses.Avatar).send();
    register = (await sendQuery(getRegister, 2000)).dao.register;
    expect(register).toEqual('unRegistered');

  }, 120000);

  it('Sanity', async () => {
    const accounts = web3.eth.accounts.wallet;

    const contributionReward = new web3.eth.Contract(
      ContributionReward.abi,
      addresses.ContributionReward,
      opts,
    );
    const genesisProtocol = new web3.eth.Contract(
      GenesisProtocol.abi,
      addresses.GenesisProtocol,
      opts,
    );

    const stakingToken = new web3.eth.Contract(
      DAOToken.abi,
      addresses.GEN,
      opts,
    );

    let founders =  [
      {
        address: '0x90f8bf6a479f320ead074411a4b0e7944ea8c9c1',
        tokens: Number(web3.utils.toWei('1000')),
        reputation: Number(web3.utils.toWei('1000')),
      },
      {
        address: '0xffcf8fdee72ac11b5c542428b35eef5769c409f0',
        tokens: Number(web3.utils.toWei('1000')),
        reputation: Number(web3.utils.toWei('1000')),
      },
      {
        address: '0x22d491bde2303f2f43325b2108d26f1eaba1e32b',
        tokens: Number(web3.utils.toWei('1000')),
        reputation: Number(web3.utils.toWei('1000')),
      },
      {
        address: '0xe11ba2b4d45eaed5996cd0823791e0c93114882d',
        tokens: Number(web3.utils.toWei('1000')),
        reputation: Number(web3.utils.toWei('1000')),
      },
      {
        address: '0xd03ea8624c8c5987235048901fb614fdca89b117',
        tokens: Number(web3.utils.toWei('1000')),
        reputation: Number(web3.utils.toWei('1000')),
      },
      {
        address: '0x95ced938f7991cd0dfcb48f0a06a40fa1af46ebc',
        tokens: Number(web3.utils.toWei('1000')),
        reputation: Number(web3.utils.toWei('1000')),
      },
    ];

    let gpParams =  {
      boostedVotePeriodLimit: '600',
      daoBountyConst: '10',
      minimumDaoBounty: web3.utils.toWei('100'),
      queuedVotePeriodLimit: '1800',
      queuedVoteRequiredPercentage: '50',
      preBoostedVotePeriodLimit: '600',
      proposingRepReward: web3.utils.toWei('5'),
      quietEndingPeriod: '300',
      thresholdConst: '2000',
      voteOnBehalf: '0x0000000000000000000000000000000000000000',
      activationTime: '0',
      votersReputationLossRatio: '1',
    };

    const avatar = new web3.eth.Contract(Avatar.abi, addresses.Avatar, opts);
    const NativeToken = await avatar.methods.nativeToken().call();
    const NativeReputation = await avatar.methods.nativeReputation().call();

    const reputation = await new web3.eth.Contract(
      Reputation.abi,
      NativeReputation,
      opts,
    );

    const totalRep = await reputation.methods.totalSupply().call();
    // END setup

    const getDAO = `{
      dao(id: "${addresses.Avatar.toLowerCase()}") {
        id
        name
        nativeToken {
          id
          dao {
            id
          }
          name
          symbol
          totalSupply
        }
        nativeReputation {
          id
          dao {
            id
          }
          totalSupply
        }
        schemes {
          address
          dao {
            id
          }
        }
      }
    }`;
    let dao;
    dao = (await sendQuery(getDAO)).dao;

    expect(dao).toMatchObject({
      id: addresses.Avatar.toLowerCase(),
      name: orgName,
      nativeToken: {
        id: NativeToken.toLowerCase(),
        dao: {
          id: addresses.Avatar.toLowerCase(),
        },
        name: tokenName,
        symbol: tokenSymbol,
        totalSupply: founders
          .map(({ tokens }) => tokens)
          .reduce((x, y) => x + y)
          .toLocaleString('fullwide', {useGrouping: false}),
      },
      nativeReputation: {
        id: NativeReputation.toLowerCase(),
        dao: {
          id: addresses.Avatar.toLowerCase(),
        },
        totalSupply: totalRep,
      },
    });

    expect(dao.schemes).toContainEqual(
      {
          address: addresses.UpgradeScheme.toLowerCase(),
          dao: {
            id: addresses.Avatar.toLowerCase(),
          },
        },
    );

    expect(dao.schemes).toContainEqual(
      {
          address: addresses.GlobalConstraintRegistrar.toLowerCase(),
          dao: {
            id: addresses.Avatar.toLowerCase(),
          },
        },
    );

    expect(dao.schemes).toContainEqual(
      {
          address: addresses.ContributionReward.toLowerCase(),
          dao: {
            id: addresses.Avatar.toLowerCase(),
          },
        },
    );

    expect(dao.schemes).toContainEqual(
      {
          address: addresses.SchemeRegistrar.toLowerCase(),
          dao: {
            id: addresses.Avatar.toLowerCase(),
          },
        },
    );

    // check reputation reputationHolders
    const { reputationHolders } = await sendQuery(`{
      reputationHolders (where: {contract: "${NativeReputation.toLowerCase()}"}){
        contract,
        address,
        balance
      }
    }`);

    // there are 6 founders that have reputation in this DAO
    expect(reputationHolders.length).toEqual(6);
    const { tokenHolders } = await sendQuery(`{
      tokenHolders (where: {contract: "${NativeToken.toLowerCase()}"}){
        contract,
        address,
        balance
      }
    }`);

    // there are 6 founders that have tokens in this DAO
    expect(tokenHolders.length).toEqual(6);

    // Save proposal data to IPFS

    let proposalIPFSData = {
      description: 'Just eat them',
      title: 'A modest proposal',
      url: 'http://swift.org/modest',
    };

    let proposalDescription = proposalIPFSData.description;
    let proposalTitle = proposalIPFSData.title;
    let proposalUrl = proposalIPFSData.url;

    const descHash = await writeProposalIPFS(proposalIPFSData);

    async function propose({
      rep,
      tokens,
      eth,
      external,
      periodLength,
      periods,
      beneficiary,
    }) {
      const prop = contributionReward.methods.proposeContributionReward(
        addresses.Avatar,
        descHash,
        rep,
        [tokens, eth, external, periodLength, periods],
        addresses.GEN,
        beneficiary,
      );
      const proposalId = await prop.call();
      const { blockNumber } = await prop.send();
      const { timestamp } = await web3.eth.getBlock(blockNumber);

      return { proposalId, timestamp };
    }

    const [PASS, FAIL] = [1, 2];
    async function vote({ proposalId, outcome, voter, amount = 0 }) {
      const { blockNumber } = await genesisProtocol.methods
        .vote(proposalId, outcome, amount, voter)
        .send({ from: voter });
      const { timestamp } = await web3.eth.getBlock(blockNumber);
      return timestamp;
    }

    async function stake({ proposalId, outcome, amount, staker }) {

      await stakingToken.methods.mint(staker, amount).send();
      await stakingToken.methods.approve(genesisProtocol.options.address, amount).send({ from: staker });
      const { blockNumber } = await genesisProtocol.methods
        .stake(proposalId, outcome, amount)
        .send({ from: staker });
      const { timestamp } = await web3.eth.getBlock(blockNumber);
      return timestamp;
    }

    const { proposalId: p1, timestamp: p1Creation } = await propose({
      rep: 10,
      tokens: 10,
      eth: 0,
      external: 0,
      periodLength: 0,
      periods: 1,
      beneficiary: accounts[5].address,
    });

    const getProposal = `{
        proposal(id: "${p1}") {
            id
            descriptionHash
            title
            description
            url
            stage
            executionState
            createdAt
            preBoostedAt
            boostedAt
            quietEndingPeriodBeganAt
            executedAt
            totalRepWhenExecuted
            totalRepWhenCreated
            closingAt
            proposer
            votingMachine
            votes {
                createdAt
                proposal {
                    id
                }
                dao {
                  id
                }
                outcome
                reputation
            }
            votesFor
            votesAgainst

            stakes {
              createdAt
              proposal {
                  id
              }
              dao {
                id
              }
              outcome
              amount
              staker
            }
            stakesFor
            stakesAgainst
            confidenceThreshold
            confidence

            winningOutcome

            expiresInQueueAt
            genesisProtocolParams {
              queuedVoteRequiredPercentage
              queuedVotePeriodLimit
              boostedVotePeriodLimit
              preBoostedVotePeriodLimit
              thresholdConst
              quietEndingPeriod
              proposingRepReward
              votersReputationLossRatio
              minimumDaoBounty
              daoBountyConst
              activationTime
              voteOnBehalf
            }

            gpQueue {
              dao {
                id
              }
              votingMachine
            }
            contributionReward {
              beneficiary
              ethReward
              externalToken
              externalTokenReward
              nativeTokenReward
              reputationReward
            }
            scheme {
              address
              name
            }
        }
    }`;
    let expectedVotesCount = 0;
    const voteIsIndexed = async () => {
      return (await sendQuery(getProposal)).proposal.votes.length >= expectedVotesCount;
    };

    let expectedStakesCount = 0;
    const stakeIsIndexed = async () => {
      return (await sendQuery(getProposal)).proposal.stakes.length >= expectedStakesCount;
    };

    await waitUntilTrue(voteIsIndexed);
    await waitUntilTrue(stakeIsIndexed);
    let proposal = (await sendQuery(getProposal)).proposal;
    expect(proposal).toMatchObject({
      id: p1,
      descriptionHash: descHash,
      title: proposalTitle,
      description: proposalDescription,
      url: proposalUrl,
      stage: 'Queued',
      closingAt: (Number(gpParams.queuedVotePeriodLimit) + Number(p1Creation)).toString(),
      executionState: 'None',
      createdAt: p1Creation.toString(),
      boostedAt: null,
      quietEndingPeriodBeganAt: null,
      executedAt: null,
      totalRepWhenExecuted: null,
      totalRepWhenCreated: totalRep,
      proposer: web3.eth.defaultAccount.toLowerCase(),
      votingMachine: genesisProtocol.options.address.toLowerCase(),

      votes: [],
      votesFor: '0',
      votesAgainst: '0',
      winningOutcome: 'Fail',

      stakes: [],
      stakesFor: '0',
      stakesAgainst: '100000000000000000000',
      confidenceThreshold: '0',
      confidence: '0',

      contributionReward: {
        beneficiary: accounts[5].address.toLowerCase(),
        ethReward: '0',
        externalToken: addresses.GEN.toLowerCase(),
        externalTokenReward: '0',
        nativeTokenReward: '10',
        reputationReward: '10',
      },

      expiresInQueueAt: (Number(gpParams.queuedVotePeriodLimit) + p1Creation).toString(),

      genesisProtocolParams: {
        queuedVoteRequiredPercentage: gpParams.queuedVoteRequiredPercentage,
        queuedVotePeriodLimit: gpParams.queuedVotePeriodLimit,
        boostedVotePeriodLimit: gpParams.boostedVotePeriodLimit,
        preBoostedVotePeriodLimit: gpParams.preBoostedVotePeriodLimit,
        thresholdConst: ((Number(gpParams.thresholdConst) / 1000) * 2 ** REAL_FBITS).toString(),
        quietEndingPeriod: gpParams.quietEndingPeriod,
        proposingRepReward: gpParams.proposingRepReward,
        votersReputationLossRatio: gpParams.votersReputationLossRatio,
        minimumDaoBounty: gpParams.minimumDaoBounty,
        daoBountyConst: gpParams.daoBountyConst,
        activationTime: gpParams.activationTime,
        voteOnBehalf: gpParams.voteOnBehalf,
      },
      gpQueue: {
        dao: {
          id: addresses.Avatar.toLowerCase(),
        },
        votingMachine: genesisProtocol.options.address.toLowerCase(),
      },
      scheme: {
        address: addresses.ContributionReward.toLowerCase(),
        name: 'ContributionReward',
      },
    });

    const address0Rep = await reputation.methods.balanceOf(accounts[0].address).call();
    const address1Rep = await reputation.methods.balanceOf(accounts[1].address).call();
    const address2Rep = await reputation.methods.balanceOf(accounts[2].address).call();
    const address4Rep = await reputation.methods.balanceOf(accounts[4].address).call();

    const v1Timestamp = await vote({
      proposalId: p1,
      outcome: PASS,
      voter: accounts[0].address,
    });

    expectedVotesCount++;
    await waitUntilTrue(voteIsIndexed);
    proposal = (await sendQuery(getProposal)).proposal;
    expect(proposal).toMatchObject({
      id: p1,
      descriptionHash: descHash,
      stage: 'Queued',
      closingAt: (Number(gpParams.queuedVotePeriodLimit) + Number(p1Creation)).toString(),
      executionState: 'None',
      createdAt: p1Creation.toString(),
      boostedAt: null,
      quietEndingPeriodBeganAt: null,
      executedAt: null,
      totalRepWhenExecuted: null,
      totalRepWhenCreated: totalRep,
      proposer: web3.eth.defaultAccount.toLowerCase(),
      votingMachine: genesisProtocol.options.address.toLowerCase(),
      votes: [
        {
          createdAt: v1Timestamp.toString(),
          outcome: 'Pass',
          proposal: {
            id: p1,
          },
          dao: {
            id: addresses.Avatar.toLowerCase(),
          },
          reputation: address0Rep,
        },
      ],
      votesFor: address0Rep,
      votesAgainst: '0',
      winningOutcome: 'Pass',

      stakes: [],
      stakesFor: '0',
      stakesAgainst: '100000000000000000000',
      confidenceThreshold: '0',
      confidence: '0',

    });

    const s1Timestamp = await stake({
      proposalId: p1,
      outcome: FAIL,
      amount: web3.utils.toWei('100'),
      staker: accounts[0].address,
    });

    expectedStakesCount++;
    await waitUntilTrue(stakeIsIndexed);

    proposal = (await sendQuery(getProposal)).proposal;
    expect(proposal).toMatchObject({
      id: p1,
      descriptionHash: descHash,
      stage: 'Queued',
      closingAt: (Number(gpParams.queuedVotePeriodLimit) + Number(p1Creation)).toString(),
      executionState: 'None',
      createdAt: p1Creation.toString(),
      boostedAt: null,
      quietEndingPeriodBeganAt: null,
      executedAt: null,
      totalRepWhenExecuted: null,
      totalRepWhenCreated: totalRep,
      proposer: web3.eth.defaultAccount.toLowerCase(),
      votingMachine: genesisProtocol.options.address.toLowerCase(),
      votes: [
        {
          createdAt: v1Timestamp.toString(),
          outcome: 'Pass',
          proposal: {
            id: p1,
          },
          dao: {
            id: addresses.Avatar.toLowerCase(),
          },
          reputation: address0Rep,
        },
      ],
      votesFor: address0Rep,
      votesAgainst: '0',
      winningOutcome: 'Pass',

      stakes: [
        {
          amount: '100000000000000000000',
          createdAt: s1Timestamp.toString(),
          outcome: 'Fail',
          proposal: {
            id: p1,
          },
          dao: {
            id: addresses.Avatar.toLowerCase(),
          },
          staker: accounts[0].address.toLowerCase(),
        },
      ],
      stakesFor: '0',
      stakesAgainst: '200000000000000000000',
      confidenceThreshold: '0',
    });

    const s2Timestamp = await stake({
      proposalId: p1,
      outcome: PASS,
      amount: web3.utils.toWei('100'),
      staker: accounts[1].address,
    });

    expectedStakesCount++;
    await waitUntilTrue(stakeIsIndexed);

    proposal = (await sendQuery(getProposal)).proposal;
    expect(proposal).toMatchObject({
      id: p1,
      descriptionHash: descHash,
      stage: 'Queued',
      closingAt: (Number(gpParams.queuedVotePeriodLimit) + Number(p1Creation)).toString(),
      executionState: 'None',
      createdAt: p1Creation.toString(),
      boostedAt: null,
      quietEndingPeriodBeganAt: null,
      executedAt: null,
      totalRepWhenExecuted: null,
      totalRepWhenCreated: totalRep,
      proposer: web3.eth.defaultAccount.toLowerCase(),
      votingMachine: genesisProtocol.options.address.toLowerCase(),
      votes: [
        {
          createdAt: v1Timestamp.toString(),
          outcome: 'Pass',
          proposal: {
            id: p1,
          },
          dao: {
            id: addresses.Avatar.toLowerCase(),
          },
          reputation: address0Rep,
        },
      ],
      votesFor: address0Rep,
      votesAgainst: '0',
      winningOutcome: 'Pass',
      stakesFor: '100000000000000000000',
      stakesAgainst: '200000000000000000000',
      confidenceThreshold: '0',
      confidence: '0.5',
    });
    expect(new Set(proposal.stakes)).toEqual(new Set([
      {
        amount: '100000000000000000000',
        createdAt: s2Timestamp.toString(),
        outcome: 'Pass',
        proposal: {
          id: p1,
        },
        dao: {
          id: addresses.Avatar.toLowerCase(),
        },
        staker: accounts[1].address.toLowerCase(),
      },
      {
        amount: '100000000000000000000',
        createdAt: s1Timestamp.toString(),
        outcome: 'Fail',
        proposal: {
          id: p1,
        },
        dao: {
          id: addresses.Avatar.toLowerCase(),
        },
        staker: accounts[0].address.toLowerCase(),
      },
    ]));
     /// stake to boost
    const s3Timestamp = await stake({
       proposalId: p1,
       outcome: PASS,
       amount: web3.utils.toWei('300'),
       staker: accounts[1].address,
     });

    await waitUntilTrue(stakeIsIndexed);
    proposal = (await sendQuery(getProposal)).proposal;
    expect(proposal.stage).toEqual('PreBoosted');
    expect(proposal.preBoostedAt).toEqual(s3Timestamp.toString());
    expect(proposal.confidenceThreshold).toEqual(Math.pow(2, REAL_FBITS).toString());
    expect(proposal.closingAt).toEqual((Number(gpParams.preBoostedVotePeriodLimit) + Number(s3Timestamp)).toString());

    // boost it
    await increaseTime(300000, web3);
    // this will also shift the proposal to boosted phase
    const v2Timestamp = await vote({
      proposalId: p1,
      outcome: FAIL,
      voter: accounts[1].address,
    });

    proposal = (await sendQuery(getProposal)).proposal;
    expect(proposal).toMatchObject({
      stage: 'Boosted',
      closingAt: (Number(gpParams.boostedVotePeriodLimit) + Number(v2Timestamp)).toString(),
    });

    expectedVotesCount++;
    await waitUntilTrue(voteIsIndexed);

    const v3Timestamp = await vote({
      proposalId: p1,
      outcome: PASS,
      voter: accounts[2].address,
    });

    expectedVotesCount++;
    await waitUntilTrue(voteIsIndexed);

    const v4Timestamp = await vote({
      proposalId: p1,
      outcome: PASS,
      voter: accounts[3].address,
      amount: 1000,
    });

    expectedVotesCount++;
    await waitUntilTrue(voteIsIndexed);

    const v5Timestamp = await vote({
      proposalId: p1,
      outcome: PASS,
      voter: accounts[4].address,
    });

    expectedVotesCount++;
    await waitUntilTrue(voteIsIndexed);

    proposal = (await sendQuery(getProposal)).proposal;
    let votesFor = toFixed(Number(address0Rep) + Number(address2Rep) + Number(address4Rep));
    votesFor = votesFor.substr(0, votesFor.length - 4) + '1' + votesFor.substr(votesFor.length - 3);

    expect(proposal).toMatchObject({
      id: p1,
      descriptionHash: descHash,
      stage: 'Executed',
      executionState: 'BoostedBarCrossed',
      createdAt: p1Creation.toString(),
      boostedAt: v2Timestamp.toString(),
      quietEndingPeriodBeganAt: null,
      executedAt: v5Timestamp.toString(),
      totalRepWhenExecuted: totalRep,
      totalRepWhenCreated: totalRep,
      proposer: web3.eth.defaultAccount.toLowerCase(),
      votingMachine: genesisProtocol.options.address.toLowerCase(),
      votesFor,
      votesAgainst: address1Rep,
      winningOutcome: 'Pass',

      stakesFor: '400000000000000000000',
      stakesAgainst: '200000000000000000000',
      confidence: '2',
      confidenceThreshold: Math.pow(2, REAL_FBITS).toString(),
    });

    expect(new Set(proposal.stakes)).toEqual(new Set([
      {
        amount: '100000000000000000000',
        createdAt: s2Timestamp.toString(),
        outcome: 'Pass',
        proposal: {
          id: p1,
        },
        dao: {
          id: addresses.Avatar.toLowerCase(),
        },
        staker: accounts[1].address.toLowerCase(),
      },
      {
        amount: '100000000000000000000',
        createdAt: s1Timestamp.toString(),
        outcome: 'Fail',
        proposal: {
          id: p1,
        },
        dao: {
          id: addresses.Avatar.toLowerCase(),
        },
        staker: accounts[0].address.toLowerCase(),
      },
      {
        amount: '300000000000000000000',
        createdAt: s3Timestamp.toString(),
        outcome: 'Pass',
        proposal: {
          id: p1,
        },
        dao: {
          id: addresses.Avatar.toLowerCase(),
        },
        staker: accounts[1].address.toLowerCase(),
      },
    ]));

    expect(proposal.votes).toContainEqual({
      createdAt: v1Timestamp.toString(),
      outcome: 'Pass',
      proposal: {
        id: p1,
      },
      dao: {
        id: addresses.Avatar.toLowerCase(),
      },
      reputation: address0Rep,
    });
    expect(proposal.votes).toContainEqual({
      createdAt: v2Timestamp.toString(),
      outcome: 'Fail',
      proposal: {
        id: p1,
      },
      dao: {
        id: addresses.Avatar.toLowerCase(),
      },
      reputation: address1Rep,
    });
    expect(proposal.votes).toContainEqual({
      createdAt: v3Timestamp.toString(),
      outcome: 'Pass',
      proposal: {
        id: p1,
      },
      dao: {
        id: addresses.Avatar.toLowerCase(),
      },
      reputation: address2Rep,
    });
    expect(proposal.votes).toContainEqual({
      createdAt: v4Timestamp.toString(),
      outcome: 'Pass',
      proposal: {
        id: p1,
      },
      dao: {
        id: addresses.Avatar.toLowerCase(),
      },
      reputation: '1000',
    });
    expect(proposal.votes).toContainEqual({
      createdAt: v5Timestamp.toString(),
      outcome: 'Pass',
      proposal: {
        id: p1,
      },
      dao: {
        id: addresses.Avatar.toLowerCase(),
      },
      reputation: address4Rep,
    });

    const getProposalRewards = `{
        proposal(id: "${p1}") {
            gpRewards{
               beneficiary
               reputationForProposer
               tokenAddress
               tokensForStaker
               reputationForVoter
               daoBountyForStaker
               tokensForStakerRedeemedAt
               reputationForVoterRedeemedAt
               daoBountyForStakerRedeemedAt
               reputationForProposerRedeemedAt
            }
            accountsWithUnclaimedRewards
        }
    }`;

    const proposalIsIndexed = async () => {
      return (await sendQuery(getProposalRewards)).proposal.accountsWithUnclaimedRewards.length === 3;
    };

    await waitUntilTrue(proposalIsIndexed);

    proposal = (await sendQuery(getProposalRewards)).proposal;
    let gpRewards = proposal.gpRewards;
    expect(gpRewards).toContainEqual({
    beneficiary: accounts[1].address.toLowerCase(),
    daoBountyForStaker: '100000000000000000000',
    daoBountyForStakerRedeemedAt: '0',
    reputationForProposerRedeemedAt: '0',
    reputationForVoterRedeemedAt: '0',
    tokensForStakerRedeemedAt: '0',
    reputationForProposer: null,
    reputationForVoter: null,
    tokenAddress: addresses.GEN.toLowerCase(),
    tokensForStaker: '500000000000000000000',
  });
    expect(gpRewards).toContainEqual({
    beneficiary: web3.eth.defaultAccount.toLowerCase(),
    daoBountyForStaker: null,
    daoBountyForStakerRedeemedAt: '0',
    reputationForProposerRedeemedAt: '0',
    reputationForVoterRedeemedAt: '0',
    tokensForStakerRedeemedAt: '0',
    reputationForProposer: '5000000000000000000',
    reputationForVoter: '10000000000000000000',
    tokenAddress: null,
    tokensForStaker: null,
  });
    expect(proposal).toMatchObject({
    accountsWithUnclaimedRewards: [
      accounts[0].address.toLowerCase(),
      accounts[1].address.toLowerCase(),
      accounts[5].address.toLowerCase(),
    ]});
    async function redeem({ proposalId, beneficiary }) {
    const { blockNumber } = await genesisProtocol.methods
      .redeem(proposalId, beneficiary)
      .send();
    const { timestamp } = await web3.eth.getBlock(blockNumber);
    return timestamp;
  }

    async function redeemDaoBounty({ proposalId, beneficiary }) {
    const { blockNumber } = await genesisProtocol.methods
      .redeemDaoBounty(proposalId, beneficiary)
      .send();
    const { timestamp } = await web3.eth.getBlock(blockNumber);
    return timestamp;
  }
  // redeem for proposer
    const r1Timestamp = await redeem({
    proposalId: p1,
    beneficiary: web3.eth.defaultAccount.toLowerCase(),
  });
  // redeem for staker
    const r2Timestamp = await redeem({
    proposalId: p1,
    beneficiary: accounts[1].address.toLowerCase(),
  });

    // mint gen to avatr for the daoBounty
    await stakingToken.methods.mint(addresses.Avatar, '100000000000000000000').send();

    const rd1Timestamp = await redeemDaoBounty({
    proposalId: p1,
    beneficiary: accounts[1].address.toLowerCase(),
  });

    const redeemIsIndexed = async () => {
      const updatedGpRewards = (await sendQuery(getProposalRewards)).proposal.gpRewards;
      for (let i in updatedGpRewards) {
        if (updatedGpRewards[i].daoBountyForStakerRedeemedAt === rd1Timestamp.toString()) {
          return true;
        }
      }
      return false;
      };

    await waitUntilTrue(redeemIsIndexed);
    proposal = (await sendQuery(getProposalRewards)).proposal;
    gpRewards = proposal.gpRewards;
    expect(gpRewards).toContainEqual({
  beneficiary: accounts[1].address.toLowerCase(),
  daoBountyForStaker: '100000000000000000000',
  daoBountyForStakerRedeemedAt: rd1Timestamp.toString(),
  reputationForProposerRedeemedAt: '0',
  reputationForVoterRedeemedAt: '0',
  tokensForStakerRedeemedAt: r2Timestamp.toString(),
  reputationForProposer: null,
  reputationForVoter: null,
  tokenAddress: addresses.GEN.toLowerCase(),
  tokensForStaker: '500000000000000000000',
});
    expect(gpRewards).toContainEqual({
  beneficiary: web3.eth.defaultAccount.toLowerCase(),
  daoBountyForStaker: null,
  daoBountyForStakerRedeemedAt: '0',
  reputationForProposerRedeemedAt: r1Timestamp.toString(),
  reputationForVoterRedeemedAt: r1Timestamp.toString(),
  tokensForStakerRedeemedAt: '0',
  reputationForProposer: '5000000000000000000',
  reputationForVoter: '10000000000000000000',
  tokenAddress: null,
  tokensForStaker: null,
});

    let accountsWithUnclaimedRewardsIsIndexed = async () => {
      return (await sendQuery(getProposalRewards)).proposal.accountsWithUnclaimedRewards.length === 1;
    };

    await waitUntilTrue(accountsWithUnclaimedRewardsIsIndexed);

    expect(proposal).toMatchObject({ accountsWithUnclaimedRewards: [
      accounts[5].address.toLowerCase(),
    ]});

    await contributionReward.methods.redeem(p1, avatar.options.address, [true, true, true, true]).send();

    accountsWithUnclaimedRewardsIsIndexed = async () => {
      return (await sendQuery(getProposalRewards)).proposal.accountsWithUnclaimedRewards.length === 0;
    };

    await waitUntilTrue(accountsWithUnclaimedRewardsIsIndexed);

    proposal = (await sendQuery(getProposalRewards)).proposal;

    expect(proposal).toMatchObject({ accountsWithUnclaimedRewards: [] });

    const getGPQueues = `{
      gpqueues {
          threshold
          scheme {
            name
          }
      }
    }`;

    let gpQueues = (await sendQuery(getGPQueues)).gpqueues;

    expect(gpQueues).toContainEqual({
        threshold: Math.pow(2, REAL_FBITS).toString(),
        scheme: {
          name: 'ContributionReward',
        },
    });

    expect(gpQueues).toContainEqual({
        threshold: Math.pow(2, REAL_FBITS).toString(),
        scheme: {
          name: 'GenericScheme',
        },
    });

    expect(gpQueues).toContainEqual({
        threshold: Math.pow(2, REAL_FBITS + 1).toString(),
        scheme: {
          name: 'ContributionReward',
        },
    });

    const { proposalId: p2 } = await propose({
    rep: 10,
    tokens: 10,
    eth: 0,
    external: 0,
    periodLength: 0,
    periods: 1,
    beneficiary: accounts[1].address,
    });

    await stake({
      proposalId: p2,
      outcome: PASS,
      amount: web3.utils.toWei('101'),
      staker: accounts[0].address, // staker needs to be the proposer
    });

    const getExpiredProposal = `{
    proposal(id: "${p2}") {
        stage
        quietEndingPeriodBeganAt
        accountsWithUnclaimedRewards
    }}`;

    increaseTime(600 + 1 , web3);
    await genesisProtocol.methods.execute(p2).send();

    let stage = (await sendQuery(getExpiredProposal)).proposal.stage;
    expect((await sendQuery(getExpiredProposal)).proposal.stage).toEqual('Boosted');
    increaseTime((+gpParams.boostedVotePeriodLimit) - (+gpParams.quietEndingPeriod) + 1 , web3);
    let quietEndingPeriodBeganAt = await vote({
      proposalId: p2,
      outcome: PASS,
      voter: accounts[1].address,
    });

    expect((await sendQuery(getExpiredProposal)).proposal.stage).toEqual('QuietEndingPeriod');
    expect((await sendQuery(getExpiredProposal)).proposal.quietEndingPeriodBeganAt)
           .toEqual(quietEndingPeriodBeganAt.toString());
    increaseTime(1 , web3);
    quietEndingPeriodBeganAt = await vote({
      proposalId: p2,
      outcome: FAIL,
      voter: accounts[2].address,
    });
    expect((await sendQuery(getExpiredProposal)).proposal.stage).toEqual('QuietEndingPeriod');
    expect((await sendQuery(getExpiredProposal)).proposal.quietEndingPeriodBeganAt)
           .toEqual(quietEndingPeriodBeganAt.toString());
    increaseTime(300 + 1 , web3);
    await genesisProtocol.methods.execute(p2).send();
    expect((await sendQuery(getExpiredProposal)).proposal.accountsWithUnclaimedRewards)
    .toEqual([]);
  }, 100000);
});
