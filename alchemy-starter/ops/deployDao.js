const DAOstackMigration = require('@daostack/migration');
const migrationSpec =  require('../data/testDaoSpec.json')
require('dotenv').config();

async function migrate() {
  const options = {
    provider: process.env.PROVIDER,
    gasPrice: process.env.DEFAULT_GAS,
    quiet: false,
    force: true,
    output: 'data/migration.json',
    privateKey: process.env.PRIVATE_KEY,
    params: {
      private: migrationSpec,
      rinkeby: migrationSpec
    },
  };

  const migrationDAOResult = await DAOstackMigration.migrateDAO(options);
}

migrate()
