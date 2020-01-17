require('dotenv').config();
const IPFSClient = require('ipfs-http-client');

process.env = {
  ethereum: 'http://127.0.0.1:8545',
  ipfs: '/ip4/127.0.0.1/tcp/5001',
  node_http: 'http://127.0.0.1:8000/subgraphs/name/daostack',
  node_ws: 'http://127.0.0.1:8001/subgraphs/name/daostack',
  test_mnemonic:
    'myth like bonus scare over problem client lizard pioneer submit female collect',
  ...process.env,
};

const { execute } = require('apollo-link');
const { WebSocketLink } = require('apollo-link-ws');
const { SubscriptionClient } = require('subscriptions-transport-ws');
const ws = require('ws');
import axios from 'axios';
import * as HDWallet from 'hdwallet-accounts';
const Web3 = require('web3');

const { node_ws, node_http, ethereum, ipfs, test_mnemonic } = process.env;

export async function sendQuery(q: string, maxDelay = 1000, url = node_http) {
  await new Promise((res, rej) => setTimeout(res, maxDelay));
  const {
    data: { data },
  } = await axios.post(url, {
    query: q,
  });

  return data;
}

export const addressLength = 40;
export const hashLength = 64;
export const nullAddress = '0x0000000000000000000000000000000000000000';
export const nullParamsHash = '0x' + padZeros('', 64);

export async function getWeb3() {
  const web3 = new Web3(ethereum);
  const hdwallet = HDWallet(10, test_mnemonic);
  Array(10)
    .fill(10)
    .map((_, i) => i)
    .forEach((i) => {
      const pk = hdwallet.accounts[i].privateKey;
      const account = web3.eth.accounts.privateKeyToAccount(pk);
      web3.eth.accounts.wallet.add(account);
    });
  web3.eth.defaultAccount = web3.eth.accounts.wallet[0].address;
  return web3;
}

export function getContractAddresses() {
  const addresses = require(`@daostack/migration/migration.json`);
  let arcVersion = '0.0.1-rc.16';
  return {
    ...addresses.private.test[arcVersion],
    ...addresses.private.dao[arcVersion],
    ...addresses.private.base[arcVersion],
    ...addresses.private.test[arcVersion].organs,
    TestAvatar: addresses.private.test[arcVersion].Avatar,
    NativeToken: addresses.private.dao[arcVersion].DAOToken,
    NativeReputation: addresses.private.dao[arcVersion].Reputation,
  };
}

export function getArcVersion() {
  return '0.0.1-rc.16';
}

export function getOrgName() {
  return require(`@daostack/migration/migration.json`).private.dao['0.0.1-rc.16'].name;
}

export async function getOptions(web3) {
  const block = await web3.eth.getBlock('latest');
  return {
    from: web3.eth.defaultAccount,
    gas: block.gasLimit - 100000,
  };
}

export async function writeProposalIPFS(data: any) {
  const ipfsClient = IPFSClient(ipfs);
  const ipfsResponse = await ipfsClient.add(new Buffer(JSON.stringify(data)));

  return ipfsResponse[0].path;
}

export function padZeros(str: string, max = 36) {
  str = str.toString();
  return str.length < max ? padZeros('0' + str, max) : str;
}

export const createSubscriptionObservable = (
  query: string,
  variables = 0,
  wsurl = node_ws,
) => {
  const client = new SubscriptionClient(wsurl, { reconnect: true }, ws);
  const link = new WebSocketLink(client);
  return execute(link, { query, variables });
};

export async function waitUntilTrue(test: () => Promise<boolean> | boolean) {
  return new Promise((resolve, reject) => {
    (async function waitForIt(): Promise<void> {
      if (await test()) { return resolve(); }
      setTimeout(waitForIt, 30);
    })();
  });
}

export async function waitUntilSynced() {
  const getGraphsSynced = `{
    subgraphDeployments {
      synced
    }
  }`;
  const graphIsSynced = async () => {
    let result = await sendQuery(
      getGraphsSynced,
      1000,
      'http://127.0.0.1:8000/subgraphs');
    return ((result.subgraphDeployments.length > 0) && result.subgraphDeployments[0].synced);
    };
  return waitUntilTrue(graphIsSynced);
}

export const increaseTime = async function(duration, web3) {
  const id = await Date.now();
  web3.providers.HttpProvider.prototype.sendAsync = web3.providers.HttpProvider.prototype.send;

  return new Promise((resolve, reject) => {
    web3.currentProvider.sendAsync({
      jsonrpc: '2.0',
      method: 'evm_increaseTime',
      params: [duration],
      id,
    }, (err1) => {
      if (err1) { return reject(err1); }

      web3.currentProvider.sendAsync({
        jsonrpc: '2.0',
        method: 'evm_mine',
        id: id + 1,
      }, (err2, res) => {
        return err2 ? reject(err2) : resolve(res);
      });
    });
  });
};

export function toFixed(x) {
  if (Math.abs(x) < 1.0) {
    // tslint:disable-next-line: radix
    let e = parseInt(x.toString().split('e-')[1]);
    if (e) {
        x *= Math.pow(10, e - 1);
        x = '0.' + (new Array(e)).join('0') + x.toString().substring(2);
    }
  } else {
    // tslint:disable-next-line: radix
    let e = parseInt(x.toString().split('+')[1]);
    if (e > 20) {
        e -= 20;
        x /= Math.pow(10, e);
        x += (new Array(e + 1)).join('0');
    }
  }
  return x;
}
