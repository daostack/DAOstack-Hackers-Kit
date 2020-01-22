import React, { useState, useEffect } from 'react';
import {
  Arc,
  DAO,
  Proposal,
} from "@daostack/client";

import {
  Typography,
} from '@material-ui/core';


export const DAOproposals = (props: any) => {
  const [proposals, setProposals] = useState();

  useEffect(() => {
    (async () => {
      props.dao.proposals().subscribe(
        async (proposals: Proposal[]) => {
          await setProposals(proposals);
        }
      )})();
  }, [props.dao]);

  const result = proposals && proposals.length > 0 ? (
    proposals.map((proposal: Proposal) => {
      console.log("Here");
      return (<li key={proposal.id}> proposal.id </li>)
    })
  ) : (<Typography> Loading </Typography>);
  return result;
};
