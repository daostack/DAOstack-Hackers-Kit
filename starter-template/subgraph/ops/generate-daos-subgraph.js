const fs = require("fs");
const yaml = require("js-yaml");
const { migrationFileLocation: defaultMigrationFileLocation, network, startBlock} = require("./settings");
const {   subgraphLocation: defaultSubgraphLocation } = require('./graph-cli')
const path = require("path");
const currentDir = path.resolve(`${__dirname}`)
let ids = [];

function daoYaml(contract, contractAddress, arcVersion) {
  const { abis, entities, eventHandlers } = yaml.safeLoad(
    fs.readFileSync(`${currentDir}/../src/mappings/${contract}/datasource.yaml`, "utf-8")
  );

  let name = contract;
  if (ids.indexOf(contract) == -1) {
    ids.push(contract);
  } else if (ids.indexOf(contract+contractAddress) == -1) {
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
        if ((_arcVersion < 24) && (contractName === "UGenericScheme")) {
          return {name: contractName,
                  file: path.resolve(`./abis/${arcVersion}/GenericScheme.json`)
                };
        }
        return {name: contractName,
                file: path.resolve(`./abis/${arcVersion}/${contractName}.json`)
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
    daos[arcVersion].arcVersion = arcVersion;
    if (daos[arcVersion] !== undefined) {
      fs.writeFileSync(
        path.resolve(daodir + "/testdao.json"),
        JSON.stringify(daos[arcVersion], undefined, 2),
        "utf-8"
      );
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
    var genericSchemeAddresses = {};
    var genericScheme = false;
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
        if ( dao.Schemes !== undefined) {
        for (var j = 0, schemesLen = dao.Schemes.length; j < schemesLen; j++) {
            let scheme = dao.Schemes[j];
            if (scheme.name == "GenericScheme") {
              if (!genericSchemeAddresses[scheme.address]) {
                subgraphYaml.dataSources[subgraphYaml.dataSources.length] = daoYaml(
                  "GenericScheme",
                  scheme.address,
                  dao.arcVersion
                );
                genericSchemeAddresses[scheme.address] = true;
                genericScheme = true;
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

    if (!genericScheme) {
      subgraphYaml.dataSources[subgraphYaml.dataSources.length] = daoYaml(
        "GenericScheme",
        "0x1234000000000000000000000000000000000000",
        "0.0.1-rc.28"
      );
    }

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
