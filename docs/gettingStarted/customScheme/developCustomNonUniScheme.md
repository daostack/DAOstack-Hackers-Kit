  *Tutorial for adding non-universal scheme* [skip](../developCustomUniScheme)

## Design Principle

*Non-Universal* scheme is more **simple** than a universal one, since it serves a single DAO (avatar)

It is possible to attach multiple instances of non-universal scheme to a single DAO (avatar), 

For eg. In case of GenericScheme we attach an instance per external contract that the DAO can interact to.

Recommended design principle :

  - should include a one time called public initialize function which gets the avatar as its first parameters (This will assist with the common migration process)

## Setup

- We will use *Alchemy-starter* for this tutorial, enter the directory and install starter-package
  
        cd alchemy-starter/
        npm i

- Add your custom scheme contract to `contracts` folder.

    Refer to example [*BuyInWithRageQuitOpt.sol*](https://github.com/daostack/DAOstack-Hackers-Kit/blob/master/alchemy-starter/contracts/BuyInWithRageQuitOpt.sol): A non-universal scheme to allow people to *buy reputation* by donating money to the DAO and if their goals no more align with the DAO, have the ability to *quit reputation* at some later time and receive propotional funds back.

- Compile your contracts

        npm run compile
