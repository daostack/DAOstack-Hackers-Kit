import React, { useState, useEffect } from 'react';
import './App.css';
import {
  initializeArc,
} from './utils';
import {
  CssBaseline,
  Container,
  Typography,
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

  if (!dao) return <div> Loading </div>
  return (
    <div className="App">
      <CssBaseline />
      <Container maxWidth="lg">
        <main className="App-header">
          <Typography variant={'h4'} align={'left'}>
            The DAO address is: {dao.id}
          </Typography>
          <Typography variant={'h6'}>
            Create New Proposal to Peep
          </Typography>
          <CreateProposal dao={dao}/>
          <Typography variant={'h6'}>
            All Peep Proposals in the DAO
          </Typography>
          <DAOproposals dao={dao} arc={arc}/>
        </main>
      </Container>
    </div>
  );
}

export default App;
