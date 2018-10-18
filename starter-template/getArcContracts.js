const glob = require("glob");
var fs = require("fs");
var pjson = require("./node_modules/@daostack/arc.js/package.json");

const files = glob.sync(
  "./node_modules/@daostack/arc.js/migrated_contracts/*.json",
  {
    nodir: true
  }
);

var arcJSON = `{ "arcVersion": "${pjson.devDependencies["@daostack/arc"]}"`;

files.filter(file => {
  const abi = require(`${file}`);
  console.log(`${abi.contractName}:`);
  arcJSON += ", " + `"${abi.contractName}"` + ": {";
  if (abi.networks["1"]) {
    console.log(`  Live: ${abi.networks["1"].address}`);
    arcJSON += `"live": ` + `"${abi.networks["1"].address}", `;
  }
  if (abi.networks["42"]) {
    console.log(`  Kovan: ${abi.networks["42"].address}`);
    arcJSON += `"kovan": ` + `"${abi.networks["42"].address}", `;
  }
  if (abi.networks["1512051714758"]) {
    console.log(`  Ganache: ${abi.networks["1512051714758"].address}`);
    arcJSON += `"ganache": ` + `"${abi.networks["1512051714758"].address}"`;
  }
  arcJSON += " }";
});

arcJSON += " }";
fs.writeFile("arc.json", arcJSON, function(err, result) {
  if (err) console.log("error", err);
});
