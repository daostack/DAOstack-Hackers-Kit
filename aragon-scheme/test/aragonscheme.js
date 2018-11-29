
import * as helpers from './helpers';
const constants = require('./constants');
const AbsoluteVote = artifacts.require('./AbsoluteVote.sol');
const AragonScheme = artifacts.require('./AragonScheme.sol');
const DaoCreator = artifacts.require("./DaoCreator.sol");
const ControllerCreator = artifacts.require("./ControllerCreator.sol");
const StandardTokenMock = artifacts.require("./StandardTokenMock.sol");

const COUNTER_APP_ABI = [
	{
		"constant": false, 
		"inputs": [
			{
				"name": "step", 
				"type": "uint256"
			}
		], 
		"name": "increment", 
		"outputs": [], 
		"payable": false, 
		"stateMutability": "nonpayable", 
		"type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "value",
    "outputs": [
      {
        "name": "",
        "type": "uint256"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  }
]

const COUNTER_APP_ADDRESS = "0x248c17006fa3d551bd3cabb98bb3748af7d1d954"
const INCREMENT = "Increment Counter by 1"
const DECREMENT = "Decrement Counter by 1"

export class AragonSchemeParams {
  constructor() {
  }
}

const setupAragonSchemeParams = async function(
                                            aragonScheme, 
                                            accounts, 
                                            genesisProtocol = false, 
                                            tokenAddress = 0
                                            ) {
  var aragonSchemeParams = new AragonSchemeParams();
  if (genesisProtocol === true){
      aragonSchemeParams.votingMachine = await helpers.setupGenesisProtocol(accounts, tokenAddress, 0, 0);
      await aragonScheme.setParameters(aragonSchemeParams.votingMachine.params, aragonSchemeParams.votingMachine.genesisProtocol.address);
      aragonSchemeParams.paramsHash = await aragonScheme.getParametersHash(aragonSchemeParams.votingMachine.params, aragonSchemeParams.votingMachine.genesisProtocol.address);
    }
  else {
      aragonSchemeParams.votingMachine = await helpers.setupAbsoluteVote(true, 50, aragonScheme.address);
      await aragonScheme.setParameters(aragonSchemeParams.votingMachine.params, aragonSchemeParams.votingMachine.absoluteVote.address);
      aragonSchemeParams.paramsHash = await aragonScheme.getParametersHash(aragonSchemeParams.votingMachine.params, aragonSchemeParams.votingMachine.absoluteVote.address);
  }

  return aragonSchemeParams;
};

const setup = async function (accounts, reputationAccount=0, genesisProtocol = false, tokenAddress=0) {
   var testSetup = new helpers.TestSetup();
   testSetup.standardTokenMock = await StandardTokenMock.new(accounts[1], 100);
   testSetup.aragonScheme = await AragonScheme.new();
   var controllerCreator = await ControllerCreator.new({gas: constants.ARC_GAS_LIMIT});
   testSetup.daoCreator = await DaoCreator.new(controllerCreator.address, {gas:constants.ARC_GAS_LIMIT});
   testSetup.reputationArray = [20, 10, 70];

   if (reputationAccount === 0) {
     testSetup.org = await helpers.setupOrganizationWithArrays(testSetup.daoCreator, [accounts[0], accounts[1], accounts[2]], [1000, 1000, 1000], testSetup.reputationArray);
   } else {
     testSetup.org = await helpers.setupOrganizationWithArrays(testSetup.daoCreator, [accounts[0], accounts[1], reputationAccount], [1000, 1000, 1000], testSetup.reputationArray);
   }
   testSetup.aragonSchemeParams= await setupAragonSchemeParams(testSetup.aragonScheme, accounts, genesisProtocol, tokenAddress);
   var permissions = "0x00000010";


   await testSetup.daoCreator.setSchemes(testSetup.org.avatar.address, 
                                        [testSetup.aragonScheme.address], 
                                        [testSetup.aragonSchemeParams.paramsHash], [permissions]);

   return testSetup;
};

const createCallToCounterApp = async function(_step) {
  return await new web3.eth.Contract(COUNTER_APP_ABI,COUNTER_APP_ADDRESS).methods.increment(_step).encodeABI();
};

contract('aragonScheme', function(accounts) {
  before(function() {
   // helpers.etherForEveryone(accounts);
  });
    it("setParameters", async function() {
       var aragonScheme = await AragonScheme.new();
       var absoluteVote = await AbsoluteVote.new();
       await aragonScheme.setParameters("0x1234", absoluteVote.address);
       var paramHash = await aragonScheme.getParametersHash("0x1234", absoluteVote.address);
       var parameters = await aragonScheme.parameters(paramHash);
       assert.equal(parameters[0], absoluteVote.address);
    });

    it("proposeCall log", async function() {

       var testSetup = await setup(accounts);
       var callData = await createCallToCounterApp(1);

       var tx = await testSetup.aragonScheme.proposeAragonCall(
         testSetup.org.avatar.address, 
         COUNTER_APP_ADDRESS,
         callData,
         INCREMENT
         
       );
       assert.equal(tx.logs.length, 1);
       assert.equal(tx.logs[0].event, "NewCallProposal");
    });

    it("execute proposeCall -no decision - proposal data delete", async function() {
       var testSetup = await setup(accounts);
       var callData = await createCallToCounterApp(1);
       var tx = await testSetup.aragonScheme.proposeAragonCall(
        testSetup.org.avatar.address, 
        COUNTER_APP_ADDRESS,
        callData,
        INCREMENT
      );
       var proposalId = await helpers.getValueFromLogs(tx, '_proposalId');
       await testSetup.aragonSchemeParams.votingMachine.absoluteVote.vote(proposalId, 0, 0, {from:accounts[2]});
       //check organizationsProposals after execution
       var organizationProposal = await testSetup.aragonScheme.organizationsProposals(testSetup.org.avatar.address, proposalId);
       assert.equal(organizationProposal.callData, null);
    });

    it("execute proposeVote -positive decision - proposal data delete", async function() {
        var testSetup = await setup(accounts);
        var callData = await createCallToCounterApp(1);
        var tx = await testSetup.aragonScheme.proposeAragonCall(
          testSetup.org.avatar.address, 
          COUNTER_APP_ADDRESS,
          callData,
          INCREMENT
        );
        var proposalId = await helpers.getValueFromLogs(tx, '_proposalId');
        var organizationProposal = await testSetup.aragonScheme.organizationsProposals(testSetup.org.avatar.address, proposalId);
        assert.equal(organizationProposal[1], callData);
        await testSetup.aragonSchemeParams.votingMachine.absoluteVote.vote(proposalId, 1, 0, {from:accounts[2]});
        //check organizationsProposals after execution
        organizationProposal = await testSetup.aragonScheme.organizationsProposals(testSetup.org.avatar.address, proposalId);
        assert.equal(tx.logs.length, 1);
        assert.equal(organizationProposal.callData, null);//new contract address
     });
});
