# Create a plugin on Arc

As we said before, plugins are the DAO's actions, and if you want your DAO (or any DAO) to have a new action you can do it.

First of all, you will need to add your new plugin in Arc. This means that you will need to fork the [Arc repository](https://github.com/daostack/arc), write your custom plugin, and create a PR to the daostack's repository

## Writing the contracts

Let's use as example the [`TrokenTrade`](https://github.com/daostack/arc/tree/master-2/contracts/schemes/TokenTrade.sol) plugin, to show how you should add your custom plugin:

You need to create it in the folder [schemes](https://github.com/daostack/arc/tree/master-2/contracts/schemes).

Your contract will need to inherit from `VotingMachineCallBacks` and `ProposalExecuteInterface`, this will allow your new plugin to interact with the GenesisProtocol. Example with the `TokenTrade` plugin:

```
contract TokenTrade is VotingMachineCallbacks, ProposalExecuteInterface {
  ...
}
```

In order to initialize the governance in the new plugin, you will need to initialize it, for that, you have to create an `initialize` method, like this:

```
function initialize(
    Avatar _avatar,
    IntVoteInterface _votingMachine,
    uint256[11] calldata _votingParams,
    address _voteOnBehalf,
    bytes32 _voteParamsHash
)
external
{
    super._initializeGovernance(_avatar, _votingMachine, _voteParamsHash, _votingParams, _voteOnBehalf);
}
```

As you can see, you must pass five parameters, which are:
- _avatar: The avatar (DAO) this plugin referring to.
- _votingMachine: The voting machine address
- _votingParams: GenesisProtocol parameters - valid only if _voteParamsHash is zero
- _voteOnBehalf: GenesisProtocol parameter - valid only if _voteParamsHash is zero
- _voteParamsHash: Voting machine parameters.

Beside of these parameters, you can pass as many as you want; in case you want to store any useful information in a contract's variable.

Next, you will need to create a struct `Proposal`; this will allow you to store the information needed for the proposal (i.e: tokens to transfer/receive, REP to give, and any other use case you can imagine), note that this is the information the contract needs to have access to, things like title or description will be stored on IPFS (when we add our plugin at Subgraph level). Also, we will need a `proposals` mapping, to identify every proposal with a unique ID. Example with `TokenTrade` plugin:

```
struct Proposal {
    address beneficiary;
    IERC20 sendToken;
    uint256 sendTokenAmount;
    IERC20 receiveToken;
    uint256 receiveTokenAmount;
    bool passed;
    bool decided;
}

mapping(bytes32=>Proposal) public proposals;
```

Create a `proposal${PLUGIN_NAME}`, (i.e: `proposalTokenTrade`). This function will create the proposal in the Voting Machine, by calling the `votingMachine.propose(2, ...)` function, the first argument of this function always needs to be 2 because it's the number of choices a proposal will have (Yes or No). Check the implementation of `TokenTrade`: 
```
function proposeTokenTrade(
    IERC20 _sendToken,
    uint256 _sendTokenAmount,
    IERC20 _receiveToken,
    uint256 _receiveTokenAmount,
    string memory _descriptionHash
)
public
returns(bytes32 proposalId)
{
    require(
        address(_sendToken) != address(0) && address(_receiveToken) != address(0),
        "Token address must not be null"
    );
    require(_sendTokenAmount > 0 && _receiveTokenAmount > 0, "Token amount must be greater than 0");

    _sendToken.safeTransferFrom(msg.sender, address(this), _sendTokenAmount);
    proposalId = votingMachine.propose(2, voteParamsHash, msg.sender, address(avatar));

    proposals[proposalId] = Proposal({
        beneficiary: msg.sender,
        sendToken: _sendToken,
        sendTokenAmount: _sendTokenAmount,
        receiveToken: _receiveToken,
        receiveTokenAmount: _receiveTokenAmount,
        passed: false,
        decided: false
    });

    proposalsBlockNumber[proposalId] = block.number;

    emit TokenTradeProposed(
        address(avatar),
        proposalId,
        _descriptionHash,
        msg.sender,
        _sendToken,
        _sendTokenAmount,
        _receiveToken,
        _receiveTokenAmount
    );
}
```

IMPORTANT: The line `proposalsBlockNumber[proposalId] = block.number;` is necessary to add in the propose method!

In order to execute the proposal once it has passed, you need to implement an `executeProposal` method like this (example from `TokenTrade.sol`):
```
function executeProposal(bytes32 _proposalId, int256 _decision)
external
onlyVotingMachine(_proposalId)
override
returns(bool) {
    if (_decision == 1) {
        proposals[_proposalId].passed = true;
    }
    proposals[_proposalId].decided = true;

    emit ProposalExecuted(address(avatar), _proposalId, _decision);
    return true;
}
```
In this you will define what happens once the proposal has been approved or rejected, based on the `_decision` parameter, execution logic should usually be separated into a different function, whereas this one should be used just to mark a proposal passed.

At last, you will need to implement tests for this contract.