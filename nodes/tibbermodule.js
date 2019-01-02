'use strict';
const fetch = require('node-fetch');
const fs = require('fs');
const WebSocket = require('ws');
var token, url;

// Built in queries to simplfy things
const queries = {
  heatingSource: { query: '{viewer {homes {primaryHeatingSource } } }' },
  consumption: { query: '{viewer { homes {consumption(resolution: DAILY, last: 7) { nodes { from to totalCost unitCost unitPrice unitPriceVAT consumption consumptionUnit}}}}}' },
  price: { query: '{viewer {homes {currentSubscription {priceInfo {current {total energy tax startsAt }}}}}}' },
  nextPrice: { query: '{viewer {homes {currentSubscription {priceInfo { current {total currency} today{ total startsAt } tomorrow{ total startsAt }}}}}}' },
  homes: { query: '{viewer {homes {id timeZone features{realTimeConsumptionEnabled} address {address1 postalCode city } owner {firstName lastName contactInfo {email mobile } } } } }' },
  currentUser: { query: '{ viewer { name }}' },
  error: { query: '{generate {error}}' } // for testing purpose, non-happy flow
};

module.exports = {

  // Future function to get token, be an oauth client. now using manual preshared token from Tibber
  getTibberTokenCli: function (email, password) {
    return 'test';
  },
  // Function to read config, incl token, from file if needed
  readConfig: function (file) {
    try {
      let conf = JSON.parse(fs.readFileSync(file, 'utf8'));
      token = conf.token;
      url = conf.url;
      return conf;
    }
    catch (error) {
      console.dir(error);
      return error;
    }
  },
  // provide config as object
  setConfig: function (options) {
    url = options.url;
    token = options.token;
  },
  getConfig: function () {
    return { url: url, token: token };
  },
  // todo, add setconfig or new instance config to get from other sources, like node-red config
  createRequest: function (query) {
    // queryString = JSON.stringify(queryString);
    const opts = {
      body: JSON.stringify(query),
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      }
    };
    return opts;
  },

  // use fetch async to execute query and return parsed json
  getData: async function (url, payload) {
    try {
      let response = await fetch(url, payload);
      if (response.status < 200 || response.status >= 300) {
        return { 'error': true, 'details': { 'status': response.status, 'statusText': response.statusText, 'response': response } };
      }
      let json = await response.text();
      let result = JSON.parse(json);
      if (typeof result.errors !== 'undefined') {
        return { 'error': true, 'details': result.errors };
      }
      else {
        return result.data;
      }
    }
    catch (error) {
      return { 'error': true, 'details': error };
    }
  },
  // Use WS to subscribe to a stream for some data - future release, return WS for others to handle
  getSubscription: async function (url, payload) {
    // not working, trying multiple options with tests/test_ws_manual.js
    console.dir(payload);
    try {
      let ws = new WebSocket(url.replace('https', 'wss') + '/subscriptions', {
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'bearer ' + token,
          Origin: 'https://api.tibber.com'
        }
      });
      ws.on('error', function (error) {
        return { 'error': true, 'details': error };
      });
      ws.on('open', function (message) {
        console.dir(message);
      });
      // try to send subscription query
      /* ws.send(JSON.stringify(payload), function ack (error) {
        // IF error writing to socket. Async not necessarily caught by try/catch
        return { 'error': true, 'details': error };
      }); */
      return ws; // return ws for handling
    }
    catch (error) {
      return { 'error': true, 'details': error };
    }
  },
  // Function for getting users home data
  get: async function (query) {
    return this.getData(url, this.createRequest(queries[query]));
  },
  // function for sending your own query
  query: function (query) {
    return this.getData(url, this.createRequest(query));
  },
  // function for getting a subscription/stream instead (not implemented yet)
  subscribe: async function (query) {
    return this.getSubscription(url, query);
  }
};
