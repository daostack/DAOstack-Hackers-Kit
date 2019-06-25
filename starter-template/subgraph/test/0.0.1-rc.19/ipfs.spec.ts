import {
  getContractAddresses,
  getOptions,
  getWeb3,
  sendQuery,
  writeProposalIPFS,
} from './util';

const ContributionReward = require('@daostack/arc/build/contracts/ContributionReward.json');
const Avatar = require('@daostack/arc/build/contracts/Avatar.json');
describe('Domain Layer', () => {
  let web3;
  let addresses;
  let opts;

  beforeAll(async () => {
    web3 = await getWeb3();
    addresses = getContractAddresses();
    opts = await getOptions(web3);
  });

  it('Sanity', async () => {
    const accounts = web3.eth.accounts.wallet;

    const contributionReward = new web3.eth.Contract(
      ContributionReward.abi,
      addresses.ContributionReward,
      opts,
    );

    // Full valid data on IPFS

    let proposalIPFSData = {
      description: 'My desctiption!',
      title: 'My Title!',
      url: 'http://swift.org/modest',
    };

    let proposalDescription = proposalIPFSData.description;
    let proposalTitle = proposalIPFSData.title;
    let proposalUrl = proposalIPFSData.url;

    let descHash = await writeProposalIPFS(proposalIPFSData);

    async function propose({
      proposalDescHash,
      rep,
      tokens,
      eth,
      external,
      periodLength,
      periods,
      beneficiary,
    }) {
      const prop = contributionReward.methods.proposeContributionReward(
        addresses.Avatar,
        proposalDescHash,
        rep,
        [tokens, eth, external, periodLength, periods],
        addresses.GEN,
        beneficiary,
      );
      const proposalId = await prop.call();
      const { blockNumber } = await prop.send();
      const { timestamp } = await web3.eth.getBlock(blockNumber);

      return { proposalId, timestamp };
    }

    const { proposalId: p1 } = await propose({
      proposalDescHash: descHash,
      rep: 10,
      tokens: 10,
      eth: 10,
      external: 10,
      periodLength: 0,
      periods: 1,
      beneficiary: accounts[1].address,
    });

    let getProposal = `{
        proposal(id: "${p1}") {
            id
            descriptionHash
            title
            description
            url
        }
    }`;

    let proposal = (await sendQuery(getProposal)).proposal;
    expect(proposal).toMatchObject({
      id: p1,
      descriptionHash: descHash,
      title: proposalTitle,
      description: proposalDescription,
      url: proposalUrl,
    });

    // Partial data on IPFS
    let proposalIPFSData2 = {
      title: 'New Title!',
      url: 'http://swift.org/modest2',
    };

    proposalTitle = proposalIPFSData2.title;
    proposalUrl = proposalIPFSData2.url;

    descHash = await writeProposalIPFS(proposalIPFSData2);

    const { proposalId: p2 } = await propose({
      proposalDescHash: descHash,
      rep: 10,
      tokens: 10,
      eth: 10,
      external: 10,
      periodLength: 0,
      periods: 1,
      beneficiary: accounts[1].address,
    });

    getProposal = `{
        proposal(id: "${p2}") {
            id
            descriptionHash
            title
            description
            url
        }
    }`;

    proposal = (await sendQuery(getProposal)).proposal;
    expect(proposal).toMatchObject({
      id: p2,
      descriptionHash: descHash,
      title: proposalTitle,
      description: null,
      url: proposalUrl,
    });

    // Empty JSON on IPFS
    let proposalIPFSData3 = {};

    descHash = await writeProposalIPFS(proposalIPFSData3);

    const { proposalId: p3 } = await propose({
      proposalDescHash: descHash,
      rep: 10,
      tokens: 10,
      eth: 10,
      external: 10,
      periodLength: 0,
      periods: 1,
      beneficiary: accounts[1].address,
    });

    getProposal = `{
        proposal(id: "${p3}") {
            id
            descriptionHash
            title
            description
            url
        }
    }`;

    proposal = (await sendQuery(getProposal)).proposal;
    expect(proposal).toMatchObject({
      id: p3,
      descriptionHash: descHash,
      title: '',
      description: null,
      url: null,
    });

    // Invalid IPFS hash
    descHash = 'invalid ipfs hash!';

    const { proposalId: p4 } = await propose({
      proposalDescHash: descHash,
      rep: 10,
      tokens: 10,
      eth: 10,
      external: 10,
      periodLength: 0,
      periods: 1,
      beneficiary: accounts[1].address,
    });

    getProposal = `{
        proposal(id: "${p4}") {
            id
            descriptionHash
            title
            description
            url
        }
    }`;

    proposal = (await sendQuery(getProposal)).proposal;
    expect(proposal).toMatchObject({
      id: p4,
      descriptionHash: descHash,
      title: '',
      description: null,
      url: null,
    });

    // Invalid IPFS data1
    let invalidIPFSData1 = 'invalid ipfs data!';

    descHash = await writeProposalIPFS(invalidIPFSData1);

    const { proposalId: p5 } = await propose({
      proposalDescHash: descHash,
      rep: 10,
      tokens: 10,
      eth: 10,
      external: 10,
      periodLength: 0,
      periods: 1,
      beneficiary: accounts[1].address,
    });

    getProposal = `{
        proposal(id: "${p5}") {
            id
            descriptionHash
            title
            description
            url
        }
    }`;

    proposal = (await sendQuery(getProposal)).proposal;
    expect(proposal).toMatchObject({
      id: p5,
      descriptionHash: descHash,
      title: '',
      description: null,
      url: null,
    });

    // Invalid IPFS data2
    let invalidIPFSData2 = '{ invalid ipfs data! }';

    descHash = await writeProposalIPFS(invalidIPFSData2);

    const { proposalId: p6 } = await propose({
      proposalDescHash: descHash,
      rep: 10,
      tokens: 10,
      eth: 10,
      external: 10,
      periodLength: 0,
      periods: 1,
      beneficiary: accounts[1].address,
    });

    getProposal = `{
        proposal(id: "${p6}") {
            id
            descriptionHash
            title
            description
            url
        }
    }`;

    proposal = (await sendQuery(getProposal)).proposal;
    expect(proposal).toMatchObject({
      id: p6,
      descriptionHash: descHash,
      title: '',
      description: null,
      url: null,
    });

  }, 100000);
});
