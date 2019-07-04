const fs = require("fs");
const yaml = require("js-yaml");
const { migrationFileLocation, network } = require("./settings");

/**
 * Generate a `src/contractinfo.js` file from `migration.json`
 */
async function generateContractInfo() {
  const migrationFile = migrationFileLocation;
  const migration = JSON.parse(fs.readFileSync(migrationFile, "utf-8"));

  let versios = migration[network].base
  let buffer = "import { setContractInfo } from './utils';\n";
  buffer += "// this code was generated automaticly . please not edit it -:)\n";

  buffer += "export function setContractsInfo(): void {\n";
  for (var version in versios) {
    if (versios.hasOwnProperty(version)) {
        let addresses = migration[network].base[version];
        for (var name in addresses) {
          if (addresses.hasOwnProperty(name)) {
              buffer += "    setContractInfo("+"'"+addresses[name].toLowerCase()+"'"+", " +"'"+name+"'"+", "+"'"+version+"'"+");\n";
          }
        }
    }
  }
  buffer += "}\n";
  fs.writeFileSync(
    "src/contractsInfo.ts",
    buffer,
    "utf-8"
  );

}

if (require.main === module) {
  generateContractInfo().catch(err => {
    console.log(err);
    process.exit(1);
  });
} else {
  module.exports = generateContractInfo;
}
