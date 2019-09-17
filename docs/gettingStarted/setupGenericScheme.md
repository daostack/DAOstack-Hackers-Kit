# Setup Generic Scheme for a DAO

## When to use GenericScheme or UGenericScheme
[GenericScheme](https://github.com/daostack/arc/blob/master/contracts/schemes/GenericScheme.sol) and [UGenericScheme](https://github.com/daostack/arc/blob/master/contracts/universalSchemes/UGenericScheme.sol) both allows a DAO to interact with other contracts and execute any method from the contract if the DAO decides to.

**UGenericScheme**: If a DAO does not have a generic scheme registered or want to edit parameters of existing one, then use the already deployed UGenericScheme.

**GenericScheme**: If a DAO wants to have multiple generic scheme i.e. integration with multiple different contracts, then for each subsequent contract (apart from the one already registered via UGenericScheme) you need to deploy an instance of GenericScheme and register it to the DAO.

  NOTE: _While at the contract level GenericScheme only needs encoded call data to function, this is not the user friendly way. You will have to add Alchemy support to be able to use it. Please do not register your scheme on mainnet without adding alchemy support for it_

## How to register Generic Scheme with a DAO

DAO only uses the schemes that are registered with its controller. There are two ways to register a scheme:

  - While forging/deploying the DAO as part of initial set of schemes

  - While proposing the new scheme to DAO via any Scheme that has permission to register another Scheme for the DAO. **In case of GenesisAlpha you can register via Scheme Registrar**
    
### Setup Generic Scheme while deploying DAO

  While deploying DAO, if you want to interact with just single contract then you can use `UGenericScheme` and register that to your DAO.

  In case there are multiple contracts you wish to interact with, then you can register multiple `GenericScheme` and mention each in `customSchemes` section of your `migration-dao-params.json`.

  Refer to [How to deploy DAO](../deployDAO)
  
### Setup Generic Scheme via Scheme Registrar

#### Set UGenericScheme to interact with your contract

NOTE: Follow this if generic scheme is not already registered or need to update to new parameters

You can use UGenericScheme's `setParameters` method to setup `contractToCall`, `votingMachine` to use and `voteParameters` for the voting

Following is a short script that describes how to do this

```javascript
  const ugenericScheme = new web3.eth.Contract(
    require('@daostack/arc/build/contracts/UGenericScheme.json').abi,
    UGenericSchemeAddress, // address from https://github.com/daostack/migration/blob/master/migration.json
    {
      from,
      gas,
      gasPrice
    }
  )

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


  // paramHash will be useful in later step so lets log it
  const paramHash = ugenericScheme.methods.setParameters(
      voteParams,
      votingMachineAddress,
      targetContractAddress
      ).call()

  console.log(paramHash)

  ugenericScheme.methods.setParameters(
        voteParams,
        votingMachineAddress,
        targetContractAddress
      ).send()
```

OR

#### Set GenericScheme to interact with your contract

NOTE: Follow this if UGenericScheme is already being used and DAO need to interact with another contract

You will have to deploy a new instance of GenericScheme contract and use its `initialize` method to setup the DAO `Avatar`, `contractToCall`, `votingMachine` to use and `voteParameters` for the voting.

Following is a short script that describes how to do this

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

#### Submit new proposal to Scheme Registrar via Alchemy UI

  1. On Alchmey landing page choose the DAO to which you wish to register the scheme
  2. Visit DAO's `Home` page and choose `Scheme Registrar`
  3. Click `New Proposal`, this will open a popup
  4. Select `Add Scheme` on the popup sidebar (on left)
  5. Give appropriate title, description, url which describes the proposal
  6. Put the address of Generic Scheme contract

      **NOTE**: Based on above step this would be either address of

      - **UGenericScheme**: if DAO does not have UGenericScheme registered or you are editing params for existing one, then you can use UGenericScheme address (select Generic Scheme from the options list)
      - **GenericScheme**: if DAO already has UGenericScheme registered, then address of the new GenericScheme instance deployed in previous step should be used

  7. Enter the `paramHash` you got [here](#set-generic-scheme-to-interact-with-your-contract)
  8. In permissions section choose `Call genericCall on behalf of`
  9. Submit Proposal and sign off the transaction
  10. If the DAO agrees then your Generic Scheme with ability to interact with the `targetContract` will be registered to the DAO

## How to get your Generic Scheme shown in Alchemy

  To enable a User-friendly Interface for GenericScheme, we have created a way for customizing the UI for specific contracts’ proposals.
  
  The customization will happen at the following places and you will have to submit PR to Alchemy repo with details of your scheme.

### Creating Proposal

  Customize the create proposal popup to present the different functions the scheme can call on the contract. This requires adding the contracts’ ABI and customizing things like the titles of the labels and placeholders.

  Say if this was GenericScheme to interact with Bounties Network we will create, say `Bounties.json`, file and add [here](https://github.com/daostack/alchemy/tree/dev/src/genericSchemeRegistry/schemes)

  Use the following example or refer to an existing [DutchX](https://github.com/daostack/alchemy/blob/dev/src/genericSchemeRegistry/schemes/DutchX.json) integration

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

### Displaying proposals

 You will also have to customize the description summary of proposal to explain what will happen if passed.

 Refer to [ProposalSummaryDutchX](https://github.com/daostack/alchemy/blob/dev/src/components/Proposal/ProposalSummary/ProposalSummaryDutchX.tsx) and add your own, say `ProposalSummaryBountiesNetwork.tsx`, proposal summary file [here](https://github.com/daostack/alchemy/blob/dev/src/components/Proposal/ProposalSummary/)

### (Optional) Changes to scheme UI

 Current, Alchemy’s UI is only focused on the current open proposals. But based on the scheme you are adding there might be some UI features/tabs that are required.
 Say for bounties scheme, having a new tab of open bounties with information about remaining balance would be necessary.
