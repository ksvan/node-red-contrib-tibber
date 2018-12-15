module.exports = function (RED) {
  function TibberQueryNode (config) {
    RED.nodes.createNode(this, config);
    var node = this;
    // set upp tibber integration for this node
    const tibber = require('./tibbermodule.js');
    node.displayName = config.displayName;
    node.name = config.displayName;
    // get the config
    try {
      this.options = RED.nodes.getNode(config.options);
    }
    catch (err) {
      node.error('Error, no login node exists: ' + err);
      node.debug('Couldnt get config node : ' + node.options);
    }
    // validate config
    if (typeof node.options === 'undefined' || !node.options || !node.options.credentials.token || !node.options.endpoint) {
      node.warn('No credentials given! Missing config node details. l-19 :' + node.options);
      return;
    }
    tibber.setConfig({ token: node.options.credentials.token, url: node.options.endpoint });

    node.on('input', function (msg) {
      // on msg.payload arrives, try to execute predefined query from tibberlib. Handle fails
      if (typeof msg.payload.query === 'undefined' || msg.payload.query === '') {
        return { error: true, details: 'Missing query in payload' };
      }
      // Todo: add possibilities for other type of data returns, ie specific value only
      tibber.query(msg.payload).then((result, err) => {
        msg.payload = result;
        node.send(msg);
      }).catch((err) => {
        node.warn('error: ' + err);
        node.debug(err);
      });
    });
  }
  RED.nodes.registerType('TibberQueryNode', TibberQueryNode);
};