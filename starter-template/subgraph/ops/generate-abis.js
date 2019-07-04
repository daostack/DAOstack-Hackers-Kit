const fs = require("fs-extra");
const path = require("path");

/**
 * Fetch all abis from @daostack/migration into the `abis` folder.
 */
async function generateAbis() {
  fs.copy("node_modules/@daostack/migration/abis", "abis");
}

if (require.main === module) {
  generateAbis().catch(err => {
    console.log(err);
    process.exit(1);
  });
} else {
  module.exports = generateAbis;
}
