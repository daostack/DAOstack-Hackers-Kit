const path = require('path')
const { runGraphCli, subgraphLocation: defaultSubgraphLocation} = require('./graph-cli.js')
const { graphNode, ipfsNode, subgraphName: defaultSubgraphName } = require('./settings')
const cwd = path.resolve(`${__dirname}/..`)


async function deploy (opts = {}) {
  if (!opts.subgraphLocation) {
    opts.subgraphLocation = defaultSubgraphLocation
  }
  if (!opts.subgraphName) {
    opts.subgraphName = defaultSubgraphName
  }
  let result
  let msg

  /* create the subgraph */
  if (graphNode !== 'https://api.thegraph.com/deploy/') {
    result = await runGraphCli([
      'create',
      '--access-token ""',
      '--node ' + graphNode,
      opts.subgraphName
    ], cwd)
    msg = result[1] + result[2]
    if (msg.toLowerCase().indexOf('error') > 0) {
      if (msg.match(/subgraph already exists/)) {
        // the subgraph was already created before -we're ok
        console.log('subgraph already exists - deploying a new version')
      } else {
        console.error(`Create failed! ${msg}`)
      }
    }
  }

  result = await runGraphCli([
    'deploy',
    '--access-token "${access_token-""}"',
    '--ipfs ' + ipfsNode,
    '--node ' + graphNode,
    opts.subgraphName,
    opts.subgraphLocation
  ], cwd)
  msg = result[1] + result[2]
  if ((result[0] === 1)|| (result[0] === 127)){
    throw Error(`Deployment failed! ${msg}`)
  }
  if (msg.toLowerCase().indexOf('error') > 0) {
    throw Error(`Deployment failed! ${msg}`)
  }
  return result
}

if (require.main === module) {
  deploy().catch((err) => { console.log(err); process.exit(1) })
} else {
  module.exports = deploy
}
