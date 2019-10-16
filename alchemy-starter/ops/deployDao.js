require('dotenv').config();
const DAOstackMigration = require('@daostack/migration');
const migrationSpec =  require(process.env.DAO_SPEC)

async function migrate() {
  const options = {
    provider: process.env.PROVIDER,
    gasPrice: process.env.DEFAULT_GAS,
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

  const migrationDAOResult = await DAOstackMigration.migrateDAO(options);
}

migrate()
