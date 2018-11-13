import {
  InitializeArcJs,
  LoggingService,
  LogLevel,
  ConfigService,
  AccountService
} from "@daostack/arc.js";

const ICOSchemeArtifacts = require("../build/contracts/ICOScheme.json");
const contract = require("truffle-contract");
let ICOScheme = contract(ICOSchemeArtifacts);

// Default Avatar and Voting Machine addresses when using Ganache cli.
// TODO: Paste here your own instances addresses which can be found in the logs at the end of the migration script.
const avatarAddress = "0xf81588ecd485cba1e7d27ae149f56767f8a07e30";
const votingMachineAddress = "0x9de9beb3518afe870e6585f7890751bbabc3c02c";
var daicoDAO;
var icoScheme;

/*
Helper function for initializing ArcJS and your app.
*/
async function initialize() {
  await InitializeArcJs({
    watchForAccountChanges: true
    /*
    Edit this to filter imported contracts
    , filter: {
      
    }
    */
  });

  // These are some basic configurations, feel free to edit as you need.
  // Learn more about the Arc.js configurations here: https://daostack.github.io/arc.js/Configuration/

  ConfigService.set("estimateGas", true);
  ConfigService.set("txDepthRequiredForConfirmation", {
    kovan: 0,
    live: 0
  });
  LoggingService.logLevel = LogLevel.all;

  AccountService.subscribeToAccountChanges(() => {
    window.location.reload();
  });

  daicoDAO = await DAO.at(avatarAddress);
  const daoSchemes = await daicoDAO.getSchemes();
  const daoSchemeAddress = daoSchemes[0].address; 

  ICOScheme.setProvider(web3.currentProvider); // Sets the Web3 Provider for a non-ArcJS contract
  icoScheme = await ICOScheme.at(daoSchemeAddress); // Initializes a PeepScheme instance with our deployed scheme address

}

// Calls the initialize function to initialize your project.
(async () => {
  await initialize();
})();
