/* eslint-env mocha */
'use strict';
let should = require('should');
let helper = require('node-red-node-test-helper');
let tibberDataNode = require('../nodes/tibberdata.js');
let tibberConfNode = require('../nodes/tibberconf.js');
let demoToken = 'd1007ead2dc84a2b82f0de19451c5fb22112f7ae11d19bf2bedb224a003ff74a';
helper.init(require.resolve('node-red'));

describe('Tibber Data node-red', function () {
  before(function (done) {
    helper.startServer(done);
  });

  afterEach(function () {
    helper.unload();
  });

  after(function (done) {
    helper.stopServer(done);
  });

  // node should be loaded fine in the runtime
  it('should be loaded', function (done) {
    let flow = [{ id: 'n1', type: 'TibberDataNode', displayName: 'Tibber Home Data', endpoint: 'https://api.tibber.com/v1-beta/gql' }];
    helper.load(tibberDataNode, flow, function () {
      let n1 = helper.getNode('n1');
      n1.should.have.property('displayName', 'Tibber Home Data');
      done();
    });
  });

  // Node should have logon credentials needed
  it('should have credentials', function (done) {
    let flow = [
      { id: 'nc', type: 'TibberConfig', displayName: 'Tibber Site', endpoint: 'https://api.tibber.com/v1-beta/gql' },
      { id: 'n1', type: 'TibberDataNode', name: 'Tibber Home Data', options: 'nc', wires: [['nh']] },
      { id: 'nh', type: 'helper', 'z': 'f1' }
    ];
    let credentials = { nc: { 'token': '12dgdgg335SDGHJFFYGDFD345' } };
    helper.load([tibberDataNode, tibberConfNode], flow, credentials, function () {
      let n1 = helper.getNode('n1');
      n1.options.credentials.should.have.property('token');
      // check if credentials are there
      done();
    });
  });

  // Node should have logon credentials needed
  it('should fetch homes', function (done) {
    let flow = [
      { id: 'nc', type: 'TibberConfig', displayName: 'Tibber Site', endpoint: 'https://api.tibber.com/v1-beta/gql' },
      { id: 'n1', type: 'TibberDataNode', name: 'Tibber Home Data', options: 'nc', wires: [['nh']] },
      { id: 'nh', type: 'helper' }
    ];
    // demo token from tibber only
    let credentials = { nc: { 'token': demoToken } };
    helper.load([tibberDataNode, tibberConfNode], flow, credentials, function () {
      let n1 = helper.getNode('n1');
      let nh = helper.getNode('nh');
      nh.on('input', function (msg) {
        let home = msg.payload.viewer.homes[0];
        home.should.have.property('id');
        home.address.should.have.property('city', 'Stockholm');
         // console.dir(msg.payload.viewer.homes[0]);
        done();
      });
      n1.receive({ payload: { type: 'homes' } });
    });
  });

  // Node should fail gracefuly
  it('should fail gracefuly', function (done) {
    let flow = [
      { id: 'nc', type: 'TibberConfig', displayName: 'Tibber Site', endpoint: 'https://api.tibber.com/v1-beta/gql' },
      { id: 'n1', type: 'TibberDataNode', name: 'Tibber Home Data', options: 'nc', wires: [['nh']] },
      { id: 'nh', type: 'helper' }
    ];
    // demo token from tibber only
    let credentials = { nc: { 'token': demoToken } };
    helper.load([tibberDataNode, tibberConfNode], flow, credentials, function () {
      let n1 = helper.getNode('n1');
      let nh = helper.getNode('nh');
      nh.on('input', function (msg) {
        msg.payload.should.have.property('error', true);
        msg.payload.should.have.property('details');
        msg.payload.details.networkError.should.have.property('statusCode', 400);

        done();
      });
      n1.receive({ payload: { type: 'error' } });
    });
  });
});
