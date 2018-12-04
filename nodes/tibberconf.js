
module.exports = function (RED) {
  'use strict';
  function TibberConfig (config) {
    RED.nodes.createNode(this, config);
    this.siteName = config.siteName;
    this.displayName = config.displayName;
    this.name = config.displayName;
    this.endpoint = config.endpoint;
  }
  RED.nodes.registerType('TibberConfig', TibberConfig, {
    credentials: {
      username: { type: 'text' },
      password: { type: 'password' },
      token: { type: 'password' }
    }
  }
  );
};
// simple config node to store away logon secrets
