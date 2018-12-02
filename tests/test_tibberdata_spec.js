/* eslint-env mocha */
'use strict';
var should = require('should');
var helper = require('node-red-node-test-helper');
var tibberNode = require('../nodes/tibberdata.js');
const tibberEmail = 'test@fest.no';
const tibberPassword = '12345';
helper.init(require.resolve('node-red'));

describe('Tibber Data fetch node-red', function () {
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
    let flow = [{ id: 'n1', type: 'TibberDataNode', name: 'Tibber Home Data' }];
    helper.load(tibberNode, flow, function () {
      let n1 = helper.getNode('n1');
      n1.should.have.property('name', 'Tibber Home Data');
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
    let credentials = { n1: { 'username': tibberEmail, 'password': tibberPassword, 'token': '12dgdgg335SDGHJFFYGDFD345' } };
    helper.load(tibberNode, flow, credentials, function () {
      let n1 = helper.getNode('n1');
     
      done();
    });
  });
});
