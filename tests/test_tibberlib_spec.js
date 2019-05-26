/* eslint-env mocha */
'use strict';
// import Tibber from '../nodes/tibbermodule2';
let TibberClient = require('../nodes/tibbermodule2.js');
let should = require('should');
let testSub = 'subscription{ liveMeasurement(homeId:"c70dcbe5-4485-4821-933d-a8a86452737b"){timestamp power maxPower accumulatedConsumption accumulatedCost}}';

describe('Tibberlib module function tests', function () {
  // tibber module should be able to set config from constructor
  it('should set token and url', function (done) {
    // demo token freely available at developer.tibber.com
    try {
      let tibber = new TibberClient('https://api.tibber.com/v1-beta/gql', 'd1007ead2dc84a2b82f0de19451c5fb22112f7ae11d19bf2bedb224a003ff74a');
      tibber.should.be.instanceOf(TibberClient);
      done();
    }
    catch (e) {
      console.log(JSON.stringify(e, null, 4));
    }
  });

  // Tibber module should be able to fetch home data.
  it('should fetch home data', async function () {
    let tibber = new TibberClient('https://api.tibber.com/v1-beta/gql', 'd1007ead2dc84a2b82f0de19451c5fb22112f7ae11d19bf2bedb224a003ff74a');
    try {
      let result = await tibber.get('homes');
      result.viewer.should.have.property('homes');
      result.viewer.homes[0].address.should.have.property('postalCode', '11759');
      done();
    }
    catch (e) {
      console.log(JSON.stringify(e, null, 4));
    }
  });


  // Tibber module should be able to subscribe
  it('should fetch home data', async function () {
    let tibber = new TibberClient('https://api.tibber.com/v1-beta/gql', 'd1007ead2dc84a2b82f0de19451c5fb22112f7ae11d19bf2bedb224a003ff74a');
    try {
      let result = await tibber.getSubscription(testSub);
      console.dir(result);
      done();
    }
    catch (e) {
      console.log(JSON.stringify(e, null, 4));
    }
  });
});
