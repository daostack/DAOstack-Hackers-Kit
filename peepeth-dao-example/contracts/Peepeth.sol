// Note: this is not the original Peepeth contract
// This is just a mock to provide some conntract to use when deploying on Ganache
pragma solidity ^0.4.24;


contract Peepeth {
    event AccountCreated(bytes16 _name, string _ipfsHash);
    event PeepPosted(string _ipfsHash);

    function createAccount(bytes16 _name, string _ipfsHash) public returns (bool) {
        emit AccountCreated(_name, _ipfsHash);
        return true;
    }

    function post(string _ipfsHash) public returns (bool) {
        emit PeepPosted(_ipfsHash);
        return true;
    }
}