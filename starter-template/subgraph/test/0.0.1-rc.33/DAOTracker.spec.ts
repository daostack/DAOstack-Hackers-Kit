import { getArcVersion, getContractAddresses, getOptions, getWeb3, sendQuery } from './util';

const DAOTracker = require('@daostack/migration/contracts/' + getArcVersion() + '/DAOTracker.json');
const DaoCreator = require('@daostack/migration/contracts/' + getArcVersion() + '/DaoCreator.json');
const Avatar = require('@daostack/migration/contracts/' + getArcVersion() + '/Avatar.json');
const ContributionReward = require('@daostack/migration/contracts/' + getArcVersion() + '/ContributionReward.json');
const GenesisProtocol = require('@daostack/migration/contracts/' + getArcVersion() + '/GenesisProtocol.json');

describe('DAOTracker', () => {
  let web3;
  let addresses;
  let opts;
  let daoTracker;
  let daoCreator;
  let contributionReward;
  let genesisProtocol;
  let vmParamsHash;
  let schemeParamsHash;

  beforeAll(async () => {
    web3 = await getWeb3();
    addresses = getContractAddresses();
    opts = await getOptions(web3);
    daoTracker = new web3.eth.Contract(DAOTracker.abi, addresses.DAOTracker, opts);
    daoCreator = new web3.eth.Contract(DaoCreator.abi, addresses.DaoCreator, opts);
    contributionReward = new web3.eth.Contract(ContributionReward.abi, addresses.ContributionReward, opts);
    genesisProtocol = await new web3.eth.Contract(GenesisProtocol.abi, addresses.GenesisProtocol, opts);

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
    const vmSetParams = genesisProtocol.methods.setParameters(
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
    vmParamsHash = await vmSetParams.call();
    await vmSetParams.send();

    const schemeSetParams = contributionReward.methods.setParameters(vmParamsHash, genesisProtocol.options.address);
    schemeParamsHash = await schemeSetParams.call();
    await schemeSetParams.send();
  });

  const e2eControllerTest = async (isUController: boolean) => {
    const uControllerAddr = isUController ? addresses.UController : '0x0000000000000000000000000000000000000000';

    const tx = await daoCreator.methods.forgeOrg(
      'Test DAO',
      'Test Token',
      'TST',
      [opts.from],
      [0],
      [0],
      uControllerAddr,
      0,
    ).send();

    const avatarAddress = tx.events.NewOrg.returnValues._avatar;
    const avatar = await new web3.eth.Contract(Avatar.abi, avatarAddress, opts);

    const nativeTokenAddress = await avatar.methods.nativeToken().call();
    const reputationAddress = await avatar.methods.nativeReputation().call();
    const controllerAddress = await avatar.methods.owner().call();

    const { daotrackerContract } = await sendQuery(`{
      daotrackerContract(id: "${daoTracker.options.address.toLowerCase()}") {
        id
        address
        owner
      }
    }`, 5000);

    expect(daotrackerContract).toMatchObject({
      id: daoTracker.options.address.toLowerCase(),
      address: daoTracker.options.address.toLowerCase(),
      owner: web3.eth.defaultAccount.toLowerCase(),
    });

    const { reputationContract } = await sendQuery(`{
      reputationContract(id: "${reputationAddress.toLowerCase()}") {
        id
        address
      }
    }`, 5000);

    expect(reputationContract).toMatchObject({
      id: reputationAddress.toLowerCase(),
      address: reputationAddress.toLowerCase(),
    });

    const { tokenContract } = await sendQuery(`{
      tokenContract(id: "${nativeTokenAddress.toLowerCase()}") {
        id
        address
        owner
      }
    }`, 5000);

    expect(tokenContract).toMatchObject({
      id: nativeTokenAddress.toLowerCase(),
      address: nativeTokenAddress.toLowerCase(),
      owner: controllerAddress.toLowerCase(),
    });

    const { avatarContract } = await sendQuery(`{
      avatarContract(id: "${avatar.options.address.toLowerCase()}") {
        id
        address
        name
        nativeToken
        nativeReputation
        owner
      }
    }`, 5000);

    expect(avatarContract).toMatchObject({
      id: avatar.options.address.toLowerCase(),
      address: avatar.options.address.toLowerCase(),
      name: 'Test DAO',
      nativeToken: nativeTokenAddress.toLowerCase(),
      nativeReputation: reputationAddress.toLowerCase(),
      owner: controllerAddress.toLowerCase(),
    });

    // Add a scheme
    await daoCreator.methods.setSchemes(
      avatarAddress,
      [contributionReward.options.address],
      [schemeParamsHash],
      ['0x0000001F'],
      '',
    ).send();

    // Ensure the scheme is in the subgraph
    const { controllerSchemes } = await sendQuery(`{
      controllerSchemes {
        dao {
          id
        }
        address
      }
    }`, 15000);

    expect(controllerSchemes).toContainEqual({
      dao: {
        id: avatar.options.address.toLowerCase(),
      },
      address: contributionReward.options.address.toLowerCase(),
    });

    // Ensure the new DAO is in the subgraph
    const { dao } = await sendQuery(`{
      dao(id: "${avatar.options.address.toLowerCase()}") {
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
      }
    }`, 15000);

    expect(dao).toMatchObject({
      id: avatar.options.address.toLowerCase(),
      name: 'Test DAO',
      nativeToken: {
        id: nativeTokenAddress.toLowerCase(),
        dao: {
          id: avatar.options.address.toLowerCase(),
        },
      },
      nativeReputation: {
        id: reputationAddress.toLowerCase(),
        dao: {
          id: avatar.options.address.toLowerCase(),
        },
      },
    });

    return {
      avatar,
    };
  };

  it('Controller e2e', async () => {
    await e2eControllerTest(false);
  }, 120000);

  it('UController e2e', async () => {
    await e2eControllerTest(true);
  }, 120000);
});
