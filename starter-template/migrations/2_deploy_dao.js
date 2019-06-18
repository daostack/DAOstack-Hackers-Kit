const DAOstackMigration = require('@daostack/migration');
const migrationSpec =  require('../data/testDaoSpec.json')

console.log(process.env.PROVIDER)
module.exports = async function(deployer) {
  DAOstackMigration.Ganache.server();
  DAOstackMigration.Ganache.provider();

  const options = {
    provider: process.env.PROVIDER, 
    gasPrice: 1,
    quiet: false,
    force: true,
    output: process.env.MIGRATION_OUTPUT,
    privateKey: process.env.PRIVATE_KEY,
    prevmigration: process.env.MIGRATION_OUTPUT,
    params: {private: migrationSpec}
  };

  const migrationBaseResult = await DAOstackMigration.migrateBase(options);
  const migrationDAOResult = await DAOstackMigration.migrateDAO(options);
}
