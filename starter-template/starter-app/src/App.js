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
  //console.log(settings)
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
      daos: [],
      proposalCreateOptionsCR: {
        dao: "",
        description: "Test",
        title: "No Title",
        scheme: "0x297D631516A2f66216980c37ce2DE9E1F5CF64e5",
        url: "#",
        beneficiary: "0x90F8bf6A479f320ead074411a4B0e7944Ea8c9C1",
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
    this.setState({
      arcIsInitialized: true,
      arc: arc,
      daos: daos
    })
  }

  async handleCreateProposal(event){
    const { daos, arc, proposalCreateOptionsCR } = this.state
    proposalCreateOptionsCR.dao = daos[0].address
    //console.log("creating proposal ")
    const dao = new DAO(daos[0].address, arc)
    console.log(proposalCreateOptionsCR)
    try {
      const tx = await dao.createProposal(proposalCreateOptionsCR)
      console.log(tx)
      tx.send()
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
    return (
      <div className="App">
        <header className="App-header">
          <div>
            <label>
              Title:
              <input type="text" name="title" onInput={this.handleChange}/>
            </label>
            <label>
              Description:
              <input type="text" name="description" onInput={this.handleChange}/>
            </label>
            <label>
              Url:
              <input type="text" name="url" onInput={this.handleChange}/>
            </label>
            <label>
              Beneficiary:
              <input type="text" name="beneficiary" onInput={this.handleChange}/>
            </label>
            <label>
              EthReward:
              <input type="text" name="ethReward" onInput={this.handleChange}/>
            </label>
            <label>
              ReputationReward:
              <input type="text" name="reputationReward" onInput={this.handleChange}/>
            </label>
            <button onClick={this.handleCreateProposal}>
              Create Proposal
            </button>
          </div>
          Use client library to create a proposal to your new DAO
          {this.state.daos.map((dao) => (<li key={dao.address}> DAO address: {dao.address} </li>))}
        </header>
      </div>
    );
  }
}

export default App;
