const path = require('path')
const subgraphRepo = path.resolve(`${__dirname}/..`)
const { migrationFileLocation, subgraphName: defaultSubgraphName } = require('./settings')
const fs = require('fs')

/**
 * probably best renamed to "deploySubgraph"
 * @param  {[type]} migrationFile [description]
 * @return {[type]}               [description]
 */
async function setupenv (opts={}) {
  const defaultMigrationFile = '@daostack/migration/migration.json'
  if (!opts.migrationFile) {
    opts.migrationFile = defaultMigrationFile
  }
  if (!opts.subgraphName) {
    opts.subgraphName = defaultSubgraphName
  }

  console.log(`Deploying a new subgraph using the following settings:`)
  console.log(opts)

  const migration = require(opts.migrationFile)
  fs.writeFileSync(migrationFileLocation, JSON.stringify(migration, undefined, 2), 'utf-8')
  console.log(`Generating ABI files`)
  await require(`../ops/generate-abis`)()

  console.log(`Generating schemas`)
  await require(`../ops/generate-schema`)()

  console.log(`Generating subgraph`)
  await require(`../ops/generate-subgraph`)(opts)

  console.log(`Generating daos subgraph`)
  await require(`../ops/generate-daos-subgraph`)(opts)

  console.log(`Generating contracts info`)
  await require(`../ops/generate-contractsinfo`)(opts)

  console.log('Calling graph-codegen')
  await require(`../ops/graph-codegen`)(opts)


  console.log('Deploying subgraph')
  await require(`${subgraphRepo}/ops/graph-deploy`)(opts)

  console.log('Subgraph deployed successfully')
}

if (require.main === module) {
  if (process.argv[2]) {
    setupenv(JSON.parse(process.argv[2])).catch((err) => { console.log(err); process.exit(1) })
  }
  else {
    setupenv().catch((err) => { console.log(err); process.exit(1) })
  }

} else {
  module.exports = {
    setupEnv: setupenv
  }
}
