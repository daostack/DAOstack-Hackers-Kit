//import PeepScheme from './contracts/PeepScheme.json'
//import { IPFS } from 'ipfs-mini';
const IPFS = require('ipfs-mini');

const ipfs = new IPFS({ host: 'localhost', port: 5001, protocol: 'http' });
const proposeNewPeep = () => {
  // Get the proposal content and clears the text from the UI
  let peepContent = "This is the content";

  // Upload the proposal as a Peep to IPFS using Peepeth peep format
  ipfs.addJSON(
    {
      type: "peep",
      content: peepContent,
      pic: "",
      untrustedAddress: "0x000",
      untrustedTimestamp: Math.trunc(new Date().getTime() / 1000),
      shareID: "",
      parentID: ""
    },
    (err, peepHash) => {
      if (err) {
        console.log(err);
      } else {
        // Sends the new proposal to the Peep Scheme
        console.log(peepHash);

        ipfs.cat('QmfNX5dyAhjnUsSfkn6uVvfZRtwrJvAmYGCckK9QVFh9Kj', (err, result) => console.log(err, result))
      }
    }
  );
}

proposeNewPeep();
