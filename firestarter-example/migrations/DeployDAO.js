const DAOstackMigration = require('@daostack/migration');
const migrationSpec =  require('../data/fireStarterDAOspec.json')
require('dotenv').config();

async function migrate() {
  const DEFAULT_GAS = 3.0

  const options = {
    provider: process.env.PROVIDER,
    gasPrice: DEFAULT_GAS,
    quiet: false,
    force: true,
    output: process.env.OUTPUT_FILE,
    privateKey: process.env.PRIVATE_KEY,
    customabislocation: process.env.CUSTOM_ABI_LOCATION,
    params: {
      private: migrationSpec,
      rinkeby: migrationSpec
    },
  };

  switch (process.env.NETWORK) {
    case "ganache":
    case "private":
      options.prevmigration = " ";
      const migrationBaseResult = await DAOstackMigration.migrateBase(options);
      options.prevmigration = options.output;
      break;
  }
  const migrationDAOResult = await DAOstackMigration.migrateDAO(options);
}

migrate()
