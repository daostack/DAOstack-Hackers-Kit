# Registering a Plugin in Arc.js

## Creating the folder structure

To register a new plugin, add a folder in the `src/plugins` folder, with the name of the plugin to register and create 3 files:

* proposal.ts

* plugin.ts

* index.ts

The index file is always the same:

```ts
export * from './plugin'
export * from './proposal'
```

The Plugin class definition will live in the `plugin.ts` file and the Proposal class definition will live in the `proposal.ts` file.

## Creating the Plugin class

### Interfaces

The first step is to create 3 necessary interfaces:

* **Plugin State**: it describes the plugin state and must extend `IPluginState` interface. Typically it just adds the `pluginParams`field. Example with the `TokenTrade` plugin:

```ts
export interface ITokenTradeState extends IPluginState {
  pluginParams: {
    votingMachine: Address
    voteParams: IGenesisProtocolParams
  }
}
```

* **Proposal Creation Options**: it describes the arguments to pass to the proposal creation method. Must extend the `IProposalBaseCreateOptions`. Base options like dao address are already declared in the `IProposalBaseCreateOptions` interface. Example with the `TokenTrade` plugin:

```ts
export interface IProposalCreateOptionsTokenTrade extends IProposalBaseCreateOptions {
  sendTokenAddress: Address,
  sendTokenAmount: number,
  receiveTokenAddress: Address,
  receiveTokenAmount: number,
  descriptionHash: string
}
```

* **Initialize Parameters**: it describes the parameters to pass to the initialize contract method. Example with the `TokenTrade` plugin:

```ts
export interface IInitParamsTT {
  daoId: string
  votingMachine: string
  votingParams: number[]
  voteOnBehalf: string
  voteParamsHash: string
}
```

### Class definition

If the plugin can create proposals, it must extend the `ProposalPlugin` class, if it can't, then it must extend the `Plugin` class.

For this example, we will be using the `TokenTrade` plugin. 

The next step is to declare the class and make it extend `ProposalPlugin`, passing the 3 interfaces created in the previous section as type parameters:

```ts
export class TokenTrade extends ProposalPlugin<
  ITokenTradeState,
  ITokenTradeProposalState,
  IProposalCreateOptionsTokenTrade> {... }
```

### Item Map

Implement the public static itemMap method. This method follows the following signature: 

```ts
public static itemMap(context: Arc, item: any, queriedId?: string): ITokenTradeState
```

The goal of this method is to map the item object received by a query to an object of its interface.

`Proposal` and `Plugin` abstract classes both have an `itemMapToBaseState` method that eases `itemMap` implementation and reduces code boilerplate.

It takes an optional `queriedId` parameter. This is the ID passed to the `where` clause of the GraphQL query. It is passed to have a meaningful error message, in case the query fails or does not yield any results. Should return null if it did not return results:

```ts
public static itemMap(context: Arc, item: any, queriedId?: string): ITokenTradeState | null {
    if (!item) {
      return null
    }

    if (!item.tokenTradeParams) {
      throw new Error(`Plugin ${queriedId ? `with id '${queriedId}'` : ''}wrongly instantiated as TokenTrade Plugin`)
    }

    const baseState = Plugin.itemMapToBaseState(context, item)

    const tokenTradeParams = {
      voteParams: mapGenesisProtocolParams(item.tokenTradeParams.voteParams),
      votingMachine: item.tokenTradeParams.votingMachine
    }

    return {
        ...baseState,
        pluginParams: tokenTradeParams
      }
  }
```

### Initialize Params Mapper

Next, implement the `initializeParamsMap` method, which follows the signature:

```ts
public static initializeParamsMap(initParams: IInitParamsTT)
```

It takes an object with the plugin's initialize parameters and returns an array with the parameters organized in the correct order to be passed to its contract, through the `PluginManager`:

