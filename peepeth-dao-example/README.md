# PeepDAO - The first DAO on social media

This project is dapp for interacting with a DAO which has its own social media account on [Peepeth](Peepeth.com), a decentralized microblogging app. The Dapp allows to make decisions on posting Peeps on behalf of the DAO by decentralized voting of its participants.
This project is an educational example demonstraiting the use of the DAOstack framework to build collaborative dapps and DAOs.
You can use the code here to deploy and interact with a new DAO, or integrate in your own DAO project.

**Notice: the code here was not profesionally audited and was written for the porpuse of education and demostration, please use the code with caution and don't use with real money (unless you are willing to take the assosiated risks)**

## How to use?

Enter the project folder from the terminal and type the following:

After downloading the project:
`npm install`
`npm install -g nps`

### Run on a local testnet:

`npm explore @daostack/arc.js -- npm start ganache`
Then on a different terminal window (but still in your project folder):
`npm explore @daostack/arc.js -- npm start migrateContracts`
`rm -rf build`
`truffle migrate`

### Deploy and use on Kovan network:

1. Enter the `truffle.js` file and make the changes as instructed there.
2. Open `src/index.js` and uncomment the lines to configure Kovan (as instructed there).
3. Open terminal at the project folder
4. Run the following commands:
   - `rm -rf build`
   - `truffle migrate --network kovan-infura`
   - `npx webpack --config webpack.config.js`

### Use the web interface:

1. Open terminal at the project folder
2. Run `node dist/app.js`
3. Open your web browser with MetaMask open and connected to Kovan
4. In your browser enter: `http://localhost:3000/`

_Note:
After making changes in the src js files use the following command:
`npx webpack --config webpack.config.js`_
