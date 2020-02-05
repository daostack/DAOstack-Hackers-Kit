import React, { useState, useEffect } from 'react';
import logo from './logo.svg';
import './App.css';
import { ethers as eth } from 'ethers';
import {
  donate,
  //getBeneficiaries,
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
        setActive(await isActive(dao));
      }
    })();
  }, [dao]);

  const updateStatus = async (dao: any) => {
    setActive(await isActive(dao));
  } 
  /*
  */

  if (!dao) return <div> Loading </div>
  return (
    <div className="App">
      <CssBaseline />
      <Container maxWidth="lg">
        <main className="App-header">
          <Typography variant={'h4'} align={'left'}>
            The DAO address is: {dao.id}
          </Typography>
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
                Donate
              </Button>
            </form>
            <Typography variant={'h6'}>
              ICO Status: {active ? 'true' : 'false'}
              <Button variant="contained" onClick={() => updateStatus(dao)}>
                Update Status
              </Button>
            </Typography>
            <Button variant="contained" onClick={() => redeem(dao)}>
              Redeem
            </Button>
          </Paper>
        </main>
      </Container>
    </div>
  );
}

export default App;
