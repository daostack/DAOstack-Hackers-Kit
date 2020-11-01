
# Arc.js

Arc.js is a javascript library that provides a helpful set of tools to interact with the DAOstack ecosystem.

In particular, the library provides an interface to

- DAOstack contracts
- DAOstack subgraph (an index of on-chain data).

## Developing

For development, it is useful to have local instances of Ganache (an ethereum node), IPFS (which is used to store data), an instance of The Graph with the DAOStack subgraph.
The package is provided with convenient docker containers that provide  a  complete environment for testing and development:

Get all services running:
```sh
docker-compose up
```

This command will build and start a graph instance, ganache, IPFS and postgresql.


To run the tests, run:
```
npm run test
```

You may also want to run the (demo.js)[./documentation/demo.js] file for some concrete examples of the usage of the library:
```
node documentation/demo.js
```
After you are done, run:
```
docker-compose down
```

## Adding an Entity

The `Event` entity will be used as example in this section. To add an entity to the library, you must:

1. Create an interface that defines the entity state.

```ts
export interface IEventState {
  id: string
  dao: string
  proposal: string
  user: string
  type: string
  data: { [key: string]: any }
  timestamp: string
}
```

2. Create an interface that defines the possible options to query the entity. This interface must extend the `ICommonQueryOptions` interface.

```ts
export interface IEventQueryOptions extends ICommonQueryOptions {
  where?: {
    id?: string;
    dao?: Address;
    proposal?: string;
    user?: Address;
    [key: string]: any;
  }
}
```

3. Create the entity class. This class must extend the `Entity<TState>` abstract class, where `TState` is the interface created in step 1.

4. Implement the public static `fragments` field. Here you can define entity related GraphQL fragments to use in GraphQL queries.

```ts
public static fragments = {
    EventFields: gql`
      fragment EventFields on Event {
        id
        dao {
          id
        }
        type
        data
        user
        proposal {
          id
        }
        timestamp
      }
    `
  }
```

5. Implement the public static itemMap method. This method follows the following signature: 

```ts
public static itemMap(context: Arc, item: any, queriedId?: string): IEntityState
```

The goal of this method is to map the item object received by a query to an object of its interface.

It takes an optional `queriedId` parameter. This is the ID passed to the `where` clause of the GraphQL query. It is passed to have a meaningful error message, in case the query fails or does not yield any results.

```ts
public static itemMap(context: Arc, item: any, queriedId?: string): IEventState {
  if (!item) {
    throw Error(`Event ItemMap failed. ${queriedId ? `Could not find Event with id '${queriedId}'` : ''}`)
  }

  return {
    dao: item.dao.id,
    data: JSON.parse(item.data),
    id: item.id,
    proposal: item.proposal && item.proposal.id,
    timestamp: item.timestamp,
    type: item.type,
    user: item.user
  }
}
```

6. Implement the public static search method, which follows the signature:

```ts
public static search(
  context: Arc,
  options: IEventQueryOptions = {},
  apolloQueryOptions: IApolloQueryOptions = {}
): Observable<Event[]>
```

It typically builds a search query using the GraphQL fragments defined in step 4.

This method must return a call to `context.getObservableList` and its return type should be casted to `Observable<Entity>`, where entity is the Entity class where this method is being defined.

```ts
public static search(
  context: Arc,
  options: IEventQueryOptions = {},
  apolloQueryOptions: IApolloQueryOptions = {}
): Observable<Event[]> {
  const itemMap = (arc: Arc, item: any, queriedId?: string) => {
    const state = Event.itemMap(arc, item, queriedId)
    return new Event(arc, state)
  }

  const query = gql`query EventSearch {
      events ${createGraphQlQuery(options)}
      {
        ...EventFields
      }
    }
    ${Event.fragments.EventFields}
  `

  return context.getObservableList(context, query, itemMap, options.where?.id, apolloQueryOptions) as Observable<Event[]>
}
```

7. Implement the public `state` method. This method queries the subgraph for the entity based on its ID, to retrieve its state. The method must return a `this.context.getObservableObject` call.

```ts
public state(apolloQueryOptions: IApolloQueryOptions = {}): Observable<IEventState> {
  const query = gql`
    query EventState {
      event (id: "${this.id}")
      {
        ...EventFields
      }
    }
    ${Event.fragments.EventFields}
  `

  return this.context.getObservableObject(this.context, query, Event.itemMap, this.id, apolloQueryOptions)
}
```

8. Export this class in the `./src/index.ts` file, using `export * from` syntax.

**It is important to note all imports from this library must be imported from the ./src/index.ts file.**

## Adding a Plugin

Adding a plugin is similar to adding an entity, with the following differences:

1. The interface that defines the Entity state must extend `IPluginState` interface. Typically it just adds the `pluginParams`field.

```ts
export interface IGenericPluginState extends IPluginState {
  pluginParams: {
    votingMachine: Address
    contractToCall: Address
    voteParams: IGenesisProtocolParams
  }
}
```

2. `Proposal` and `Plugin` abstract classes both have an `itemMapToBaseState` method that eases `itemMap` implementation and reduces code boilerplate.

3. If the `Plugin` can create `Proposals`, then the added plugin must extend from abstract class `ProposalPlugin<IPluginState, IProposalState, IProposalCreateOptions>`

`IPluginState` is the interface defined in the previous step. `IProposalState` is the interface that defines the state of the proposal that can be created by the plugin. `IProposalCreateOptions` is the interface that defines the options passed to create a proposal using the plugin.

If the `Plugin` cannot create `Proposals`, then it must extend from the `Plugin<IPluginState>` abstract class.

4. If the plugin has fields that should be queried in the `Plugin`'s class baseFragment query, then it must define a public static `fragment` field which has the following signature:

```ts
public static fragment: { name: string, fragment: DocumentNode }
```

`name` is the name of the GraphQL fragment. It must match the name used in the fragment definition. `fragment` is the actual GraphQL fragment.

```ts
public static fragment = {
    name: 'GenericpluginParams',
    fragment: gql`
      fragment GenericpluginParams on ControllerScheme {
        genericSchemeParams {
          votingMachine
          contractToCall
          voteParams {
            queuedVoteRequiredPercentage
            queuedVotePeriodLimit
            boostedVotePeriodLimit
            preBoostedVotePeriodLimit
            thresholdConst
            limitExponentValue
            quietEndingPeriod
            proposingRepReward
            votersReputationLossRatio
            minimumDaoBounty
            daoBountyConst
            activationTime
            voteOnBehalf
          }
        }
      }
    `
  }
```

5. The plugin class must be exported in the `./src/plugins/utils.ts` file. Including it in the already exported `Plugins` or `ProposalPlugins` object, mapped to its subgraph name.

6. The `IProposalCreateOptions` interface must be included in the already exported `ProposalCreateOptions` type in the `./src/plugins/utils.ts` file.

## Adding a Proposal

Adding a `Proposal` follows similar rules to adding a `Plugin`, noting that created `Proposal` classes must be exported in the same way plugins are.

## Testing

run a specific test:
```sh
npm run test -- test/arc.spec.ts
```
Or watch:
```sh
npm run test -- --watch
```

### Commands

 - `npm run build`: Generate bundles and typings, create docs
 - `npm run lint`: Lints code
 - `npm run test`: run all tests
