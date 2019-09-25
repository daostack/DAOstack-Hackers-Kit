const path = require('path')
const { runGraphCli, subgraphLocation: defaultSubgraphLocation} = require('./graph-cli.js')
const { graphNode, ipfsNode, subgraphName: defaultSubgraphName } = require('./settings')
const cwd = path.resolve(`${__dirname}/..`)

function extractSubgraphId(output) {
  return output
    .trim()
    .split('\n')
    .reverse()
    .find(line => line.match(/(Build completed|Subgraph): Qm/))
    .split(':')
    .slice(-1)[0]
    .trim()
}

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
  if (graphNode !== 'https://api.thegraph.com/deploy/' && graphNode !== 'https://api.staging.thegraph.com/deploy/') {
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

  /* upload subgraph files to the shared IPFS node */
  let builtSubgraphId
  if (graphNode.match(/thegraph\.com/)) {
    let sharedIpfsNode = ipfsNode.match(/staging/)
      ? 'https://api.thegraph.com/ipfs/'
      : 'https://api.staging.thegraph.com/ipfs/'
    result = await runGraphCli(['build', '--ipfs', sharedIpfsNode, opts.subgraphLocation])
    msg = result[1] + result[2]
    if (result[0] === 1 || result[0] === 127) {
      throw Error(`Failed to upload subgraph files to ${sharedIpfsNode}: ${msg}`)
    }

    builtSubgraphId = extractSubgraphId(result[1])
    console.log(`Uploaded subgraph: ${builtSubgraphId}`)
  }

  result = await runGraphCli(
    [
      'deploy',
      '--access-token "${access_token-""}"',
      '--ipfs ' + ipfsNode,
      '--node ' + graphNode,
      opts.subgraphName,
      opts.subgraphLocation,
    ],
    cwd
  )
  msg = result[1] + result[2]
  if (result[0] === 1 || result[0] === 127) {
    throw Error(`Deployment failed! ${msg}`)
  }
  if (msg.toLowerCase().indexOf('error') > 0) {
    throw Error(`Deployment failed! ${msg}`)
  }

  if (graphNode.match(/thegraph\.com/)) {
    let deployedSubgraphId = extractSubgraphId(result[1])
    console.log(`Deployed subgraph: ${deployedSubgraphId}`)

    if (builtSubgraphId !== deployedSubgraphId) {
      console.error(
        `Subgraph ID mismatch between 'build' and 'deploy':`,
        `${builtSubgraphId} !== ${deployedSubgraphId}`
      )
    }
  }

  return result
}

if (require.main === module) {
  deploy().catch((err) => { console.log(err); process.exit(1) })
} else {
  module.exports = deploy
}
