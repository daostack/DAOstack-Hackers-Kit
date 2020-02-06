# DAOstack Starter Template

This is a basic template you can use for kickstarting your project using the DAOstack platform.
Here you can find the basic structure for using Arc to build your project.

# How to get started:

First, please change the `package.json` file to fit your project.
You can then go ahead and edit the template to fit your needs.

## Project Structure:

- **contracts** - Your custom smart contracts should be located under here. You can use any Arc contract simply by importing it. For example `import "@daostack/arc/contracts/universalSchemes/UniversalScheme.sol"`
- **migrations** - This is migration scripts folder. We are using @daostack/migration package for deploying new DAO, Custom Schemes and any Stand Alone contracts that might be required by the DAO.
- **starter-app** - This folder is initialized with React App which uses `@daostack/client` library to interact with contracts and the subgraph. These will be your Dapp front-end files. In development environment we have a `webpack` server running which looks for the changes made in `starter-app/src` folder and compiles them into client side JS files. You can can find the starting file `App.js` which you can use for your project.
-**data** - This folder contains the `testDaoSpec.json`, which is file used to specify details for the new DAO to be deployed, feel free to change it according to your project needs. It also contains an `example.env`, which has example environment variables set, copy this file to your project root i.e. `starter-template` folder as `.env` and edit the variables accordingly. Lastly, there is a `migration.json` file which will contain the output after running the migration

## How to customize your DAO?
 In order to customize your DAO you will modify `data/testDAOspec.json`, which has the DAO specifications.
 ```
  {
    // Name of your DAO, Native token and Native token symbol
    "orgName": "DevTest",
    "tokenName": "Dev",
    "tokenSymbol": "DEV",

    // Whether you want to use universal controller or deploy your own controller
    // Read more about controlers in Arc repo
    "useUController": false,

    // DaoCreater lets you bundle up tx to deploy Avatar, Reputation and Token contract
    // and upto 100 founder member intitialization in single tx. You can have more founders
    // and there will upto 100 batched in another tx and so on.
    // It also bundle up the tx to register scheme
    "useDaoCreator": true,
    
    // Select the schemes you want to register to your DAO and the votingMachine params
    // to use with the scheme.
    // Note if no params mentioned, then it defaults to using params VotingMachinesParams[0]
    "schemes": {
      "ContributionReward": true,
      "GenericScheme": false,
      "SchemeRegistrar": true,
      "GlobalConstraintRegistrar": false,
      "UpgradeScheme": false
    }
    "ContributionReward": {
    },
    "SchemeRegistrar": {
        "voteRegisterParams": 0,
        "voteRemoveParams": 0
    },
    "VotingMachinesParams": [
      {
        // Voting ratio required for instantly passing a proposal
        "queuedVoteRequiredPercentage": 50,

        // How long non-boosted proposal stays open 
        "queuedVotePeriodLimit": 432000,

        // How long boosted proposal stays open
        "boostedVotePeriodLimit": 86400,

        // How long proposal is open for predicting before it is boosted
        "preBoostedVotePeriodLimit": 43200,

        // Controls how quickly the boosting threshold goes up. Larger => fewer boosted proposals
        "thresholdConst": 1200,

        // Time added if there is a last minute flip in the DAO’s decision on boosted proposal
        "quietEndingPeriod": 14400,

        // Rep awarded to proposer
        "proposingRepReward": 500,

        // Voters voting on un-boosted proposal gain/loose this amount based on the outcome
        "votersReputationLossRatio": 1,

        // Amount automatically staked by DAO against the proposal. This incentivise pridictions
        "minimumDaoBounty": 150,

        // Auto Down-stake size
        "daoBountyConst": 10,

        // Time after which DAO will start accepting proposals
        "activationTime": 0,

        // If set allows only the following address to vote on behalf
        "voteOnBehalf": "0x0000000000000000000000000000000000000000"
      }
    ],

    // founder members
    "founders": [
      {
        "address": "0x90F8bf6A479f320ead074411a4B0e7944Ea8c9C1",
        "reputation": 250,
        "tokens": 2000
      },
    ],
  }
 ```

## How to use?

- Enter the project folder from the terminal and Install package

```
npm install
npm install -g nps
npm install -g npx
```

- Update the `.env` file with your `PRIVATE_KEY`  `PROVIDER` and `NETWORK` in project directory. Use `data/example.env` for reference

### Running your project on private network (Using docker)

NOTE: It takes sometime to sync subgraph so please let it sync and then refresh the app. You can check sync status at `localhost:8000`

After downloading docker

You can run/start project via single command
```
npm run start
```

OR

Follow the steps below:

- Launch Docker

  ```
  npm run launch:docker
  ```

  This will start the docker container for `ganache`, `graph-node` for indexing blockchain events, `ipfs` where subgraph mappings reside and `postgres` database where blockchain events are stored as described by the schema

