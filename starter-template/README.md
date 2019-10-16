# DAOstack Starter Template

This is a basic template you can use for kickstarting your project using the DAOstack platform.
Here you can find the basic structure for using Arc to build your project.

# How to get started:

First, please change the `package.json` file to fit your project.
You can then go ahead and edit the template to fit your needs.

## Project Structure:

In this template, we use: `npm`, `truffle` and `webpack`, as well as DAOstack Arc, Client and Subgraph.
The structure is basically as follows:

- **contracts** - Your custom smart contracts should be located under here. You can use any Arc contract simply by importing it. This is an example import `import "@daostack/arc/contracts/universalSchemes/UniversalScheme.sol"`
- **migrations** - This is a truffle migration scripts folder. You can write Truffle migration script for deploying your DAO or smart contracts and place the script under that folder. We already created a file for you to deploy a new DAO using @daostack/migration library.
- **starter-app** - This folder is initialized with React App which uses DAOstack client library `@daostack/client` to interact with contracts and the subgraph. These will be your Dapp front-end files. In development environment we have a `webpack` server running which looks for the changes made in `starter-app/src` folder and compiles them into client side JS files. You can can find the starting file `App.js` which you can use for your project.
- **subgraph** - This is based on graphprotocol and uses mappings defined in `src/mappings` to index the blockchain events and store them in a `postgres` database as Entities described by `graphQl` schema. The `subgraph` deploy script uses output of migrations in `data/migration.json` to get the contract addresses. You can find mappings for the base contracts here and can add more mappings and schema for your custom contracts
-**data** - This folder contains the `testDaoSpec.json`, which is file used to specify details for the new DAO to be deployed, feel free to change it according to your project needs. It also contains an `example.env`, which has example environment variables set, copy this file to your project root i.e. `starter-template` folder as `.env` and edit the variables accordingly. Lastly, there is a `migration.json` file which will contain the output after running the migration

## Running your project on private network:

### Using docker
After downloading the project and docker:

- Update the `.env` file with your `SEED_PHRASE` or `PRIVATE_KEY`  `PROVIDER` and `NETWORK` in `starter-template` directory. Use `data/example.env` for reference
- Update the `.env` file in `starter-template/subgraph` directory. Use `subgraph/example.env` or `subgraph/readme.md` for reference
- Enter the project folder from the terminal (i.e. starter-template) and type the following:

  ```
  npm run launch:docker
  npm run logs:graph
  ```

  This would build the docker images and start the docker container for `ganache`, `starter-app` with webpack server, `graph-node` for indexing blockchain events, `ipfs` where subgraph mappings reside and `postgres` database where blockchain events are stored as described by the schema

- Wait for the logs screen to say *Starting JSON-RPC admin server at: ....*, then you can either exit the logs or in a different terminal window type

  ```
  npm run migrate
  npm run logs:ganache
  ```

  Make sure the DAO is deployed and output is written to output file. You should see the following in the ganache logs:
  ```
  { name: 'DevTest',
  Avatar: '0xE7A2C59e134ee81D4035Ae6DB2254f79308e334f',
  DAOToken: '0xcDbe8b52A6c60A5f101d4A0F1f049f19a9e1D35F',
  Reputation: '0x93cdbf39fB9e13BD253CA5819247D52fbabf0F2f',
  Controller: '0x5109F62E4e0CA152f5543E59E42dc0360C3aeD25' }
  eth_getBlockByHash
  eth_getBalance
  eth_getTransactionReceipt
  ℹ Finished in a few seconds and costed 0.019947492000006144ETH
  ✔ Wrote results to data/migration.json.
  eth_getBlockByHash
  eth_getTransactionReceipt
  eth_getBlockByNumber
  ...
  ```

  Exit the logs and from the project directory i.e. `starter-template` type:

  ```
  npm run deploy-graph
  ```

  This will deploy the subgraph and if you are still following the graph-node logs you can see it syncing the blockchain events

- Open your web browser and type *http://localhost:3000/* This is your react Dapp. You can edit the `starter-app` code to modify frontend and the webpack watcher will rebuild the app

- In another browser window/tab type *http://localhost:8000/subgraphs/name/<subgraph_name_from_example.env>/graphql* or *http://localhost:8000/* This is an interface to the subgraph and you can type graphQL queries here to fetch data from the `postgres` database

_To learn more about subgraphs check out: [DAOstack Subgraph](https://github.com/daostack/subgraph), [TheGraph Project](https://thegraph.com/docs/quick-start)_

### Deploy and use on test network:

- Update the `.env` file with your `SEED_PHRASE` or `PRIVATE_KEY`  `PROVIDER` and `NETWORK` in `starter-template` directory. Use `data/example.env` for reference
- Update the `.env` file in `starter-template/subgraph` directory. Use `subgraph/example.env` or `subgraph/readme.md` for reference
- Open terminal at the project folder and run the following commands:

  ```
  npm i
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

  To launch the development environment (react app and subgraph) for testnet DAO, You will have to make appropriate changes in following files:

  **docker-compose-testnet.yml**
    - update ethereum url in graph-node service to testnet url eg `rinkeby:https://rinkeby.infura.io/<INFURA-KEY>`

  **App.js**
    - add `settings.<TESTNET>` eg. `settings.rinkeby` with `web3Provider` set to testnet url
    - initialize Arc with `settings.<TESTNET>` eg. `settings.rinkeby`

### Stop the project:
- From the project directory type:

  ```
  npm run stop
  ```

#### Using MetaMask with ganache:
  - Open metamask and import using private key
  - You can find the private keys from ganache logs by running `docker container logs starter-template_ganache_1`
