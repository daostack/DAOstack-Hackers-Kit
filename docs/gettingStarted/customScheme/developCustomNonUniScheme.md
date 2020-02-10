  *Tutorial for adding non-universal scheme* [skip](../developCustomUniScheme)

## Design Principle

*Non-Universal* scheme is more **simple** than a universal one, since it serves a single DAO (avatar)

It is possible to attach multiple instances of non-universal scheme to a single DAO (avatar), 

For eg. In case of GenericScheme we attach an instance per external contract that the DAO can interact to.

Recommended design principle :

  - should include a one time called public initialize function which gets the avatar as its first parameters (This will assist with the common migration process)

## Example
  You can refer to the non-universal schemes developed by the DAOstack team [here](https://github.com/daostack/arc/tree/master/contracts/schemes)

  Following is another non-universal scheme example that we will also use in subgraph and client part of this tutorial.
    
  *BuyInWithRageQuitOpt*: A non-universal scheme to allow people to *buy reputation* by donating money to the DAO and if their goals no more align with the DAO, have the ability to *quit reputation* at some later time and receive propotional funds back.

```solidity
import "@daostack/arc/contracts/controller/ControllerInterface.sol";

/**
 * @title BuyIn
 * @dev A scheme for buying in reputation in the DAO with option to rage quit
 */

contract BuyInWithRageQuitOpt{
  using SafeMath for uint256;

  event buyIn(address indexed _avatar, address indexed _member, uint256 _amount, uint256 _rep);
  event rageQuit(address indexed _avatar, address indexed _member, uint256 _amount, uint256 _rep);

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

    // Mint Equivalent Rep to the buyer
    require(ControllerInterface(avatar.owner()).mintReputation(msg.value, msg.sender, address(avatar)), "mint reputation should succeed");

    emit buyIn(address(avatar), msg.sender, msg.value, msg.value);
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

    emit rageQuit(address(avatar), msg.sender, amount, rep);
    return rep;
  }
}
```
