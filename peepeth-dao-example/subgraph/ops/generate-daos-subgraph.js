const fs = require("fs");
const yaml = require("js-yaml");
const { migrationFileLocation: defaultMigrationFileLocation, network, startBlock} = require("./settings");
const {   subgraphLocation: defaultSubgraphLocation } = require('./graph-cli')
const path = require("path");
const currentDir = path.resolve(`${__dirname}`)
const supportedSchemes = ['ContributionRewardExt', 'GenericScheme']
const supportedStandAloneContracts = ['Competition']
let ids = [];

function daoYaml(contract, contractAddress, arcVersion) {
  const { abis, entities, eventHandlers } = yaml.safeLoad(
    fs.readFileSync(`${currentDir}/../src/mappings/${contract}/datasource.yaml`, "utf-8")
  );

  let name = contract;
  if (ids.indexOf(contract) === -1) {
    ids.push(contract);
  } else if (ids.indexOf(contract+contractAddress) === -1) {
    ids.push(contract+contractAddress);
    name = contract+contractAddress;
  } else {
    return;
  }

  return {
    kind: "ethereum/contract",
    name: `${name}`,
    network: `${network}`,
    source: {
      address: contractAddress,
      abi: abis && abis.length ? abis[0] : contract,
      startBlock
    },
    mapping: {
      kind: "ethereum/events",
      apiVersion: "0.0.1",
      language: "wasm/assemblyscript",
      file: path.resolve(`${__dirname}/../src/mappings/${contract}/mapping.ts`),
      entities,
      abis: (abis || [contract]).map(contractName => {
        let _arcVersion = Number(arcVersion.slice(arcVersion.length-2,arcVersion.length));
        if ((_arcVersion >= 34) && (contractName === "UGenericScheme")) {
          return {name: contractName,
            file: path.resolve(`./abis/0.0.1-rc.33/UGenericScheme.json`)
          };
        }
        if ((_arcVersion < 24) && (contractName === "UGenericScheme")) {
          return {name: contractName,
                  file: path.resolve(`./abis/${arcVersion}/GenericScheme.json`)
                };
        }
        if ((_arcVersion < 36) && (contractName === "ContributionRewardExt")) {
          return {
            name: contractName,
            file: `${__dirname}/../abis/0.0.1-rc.36/ContributionRewardExt.json`
          };
        }
        //this is temporary workaround (not nice) patch to solve an issue with multiple contract versions
        //in genesis alpha dao
        let _abiVersion = arcVersion;
        if ((contractAddress === "0x211b9Bd0bCCACa64fB1d43093C75269bb84B3Be6") &&
           (contractName === "GenericScheme")) {
            _abiVersion = "0.0.1-rc.33";
        }
        return {name: contractName,
                file: path.resolve(`./abis/${_abiVersion}/${contractName}.json`)
              };
      }),
      eventHandlers
    }
  };
}
/**
 * Generate a `subgraph.yaml` file from `datasource.yaml` fragments in
  `mappings` directory and `daos/<network> directory`
 */
