pragma solidity ^0.5.0;

contract IFireStarter {
    function getBalance(uint _id) public view returns(uint);
    function userFundedProject(uint _projectId, address _user) public view returns(uint);
    function withdraw(uint _projectId, uint _ethBalance, string memory _message) public;
}