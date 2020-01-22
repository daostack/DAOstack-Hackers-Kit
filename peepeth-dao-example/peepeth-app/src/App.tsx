import React, { useState, useEffect } from 'react';
import logo from './logo.svg';
import './App.css';
import { ethers as eth } from 'ethers';
import {
  initializeArc,
  proposeNewPeep,
} from './utils';
import {
  Button,
  CssBaseline,
  Container
} from '@material-ui/core';
import {DAOproposals} from './components/DAOProposals';
import { CreateProposal } from './components/CreateProposal';

const App: React.FC = () => {
  const [arc, setArc] = useState();
  const [dao, setDao] = useState();

  useEffect(() => {
    (async () => {
      setArc(await initializeArc());
    })();
  }, []);

  useEffect(() => {
    (async () => {
      if (arc) {
        setDao((await arc.daos({where: {name: 'PeepDAO'}}).first())[0]);
      }
    })();
  }, [arc]);

  console.log(dao);
  if (!dao) return <div> Loading </div>
  return (
    <div className="App">
      <CssBaseline />
      <Container maxWidth="lg">
        <main className="App-header">
          The DAO address is: {dao.id}
          
          <CreateProposal dao={dao}/>
          <DAOproposals dao={dao} arc={arc}/>
        </main>
      </Container>
    </div>
  );
}

export default App;
