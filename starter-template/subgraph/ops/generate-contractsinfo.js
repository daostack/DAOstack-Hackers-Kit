const fs = require("fs");
const yaml = require("js-yaml");
const { migrationFileLocation, network } = require("./settings");
const daodir = "./daos/" + network + "/";

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

  const daos = require(migrationFileLocation)[network].dao;
  fs.readdir(daodir, function(err, files) {
    if (err) {
      console.error("Could not list the directory.", err);
      process.exit(1);
    }
    files.forEach(function(file) {
      const dao = JSON.parse(fs.readFileSync(daodir + file, "utf-8"));
      if (dao.Schemes != undefined) {
         for(var key in dao.Schemes) {
           buffer += "    setContractInfo("+"'"+dao.Schemes[key].toLowerCase()+"'"+", " +"'"+key+"'"+", "+"'"+dao.arcVersion+"'"+");\n";
         }
      }
    });
    buffer += "}\n";

    fs.writeFileSync(
      "src/contractsInfo.ts",
      buffer,
      "utf-8"
    );
  });
}

if (require.main === module) {
  generateContractInfo().catch(err => {
    console.log(err);
    process.exit(1);
  });
} else {
  module.exports = generateContractInfo;
}
