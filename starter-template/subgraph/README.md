# DAOstack subgraph

DAOstack subgraph for [TheGraph](https://thegraph.com/) project.

## Getting started

1 `git clone https://github.com/daostack/subgraph.git && cd subgraph`
1. `npm install`

## Testing

Run the tests in the host container:

```sh
npm run docker:run
npm run test
npm run docker:stop
```
The tests are run with jest, which takes a number of options that may be useful when developing:
```sh
npm run test -- --watch # re-run the tests after each change
npm run test -- test/integration/Avatar.spec.js # run a single test file
```


## Commands

1. `migrate` - migrate contracts to ganache and write result to `migration.json`.
2. `codegen` - (requires `migration.json`) automatically generate abi, subgraph, schema and type definitions for
   required contracts.
3. `test` - run integration test.
4. `deploy` - deploy subgraph.
5. `deploy:watch` - redeploy on file change.

Docker commands (requires installing [`docker`](https://docs.docker.com/v17.12/install/) and
[`docker-compose`](https://docs.docker.com/compose/install/)):

1. `docker <command>` - start a command running inside the docker container. Example: `npm run docker test` (run
   intergation tests).
2. `docker:stop` - stop all running docker services.
3. `docker:rebuild <command>` - rebuild the docker container after changes to `package.json`.
4. `docker:logs <subgraph|graph-node|ganache|ipfs|postgres>` - display logs from a running docker service.
5. `docker:run` - run all services in detached mode (i.e. in the background).

## Exposed endpoints

After running a command with docker-compose, the following endpoints will be exposed on your local machine:

- `http://localhost:8000/subgraphs/name/daostack` - GraphiQL graphical user interface.
- `http://localhost:8000/subgraphs/name/daostack/graphql` - GraphQL api endpoint.
- `http://localhost:8001/subgraphs/name/daostack` - graph-node's websockets endpoint
- `http://localhost:8020` - graph-node's RPC endpoint
- `http://localhost:5001` - ipfs endpoint.
- (if using development) `http://localhost:8545` - ganache RPC endpoint.
- `http://localhost:5432` - postgresql connection endpoint.

## Add a new contract tracker

In order to add support for a new contract follow these steps:

1. Create a new directory `src/mappings/<contract name>/`
2. Create 4 files:

   1. `src/mappings/<contract name>/mapping.ts` - mapping code.
   2. `src/mappings/<contract name>/schema.graphql` - GraphQL schema for that contract.
   3. `src/mappings/<contract name>/datasource.yaml` - a yaml fragment with:
      1. `abis` - optional - list of contract names that are required by the mapping.
      2. [`entities`](https://github.com/graphprotocol/graph-node/blob/master/docs/subgraph-manifest.md#1521-ethereum-events-mapping) -
         list of entities that are written by the the mapping.
      3. [`eventHandlers`](https://github.com/graphprotocol/graph-node/blob/master/docs/subgraph-manifest.md#1522-eventhandler) -
         map of solidity event signatures to event handlers in mapping code.
   4. `test/integration/<contract name>.spec.ts`

3. (Optionally) add a deployment step for your contract in `ops/migrate.js` that will run before testing.

## Add a new dao tracker
Add <daoname>.json file to daos directory

## Deploy Subgraph
To deploy the subgraph, please follow the instructions below:

1. If you are deploying to The Graph for the first time, start with installing the Graph CLI:
`npm install -g @graphprotocol/graph-cli`
Then follow this by logging into your Graph Explorer account using:
`graph auth https://api.thegraph.com/deploy/ <ACCESS_TOKEN>`

It is also recommended to read this guide: https://thegraph.com/docs/deploy-a-subgraph

2. Create a `.env` file containing the following:
```
network="<TARGET_NETWORK>"
subgraph="<YOUR_SUBGAPH_NAME>"

# Not necessary for Docker deployment
graph_node="https://api.thegraph.com/deploy/"
ipfs_node="https://api.thegraph.com/ipfs/"
access_token=<YOUR_ACCESS_TOKEN>

# Not necessary for The Graph server
postgres_password=<YOUR_PASSWORD>
ethereum_node="https://<TARGET_NETWORK>.infura.io/<INFURA-KEY>"
```

3. Run: ``npm run deploy``

## Release subgraph images on docker hub


The repository provides a `release.sh` script that will:
- (re)start the docker containers and deploy the subgraph
- commit the images for ipfs and postgres and push these to docker hub

The docker images are available as:

`daostack/subgraph-postgres:${network}-${migration-version}-${subgraph-version}`
`daostack/subgraph-ipfs:${network}-${migration-version}-${subgraph-version}`
