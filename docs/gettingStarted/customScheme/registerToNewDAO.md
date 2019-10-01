You can deploy your new custom scheme contract and register it to the New DAO as part of initial scheme set using `@daostack/migration` tool

## Create DAO-spec

Add `data/YourDaoSpec.json` file that describes the specifics of the DAO such as Name of Organization, Token name and symbol, initial set of scheme registered and founder members etc. You can refer to [Deploy a DAO](../../deployDAO) section for base dao-spec file 

Add `CustomSchemes` section with the details of your scheme as follows. Refer [*Example DAO spec*](#example-dao-spec-file)
  
  - **name**: Name of the contract file
  - **schemeName**: Name of the scheme
  - **isUniversal**: true or false, depending on which scheme you are registering
  - **params**: array of parameters to be passed to scheme contract's `initialize` (in-case of non-universal) or `setParameters` (in-case of universal) method. Please keep the order of parameters expected by the method in consideration
    1. Include `{ "voteParams": X }` for voting machine parameters, where X is the index of param from `VotingMachinesParams`, that will be used to vote on proposals submitted to this scheme.
    2. `"GenesisProtocolAddress"` will be converted to actual GenesisProtocol address. Include this if scheme uses Genesis Protocol as the voting machine and expects its Address as one of the parameter
    3. Since each non-universal scheme is deployed per DAO and it is advisable to have the DAO address initialized the scheme, the migration tool expects first param to `initialize` method is DAO avatar address.

  - **permissions**: Include a 4 byte hex describing the permissions required by your new scheme
    - 2nd bit: Scheme can register other schemes
    - 3rd bit: Scheme can add/remove global constraints
    - 4th bit: Scheme can upgrade the controller
    - 5th bit: Scheme can call genericCall on behalf of

  - **address** (optional): If you have already deployed your scheme contract, then include its address here, else migration script will deploy this scheme
  - **alias** (optional): include alias for what you will want your scheme to be referred as in subgraph

### Example DAO spec file

Following is `CommunityDaoSpec.json` using custom scheme designed in previous step for new Community DAO where people can buy reputation by donating money

    {
       "orgName":"CommunityDAO",
       "tokenName":"Commune",
       "tokenSymbol":"CDT",
       "ContributionReward":[
         {
           "voteParams": 0
         }
       ],
       "SchemeRegistrar": [
         {  
           "voteRegisterParams": 1,
           "voteRemoveParams": 1
         }
       ],
       "CustomSchemes": [
         {
            "name": "BuyInWithRageQuitOpt",
            "schemeName": "BuyInWithRageQuitOpt",
            "isUniversal": false,
            "params": [
            ],
            "permissions": "0x00000000"
         }
       ],
       "VotingMachinesParams":[
          {
             "activationTime": 0,
             "boostedVotePeriodLimit": 345600,
             "daoBountyConst": 10,
             "minimumDaoBounty": 150,
             "preBoostedVotePeriodLimit": 86400,
             "proposingRepReward": 0,
             "queuedVotePeriodLimit": 2592000,
             "queuedVoteRequiredPercentage": 50,
             "quietEndingPeriod": 172800,
             "thresholdConst": 1200,
             "voteOnBehalf": "0x0000000000000000000000000000000000000000",
             "votersReputationLossRatio": 0
          },
          {
             "activationTime": 0,
             "boostedVotePeriodLimit": 691200,
             "daoBountyConst": 10,
             "minimumDaoBounty": 500,
             "preBoostedVotePeriodLimit": 172800,
             "proposingRepReward": 0,
             "queuedVotePeriodLimit": 5184000,
             "queuedVoteRequiredPercentage": 50,
             "quietEndingPeriod": 345600,
             "thresholdConst": 1500,
             "voteOnBehalf": "0x0000000000000000000000000000000000000000",
             "votersReputationLossRatio": 0
          }
       ],
       "schemes":{
          "ContributionReward":true,
          "SchemeRegistrar":true
       },
       "unregisterOwner":true,
       "useUController":false,
       "useDaoCreator":true,
       "founders":[
       ]
    }

## Create DAO-deploy file

1. Create migration file to deploy your DAO. You will need

    - node >= 10.16.0
    - dotenv >=8.1.0
    - @daostack/migration latest

2. Update `.env` file with following environment variables

    - **CUSTOM_ABI_LOCATION**: location of all your compiled contracts, eg. `contracts/build`
    - **DAO_SPEC**: path to `yourDaoSpec.json` file
    - **DEFAULT_GAS**: gas price for tx, eg. 3.0
    - **OUTPUT_FILE**: full path of file where to store migration output, eg. `data/migration.json`
    - **PRIVATE_KEY**: key of the account you are using to deploy the DAO
    - **PROVIDER**: url of the ethprovider, this could be infura or ganache

    Example

        CUSTOM_ABI_LOCATION='build/contracts'
        DAO_SPEC='../data/testDaoSpec.json'
        DEFAULT_GAS=3.0
        OUTPUT_FILE='data/migration.json'
        PRIVATE_KEY='0x4f3edf983ac636a65a842ce7c78d9aa706d3b113bce9c46f30d7d21715b23b1d'
        PROVIDER='http://localhost:8545'


  3. Add/Update the `ops/deployDAO.js`, Refer [Example deploy script](#example-deploy-script)

### Example deploy script


    require('dotenv').config();
    const DAOstackMigration = require('@daostack/migration');
    const migrationSpec =  require(process.env.DAO_SPEC)

    async function migrate() {

      const options = {
        provider: process.env.PROVIDER,
        gasPrice: process.env.DEFAULT_GAS,
        quiet: false,
        force: true,
        output: process.env.OUTPUT_FILE,
        privateKey: process.env.PRIVATE_KEY,
        customabislocation: process.env.CUSTOM_ABI_LOCATION,
        params: {
          private: migrationSpec,
          rinkeby: migrationSpec
        },
      };

      await DAOstackMigration.migrateDAO(options);
    }

    migrate()
