const DAOstackMigration = require('@daostack/migration');
const migrationSpec =  require('../data/migrations-params.json');
require('dotenv').config();


async function migrate() {

    // ganache-core object with already migrated contracts
    // options are as specified in https://github.com/trufflesuite/ganache-cli#library
    // DAOstackMigration.Ganache.provider(process.env.PROVIDER);
    // // migration result object for ganache
    //DAOstackMigration.migration(process.env.NETWORK);

    const options = {
        provider: process.env.PROVIDER,
        gasPrice: 3.4,
        quiet: false,
        force: true,
        output: 'data/migration.json',
        privateKey: process.env.PRIVATE_KEY,
        params: {
        private: migrationSpec,
        customABIsLocation: "build/contracts"
        },
    };

  switch (process.env.NETWORK) {
    case "ganache":
    case "private":
      options.prevmigration = " ";
      console.log("Everything is working at here");
      const migrationBaseResult = await DAOstackMigration.migrateBase(options);
      console.log("deployed base")
      options.prevmigration = options.output;
      break;
  }
  const migrationDAOResult = await DAOstackMigration.migrateDAO(options);
}

migrate()