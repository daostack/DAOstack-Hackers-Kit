const DAOstackMigration = require('@daostack/migration');
const migrationSpec =  require('../data/testDaoSpec.json')

module.exports = async function(deployer) {
  const DEFAULT_GAS = 3.0

  const options = {
    provider: process.env.PROVIDER,
    gasPrice: DEFAULT_GAS,
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
