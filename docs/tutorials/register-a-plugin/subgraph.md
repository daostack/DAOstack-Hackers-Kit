# Add your plugin into daostack's subgraph

Once your plugin contract has been written, we need to add it into the subgraph, this way we can store the data emitted from the events that has happened in your contract (i.e: A proposal has been created).

First of all, you will need to create inside of the `src/mappings` directory a folder with your plugin name, then, you will need to create four files:

- `src/mappings/` + Plugin Name + `/mapping.ts` - Definition of handlers when your new contract's plugin emit a new event.
- `src/mappings/` + Plugin Name + `/schema.graphql` - GraphQL schema for that contract, normally here goes the Proposal schema.
- `src/mappings/` + Plugin Name + `/datasource.yaml` - a yaml fragment with:  
    a. `abis` - optional - list of contract names that are required by the mapping.  
    b. `entities` - list of entities that are written by the the mapping.  
    c. `eventHandlers` - map of solidity event signatures to event handlers in mapping code.
- `test/integration/` + Plugin Name + `.spec.ts` - we will need to test our integration on the subgraph too

You will need to add your plugin in `ops/mappings.json` in every network, like so:
```
{
   "name": "plugin name as appears in `abis/arcVersion` folder",
   "contractName": "plugin name as appears in migration.json file",
   "dao": "section label where plugin is defined in migration.json file (base/dao/test/organs)>",
   "mapping": "plugin name",
   "arcVersion": "plugin arc version"
}
```

Now, you have to add the new Plugin proposals in the domain and the controller, the files are the following:

- `src/mappings/Controller/datasource.yaml` - Add your plugin name in the `abis` section
- `src/mappings/Controller/schema.graphql` - You will define your plugin parameters as an entity (a.k.a: the initializer parameters of your contract), and then add it into the entity `ControllerScheme`
- `src/mappings/Controller/mapping.ts` - Create a function that will save the parameters of initialization of the plugin once it has been created. You can check the example from `TokenTrade`:
```
export function setTokenTradeParams(
  avatar: Address,
  scheme: Address,
  vmAddress: Address,
  vmParamsHash: Bytes,
): void {
  setGPParams(vmAddress, vmParamsHash, avatar);
  let controllerScheme =  ControllerScheme.load(
    crypto.keccak256(concat(avatar, scheme)).toHex(),
  );
  let tokenTradeParams = new TokenTradeParam(scheme.toHex());
  tokenTradeParams.votingMachine = vmAddress;
  tokenTradeParams.voteParams = vmParamsHash.toHex();
  tokenTradeParams.save();
  if (controllerScheme != null) {
    controllerScheme.tokenTradeParams = tokenTradeParams.id;
    controllerScheme.save();
  }
}
```
- `src/domain/gpqueue.ts` - Inside of the `create` function, you will to add a validation to check if the new plugin has been added, if true, it will bind the plugin with the new address and will set up the voting machine and parameters, an example is the following, with `TokenTrade`:
```
if (equalStrings(contractInfo.name, 'TokenTrade')) {
let tokenTrade =  TokenTrade.bind(scheme);
gpAddress = tokenTrade.votingMachine();
let voteParams = tokenTrade.voteParamsHash();

if (!equalStrings(gpAddress.toHex(), addressZero)) {
    setTokenTradeParams(dao, scheme, gpAddress, voteParams);
    isGPQue = true;
}
```

- `src/domain/proposal.ts` - Here is where we are going to save our proposal. For that, you will create a function called `update` + initial of your plugin + `Proposal`, the parameters of this functions will be: `proposalId: Bytes, createdAt: BigInt, avatarAddress: Address, descriptionHash: string, schemeAddress: Address`. Check the `JoinAndQuit` update proposal function (Based on this example, the only line you will need to change is `proposal.joinAndQuit`, with the name of your plugin):
```
export function updateJQProposal(
  proposalId: Bytes,
  createdAt: BigInt,
  avatarAddress: Address,
  descriptionHash: string,
  schemeAddress: Address,
): void {
  let proposal = getProposal(proposalId.toHex());
  proposal.dao = avatarAddress.toHex();
  proposal.joinAndQuit = proposalId.toHex();
  proposal.createdAt = createdAt;
  proposal.descriptionHash = descriptionHash;
  proposal.scheme = crypto.keccak256(concat(avatarAddress, schemeAddress)).toHex();
  getProposalIPFSData(proposal);

  saveProposal(proposal);
}
```

- `src/domain/index.ts` - You have to create a new function which is going to be called `handleNew` + Plugin name + `Proposal`, here you are going to call two functions, the first one is `update` + initial of your plugin + `Proposal` function that you previously created on last step and `handleGPProposalPrivate`. See the `handleNewTokenTradeProposal` method as example: 
```
export function handleNewTokenTradeProposal(
  avatar: Address,
  proposalId: Bytes,
  timestamp: BigInt,
  descriptionHash: string,
  eventAddress: Address,
): void {
  if (!daoModule.exists(avatar)) {
    return;
  }
  updateTTProposal(
    proposalId,
    timestamp,
    avatar,
    descriptionHash,
    eventAddress,
  );
  handleGPProposalPrivate(proposalId.toHex());
}
```

- `src/domain/schema.graphql` - You will add your plugin proposal, i.e: `tokenTrade: TokenTradeProposal`, TokenTradeProposal has already been defined in the schema.graphql of your plugin

Once you have finished the subgraph integration, you will need to contact daostack dev team to ask them to release a new `migration` package version. This is what will allow you to interact with your new plugin in the rest of the stack