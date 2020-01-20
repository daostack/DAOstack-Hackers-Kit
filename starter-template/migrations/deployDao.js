const DAOstackMigration = require('@daostack/migration');
const migrationSpec =  require('../data/testDaoSpec.json')
require('dotenv').config();

async function migrate() {
  const DEFAULT_GAS = 3.0

  const options = {
    provider: process.env.PROVIDER,
    gasPrice: DEFAULT_GAS,
    quiet: false,
    force: true,
    restart: true,
    output: 'data/migration.json',
    privateKey: process.env.PRIVATE_KEY,
    params: {
      private: migrationSpec,
    },
  };

  // If not using ganache docker image by DAOstack un-comment this portion
  // to migrate base contracts
  /*
    switch (process.env.NETWORK) {
      case "private":
        const migrationBaseResult = await DAOstackMigration.migrateBase(options);
        options.prevmigration = options.output;
        break;
    }
  */
  const migrationDAOResult = await DAOstackMigration.migrateDAO(options);
}

migrate()
