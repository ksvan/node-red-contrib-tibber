/* Nodejs class for tibber integration with graphql */
const fetch = require('cross-fetch/polyfill');
// migration out of boost section
const { ApolloClient } = require('apollo-client');
const { HttpLink } = require('apollo-link-http');
const { ApolloLink } = require('apollo-link');
// const { setContext } = require('apollo-link-context');
const { InMemoryCache } = require('apollo-cache-inmemory');
const gql = require('graphql-tag');
// Apollo config
const apolloOptions = {
  watchQuery: {
    fetchPolicy: 'cache-and-network',
    errorPolicy: 'warn'
  },
  query: {
    fetchPolicy: 'network-only',
    errorPolicy: 'all'
  },
  mutate: {
    errorPolicy: 'all'
  }
};
// migrate end
// const ApolloClient = Boost.default;

module.exports = class Tibber {
  constructor (uri, token) {
    try {
      this.client = this.initClient(uri, token);
    }
    catch (e) {
      this.handleError('failed to initialize apollo client', e, true);
    }
    // Built in queries to simplfy things
    this.queries = {
      heatingSource: '{viewer {homes {primaryHeatingSource } } }',
      consumption: '{viewer { homes {consumption(resolution: DAILY, last: 7) { nodes { from to totalCost unitCost unitPrice unitPriceVAT consumption consumptionUnit}}}}}',
      price: '{viewer {homes {currentSubscription {priceInfo {current {total energy tax startsAt }}}}}}',
      nextPrice: '{viewer {homes {currentSubscription {priceInfo { current {total currency} today{ total startsAt } tomorrow{ total startsAt }}}}}}',
      homes: '{viewer {homes {id timeZone features{realTimeConsumptionEnabled} address {address1 postalCode city } owner {firstName lastName contactInfo {email mobile } } } } }',
      currentUser: '{ viewer { name }}',
      error: '{generate {error}}' // for testing purpose, non-happy flow
    };
  }

  // set up apollo client for http
  initClient (uri, token) {
    // Middleware to set the headers
    const middlewareAuthLink = new ApolloLink((operation, forward) => {
      const authorizationHeader = token ? `Bearer ${token}` : null;
      operation.setContext({
        headers: {
          authorization: authorizationHeader
        }
      });
      // console.log(operation.query.definitions);
      return forward(operation);
    });
    const link = new HttpLink({
      uri: uri
    });

    const cache = new InMemoryCache();
    const httpLinkToken = middlewareAuthLink.concat(link);
    // build client
    return new ApolloClient({
      link: httpLinkToken,
      cache: cache,
      fetch: fetch,
      defaultOptions: apolloOptions
    });
  }

  // Set up client for subscription
  initSubscription (uri, token) {

  }

  // function for handling parsing and return of
  handleResult (result) {
    console.log('handleResult');
    return result.data.viewer; // for now
  }
  // Function for log handling for this class. To be extended
  handleError (msg, obj, error) {
    // return json error object
    // console.log(JSON.stringify(obj, null, 4));
    return { error: true, details: obj };
  }
  getConfig () {
    return { url: this.url, token: this.token };
  }
  // Use WS to subscribe to a stream for some data - future release
  getSubscription (url, payload) {
  }
  // Function for getting predefined queries
  async get (name) {
    // add input validator
    let result;
    try {
      let query = this.queries[name];
      result = await this.client.query({ query: gql`${query}` });
    }
    catch (e) {
      return this.handleError('Failed to execute query', e, true);
    }
    return result.data;
  }
  // function for sending your own query - to be extended and abstracted with get()
  async getQuery (query) {
    let result;
    try {
      result = await this.client.query({ query: gql`${query}` });
    }
    catch (e) {
      return this.handleError('Failed to execute query', e, true);
    }
    return result.data;
  }
};
