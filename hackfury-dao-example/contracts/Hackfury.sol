pragma solidity ^0.4.24;

import "@daostack/arc/contracts/universalSchemes/UniversalScheme.sol";
import "@daostack/arc/contracts/VotingMachines/IntVoteInterface.sol";
import "@daostack/arc/contracts/controller/ControllerInterface.sol";


contract Hackfury is UniversalScheme {

    mapping (bytes32 => Parameters) public parameters;
    mapping (address => string) public auditors;
    mapping (uint => uint) public etherLockedByReport;
    mapping (uint => address[]) public blamedHack;
    mapping (address => uint) public reputationGotByTips;

    Report[] public reports;

    struct Parameters {
        bytes32 voteApproveParams;
        IntVoteInterface intVote;
    }

    struct Report {
        address auditor;
        address customer;
        uint date;
        string linkToReport;
        string codeVersionAudited;
        string reportHashsum;
        bool summary;
        bool approvedByCustomer;
    }

    event AuditorRegistered(address _auditor, string _name);
    event ReportSubmitted(
      uint _reportId,
      address _auditor,
      address _customer,
      uint _date, 
      string _linkToReport,
      string _codeVersionAudited,
      string _reportHashsum,
      bool _summary
    );
    event EtherLockedInReport(uint _reportId, address _auditor, uint _etherAmount);
    event ReportConfirmed(uint _reportId, address _customer);
    event HackBlamed(uint _reportId, address _trustedAuditor);
    event HackConfirmed(uint _reportId, address _customer, uint _etherAmount);
    event AuditValidated(uint _reportId, address _auditor, uint _etherAmount);
    event AuditorTipped(address _trustedAuditor, address _auditor);

    /**
    * @dev Constructor register trusted auditors
    */
    constructor() public {
        auditors[0xc73b23be8CD2a99c2b5A35D190C8684c87fAfa04] = "Ivan";
        auditors[0x2b02EA775ffAF5f45FE97Fb938FFAea8756eF076] = "Paul";
        auditors[0xd2BDfc2d407b6EEB949a44192bBbf874cD392a11] = "Test";
    }

  /**
  * @dev Allows any account to register as auditor
  */
    function registerAsAuditor(string _name) public {
        auditors[msg.sender] = _name;
        emit AuditorRegistered(msg.sender, _name);
    }

    /**
    * @dev Allows to submit an audit report by any registered auditor
    */
    function submitReport(address _customer, string _linkToReport, string _codeVersionAudited, string _reportHashsum, bool _summary)
      public payable returns(uint) {

        require(keccak256(auditors[msg.sender]) != keccak256(""), "You must be registered to submit a report");
        require(msg.value > 1 finney, "Please sent more than 1 finney to this function");
        // solium-disable-next-line security/no-block-members
        reports.push(Report(msg.sender, _customer, now, _linkToReport, _codeVersionAudited, _reportHashsum, _summary, false));
        // solium-disable-next-line security/no-block-members
        emit ReportSubmitted(reports.length, msg.sender, _customer, now, _linkToReport, _codeVersionAudited, _reportHashsum, _summary);
        etherLockedByReport[reports.length] = msg.value;
        emit EtherLockedInReport(reports.length, msg.sender, msg.value);

        return reports.length;

    }

    /**
    * @dev Allows customer to confirm the final report metadata
    */
    function confirmReport(uint _id) public {
        require(msg.sender == reports[_id].customer, "Only the customer can confirm a report");
        reports[_id].approvedByCustomer = true;
        emit ReportConfirmed(_id, msg.sender);
    }

    /**
    * @dev Allows trusted auditors to blame hack for report.
    * If this is 5th blame by trusted auditor - funds are transferred to customer account
    */
    function blameHack(address _avatar, uint _id) public {
        require(getReputationByAddress(_avatar, msg.sender) >= 100, "Ypu don't have enough reputation to execute this action");

        blamedHack[_id].push(msg.sender);
        emit HackBlamed(_id, msg.sender);

        if (blamedHack[_id].length == 5) {
            uint tempEtherLockedByReport = etherLockedByReport[_id];
            etherLockedByReport[_id] = 0;
            reports[_id].customer.transfer(tempEtherLockedByReport);
            emit HackConfirmed(_id, reports[_id].customer, tempEtherLockedByReport);
            bool auditorReputationOK = getReputationByAddress(_avatar, reports[_id].auditor) >= 42;

            if (auditorReputationOK) {
                ControllerInterface(Avatar(_avatar).owner()).burnReputation(42 * 10 ** 18, reports[_id].auditor, _avatar);
            } else {
                ControllerInterface(Avatar(_avatar).owner()).burnReputation(
                getReputationByAddress(_avatar, reports[_id].auditor), reports[_id].auditor, _avatar);
            }
        }
    }

    /**
    * @dev Allows any account to claim the end of the ether lock.
    * If all conditions are met - auditor receives locked ether
    */
    function claimEnd(address _avatar, uint _id) public {
        require(blamedHack[_id].length < 5, "Hack was confirmed by the DAO");
        // solium-disable-next-line security/no-block-members
        require(now > reports[_id].date + (365 * 24 * 60), "Test period didn't end yet");

        uint tempEtherLockedByReport = etherLockedByReport[_id];
        etherLockedByReport[_id] = 0;
        ControllerInterface(Avatar(_avatar).owner()).mintReputation(3 * 10 ** 18, reports[_id].auditor, _avatar);
        reports[_id].auditor.transfer(tempEtherLockedByReport);
        emit AuditValidated(_id, reports[_id].auditor, tempEtherLockedByReport);
    }

    /**
    * @dev Allows trusted auditor to tip auditor with reputation
    */
    function tipAuditorWithReputation(address _avatar, address _auditor, uint _reputation) public {
        require(keccak256(auditors[_auditor]) != keccak256(""), "Address specified is not a registered auditor");
        require(
            reputationGotByTips[_auditor] + _reputation <= 5,
            "The action will entitle the auditor too much rep from tips"
        );
        require(getReputationByAddress(_avatar, msg.sender) >= 100, "You must have at least 100 rep to tip an auditor");
        reputationGotByTips[_auditor] = reputationGotByTips[_auditor] + _reputation;
        // Note that received amount should be regular number and not as wei value, maybe change this
        ControllerInterface(Avatar(_avatar).owner()).mintReputation(_reputation * 10 ** 18, _auditor, _avatar);
    }

    /**
    * @dev Allows to get the reputation by address
    */
    function getReputationByAddress(address _avatar, address _address) public view returns(uint) {
        Reputation rp = Reputation(ControllerInterface(Avatar(_avatar).owner()).getNativeReputation(_avatar));
        return rp.reputationOf(_address);
    }

    function setParameters() public returns(bytes32) {
        return "";
    }

    function getParametersHash() public pure returns(bytes32) {
        return "";
    }

}
