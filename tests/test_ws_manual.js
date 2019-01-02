var tibberLib = require('../nodes/tibbermodule.js');
var WebSocket = require('ws');
var homeId = 'c70dcbe5-4485-4821-933d-a8a86452737b';
var WebSocketClient = require('websocket').client;
var W3CWebSocket = require('websocket').w3cwebsocket;
var token = 'd1007ead2dc84a2b82f0de19451c5fb22112f7ae11d19bf2bedb224a003ff74a';
var testSub = { query: 'subscription{ liveMeasurement(homeId:"c70dcbe5-4485-4821-933d-a8a86452737b"){timestamp power maxPower accumulatedConsumption accumulatedCost}}' };
var pingTimeout;
var url = 'wss://api.tibber.com/v1-beta/gql/subscriptions';

tibberLib.setConfig({ url: 'https://api.tibber.com/v1-beta/gql', token: 'd1007ead2dc84a2b82f0de19451c5fb22112f7ae11d19bf2bedb224a003ff74a' });

subW3c();

function keepAlive () {
  clearTimeout(pingTimeout);
  pingTimeout = setTimeout(() => {
    this.terminate();
  }, 50000 + 1000);
}

function subLib() {
  tibberLib.subscribe(testSub).then((result, err) => {
    let ws = result;
    if (typeof ws.error !== 'undefined' && ws.error) { console.dir(ws); }
    console.dir(ws);
    handleWS(ws);
    // done();
  }).catch((err) => {
    console.log('error: ' + err);
    console.dir(err);
  });
}

function subNew () {
  var ws2 = new WebSocketClient();
  ws2.on('connect', function (connection) {
    console.log('>>> Connected new');
    console.dir(connection);
    // console.dir(socket);
    handleWS(connection);
    // connection.sendUTF(JSON.stringify(testSub));
  });
  ws2.on('connectFailed', function (error) {
    console.log('<<< Failed connection');
    console.dir(error);
  });
  ws2.connect(url, null, null, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'bearer ' + token
    }
  });
}

function subW3c () {
  let client = new W3CWebSocket(url);

  client.onerror = function () {
    console.log('Connection Error');
  };
  client.onopen = function () {
    console.log('WebSocket Client Connected');
    keepAlive();
  };
  client.onclose = function (e) {
    console.log('echo-protocol Client Closed');
    console.dir(e);
  };
  client.onmessage = function (e) {
    if (typeof e.data === 'string') {
      console.log("Received: '" + e.data + "'");
    }
    keepAlive();
  };
}

function handleWS (ws) {
  ws.on('message', function (data) {
    keepAlive();
    console.log('<<<Incoming msg: ' + data);
  });
  ws.on('error', function (data) {
    console.log('<<<Error! ' + data);
  });
  ws.on('open', function (data) {
    console.log('>>>open! ' + data + 'WS: ');
    // console.dir(ws);
    ws.send(JSON.stringify(testSub));
  });
  ws.on('upgrade', function (data) {
    console.log('>>>upgrade! ' + data);
    // ws.send(JSON.stringify(testSub));
  });
  ws.on('unexpected-response', function (req, resp) {
    console.log('>>>>> unexpected-response! Request: ');
    // console.dir(req);
    console.log('>>>>> unexpected-response! Response: ');
    console.dir(resp);
  });
  // handle heartbeat
  ws.on('open', keepAlive);
  ws.on('ping', keepAlive);
  ws.on('close', function (data) {
    console.log('Closing connection! ' + data);
    clearTimeout(this.pingTimeout);
  });
}