```ts
public static initializeParamsMap(initParams: IInitParamsTT) {

  Object.keys(initParams).forEach((key) => {
    if (initParams[key] === undefined) {
      throw new Error(`TokenTrade's initialize parameter '${key}' cannot be undefined`)
    }
  })

  return [
    initParams.daoId,
    initParams.votingMachine,
    initParams.votingParams,
    initParams.voteOnBehalf,
    initParams.voteParamsHash
  ]
}
```

### Fragment

Declare the public static `fragment` getter method and `fragmentField` private static property:

```ts
private static fragmentField: { name: string, fragment: DocumentNode } | undefined
```

```ts
public static get fragment() {
    if (!this.fragmentField) {
      this.fragmentField = {
        name: 'TokenTradeParams',
        fragment: gql` fragment TokenTradeParams on ControllerScheme {
          tokenTradeParams {
            id
            votingMachine
            voteParams {
              id
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
        }`
      }
    }

    return this.fragmentField
  }
```

Its objective is to include this plugin's specific fields in the general plugin search query. 

The name used for the actual GraphQL fragment definition must match the name property of the `fragmentField` property, in this case they both are: 'TokenTradeParams'. Typically the fragment starts with the name of the plugin, camel-cased and followed by 'Params', in this case it is 'tokenTradeParams'

### Create Proposal

Next, implement the `createProposalTransactionMap` and `createProposalErrorHandler`, that always follow the same pattern:

```ts
  public createProposalTransactionMap(): transactionResultHandler<any> {
    return async (receipt: ITransactionReceipt) => {
      const args = getEventArgs(receipt, 'TokenTradeProposed', 'TokenTrade.createProposal')
      const proposalId = args[1]
      return new TokenTradeProposal(this.context, proposalId)
    }
  }

  public createProposalErrorHandler(options: IProposalCreateOptionsTokenTrade): transactionErrorHandler {
    return async (err) => {
      throw err
    }
  }

```

You would only need to change the name of the event emitted by the contract on proposal creation, and the create proposal method, as shown above.

Lastly, implement the `createProposalTransaction` method. This method has validation logic for each of the proposal creation options, saves the description hash to IPFS if there is none created beforehand and returns an object that contains the plugin's contract address, the name of the contract method to create a proposal and the arguments for it, organized in an array:

```ts
public async createProposalTransaction(options: IProposalCreateOptionsTokenTrade): Promise<ITransaction> {

    if (options.plugin === undefined) {
      throw new Error(`Missing argument "plugin" for TokenTrade in Proposal.create()`)
    }
    if (!options.receiveTokenAddress) {
      throw new Error(`Missing argument "receiveTokenAddress" for TokenTrade in Proposal.create()`)
    }
    if (!options.sendTokenAddress) {
      throw new Error(`Missing argument "sendTokenAddress" for TokenTrade in Proposal.create()`)
    }
    if (options.receiveTokenAmount <= 0) {
      throw new Error(`Argument "receiveTokenAmount" must be greater than 0 for TokenTrade in Proposal.create()`)
    }
    if (options.sendTokenAmount <= 0) {
      throw new Error(`Argument "sendTokenAmount" must be greater than 0 for TokenTrade in Proposal.create()`)
    }

    if (!options.descriptionHash) {
      options.descriptionHash = await this.context.saveIPFSData(options)
    }

    const { address: pluginAddress } = await this.fetchState()

    await this.context.approveTokens(options.sendTokenAddress, pluginAddress, new BN(options.sendTokenAmount)).send()

    return {
      contract: this.context.getContract(pluginAddress),
      method: 'proposeTokenTrade',
      args: [
        options.sendTokenAddress,
        options.sendTokenAmount,
        options.receiveTokenAddress,
        options.receiveTokenAmount,
        options.descriptionHash
      ]
    }
  }
```

**IMPORTANT NOTE: all other Arc.js entities or classes. used in this class must be imported from the `src/index` file**:

```ts
import {
  Address,
  Arc,
  getEventArgs,
  IGenesisProtocolParams,
  IPluginState,
  IProposalBaseCreateOptions,
  ITransaction,
  ITransactionReceipt,
  mapGenesisProtocolParams,
  Plugin,
  ProposalPlugin,
  transactionErrorHandler,
  transactionResultHandler
} from '../../index'

