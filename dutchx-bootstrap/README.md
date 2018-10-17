# DutchX - The first DEX managed by a DAO

This project contains a minimal UI for participating in the bootstrap of the DutchX DAO.

**Notice: the code here was not profesionally audited, please use the code with caution and don't use with real money (unless you are willing to take the assosiated risks)**

## How to use?

Enter the project folder from the terminal and type the following:

After downloading the project:

```
npm install
npm install -g nps
npm install -g npx
```

- _Note: to configure different founder accounts or any other change to the DAO, go to `migrations/2_deploy_dao.js` and follow the instructions in the comments._

### Run on a local testnet:

```
npm run ganache
```

Then on a different terminal window (but still in your project folder) you can choose one of the 2:

1. Run all with one command:
```
npm run launch-local
```

Then open your web browser and type `http://localhost:3000/`

2. Run the commands one by one as follows:

```
npm run migrate-daostack
rm -rf build
npm run truffle-migrate
```

### Getting the Arc contracts addresses:

Use this command to get the addressses of Arc contracts on all networks:

```
node getArcContracts.js
```

The command will aslo re-generate `arc.json` file which will be used by the migration script to deploy the DAO.

### Deploy and use on Kovan network:

1. Enter the `truffle.js` file and make the changes as instructed there.
2. Open `src/index.js` and uncomment the lines to configure Kovan (as instructed there).
3. Open terminal at the project folder
4. Run the following commands:

```
rm -rf build
truffle migrate --network kovan-infura
```

5. Copy the Avatar and Voting Machine addresses from the end of the `truffle migrate` logs.
6. Open `src/index.js` and pasted the copied addresses in the `avatarAddress` and `votingMachineAddress`.
7. On the terminal window, run the following command:

```
npm run webpack
```

### Use the web interface:

#### Using directly with Ganache:

- Go to `dist/index.html` and follow the instructions in the comments
- After saving the changes, just open index.html in your web browser.

#### Using with MetaMask:

1. Open terminal at the project folder
2. Run `node dist/app.js`
3. Open your web browser with MetaMask open _and connected to your configured network_
4. In your browser enter: `http://localhost:3000/`
5. Please note that here you'll need to refresh the page after submitting transactions in order to view the new state in the UI.

_Note:
After making changes in the src js files use the following command:_

```
npm run webpack
```

_Please note that the command might take a couple of minutes so be patient._
