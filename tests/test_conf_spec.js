/* eslint-env mocha */
'use strict';
var should = require('should');
var helper = require('node-red-node-test-helper');
var tibberNode = require('../nodes/tibberconf.js');
const tibberEmail = 'test@fest.no';
const tibberPassword = '12345';
helper.init(require.resolve('node-red'));

describe('Tibber config node-red', function () {
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
    let flow = [{ id: 'n1', type: 'TibberConfig', displayName: 'Tibber Home' }];
    helper.load(tibberNode, flow, function () {
      let n1 = helper.getNode('n1');
      n1.should.have.property('displayName', 'Tibber Home');
      done();
    });
  });

  // Node should have logon credentials needed
  it('should have credentials', function (done) {
    let flow = [{ id: 'n1', type: 'TibberConfig', displayName: 'Tibber Site', endpointPath: 'v1-beta/gql', endpointHost: 'api.tibber.com' }];
    let credentials = { n1: { 'username': tibberEmail, 'password': tibberPassword, 'token': '12345' } };
    helper.load(tibberNode, flow, credentials, function () {
      let n1 = helper.getNode('n1');
      n1.credentials.should.have.property('username');
      n1.credentials.should.have.property('password');
      n1.credentials.should.have.property('token');
      done();
    });
  });

  // node should have config endpoints
  it('should have endpoints', function (done) {
    let flow = [{ id: 'n1', type: 'TibberConfig', displayName: 'Tibber home', endpointPath: 'v1-beta/gql', endpointHost: 'api.tibber.com' }];
    helper.load(tibberNode, flow, function () {
      let n1 = helper.getNode('n1');
      n1.should.have.property('endpointHost', 'api.tibber.com');
      n1.should.have.property('endpointPath', 'v1-beta/gql');
      done();
    });
  });
});
