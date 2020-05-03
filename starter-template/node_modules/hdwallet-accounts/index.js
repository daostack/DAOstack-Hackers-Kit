// The Hierarchical Deterministic (HD) key creation and transfer protocol (BIP32), allows creating 
// child keys from parent keys in a hierarchy. Wallets using the HD protocol are called HD wallets.
// When using such a wallet for development of Ethereum Smart Contracts, it is often necessary
// to test code using multiple accounts to simulate different users. In such situations, 
// HDWalletAccounts can be used to quickly get an array of addresses and their corresponding
// public and private keys.

var bip39 = require("bip39");
var hdkey = require('ethereumjs-wallet/hdkey');


function HDWalletAccounts(count, mnemonic) {
    mnemonic = mnemonic || bip39.generateMnemonic();
    count = count || 10;

    let hdwallet = hdkey.fromMasterSeed(bip39.mnemonicToSeed(mnemonic));
    let wallet_hdpath = 'm/44\'/60\'/0\'/0/';
  
    let walletAccounts = [];
    for(let index = 0; index < count; index++) {
        let wallet = hdwallet.derivePath(wallet_hdpath + String(index)).getWallet();
        walletAccounts.push(
            {
                address: '0x' + wallet.getAddress().toString('hex'),
                publicKey: wallet.getPublicKeyString(),
                privateKey: wallet.getPrivateKeyString()
            }
        )
    }

    return { mnemonic: mnemonic, accounts: walletAccounts };
}

module.exports = HDWalletAccounts;