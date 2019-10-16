# Alchemy starter template

Use this template if you want to develop on Alchemy Interface while also editing any of the other layers of the stack

## Setup

- Download all submodules

        git submodule update --init --recursive

- Install the package

        npm i

- create `.env` file with following

        DEFAULT_GAS=3.0
        PROVIDER='http://localhost:8545'
        PRIVATE_KEY='0x4f3edf983ac636a65a842ce7c78d9aa706d3b113bce9c46f30d7d21715b23b1d'

- Start Alchemy-server and Graph-node

        npm run launch:docker

- Stop Alchemy-server and Graph-node

        npm run stop:docker

## (Optional) Deploy DAO
    
- Edit `data/testDaoSpec.json` with specifications for your DAO
- Deploy DAO

        npm run migrate

- Check `subgraph/ops/mapping.json` to make sure `arc-version` for which you deployed the DAO is being tracked
- If your version is missing add them to `mapping.json`. eg

        {
            "name": "GEN",
            "contractName": "GEN",
            "dao": "base",
            "mapping": "DAOToken",
            "arcVersion": "0.0.1-rc.27"
        },
        {
         "name": "ContributionReward",
         "contractName": "ContributionReward",
         "dao": "base",
         "mapping": "ContributionReward",
         "arcVersion": "0.0.1-rc.27"
       },
      // Do this for all the contracts of new version

  NOTE: You can check the version of your DAO in `data/migration.json`

## (Optional) Update Subgraph

If you want to add new contract to track or update/edit existing tracker you may want to update subgraph `src/mappings` or `src/domain/`

Refer to [subgraph repo](https://github.com/daostack/subgraph) or [Add new scheme tutorial](https://daostack.github.io/DAOstack-Hackers-Kit/gettingStarted/setupCustomScheme/) for details

## (Optional) Deploy Subgraph

If you edited/updated the subgraph or deployed a new DAO, then you will have to deploy new subgraph to the graph node

    npm run deploy:graph

## (Optional) Update Client

You might want to update client library while working on Alchemy integration if you added new contract of updated subgraph

    npm run build:client
    npm run link:client

If you are developing on client, you might want to launch watcher to compile new version. So run watcher

    npm run watch:client

## Start Alchemy

You can start Alchemy app with a webpack watcher that will build and relaunch the app as you make changes

    npm run start:alchemy  
