In the following code we use client library to interact with Arc contracts and then query the subgraph to fetch DAOstack data.

## Setup

You can use development setup from [Alchemy Starter](https://github.com/daostack/DAOstack-Hackers-Kit/tree/master/alchemy-starter) or [Starter-template](https://github.com/daostack/DAOstack-Hackers-Kit/tree/master/starter-template)
 
## Example

### Import Client

```javascript
const client = require('@daostack/client')

const Arc = client.Arc
const DAO = client.DAO
const Proposal = client.Proposal
const utils = client.utils

let arc;
```

### Initialize Arc configuration

```javascript
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

}
```

### Add your private key 

While using Ganache, by default it will be set to `account[0]`

```
// Add your private key or you can use metamask web3Provider above
const account = arc.web3.eth.accounts.privateKeyToAccount(PRIVATE_KEY)
arc.web3.eth.accounts.wallet.add(account)
```

### Query All DAOs

```javascript
const showAllDAOs = () => {
  // we subscribe to the data needed to create resultant set i.e. DAO id in this case
  arc.daos().subscribe(
    (daos) => {
      console.log('Here are all the DAOS:')
      daos.map(dao => console.log(dao.id))
    }
  )
}
```

### Create Proposal

```javascript
const createProposal = async () => {
  // we get the first returned item from the obervable that returns a list of DAOs
  const daos = await arc.daos().first()

  // given the id of a DAO, we can also create a fresh DAO instance
  const dao = new DAO(daos[0].id, arc)


  // to create a proposal, we must first find the address of the Scheme in which to create the proposal
  const schemes = await dao.schemes({ where: { name: 'ContributionReward'}}).first()

  if (schemes.length === 0) {
    throw Error('Something went wrong - no ContributionReward scheme was registered with this DAO')
  }
  const schemeState = await schemes[0].state().first()

  console.log(`Creating new proposal
      in DAO: ${dao.id}
      for Scheme: ${schemeState.address}`)

  // Send Transaction to create new proposal
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
```

### Query Proposals

Query the subgraph to get Details of all the proposals

```javascript
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
```

### Vote on Proposal

This will only succeed if the proposal is still open for voting and the account has reputation in the respective DAO.
Replace the `id` below accordingly.

```
const voteOnProposal = async () => {
  const proposal = new Proposal('0xfa06e538a0ecb32c1cd1eaad2102a8104180b56b6f088fab298c1ce86f582b8e', arc)
  vote(IProposalOutcome.Pass).send()
}
```

### Query Votes

We will query all the voters for the first DAO

```javascript
const showAllVotes = async () => {
  const proposal = new client.Proposal('0xfa06e538a0ecb32c1cd1eaad2102a8104180b56b6f088fab298c1ce86f582b8e', arc)
  proposal.votes({}, { fetchAllData: true }).subscribe(
    async (votes) => {
      for (let vote of votes) {
        vote.state().subscribe(
          (vote) => {
            console.log(vote)
            console.log( `Vote id: ${vote.id}, voter: ${vote.voter}, proposal: ${proposal.id}`)
          })}})
}
```
