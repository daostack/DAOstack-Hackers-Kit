import {
  createSubscriptionObservable,
  getArcVersion,
  getContractAddresses,
  getOptions,
  getWeb3,
  waitUntilTrue,
} from './util';

const Reputation = require('@daostack/migration/contracts/' + getArcVersion() + '/Reputation.json');
const UController = require('@daostack/migration/contracts/' + getArcVersion() + '/UController.json');
const Avatar = require('@daostack/migration/contracts/' + getArcVersion() + '/Avatar.json');
const DAOToken = require('@daostack/migration/contracts/' + getArcVersion() + '/DAOToken.json');
const gql = require('graphql-tag');

describe('Subscriptions', () => {
  let web3;
  let addresses;
  let opts;
  let reputation;
  let uController;
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
    const daoToken = new web3.eth.Contract(
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
  it('Run one subscription and test for updates', async () => {
    const SUBSCRIBE_QUERY = gql`
      subscription {
        reputationMints {
          contract
          amount
          address
        }
      }
    `;

    const subscriptionClient = await createSubscriptionObservable(
      SUBSCRIBE_QUERY, // Subscription query
      // {address: accounts[0].address.toLowerCase()} // Query variables
    );

    let event;
    let nextWasCalled = false;
    const consumer = await subscriptionClient.subscribe(
      (eventData) => {
        // Do something on receipt of the event
        nextWasCalled = true;
        event = eventData.data.reputationMints;
      },
      (err) => {
        expect(true).toEqual(false);
      },
    );
    await uController.methods.mintReputation('99', accounts[4].address, addresses.DemoAvatar)
    .send({from: accounts[0].address});

    // wait until the subscription callback has been called
    await waitUntilTrue(() => nextWasCalled);
    // this is done twice due to https://github.com/graphprotocol/graph-node/pull/1062
    nextWasCalled = false;
    await waitUntilTrue(() => nextWasCalled);

    expect(event).toContainEqual({
      address: accounts[4].address.toLowerCase(),
      amount: '99',
      contract: reputation.options.address.toLowerCase(),
    });

    consumer.unsubscribe();
  }, 2500);
});
