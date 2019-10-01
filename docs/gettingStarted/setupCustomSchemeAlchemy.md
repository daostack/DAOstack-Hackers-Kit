Schemes are the actions a DAOstack DAO can take. Once you have created your scheme contract and registered it to the DAO, you will have to add support for your scheme in various layers of the stack

### Run  graph-node locally with new/not yet supported schemes

  Choose this if,

  - using custom scheme or any arc scheme which is not yet tracked by daostack subgraph
  - adding subgraph/client support for new contract or customizing current client/subgraph
  - playing with DAO you just deployed to any of the testnet and not yet whitelisted by daostack
  - using any testnet

#### Deploy subgraph and start graph node locally

  1. Update `.env` file in `subgraph` directory

        # Following are example values please change for customization
        network="rinkeby"
        subgraph="daostack"
        postgres_password="letmein"
        ethereum_node="https://rinkeby.infura.io/v3/e0cdf3bfda9b468fa908aa6ab03d5ba2"

  2. Start `graph-node` in docker for your testnet

        npm run docker:run-rinkeby 

  3. Add your DAO details and deploy subgraph

        touch daos/rinkeby/<DAO-Name>.json

        # Add your DAO details in <DAO-Name.json> file
        # refer to any of existing file in daos/rinkeby folder
        # you can skip argument to deploy if using default `migration.json` from `@daostack/migration`

        npm run deploy '{  "migrationFile" : "../migration.json" }'
        
  4. Go back to directory `alchemy` and Update `docker-compose.yml`

        - remove link to `graph-node` in service `alchemy`
        - remove services `graph-node`, `ipfs`, `postgres4graphnode` and `ganache`

  5. Update `webpack.docker.config.js`, add following process variables

        'ARC_GRAPHQLHTTPPROVIDER': JSON.stringify('http://127.0.0.1:8000/subgraphs/name/daostack'),
        'ARC_GRAPHQLWSPROVIDER': JSON.stringify('ws://127.0.0.1:8001/subgraphs/name/daostack'),
        'ARC_IPFSPROVIDER': JSON.stringify('localhost')

      NOTE: If you changed name of `subgraph` while setting up `.env` in `step 1` then change it in this step accordingly
      
  6. Build and run
          docker-compose up -d

  NOTE: 

  1. You can also deploy subgraph to graph explorer. `Step 1 & 2` will be replaced by [deploy to graph-explorer](https://github.com/daostack/subgraph#deploy-subgraph)
   and `Step 4` will be updated to have corresponding url

  2. Alchemy only shows `daos` that are registered via `DAOregistry`. You can send the `.json` of your DAO details to us (contact Nave Rachman, telegram: @NaveRachman) and we will help you.
  
  3. You can bypass `DAOregistry` while in dev mode by making changes in `src/components/Daos/DaosPage.tsx`:
      
      # original
      arc.daos({ where: { name_not_contains: "Genesis Alpha", register: "registered" }, orderBy: "name", orderDirection: "asc"})

      # change to
      arc.daos({ where: { name_not_contains: "Genesis Alpha" }, orderBy: "name", orderDirection: "asc"})
