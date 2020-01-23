const fs = require('fs')
const path = require('path')
const Subgraph = require('@daostack/subgraph')

void async function() {
Subgraph.setupEnv({
  "migrationFile": "/Users/shivgupt/Backup/Documents/projects/Github/DAOstack/DAOstack-Hackers-Kit/daico/data/migration.json",
  "subgraphName": "daostack2"
})
}();
