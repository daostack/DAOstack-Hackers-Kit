const fs = require("fs");
const path = require("path");
const yaml = require("js-yaml");
const { ethereumNode, postgresPassword } = require("./settings");

/**
 * Prepare the Docker compose file for the network used.
 */
async function setDockerNetwork() {
  // Get document, or throw exception on error
  try {
    var args = process.argv.slice(2);
    let network = args[0];
    let file = require("path").join("docker-compose.yml");
    let doc = yaml.safeLoad(fs.readFileSync(file));
    if (network === "private") {
      doc["services"]["ganache"] = {
        image:
          "daostack/migration:" +
          require("../package.json").devDependencies["@daostack/migration"],
        ports: ["8545:8545"]
      };

      doc["services"]["graph-node"]["links"] = ["ipfs", "postgres", "ganache"];
    } else {
      delete doc["services"]["ganache"];
      doc["services"]["graph-node"]["links"] = ["ipfs", "postgres"];
    }
    doc["services"]["graph-node"]["environment"][
      "postgres_pass"
    ] = postgresPassword;
    doc["services"]["postgres"]["environment"][
      "POSTGRES_PASSWORD"
    ] = postgresPassword;
    doc["services"]["graph-node"]["environment"][
      "ethereum"
    ] = `${network}:${ethereumNode}`;
    fs.writeFileSync(path.join(file), yaml.safeDump(doc), "utf-8");
  } catch (msg) {
    throw Error(`Setting docker network failed! ${msg}`);
  }
}

if (require.main === module) {
  setDockerNetwork().catch(err => {
    console.log(err);
    process.exit(1);
  });
} else {
  module.exports = setDockerNetwork;
}
