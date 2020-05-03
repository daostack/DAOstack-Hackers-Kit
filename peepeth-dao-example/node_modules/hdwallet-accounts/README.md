# hdwallet-accounts
The Hierarchical Deterministic (HD) key creation and transfer protocol (BIP32), allows creating 
child keys from parent keys in a hierarchy. Wallets using the HD protocol are called HD wallets.

When using such a wallet for development of Ethereum Smart Contracts, it is often necessary
to test code using multiple accounts to simulate different users. In such situations, 
HDWalletAccounts can be used to quickly get an array of accounts and their corresponding
public and private keys.

## Install

```
$ npm install hdwallet-accounts
```

## General Usage

You can use this package in any Javascript app where Ethereum account generation is required. If you are 
using Truffle and Ganache, then this package is useful in test scripts because the commonly used HDWalletProvider
will only return one account (the first, unless you override it in truffle.js).

```javascript
let HDWalletAccounts = require("hdwallet-accounts");

// 12 word mnemonic
let mnemonic = "myth slice august trophy letter display elephant accuse absorb enjoy hawk course"; 

// Generate 10 accounts using the mnemonic
let walletAccounts = HDWalletAccounts(10, mnemonic);

// Or, alternatively skip the mnemonic and have one auto-created
let walletAccounts = HDWalletAccounts(10);
console.log('Mnemonic:', walletAccounts.mnemonic);
console.log('Account-00 Address:', walletAccounts.accounts[0].address);
console.log('Account-00 Private Key:', walletAccounts.accounts[0].privateKey);
console.log('Account-00 Public Key:', walletAccounts.accounts[0].publicKey);
```

Parameters:

- `count`: `number`. Number of accounts to generate. Defaults to 10.
- `mnemonic`: `string`. 12-word mnemonic from which accounts are created. Auto-generated if not specified.

## Truffle Usage

You can easily use this within a Truffle configuration. In fact, this package was created to make Ganache accounts available in Truffle test scripts.

truffle.js
```javascript
let HDWalletAccounts = require("hdwallet-accounts");
let walletAccounts = HDWalletAccounts(10, web3.currentProvider.mnemonic);
```
