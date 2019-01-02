/* eslint-env mocha */
'use strict';
var should = require('should');
var WebSocket = require('ws');
var tibberLib = require('../nodes/tibbermodule.js');
var testConfig = 'envt-test';
var testSub = { query: 'subscription{ liveMeasurement(homeId:"c70dcbe5-4485-4821-933d-a8a86452737b"){timestamp power maxPower accumulatedConsumption accumulatedCost}}' };

describe('Tibberlib module function tests', function () {
  // Tibber module should be able to fetch token. Future release with oauth client, currently using pre-reqistereded manual token from file
  it('should fetch token', function (done) {
    let conf = tibberLib.readConfig(testConfig);
    conf.token.should.be.type('string');
    done();
  });

  // tibber module should be able to set config from this method
  it('should set token and url', function (done) {
    // demo token freely available at developer.tibber.com
    tibberLib.setConfig({ url: 'https://api.tibber.com/v1-beta/gql', token: 'd1007ead2dc84a2b82f0de19451c5fb22112f7ae11d19bf2bedb224a003ff74a' });
    let conf = tibberLib.readConfig(testConfig);
    conf.token.should.be.type('string');
    conf.url.should.be.type('string');
    done();
  });

  // Tibber module should be able to fetch home data.
  it('should fetch home data', function (done) {
    tibberLib.readConfig(testConfig);
    tibberLib.get('homes').then((result) => {
      let home = result.viewer.homes;
      home.should.be.type('object');
      home[0].should.be.type('object');
      home[0].address.should.have.property('city');
      home[0].owner.should.have.property('firstName');
      done();
    }).catch((err) => {
      console.log('error: ' + err);
      console.dir(err);
    });
  });

  // Tibber module should be able to fetch consumption data.
  it('should fetch consumption data', function (done) {
    tibberLib.readConfig(testConfig);
    tibberLib.get('consumption').then((result, err) => {
      let cons = result.viewer;
      cons.should.be.type('object');
      cons.homes[0].consumption.nodes[0].should.have.property('totalCost');
      cons.homes[0].consumption.nodes[0].should.have.property('consumption');
      done();
    }).catch((err) => {
      console.log('error: ' + err);
      console.dir(err);
    });
  });

  // Tibber module should be able to fetch pricing data.
  it('should fetch pricing data', function (done) {
    tibberLib.readConfig(testConfig);
    tibberLib.get('price').then((result, err) => {
      let price = result.viewer;
      price.should.be.type('object');
      price.homes[0].currentSubscription.priceInfo.current.should.have.property('total');
      price.homes[0].currentSubscription.priceInfo.current.should.have.property('tax');
      done();
    }).catch((err) => {
      console.log('error: ' + err);
      console.dir(err);
    });
  });

  // Tibber module should be able to subscribe and get a ws
  it('should subscribe', function (done) {
    tibberLib.readConfig(testConfig);
    tibberLib.subscribe(testSub).then((result, err) => {
      let ws = result;
      if(typeof ws.error !== 'undefined' && ws.error) {console.dir(ws);}
      ws.on('message', function (data) {
        console.log(data);
      });
      ws.on('error', function (data) {
        console.log('open error! ' + data);
        done();
      });
      console.dir(ws);
      ws.should.be.an.instanceOf(WebSocket);
      // done();
    }).catch((err) => {
      console.log('error: ' + err);
      console.dir(err);
    });
  });
});
