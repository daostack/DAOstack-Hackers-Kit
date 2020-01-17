const fs = require("fs");
const { migrationFileLocation: defaultMigrationFileLocation, network } = require("./settings");
const { forEachTemplate } = require("./utils");
const path = require("path");
const currentDir = path.resolve(`${__dirname}`);

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
  let buffer = "import {\n  setBlacklistedDAO,\n  setContractInfo,\n  setTemplateInfo,\n} from './utils';\n";
  buffer += "\n// this code was generated automatically . please not edit it -:)\n";
  buffer += "/* tslint:disable:max-line-length */\n";

  buffer += "export function setContractsInfo(): void {\n";
  let contractsAddresses = {};
  for (var version in versions) {
    if (versions.hasOwnProperty(version)) {
        let addresses = migration[network].base[version];
        for (var name in addresses) {
          if (addresses.hasOwnProperty(name)) {
            if(!contractsAddresses[addresses[name]]) {
              buffer += "    setContractInfo("+"'"+addresses[name].toLowerCase()+"'"+", " +"'"+name+"'"+", "+"'"+name+"', "+"'"+version+"'"+");\n";
            }
            contractsAddresses[addresses[name]] = true;
          }
        }
    }
  }

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
          if (!contractsAddresses[scheme.address.toLowerCase()]) {
            buffer += "    setContractInfo("+"'"+scheme.address.toLowerCase()+"'"+", " +"'"+scheme.name+"'"+", "+"'"+ scheme.alias +"', "+"'"+(scheme.arcVersion ? scheme.arcVersion : dao.arcVersion)+"'"+");\n";
          }
          contractsAddresses[scheme.address.toLowerCase()] = true;
        }
      }
      if (dao.StandAloneContracts !== undefined) {
        for (var j = 0; j < dao.StandAloneContracts.length; j++) {
          var saContract = dao.StandAloneContracts[j];
          if (!contractsAddresses[saContract.address.toLowerCase()]) {
            buffer += "    setContractInfo("+"'"+saContract.address.toLowerCase()+"'"+", " +"'"+saContract.name+"'"+", "+"'"+ (saContract.alias ? saContract.alias : saContract.name) +"', "+"'"+(saContract.arcVersion ? saContract.arcVersion : dao.arcVersion)+"'"+");\n";
          }
          contractsAddresses[saContract.address.toLowerCase()] = true;
        }
     }
    });
    buffer += "}\n";

    buffer += "\nexport function setTemplatesInfo(): void {\n";

    forEachTemplate((name, mapping, arcVersion) => {
      const templateName = arcVersion.replace(/\.|-/g, '_');
      buffer += `    setTemplateInfo('${name}', '${arcVersion}', '${name}_${templateName}');\n`;
    });

    buffer += "}\n";

    const blacklist = require("./blacklist.json")[network];

    buffer += "\nexport function setBlacklistedDAOs(): void {\n";

    blacklist.forEach(function(avatar) {
      buffer += `    setBlacklistedDAO('${avatar.toLowerCase()}');\n`;
    });

    buffer += "    return;\n";
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
