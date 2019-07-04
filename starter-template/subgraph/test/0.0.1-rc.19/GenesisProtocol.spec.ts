import {
  getContractAddresses,
  getOptions,
  getWeb3,
  increaseTime,
  nullAddress,
  sendQuery,
} from './util';

const DAOToken = require('@daostack/arc/build/contracts/DAOToken.json');
const GenesisProtocol = require('@daostack/arc/build/contracts/GenesisProtocol.json');
const GenesisProtocolCallbacks = require('@daostack/arc/build/contracts/GenesisProtocolCallbacksMock.json');
const Reputation = require('@daostack/arc/build/contracts/Reputation.json');

describe('GenesisProtocol', () => {
  let web3;
  let addresses;
  let genesisProtocol;
  let daoToken;
  let opts;
  let reputation;
  let genesisProtocolCallbacks;

  beforeAll(async () => {
    web3 = await getWeb3();
    addresses = getContractAddresses();
    opts = await getOptions(web3);

    const Rep = new web3.eth.Contract(Reputation.abi, undefined, opts);
    reputation = await Rep.deploy({
      data: Reputation.bytecode,
      arguments: [],
    }).send();
    genesisProtocol = new web3.eth.Contract(
      GenesisProtocol.abi,
      addresses.GenesisProtocol,
      opts,
    );

    daoToken = new web3.eth.Contract(DAOToken.abi, addresses.GEN, opts);

    genesisProtocolCallbacks = await new web3.eth.Contract(
      GenesisProtocolCallbacks.abi,
      undefined,
      opts,
    )
      .deploy({
        data: GenesisProtocolCallbacks.bytecode,
        arguments: [
          reputation.options.address,
          daoToken.options.address,
          genesisProtocol.options.address,
        ],
      })
      .send();

  });

  it('Sanity', async () => {
    const accounts = web3.eth.accounts.wallet;
    const gpParams = {
    queuedVoteRequiredPercentage: 50,
    queuedVotePeriodLimit: 60,
    boostedVotePeriodLimit: 5,
    preBoostedVotePeriodLimit: 0,
    thresholdConst: 2000,
    quietEndingPeriod: 0,
    proposingRepReward: 60,
    votersReputationLossRatio: 10,
    minimumDaoBounty: 15,
    daoBountyConst: 10,
    activationTime: 0,
    voteOnBehalf: '0x0000000000000000000000000000000000000000',
  };
    const setParams = genesisProtocol.methods.setParameters(
    [
      gpParams.queuedVoteRequiredPercentage,
      gpParams.queuedVotePeriodLimit,
      gpParams.boostedVotePeriodLimit,
      gpParams.preBoostedVotePeriodLimit,
      gpParams.thresholdConst,
      gpParams.quietEndingPeriod,
      gpParams.proposingRepReward,
      gpParams.votersReputationLossRatio,
      gpParams.minimumDaoBounty,
      gpParams.daoBountyConst,
      gpParams.activationTime,
    ],
    gpParams.voteOnBehalf,
  );

    const paramsHash = await setParams.call();
    await setParams.send();

    await daoToken.methods.mint(accounts[0].address, '100').send();

    await daoToken.methods.mint(accounts[1].address, '100').send();

    await daoToken.methods
      .approve(genesisProtocol.options.address, '100')
      .send();
    await reputation.methods.mint(accounts[0].address, '100').send();
    await reputation.methods.mint(accounts[1].address, '100').send();
    await reputation.methods.transferOwnership(genesisProtocolCallbacks.options.address).send();
    const propose = await genesisProtocolCallbacks.methods.propose(
      2,
      paramsHash,
      genesisProtocolCallbacks.options.address,
      accounts[1].address,
      nullAddress,
    );
    const proposalId = await propose.call();

    const txs = [];

    txs.push(await propose.send());
    // boost the proposal
    txs.push(
      await genesisProtocol.methods.stake(proposalId, 1 /* YES */, 20).send(),
    );

    txs.push(
      await genesisProtocol.methods
        .stake(proposalId, 1 /* YES */, 80)
        .send(),
    );
    // vote for it to pass

    txs.push(
      await genesisProtocol.methods
        .vote(proposalId, 1 /* YES */, 0, nullAddress)
        .send(),
    );

    // wait for proposal it pass
    await increaseTime(gpParams.boostedVotePeriodLimit * 1000, web3);
    txs.push(await genesisProtocol.methods.execute(proposalId).send());

    txs.push(
      await genesisProtocol.methods
        .redeem(proposalId, accounts[0].address)
        .send(),
    );

    const { genesisProtocolProposals } = await sendQuery(`{
      genesisProtocolProposals {
        proposalId
        submittedTime
        proposer
        daoAvatarAddress
        numOfChoices
        decision
        executionTime
        totalReputation
        executionState
        state
      }
    }`, 2000);

    expect(genesisProtocolProposals).toContainEqual({
      proposalId,
      submittedTime: (await web3.eth.getBlock(
        txs[0].blockNumber,
      )).timestamp.toString(),
      proposer: accounts[1].address.toLowerCase(),
      daoAvatarAddress: genesisProtocolCallbacks.options.address.toLowerCase(),
      numOfChoices: '2',
      state: 2 /* Executed */,
      decision: '1' /* YES */,
      executionState: 4, // enum ExecutionState
     // { None, QueueBarCrossed, QueueTimeOut, PreBoostedBarCrossed, BoostedTimeOut, BoostedBarCrossed}
      executionTime: (await web3.eth.getBlock(
        txs[4].blockNumber,
      )).timestamp.toString(),
      totalReputation:
        txs[4].events.ExecuteProposal.returnValues._totalReputation,
    });

    const { genesisProtocolExecuteProposals } = await sendQuery(`{
      genesisProtocolExecuteProposals {
        proposalId
        decision
        organization
        totalReputation
      }
    }`);

    expect(genesisProtocolExecuteProposals).toContainEqual({
      proposalId,
      decision: '1' /* YES */,
      organization: genesisProtocolCallbacks.options.address.toLowerCase(),
      totalReputation:
        txs[4].events.ExecuteProposal.returnValues._totalReputation,
    });

    const { genesisProtocolGPExecuteProposals } = await sendQuery(`{
      genesisProtocolGPExecuteProposals {
        proposalId
        executionState
      }
    }`);

    expect(genesisProtocolGPExecuteProposals).toContainEqual({
      proposalId,
      executionState: 4, //    enum ExecutionState
      //     { None, PreBoostedTimeOut, PreBoostedBarCrossed, BoostedTimeOut,BoostedBarCrossed }
    });
  }, 15000);
});
