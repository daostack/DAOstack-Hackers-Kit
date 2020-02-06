import React, { useState, useEffect } from 'react';
import {
  IProposalOutcome,
} from "@daostack/client";

import {
  Button,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@material-ui/core';

import {
  getProposalsData,
  getProposalObservable,
} from '../utils';

export const DAOproposals = (props: any) => {
  const [proposals, setProposals] = useState();
  const [proposalsData, setProposalsData] = useState();

  useEffect(() => {
    (async () => {
      let o = await getProposalObservable(props.dao);
      o.subscribe((r: any) => setProposals(r));
    })();
  }, [props.dao]);

  useEffect(() => {
    (async () => {
      if (proposals) {
        let data = await getProposalsData(props.dao, proposals);
        setProposalsData(data);
      }
      //setProposals(await getProposalObservable(props.dao));
    })();
  }, [proposals, props.dao]);

  const handleVote = async (id: string, vote: IProposalOutcome) => {

    // TODO: Implement vote. Update subgraph if want to use client library else import voting machine contract and call vote function
      
  }

  console.log(proposals);
  console.log(proposalsData);
  return proposalsData && proposalsData.length > 0 ? (
    <TableContainer component={Paper}>
      <Table size="small">
        <TableHead>
          <TableCell size="small">
            Proposal Id
          </TableCell>
          <TableCell>
            Peep Hash
          </TableCell>
          <TableCell>
            Proposer
          </TableCell>
          <TableCell>
            Peep Content
          </TableCell>
        </TableHead>
        <TableBody>
          {proposalsData.map((proposal: any) => (
            <TableRow>
              <TableCell>
                {proposal.blockChainData[0]}
              </TableCell>
              <TableCell>
                {proposal.blockChainData[1]}
              </TableCell>
              <TableCell>
                {proposal.blockChainData[0]}
              </TableCell>
              <TableCell>
                {proposal.ipfsData ? proposal.ipfsData.content : 'Loading'}
              </TableCell>
              <TableCell>
                <Button onClick={() => handleVote(proposal.id, IProposalOutcome.Pass)}>
                  Vote Up
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  ) : (<Typography> Loading </Typography>);
};
