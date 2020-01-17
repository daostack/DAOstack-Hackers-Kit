const fs = require('fs')
const path = require('path')

const getDirectories = source =>
  fs.readdirSync(source, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name)

/**
 * Fetch all abis from @daostack/migration into the `abis` folder.
 */
async function generateAbis () {
  getDirectories('./node_modules/@daostack/migration/contracts/').forEach(arcVersion => {
    if (!fs.existsSync('./abis/' + arcVersion)) {
        fs.mkdirSync('./abis/' + arcVersion, { recursive: true })
    }
      
    const files = fs.readdirSync('./node_modules/@daostack/migration/contracts/' + arcVersion)
    files.forEach(file => {
      const { abi } = JSON.parse(fs.readFileSync(path.join('./node_modules/@daostack/migration/contracts/' + arcVersion, file), 'utf-8'))
      fs.writeFileSync(
        path.join('./abis/' + arcVersion, file),
        JSON.stringify(abi, undefined, 2),
        'utf-8'
      )
    })
  })
}

if (require.main === module) {
  generateAbis().catch(err => {
    console.log(err)
    process.exit(1)
  })
} else {
  module.exports = generateAbis
}
