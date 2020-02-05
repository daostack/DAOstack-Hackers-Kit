# PeepDAO - The first DAO on social media

This project is dapp for interacting with a DAO which has its own social media account on [Peepeth](https://peepeth.com/welcome), a decentralized microblogging app. The Dapp allows to make decisions on posting Peeps on behalf of the DAO by decentralized voting of its participants.
This project is an educational example demonstraiting the use of the DAOstack framework to build collaborative dapps and DAOs.
You can use the code here to deploy and interact with a new DAO, or integrate in your own DAO project.

**Notice: the code here was not profesionally audited and was written for the purpose of education and demostration, please use the code with caution and don't use with real money (unless you are willing to take the assosiated risks)**

## Project Structure:

- **contracts** - Contains PeepScheme contract and also a simplified Peepeth app contract for local development. You can use any Arc contract simply by importing it. For example `import "@daostack/arc/contracts/universalSchemes/UniversalScheme.sol"`
- **migrations** - This is migration scripts folder. We are using @daostack/migration package for deploying new DAO, Custom Schemes and any Stand Alone contracts that might be required by the DAO.
- **peepeth-app** - This folder is initialized with React App which uses `@daostack/client` library to interact with contracts and the subgraph. These will be your Dapp front-end files. In development environment we have a `webpack` server running which looks for the changes made in `peepeth-app/src` folder and compiles them into client side JS files. You can can find the starting file `App.js` which you can use for your project.
-**data** - This folder contains the `peepDAOspec.json`, which is file used to specify details for the new DAO to be deployed, feel free to change it according to your project needs. It also contains an `example.env`, which has example environment variables set, copy this file to your project root i.e. `starter-template` folder as `.env` and edit the variables accordingly. Lastly, there is a `migration.json` file which will contain the output after running the migration

## How to use?

Enter the project folder from the terminal and Install package

```
npm install
npm install -g nps
npm install -g npx
```

- Update the `.env` file with your `PRIVATE_KEY`  `PROVIDER` and `NETWORK` in `peepeth-dao-example` directory. Use `data/example.env` for reference

### Running your project on private network (Using docker)

After downloading docker

- Launch Docker

```
npm run launch:docker
```

  This will start the docker container for `ganache`, `graph-node` for indexing blockchain events, `ipfs` where subgraph mappings reside and `postgres` database where blockchain events are stored as described by the schema

- Build and Migrate Contracts and DAO

```
npm run compile
npm run migrate
```

- Deploy new subgraph for indexing DAO

```
npm run deploy-graph
```

- After deploying the graph and getting it synced you can start playing/developing your app with webpack watcher running:

```
npm run launch:app
```

- Open your web browser and type *http://localhost:3000/* This is your react Dapp. You can edit the `peepeth-app` code to modify frontend and the webpack watcher will rebuild the app

- In another browser window/tab type *http://localhost:8000/subgraphs/name/<subgraph_name_from_example.env>/graphql* or *http://localhost:8000/* This is an interface to the subgraph and you can type graphQL queries here to fetch data from the `postgres` database

### Running your project on private network (Without docker)

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

### Deploy and use on Test network:

- Update the `.env` file with your `PRIVATE_KEY`  `PROVIDER` and `NETWORK` in project directory. Use `data/example.env` for reference
- Open terminal at the project folder and run the following commands:

  ```
  npm run compile
  npm run migrate
  ```
  
  - Update `docker-compose.yml` for testnet if running graph-node locally.
  - Update `App.tsx` to use testnet settings and launch.

  ```
  npm run launch:app
  ```

### Stop the project:
- From the project directory type:

  ```
  npm run stop
  ```

### Use the web interface:

#### Using MetaMask with ganache:
  - Open metamask and import using private key
  - You can find the private keys from ganache logs by running `docker container logs <container_name>`
  - Open your web browser with MetaMask open _and connected to your configured network_


_Please note that the command might take a couple of minutes so be patient._
