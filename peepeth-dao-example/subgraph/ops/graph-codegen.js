const path = require("path")
const { runGraphCli, subgraphLocation: defaultSubgraphLocation} = require('./graph-cli.js')

async function codegen (opts = {}) {
  const cwd = path.resolve(`${__dirname}/..`)
  if (!opts.subgraphLocation) {
    opts.subgraphLocation = defaultSubgraphLocation
  }
  const result = await runGraphCli([
    'codegen',
    `--output-dir ${cwd}/src/types/`,
    opts.subgraphLocation
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
