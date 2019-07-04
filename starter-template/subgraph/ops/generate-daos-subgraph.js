const fs = require("fs");
const yaml = require("js-yaml");
const { migrationFileLocation, network } = require("./settings");
const daodir = "./daos/" + network + "/";

function daoYaml(contract, contractAddress, arcVersion) {
  const { abis, entities, eventHandlers } = yaml.safeLoad(
    fs.readFileSync("src/mappings/" + contract + "/datasource.yaml", "utf-8")
  );
  return {
    kind: "ethereum/contract",
    name: `${contract}`,
    network: `${network}`,
    source: {
      address: contractAddress,
      abi: abis && abis.length ? abis[0] : contract
    },
    mapping: {
      kind: "ethereum/events",
      apiVersion: "0.0.1",
      language: "wasm/assemblyscript",
      file: `src/mappings/${contract}/mapping.ts`,
      entities,
      abis: (abis || [contract]).map(contract => ({
        name: contract,
        file: `./abis/${arcVersion}/${contract}.json`
      })),
      eventHandlers
    }
  };
}
/**
 * Generate a `subgraph.yaml` file from `datasource.yaml` fragments in
  `mappings` directory `mappings.json` and migration.json`
 */
async function generateSubgraph() {
  const daos = require(migrationFileLocation)[network].dao;
  for (let arcVersion in daos) {
    daos[arcVersion].arcVersion = arcVersion;
    if (daos[arcVersion] !== undefined) {
      fs.writeFileSync(
        daodir + "testdao.json",
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
      fs.readFileSync("subgraph.yaml", "utf8")
    );
    files.forEach(function(file) {
      const dao = JSON.parse(fs.readFileSync(daodir + file, "utf-8"));
      let includeRep = false;
      let includeToken = false;
      let includeAvatar = false;
      let includeController = false;
      for (let i = 0; i < subgraphYaml.dataSources.length; i++) {
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
      "subgraph.yaml",
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
