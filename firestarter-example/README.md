# FireStarter Example

Firestarter is a community driven crowdsourcing platform, which utilizes DaoStack for governance of the projects.
This is a striped down version of the project, which only showcases the DaoStack integration.

**Notice: the code here was not profesionally audited, please use the code with caution and don't use with real money (unless you are willing to take the assosiated risks)**

## How it works?
Firestarter users can supply funds to a project, project owner can withdraw those funds.
Users reputation is based on how much Ether they supplied for a given project.
Users vote on project proposals, if the proposal has majority vote the proposal passes and the funds for the proposal are transfered.

Once the DAO and schemes are deployed you can create your own interface or use/modify [alchemy](https://github.com/daostack/alchemy) to interface with your DAO

## Project Structure:

In this template, we use: `npm`, `truffle` and `webpack`, as well as DAOstack Arc, Client and Subgraph.
The structure is basically as follows:

- **contracts** - Your custom smart contracts should be located under here. You can use any Arc contract simply by importing it. This is an example import `import "@daostack/arc/contracts/universalSchemes/UniversalScheme.sol"`
- **migrations** -  This contains migration script for deploying your DAO and custom scheme smart contracts. The script uses @daostack/migration package.
-**data** - This folder contains the `fireStarterDAOspec.json`, which is file used to specify details for the new DAO to be deployed, feel free to change it according to your project needs. It also contains an `example.env`, which has example environment variables set, copy this file to your project root i.e. `firestarter-example` folder as `.env` and edit the variables accordingly. Lastly, there is a `migration.json` file which will contain the output after running the migration

## How to get started:

First, please change the `package.json` file to fit your project.
You can then go ahead and edit the template to fit your needs.

### Install and Setup
- Enter the project folder from the terminal and Install package

```
npm install
npm install -g nps
npm install -g npx
```

- Update the `.env` file with your `SEED_PHRASE` or `PRIVATE_KEY`, `PROVIDER`, `CUSTOM_ABI_LOCATION` and `NETWORK` in `firestarter-example` directory. Use `data/example.env` for reference

  ```
  npm i
  ```

### Running your project on private network (docker):

It is advisable to use the Ganache docker image provided by the DAOstack since, it already includes all the base contracts needed for getting started.
- From the project folder from the terminal (i.e. firestarter-example) run the following:

  ```
  npm run launch:docker
  npm run compile
  npm run migrate
  ```

  Make sure the DAO is deployed and output is written to output file. Example output screen:
  ```
  {
    "name": "FireStarter",
    "Avatar": "0xfa5966293008f68A8D9066229b88660f63Db033D",
    "DAOToken": "0xA1f8A26E77332E751D63573da5D0e02ca9985EB1",
    "Reputation": "0x1DF86450e1aCeb6fcD874eAcF1720DDe94bf806e",
    "Controller": "0x999ca6588B5E562D18EA78dFA59E836Fd8F870C7",
    "Schemes": [
      {
        "name": "FireStarter",
        "alias": "ProjectFunding",
        "address": "0xAF541Df70B2E5Bb8b94Bf3463763169d5967e765",
        "arcVersion": "0.0.1-rc.37"
      }
    ],
    "StandAloneContracts": [],
    "arcVersion": "0.0.1-rc.37"
  }
  ```

### Running your project on private network (without docker):

If you not using the Ganache docker image provided by DAOstack, then you will have to update the `migrations/DeployDAO.js` to migrate the base contract.
- Un-comment the code portion to deploy base contracts and run the following commands:

  ```
  npm run ganache
  npm run migrate
  ```

  Make sure all the base contracts and the DAO contracts are deployed.

### Deploy and use on test network:

- Update the `.env` file with your `SEED_PHRASE` or `PRIVATE_KEY`  `PROVIDER` and `NETWORK` in `firestarter-example` directory. Use `data/example.env` for reference
- Open terminal at the project folder and run the following commands:

  ```
  npm run migrate
  ```

  - Update `docker-compose.yml` for testnet if running graph-node locally.
  - Update `App.tsx` to use testnet settings and launch.

  ```
  npm run launch:app
  ```

#### Using MetaMask with ganache:
  - Open metamask and import using private key
  - You can find the private keys from ganache logs by running `docker container logs <container_name>`
