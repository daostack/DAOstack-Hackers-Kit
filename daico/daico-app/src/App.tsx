import React, { useState, useEffect } from 'react';
import logo from './logo.svg';
import './App.css';
import { ethers as eth } from 'ethers';
import {
  donate,
  getReputation,
  initializeArc,
  isActive,
  redeem,
} from './utils';
import {
  Button,
  CssBaseline,
  Container,
  Paper,
  TextField,
  Typography,
} from '@material-ui/core';

const App: React.FC = () => {
  const [active, setActive] = useState(false);
  const [arc, setArc] = useState();
  const [dao, setDao] = useState();
  const [rep, setRep] = useState();
  const [donation, setDonation] = useState();

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDonation(event.target.value);
  };

  useEffect(() => {
    (async () => {
      setArc(await initializeArc());
    })();
  }, []);

  useEffect(() => {
    (async () => {
      if (arc) {
        setDao((await arc.daos({where: {name: 'DAICO TEMP'}}).first())[0]);
      }
    })();
  }, [arc]);

  useEffect(() => {
    (async () => {
      if (dao) {
        console.log(dao)
        setActive(await isActive(dao));
      }
    })();
  }, [dao]);

  if (!dao) return <div> Loading </div>
  return (
    <div className="App">
      <CssBaseline />
      <Container maxWidth="lg">
        <main className="App-header">
          <Typography variant={'h4'} align={'left'}>
            DAICO TEMP
          </Typography>
          <Typography variant={'h6'} align={'left'}>
            <strong>DAO address:</strong> {dao.id}
          </Typography>
          <Typography variant={'h6'} display="inline">
            <strong>Selected metamask address:</strong> {(window as any).ethereum.selectedAddress}
          </Typography>
          <Typography variant={'subtitle1'} align={'left'}>
            NOTE: <br/>
            You can donate while the ICO is active. <br/>
            You can redeem reputation once the ICO finish.
          </Typography>
          <Typography variant={'subtitle1'} display="inline">
            <strong>ICO Status:</strong> {active ? 'Active' : 'Not Active'}
          </Typography>
          <Button variant="contained" onClick={async () => setActive(await isActive(dao))}>
            Get current status
          </Button>
          <Paper>
            <form>
              <TextField
                required
                id="donation"
                label="Required"
                type="number"
                onChange={handleChange}
              />
              <Button variant="contained" onClick={() => donate(donation, dao)}>
                Donate to ICO
              </Button>
            </form>
            <Typography variant={'subtitle1'}>
              <strong>Reputation available to redeem (after ICO):</strong> {rep ? rep : 'NaN'}
              <Button variant="contained" onClick={async () => setRep(await getReputation(dao))}>
                Get reputation
              </Button>
            </Typography>
            {
              !active ? 
              (<Button variant="contained" onClick={() => redeem(dao)}>
                  Redeem Reputation
                </Button>) :
              (<Typography>
                  Redeem Reputation after ICO
              </Typography>)
            }
          </Paper>
        </main>
      </Container>
    </div>
  );
}

export default App;
