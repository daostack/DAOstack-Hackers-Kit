const path = require('path')
require('dotenv').config();

const migrationFileLocation = require.resolve(`@daostack/migration/migration.json`)
const network = process.env.network || 'private'
const graphNode = process.env.graph_node || 'http://127.0.0.1:8020/'
const ipfsNode = process.env.ipfs_node || 'http://127.0.0.1:5001'
const ethereumNode = process.env.ethereum_node || 'http://ganache:8545'
const subgraphName = process.env.subgraph || 'daostack'
const postgresPassword = process.env.postgres_password || 'letmein'

module.exports = {
  migrationFileLocation,
  network,
  graphNode,
  ipfsNode,
  ethereumNode,
  subgraphName,
  postgresPassword
}
