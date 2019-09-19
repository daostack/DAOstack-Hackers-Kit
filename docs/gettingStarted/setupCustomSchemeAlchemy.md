Schemes are the actions a DAOstack DAO can take. Once you have created your scheme contract and registered it to the DAO, you will have to add support for your scheme in various layers of the stack

### Run  graph-node locally with new/not yet supported schemes

  Choose this if,

  - using custom scheme or any arc scheme which is not yet tracked by daostack subgraph
  - adding subgraph/client support for new contract or customizing current client/subgraph
  - playing with DAO you just deployed to any of the testnet and not yet whitelisted by daostack
  - using any testnet

#### Add new contract tracker in subgraph

  If you created a custom scheme or used any of the new arc scheme that are not yet tracked by subgraph, then you will have to make changes to DAOstack caching layer. 

  NOTE: You can skip this step if you do not wish to take advantage of caching layer for faster access and would rather read data directly from blockchain. But would recommend not to.

  1. Clone subgraph repo, if you have not already

        git clone git@github.com:daostack/subgraph.git
  
  2. Create a new directory with your `contract-name`

        cd subgraph
        mkdir src/mappings/MyContractName

  3. Create 4 files:

    1. Mapping Code: `src/mappings/MyContractName/mapping.ts`

    2. GraphQL schema: `src/mappings/MyContractName/schema.graphql`

    3. yaml fragment: `src/mappings/MyContractName/datasource.yaml`

        1. `abis`:  optional - list of contract names that are required by the mapping.
        2. [entities](https://github.com/graphprotocol/graph-node/blob/master/docs/subgraph-manifest.md#1521-ethereum-events-mapping): list of entities that are written by the the mapping.
        3. [`eventHandlers`](https://github.com/graphprotocol/graph-node/blob/master/docs/subgraph-manifest.md#1522-eventhandler): map of solidity event signatures to event handlers in mapping code.

      NOTE: types are generated during the build step based on the entities described in schema.graphQL. Import these types while writing handlers in `mapping.ts`
  4. integration test (optional): `test/integration/MyContractName.spec.ts`


  5. Add your contract to `ops/mappings.json`. Under the JSON object for the network your contract is located at, under the `"mappings"` JSON array, add the following.

    1. If your contract information is in the `migration.json` file specified (default is the file under `@daostack/migration` folder, as defined in the `ops/settings.js` file)

            {
               "name": "<contract name as appears in `abis/arcVersion` folder>",
               "contractName": "<contract name as appears in migration.json file>",
               "dao": "<section label where contract is defined in migration.json file (base/ dao/ test/ organs)>",
               "mapping": "<contract name from step 2>",
               "arcVersion": "<contract arc version>"
            },

    2. If your contract does not appear in the migration file:

            {
               "name": "<contract name as appears in `abis/arcVersion` folder>",
               "dao": "address",
               "mapping": "<MyContractName>",
               "arcVersion": "<contract arc version under which the abi is located in the `abis` folder>",
               "address": "<the contract address>"
            },

  6. (Optionally) add a deployment step for your contract in `ops/migrate.js` that will run before testing.

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
