/* Nodejs class for tibber integration with graphql */
const fetch = require('cross-fetch/polyfill');
// migration out of boost section
const { ApolloClient } = require('apollo-client');
const { HttpLink } = require('apollo-link-http');
const { ApolloLink } = require('apollo-link');
const { split } = require('apollo-link');
const { WebSocketLink } = require('apollo-link-ws');
const { getMainDefinition } = require('apollo-utilities');
// const { setContext } = require('apollo-link-context');
const { InMemoryCache } = require('apollo-cache-inmemory');
const gql = require('graphql-tag');
const ws = require('ws');
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
    console.log('constructor');
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
    console.log('init');
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

    // create http link
    const httpLink = new HttpLink({
      uri: uri
    });
    const httpLinkToken = middlewareAuthLink.concat(httpLink);
    // Create a WebSocket link:
    let wsLink, wsLinkToken;
    try {
      wsLink = new WebSocketLink({
        uri: uri,
        options: {
          reconnect: true,
          connectionParams: {
          authToken: token,
          },
        },
        webSocketImpl: ws
      });
      wsLinkToken = middlewareAuthLink.concat(wsLink);
    }
    catch(e) { console.log(e); }
    // use same client, but split query types on the two links
    const splitLink = split(
      // split based on operation type
      ({ query }) => {
        const definition = getMainDefinition(query);
        return (
          definition.kind === 'OperationDefinition' &&
        definition.operation === 'subscription'
        );
      },
      wsLinkToken,
      httpLinkToken
    );

    // the final parts
    const cache = new InMemoryCache();
    
    // build client
    console.log('init2');
      return new ApolloClient({
        link: splitLink,
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
  
  // Use WS to subscribe to a stream for some data - future release
  getSubscription (query) {
    let result;
    try {
      console.log('getS2');
      result = this.client.subscribe({ query: gql`${query}` });
      console.log('getS3')
      console.dir(result);
    }
    catch (e) { 
      console.log('getS4');
      console.dir(e);
      return this.handleError('Failed to execute query', e, true);
    }
    return result;
  }
  // Function for getting predefined queries
  async get (name) {
    // add input validator
    console.log('get');
    let result;
    try {
      let query = this.queries[name];
      console.log('get2');
      result = await this.client.query({ query: gql`${query}` });
      console.log('get3');
    }
    catch (e) {
      console.log('get4');
      // console.dir(e);
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
