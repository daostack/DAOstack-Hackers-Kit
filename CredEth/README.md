# CredEth-core
Credeth is the open reputation protocol powered by DAOStack that makes on-chain governance easier

## Pre-requisite
Node >= 10.15.1
daoStack-arc version 0.0.1-rc.23

## Deployment
```
npm run compile
node migrations/2_deploy_dao.js
npm run migrate:local
```

## Network

To change the network and the provider URL in the `.env` file and in the `truffle.js` file
