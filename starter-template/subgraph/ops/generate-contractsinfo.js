const fs = require("fs");
const yaml = require("js-yaml");
const { migrationFileLocation: defaultMigrationFileLocation, network } = require("./settings");
const path = require("path");
const currentDir = path.resolve(`${__dirname}`)

/**
 * Generate a `src/contractinfo.js` file from `migration.json`
 */
async function generateContractInfo(opts={}) {
  if (!opts.migrationFile) {
    opts.migrationFile = defaultMigrationFileLocation
  }
  let daodir
  if (opts.daodir) {
    daodir = path.resolve(`${opts.daodir}/${network}/`)
  } else {
    daodir = path.resolve(`./daos/${network}/`)
  }
  const migration = JSON.parse(fs.readFileSync(require.resolve(opts.migrationFile), "utf-8"));

  let versions = migration[network].base
  let buffer = "import { setContractInfo } from './utils';\n";
  buffer += "// this code was generated automatically . please not edit it -:)\n";

  buffer += "export function setContractsInfo(): void {\n";
  for (var version in versions) {
    if (versions.hasOwnProperty(version)) {
        let addresses = migration[network].base[version];
        for (var name in addresses) {
          if (addresses.hasOwnProperty(name)) {
              buffer += "    setContractInfo("+"'"+addresses[name].toLowerCase()+"'"+", " +"'"+name+"'"+", "+"'"+version+"'"+");\n";
          }
        }
    }
  }

  const daos = require(opts.migrationFile)[network].dao;
  fs.readdir(daodir, function(err, files) {
    if (err) {
      console.error("Could not list the directory.", err);
      process.exit(1);
    }
    files.forEach(function(file) {
      const dao = JSON.parse(fs.readFileSync(daodir + '/' + file, "utf-8"));
      if (dao.Schemes !== undefined) {
         for(var key in dao.Schemes) {
           buffer += "    setContractInfo("+"'"+dao.Schemes[key].toLowerCase()+"'"+", " +"'"+key+"'"+", "+"'"+dao.arcVersion+"'"+");\n";
         }
      }
    });
    buffer += "}\n";

    fs.writeFileSync(
      `${currentDir}/../src/contractsInfo.ts`,
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
