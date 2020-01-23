const IPFS = require('ipfs-mini');
const ipfs = new IPFS({ host: '127.0.0.1', port: 8080, protocol: 'http' });
 
ipfs.cat('QmbTCzWx2Bp37KoTRzxKSMykySSEUZDxk9NWkjFTn6o65G', (err, result) => {
  console.log(err, result);
});


