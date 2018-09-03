pragma solidity ^0.4.24;


interface PeepethInterface {
    function createAccount(bytes16 _name, string _ipfsHash) external;
    function post(string _ipfsHash) external;
}
