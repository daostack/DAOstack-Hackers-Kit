# DAICO - Responsible Decentralized Fund Raising

This project is and example implementation for launching an ICO with a DAO.

**Notice: the code here was not profesionally audited, please use the code with caution and don't use with real money (unless you are willing to take the assosiated risks)**

## Project Structure:

In this template, we use: `npm`, `truffle` and `webpack`, as well as DAOstack Arc, Client and Subgraph.
The structure is basically as follows:

- **contracts** - Contains ICO scheme contract. You can use any Arc contract simply by importing it. For example `import "@daostack/arc/contracts/universalSchemes/UniversalScheme.sol"`
- **migrations** - This is migration scripts folder. We are using @daostack/migration package for deploying new DAO and Custom Schemes and that is required by the DAO.
- **daico-app** - This folder is initialized with React App which uses `@daostack/client` library to interact with contracts and the subgraph. These will be your Dapp front-end files. In development environment we have a `webpack` server running which looks for the changes made in `peepeth-app/src` folder and compiles them into client side JS files. You can can find the starting file `App.js` which you can use for your project.
- **subgraph** - This is based on graphprotocol and uses mappings defined in `src/mappings` to index the blockchain events and store them in a `postgres` database as Entities described by `graphQl` schema. The `subgraph` deploy script uses output of migrations in `data/migration.json` to get the contract addresses. You can find mappings for the base contracts here and can add more mappings and schema for your custom contracts
-**data** - This folder contains the `daicoSpec.json`, which is the file used to specify details for the new DAO to be deployed, feel free to change it according to your project needs. It also contains an `example.env`, which has example environment variables set, copy this file to your project root i.e. `daico` folder as `.env` and edit the variables accordingly. Lastly, there is a `migration.json` file which will contain the output after running the migration

## How to use?

Enter the project folder from the terminal and type the following:

After downloading the project:

```
npm install
npm install -g nps
npm install -g npx
```

### Running your project on private network (Using docker)

After downloading the project and docker:

- Update the `.env` file with your `PRIVATE_KEY`  `PROVIDER` and `NETWORK` in `peepeth-dao-example` directory. Use `data/example.env` for reference
- Enter the project folder from the terminal (i.e. peepeth-dao-example) and follow:

#### Launch Docker

```
npm run launch:docker
```

  This would build the docker images and start the docker container for `ganache`, `peepeth-app` with webpack server, `graph-node` for indexing blockchain events, `ipfs` where subgraph mappings reside and `postgres` database where blockchain events are stored as described by the schema

#### Build and Migrate Contracts

```
npm run compile
npm run migrate
```

#### Migrate subgraph for indexing DAO
```
npm run deploy-graph
```

#### Develop / Play with App

- Open your web browser and type *http://localhost:3000/* This is your react Dapp. You can edit the `peepeth-app` code to modify frontend and the webpack watcher will rebuild the app

#### Stop docker containers

```
npm run stop
```

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
cd daico-app
npm run start
```

### Deploy and use on Test network:

- Update the `.env` file with your `PRIVATE_KEY`  `PROVIDER` and `NETWORK` in `daico` directory. Use `data/example.env` for reference
- Open terminal at the project folder and run the following commands:

  ```
  npm run compile
  npm run migrate
  ```
  
  From `daico-app` directory run app with webpack for development

```
npm run start
```

### Use the web interface:

#### Using MetaMask with ganache:
  - Open metamask and import using private key
  - You can find the private keys from ganache logs by running `docker container logs <container_name>`
  - Open your web browser with MetaMask open _and connected to your configured network_


_Please note that the command might take a couple of minutes so be patient._
