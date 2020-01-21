import {
  Arc,
  DAO,
  IProposalOutcome,
} from "@daostack/client";

const settings = {
  dev: {
    //graphqlHttpProvider: "http://127.0.0.1:8000/subgraphs/name/daostack",
    //graphqlWsProvider: "ws://127.0.0.1:8001/subgraphs/name/daostack",
    web3Provider: "ws://127.0.0.1:8545",
    //ipfsProvider: "localhost",
  }, 
  testnet: {
    graphqlHttpProvider: "http://127.0.0.1:8000/subgraphs/name/daostack",
    graphqlWsProvider: "ws://127.0.0.1:8001/subgraphs/name/daostack",
    web3Provider: "testnet-url",
    ipfsProvider: "localhost",
  }
};

export const initializeArc = async () => {
  const metamask = (window as any).ethereum;
  // TODO: change dev - testnet or mainnet as per your project need
  if (metamask) settings.dev.web3Provider = metamask
  const arc = new Arc(settings.dev);
  //const contractInfo = await arc.fetchContractInfos();
  return arc;
}
