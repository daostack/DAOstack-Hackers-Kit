You can deploy your new custom scheme contract and register it to the DAO while creating a new DAO using `@daostack/migration` tool

## Create DAO-spec file

Create dao-spec file that describes the specifics of the DAO such as Name of Organization, Token name and symbol, initial set of scheme registered and founder members etc. You can refer to [Deploy a DAO](../../deployDAO) section for base dao-spec file 

In the `dap-spec.json` add `CustomSchemes` section with the details of your scheme
  
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
                  {
                     "address":"0x90F8bf6A479f320ead074411a4B0e7944Ea8c9C1",
                     "tokens":100,
                     "reputation":100
                  }
               ]
            }

## Create DAO-deploy file

Create migration file to deploy your DAO. You will need

  - node >= 10.16.0
  - dotenv >=8.1.0
  - @daostack/migration latest

Create a `.env` file with following environment variables

  - **NETWORK**: private, rinkeby, mainnet etc. depending on which network you are deploying your DAO
  - **PROVIDER**: url of the ethprovider, this could be infura address for testneet/mainnet or `localhost:8545` in case of ganache
  - **PRIVATE_KEY**: key of the account you are using to deploy the DAO

    const DAOstackMigration = require('@daostack/migration');
    const migrationSpec =  require('./CommunityDaoSpec.json')
    require('dotenv').config();

    async function migrate() {
      const DEFAULT_GAS = 3.0

      const options = {
        provider: process.env.PROVIDER,
        gasPrice: DEFAULT_GAS,
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

      switch (process.env.NETWORK) {
        case "ganache":
        case "private":
          options.prevmigration = " ";
          const migrationBaseResult = await DAOstackMigration.migrateBase(options);
          options.prevmigration = options.output;
          break;
      }
      const migrationDAOResult = await DAOstackMigration.migrateDAO(options);
    }

    migrate()
