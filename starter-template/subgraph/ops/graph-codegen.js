const { runGraphCli, subgraphLocation } = require('./graph-cli.js')

async function codegen (cwd) {
  const result = await runGraphCli([
    'codegen',
    '--output-dir src/types/',
    subgraphLocation
  ], cwd)
  if (result[0] === 1) {
    throw Error(`Deployment failed! ${result}`)
  }
  return result
}

if (require.main === module) {
  codegen().catch((err) => { console.log(err); process.exit(1) })
} else {
  module.exports = codegen
}
