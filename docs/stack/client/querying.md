# Subscriptions

In this guide we describe how to query and subscribe to the subgraph that contains the index of DAOstack data.

## Query examples:
```
dao.proposals()
arc.sendQuery(`daos { id name }`)
proposal.state()
```

## What this does

Calling each of these function by itself will not actually send the qeury to the server.
Instead, each query returns an *observable*, to which you can subscribe.
Only at that moment will the server be queried:

```
const observable = arc.daos()
// only in the nexzt line will a query be sent to the server
const subscription = arc.daos.subscribe((daos) => console.log(`we found ${daos.length} results`))
```

By default, subscribing to an observable will do to things:

1. It will send a query to the server, fetching the data
2. It will send a subscription query to the server, which will cause the server to send you an update each time the data changes


Because subscriptions can be expensive, this behavior can be controlled in several ways.

First of all, we can pass Apollo's [`fetchPolicy`](https://www.apollographql.com/docs/react/api/react-apollo/#optionsfetchpolicy) argument to control how the query (from step 1) interacts with the cache:
```
arc.daos({}, { fetch-policy: 'cache-first'}) // the default value
arc.daos({where: {stage: "Boosted"}}, { fetch-policy: 'network-only'}) // bypass the cache
```


Regarding step 2, the creation of a subscription can be controlled by passing the `subscribe` parameter.
```
arc.daos({}, { subscribe: false})
dao.state({subscribe: false})
```
Although these queries will not subscribe themselves to updates, the observable will still watch for changes in the Appollo cache and return updated results if the cache changes.

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
`dao.proposals` query will fetch (and subscribe to) a much larger query - in particular, it will get all state data for each of the proposals. This means that when `prop.state()` is called, it will find all the needed information in the cache (and so it will nto send a new query to the server), and we can safely pass it the `subscribe: false` flag, because `dao.proposals()` already subscribes to updates for all the cached data.

For even more control over what data is being fetched and subscribed to, you can write explicit queries:

```
arc.apolloClient.sendQuery(gql`query { proposal (id: "0x1245") { votes: { id outcome }})`)
arc.apolloClient.subscribe(gql`subscribe { proposal (id: "0x1245") { votes: { id outcome }})`)
new Proposal("0x1245").votes({ subscribe: false }).subscribe(
  (next) => {

  }
)
```
