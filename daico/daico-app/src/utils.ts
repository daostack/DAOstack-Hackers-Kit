import {
  Arc,
  DAO,
  Proposal,
  IProposalOutcome,
} from "@daostack/client";

import { ethers as eth } from 'ethers';
import ICOScheme from './contracts/ICOScheme.json'
import gql from 'graphql-tag';

const settings = {
  dev: {
    graphqlHttpProvider: "http://127.0.0.1:8000/subgraphs/name/daostack",
    graphqlWsProvider: "ws://127.0.0.1:8001/subgraphs/name/daostack",
    web3Provider: "ws://127.0.0.1:8545",
    ipfsProvider: "localhost",
  }, 
  testnet: {
    graphqlHttpProvider: "http://127.0.0.1:8000/subgraphs/name/daostack",
    graphqlWsProvider: "ws://127.0.0.1:8001/subgraphs/name/daostack",
    web3Provider: "testnet-url",
    ipfsProvider: "localhost",
  }
};

const ICOSchemeAbi = ICOScheme.abi;
const provider = new eth.providers.Web3Provider((window as any).ethereum);
let ICOSchemeContractWithSigner: any = undefined;

export const initializeArc = async () => {
  const metamask = (window as any).ethereum;
  // TODO: change dev - testnet or mainnet as per your project need
  if (metamask) settings.dev.web3Provider = metamask
  const arc = new Arc(settings.dev);
  arc.fetchContractInfos()
  return arc;
}

const getICOSchemeContractWithSigner = async (dao: DAO) => {
  if (ICOSchemeContractWithSigner) return ICOSchemeContractWithSigner;

  let scheme = await dao.scheme( {where: {name: 'ICOScheme'}});
  if (scheme && scheme.staticState)
  {
    const ICOSchemeAddress = scheme.staticState.address
    const ICOSchemeContract = await (new eth.Contract(ICOSchemeAddress as string, ICOSchemeAbi as any, provider as any));
    ICOSchemeContractWithSigner = ICOSchemeContract.connect(provider.getSigner());
    return ICOSchemeContractWithSigner;
  }
}

export const getBeneficiaries = async (dao: DAO) => {

  return null;
}

  /*
export const getProposalsData = async (dao: DAO, proposals: Proposal[]) => {

  let proposalsWithData = proposals.map(async (proposal: Proposal) => {
    let blockChainData = await getPeepProposalData(dao, proposal.id);
    console.log(blockChainData);
    let ipfsData = await getPeepData(blockChainData[1]);
    return { id: proposal.id, blockChainData, ipfsData };
  });
  //console.log(proposalsWithData);
  return Promise.all(proposalsWithData);
}

const getPeepProposalData = async (dao: DAO, proposalId: string) => {
  const ICOSchemeContract = await getICOSchemeContractWithSigner(dao);
  return ICOSchemeContract.organizationsProposals(dao.id, proposalId);
}
   */

export const isActive = async (dao: DAO) => {
  const ICOSchemeContract = await getICOSchemeContractWithSigner(dao);

  try {
    return ICOSchemeContract.isActive()

  } catch (err) {
    console.log(err);
  }
}

export const redeem = async (dao: DAO) => {

  const ICOSchemeContract = await getICOSchemeContractWithSigner(dao);

  if (ICOSchemeContract) {
    try {
      let tx = await ICOSchemeContract.redeemReputation(
        (window as any).ethereum.selectedAddress,
        {
          gasLimit: 7300000,
        }
      );
      console.log(tx);
    } catch (err) {
      console.log(err);
    }
  }
}

export const donate = async (donation: number, dao: DAO) => {

  if (donation) {
    // Send transaction to contribute to ICO
  const ICOSchemeContract = await getICOSchemeContractWithSigner(dao);

    if (ICOSchemeContract) {
      try {
        let tx = await ICOSchemeContract.donate(
          (window as any).ethereum.selectedAddress,
          {
            gasLimit: 7300000,
            value: eth.utils.parseEther(donation.toString())
          }
        );
        console.log(tx);
      } catch (err) {
        console.log(err);
      }
    }
  }
}
