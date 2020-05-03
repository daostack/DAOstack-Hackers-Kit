# Frequently Asked Questions

## New DAO

#### How do I deploy a new DAO?

The easiest way to launch a DAO is using [DAOcreator](https://dorg.tech/#/dao-creator) - an interactive tool created by [dOrg](https://dorg.tech/#/) to deploy your new DAO.

Know about the project, get help from our team to customise your DAO and get started on Alchemy[here](https://daostack.io/alchemy)

Another alternative to deploy a DAO could be via command line, This give you access to advanced features like - adding custom schemes and global constraints. Refer to our [starter-template example](https://github.com/daostack/DAOstack-Hackers-Kit/tree/master/starter-template) or the [custom scheme tutorial](https://daostack.github.io/DAOstack-Hackers-Kit/gettingStarted/customScheme/intro/) for details.

#### I have deployed a DAO, what next?

Once you have deployed your DAO you would want to do one of the following

  - [Get it shown in Alchemy](#get-it-shown-in-alchemy)
  - [Create a new dApp interface](#create-a-new-dapp-interface)

##### Get it shown in Alchemy

In order to get your app added to Alchemy, you will need to get it *registered with DAOregistry* and *indexed by DAOstack subgraph*.

Since the process has not been automated yet, we would suggest you to submit PR to the [DAOstack subgraph repo](https://github.com/daostack/subgraph/) by adding the output of the deployment process ( `json` object ) in [this](https://github.com/daostack/subgraph/tree/master/daos/mainnet) folder.

Alternatively, you can DM the output to **Shiv (telegram: @shivgupt)**, *Open Source Developer Relations Coordinator*, who can then submit PR on your behalf.


##### Create a new dApp interface

You can use [starter-template](https://github.com/daostack/DAOstack-Hackers-Kit/tree/master/starter-template) example in [DAOstack Hacker-kit](https://github.com/daostack/DAOstack-Hackers-Kit/) as the starting point. The example provides a basic react-app and setup a dev environment will core layers of DAOstack.

## Developer Onboard

#### Which layer of stack can I work/contribute?

While contributions are welcome for all layers of the stack, we suggest the first time contributors to start at the dApp layer i.e. Alchemy. Checkout [dev setup guide for Alchemy](https://daostack.github.io/DAOstack-Hackers-Kit/gettingStarted/setupAlchemyDevMode/)

Please refer to our Stack guide on [Developer's Portal](https://daostack.github.io/DAOstack-Hackers-Kit/) for details on when to work on each layer.

#### I want to contribute but don't know where to get started?

Onboarding on any new project can be a daunting process.

Please checkout the intro to the various layers of the [DAOstack's Stack](https://daostack.github.io/DAOstack-Hackers-Kit/).

For the first time contributors we suggest any of the following

  - [Add feature to Alchemy Interface](https://daostack.github.io/DAOstack-Hackers-Kit/gettingStarted/setupAlchemyDevMode/)
  - [Create new interface with Starter template](https://github.com/daostack/DAOstack-Hackers-Kit/tree/master/starter-template)

Once you are more familiar with the stack you may want to play with and add to various layers of the stack and might find the following guides useful

  - [Add custom scheme to the DAO ](https://daostack.github.io/DAOstack-Hackers-Kit/gettingStarted/customScheme/intro/)
  - [Alchemy starter template](https://github.com/daostack/DAOstack-Hackers-Kit/tree/master/alchemy-starter)

#### Can DAOstack fund me for my contribution?

All external contributions to the DAOstack are funded by **GenesisDAO** and must be passed by the Genesis members.

[GenesisDAO](https://alchemy.daostack.io/dao/0x294f999356ed03347c7a23bcbcf8d33fa41dc830) is the DAO designed to be the inheritor of the DAOstack treasury, and the entity tasked on steering the GEN token economy and use.

Please, checkout our [Ecosystem repo](https://github.com/daostack/ecosystem#daostack-collaboration) and refer to the `proposals for grants` section for details.

## I still have questions

#### Where do I post queries ?

If you still have questions, please feel free to post queries on [DAO Research and Dev](https://t.me/joinchat/ICRVPUzd7gZ-AHnJZLfdhg) channel and **tag @shivgupt** (our Open Source Developer Relations Coordinator)


#### Whom do I contact for technical help or for discussing integrations?

For more one-one technical help and queries DM Shiv on *telegram: @shivgupt*
