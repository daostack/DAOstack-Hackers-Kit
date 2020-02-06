pragma solidity ^0.5.0;

import "openzeppelin-solidity/contracts/token/ERC20/IERC20.sol";
import '@daostack/infra/contracts/votingMachines/AbsoluteVote.sol';
import '@daostack/arc/contracts/controller/Controller.sol';
import "./IFireStarter.sol";

contract VotingMachineCallback is VotingMachineCallbacksInterface, ProposalExecuteInterface {

    struct ProposalInfo {
        uint256 blockNumber; // the proposal's block number
        Avatar avatar; // the proposal's avatar
    }

    modifier onlyVotingMachine(bytes32 _proposalId) {
        require(proposalsInfo[msg.sender][_proposalId].avatar != Avatar(address(0)), "only VotingMachine");
        _;
    }

    // VotingMaching  ->  proposalId  ->  ProposalInfo
    mapping(address => mapping(bytes32 => ProposalInfo)) public proposalsInfo;

    function mintReputation(uint256 _amount, address _beneficiary, bytes32 _proposalId)
    external
    onlyVotingMachine(_proposalId)
    returns(bool)
    {
        Avatar avatar = proposalsInfo[msg.sender][_proposalId].avatar;
        if (avatar == Avatar(0)) {
            return false;
        }
        return Controller(avatar.owner()).mintReputation(_amount, _beneficiary, address(avatar));
    }

    function burnReputation(uint256 _amount, address _beneficiary, bytes32 _proposalId)
    external
    onlyVotingMachine(_proposalId)
    returns(bool)
    {
        Avatar avatar = proposalsInfo[msg.sender][_proposalId].avatar;
        if (avatar == Avatar(0)) {
            return false;
        }
        return Controller(avatar.owner()).burnReputation(_amount, _beneficiary, address(avatar));
    }

    function stakingTokenTransfer(
        IERC20 _stakingToken,
        address _beneficiary,
        uint256 _amount,
        bytes32 _proposalId)
    external
    onlyVotingMachine(_proposalId)
    returns(bool)
    {
        Avatar avatar = proposalsInfo[msg.sender][_proposalId].avatar;
        if (avatar == Avatar(0)) {
            return false;
        }
        return Controller(avatar.owner()).externalTokenTransfer(_stakingToken, _beneficiary, _amount, avatar);
    }

    function balanceOfStakingToken(IERC20 _stakingToken, bytes32 _proposalId) external view returns(uint256) {
        Avatar avatar = proposalsInfo[msg.sender][_proposalId].avatar;
        if (proposalsInfo[msg.sender][_proposalId].avatar == Avatar(0)) {
            return 0;
        }
        return _stakingToken.balanceOf(address(avatar));
    }

    function getTotalReputationSupply(bytes32 _proposalId) external view returns(uint256) {
        ProposalInfo memory proposal = proposalsInfo[msg.sender][_proposalId];
        if (proposal.avatar == Avatar(0)) {
            return 0;
        }
        return proposal.avatar.nativeReputation().totalSupplyAt(proposal.blockNumber);
    }

    function reputationOf(address _owner, bytes32 _proposalId) external view returns(uint256) {
        ProposalInfo memory proposal = proposalsInfo[msg.sender][_proposalId];
        if (proposal.avatar == Avatar(0)) {
            return 0;
        }
        return proposal.avatar.nativeReputation().balanceOfAt(_owner, proposal.blockNumber);
    }
//--------------------------------------------------------------------------------------------------------

    address public firestarter;
    AbsoluteVote public absoluteVote;
    bytes32 public paramsHash;
    uint public projectId;

    mapping(bytes32 => uint) public ethWanted;
    mapping(bytes32 => address payable) public proposer;

    event ProposalCreated(bytes32 indexed proposalId, address indexed proposer);
    event ProposalFinished(bytes32 indexed proposalId, int decision);
    event ProposalVote(bytes32 indexed proposalId, uint vote, address indexed voter);

    constructor(uint _projectId) public {
        projectId = _projectId;
        firestarter = msg.sender;
        absoluteVote = new AbsoluteVote();
        paramsHash = absoluteVote.setParameters(51, address(this)); 
    }

    function createProposal(uint _ethAmount) public {
        bytes32 proposalId = absoluteVote.propose(2, paramsHash, address(0), address(this));

        ethWanted[proposalId] = _ethAmount;
        proposer[proposalId] = msg.sender;

        emit ProposalCreated(proposalId, msg.sender);
    }

    function vote(bytes32 _proposalId, bool yes) public {

        absoluteVote.vote(_proposalId, yes ? 1 : 0, 0, msg.sender);

        emit ProposalVote(_proposalId, yes ? 1 : 0, msg.sender);
    }

    function voteStatus(bytes32 _proposalId) external view returns(uint yes, uint no) {
        yes = absoluteVote.voteStatus(_proposalId, 1);
        no = absoluteVote.voteStatus(_proposalId, 0);
    }

    function executeProposal(bytes32 _proposalId, int _decision) external returns(bool) {

        if (_decision == 1) {
            IFireStarter(firestarter).withdraw(projectId, ethWanted[_proposalId], "Got from proposal");

            proposer[_proposalId].transfer(address(this).balance);
        }

        emit ProposalFinished(_proposalId, _decision);
    }
}
