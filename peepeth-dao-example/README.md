# PeepDAO - The first DAO on social media

This project is dapp for interacting with a DAO which has its own social media account on [Peepeth](https://peepeth.com/welcome), a decentralized microblogging app. The Dapp allows to make decisions on posting Peeps on behalf of the DAO by decentralized voting of its participants.
This project is an educational example demonstraiting the use of the DAOstack framework to build collaborative dapps and DAOs.
You can use the code here to deploy and interact with a new DAO, or integrate in your own DAO project.

**Notice: the code here was not profesionally audited and was written for the purpose of education and demostration, please use the code with caution and don't use with real money (unless you are willing to take the assosiated risks)**

## Project Structure:

- **contracts** - Contains PeepScheme contract and also a simplified Peepeth app contract for local development. You can use any Arc contract simply by importing it. For example `import "@daostack/arc/contracts/universalSchemes/UniversalScheme.sol"`
- **migrations** - This is migration scripts folder. We are using @daostack/migration package for deploying new DAO, Custom Schemes and any Stand Alone contracts that might be required by the DAO.
- **starter-app** - This folder is initialized with React App which uses `@daostack/client` library to interact with contracts and the subgraph. These will be your Dapp front-end files. In development environment we have a `webpack` server running which looks for the changes made in `peepeth-app/src` folder and compiles them into client side JS files. You can can find the starting file `App.js` which you can use for your project.
- **subgraph** - This is based on graphprotocol and uses mappings defined in `src/mappings` to index the blockchain events and store them in a `postgres` database as Entities described by `graphQl` schema. The `subgraph` deploy script uses output of migrations in `data/migration.json` to get the contract addresses. You can find mappings for the base contracts here and can add more mappings and schema for your custom contracts
-**data** - This folder contains the `testDaoSpec.json`, which is file used to specify details for the new DAO to be deployed, feel free to change it according to your project needs. It also contains an `example.env`, which has example environment variables set, copy this file to your project root i.e. `starter-template` folder as `.env` and edit the variables accordingly. Lastly, there is a `migration.json` file which will contain the output after running the migration

## How to use?

Enter the project folder from the terminal and type the following:

After downloading the project:

```
npm install
npm install -g nps
npm install -g npx
```

## Running your project on private network:

### Using docker
After downloading the project and docker:

- Update the `.env` file with your `PRIVATE_KEY`  `PROVIDER` and `NETWORK` in `peepeth-dao-example` directory. Use `data/example.env` for reference
- Enter the project folder from the terminal (i.e. peepeth-dao-example) and follow:

#### Launch Docker

```
npm run launch:docker
```

  This would build the docker images and start the docker container for `ganache`, `peepeth-app` with webpack server, `graph-node` for indexing blockchain events, `ipfs` where subgraph mappings reside and `postgres` database where blockchain events are stored as described by the schema

#### Migrate Contracts

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

#### Migrate subgraph for indexing DAO
```
npm run deploy-graph
```

#### Develop / Play with App

- Open your web browser and type *http://localhost:3000/* This is your react Dapp. You can edit the `peepeth-app` code to modify frontend and the webpack watcher will rebuild the app

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

### Deploy and use on Test network:

- Update the `.env` file with your `PRIVATE_KEY`  `PROVIDER` and `NETWORK` in `starter-template` directory. Use `data/example.env` for reference
- Update the `.env` file in `starter-template/subgraph` directory. Use `subgraph/example.env` or `subgraph/readme.md` for reference
- Open terminal at the project folder and run the following commands:

  ```
  npm run compile
  npm run migrate
  ```
  
  From `peepeth-app` directory run app with webpack

```
npm run start
```

### Use the web interface:

#### Using MetaMask with ganache:
  - Open metamask and import using private key
  - You can find the private keys from ganache logs by running `docker container logs <container_name>`
  - Open your web browser with MetaMask open _and connected to your configured network_


_Please note that the command might take a couple of minutes so be patient._
