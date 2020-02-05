import React, { useState, useEffect } from 'react';
import {
  Button,
  Paper,
  TextField,
} from '@material-ui/core';
import {
  proposeNewPeep,
} from '../utils';

export const CreateProposal = (props: any) => {
  const [proposalData, setProposalData] = useState();

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    //console.log(event.target.value, event.target.id);
    setProposalData({[event.target.id]: event.target.value});
  };

  return (
    <Paper>
      <form>
        <TextField
          required
          id="peepContent"
          label="Required"
          onChange={handleChange}
          defaultValue="Please add your peep here"
        />
        <Button variant="contained" onClick={() => {
          proposeNewPeep(proposalData, props.dao)
        }}>
          Propose New peep
        </Button>
      </form>
    </Paper>
  )
}
