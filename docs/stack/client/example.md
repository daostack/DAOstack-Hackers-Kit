In the following code we use client library's Arc and DAO class to list all the DAOs and then create a new proposal in the first DAO.

## Example Setup

Run the DAOstack stack (ganache image with Arc contracts + test DAOs and graph node with DAOstack subgraph) to play with this example script locally.

  - Clone [DAOstack-Hackers-Kit](https://github.com/daostack/DAOstack-Hackers-Kit/)
      
      git clone git@github.com:daostack/DAOstack-Hackers-Kit.git
      cd DAOstack-Hackers-Kit/alchemy-starter
      npm i

  - Launch Ganache and GraphNode
    
      npm run launch:docker

  - Now create a `Demo` project folder and this file. Run the file using node
      
      npm install @daostack/client
      node demo.js

## Example Code

```js
const client = require('@daostack/client')

const Arc = client.Arc
const DAO = client.DAO
const utils = client.utils

let arc;

const initialize = async () => {
  // "Arc" is the main class that handles configuration and connections
  // to various services. Create an Arc instance with settings to connect
  // to the local docker images
  arc = new Arc({
    graphqlHttpProvider: 'http://127.0.0.1:8000/subgraphs/name/daostack',
    graphqlHttpMetaProvider: 'http://127.0.0.1:8000/subgraphs',
    graphqlWsProvider: 'http://127.0.0.1:8001/subgraphs/name/daostack',
    web3Provider: 'ws://127.0.0.1:8545',
    ipfsProvider: '/ip4/127.0.0.1/tcp/5001',
  })

  // we must provice Arc with some contract information.
  // We can use setContractInfos to set them manually, or
  // get this information from the subgraph
  await arc.fetchContractInfos()

  // Add your private key or you can use metamask web3Provider above
  const account = arc.web3.eth.accounts.privateKeyToAccount(PRIVATE_KEY)
  arc.web3.eth.accounts.wallet.add(account)
}

const showAllDAOs = () => {
  arc.daos().subscribe(
    (daos) => {
      console.log('Here are all the DAOS:')
      daos.map(dao => console.log(dao.id))
    }
  )
}

const createProposal = async () => {
  // we get the first returned item from the obervable that returns a list of DAOs
  const daos = await arc.daos().first()

  // given the id of a DAO, we can also create a fresh DAO instance
  const dao = new DAO(daos[0].id, arc)


  // to create a proposal, we must first find the address of the Scheme to create it in
  const schemes = await dao.schemes({ where: { name: 'ContributionReward'}}).first()

  if (schemes.length === 0) {
    throw Error('Something went wrong - no ContrsbutsonReward scheme was registered with this DAO')
  }
  const schemeState = await schemes[0].state().first()

  console.log(`Creating new proposal
      in DAO: ${dao.id}
      for Scheme: ${schemeState.address}`)

  await dao.createProposal({
    description: "This is a Sample proposal",
    title: "Sample Proposal",
    url: "http://localhost:3000",
    scheme: schemeState.address,
    beneficiary: "0x90F8bf6A479f320ead074411a4B0e7944Ea8c9C1",
    nativeTokenReward: "",
    reputationReward: utils.toWei('100'),
    ethReward: utils.toWei('1'),
    externalTokenReward: "",
    externalTokenAddress: "",
    periodLength: "",
    periods: ""
  }).send()

  console.log(`Tx Hash: ${minedTx.receipt.transactionHash}`)
}

const showProposalDetails = async () => {
  const daos = await arc.daos().first()
  const dao = new DAO(daos[0].id, arc)
  const proposals = dao.proposals({}, { fetchAllData: true }).subscribe(
    async (props) => {
      for (let prop of props) {
        prop.state().subscribe(
          (proposal) => console.log(proposal)
        )
      }
    })
}

const demo = async () => {
  initialize()
  console.log( 'calling show all DAOs')
  await showAllDAOs()
  console.log( 'creating new proposal in first DAO')
  await createProposal()
  console.log( 'calling show all proposals in first DAO')
  await showProposalDetails()
}

demo()
```
