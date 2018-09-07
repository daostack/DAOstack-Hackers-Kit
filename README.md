<img src="./daostack-hk.png">

# Introduction

Welcome to the DAOstack Hackers Kit! You can find all the resources you need to build DAOs using the DAOstack framework in this repository.

# Table of contents

<!--ts-->

- [Introduction](#introduction)
- [Table of contents](#table-of-contents)
- [Getting Started](#getting-started)
- [The Stack](#the-stack)
  - [Arc](#arc)
  - [Arc.js](#arcjs)
  - [Collaborative Dapps](#collaborative-dapps)
  - [DAOs](#daos)
- [Contact and Help](#contact-and-help)
  <!--te-->

#### TL;DR

This repository was created to help you get started with the DAOstack platform and use it to build your own projects.
[DAOstack](https://daostack.io) is a multi-layered platform for building DAOs and Collaborative Dapps.
Our platform provides all needed infrastructure including Ethereum smart contracts library named Arc, a JavaScript framework named Arc.js and collaborative Dapps like [Alchemy](https://alchemy.daostack.io/).
Here you can find examples and details on how to use DAOstack as well as links to documentation and other helpful resources.

# Getting Started

This repository includes multiple examples for DAOs, which shows how to use the different layers and build utilizing the stack. You can use any of the examples or here or any other repository of DAOstack to build your own ideas and applications. We have also created here a template for starting a new project which you can find under the starter-template folder.

# The Stack

The DAOstack stack components:

## [Arc](https://github.com/daostack/arc)

The Arc framework is a smart contracts library for building DAOs written in Solidity. To get a good understanding of how the Arc framework is built you can go to [this blog post](https://medium.com/daostack/the-arc-platform-2353229a32fc).
Arc's architecture is built on a few building blocks:

- Avatar - The "account" of the DAO. This contract represents the address of the DAO and holds its assets.
- Reputation - Voting in Arc is done mainly by using reputation. Reputation is non-transferable, reductable and is given to an agent according to his performance and contribution to the DAO.
- Token - Each DAO may have its own token, which can be used in any way the DAO would like.
- Controller - The controller is the "Access Control" of the DAO, managing who can interact with which functionality in the DAO and enforces the DAO's constraints.
- Schemes - Schemes are the "actions" in the DAO, anything the DAO should act upon needs to be written and authorized by the controller as scheme. Some schemes are called "Universal Schemes", these are schemes which multiple DAOs can subscribe to and interact with at the same time, saving the deployment costs and reusing code. A scheme might be used for example to: propose and make investments, give reputation to agents, upgrade the DAO's contracts and register new schemes and constraints.
- Global Constraints - The constraints are the limitations a DAO has on its actions. When executing a scheme, the controller checks the constraints to see if the action violates them, and block the execution if so. Global constraints have the same idea of Universal Schemes, it's possible for multiple DAOs to use the same contract as a constraint. Some examples for constraints might be: the token supply can't be increased over 1M tokens, the organization won't use more than 60% of its funds at once etc.
- Voting Machines - Votings on a DAO's decisions is done using "Voting Machines". These contracts are used to start, manage, and trigger the execution of a decision of a voting in a DAO. These are contracts which follow the same pattern as Universal Schemes and Global Constraints. Voting Machines can have many different properties and decision-making processes, and like schemes and constraints, you can use one of the existing Voting Machines right out of the box or you can create your own by implementing the interface.

Using the Arc framework, you have access to the base layer of the stack allowing you to create any complex functionalities for your DAOs with little effort.

### Should I work at this level?

While for most of the DAOs, there is no need to work directly with the Arc framework nor with Solidity code, you might want to work on this layer if you need your DAO to have a unique action, constraint or voting process which were not implemented on Arc yet.

You can find the complete Arc docs here: [https://daostack.github.io/arc](https://daostack.github.io/arc)

## [Arc.js](https://github.com/daostack/arc.js)

Arc.js is a JavaScript library that facilitates JavaScript application access to the Arc contracts. Much like the Web3.js library serves as the connection for JavaScript/TypeScript developers to the Ethereum network, the Arc.js library is used as the connecting layer between Arc and applications including scripts, collaborative Dapps and DAO interfaces, specifically for your DAO or in interaction with multiple DAOs -- more broadly, any application that knows how to work with JavaScript/TypeScript coming from an NPM module in ES6 CommonJs module format.

Using Arc.js, JavaScript/TypeScript developers can easily write scripts or applications which can deploy DAOs, interact with existing DAOs, submit proposals to DAOs, vote and stake on proposals, execute the resulting decisions, manage agent reputations and basically do anything of which a DAO is capable.

Should you chose to leverage Arc.js in your application, you can find helpful documentation in the [complete Arc.js documentation](https://daostack.github.io/arc.js/).

Should you choose to develop inside Arc.js itself, you can find helpful information in the [documentation for Arc.js developers](https://github.com/daostack/arc.js/blob/devDocs/docs/DeveloperDocs.md).

You can find NodeJs scripts that use Arc.js to perform a variety of functions in the [Arc.js-scripts Github repository](https://github.com/daostack/arc.js-scripts).

### Should I work at this level?

You should use Arc.js whenever you want to use JavaScript or TypeScript to interact with Arc contracts and obtain other functionality particularly helpful to interactive Dapps that leverage Arc.

## Collaborative Dapps

The Arc.js framework facilitates development of "Collaborative Dapps" (Decentralized applications) that enable collaboration within and across DAOs.
DAOstack has built its own collaborative Dapp called ["Alchemy"](https://alchemy.daostack.io/). The Alchemy Dapp is a collaborative Dapp for budget management in decentralized organizations. Alchemy can be used by any DAO willing to operate on the basis of fund management.

You can find the Alchemy repo here: [https://github.com/daostack/alchemy](https://github.com/daostack/alchemy)

Another Dapp created by the DAOstack team is called ["Vanille"](http://daostack.azurewebsites.net). Vanille is like a direct interface to the Arc.js framework, enabling you to create and interact with DAOs before creating a dedicated interface for them.

You can find the Vanille repo here: [https://github.com/daostack/vanille](https://github.com/daostack/vanille)

## DAOs

The Collaborative Dapps can be used to deploy new DAOs and interact with existing ones. DAOs can be used for many purposes, with the common goal of creating decentralized global collaboration and collective intelligence. The goal of DAOstack is to make it as easy as possible to create and manage DAOs and use them to drive the new decentralized global economy.
DAOstack has its own DAO called the Genesis DAO. We use Alchemy to manage and interact with the DAO, which can be seen through ["Alchemy"](https://alchemy.daostack.io/) and is live on the Ethereum mainnet! The Genesis DAO is a fund management DAO utilizing the Holographic Consensus voting mechanism, which is DAOstack's solution for scaling the decision-making capabilities of a DAO indefinitely, allowing smarter and more accurate use of the collective attention of a DAO's agents. [Here](https://www.youtube.com/watch?v=1De0MoStSkY) is a video of Matan Field, DAOstack's CEO, explaining the concept of Holographic Consensus and the game theory which it is based upon.
The Arc framework has a built-in support for the Holographic Consensus voting, which is called the Genesis Protocol, which allows you to utilize this concept immediately with your own DAO.

# Contact and Help

The DAOstack team members will be available to assist you with your projects in the Hackathon.
For any technical questions please reach out to us at the event or via Discord [at this link](https://discord.gg/WCYEvGA).
If you have any questions or comments about this repository please open an issue and we'll do our best to help.
