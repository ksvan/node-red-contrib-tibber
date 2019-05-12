let TibberClient = require('../nodes/tibbermodule2.js');

main();

function main () {
  testV2();
}

async function testV2 () {
  let tibber = new TibberClient({ url: 'https://api.tibber.com/v1-beta/gql', token: 'd1007ead2dc84a2b82f0de19451c5fb22112f7ae11d19bf2bedb224a003ff74a' });
  console.log('Test');
  
  let result = await tibber.get('homes');
  console.log(result.data.viewer);

  result = await tibber.getQuery('{viewer {name } }');
  console.log(result);
  console.log(result.error);
}
