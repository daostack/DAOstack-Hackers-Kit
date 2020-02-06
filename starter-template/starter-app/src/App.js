import React, { Component } from 'react';
import './App.css';
import {
  Arc,
  DAO,
  IProposalOutcome,
} from "@daostack/client";
import { ethers as eth } from 'ethers';
import {
  Button,
  Grid,
  Typography
} from '@material-ui/core';

const settings = {
  dev: {
    graphqlHttpProvider: "http://127.0.0.1:8000/subgraphs/name/daostack",
    graphqlWsProvider: "ws://127.0.0.1:8001/subgraphs/name/daostack",
    web3Provider: "ws://127.0.0.1:8545",
    ipfsProvider: "http://localhost:5001/api/v0",
  }, 
  testnet: {
    graphqlHttpProvider: "http://127.0.0.1:8000/subgraphs/name/daostack",
    graphqlWsProvider: "ws://127.0.0.1:8001/subgraphs/name/daostack",
    web3Provider: "testnet-url",
    ipfsProvider: "http://localhost:5001/api/v0",
  }
};

const getMetaMask = () => {
  const ethereum = (window).ethereum;
  return ethereum;
}

async function initializeArc() {
  const metamask = getMetaMask()
  // TODO: change dev - testnet or mainnet as per your project need
  if (metamask) settings.dev.web3Provider = metamask
  const arc = new Arc(settings.dev);
  await arc.fetchContractInfos();
  return arc;
}

class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
      arcIsInitialized: false,
      arc: null,
      dao: null,
      daos: null,
      proposals: [],
      proposalCreateOptionsCR: {
        description: "Please provide Sample proposal description",
        title: "Sample Proposal",
        url: "#",
        scheme: "",
        beneficiary: (window).ethereum.selectedAddress,
        nativeTokenReward: "",
        reputationReward: eth.utils.parseEther('100').toString(),
        ethReward: eth.utils.parseEther('1').toString(),
        externalTokenReward: "",
        externalTokenAddress: "",
        periodLength: "",
        periods: ""
      },
      stakeAmount: '100',
    }
    this.handleChange = this.handleChange.bind(this);
    this.handleCreateProposal = this.handleCreateProposal.bind(this);
    this.handleStake = this.handleStake.bind(this);
  }

  async componentWillMount() {
    const arc = await initializeArc()
    const daos = await arc.daos({where: {name: 'DevTest'}}).first()
    const dao = new DAO(daos[0].id, arc)
    const schemes = await dao.schemes({ where: { name: 'ContributionReward'}}).first()
    const schemeState = await schemes[0].state().first()
    this.handleChange({ target: {name: 'scheme', value: schemeState.address}})
    await dao.proposals().subscribe((proposals) => {
      this.setState({
        arcIsInitialized: true,
        arc,
        dao,
        daos,
        proposals
      })
    })
  }

  async handleCreateProposal(event){
    const { dao, proposalCreateOptionsCR } = this.state
    try {
      await dao.createProposal({
        ...proposalCreateOptionsCR,
        dao: dao.address
      }).send()
    } catch (e) {
      console.log("Error: ", e)
    }
  }

  handleChange(event) {
    let proposalCreateOptionsCR = { ...this.state.proposalCreateOptionsCR}
    proposalCreateOptionsCR[event.target.name] = event.target.value
    this.setState({proposalCreateOptionsCR})
  }

  async handleStake(proposal, outcome) {
    const stakingToken = await proposal.stakingToken()
    const amount = eth.utils.parseEther(this.state.stakeAmount)
    try {
      const votingMachine = await proposal.votingMachine()
      await stakingToken.approveForStaking(votingMachine.options.address, amount).send()
      proposal.stake(outcome, amount).send() 
    } catch (e) {
      console.log(e)
    }
  }

  async handleRedeem(proposal) {
    proposal.state().subscribe((state) => proposal.claimRewards(state.beneficiary).send())
  }

  render() {
    if (!this.state.arcIsInitialized) return (<div> Loading </div>)
    return (
      <div className="App">
        <header className="App-header">
          DAO: {this.state.dao.id}
          <hr />
          Proposals
          <hr />
          <div>
            <Grid container>
              {
                this.state.proposals.map( (proposal) => {
                  return (
                    <Grid container>
                      <Grid item xs={7}>
                        <Typography variant="body1">
                          {proposal.id}
                        </Typography>
                      </Grid>
                      <Grid item xs={1}>
                        <Typography variant="body1">
                          <Button color="primary" onClick={() => { proposal.vote(IProposalOutcome.Pass).send() } }>
                            Vote up
                          </Button>
                        </Typography>
                      </Grid>
                      <Grid item xs={1}>
                        <Typography variant="body1">
                          <Button color="primary" onClick={() => { proposal.vote(IProposalOutcome.Fail).send() } }>
                            Vote down
                          </Button>
                        </Typography>
                      </Grid>
                      <Grid item xs={1}>
                        <Typography variant="body1">
                          <Button color="primary" onClick={() => this.handleStake(proposal, IProposalOutcome.Pass) }>
                            Stake up
                          </Button>
                        </Typography>
                      </Grid>
                      <Grid item xs={1}>
                        <Typography variant="body1">
                          <Button color="primary" onClick={() => this.handleStake(proposal, IProposalOutcome.Fail)}>
                            Stake down
                          </Button>
                        </Typography>
                      </Grid>
                      <Grid item xs={1}>
                        <input
                          type="text"
                          value={this.state.stakeAmount}
                          onChange={(event) => this.setState({stakeAmount: event.target.value})}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <Typography variant="body1">
                          <Button color="primary" onClick={() => this.handleRedeem(proposal) }>
                            ClaimReward
                          </Button>
                        </Typography>
                      </Grid>
                    </Grid>
                  )})
              }
              </Grid>
          </div>
          <div>
            Create Proposal
            <hr />
            Title:
            <input type="text" value={this.state.proposalCreateOptionsCR.title} name="title" onInput={this.handleChange}/>
            <br />
            Description:
            <input type="text" value={this.state.proposalCreateOptionsCR.description} name="description" onInput={this.handleChange}/>
            <br />
            Url:
            <input type="text" value={this.state.proposalCreateOptionsCR.url} name="url" onInput={this.handleChange}/>
            <br />
            Beneficiary:
            <input type="text" value={this.state.proposalCreateOptionsCR.beneficiary} name="beneficiary" onInput={this.handleChange}/>
            <br />
            EthReward:
            <input type="text" value={this.state.proposalCreateOptionsCR.ethReward} name="ethReward" onInput={this.handleChange}/>
            <br />
            ReputationReward:
            <input type="text" value={this.state.proposalCreateOptionsCR.reputationReward} name="reputationReward" onInput={this.handleChange}/>
            <br />
            <button onClick={this.handleCreateProposal}>
              Create Proposal
            </button>
            <hr />
          </div>
        </header>
      </div>
    )}
  }

export default App;
