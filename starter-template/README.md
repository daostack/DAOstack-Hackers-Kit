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

# Running your project.

To run your project on a local testnet:

Enter the project folder from the terminal/cmd, then type:

```
npm install
npm install -g nps
npm explore @daostack/arc.js -- npm start ganache
```

Then, open a different terminal window (but still in your project folder) and type:

```
npm explore @daostack/arc.js -- npm start migrateContracts
rm -rf build
truffle migrate
```

Now you can go ahead and open your `index.html` file in a web browser and start using your dapp.
