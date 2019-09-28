# Alchemy starter template

Use this template if you want to develop on Alchemy Interface and add new scheme support to the Alchemy for existing/new DAO

Once you are in alchemy-starter folder follow the following instructions

    npm i

  - Start Alchemy-server and Graph-node

        npm run launch:docker

  - (Optional) Edit daoSpec.json and Deploy new DAO

        npm run migrate

  - (Optional) Edit `subgraph/src` to add new contract tracker and deploy new subgraph

        npm run deploy-graph
