module.exports = function (RED) {
  function TibberDataNode (config) {
    RED.nodes.createNode(this, config);
    var node = this;
    // set upp tibber integration for this node
    const tibber = require('./tibbermodule.js');

    // get the config
    try {
      node.options = RED.nodes.getNode(config.options);
    }
    catch (err) {
      node.error('Error, no login node exists: ' + err);
      node.debug('Couldnt get config node : ' + this.options);
    }
    // validate config
    if (typeof node.options === 'undefined' || !node.options || !node.options.credentials.token || !node.options.url) {
      node.warn('No credentials given! Missing config node details. Verisure.js l-19 :' + node.options);
      return;
    }
    tibber.setConfig({ token: node.options.token, url: node.options.url });

    node.on('input', function (msg) {
      // on msg.payload arrives, try to execute predefined query from tibberlib. Handle fails
    });
  }
  RED.nodes.registerType('TibberDataNode', TibberDataNode);
};
