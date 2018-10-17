# DAOstack Starter Template

This is a basic template you can use for kickstarting your project using the DAOstack platform.
Here you can find the basic structue for using both Arc and Arc.js to build your project.

# How to get started:

First, please change the `package.json` file to fit your project.
You can then go ahead and edit the template to fit your needs.

## Project Structure:

In this template, we use: `npm`, `truffle` and `webpack`, as well as DAOstack Arc and Arc.js.
The structure is basically as follows:

- `contracts` - Your custom smart contracts should be located under here. You can use any Arc contract simply by importing it. This is an example import `import "@daostack/arc/contracts/universalSchemes/UniversalScheme.sol";`.
- `test` - Your JS test files should be located under this folder. You can add any standard truffle tests under this folder.
- `migrations` - This is a truffle migration scripts folder. You can write Truffle migration script for deploying your DAO or smart contracts and place the script under that folder. We already created a file for you there wiith some explanation on how to use it with Arc.
- `src` - This folder is used for JavaScript files which are written in NodeJS. This later use `webpack` to compile them into client side JS files. You can find there a starting file which you can use for your project. If you're willing to add or change files there please review the `webpack.config.js` file and modify it to work with your changes.

- `dist` - Your Dapp front-end files should be placed under this folder. You can see there we already creaated a basic HTML page imorting JQuery and the compiled js file from `src` (named `main.js`).

## Running your project:

Enter the project folder from the terminal and type the following:

After downloading the project:

```
npm install
npm install -g nps
npm install -g npx
```

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
2. Run

```
node dist/app.js
```

3. Open your web browser with MetaMask open _and connected to your configured network_
4. In your browser enter: `http://localhost:3000/`
5. Please note that here you'll need to refresh the page after submitting transactions in order to view the new state in the UI.

_Note:
After making changes in the src js files use the following command:_

```
npm run webpack
```

_Please note that the command might take a couple of minutes so be patient._
