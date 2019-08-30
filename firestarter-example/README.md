# FireStarter Example

Firestarter is a community driven crowdsourcing platform, which utilizes DaoStack for governance of the projects.
This is a striped down version of the project, which only showcases the DaoStack integration.

**Notice: the code here was not profesionally audited, please use the code with caution and don't use with real money (unless you are willing to take the assosiated risks)**

## How it works?
Firestarter users can supply funds to a project, project owner can withdraw those funds.
Users reputation is based on how much Ether they supplied for a given project.
Users vote on project proposals, if the proposal has majority vote the proposal passes and the funds for the proposal are transfered.

Once the DAO and schemes are deployed you can create your own interface or use/modify [alchemy](https://github.com/daostack/alchemy) to interface with your DAO

# How to get started:

First, please change the `package.json` file to fit your project.
You can then go ahead and edit the template to fit your needs.

## Project Structure:

In this template, we use: `npm`, `truffle` and `webpack`, as well as DAOstack Arc, Client and Subgraph.
The structure is basically as follows:

- **contracts** - Your custom smart contracts should be located under here. You can use any Arc contract simply by importing it. This is an example import `import "@daostack/arc/contracts/universalSchemes/UniversalScheme.sol"`
- **migrations** - This is a truffle migration scripts folder. You can write Truffle migration script for deploying your DAO or smart contracts and place the script under that folder. We already created a file for you to deploy a new DAO using @daostack/migration library.
-**data** - This folder contains the `fireStarterDAOspec.json`, which is file used to specify details for the new DAO to be deployed, feel free to change it according to your project needs. It also contains an `example.env`, which has example environment variables set, copy this file to your project root i.e. `firestarter-example` folder as `.env` and edit the variables accordingly. Lastly, there is a `migration.json` file which will contain the output after running the migration

## Running your project on private network:

- Update the `.env` file with your `SEED_PHRASE` or `PRIVATE_KEY`, `PROVIDER`, `CUSTOM_ABI_LOCATION` and `NETWORK` in `firestarter-example` directory. Use `data/example.env` for reference
- From the project folder from the terminal (i.e. firestarter-example) type the following:

  ```
  npm i
  npm run compile
  npm run ganache
  npm run migrate
  ```

  Make sure the DAO is deployed and output is written to output file. You should see the following:
  ```
  {
    name: 'FireStarter',
    Avatar: '0xf22e8a990Df4dBD15859cfACb9D4b1e01d6fCC29',
    DAOToken: '0x85FaF9E1e8614daA39BE0e219F4AEbe58631F6B8',
    Reputation: '0x0D16Bc6c58B2044452bBA9d92Ff0183c2A170643',
    Controller: '0x06F7f6e364259bd77354098e0149d1D552887Bea',
    Schemes: { 
      FireStarter: '0x467fD9FEA4e77AC79504a23B45631D29e42eaa4A'
    }
  }
  ```

### Deploy and use on test network:

- Update the `.env` file with your `SEED_PHRASE` or `PRIVATE_KEY`  `PROVIDER` and `NETWORK` in `firestarter-example` directory. Use `data/example.env` for reference
- Open terminal at the project folder and run the following commands:

  ```
  npm i
  npm run compile
  npm run migrate
  ```

#### Using MetaMask with ganache:
  - Open metamask and import using private key
  - You can find the private keys from ganache logs by running
