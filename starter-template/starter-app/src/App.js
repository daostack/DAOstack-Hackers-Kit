import React, { Component } from 'react';
import './App.css';
import { Arc } from "@daostack/client";
import { first } from 'rxjs/operators';

const settings = {
  dev: {
    graphqlHttpProvider: "http://127.0.0.1:8000/subgraphs/name/daostack",
    graphqlWsProvider: "ws://127.0.0.1:8001/subgraphs/name/daostack",
    web3Provider: "ws://127.0.0.1:8545",
    ipfsProvider: "localhost",
  }};

async function initializeArc() {
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
      daos: []
    }
  }

  async componentWillMount() {
    const arc = await initializeArc()
    const daos = await arc.daos().pipe(first()).toPromise()
    this.setState({
      arcIsInitialized: true,
      arc: arc,
      daos: daos
    })
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          Use client library to create a proposal to your new DAO
          {this.state.daos.map((dao) => (<li key={dao.address}> DAO address: {dao.address} </li>))}
        </header>
      </div>
    );
  }
}

export default App;
