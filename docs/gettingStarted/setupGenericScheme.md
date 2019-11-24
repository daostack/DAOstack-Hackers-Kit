# Generic Schemes

In DAOstack, "schemes" are smart contracts that enable various DAO actions, and "generic schemes" are schemes that enable nearly any kind of action possible for an Ethereum address.

DAOs can use [GenericScheme](https://github.com/daostack/arc/blob/master/contracts/schemes/GenericScheme.sol):

  1. to enable truly generic DAO actions (letting proposers choose which contracts to interact with and how),
  2. to create specific, custom integrations (actions that make particular calls to particular smart contracts that serve a particular purpose for the DAO).

**NOTE**: 

  - If a DAO wants to make multiple smart contracts available, with different labels and proposal types in the UI, then each contract should use its own GenericScheme instance, customized if required for the DAO's purpose.
  -  _While at the contract level, both generic schemes only need encoded call data to function, asking users to provide this data is not good UX. If you're using a generic scheme for anything except a truly generic action, which is only accessible to Ethereum experts, we ask that you add Alchemy support for the specific actions you intend. Please do not register your scheme on mainnet without adding alchemy support for it. [Here](https://alchemy.daostack.io/dao/0x519b70055af55a007110b4ff99b0ea33071c720a/scheme/0xeca5415360191a29f12e1da442b9b050adf22c81b08230f1dafba908767e604f/proposals/) is an example of a customized generic scheme on mainnet._
  - _UGenericScheme_ i.e. the universal version of the generic scheme has been deprecated and removed from arc ( version > 33). Subgraph and Alchemy will be backward compatible and support old DAOs already deployed and using it.

## How to register a Generic Scheme to a DAO

A DAO can only use schemes that are registered with its controller. There are two ways to register a scheme to a DAO's controller:

  - During the DAO's creation, while deploying the DAO's contracts

  - Through a proposal that uses a scheme with permission to register schemes to the DAO.

  NOTE: _In case of the Genesis DAO, you can propose new schemes to be registered using the aptly named Scheme Registrar scheme._

### Register a Generic Scheme while deploying a DAO

While deploying DAO you can register multiple "GenericScheme" instances and mention each in the
`customSchemes` section of your `migration-dao-params.json`.

Refer to the instructions for [how to deploy DAO](../deployDAO).

### Set Generic Scheme to interact with your contract

First, you will have to deploy a new instance of `GenericScheme` and use its `initialize` method to setup its params: the DAO `Avatar` it connects to, the `contractToCall`, the `votingMachine` to use, and the `voteParameters` for voting on proposals that use the scheme.

The following is a short script that shows how to do this:

```javascript
  const genericSchemeJson = require('@daostack/arc/build/contracts/GenericScheme.json')

  const genericSchemeContract = new web3.eth.Contract(
    genericSchemeJson.abi,
    undefined,
    {
      from,
      gas,
      gasPrice
    }
  )

  // Deploy New GenericScheme Instance
  const genericSchemeDeployedContract = genericSchemeContract.deploy({
        data: genericSchemeJson.bytecode,
        arguments: null
      }).send()

  let genericScheme = await genericSchemeDeployedContract

  // Log Address of new instance to use in next step while registering the scheme to DAO
  console.log(`Deployed new GenericScheme instance at ${genericScheme.options.address}`)

  // Following are example values, Please change appropriately
  // Refer https://daostack.zendesk.com/hc/en-us/sections/360000535638-Genesis-Protocol
  const voteParams = {
        "boostedVotePeriodLimit": 345600,
        "daoBountyConst": 10,
        "minimumDaoBountyGWei": 150000000000,
        "queuedVotePeriodLimit": 2592000,
        "queuedVoteRequiredPercentage": 50,
        "preBoostedVotePeriodLimit": 86400,
        "proposingRepRewardGwei": 50000000000,
        "quietEndingPeriod": 172800,
        "thresholdConst": 1200,
        "voteOnBehalf": "0x0000000000000000000000000000000000000000",
        "votersReputationLossRatio": 4,
        "activationTime": 0
      }

  // Get address from https://github.com/daostack/migration/blob/master/migration.json
  const votingMachineAddress = "0xaddress-of-VotingMachine-of-DAO-on-given-network"

  // For eg if you want this Generic Scheme to enable DAO to interact with Bounties Network
  // then targetContract would be the address of Bounties Network's respective contract
  const targetContractAddress = "0xaddress-of-contract-this-will-interact-with"

  const avatar = "0xaddres-of-DAO"

  // paramHash will be useful in later step so lets log it
  const paramHash = genericScheme.methods.initialize(
      avatar,
      voteParams,
      votingMachineAddress,
      targetContractAddress
      ).call()

  console.log(paramHash)

  genericScheme.methods.initialize(
        avatar,
        voteParams,
        votingMachineAddress,
        targetContractAddress
      ).send()
```

#### Submit a new proposal to the Scheme Registrar via Alchemy UI

  1. On Alchemy's landing page, choose the DAO to which you wish to register the scheme.
  2. Visit the DAO's `Home` page and choose `Scheme Registrar`.
  3. Click `New Proposal` – this will open a popup.
  4. Select `Add Scheme` on the popup sidebar (on the left).
  5. Give the proposal an appropriate title, description, and url linking to a description of the proposal.
  6. For `Scheme`,  put the address of your Generic Scheme contract.
  7. Enter the `paramHash` you got [here](#set-generic-scheme-to-interact-with-your-contract).
  8. In the permissions section, check `Call genericCall on behalf of` (this will allow your scheme to make generic calls, which is the whole point here).
  9. Submit the proposal and sign the transaction as normal.
  10. If the DAO passes your proposal, then your Generic Scheme with the ability to interact with the `targetContract` will be registered to the DAO, and people will be able to submit proposals for the DAO to take your custom generic action.

## How to get Generic Scheme indexed by DAOstack subgraph
The DAOstack subgraph enables Alchemy's quick loading of cached blockchain data and is a huge part of creating a positive user experience in Alchemy.

You will have to submit a PR [here](https://github.com/daostack/subgraph/tree/master/daos)

    1. Make sure to choose the correct Ethereum network for your DAO
    2. If the scheme is for a new DAO, then add `YourDAO.json` in that network folder. eg.

            {
              "name": "New DAO",
              "Avatar": "0xaddress-of-avatar-on-this-network",
              "DAOToken": "0xaddress-of-daotoken-on-this-network",
              "Reputation": "0xaddress-of-nativereputation-on-this-network",
              "Controller": "0xaddress-of-controller-on-this-network",
              "Schemes": {
                "GenesisScheme": "0xaddress-of-genericScheme-on-this-network"
                },
              "arcVersion": "0.0.1-rc.22" # choose the correct arc version
            }

     3. If the scheme is for an already existing DAO, then edit `<existing-DAO>.json` for the correct network.
        Add to the schemes section, eg.

              "Schemes": {
                "GenesisScheme": "0xaddress-of-genericScheme-on-this-network"
                },
              "arcVersion": "0.0.1-rc.22" # choose the correct arc version


## How to get your Generic Scheme showing up in Alchemy

To help you get a user-friendly interface for your generic scheme, we have created a way to customize Alchemy's UI for specific generic schemes.

The customization has a few pieces, and you will have to submit a PR to the Alchemy repo once you're finished with it.

### Proposal Creation Interface

Customize the "create proposal" popup to present the different functions the scheme can call on the contract. This requires adding the contracts’ ABI and customizing things like the titles of the labels and placeholders.

If this was a generic scheme for interacting with the Bounties Network, you would create a file named something like `Bounties.json` and add it [here](https://github.com/daostack/alchemy/tree/dev/src/genericSchemeRegistry/schemes).

Use the following example or refer to an example using the [DutchX](https://github.com/daostack/alchemy/blob/dev/src/genericSchemeRegistry/schemes/DutchX.json) integration.

```javascript
  // Bounties.json
  {
    "name": "Bounties",
    "address": {
      "main": [ "0xtarget-contract-address-on-mainnet" ],
      "rinkeby": [],
      "private": []
    },
    "actions": [
      {
        "id": "createBountyMethod-from-contract",
        "label": "Create Bounty",
        "description": "This method will create a bounty with the DAO as the issuer",
        "notes": "",
        "fields": [
          {
            "label": "bounty title",
            "name": "name-of-field-in-abi",
            "placeholder": "Osam Bin-Laden - dead or alive"
          },
          {
            // more feilds if any
          },
        ],
        "abi": {},
      },
      {
        // more methods of contract if any
      }
    ],
  }
```

#### Update Known Schemes

Once you have customised the proposal create interface update the [genericSchemeRegistry](https://github.com/daostack/alchemy/blob/dev/src/genericSchemeRegistry/index.ts)

For eg. In case of StandardBounty scheme we will add:

    const standardBountiesInfo = require("./schemes/StandardBounties.json")

    const KNOWNSCHEMES = [
      ...,
      standardBountiesInfo
    ];

### Proposal Display Interface

You will also have to customise the description summary for your scheme to explain what it does.

Refer to the [ProposalSummaryDutchX](https://github.com/daostack/alchemy/blob/dev/src/components/Proposal/ProposalSummary/ProposalSummaryDutchX.tsx) and add your own proposal summary file, say `ProposalSummaryBountiesNetwork.tsx`, [here](https://github.com/daostack/alchemy/blob/dev/src/components/Proposal/ProposalSummary/).


#### Update Proposal Summary render

Once you have created the proposal summary make sure that it gets rendered by updating [ProposalSummaryKnownGenericScheme.tsx](https://github.com/daostack/alchemy/blob/d9557ca98ab18f1eb41e2d6d5159370ebfa2d9db/src/components/Proposal/ProposalSummary/ProposalSummaryKnownGenericScheme.tsx#L27)

For eg. In case of StandardBounty scheme we will add:

    import ProposalSummaryStandardBounties from "./ProposalSummaryStandardBounties";

    if (genericSchemeInfo.specs.name === "StandardBounties") {
          return <ProposalSummaryStandardBounties {...this.props} />;

### Integration tests

Please add the relevant integration test for your scheme. You can refer to [genericSchemeDutchx](https://github.com/daostack/alchemy/blob/dev/test/integration/proposal-genericSchemeDutchx.ts) tests.

### (Optional) Change the Scheme UI

Right now, Alchemy’s UI is only focused on currently open proposals (it does not show past proposals). But based on the scheme you are adding, there might be some different UI features/tabs that are required. For a bounties scheme, for example, it would be helpful to have a new tab that shows open bounties (from proposals that have already been passed).
