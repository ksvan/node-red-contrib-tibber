module.exports = function (RED) {
  function TibberQueryNode (config) {
    RED.nodes.createNode(this, config);
    let node = this;
    // set upp tibber integration for this node
    const Tibber = require('./tibbermodule2.js');
    node.displayName = config.displayName;
    node.name = config.displayName;
    // get the config
    try {
      this.options = RED.nodes.getNode(config.options);
    }
    catch (err) {
      node.error('Tibber Query Error, no login node exists: ', err);
      node.debug('Couldnt get config node : ' + node.options);
    }
    // validate config
    if (typeof node.options === 'undefined' || !node.options || !node.options.credentials.token || !node.options.endpoint) {
      node.warn('No credentials given! Missing config node details. l-19 :' + node.options);
      return;
    }
    let tibberLink = new Tibber(node.options.endpoint, node.options.credentials.token);

    node.on('input', function (msg) {
      // on msg.payload arrives, try to execute predefined query from tibberlib. Handle fails
      if (typeof msg.payload.query === 'undefined' || msg.payload.query === '') {
        node.error('Error in query', 'Missing query in payload');
        return { error: true, details: 'Missing query in payload' };
      }
      // Todo: add possibilities for other type of data returns, ie specific value only
      if (msg.payload.subscribe) {
        let ws = tibberLink.subscribe(msg.payload);
        ws.on('message', function (data) {
          msg.payload = data;
          node.send(msg);
          console.log(data);
        });
      }
      else {
        tibberLink.getQuery(msg.payload.query).then((result, err) => {
          msg.payload = result;
          node.send(msg);
        }).catch((err) => {
          node.error('TibberQuery error: ', err);
          node.debug(err);
        });
      }
    });
  }
  RED.nodes.registerType('TibberQueryNode', TibberQueryNode);
};
