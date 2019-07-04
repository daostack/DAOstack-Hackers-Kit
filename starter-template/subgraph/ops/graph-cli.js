const spawn = require('spawn-command')
const path = require('path')

const runGraphCli = async (args = [], cwd = process.cwd()) => {
  // Resolve the path to graph.js
  // let graphClix = `${require.resolve('@graphprotocol/graph-cli')}/graph.js`
  let graphCli = `${__dirname}/../node_modules/@graphprotocol/graph-cli/bin/graph`

  // Make sure to set an absolute working directory
  cwd = cwd[0] !== '/' ? path.resolve(__dirname, cwd) : cwd

  return new Promise((resolve, reject) => {
    let stdout = ''
    let stderr = ''
    const command = `${graphCli} ${args.join(' ')}`
    const child = spawn(command, { cwd })

    child.on('error', error => {
      reject(error)
    })

    child.stdout.on('data', data => {
      stdout += data.toString()
    })

    child.stderr.on('data', data => {
      stderr += data.toString()
    })

    child.on('exit', exitCode => {
      resolve([exitCode, stdout, stderr])
    })
  })
}

const subgraphLocation = path.resolve(`${__dirname}/../subgraph.yaml`)

module.exports = {
  runGraphCli,
  subgraphLocation
}
