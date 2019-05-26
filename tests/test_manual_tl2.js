let TibberClient = require('../nodes/tibbermodule2.js');

main();

function main () {
  testV2();
}

async function testV2 () {
  let tibber = new TibberClient('https://api.tibber.com/v1-beta/gql', 'd1007ead2dc84a2b82f0de19451c5fb22112f7ae11d19bf2bedb224a003ff74a' );
  console.log('Test');
  
  let result = await tibber.get('homes');
  console.dir(result.viewer);

  result = await tibber.getQuery('{viewer {name } }');
  console.dir(result);

  result = tibber.getSubscription('subscription{ liveMeasurement(homeId:"c70dcbe5-4485-4821-933d-a8a86452737b"){timestamp power maxPower accumulatedConsumption accumulatedCost}}');
  console.dir(result);
  console.log(JSON.stringify(result._subscriber, null, 2));
  // result.subscribe({
  //   next (data) {
  //     console.log('sub here ' + data);
  //   },
  //   error (data) {
  //     console.log('sub error' + data);
  //   },
  //   complete () {
  //     console.log('complete sub');
  //   }
  // }
  // );
  let sub = result.subscribe({
     next: (x) => { console.log(x) },
     error: (err) => {console.log(err)}
    });

}
