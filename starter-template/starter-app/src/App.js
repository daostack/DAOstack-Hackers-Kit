import React, { Component } from 'react';
import './App.css';
import { Arc, DAO } from "@daostack/client";
import { first } from 'rxjs/operators';
import { ethers as eth } from 'ethers';
import migration from './data/migration.json';

const settings = {
  dev: {
    graphqlHttpProvider: "http://127.0.0.1:8000/subgraphs/name/daostack",
    graphqlWsProvider: "ws://127.0.0.1:8001/subgraphs/name/daostack",
    web3Provider: "ws://127.0.0.1:8545",
    ipfsProvider: "localhost",
  }};

const getMetaMask = () => {
  const ethereum = (window).ethereum;
  return ethereum;
}

async function initializeArc() {
  const metamask = getMetaMask()
  if (metamask) settings.dev.web3Provider = metamask
  //console.log(metamask.selectedAddress)
  const arc = new Arc(settings.dev);
  await arc.initialize();
  return arc;
}

class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
      arcIsInitialized: false,
      arc: null,
      dao: null,
      proposals: [],
      proposalCreateOptionsCR: {
        description: "Please provide Sample proposal description",
        title: "Sample Proposal",
        // Hardcoded the address of CR scheme
        scheme: "0x297D631516A2f66216980c37ce2DE9E1F5CF64e5",
        url: "#",
        beneficiary: (window).ethereum.selectedAddress,
        nativeTokenReward: "",
        reputationReward: eth.utils.parseEther('100').toString(),
        ethReward: eth.utils.parseEther('1').toString(),
        externalTokenReward: "",
        externalTokenAddress: "",
        periodLength: "",
        periods: ""
      }
    }
    this.handleChange = this.handleChange.bind(this);
    this.handleCreateProposal = this.handleCreateProposal.bind(this);
  }

  async componentWillMount() {
    const arc = await initializeArc()
    //console.log(arc)
    const daos = await arc.daos().pipe(first()).toPromise()
    const dao = new DAO(daos[0].address, arc)
    await dao.proposals().subscribe((proposals) => {
      this.setState({
        arcIsInitialized: true,
        arc,
        dao,
        proposals
      })
    })
  }

  async handleCreateProposal(event){
    const { dao, proposalCreateOptionsCR } = this.state
    try {
      await dao.createProposal({...proposalCreateOptionsCR, dao: dao.address})
        .subscribe((event) => {
          console.log(event)
        })
    } catch (e) {
      console.log("Error: ", e)
    }
  }

  handleChange(event) {
    let proposalCreateOptionsCR = { ...this.state.proposalCreateOptionsCR}
    proposalCreateOptionsCR[event.target.name] = event.target.value
    this.setState({proposalCreateOptionsCR})
  }

  render() {
            //{this.state.daos.map((dao) => (<li key={dao.address}> DAO address: {dao.address} </li>))}
    if (!this.state.arcIsInitialized) return (<div> Loading </div>)
    return (
      <div className="App">
        <header className="App-header">
           DAO: {this.state.dao.address}
          <hr />
           Proposals
          <div>
            <hr />
            {this.state.proposals.map((proposal) => (<li key={proposal.id}> ID : {proposal.id} </li>))}
            <hr />
          </div>
          <div>
            Create Proposal
            <hr />
            <label>
              Title:
              <input type="text" value={this.state.proposalCreateOptionsCR.title} name="title" onInput={this.handleChange}/>
            </label>
            <label>
              Description:
              <input type="text" value={this.state.proposalCreateOptionsCR.description} name="description" onInput={this.handleChange}/>
            </label>
            <label>
              Url:
              <input type="text" value={this.state.proposalCreateOptionsCR.url} name="url" onInput={this.handleChange}/>
            </label>
            <label>
              Beneficiary:
              <input type="text" value={this.state.proposalCreateOptionsCR.beneficiary} name="beneficiary" onInput={this.handleChange}/>
            </label>
            <label>
              EthReward:
              <input type="text" value={this.state.proposalCreateOptionsCR.ethReward} name="ethReward" onInput={this.handleChange}/>
            </label>
            <label>
              ReputationReward:
              <input type="text" value={this.state.proposalCreateOptionsCR.reputationReward} name="reputationReward" onInput={this.handleChange}/>
            </label>
              <hr />
            <button onClick={this.handleCreateProposal}>
              Create Proposal
            </button>
          </div>
          Use client library to create a proposal to your new DAO
        </header>
      </div>
    );
  }
}

export default App;
