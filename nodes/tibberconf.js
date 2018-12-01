
module.exports = function (RED) {
  'use strict';
  function TibberConfig (config) {
    RED.nodes.createNode(this, config);
    this.username = config.username;
    this.password = config.password;
    this.siteName = config.siteName;
    this.displayName = config.displayName;
    this.endpointHost = config.endpointHost;
    this.endpointPath = config.endpointPath;
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
