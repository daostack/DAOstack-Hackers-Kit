const DAOstackMigration = require('@daostack/migration');
const migrationSpec =  require('../data/testDaoSpec.json')

module.exports = async function(deployer) {
  DAOstackMigration.Ganache.server();
  DAOstackMigration.Ganache.provider();
  const options = {
    provider: 'http://localhost:8545',
    quiet: false,
    force: true,
    output: 'migration.json',
    privateKey: '0x4f3edf983ac636a65a842ce7c78d9aa706d3b113bce9c46f30d7d21715b23b1d',
    params: migrationSpec
  };

  console.log("Here")
  const migrationBaseResult = await DAOstackMigration.migrateBase(options);
  console.log("Here3")
  const migrationDAOResult = await DAOstackMigration.migrateDAO(options);
  console.log("Here2")
  const migrationDemoResult = await DAOstackMigration.migrateDemoTest(options);
  migrationDemoResult.test.Avatar // Test DAO avatar address
  const migrationResult = await DAOstackMigration.migrate(options); // migrate
  DAOstackMigration.cli()
}
