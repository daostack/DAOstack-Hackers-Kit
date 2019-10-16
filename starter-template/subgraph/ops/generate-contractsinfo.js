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
  buffer += "/* tslint:disable:max-line-length */\n";

  buffer += "export function setContractsInfo(): void {\n";
  for (var version in versions) {
    if (versions.hasOwnProperty(version)) {
        let addresses = migration[network].base[version];
        for (var name in addresses) {
          if (addresses.hasOwnProperty(name)) {
              buffer += "    setContractInfo("+"'"+addresses[name].toLowerCase()+"'"+", " +"'"+name+"'"+", "+"'"+name+"', "+"'"+version+"'"+");\n";
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
         for (var i = 0, len = dao.Schemes.length; i < len; i++) {
           var scheme = dao.Schemes[i];
           buffer += "    setContractInfo("+"'"+scheme.address.toLowerCase()+"'"+", " +"'"+scheme.name+"'"+", "+"'"+ scheme.alias +"', "+"'"+dao.arcVersion+"'"+");\n";
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
