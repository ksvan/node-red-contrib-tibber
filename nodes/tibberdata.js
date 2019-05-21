'use strict';
module.exports = function (RED) {
  function TibberDataNode (config) {
    RED.nodes.createNode(this, config);
    var node = this;
    // set upp tibber integration for this node
    const Tibber = require('./tibbermodule2.js');
    node.displayName = config.displayName;
    // get the config
    try {
      this.options = RED.nodes.getNode(config.options);
    }
    catch (err) {
      node.error('Tibber Data Error, no login node exists ', err);
      node.debug('Couldnt get config node : ' + node.options);
    }
    // validate config
    if (typeof node.options === 'undefined' || !node.options || !node.options.credentials.token || !node.options.endpoint) {
      node.error('No credentials given! Missing config node details. l-19 :', node.options);
      return;
    }
    let tibberLink = new Tibber(node.options.endpoint, node.options.credentials.token);

    node.on('input', function (msg) {
      // on msg.payload arrives, try to execute predefined query from tibberlib. Handle fails
      if (typeof msg.payload.type === 'undefined' || msg.payload.type === '') {
        node.error('Tibber Error: no datatype given as input', 'No msg.payload,type was given');
        return;
      }
      tibberLink.get(msg.payload.type).then((result, err) => {
        msg.payload = result;
        node.send(msg);
      }).catch((err) => {
        node.error('Tibber Data error: ', err);
        node.debug(err);
      });
    });
  }
  RED.nodes.registerType('TibberDataNode', TibberDataNode);
};
