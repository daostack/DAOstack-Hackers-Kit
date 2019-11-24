# How To Use

In the following guide we describe how to instantiate classes and discuss the common methods shared by all Entities. Please refer to [complete API reference](https://daostack.github.io/client/docs/globals.html) for detailed list of properties and methods

## Configuration: Arc

The `Arc` class holds the basic configuration and serves as the main entrypoint when using the library. The user of the library must provide some basic configuration options.

### Configuration Options

  Please see the [API Reference](https://daostack.github.io/client/docs/classes/arc.html#constructor) for details of Configuration Options and their types.

  - _**contractInfos[]**_: contracts details. Can be set/fetch using subgraph by `setContractInfos`/`fetchContractInfos`.
  - _**graphqlHttpProvider**_: http connection to the subgraph of TheGraph protocol. Needed for graphQL queries.
  - _**graphqlPrefetchHook()**_: function executed before sending graphQL query.
  - _**graphqlSubscribeToQueries**_: determines if query should subscribe to updates from the graphProvider. Default True.
  - _**graphqlWsProvider**_: web socket connection to subgraph of TheGraph protocol. Needed for subscriptions.
  - _**ipfsProvider**_: connection to ipfs provider which is used as the data storage layer by DAOstack. The configuration is either a string or an object as
  [used here](https://github.com/ipfs/js-ipfs-http-client#importing-the-module-and-usage)
  - _**web3Provider**_: connection to ethereum node which it is presumed has a default account enabling transactions to be sent. Required to create and send transactions to the blockchain.
  - _**web3ProviderRead**_: connection to ethereum node to read Arc data. If provided arc will read all data from this provider, else if null/not provided it is set same as `web3Provider`. This is readonly and won't enable the user to submit transactions.

Example

```
import { Arc } from '@daostack/client'

const arc = new Arc({
  graphqlHttpProvider: "https://subgraph.daostack.io/subgraphs/name/v23",
  graphqlWsProvider: "wss://ws.subgraph.daostack.io/subgraphs/name/v23",
  web3Provider: `wss://mainnet.infura.io/ws/v3/e0cdf3bfda9b468fa908aa6ab03d5ba2`,
  ipfsProvider: {
    "host": "subgraph.daostack.io",
    "port": "443",
    "protocol": "https",
    "api-path": "/ipfs/api/v0/"
  }
})

// before we can use the Arc instance to send transactions, we need to provide it
// with information on where the contracts can be found
// query the subgraph for the contract addresses, and use those
await arc.fetchContractInfos()
```

**Note:**

  - If you instantiate arc with ipfs configuration, then `arc.ipfs` will have all the methods of the ipfslcient api available. Refer to [ipfs client api](https://github.com/ipfs/js-ipfs-http-client#api)
  - Some of these configuration settings are _**optional**_ while using `@daostack/client`. For example:
    - For using client to only create and send transactions to the blockchain, it is sufficient to provide the `web3Provider`.
    - For using client to only read blockchain data, it is sufficient to provide the `web3ProviderRead`.
    - When using client only to interact with subgraph, it is sufficient to provide `graphqlHttpProvider` and/or `graphqlWsProvider`.

## Entities

Entities are the basic building blocks of DAOstack ecosystem.

The entity instance holds the `statoc` and `dynamic` state of the entity it represents and encapsulates graphql queries to retrieve data from subgraph. The client library caches entity data. Please refer to [Common properties and methods](#common-methods-and-properties) section for more information about what is cached and how to retrieve it.


While the entity classes provide nice helper methods that encapsulate graphql queries, you can also submit your own customized graphql queries using the static method `arc.apolloClient`. Please refer to the [Queries](../querying/#query) section about all the ways to query subgraph.

### Instantiate

All Entity classes can be created by providing an instance of `Arc` and either of the following:

  - `id`: in this case a query to the subgraph is used to hydrate the entity.
  - `staticState`: here entity's desired "static state" is provided at initialization and the subgraph query is bypassed.

#### By providing entity id

When using the client library with an `arc` instance which has subgraph configuration, it is sufficient to provide just an `id`. In this case, to vote or stake, the proposal object will need additional information (stored by the `staticState` of Entity) such as the address of the voting machine contract to which votes will be sent. The client will query the subgraph for this minimal set of information.

Example
```
const arc = new Arc({
  graphqlHttpProvider: "https://api.thegraph.com/subgraphs/name/daostack/alchemy",
  graphqlWsProvider: "wss://api.thegraph.com/subgraphs/name/daostack/alchemy",
  web3Provider: `wss://mainnet.infura.io/ws/v3/e0cdf3bfda9b468fa908aa6ab03d5ba2`,
})
const proposal = new Proposal('0x1234....', arc)

await proposal.vote(...).send()
```

#### By providing static entity state

To make the client usable without having subgraph service available, all Entities can also be created by providing the 'static state'. This will provide the instance with enough information to send transactions without having to query the subgraph for additional information.

Example
```
const arc = new Arc({
  web3Provider: `wss://mainnet.infura.io/ws/v3/e0cdf3bfda9b468fa908aa6ab03d5ba2`,
})
const proposal = new Proposal({
  id: '0x12455..',
  votingMachine: '0x1111..',
  scheme: '0x12345...'
}, arc)
```

### Common methods and properties

All entities have:

  - _**context**_: arc configuration described [above](#initialization-arc-configuration)
  - _**id**_: unique identifier of the entity instance. Various Entity class Id represents the information as described below:

      - `address`: DAO, Reputation, Token
      - `hash(ReputationAddress, RepHolderAddress)`: Members
      - `proposalId` as on blockchain: Proposal
      - `hash(proposalId, beneficiaryAddress)`: Reward
      - `hash(daoAddress, schemeAddress)`: Scheme
      - `eventId`: Stake, Vote
      
  - _**staticState**_ <sup>[1]</sup>: object representing properties of the entity that does not change over time.
    e.g. In case of entity DAO, `address` of Avatar or Native `reputation` of DAO

  - _**fetchStaticState()**_ <sup>[1]</sup>: method that returns an observable of object that represent the `staticState` of the entity.
    If the staticState is not set ( as [here](#by-providing-id) ), then at first use it queries the subgraph and `setStaticState`.

  - _**setStaticState()**_ <sup>[1]</sup>: method that sets the static state to the state provided as parameter.

  - __**state()**__: method that returns an observable of objects that represent the current dynamic state of the entity. </br>
    The dynamic state extends the static state to include properties that may change over time.
  
    e.g. *IDAOState* is dynamic state that would contain `numberOfBoostedProposals` or `reputationTotalSupply` along with the base static state of the DAO entity.

    e.g. Subscribe <sup>[2]</sup> to current state of the Proposal or DAO

        proposal.state().subscribe(
          (newState) => console.log(`This proposal has ${newState.votesFor} upvotes`)
        )

        dao.state().subscribe(
          (newState) => console.log(`This DAO has ${newState.memberCount} members`)
        )

  - _**search()**_ <sup>[3]</sup>: method which can be used to search for the entities on the subgraph.

    Parameters:

      - **context**: must be provided with an `Arc` instance with subgraph details, so it knows which service to send the queries. 
      - **options** (optional): [query filter options](#search-filters-and-observables)
      - **apolloQueryOptions** (optional): [apollo query options](../querying/#optimizing-how-subscriptions-use-the-cache)

    By default it will return an observable of `id(s)` of the subgraph Entity for the given filter query, but can be modified to fetch the `state()` using `apolloQueryOptions`.

    eg. To get all DAOs that are called `Foo`, you can do:

        DAO.search(
          arc,
          {where: { name: "Foo" }}
        )
        
    eg. To get current state of all DAOs that are called `Foo` ordered by `createdAt`, you can do:

        DAO.search(
          arc, // context
          {where: 
            { name: "Foo" },
            orderBy: "createdAt"
          }, // options
          {fetchAllData: true} // apolloQueryOptions
        )
      
**Note:**

  1. `staticState`, `setStaticState` and `fetchStaticState` is not available for all Entities consistantly and might be discontinued or restructured in future versions.
  2. There is a difference between `state().subscribe` and `state({subscribe: true})`. Refer [Types of Subscriptions](../querying/#subscribe-to-apollo-cache-changes)
  3. All queries return [rxjs.Observable](http://reactivex.io/rxjs/class/es6/Observable.js~Observable.html). [See below](#search-filters-and-observables) for further explanation.

## Search filters and Observables

The search functions are wrappers around graphql queries and standard [graphql syntax](../../subgraph/queries/) can be used to filter and sort the queries, and for pagination:
```
Proposal.search(arc, { where: { dao: '0x1234..' }})
```

```
  dao.proposals({ where: { scheme: '0xffcf8fdee72ac11b5c542428b35eef5769c409f0'}})
  dao.proposals({ where: { scheme_in: ['0xffcf8fdee72ac11b5c542428b35eef5769c409f0']}})
```

Paging
```
  dao.proposals({ skip: 100, first: 100})
```

Sorting:
```
  dao.proposals({ orderBy: 'createdAt', orderDirection: 'desc'})
```

All these queries return an [rxjs `Observable`](https://rxjs-dev.firebaseapp.com/guide/observable) object.

This observables return a stream of results. Every time the data in the query gets updated, the observable will emit a new result.

Observables are very flexible. Typically, an observable will be used by creating a subscription as described below.
Please refer to [Subscriptions section](../querying/) for details on when and how to use it and the types of subscription.

```
const observable =  dao.proposals({subscribe: true}) // all proposals in this dao

// a subscription
const subscription = observable.subscribe(
  (next) => console.log(`Now there are ${next.length} proposals`) // will be called each time the data from the qeury changes
)
subscription.unsubscribe() // do not forget to unsubscribe
```
If you are only interested in the first result, but do not want to get further updates when the data is changed, there is a helper function that returns a Promise
with the first result
```
const observable =  dao.proposals() // all proposals in this dao
const proposals = await observable.first() // returns a list of Proposal instances
```

## Sending transactions

One of the purposes of the client library is to make help with interactions with the DAOstack Ethereum contracts.

Here is how you create a proposal in a DAO  for a contribution reward


```
const DAO = new DAO('0x123DAOADDRESS')
const tx = dao.createProposal({
  beneficiary: '0xffcf8fdee72ac11b5c542428b35eef5769c409f0',
  ethReward: toWei('300'),
  nativeTokenReward: toWei('1'),
  periodLength: 0,
  periods: 1,
  reputationReward: toWei('10'),
  scheme: '0xContributionRewardAddress' // address of a contribution reward scheme that is registered with this DAO
})
```

All functions that send a transaction to the blockchain (like `DAO.createProposal`, `Proposal.vote`, `Token.mint`, etc, etc) return an rxjs Observable. This observable returns a stream of updates about the state of the transaction: first when it is sent, then when it is mined and confirmed.

You can subscribe to the transaction:

```
tx.subscribe(
  (next) => {
    console.log(next.state) // sending, sent, or mined
    if (next.stage === ITransactionStage.Mined) {
      console.log(`This transaction has ${next.confirmations} confirmations`)
      console.log(next.result)
    }
  })
```

All operations also provide a convenience function `send()` that returns a promise that resolves when the transaction is mined

```
const voteTransaction = await proposal.vote(...).send()
const vote = voteTransaction.result // an instance of Vote
```

For details, checkout complete [API reference](https://daostack.github.io/client/docs/globals.html)
