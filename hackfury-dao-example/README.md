# The Hackfury DAO - Decentralized Audit Organization

The Hackfury DAO is Decentralized Audit Organization for worldwide smart contract audits management built with DAOStack. The DAO stores meta information for all audit reports submitted. It also handles reputation management for auditors.

### The DAO functionalities:

1. Register as an auditor.
2. Submit audit report metadata to blockchain; lock ether for the period in the audit report.
3. Sign the report by customer.
4. Tip the auditor with the reputation.
5. Claim the tokens back from the report lock
   There are also several trusted auditor accounts predefined with non-zero reputation.

### DAO functions

- registerAsAuditor - any account can register as auditor with 0 reputation points.
- submitReport - auditor publishes report metadata to blockchain.
- confirmReport - customer confirms that he received the final report.
- blameHack - trusted auditor can blame the report as failed after the hack of code appears (Interface for this is still under constructions).
- claimEnd - auditor can claim locked tokens/ether after a year without hacks of the code.
- tipAuditorWithReputation - trusted auditors can give some reputation points for addresses they know.

### Report structure

1. auditor - Ethereum address of the auditor.
2. customer - Ethereum address of the customer.
3. date - date when the audit report was published (in seconds, [unix time](https://en.wikipedia.org/wiki/Unix_time)).
4. linkToReport - link to the report (can be closed github for private reports).
5. codeVersionAudited - the version of code audited (link to etherscan / link to github, link should contain commit).
6. reportHashsum - hashsum of the report file.
7. boolSummary - bool summary of the audit, was it passing or not.
8. approvedByCustomer - bool whether customer approved the report.

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

### Run on a local testnet:

```
npm explore @daostack/arc.js -- npm start ganache
```

Then on a different terminal window (but still in your project folder):

```
npm explore @daostack/arc.js -- npm start migrateContracts
rm -rf build
truffle migrate
```

Open `src/index.js` and make sure the `avatarAddress` and `votingMachineAddress` are identical to the ones found in the end of the `truffle migrate` logs output. If not, paste the correct addresses and enter the following terminal command:

```
npx webpack --config webpack.config.js
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
npx webpack --config webpack.config.js
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
npx webpack --config webpack.config.js
```

## Credits

This example was created by [@rdchksec](https://github.com/rdchksec) and [@eternalflow](https://github.com/eternalflow) at ETHBerlin Hackathon. This project is a forked version of their work which you can find [here](https://github.com/eternalflow/ethberlin-hackfury), this version meant to serve for educational purposes for developers.
