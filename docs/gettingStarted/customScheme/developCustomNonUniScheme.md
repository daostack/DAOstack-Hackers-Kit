  *Tutorial for adding non-universal scheme*
  
  Here is a simple non-universal scheme that allow People to Buy reputation by donating money to the DAO and if their goals no more align with the DAO, have the ability to Quit at some later time by giving up reputation

## Design Principle
  Need Oren's input here

## Sample Scheme Code

   [skip this section](../developCustomUniScheme)

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
