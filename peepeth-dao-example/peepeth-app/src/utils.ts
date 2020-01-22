import {
  Arc,
  DAO,
  IProposalOutcome,
} from "@daostack/client";

import { ethers as eth } from 'ethers';
import PeepScheme from './contracts/PeepScheme.json'
import IPFS from 'ipfs-mini';

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

const ipfs = new IPFS({ host: 'localhost', port: 5001, protocol: 'http' });
const PeepSchemeAbi = PeepScheme.abi;
const provider = new eth.providers.Web3Provider((window as any).ethereum);
let PeepSchemeContractWithSigner: any = undefined;

export const initializeArc = async () => {
  const metamask = (window as any).ethereum;
  // TODO: change dev - testnet or mainnet as per your project need
  if (metamask) settings.dev.web3Provider = metamask
  const arc = new Arc(settings.dev);
  arc.fetchContractInfos()
  return arc;
}

const getPeepSchemeContractWithSigner = async (dao: DAO) => {
  if (PeepSchemeContractWithSigner) return PeepSchemeContractWithSigner;

  let scheme = await dao.scheme( {where: {name: 'PeepScheme'}});
  if (scheme && scheme.staticState)
  {
    const PeepSchemeAddress = scheme.staticState.address
    const PeepSchemeContract = await (new eth.Contract(PeepSchemeAddress as string, PeepSchemeAbi as any, provider as any));
    PeepSchemeContractWithSigner = PeepSchemeContract.connect(provider.getSigner());
    return PeepSchemeContractWithSigner;
  }
}

const createProposal = async (dao: DAO, peepHash: string) => {
  const PeepSchemeContract = await getPeepSchemeContractWithSigner(dao);

  if (PeepSchemeContract) {
    let tx = await PeepSchemeContract.proposePeep(dao.id, peepHash, 0);
  }
}

const getProposasl = async () => {

    /*
    tx.wait().then((receipt: any) => {
      console.log(receipt);
    });
    PeepSchemeContract.on("NewPeepProposal", (_avatar, _proposalId, _intVoteInterface, _proposer, _peepHash, _reputationChange, event) => {
      console.log(_proposalId);
      console.log(event);
    });
     */
}

export const proposeNewPeep = async (proposalData: any, dao: DAO) => {
  console.log(proposalData);

  if (proposalData) {
    ipfs.addJSON(
      {
        type: "peep",
        content: proposalData.peepContent,
        pic: "",
        untrustedAddress: "0x000",
        untrustedTimestamp: Math.trunc(new Date().getTime() / 1000),
        shareID: "",
        parentID: ""
      },
      (err: any, peepHash: string) => {
        if (err) {
          console.log(err);
        } else {
          // Send transaction to create the a proposal to the Peep Scheme
          createProposal(dao, peepHash);

          //ipfs.cat(peepHash, (err: any, result: string) => console.log(err, result))
        }
      }
    );
  }
}
