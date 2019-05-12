let tibberLib = require('../nodes/tibbermodule.js');
let WebSocket = require('ws');
let homeId = 'c70dcbe5-4485-4821-933d-a8a86452737b';
let WebSocketClient = require('websocket').client;
let W3CWebSocket = require('websocket').w3cwebsocket;
// import ApolloClient from 'apollo-boost';

var token = 'd1007ead2dc84a2b82f0de19451c5fb22112f7ae11d19bf2bedb224a003ff74a';
var testSub = { query: 'subscription{ liveMeasurement(homeId:"c70dcbe5-4485-4821-933d-a8a86452737b"){timestamp power maxPower accumulatedConsumption accumulatedCost}}',
  id: 'ssd-xsd', type: 'subscription_start' };
var pingTimeout;
var url = 'wss://api.tibber.com/v1-beta/gql/subscriptions';

tibberLib.setConfig({ url: 'https://api.tibber.com/v1-beta/gql', token: 'd1007ead2dc84a2b82f0de19451c5fb22112f7ae11d19bf2bedb224a003ff74a' });

subNew();

function keepAlive () {
  clearTimeout(pingTimeout);
  pingTimeout = setTimeout(() => {
    this.terminate();
  }, 50000 + 1000);
}

function subApollo () {
  const client = new ApolloClient({
    uri: url
  });

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
    // console.dir(connection);
    // console.dir(socket);
    handleWS(connection);
    //init and logon
    connection.sendUTF(JSON.stringify( {"type":"init","payload":"token=d1007ead2dc84a2b82f0de19451c5fb22112f7ae11d19bf2bedb224a003ff74a"}) );
    /* connection.sendUTF(JSON.stringify(testSub), null, function (data) {
      console.log('>>sendt: ' + data);
    }); */
  });
  ws2.on('connectFailed', function (error) {
    console.log('<<< Failed connection');
    console.dir(error);
  });
  ws2.connect(url, 'graphql-subscriptions', '13', {
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'bearer ' + token
    }
  });
}

function subW3c () {
  let client = new W3CWebSocket(url, 'graphql-subscriptions');

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
    console.log('<<<Incoming msg: ');
    let msg = JSON.parse(data.utf8Data);
    console.dir(data);

    switch (msg.type) {
      case 'init_success':
        ws.sendUTF(JSON.stringify(testSub), null);
        break;
      default:
        break;
    }
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
  ws.on('close', function (data ,reason) {
    console.log('Closing connection! ' + data + ' - ' + reason);
    clearTimeout(this.pingTimeout);
  });
}
