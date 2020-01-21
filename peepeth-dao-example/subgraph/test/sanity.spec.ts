
describe('sanity', () => {
  const packageJson = require(`@daostack/migration/package.json`);
  it('Sanity', async () => {
   // validate ops/mappings.json include latest arc on private network.
    const latestArc = packageJson.dependencies['@daostack/arc'];

    const mappings = require(`../ops/mappings.json`);
    let latestArcVersionExist = 0;
    for (let i = 0; i < mappings.private.mappings.length; i++) {
        if (mappings.private.mappings[i].arcVersion === latestArc) {
          latestArcVersionExist++;
        }
    }
    expect(latestArcVersionExist).toBeGreaterThanOrEqual(17);
  }, 10);
});
