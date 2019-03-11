pragma solidity ^0.5.0;

import "./IFireStarter.sol";
import "./VotingMachineCallback.sol";

contract FireStarter is IFireStarter {

    struct Project {
        address owner;
        string name;
        uint funds;
        address votingMachineCallback;
        mapping (address => uint) balances;
	}

    Project[] public projects;

    event ProjectCreated(uint indexed id, string name, address indexed owner);
	event ProjectFunded(uint indexed id, uint amount, address from);
	event ProjectWithdraw(uint indexed id, uint ethAmount, string message);

    function createProject(string memory _name) public {
        Project memory project;
		project.owner = msg.sender;
		project.name = _name;
		project.votingMachineCallback = address(new VotingMachineCallback(totalProjects()));

		projects.push(project);

		emit ProjectCreated(projects.length-1, _name, msg.sender);
    }

    function supportProject(uint _id) public payable {
        projects[_id].funds += msg.value;
        projects[_id].balances[msg.sender] += msg.value;

		emit ProjectFunded(_id, msg.value, msg.sender);
    }

    function getBalance(uint _id) public view returns(uint) {
        return projects[_id].funds;
    }

    function userFundedProject(uint _id, address _user) public view returns(uint) {
        return projects[_id].balances[_user];
    }

    function withdraw(uint _id, uint _ethBalance, string memory _message) public {
        Project memory project = projects[_id];

        require(project.owner == msg.sender || project.votingMachineCallback == msg.sender);
        require(_ethBalance <= project.funds);

        if (_ethBalance > 0) {
            msg.sender.transfer(_ethBalance);
            projects[_id].funds -= _ethBalance;
        }

        emit ProjectWithdraw(_id, _ethBalance, _message);
    }

    function totalProjects() public view returns(uint) {
		return projects.length;
	}
}