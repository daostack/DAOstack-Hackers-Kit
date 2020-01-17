const fs = require("fs");

function versionToNum(version) {
  const strlen = version.length;
  return Number(version.slice(strlen - 2, strlen));
}

function forEachTemplate(callback) {
  const templates = require("./templates.json").templates;
  const abiDirectories = fs.readdirSync(`${__dirname}/../abis`, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name);

  for (var template of templates) {
    const { name, mapping, start_arcVersion, end_arcVersion } = template;
    const startNum = versionToNum(start_arcVersion);
    const endNum = end_arcVersion ? versionToNum(end_arcVersion) : undefined;

    // for each ABI directory, if it falls within start & end
    for (var abiDirectory of abiDirectories) {
      const arcVersion = abiDirectory;
      const arcNum = versionToNum(arcVersion);

      if (arcNum >= startNum && (endNum === undefined || arcNum <= endNum)) {
        callback(name, mapping, arcVersion);
      }
    }
  }
}

module.exports = {
  versionToNum,
  forEachTemplate
}