async function generateSubgraph(opts={}) {
  opts.migrationFile = opts.migrationFile || defaultMigrationFileLocation;
  opts.subgraphLocation = opts.subgraphLocation || defaultSubgraphLocation;
  const subgraphYaml = yaml.safeLoad(
    fs.readFileSync(opts.subgraphLocation, "utf8")
  );

  for (var i = 0, len = subgraphYaml.dataSources.length; i < len; i++) {
    ids.push(subgraphYaml.dataSources[i].name)
  }

  let daodir
  if (opts.daodir) {
    daodir = path.resolve(`${opts.daodir}/${network}/`)
  } else {
    daodir = path.resolve(`./daos/${network}/`)
  }
  const daos = require(opts.migrationFile)[network].dao;
  for (let arcVersion in daos) {
    let _arcVersion = Number(arcVersion.slice(arcVersion.length-2,arcVersion.length));
    for (var i = 0, len = subgraphYaml.dataSources.length; i < len; i++) {
      if (subgraphYaml.dataSources[i].source.address === daos[arcVersion].Avatar) {
        daos[arcVersion].arcVersion = arcVersion;
        if (daos[arcVersion] !== undefined) {
          fs.writeFileSync(
            path.resolve(daodir + "/testdao" + _arcVersion + ".json"),
            JSON.stringify(daos[arcVersion], undefined, 2),
            "utf-8"
          );
        }
        break
      }
    }
  }
  fs.readdir(daodir, function(err, files) {
    if (err) {
      console.error("Could not list the directory.", err);
      process.exit(1);
    }
    const subgraphYaml = yaml.safeLoad(
      fs.readFileSync(opts.subgraphLocation, "utf8")
    );
    var schemeAddresses = {};
    files.forEach(function(file) {
      const dao = JSON.parse(fs.readFileSync(daodir + '/' + file, "utf-8"));
      let includeRep = false;
      let includeToken = false;
      let includeAvatar = false;
      let includeController = false;
      for (var i = 0, len = subgraphYaml.dataSources.length; i < len; i++) {
        if (subgraphYaml.dataSources[i].source.address === dao.Reputation) {
          includeRep = true;
        }
        if (subgraphYaml.dataSources[i].source.address === dao.DAOToken) {
          includeToken = true;
        }
        if (subgraphYaml.dataSources[i].source.address === dao.Avatar) {
          includeAvatar = true;
        }
        if (subgraphYaml.dataSources[i].source.address === dao.Controller) {
          includeController = true;
        }
        if (dao.Schemes !== undefined) {
          for (var j = 0, schemesLen = dao.Schemes.length; j < schemesLen; j++) {
            let scheme = dao.Schemes[j];
            if (supportedSchemes.indexOf(scheme.name) !== -1) {
              if (!schemeAddresses[scheme.address]) {
                subgraphYaml.dataSources[subgraphYaml.dataSources.length] = daoYaml(
                  scheme.name,
                  scheme.address,
                  scheme.arcVersion ? scheme.arcVersion : dao.arcVersion
                );
                schemeAddresses[scheme.address] = true;
              }
            }
          }
        }
        if (dao.StandAloneContracts !== undefined) {
          for (var k = 0, saContractsLen = dao.StandAloneContracts.length; k < saContractsLen; k++) {
            let saContract = dao.StandAloneContracts[k];
            if (supportedStandAloneContracts.indexOf(saContract.name) !== -1) {
              if (!schemeAddresses[saContract.address]) {
                subgraphYaml.dataSources[subgraphYaml.dataSources.length] = daoYaml(
                  saContract.name,
                  saContract.address,
                  saContract.arcVersion ? saContract.arcVersion : dao.arcVersion
                );
                schemeAddresses[saContract.address] = true;
              }
            }
          }
        }
      }
      if (includeRep === false) {
        subgraphYaml.dataSources[subgraphYaml.dataSources.length] = daoYaml(
          "Reputation",
          dao.Reputation,
          dao.arcVersion
        );
      }
      if (includeToken === false) {
        subgraphYaml.dataSources[subgraphYaml.dataSources.length] = daoYaml(
          "DAOToken",
          dao.DAOToken,
          dao.arcVersion
        );
      }
      if (includeAvatar === false) {
        subgraphYaml.dataSources[subgraphYaml.dataSources.length] = daoYaml(
          "Avatar",
          dao.Avatar,
          dao.arcVersion
        );
      }
      if (dao.Controller !== undefined && includeController === false) {
        subgraphYaml.dataSources[subgraphYaml.dataSources.length] = daoYaml(
          "Controller",
          dao.Controller,
          dao.arcVersion
        );
      }
    });

    fs.writeFileSync(
      opts.subgraphLocation,
      yaml.safeDump(subgraphYaml, { noRefs: true }),
      "utf-8"
    );
  });
}

if (require.main === module) {
  generateSubgraph().catch(err => {
    console.log(err);
    process.exit(1);
  });
} else {
  module.exports = generateSubgraph;
}
