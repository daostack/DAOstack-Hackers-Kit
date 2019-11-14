# How To Use

In the following guide we describe how to instantiate classes and discuss the common methods shared by all Entities. Please refer to [complete API reference](https://daostack.github.io/client/docs/globals.html) for detailed list of properties and methods

## Configuration: Arc

The `Arc` class holds the basic configuration and serves as the main entrypoint when using the library. The user of the library must provide some basic configuration options.

### Configuration Options

  Please see the [API Reference](https://daostack.github.io/client/docs/classes/arc.html#constructor) for details of Configuration Options and their types.

  - _**contractInfos[]**_: contracts details. Can be set/fetch using subgraph by `setContractInfos`/`fetchContractInfos`
  - _**graphqlHttpProvider**_: http connection to the subgraph of TheGraph protocol
  - _**graphqlPrefetchHook()**_: function executed before sending graphQL query
  - _**graphqlSubscribeToQueries**_: determines if query should subscribe to updates from the graphProvider. Default True
  - _**graphqlWsProvider**_: web socket connection to subgraph of TheGraph protocol
  - _**ipfsProvider**_: connection to ipfs provider which is used as the data storage layer by DAOstack
  - _**web3Provider**_: connection to ethereum node
  - _**web3ProviderRead**_: connection to ethereum node to read Arc data. If provided arc will read all data from this provider, else set same as `web3Provider`

### Example

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

Some of these configuration settings are _**optional**_ to use `@daostack/client`. Like

  - For creating and sending transactions to the blockchain, it is sufficient to provide the `web3Provider`.
  - For fetching data from the subgraph, the `web3` and `ipfs` providers can be omitted when the library is only used.

## Entities

Entities are the basic building blocks of DAOstack ecosystem. All Entity classes can be created by providing an `id` (and an instance of `Arc`). 

### Example:

```
const proposal = new Proposal('0x1234....', arc)
```
The proposal object can now be used to vote, and stake.
```
await proposal.vote(...).send()
```
This call will register a vote by sending a transaction to the blockchain. [See below](#sending-transactions) for details.

Because the proposal is created with only an `id`, the client will query the subgraph for additional information, such as the address of the contract that the vote needs to be sent to. To make the client usable without having subgraph service available, all Entities have a second way of being created:
```
const proposal = new Proposal({
  id: '0x12455..',
  votingMachine: '0x1111..',
  scheme: '0x12345...'
}, arc)
```
This will provide the instance with enough information to send transactions without having to query the subgraph for additional information.


### Common methods and properties

All entities have:

  - _**context**_: arc configuration described [above](#initialization-arc-configuration)
  - _**id**_: unique identifier of the entity instance
  - _**staticState**_ (if any): object representing properties of the entity that does not change over time.

    eg. In case of entity DAO, `address` of Avatar or Native `reputation` of DAO

  - __**state()**__: methods that returns an observable of objects that represent the current state of the entity. </br>
    The _EntityState_ extends the `staticState` of the entity. It shall also include the properties that change over time.
  
    Like *DAOState* would contain `numberOfBoostedProposals` or `reputationTotalSupply` along with the base `staticState`

    eg. Subscribe to current state of the Proposal or DAO

        proposal.state().subscribe(
          (newState) => console.log(`This proposal has ${newState.votesFor} upvotes`)
        )

        dao.state().subscribe(
          (newState) => console.log(`This DAO has ${newState.memberCount} members`)
        )


  - _**search()**_: method which can be used to search for the entities on the subgraph.

    eg. To get all DAOs that are called `Foo`, you can do:

        DAO.search(arc, {where: { name: "Foo" }})
        
    **Note:** Search function must be provided with an `Arc` instance, so it knows which service to send the queries.

    All queries return [rxjs.Observable](http://reactivex.io/rxjs/class/es6/Observable.js~Observable.html).
    [See below](#search-and-observables) for further explanation.

## Search and Observables

The search functions are wrappers around graphql queries, and standard graphql syntax can be used
to filter and sort the queries, and for pagination:
```
Proposal.search({ where: { dao: '0x1234..' }})
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
const observable =  dao.proposals() // all proposals in this dao

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

Here is how you create a proposal in a DAO  for a contribution reward for a


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
