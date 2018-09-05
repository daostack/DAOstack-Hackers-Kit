pragma solidity ^0.4.24;

import "@daostack/arc/contracts/universalSchemes/UniversalScheme.sol";
import "@daostack/arc/contracts/universalSchemes/ExecutableInterface.sol";
import "@daostack/arc/contracts/VotingMachines/IntVoteInterface.sol";
import "@daostack/arc/contracts/controller/ControllerInterface.sol";
import "./PeepethInterface.sol";


/**
 * @title A universal scheme for proposing "peeps" and rewarding proposers with reputation
 * @dev An agent can propose the organization a "peep" to send.
 * if accepted the peep will be posted by the organization
 * and the proposer will receive reputation.
 */
contract PeepScheme is UniversalScheme, ExecutableInterface {

    // Peepeth contract address on the Ethereum mainnet
    address public constant PEEPETH = 0xfa28eC7198028438514b49a3CF353BcA5541ce1d;
    
    // Peepeth contract address on the Ethereum Rinkeby testnet
    address public constant PEEPETH_RINKEBY = 0xfA804eED9405f89CF48Da33e23ea4BE48de933C5;

    // Peepeth contract address on the Ethereum Kovan testnet
    address public constant PEEPETH_KOVAN =  0xb704a46B605277c718A68D30Cb731c8818217eC7;

    address public peepethContract;
    
    event PeepethAccountRegistered(address indexed _avatar, bytes16 _name, string _ipfsHash);

    event NewPeepProposal(
        address indexed _avatar,
        bytes32 indexed _proposalId,
        address indexed _intVoteInterface,
        address _proposer,
        string _peepHash,
        uint _reputationChange
    );

    event ProposalExecuted(address indexed _avatar, bytes32 indexed _proposalId, int _param);

    // A struct representing a proposal to send a new Peep by the avatar of an organization
    struct PeepProposal {
        address proposer; // The proposer of the tweet
        string peepHash; // The IPFS hash of the peep to post
        uint reputationChange; // Organization reputation reward requested by the proposer.
    }

    // A mapping from the organization (Avatar) address to the saved proposals of the organization:
    mapping(address=>mapping(bytes32=>PeepProposal)) public organizationsProposals;

    // A struct representing organization parameters in the Universal Scheme.
    // The parameters represent a specific configuration set for an organization.
    // The parameters should be approved annd registered in the controller of the organization.
    struct Parameters {

        bytes32 voteApproveParams; // The hash of the approved parameters of a Voting Machine for a specific organization.
                                    // Used in the voting machine as the key in the parameters mapping to 
                                    // Note that these settings should be registered in the Voting Machine prior of using this scheme.
                                    // You can see how to register the parameters by looking on `2_deploy_dao.js` under the `migrations` folder at line #64.
        
        IntVoteInterface intVote; // The address of the Voting Machine to be used to propose and vote on a proposal.
    }
    // A mapping from hashes to parameters (use to store a particular configuration on the controller)
    mapping(bytes32 => Parameters) public parameters;
    
    // A mapping from the organization (Avatar) address to its Peepeth account name.
    mapping(address => bytes16) public peepethAccounts;

    constructor(address _peepethContract) public {
        peepethContract = _peepethContract;
    }

    /**
    * @dev hash the parameters, save them if necessary, and return the hash value
    */
    function setParameters(
        bytes32 _voteApproveParams,
        IntVoteInterface _intVote
    ) public returns(bytes32)
    {
        bytes32 paramsHash = getParametersHash(
            _voteApproveParams,
            _intVote
        );
        parameters[paramsHash].voteApproveParams = _voteApproveParams;
        parameters[paramsHash].intVote = _intVote;
        return paramsHash;
    }

    /**
    * @dev hash the parameters and return the hash
    */
    function getParametersHash(
        bytes32 _voteApproveParams,
        IntVoteInterface _intVote
    ) public pure returns(bytes32)
    {
        return (keccak256(abi.encodePacked(_voteApproveParams, _intVote)));
    }
    
    /**
    * @dev Registers an Avatar as a Peepeth account owner
    * @param _avatar the avatar of the organization to rregister to Peepeth
    * @param _name the username for the avatar's account
    * @param _ipfsHash the IPFS hash for the registration message on IPFS. An example for this message can be found at: https://ipfs.io/ipfs/QmQg5xX9RCWT8dxNnJV6WLSC3qQJXgac2vfcALh8ymmrL3
    */
    function registerPeepethAccount(address _avatar, bytes16 _name, string _ipfsHash) public {
        // Check that the avater did not already register to Peepeth.
        require(peepethAccounts[_avatar] == bytes16(0), " Specified avatar is already registered");
        
        // Saves the avatar Peepeth username
        peepethAccounts[_avatar] = _name;
        
        ControllerInterface controller = ControllerInterface(Avatar(_avatar).owner());
        // Sends a call to the Peepeth contract to create an account.
        // The call will be made from the avatar address such that when received by the Peepeth contract, the msg.sender value will be the avatar's address
        controller.genericCall(
            peepethContract, 
            abi.encodeWithSelector(PeepethInterface(peepethContract).createAccount.selector, _name, _ipfsHash),
            _avatar
        );
        
        emit PeepethAccountRegistered(_avatar, _name, _ipfsHash);
    }

   
    function proposePeep(
        Avatar _avatar,
        string _peepHash,
        uint _reputationChange
    ) public
      returns(bytes32)
    {
        Parameters memory controllerParams = parameters[getParametersFromController(_avatar)];

        bytes32 peepId = controllerParams.intVote.propose(
            3,
            controllerParams.voteApproveParams,
           _avatar,
           ExecutableInterface(this),
           msg.sender
        );

        // Set the struct:
        PeepProposal memory proposal = PeepProposal({
            proposer: msg.sender,
            peepHash: _peepHash,
            reputationChange: _reputationChange
        });
        organizationsProposals[_avatar][peepId] = proposal;

        emit NewPeepProposal(
            _avatar,
            peepId,
            controllerParams.intVote,
            msg.sender,
            _peepHash,
            _reputationChange
        );

        return peepId;
    }

    /**
    * @dev execution of proposals, can only be called by the voting machine in which the vote is held.
    * @param _proposalId the ID of the voting in the voting machine
    * @param _avatar address of the controller
    * @param _param a parameter of the voting result, 1 yes and 2 is no.
    */
    function execute(bytes32 _proposalId, address _avatar, int _param) public returns(bool) {
        // Check the caller is indeed the voting machine:
        require(
            parameters[getParametersFromController(Avatar(_avatar))].intVote == msg.sender, 
            "Only the voting machine can execute proposal"
        );

        // Check if vote was successful:
        if (_param == 1) {
            PeepProposal memory proposal = organizationsProposals[_avatar][_proposalId];
            
            ControllerInterface controller = ControllerInterface(Avatar(_avatar).owner());
            // Sends a call to the Peepeth contract to post a new peep.
            // The call will be made from the avatar address such that when received by the Peepeth contract, the msg.sender value will be the avatar's address
            controller.genericCall(peepethContract, abi.encodeWithSelector(PeepethInterface(peepethContract).post.selector, proposal.peepHash), _avatar);
            
            // Mints reputation for the proposer of the Peep.
            require(
                ControllerInterface(Avatar(_avatar).owner()).mintReputation(uint(proposal.reputationChange), proposal.proposer, _avatar),
                "Failed to mint reputation to proposer"
            );
        } else {
            delete organizationsProposals[_avatar][_proposalId];
        }

        emit ProposalExecuted(_avatar, _proposalId, _param);
        return true;
    }
}