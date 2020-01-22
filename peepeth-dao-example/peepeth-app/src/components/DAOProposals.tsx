import React, { useState, useEffect } from 'react';
import {
  Arc,
  DAO,
  Proposal,
} from "@daostack/client";

import {
  Typography,
} from '@material-ui/core';

import {
  getProposals,
  getPeepData,
} from '../utils';

export const DAOproposals = (props: any) => {
  const [proposals, setProposals] = useState();
  //const [proposalData, 

  useEffect(() => {
    (async () => {
      //let proposals = await getProposals(props.dao)
      setProposals(await getProposals(props.dao));
      })();
  }, [props.dao]);

  /*
  useEffect(() => {
    (async () => {
    if (proposals) {
      for(let p of proposals) {
        console.log(await getPeepData(p.data[1]));
      }
    }
    })();
  }, [proposals]);
*/

  console.log(proposals);
  return proposals && proposals.length > 0 ? (
    proposals.map((proposal: any) => {
      console.log(proposal);
      return (<li key={proposal.id}> {proposal.blockChainData[1]} </li>)
    })
  ) : (<Typography> Loading </Typography>);
};
