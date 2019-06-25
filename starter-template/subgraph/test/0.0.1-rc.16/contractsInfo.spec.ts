import { getContractAddresses, sendQuery } from './util';

describe('ContractsInfo', () => {
  let addresses;

  beforeAll(async () => {
    addresses = getContractAddresses();
  });

  it('Sanity', async () => {

    const { contractInfos } = await sendQuery(`{
      contractInfos(where: {address: "${addresses.GenesisProtocol.toLowerCase()}"}) {
        name
      }
    }`);

    expect(contractInfos).toContainEqual({
      name: 'GenesisProtocol',
    });
  }, 20000);
});