```

## Registering the Plugin class

The plugin class must be exported in the `./src/plugins/utils.ts` file. Including it in the already exported `Plugins` or `ProposalPlugins` object, mapped to its subgraph name.

The `IProposalCreateOptions` interface must be included in the already exported `ProposalCreateOptions` type in the `./src/plugins/utils.ts` file.

The Init Params interface must also be imported an mapped into the `InitParams` object in this file.

```ts
export const ProposalPlugins = {
  FundingRequest,
  Join,
  GenericScheme: GenericPlugin,
  SchemeRegistrar: PluginRegistrarPlugin,
  ContributionReward: ContributionRewardPlugin,
  TokenTrade,
  Unknown: UnknownPlugin
  ...
}

export const Plugins = {
  ...ProposalPlugins,
  ReputationFromToken: ReputationFromTokenPlugin,
  Unknown: UnknownPlugin
}

export interface IInitParams {
  GenericScheme: IInitParamsGS,
  ContributionReward: IInitParamsCR,
  Competition: IInitParamsCompetition,
  ...
}

export type ProposalCreateOptions =
  IProposalCreateOptionsCRExt |
  IProposalCreateOptionsGS |
  IProposalCreateOptionsSR |
  ...
```

## Creating the Proposal class

The Proposal class definition is, in essence, almost the same as the Plugin class definition, with some differences:

* The only interface that needs to be declared prior to the class creation is the Proposal State interface, which must always extend the `IProposalState` interface. An example would be:

```ts
export interface ITokenTradeProposalState extends IProposalState {
  dao: IEntityRef<DAO>
  beneficiary: Address
  sendTokenAddress: Address
  sendTokenAmount: number
  receiveTokenAddress: Address
  receiveTokenAmount: number
  executed: boolean
  redeemed: boolean
}
```

* The proposal class to be created needs to extend the abstract `Proposal` class, which takes the interface mentioned above as a type parameter:

```ts
export class TokenTradeProposal extends Proposal<ITokenTradeProposalState> { ... }
```

* The `state` method must be implemented. It always follows the same implementation. You only need to change the `Observable`'s type parameter with the proper Proposal State interface:

```ts
public state(apolloQueryOptions: IApolloQueryOptions): Observable<ITokenTradeProposalState> {
    const query = gql`query ProposalState
      {
        proposal(id: "${this.id}") {
          ...ProposalFields
          votes {
            id
          }
          stakes {
            id
          }
        }
      }
      ${Proposal.baseFragment}
      ${Plugin.baseFragment}
    `

    const result = this.context.getObservableObject(
      this.context, query, TokenTradeProposal.itemMap, this.id, apolloQueryOptions
      ) as Observable<ITokenTradeProposalState>
    return result
  }
```

* The redeem method must be implemented

## Registering the Proposal Class

The plugin class must be exported in the `./src/plugins/utils.ts` file. Including it in the already exported `Proposals` object, mapped to its subgraph name:

```ts
export const Proposals = {
  GenericScheme: GenericPluginProposal,
  ContributionReward: ContributionRewardProposal,
  Competition: CompetitionProposal,
  ContributionRewardExt: ContributionRewardExtProposal,
  FundingRequest: FundingRequestProposal,
  TokenTrade: TokenTradeProposal,
  Join: JoinProposal,
  SchemeRegistrar: PluginRegistrarProposal,
  SchemeRegistrarAdd: PluginRegistrarProposal,
  SchemeRegistrarRemove: PluginRegistrarProposal,
  SchemeFactory: PluginManagerProposal,
  Unknown: UnknownProposal
}
```

## Exporting Plugin and Proposal classes

The folder containing the plugin and proposal classes that were just implemented must be exported in the `src/index` file:

```ts
export * from './entity'
export * from './plugins/plugin'
export * from './plugins/proposal'
export * from './plugins/proposalPlugin'
export * from './plugins/contributionReward'
export * from './plugins/contributionRewardExt'
export * from './plugins/tokenTrade'
...
```