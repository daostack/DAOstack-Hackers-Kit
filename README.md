<img src="./daostack-hk.png">

# Table of contents

<!--ts-->

- [Introduction](#introduction)
- [The Stack](#the-stack)
  - [Infra](#infra)
  - [Arc](#arc)
  - [Arc.js](#arcjs)
  - [Dapps](#dapps)
  - [DAOs](#daos)
- [Examples](#examples)
- [Contact and Help](#contact-and-help)
  <!--te-->

# Introduction

Welcome to the DAOstack Hackers Kit! This repository was created to help you get started building on the DAOstack platform.

[DAOstack](https://daostack.io) is a software stack for building Dapps (decentralized apps), DAOs (Decentralized Autonomous Organizations), and DAO tools.

The DAO stack provides all infrastructure needed to build such projects, including: 
 - [Infra](https://github.com/daostack/infra), an Ethereum library of fundamental decentralized decision-making components 
 - [Arc](https://github.com/daostack/arc), an Ethereum library containing everything needed to deploy DAOs
 - [Arc.js](https://github.com/daostack/arc.js), a JavaScript framework for interacting with Arc smart contracts 
 - [Alchemy](https://alchemy.daostack.io/) and other collaborative Dapps for end users to interact with
 - [Genesis](https://alchemy.daostack.io/), DAOstack's own community DAO, which exists to help promote and fund the DAO ecosystem

Here in the Hackers Kit you can find examples and details on how to use the DAO stack as well as links to documentation and other helpful resources. This repo, as well as code from any other [DAOstack repo](https://www.github.com/daostack), may be used to build your own ideas and applications.

If you need a more general primer on the DAOstack project, read [here](https://medium.com/daostack/an-explanation-of-daostack-in-fairly-simple-terms-d0e034739c5a) before continuing.

# The Stack

## [Infra](https://github.com/daostack/infra)

**Infra is a Solidity smart contract library containing the core building blocks of decentralized governance.** Infra contracts can be integrated into any application regardless of its architecture.

Infra has two main components:

- **Voting Machines** - A voting machine is a universal contract which can operate the voting process for any organization. Each voting machine follows its own predifined rules for the decision making and execution process. Rules for voting machines can be implemented for any voting process, from a simple protocol like an "Absolute Vote" (where 51% of the voting power should approve it in order for the decision to pass), or more sophisticated protocols like the [Holographic Consensus](https://www.youtube.com/watch?v=1De0MoStSkY) voting protocol.

- **Voting Rights Management** - A voting rights management system determines how voting rights are distributed. Any voting rights management system must have "balances" which represents the voting power each participant holds. There are 2 main approaches for managing voting rights: token-based voting and reputation-based voting. The main technical difference between the two is that tokens are transferable (i.e. tradable) while reputation is non-transferable. Another big difference which may appear (depending on implementation) is that a token is a property which cannot be taken while reputation may be redistributed by the organization itself. For most cases, we reccomend using the reputation-based voting model, however, Infra allows any voting right management system to be built.

### Should I work at this level?

Build on Infra if you need new or modified decentralized governance primitives, such as voting machines and voting rights management systems.

## [Arc](https://github.com/daostack/arc)

**Arc is a Solidity smart contract library for building DAOs.** To get a good understanding of how the Arc framework is built, you can go to [this blog post](https://medium.com/daostack/the-arc-platform-2353229a32fc). Arc uses Infra to provide decentralized organizations with voting machines and voting rights management systems.

DAOs built with Arc have a few basic contract components:

- **Avatar** - The DAO's "account." This contract represents the address of the DAO and holds its assets.
- **Reputation** - Voting in Arc is done mainly using Reputation. Reputation can be distributed and redistributed only by DAO decision, and it is generally given (via vote) to an agent according to their performance and contribution to a DAO.
- Token - Each DAO may have its own token, which can be used in any way the DAO would like.
- **Controller** - The controller is the "Access Control" of the DAO, managing who can interact with which DAO functions and enforcing the DAO's constraints.
- **Schemes** - Schemes are a DAO's "actions": anything a DAO should act upon needs to be written and authorized by the controller as a scheme. Schemes might be used to help a DAO: propose and make investments, give reputation to agents, upgrade the DAO's contracts, register new schemes and constraints, etc.
- **Global Constraints** - Global constraints are limitations on a DAO's actions. When executing a scheme, the controller checks the constraints to see if the action violates them, and blocks the execution if it does. Some examples for constraints might be: the token supply can't be increased over 1M tokens, the organization won't use more than 60% of its funds at once, etc.

**Arc utilizes the concept of "Universal" contracts**: contracts which are deployed once, and then can be used by any number of DAOs simultaneously, saving gas and deployment costs. Schemes and constraints can both be used in this way. To use the already deployed contracts, you can either use Arc.js, which maintains easy access to all universal Arc contracts, or you can use [this table](https://docs.google.com/spreadsheets/d/1hfR-fnnqXEn3Go3x3qoiXJcKSIAYQalSOi52vV2PCTA/edit?usp=sharing) to view the addresses of the universal contracts on the mainnet, Kovan, and Ganache\*
All contracts listed on the table are universal, meaning that users should use them when needed and not redeploy them.

_\* Please note that the Ganache addresses are based on the DAOstack commands for running and deploying Arc to a local Ganache network, which means those addresses might change if you are using a different method to run Ganache or deploy Arc._

### Should I work at this level?

Using Arc is not necessary to deploy a DAO (you can do this with Arc.js currently and in the future as an end user of Dapps), but you might want to work on this layer if you need your DAO to have a unique action, constraint, or voting process that is not yet implemented on Arc.

You can find the complete Arc docs here: [https://daostack.github.io/arc](https://daostack.github.io/arc)

## [Arc.js](https://github.com/daostack/arc.js)

**Arc.js is a JavaScript library that facilitates access to Arc contracts without having to directly interact with the Ethereum blockchain.** Much like the Web3.js library serves as the connection for JavaScript/TypeScript developers to the Ethereum network, the Arc.js library connects Arc with scripts, applications, DAO interfaces, or any other program that knows how to work with JavaScript/TypeScript coming from an NPM module in ES6 CommonJs module format.

Using Arc.js, JavaScript/TypeScript developers can easily write scripts or applications which can deploy DAOs, interact with existing DAOs, submit proposals to DAOs, vote and stake on proposals, execute the resulting decisions, manage agent reputations, and basically do anything a DAO is capable of doing.

Should you chose to leverage Arc.js in your application, you can find helpful documentation in the [complete Arc.js documentation](https://daostack.github.io/arc.js/).

Should you choose to develop inside Arc.js itself, you can find helpful information in the [documentation for Arc.js developers](https://github.com/daostack/arc.js/blob/devDocs/docs/DeveloperDocs.md).

You can find NodeJs scripts that use Arc.js to perform a variety of functions in the [Arc.js-scripts Github repository](https://github.com/daostack/arc.js-scripts).

### Should I work at this level?

You should use Arc.js whenever you want to use JavaScript or TypeScript to interact with Arc contracts. This is particularly helpful for developers who want to get the advantages of decentralized governance on the blockchain without dealing directly with a smart contract language.

## Dapps

The Arc.js framework facilitates development of "Dapps" (Decentralized applications) for interacting with DAOs.

**DAOstack has built its own Dapp called [Alchemy](https://alchemy.daostack.io/), a front-end interface for DAOs**, or more specifically, for budget management in decentralized organizations. Alchemy allows end users to make collaborative budgeting decisions and allocations using the [Holographic Consensus protocol](https://www.youtube.com/watch?v=1De0MoStSkY&feature=youtu.be&t=11m50s).

You can find the Alchemy repo at [github.com/daostack/alchemy](https://github.com/daostack/alchemy).

A second Dapp built by DAOstack is [Vanille](http://daostack.azurewebsites.net) (enable MetaMask). Vanille is a direct interface for the Arc.js framework, enabling users to create and interact with DAOs before moving to a dedicated interface like Alchemy.

You can find the Vanille repo here: [https://github.com/daostack/vanille](https://github.com/daostack/vanille).

### Should I work at this level?

Build at the Dapp level if you want to create new ways to interact with existing DAOs and DAOstack smart contracts, e.g. a multi-DAO explorer for GEN predictors or a new DAO creation app.

## DAOs

**DAOs can be created for any conceivable collaborative purpose, from local political action to distributed manufacturing and sales.** The goal of DAOstack is to make it as easy as possible to create and manage DAOs, and to use them to drive a new decentralized global economy (specifically, an economy that uses [GEN, our collective attention token](https://medium.com/daostack/on-the-utility-of-the-gen-token-eb4f341d770e)).

**DAOstack Technologies has created an initial DAO called "Genesis" with the purpose of promoting the GEN/DAO ecosystem.** Genesis is currently live on the Ethereum mainnet, has over 100 Reputation-holders who have executed over 120 proposals since August 2018, and can be accessed through ["Alchemy"](https://alchemy.daostack.io/).

# Examples
The hackers kit is equipped with several examples and sample projects, which we are working to maintain and expand. The goal for these examples is to help developers easily kickstart a new project, as well as to demonstrate some of the features included in each layer of the DAO stack.

## [Starter Template](https://github.com/daostack/DAOstack-Hackers-Kit/tree/master/starter-template)
This is a basic template you can use for kickstarting your project using the DAOstack platform. Here you can find the basic structue for using both Arc and Arc.js to build your project.

## [Peep DAO](https://github.com/daostack/DAOstack-Hackers-Kit/tree/master/peepeth-dao-example)
This project is a Dapp for interacting with a DAO which has its own DAO social media account on [Peepeth](Peepeth.com), a decentralized microblogging app. The Dapp allows a DAO post Peeps via a decentralized voting mechanism.

## [DutchX DAO Bootstrap](https://github.com/daostack/DAOstack-Hackers-Kit/tree/master/dutchx-bootstrap)
This project contains a minimal UI for participating in the bootstrap of the DutchX DAO.
The bootstrapping process for a DAO is the process of distributing its initial reputation and tokens. The DutchX bootstrap process is a 3 months period during which users can do several actions, like locking tokens, in order to receive Reputation in the DutchX DAO.
You can view the DutchX DAO bootstrapping contracts [here](https://github.com/daostack/arc/tree/master/contracts/schemes).

## [Firestarter DAO Example](https://github.com/daostack/DAOstack-Hackers-Kit/tree/master/firestarter-example)
Firestarter is a community driven crowdsourcing platform, which utilizes DaoStack for governance of the projects.
This is a striped down version of the project, which only showcases the DaoStack integration.

# Contact and Help

DAOstack team members and open-source community members always make an effort to assist new projects.
For any technical questions, please reach out to us via Discord [at this link](https://discord.gg/cHZ8Ha9).
If you have any questions or comments about this repository, please open an issue, and we'll do our best to help.
