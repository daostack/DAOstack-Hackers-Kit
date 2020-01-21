import {
  sendQuery,
} from './util';

function getControllerDAOAddresses() {
  const controllerDao = require(`../../daos/private/testdao19.json`);
  return {
    Controller: controllerDao.Controller,
    ControllerAvatar: controllerDao.Avatar,
    ControllerReputation: controllerDao.Reputation,
    ControllerToken: controllerDao.DAOToken,
    Name: controllerDao.name,
  };
}

describe('Controller', () => {
  let addresses;
  beforeAll(async () => {
    addresses = getControllerDAOAddresses();
  });

  it('Sanity', async () => {
    const getMigrationDao = `{
      dao(id: "${addresses.ControllerAvatar.toLowerCase()}") {
        id
        name
        nativeToken {
          id
          dao {
            id
          }
        }
        nativeReputation {
          id
          dao {
            id
          }
        }
      }
    }`;
    let dao = (await sendQuery(getMigrationDao)).dao;
    expect(dao).toMatchObject({
      id: addresses.ControllerAvatar.toLowerCase(),
      name: addresses.Name,
      nativeToken: {
        id: addresses.ControllerToken.toLowerCase(),
        dao: {
          id: addresses.ControllerAvatar.toLowerCase(),
        },
      },
      nativeReputation: {
        id: addresses.ControllerReputation.toLowerCase(),
        dao: {
          id: addresses.ControllerAvatar.toLowerCase(),
        },
      },
    });
  }, 20000);
});
