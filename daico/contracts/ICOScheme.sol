pragma solidity ^0.4.24;

import "@daostack/arc/contracts/controller/Avatar.sol";
import "@daostack/arc/contracts/controller/ControllerInterface.sol";
import "openzeppelin-solidity/contracts/lifecycle/Pausable.sol";


/**
 * @title A scheme (non-universal) for rasing funds for an oganization in an ICO model
 * @dev An organization can start an ICO using this scheme and 
 * offer its tokens and reputation for sale at a fixed rate.
 */
contract ICOScheme is Pausable {
    using SafeMath for uint;

    
    Avatar public avatar; // Avatar of the organization raising funds

    uint public cap; // Cap in Eth
    uint public price; // Price represents tokens per 1 Eth
    uint public startBlock;
    uint public endBlock;

    uint public totalRepForDonators;
    mapping(address => uint) public beneficiaries;

    uint public totalEthRaised;

    event DonationReceived(address indexed _beneficiary, uint _incomingEther, uint _tokensAmount);
    event ReputationRedeemed(address indexed _beneficiary, uint _reputationAmount);

    constructor (
        uint _cap,
        uint _price,
        uint _startBlock,
        uint _endBlock,
        uint _totalRepForDonators
    ) public
    {
        require(_cap != 0, "cap must be greater than zero");
        cap = _cap;
        price = _price;
        startBlock = _startBlock;
        endBlock = _endBlock;
        totalRepForDonators = _totalRepForDonators;
    }

    /**
    * @dev Fallback function, when ether is sent it will donate to the ICO.
    * The ether will be returned if the donation is failed.
    */
    function () public payable {
        // Return ether if couldn't donate.
        require(donate(msg.sender) != 0, "Donation must be greater than 0");
    } 

    /**
     * @dev Check is the ICO active (halted is still considered active). Active ICO:
     * 1. The ICO didn't reach it's cap yet.
     * 2. The current block isn't bigger than the "endBlock" & Smaller then the "startBlock"
     * @return bool which represents a successful of the function
     */
    function isActive() public view returns(bool) {
        if (totalEthRaised >= cap) {
            return false;
        }
        if (block.number >= endBlock) {
            return false;
        }
        if (block.number <= startBlock) {
            return false;
        }

        return true;
    }

    /**
     * @dev Donating ethers to get tokens.
     * If the donation is higher than the remaining ethers in the "cap",
     * The donator will get the change in ethers.
     * @param _beneficiary The donator's address - which will receive the ICO's tokens.
     * @return uint number of tokens minted for the donation.
     */
    function donate(address _beneficiary) public payable whenNotPaused returns(uint) {

        // Check ICO is active:
        require(isActive(), "ICO is not active");

        require(msg.value != 0, "No Ether were sent in the contribution");

        uint incomingEther;
        uint change;

        // Compute how much tokens to buy:
        if (msg.value > cap.sub(totalEthRaised)) {
            incomingEther = cap.sub(totalEthRaised);
            change = (msg.value).sub(incomingEther);
        } else {
            incomingEther = msg.value;
        }

        uint tokens = incomingEther.mul(price);

        // Update total raised, call event and return amount of tokens bought:
        totalEthRaised += incomingEther;

        beneficiaries[_beneficiary] = beneficiaries[_beneficiary] + incomingEther;

        // Send ether to the defined address, mint, and send change to beneficiary:
        address(avatar).transfer(incomingEther);

        require(
            ControllerInterface(avatar.owner()).mintTokens(tokens, _beneficiary, address(avatar)),
            "Failed to mint tokens"
        );
        
        if (change != 0) {
            _beneficiary.transfer(change);
        }

        emit DonationReceived(_beneficiary, incomingEther, tokens);

        return tokens;
    }

    /**
     * @dev Redeem reputation in the DAO after the ICO is over.
     * The beneficiay will get reputation based on his relative donation in the ICO.
     * @param _beneficiary The beneficiary's address (used when donated ETH) - which will receive the DAO's reputation.
     * @return uint number of reputation minted for the beneficiary.
     */
    function redeemReputation(address _beneficiary) public whenNotPaused returns(uint) {
        // Check ICO is not active:
        require(!isActive(), "ICO is still active");

        uint beneficiaryDonation = beneficiaries[_beneficiary];

        require(beneficiaryDonation > 0, "Beneficiary did not donated in the ICO");

        uint reputation = totalRepForDonators.div(totalEthRaised).mul(beneficiaryDonation);

        beneficiaries[_beneficiary] = 0;

        require(
            ControllerInterface(avatar.owner()).mintReputation(reputation, _beneficiary, address(avatar)),
            "Failed to mint reputation"
        );

        emit ReputationRedeemed(_beneficiary, reputation);

        return reputation;
    }


}