- Migrate DAO

  ```
  npm run migrate
  ```

  Make sure the DAO is deployed and output is written to output file. You should see the following in the ganache logs:
  ```
  {
  "name": "DevTest",
  "Avatar": "0x5095a0B6BA789D4c0f4499788BE0901e018d2e59",
  "DAOToken": "0x47dAfDb3cA13C95490047624b2202CcC2E6eF90F",
  "Reputation": "0x15A75af9D4035Ddd2274ddDe061e8B651A8C1efd",
  "Controller": "0x8318cF81516b964f71a32EbEe1B229973c77e0e0",
  "Schemes": [],
  "StandAloneContracts": [],
  "arcVersion": "0.0.1-rc.37"
  }
  ✔ DAO Migration has Finished Successfully!
  ```

- Deploy new subgraph for indexing DAO

  ```
  npm run deploy-graph
  ```

- After deploying the graph and getting it synced you can start playing/developing your app with webpack watcher running:

```
npm run launch:app
```

- Open your web browser and type *http://localhost:3000/* This is your react Dapp. You can edit the `starter-app` code to modify frontend and the webpack watcher will rebuild the app

- In another browser window/tab type *http://localhost:8000/subgraphs/name/<subgraph_name_from_example.env>/graphql* or *http://localhost:8000/* This is an interface to the subgraph and you can type graphQL queries here to fetch data from the `postgres` database

_To learn more about subgraphs check out: [DAOstack Subgraph](https://github.com/daostack/subgraph), [TheGraph Project](https://thegraph.com/docs/quick-start)_

### Without docker

If you not using the Ganache docker image provided by DAOstack, then you will have to update the `migrations/DeployDAO.js` to migrate the base contract.

  ```
  npm run ganache
  npm run migrate
  ```

Make sure all the base contracts and the DAO contracts are deployed.

Running graph-node without docker would be difficult but, you can refer [Graph Protocol](https://github.com/graphprotocol/graph-node) to see how to.

Once you have graph-node running same subgraph-deploy script would work.

```
npm run deploy-graph
```

After deploying the graph and getting it synced you can start playing/developing your app with webpack watcher running:

```
npm run launch:app
```

- Open your web browser and type *http://localhost:3000/* This is your react Dapp. You can edit the `peepeth-app` code to modify frontend and the webpack watcher will rebuild the app

- In another browser window/tab type *http://localhost:8000/subgraphs/name/<subgraph_name_from_example.env>/graphql* or *http://localhost:8000/* This is an interface to the subgraph and you can type graphQL queries here to fetch data from the `postgres` database

_To learn more about subgraphs check out: [DAOstack Subgraph](https://github.com/daostack/subgraph), [TheGraph Project](https://thegraph.com/docs/quick-start)_

## Deploy and use on test network:

- Update the `.env` file with your `PRIVATE_KEY`  `PROVIDER` and `NETWORK` in `starter-template` directory. Use `data/example.env` for reference
- Open terminal at the project folder and run the following commands:

  ```
  npm run migrate
  ```
  

  You should see following output:

  ```
   Network: 	rinkeby
  ℹ Account: 	0xE11BA2b4D45Eaed5996Cd0823791E0C93114882d
  ℹ Balance: 	0.293576338999840053ETH
  ℹ Gas price: 	3GWei
  ℹ Found an existing previous migration file (/Users/shivgupt/Backup/Documents/projects/Github/DAOstack-Hackers-Kit/starter-template/node_modules/@daostack/migration/migration.json)
  ℹ 0xfe1f8149c1c83109062f2f368d4392c161ae1450ffe3250b4e4d68bf4931457d | 0.01809 ETH | Created new organization.
  ℹ 0xcf844cf9b5dbc4937ee6bd812e7dd32eee4239a8aa34657bb5a8c5de22fe2de1 | 0.00028 ETH | GenesisProtocol parameters set.
  ℹ 0x73d91beb38dc0b9793591813cdd3d41d69eed0c0156d431829d1b261d11c8d81 | 0.00013 ETH | Scheme Registrar parameters set.
  ℹ 0xd732a938dbace38848b842533411dc7737f59e4a100a9d2fac528622801cdaa4 | 0.00011 ETH | Contribution Reward parameters set.
  ℹ 0x81e17d5a7a739a3263a18f4223b837831a502f9754c20e6e743beda6be4fb53b | 0.00040 ETH | DAO schemes set.
  { name: 'DevTest',
    Avatar: '0x193F306136bD09f2C4b1c30c0E39503b9EEF00Ee',
    DAOToken: '0x14795285EaE25f3Cc83449a8a6C22Dcb7761a1b4',
    Reputation: '0xE609e7C7c6B124e54FCb6c425a4C35Cbb508c6C6',
    Controller: '0x9FE9bd0909a60697b671B213c32cDb7BDD82A7c1' }
  ℹ Finished in 6 minutes and costed 0.019010448ETH
  ✔ Wrote results to data/migration.json.

  ```

  - Update `docker-compose.yml` for testnet if running graph-node locally.

  - update `App.js` to use testnet settings
    - add `settings.<TESTNET>` eg. `settings.rinkeby` with `web3Provider` set to testnet url
    - initialize Arc with `settings.<TESTNET>` eg. `settings.rinkeby`

### Stop the project:
- From the project directory type:

  ```
  npm run stop
  ```

#### Using MetaMask with ganache:
  - Open metamask and import using private key
  - You can find the private keys from ganache logs by running `docker container logs <container_name>`
