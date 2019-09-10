# Setup Generic Scheme for a DAO

## When to use Generic Scheme
[Generic Scheme](https://github.com/daostack/arc/blob/master/contracts/schemes/GenericScheme.sol) allows a DAO to interact with other contracts and execute any method from the contract if the DAO decides to

## How to register Generic Scheme with a DAO

DAO only uses the schemes that are registered with its controller. There are two ways to register a scheme:

  - While forging/deploying the DAO as part of initial set of schemes

  - While proposing the new scheme to DAO via Scheme Registrar for the DAO.
    
### Setup Generic Scheme while deploying DAO

  Refer to [How to deploy DAO](../deployDAO)
  
### Setup Generic Scheme via Scheme Registrar

#### Set Generic Scheme to interact with your contract

You can use GenericScheme's `setParameters` method to setup which contract it will interact with.
Following is a short script that describes how to do this

```
  const genericScheme = new web3.eth.Contract(
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
  const paramHash = genericScheme.methods.setParameters(
      voteParams,
      votingMachineAddress,
      targetContractAddress
      ).call()

  console.log(paramHash)

  genericScheme.methods.setParameters(
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
  5. Give appropriate title, description, url
  6. Put the address of Generic Scheme contract deployed

      **Note**: If DAO does not have a `Generic Scheme` registered to it you can use the already deployed instance of GenericScheme find the address for correct network [here](https://github.com/daostack/migration/blob/master/migration.json), else you will have to deploy new instance of Generic Scheme.

  7. Enter the `paramHash` you got [here](#set-generic-scheme-to-interact-with-your-contract)
  8. In permissions section choose `Call genericCall on behalf of`
  9. Submit Proposal and sign off the transaction
  10. If the DAO agrees then your Generic Scheme with ability to interact with the `targetContract` will be registered to the DAO

## How to get your Generic Scheme shown in Alchemy

You will have to submit PR to Alchemy repo with details of your scheme. So if this was Generic Scheme to interact with Bounties Network we will create, say, `Bounties.json` file and put [here](https://github.com/daostack/alchemy/tree/dev/src/genericSchemeRegistry/schemes)

```
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
        "id": "this-is-a-method-on-contract",
        "label": "this will appear on Alchemy UI for submitting proposal for this action",
        "description": "Describe what this action will do on-chain when proposal is passed by DAO",
        "notes": "",
        "fields": [
          {
            "label": "label for this field",
            "name": "name-of-field-in-abi",
            "placeholder": "Default to show on UI for reference"
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
