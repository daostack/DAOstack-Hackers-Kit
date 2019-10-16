Scheme is an action a DAO on DAOstack platform can be enabled to take. Schemes might be used to help a DAO: propose and make investments, give reputation to agents, upgrade the DAO's contracts, register new schemes and constraints, etc.

Apart from the schemes already designed by DAOstack team - [Arc](https://github.com/daostack/arc/tree/master/contracts/), you can also deploy your own `Custom Schemes` and register them to the DAO.

A scheme could be,

  - **Universal**: inherit from [UniversalSchemeInterface](https://github.com/daostack/arc/blob/master/contracts/universalSchemes/UniversalSchemeInterface.sol) and are designed to be deployed once and any DAO can register to a universal scheme to enable the functionality offered by them.

  OR

  - **Non Universal**: do not follow any standard and do not inherit from UniversalSchemeInterface. A non universal scheme has to be deployed for each DAO separately.

## Which layer to customize

To Enable DAO with some custom actions, you will have to work on multiple layers of the stack

  - **Arc**: Design and Deploy the scheme contract which has the action DAO will execute.
  - **Migration**: deploy + register custom scheme to new DAO using migration script or deploy independently and register via another Scheme
  - **Subgraph**: develop subgraph tracker for your scheme for faster/efficient read access
  - **Client**: enable DAOstack client library to `write` to your `scheme contract` and `read` scheme data from `subgraph` using graphQL
  - **Alchemy**: enable user friendly interface for your scheme in Alchemy

## Tutorial
  
In following section we will see some sample code for adding a custom scheme to the DAO and enable Alchemy to interact with it.
We will be using [Alchemy-starter](https://github.com/daostack/DAOstack-Hackers-Kit/tree/master/alchemy-starter) for this tutorial

If you have not cloned the *DAOstack Hacker kit repo*, then clone it recursively to get the submodules

    git clone --recursive git@github.com:daostack/DAOstack-Hackers-Kit.git

If you have already cloned the *DAOstack Hackers kit repo*, then make sure you have the latest submodules too

    git submodule update --init

Depending on your requirements all or some parts of the tutorial might be useful for you.

### Pre Work

    cd alchemy-starter
    npm i
    npm run launch:docker 

### Add scheme contract and deploy

Follow tutorial for [Universal Scheme](../developCustomUniScheme/) or [Non-Universal Scheme](../developCustomNonUniScheme/)
  
Deploy with [New DAO](../registerToNewDAO)
        
    npm run migrate

OR

Deploy and register to [Existing DAO](../registerToExistingDAO/)

### Update subgraph and deploy

Make changes to subgraph refer [Update subgraph](../subgraphForNewScheme/) tutorial and deploy graph

    npm run deploy:graph

### Update client and build

Update client to interact with your scheme, refer [Update client](../clientForNewScheme/) tutorial

    npm run build:client
    npm run link:client

To develop on the client in tandem with alchemy, start watcher

    npm run watch:client

### Update alchemy

Add front-end support for you scheme, refer to [Update alchemy](../alchemyIntegrationForNewScheme/) tutorial for some basics

Launch alchemy in dev mode

    npm run start:alchemy
