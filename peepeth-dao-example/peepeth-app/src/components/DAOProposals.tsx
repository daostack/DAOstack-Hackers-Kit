import React, { useState, useEffect } from 'react';
import {
  Arc,
  DAO,
  Proposal,
} from "@daostack/client";

import {
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
  getProposals,
  getPeepData,
} from '../utils';

export const DAOproposals = (props: any) => {
  const [proposals, setProposals] = useState();
  //const [proposalData, 

  useEffect(() => {
    (async () => {
      setProposals(await getProposals(props.dao));
      })();
  }, [props.dao]);

  return proposals && proposals.length > 0 ? (
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
          {proposals.map((proposal: any) => (
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
                {proposal.ipfsData.content}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  ) : (<Typography> Loading </Typography>);
};
