const CredETH = artifacts.require("./CredEth.sol");
const migrationDao = JSON.parse(require("fs").readFileSync("../data/migration.json").toString());

// It may not work because DaoStack migration is not working so np proper migration.json data exists
module.exports = async (deployer, network, accounts) => {
    let owner;
    let daoAddress;
    if (network == "development") {
        owner = accounts[0];
        daoAddress = migrationDao.private.base["0.0.1-rc.23"].CredEthScheme;
    }
    else if (network == "kovan") {
        owner = accounts[0];
        daoAddress = migrationDao.kovan.base["0.0.1-rc.23"].CredEthScheme;
    }
    await deployer.deploy(CredETH, {from: owner});
    await CredETH.setDao(daoAddress, {from: owner});
}