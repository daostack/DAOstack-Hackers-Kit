const DAOstackMigration = require('@daostack/migration');
const migrationSpec =  require('../data/testDaoSpec.json')

console.log(process.env.PROVIDER)
module.exports = async function(deployer) {

  const options = {
    provider: process.env.PROVIDER,
    quiet: false,
    force: true,
    output: process.env.MIGRATION_OUTPUT,
    privateKey: process.env.PRIVATE_KEY,
    params: {
      private: migrationSpec,
      rinkeby: migrationSpec
    }
  };

  switch (deployer.network) {
    case "ganache":
    case "development":
      const migrationBaseResult = await DAOstackMigration.migrateBase(options);
      options.prevmigration = options.output;
      break;
  }
  const migrationDAOResult = await DAOstackMigration.migrateDAO(options);
}
