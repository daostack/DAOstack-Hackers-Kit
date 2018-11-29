pragma solidity ^0.4.25;

import "@daostack/infra/contracts/votingMachines/IntVoteInterface.sol";
import "@daostack/infra/contracts/votingMachines/VotingMachineCallbacksInterface.sol";
import "@daostack/arc/contracts/universalSchemes/UniversalScheme.sol";
import "@daostack/arc/contracts/votingMachines/VotingMachineCallbacks.sol";


/**
 * @title AragonScheme.
 * @dev  A scheme for proposing and executing calls to an arbitrary function
 * on an Aragon DAO App contract on behalf of the organization avatar.
 */
contract AragonScheme is UniversalScheme,VotingMachineCallbacks,ProposalExecuteInterface {
    
    event NewCallProposal(
        address indexed _avatar,
        bytes32 indexed _proposalId,
        address _aragonApp,
        bytes _callData,
        string _description
    );
    event ProposalExecuted(address indexed _avatar, bytes32 indexed _proposalId,int _param);
    event ProposalDeleted(address indexed _avatar, bytes32 indexed _proposalId);
    event CanPerformData(bytes _callData);
    // Details of a voting proposal:
    
    struct CallProposal {
        address aragonApp;
        bytes callData;
        bool exist;
    }

    // A mapping from the organization (Avatar) address to the saved data of the organization:
    mapping(address=>mapping(bytes32=>CallProposal)) public organizationsProposals;


    struct Parameters {
        IntVoteInterface intVote;
        bytes32 voteParams;
    }

    // A mapping from hashes to parameters (use to store a particular configuration on the controller)
    mapping(bytes32=>Parameters) public parameters;

    /**
    * @dev execution of proposals, can only be called by the voting machine in which the vote is held.
    * @param _proposalId the ID of the voting in the voting machine
    * @param _param a parameter of the voting result, 1 yes and 2 is no.
    */
    function executeProposal(bytes32 _proposalId,int _param) external onlyVotingMachine(_proposalId) returns(bool) {
        address avatar = proposalsInfo[_proposalId].avatar;
        // Save proposal to memory and delete from storage:
        CallProposal memory proposal = organizationsProposals[avatar][_proposalId];
        require(proposal.exist,"must be a live proposal");
        delete organizationsProposals[avatar][_proposalId];
        emit ProposalDeleted(avatar, _proposalId);
        bool retVal = true;
        // If no decision do nothing:
        if (_param != 0) {
        // Define controller and get the params:
            ControllerInterface controller = ControllerInterface(Avatar(avatar).owner());
            if (controller.genericCall(
                     proposal.aragonApp,
                     proposal.callData,
                     avatar) == bytes32(0)) {
                retVal = false;
            }
          }
        emit ProposalExecuted(avatar, _proposalId,_param);
        return retVal;
    }

    /**
    * @dev Hash the parameters, save them if necessary, and return the hash value
    * @param _voteParams -  voting parameters
    * @param _intVote  - voting machine contract.
    * @return bytes32 -the parameters hash
    */
    function setParameters(
        bytes32 _voteParams,
        IntVoteInterface _intVote
    ) public returns(bytes32)
    {
        bytes32 paramsHash = getParametersHash(_voteParams, _intVote);
        parameters[paramsHash].voteParams = _voteParams;
        parameters[paramsHash].intVote = _intVote;
        return paramsHash;
    }

    /**
    * @dev Hash the parameters, and return the hash value
    * @param _voteParams -  voting parameters
    * @param _intVote  - voting machine contract.
    * @return bytes32 -the parameters hash
    */
    function getParametersHash(
        bytes32 _voteParams,
        IntVoteInterface _intVote
    ) public pure returns(bytes32)
    {
        return keccak256(abi.encodePacked(_voteParams, _intVote));
    }

    /**
    * @dev Propose a call to an Aragon DAO on behalf of the _avatar
    *      The function triggers NewCallProposal event
    * @param _avatar avatar of the DAO Stack organization
    * @param _aragonApp avatar of the DAO Stack organization
    * @param _callData - The abi encode data for the call
    * @param _description description of the call being proposed
    * @return an id which represents the proposal
    */

    function proposeAragonCall(
        Avatar _avatar,
        address _aragonApp,
        bytes _callData,
        string _description
    ) public returns(bytes32)
    {
        Parameters memory params = parameters[getParametersFromController(_avatar)];
        IntVoteInterface intVote = params.intVote;

        bytes32 proposalId = intVote.propose(2, params.voteParams,msg.sender,_avatar);

        organizationsProposals[_avatar][proposalId] = CallProposal({
            aragonApp: _aragonApp,
            callData: _callData,
            exist: true
        });
        
        proposalsInfo[proposalId] = ProposalInfo({
            blockNumber:block.number,
            avatar:_avatar,
            votingMachine:params.intVote
        });

        emit NewCallProposal(_avatar, proposalId, _aragonApp, _callData, _description);
        
        return proposalId;
    }   
}
