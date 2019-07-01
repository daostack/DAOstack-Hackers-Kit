# DAOstack Starter Template

This is a basic template you can use for kickstarting your project using the DAOstack platform.
Here you can find the basic structue for using Arc to build your project.

# How to get started:

First, please change the `package.json` file to fit your project.
You can then go ahead and edit the template to fit your needs.

## Project Structure:

In this template, we use: `npm`, `truffle` and `webpack`, as well as DAOstack Arc, Client and Subgraph.
The structure is basically as follows:

- **contracts** - Your custom smart contracts should be located under here. You can use any Arc contract simply by importing it. This is an example import `import "@daostack/arc/contracts/universalSchemes/UniversalScheme.sol"`
- **migrations** - This is a truffle migration scripts folder. You can write Truffle migration script for deploying your DAO or smart contracts and place the script under that folder. We already created a file for you there with some explanation on how to use it with Arc. The new DAO is deployed using @daostack/migration library.
- **starter-app** - This folder is initialized with React App which uses DAOstack client library `@daostack/client` to interact with contracts and the subgraph. These will be your Dapp front-end files. In development environment we have a `webpack` server running which looks for the changes made in `starter-app/src` folder and compiles them into client side JS files. You can can find the starting file `App.js` which you can use for your project.
- **subgraph** - This is based on graphprotocol and uses mappings defined in `src/mappings` to index the blockchain events and store them in a `postgres` database as Entities described by `graphQl` schema. The `subgraph` deploy script uses output of migrations in `data/migration.json` to get the contract addresses. You can find mappings for the base contracts here and can add more mappings and schema for your custom contracts
-**data** - This folder contains the `testDaoSpec.json`, which is file used to specify details for the new DAO to be deployed, feel free to change it according to your project needs. It also contains an `example.env`, which has example environment variables set, copy this file to your project root i.e. `starter-template` folder as `.env` and edit the variables accordingly. Lastly, there is a `migration.json` file which will contain the output after running the migration

## Running your project on local testnet:

### Using docker
After downloading the project and docker:

- copy the `example.env` from `data` directory as `.env` in the project directory
- Update the `.env` file with your `SEED_PHRASE` and `<TESTNET-NAME>_INFURA_URL`
- Enter the project folder from the terminal (starter-template) and type the following:

  ```
  npm run launch:docker
  npm run logs:graph
  ```

  This would build the docker images and start the docker container for `ganache`, `starter-app` with webpack server, `graph-node` for indexing blockchain events, `ipfs` where subgraph mappings reside and `postgres` database where blockchain events are stored as described by the schema

- Wait for the logs screen to say *Starting JSON-RPC admin server at: ....*, then you can either exit the logs or in a different terminal window type

  ```
  npm run deploy-graph
  ```

  This will deploy the subgraph and if you are still following the graph-node logs you can see it syncing the blockchain events

- Open your web browser and type *http://localhost:3000/* This is your react Dapp

- In another browser window/tab type *http://localhost:8000/subgraphs/name/daostack* This is an interface to the subgraph and you can type graphQL queries here to fetch data from the `postgres` database

_To learn more about subgraphs check out: [DAOstack Subgraph](https://github.com/daostack/subgraph), [TheGraph Project](https://thegraph.com/docs/quick-start)_

### Deploy and use on test network:

- Update the `.env` file with your `SEED_PHRASE` and <TESTNET-NAME>`_INFURA_URL`
- Open terminal at the project folder
- Run the following commands with testnet name eg:

  ```
  npm i
  rm -rf build
  npm run truffle-migrate --network rinkeby
  ```

- You will have to make appropriate changes in other files:

  **docker-compose.yml**
    - remove ganache service
    - update ethereum url in graph-node service to testnet url eg `rinkeby:https://rinkeby.infura.io/<INFURA-KEY>`

  **App.js**
    - add `settings.<TESTNET>` eg. `settings.rinkeby` with `web3Provider` set to testnet url
    - initialize Arc with `settings.<TESTNET>` eg. `settings.rinkeby`

### Stop the project:
- From the project directory type:

  ```
  npm run stop
  ```

#### Using with MetaMask with ganache:
  - Open metamask and import using private key
  - You can find the private keys from ganache logs by running `docker container logs starter-template_ganache_1`
