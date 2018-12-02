'use strict';
const fetch = require('node-fetch');
const fs = require('fs');
var token, url;

// Built in queries to simplfy things
const queries = {
  heatingSource: { query: '{viewer {homes {primaryHeatingSource } } }' },
  consumption: { query: '{viewer { homes {consumption(resolution: DAILY, last: 7) { nodes { from to totalCost unitCost unitPrice unitPriceVAT consumption consumptionUnit}}}}}' },
  price: { query: '{viewer {homes {currentSubscription {priceInfo {current {total energy tax startsAt }}}}}}' },
  homes: { query: '{viewer {homes {id timeZone features{realTimeConsumptionEnabled} address {address1 postalCode city } owner {firstName lastName contactInfo {email mobile } } } } }' },
  currentUser: { 'query': '{ viewer { name }}' }
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
      // endpointHost = conf.endpointHost;
      // endpointPath = conf.endpointPath;
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
        // 'Content-Length': query.length
      }
    };
    return opts;
  },

  // use fetch async to execute query and return json
  getData: async function (url, payload) {
    try {
      let response = await fetch(url, payload);
      const json = await response.text();
      return JSON.parse(json).data.viewer;
    }
    catch (error) {
      console.log('error');
      console.dir(error);
      return { 'error': true, 'message': error };
    }
  },
  // Function for getting users home data
  get: function (query) {
    return this.getData(url, this.createRequest(queries[query]));
  }
};
