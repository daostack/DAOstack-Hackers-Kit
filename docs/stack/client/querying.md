## Query, Observables and Subscription

The entity methods provided by `@daostack/client` for querying the subgraph, by themself does not actually send the query to the server. Instead, each methods returns an *Observable* to which we can subscribe. *Subscriptions* are used so that our handler gets called every time a new value is emitted for the observable stream.

Take a look at the following methods that return observable:
```
dao.proposals()
proposal.state()
```

Now, in order to query the server we must subscribe
```
const observable = arc.daos()
// only in the next line will a query be sent to the server
const subscription = arc.daos.subscribe((daos) => console.log(`we found ${daos.length} results`))
```

In this guide we will describe how to query and subscribe to the subgraph that contains the index of DAOstack data.

## What does Subscription do and Why we use it?

By default, subscribing to an observable will do two things:

1. It will send a query to the server, fetching the data
2. It will send a subscription query to the server, which will cause the server to send you an update each time the data changes

Because subscriptions can be expensive, this behavior can be controlled in several ways.

First of all, we can pass Apollo's [`fetchPolicy`](https://www.apollographql.com/docs/react/api/react-apollo/#optionsfetchpolicy) argument to control how the query (from step 1) interacts with the cache:
```
arc.daos({}, { fetch-policy: 'cache-first'}) // the default value
arc.daos({where: {stage: "Boosted"}}, { fetch-policy: 'network-only'}) // bypass the cache
```

Regarding step 2, the creation of a subscription can be controlled by choosing the right [type of subscriptions](#types-of-subscriptions) as discussed below

## Types of Subscriptions

### Subscribe to Only Cache changes
The creation of a subscription can be controlled by passing the subscribe parameter.
In the following query we will subscribe not subscribe to updates from the server. The subscription will still watch changes in the Apollo cache and return updated results if the cache changes
```
arc.daos({}, { subscribe: false}).subscribe(() => {})
dao.state({subscribe: false}).subscribe( () => {})
```
NOTE: the cache could change as a result of another smaller query which does subscribe to server changes.

### Use fetchAllData with Nested subscription
Most of these methods are implemented in such a way that the queries will fetch (and subscribe to) just as much data as is needed to create the result set. For example, `dao.proposals()` will only fetch the proposal IDs. This can be controlled (in a limited way) by setting the parameter `fetchAllData` to true
```
dao.proposals({orderBy: "creationDate"}, {fetchAllData: true})
```
This is useful for cache handling, where it may be useful to have more complete control over what data is being fetched. Consider the following example, which will get the list of proposals from the dao, and then get the state for each of the proposals.
```
dao.proposals().subscribe(
  (props) => {
    for (let prop of props) {
      prop.state().subscribe(.....)
    }
  }
)
```
The problem with this pattern is that it is very expensive. The (subscription to) `dao.proposals(..)` will send a query and create a subscription, and then each of the calls to `proposal.state()` will create a new query and a separate subscription.

Consider now the following pattern:
```
dao.proposals({}, { fetchAllData: true }).subscribe(
  (props) => {
    for (let prop of props) {
      prop.state( {subscribe: false }).subscribe(.....)
    }
  }
)
```
This will resolve two inefficiencies. First of all, the `fetchAllData` in the proposals query will make it so that the
`dao.proposals` query will fetch (and subscribe to) a much larger query - in particular, it will get all state data for each of the proposals. This means that when `prop.state()` is called, it will find all the needed information in the cache (and so it will not send a new query to the server), and we can safely pass it the `subscribe: false` flag, because `dao.proposals()` already subscribes to updates for all the cached data.

### Subscribe to explicit query

For even more control over what data is being fetched and subscribed to, you can write explicit queries:

```
arc.apolloClient.sendQuery(gql`query { proposal (id: "0x1245") { votes: { id outcome }})`)
arc.apolloClient.subscribe(gql`subscribe { proposal (id: "0x1245") { votes: { id outcome }})`)
new Proposal("0x1245").votes({ subscribe: false }).subscribe(
  (next) => {

  }
)
```
