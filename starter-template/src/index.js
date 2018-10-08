import {
  InitializeArcJs,
  LoggingService,
  LogLevel,
  ConfigService,
  AccountService
  // Add all your needed Arc.js imports here.
} from "@daostack/arc.js";

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

  // TODO: Add your own initialize code here:
}

// Calls the initialize function to initialize your project.
(async () => {
  await initialize();
})();
