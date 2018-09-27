# PeepDAO - The first DAO on social media

This project is dapp for interacting with a DAO which has its own social media account on [Peepeth](Peepeth.com), a decentralized microblogging app. The Dapp allows to make decisions on posting Peeps on behalf of the DAO by decentralized voting of its participants.
This project is an educational example demonstraiting the use of the DAOstack framework to build collaborative dapps and DAOs.
You can use the code here to deploy and interact with a new DAO, or integrate in your own DAO project.

**Notice: the code here was not profesionally audited and was written for the purpose of education and demostration, please use the code with caution and don't use with real money (unless you are willing to take the assosiated risks)**

## How to use?

Enter the project folder from the terminal and type the following:

After downloading the project:

```
npm install
npm install -g nps
npm install -g npx
```

- _Note: to configure different founder accounts or any other change to the DAO, go to `migrations/2_deploy_dao.js` and follow the instructions in the comments._

### Getting the Arc contracts addresses:

Use this command to get the addressses of Arc contracts on all networks:

```
node getArcContracts.js
```

The command will aslo re-generate `arc.json` file which will be used by the migration script to deploy the DAO.

### Run on a local testnet:

```
npm run ganache
```

Then on a different terminal window (but still in your project folder):

```
npm run migrate-daostack
rm -rf build
npm run truffle-migrate
```

Open `src/index.js` and make sure the `avatarAddress` and `votingMachineAddress` are identical to the ones found in the end of the `truffle migrate` logs output. If not, paste the correct addresses and enter the following terminal command:

```
npm run webpack
```

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
