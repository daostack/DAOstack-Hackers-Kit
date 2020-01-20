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

  const migrationDAOResult = await DAOstackMigration.migrateDAO(options);
}

migrate()
