pragma solidity 0.5.13;

interface PeepethInterface {
    function createAccount(bytes16 _name, string calldata _ipfsHash) external;
    function post(string calldata _ipfsHash) external;
}
