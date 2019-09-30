  *Tutorial for adding non-universal scheme* [skip](../developCustomUniScheme)

  Here is a simple non-universal scheme that allow People to Buy reputation by donating money to the DAO and if their goals no more align with the DAO, have the ability to Quit at some later time by giving up reputation

## Design Principle
  TODO: Need Oren's input here

## Setup

- Once you are in *Alchemy-starter*, install starter-package and create `.env` file
  
        npm i
        DEFAULT_GAS=3.0
        PROVIDER='http://localhost:8545'
        PRIVATE_KEY='0x4f3edf983ac636a65a842ce7c78d9aa706d3b113bce9c46f30d7d21715b23b1d'

- Add your custom scheme contract to `contracts` folder. Refer [*BuyInWithRageQuitOpt.sol*](#example-buyinwithragequitoptsol)

        npm run compile
  
- Create `build/abis/<version-folder>` for your contracts' abi, this will be useful later in migration

    If you have *jq* tool installed you can use this command to extract abi

        cat build/contracts/BuyInWithRageQuitOpt.json | jq .abi >> build/abis/0.0.1-rc.27/BuyInWithRageQuitOpt.json

## Example: *BuyInWithRageQuitOpt.sol*

    // BuyInWRageQuitOpt.sol

    pragma solidity ^0.5.11;

    import "@daostack/arc/contracts/controller/ControllerInterface.sol";

    /**
     * @title BuyIn
     * @dev A scheme for buying in reputation in the DAO with option to rage quit
     * This is just an example for tutorial purpose, should not be used in production.
     */

    contract BuyInWithRageQuitOpt{
      using SafeMath for uint256;

      event buyIn(address indexed _member, uint256 _amount, uint256 _rep);
      event rageQuit(address indexed _member, uint256 _amount, uint256 _rep);

      Avatar public avatar;
      Reputation public reputation;

      function initialize(
        Avatar _avatar
      )
      external
      {
            require(avatar == Avatar(0), "can be called only one time");
            require(_avatar != Avatar(0), "avatar cannot be zero");
            avatar = _avatar;
            reputation = avatar.nativeReputation();
      }

      function deposit() payable external{
        // Transfer buy in amount to DAO
        require(address(avatar).send(msg.value));

        // Mint Equivallent Rep to the buyer
        require(ControllerInterface(avatar.owner()).mintReputation(msg.value, msg.sender, address(avatar)), "mint reputation should succeed");

        emit buyIn(msg.sender, msg.value, msg.value);
      }

      function quit() public returns(uint256){
        // Get current reputation of the quitter
        uint256 rep = reputation.balanceOfAt(msg.sender, block.number);

        require( rep > 0, "Only members can quit");


        // Calculate proportionate amount to refund to the quitter
        uint256 totalSupply = reputation.totalSupplyAt(block.number);
        uint256 amount = (address(avatar).balance).mul(rep).div(totalSupply);

        // burn reputation
        require(
          ControllerInterface(avatar.owner()).burnReputation(
            rep,
            msg.sender,
            address(avatar))
        );

        // transfer proportionate funds
        require(ControllerInterface(avatar.owner()).sendEther(
          amount,
          msg.sender,
          avatar)
        );

        emit rageQuit(msg.sender, amount, rep);
        return rep;
      }
    }
