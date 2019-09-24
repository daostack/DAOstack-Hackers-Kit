Scheme is an action a DAO deployed with DAOstack can be enabled to take.

A scheme could be,

  - **Universal**: inherit from [UniversalSchemeInterface](https://github.com/daostack/arc/blob/master/contracts/universalSchemes/UniversalSchemeInterface.sol) and are supposed to be deployed once. Any DAO can register to a universal scheme to enable the functionality offered by them.

  OR

  - **Non Universal**: do not follow any standard and do not inherit from UniversalSchemeInterface. A non universal scheme has to be deployed for each DAO.

Arc repo have examples of some [Universal Scheme]("https://github.com/daostack/arc/tree/master/contracts/universalSchemes") and [Non Universal Scheme](https://github.com/daostack/arc/tree/master/contracts/schemes) developed by DAOstack team. Apart from the schemes already designed by DAOstack, you can also deploy your own Universal/Non-universal `Custom Schemes` and register them to the DAO.

This tutorial walks through adding a custom scheme to the new DAO and enable Alchemy to interact with it. Depending on your requirement all or maybe some parts of the tutorial might be useful

## Add Custom Scheme

To Enable DAO with some custom actions, you will have to work on multiple layers of the stack

  - **Arc**: Design and Deploy the scheme contract which has the action DAO will execute.
  - **Subgraph**: develop subgraph tracker for your scheme for faster/efficient read access
  - **Client**: enable DAOstack client library to `write` to your `scheme contract` and `read` scheme data from `subgraph` using graphQL
  - **Alchemy**: enable user friendly interface for your scheme in Alchemy

### Arc: Deploy Scheme Contract

  Decide whether the action your scheme provides is going to be `universal` or `non-universal`

  *Tutorial for adding non-universal* [skip]()

  Say you want to create a non-universal scheme that allow People to Buy reputation by donating money to the DAO and Quit at some later time by giving up reputation

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

### Subgraph: Cache for efficiency

  If you created a custom scheme or used any of the new arc scheme that are not yet tracked by subgraph, then you will have to make changes to DAOstack caching layer. 

  NOTE: You can skip this step if you do not wish to take advantage of caching layer for faster access and would rather read data directly from blockchain. But would recommend not to.

  1. Clone subgraph repo, if you have not already

        git clone git@github.com:daostack/subgraph.git
  
  2. Create a new directory with your `contract-name`

        cd subgraph
        mkdir src/mappings/MyContractName

  3. Add to the `src`:

#### Add Mapping Code: describe how blockchain events are processed and stored in your database
  - `src/mappings/MyContractName/mapping.ts`

#### Add GraphQL schema: describe the various entities/objects your graph would have
  - `src/mappings/MyContractName/schema.graphql`

#### Add yaml fragment: describe 
  - `src/mappings/MyContractName/datasource.yaml`

        1. `abis`:  optional - list of contract names that are required by the mapping.
        2. [entities](https://github.com/graphprotocol/graph-node/blob/master/docs/subgraph-manifest.md#1521-ethereum-events-mapping): list of entities that are written by the the mapping.
        3. [`eventHandlers`](https://github.com/graphprotocol/graph-node/blob/master/docs/subgraph-manifest.md#1522-eventhandler): map of solidity event signatures to event handlers in mapping code.

      NOTE: types are generated during the build step based on the entities described in schema.graphQL. Import these types while writing handlers in `mapping.ts`
  4. integration test (optional): `test/integration/MyContractName.spec.ts`


  5. Add your contract to `ops/mappings.json`. Under the JSON object for the network your contract is located at, under the `"mappings"` JSON array, add the following.

    1. If your contract information is in the `migration.json` file specified (default is the file under `@daostack/migration` folder, as defined in the `ops/settings.js` file)

            {
               "name": "<contract name as appears in `abis/arcVersion` folder>",
               "contractName": "<contract name as appears in migration.json file>",
               "dao": "<section label where contract is defined in migration.json file (base/ dao/ test/ organs)>",
               "mapping": "<contract name from step 2>",
               "arcVersion": "<contract arc version>"
            },

    2. If your contract does not appear in the migration file:

            {
               "name": "<contract name as appears in `abis/arcVersion` folder>",
               "dao": "address",
               "mapping": "<MyContractName>",
               "arcVersion": "<contract arc version under which the abi is located in the `abis` folder>",
               "address": "<the contract address>"
            },

  6. (Optionally) add a deployment step for your contract in `ops/migrate.js` that will run before testing.


