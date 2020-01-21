import { getArcVersion, getContractAddresses, getOptions, getWeb3, sendQuery } from './util';

const Reputation = require('@daostack/migration/contracts/' + getArcVersion() + '/Reputation.json');
const UController = require('@daostack/migration/contracts/' + getArcVersion() + '/UController.json');
const Avatar = require('@daostack/migration/contracts/' + getArcVersion() + '/Avatar.json');
const DAOToken = require('@daostack/migration/contracts/' + getArcVersion() + '/DAOToken.json');

describe('Reputation', () => {
  let web3;
  let addresses;
  let reputation;
  let opts;
  let uController;
  let daoToken;
  let accounts;

  beforeAll(async () => {
    web3 = await getWeb3();
    addresses = getContractAddresses();
    opts = await getOptions(web3);
    accounts = web3.eth.accounts.wallet;
    uController = new web3.eth.Contract(
      UController.abi,
      addresses.UController,
      opts,
    );
    reputation = new web3.eth.Contract(
      Reputation.abi,
      addresses.DemoReputation,
      opts,
    );
    daoToken = new web3.eth.Contract(
      DAOToken.abi,
      addresses.DemoDAOToken,
      opts,
    );
    const avatar = new web3.eth.Contract(
      Avatar.abi,
      addresses.DemoAvatar,
      opts,
    );

    if (await avatar.methods.owner().call() === accounts[0].address) {
        await avatar.methods.transferOwnership(uController.options.address).send({from: accounts[0].address});

    }
    if (await reputation.methods.owner().call() === accounts[0].address) {
       await reputation.methods.transferOwnership(uController.options.address).send();
    }
    if (await daoToken.methods.owner().call() === accounts[0].address) {
       await daoToken.methods.transferOwnership(uController.options.address).send();
    }
    let organs = await uController.methods.organizations(avatar.options.address).call();
    if (organs[0] !== daoToken.options.address) {
        await uController.methods.newOrganization(avatar.options.address).send();
    }
  });

  async function checkTotalSupply(value) {
    const { reputationContracts } = await sendQuery(`{
      reputationContracts {
        address,
        totalSupply
      }
    }`);
    expect(reputationContracts).toContainEqual({
      address: reputation.options.address.toLowerCase(),
      totalSupply: parseInt(await reputation.methods.totalSupply().call(), 10) + '',
    });
  }

  it('Sanity', async () => {
    let txs = [];

    txs.push(await uController.methods.mintReputation(100, accounts[0].address, addresses.DemoAvatar)
    .send({from : accounts[0].address}));

    let firstMemberCreatedAt = (await web3.eth.getBlock(
      txs[0].blockNumber,
    )).timestamp.toString();
    await checkTotalSupply(100);
    txs.push(await uController.methods.mintReputation('100' , accounts[1].address, addresses.DemoAvatar).send());

    await checkTotalSupply(200);
    txs.push(await uController.methods.burnReputation('30', accounts[0].address, addresses.DemoAvatar).send());
    await checkTotalSupply(170);

    txs.push(await uController.methods.mintReputation('300', accounts[2].address, addresses.DemoAvatar).send());
    let secondMemberCreatedAt = (await web3.eth.getBlock(
      txs[3].blockNumber,
    )).timestamp.toString();
    await checkTotalSupply(470);
    txs.push(await uController.methods.burnReputation('100' , accounts[1].address, addresses.DemoAvatar).send());
    await checkTotalSupply(370);
    txs.push(await uController.methods.burnReputation('1', accounts[2].address, addresses.DemoAvatar).send());
    await checkTotalSupply(369);

    txs = txs.map(({ transactionHash }) => transactionHash);

    const { reputationHolders } = await sendQuery(`{
      reputationHolders {
        contract,
        address,
        balance,
        createdAt
      }
    }`);

    expect(reputationHolders.length).toBeGreaterThanOrEqual(2);
    expect(reputationHolders).toContainEqual({
      contract: reputation.options.address.toLowerCase(),
      address: accounts[0].address.toLowerCase(),
      balance: parseInt(await reputation.methods.balanceOf(accounts[0].address).call(), 10) + '',
      createdAt: firstMemberCreatedAt,
    });
    expect(reputationHolders).toContainEqual({
      contract: reputation.options.address.toLowerCase(),
      address: accounts[2].address.toLowerCase(),
      balance: parseInt(await reputation.methods.balanceOf(accounts[2].address).call(), 10) + '',
      createdAt: secondMemberCreatedAt,
    });

    const { reputationMints } = await sendQuery(`{
      reputationMints {
        txHash,
        contract,
        address,
        amount
      }
    }`);

    expect(reputationMints.length).toBeGreaterThanOrEqual(3);
    expect(reputationMints).toContainEqual({
      txHash: txs[0],
      contract: reputation.options.address.toLowerCase(),
      address: accounts[0].address.toLowerCase(),
      amount: '100',
    });
    expect(reputationMints).toContainEqual({
      txHash: txs[1],
      contract: reputation.options.address.toLowerCase(),
      address: accounts[1].address.toLowerCase(),
      amount: '100',
    });
    expect(reputationMints).toContainEqual({
      txHash: txs[3],
      contract: reputation.options.address.toLowerCase(),
      address: accounts[2].address.toLowerCase(),
      amount: '300',
    });

    const { reputationBurns } = await sendQuery(`{
      reputationBurns {
        txHash,
        contract,
        address,
        amount
      }
    }`);

    expect(reputationBurns.length).toBeGreaterThanOrEqual(3);
    expect(reputationBurns).toContainEqual({
      txHash: txs[2],
      contract: reputation.options.address.toLowerCase(),
      address: accounts[0].address.toLowerCase(),
      amount: '30',
    });
    expect(reputationBurns).toContainEqual({
      txHash: txs[4],
      contract: reputation.options.address.toLowerCase(),
      address: accounts[1].address.toLowerCase(),
      amount: '100',
    });
    expect(reputationBurns).toContainEqual({
      txHash: txs[5],
      contract: reputation.options.address.toLowerCase(),
      address: accounts[2].address.toLowerCase(),
      amount: '1',
    });
  }, 100000);
});
