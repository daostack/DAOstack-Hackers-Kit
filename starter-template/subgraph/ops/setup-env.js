const path = require('path')
const subgraphRepo = path.resolve(`${__dirname}/..`)
const { migrationFileLocation } = require('./settings')
const migration = require('@daostack/migration/migration.json')
const fs = require('fs')

async function setupenv () {
  //fs.writeFileSync(migrationFileLocation, JSON.stringify(migration, undefined, 2), 'utf-8')
  console.log(`Generating ABI files`)
  // node ops/generate-abis.js && node ops/generate-schema.js && node ops/generate-subgraph.js
  await require(`../ops/generate-abis`)()

  console.log(`Generating schemas`)
  await require(`${subgraphRepo}/ops/generate-schema`)()

  console.log(`Generating subgraph`)
  await require(`../ops/generate-subgraph`)()

  console.log(`Generating daos subgraph`)
  await require(`../ops/generate-daos-subgraph`)()

  console.log(`Generating contracts info`)
  await require(`../ops/generate-contractsinfo`)()

  const cwd = subgraphRepo
  console.log('Calling graph-codegen')
  await require(`../ops/graph-codegen`)(cwd)


  console.log('Deploying subgraph configuration')
  await require(`${subgraphRepo}/ops/graph-deploy`)()

  console.log('Environment setup finished successfully')
  // deploymentResult[0] is the status code
  // but it is not very helpful, because it returns 0 also on some errors
}

if (require.main === module) {
  setupenv().catch((err) => { console.log(err); process.exit(1) })
} else {
  module.exports = setupenv
}
