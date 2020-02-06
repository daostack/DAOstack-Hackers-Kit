import {
  Arc,
  DAO,
} from "@daostack/client";

import { ethers as eth } from 'ethers';
import ICOScheme from './contracts/ICOScheme.json'

const settings = {
  dev: {
    graphqlHttpProvider: "http://127.0.0.1:8000/subgraphs/name/daostack",
    graphqlWsProvider: "ws://127.0.0.1:8001/subgraphs/name/daostack",
    web3Provider: "ws://127.0.0.1:8545",
    ipfsProvider: "http://localhost:5001/api/v0",
  }, 
  testnet: {
    graphqlHttpProvider: "http://127.0.0.1:8000/subgraphs/name/daostack",
    graphqlWsProvider: "ws://127.0.0.1:8001/subgraphs/name/daostack",
    web3Provider: "testnet-url",
    ipfsProvider: "http://localhost:5001/api/v0",
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

export const getReputation = async (dao: DAO) => {
  const ICOSchemeContract = await getICOSchemeContractWithSigner(dao);
  console.log("Getting Beneficiaries");

  try {
    return (await ICOSchemeContract.beneficiaries((window as any).ethereum.selectedAddress)).toString();
    
  } catch (err) {
    console.log(err);
  }
}

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
      ICOSchemeContract.redeemReputation(
      (window as any).ethereum.selectedAddress,
      {
        gasLimit: 7300000,
      });
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
        ICOSchemeContract.donate(
        (window as any).ethereum.selectedAddress,
        {
          gasLimit: 7300000,
          value: eth.utils.parseEther(donation.toString())
        });
      } catch (err) {
        console.log(err);
      }
    }
  }
}
