const fs = require("fs");
const yaml = require("js-yaml");
const { migrationFileLocation, network } = require("./settings");
const mappings = require("./mappings.json")[network].mappings;

/**
 * Generate a `subgraph.yaml` file from `datasource.yaml` fragments in
  `mappings` directory `mappings.json` and migration.json`
 */
async function generateSubgraph() {
  const migrationFile = migrationFileLocation;
  const addresses = JSON.parse(fs.readFileSync(migrationFile, "utf-8"));

  const dataSources = mappings.map(mapping => {
    var contract = mapping.name;
    var abis, entities, eventHandler, file, yamlLoad, abi;
    if (fs.existsSync("src/mappings/" + mapping.mapping + "/datasource.yaml")) {
      yamlLoad = yaml.safeLoad(
        fs.readFileSync(
          "src/mappings/" + mapping.mapping + "/datasource.yaml",
          "utf-8"
        )
      );
      file = `src/mappings/${mapping.mapping}/mapping.ts`;
      eventHandlers = yamlLoad.eventHandlers;
      entities = yamlLoad.entities;
      (abis = (yamlLoad.abis || [contract]).map(contract => ({
        name: contract,
        file: `./abis/${mapping.arcVersion}/${contract}.json`
      }))),
        (abi =
          yamlLoad.abis && yamlLoad.abis.length ? yamlLoad.abis[0] : contract);
    } else {
      file = `ops/emptymapping.ts`;
      eventHandlers = [{ event: "Dummy()", handler: "handleDummy" }];
      entities = ["nothing"];
      (abis = [{ name: contract, file: `./ops/dummyabi.json` }]),
        (abi = contract);
    }

    let contractAddress;
    if (mapping.dao === 'organs') {
      contractAddress = addresses[network].test[mapping.arcVersion][mapping.dao][mapping.contractName];
    } else {
      contractAddress = addresses[network][mapping.dao][mapping.arcVersion][mapping.contractName];
    }
    
    if (!contractAddress) {
      throw Error(
        `Address for contract ${contract} of ${
          mapping.dao
        } not found in ${migrationFile}`
      );
    }
    return {
      kind: "ethereum/contract",
      name: `${contract}`,
      network: `${network}`,
      source: {
        address: contractAddress,
        abi
      },
      mapping: {
        kind: "ethereum/events",
        apiVersion: "0.0.1",
        language: "wasm/assemblyscript",
        file: file,
        entities,
        abis,
        eventHandlers
      }
    };
  });

  const subgraph = {
    specVersion: "0.0.1",
    schema: { file: "./schema.graphql" },
    dataSources
  };
  fs.writeFileSync(
    "subgraph.yaml",
    yaml.safeDump(subgraph, { noRefs: true }),
    "utf-8"
  );
}

if (require.main === module) {
  generateSubgraph().catch(err => {
    console.log(err);
    process.exit(1);
  });
} else {
  module.exports = generateSubgraph;
}
