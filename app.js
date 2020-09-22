// Copyright (c) Microsoft. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

'use strict';
require('dotenv').config()
const fs = require('fs');
const Protocol = require('azure-iot-device-mqtt').Mqtt;
const Client = require('azure-iot-device').Client;
const Message = require('azure-iot-device').Message;
const defaults = require('./payloads.json');
var msgidx = 0;
var lastSentValues = Object.assign({}, defaults);
const connectionString = process.env.CONNECTION_STRING,
  deviceId = process.env.DEVICE_ID,
  authType = process.env.AUTH_TYPE
var tele,
  interval = 5000;
var certFile, keyFile;
const currentPath = process.cwd();

/*
const parseConnectionString = () => {
  let didStart = connectionString.substring(connectionString.indexOf('DeviceId') + 9);
  let didEnd = didStart.indexOf(';')
  deviceId = didStart.substring(0, didEnd)
  if (connectionString.includes('GatewayHostName')) {
    authType = 'leaf';
    x509 = true;
  } else if (connectionString.includes('x509')) {
    authType = 'x509';
    x509 = true;
  } else authType = 'psk';
}
*/
const telemetry = () => {
  /*
  var payload = '';
  if (defaults.array) {
    payload = defaults.messages[msgidx];
    msgidx++;
    if (msgidx > defaults.messages.length)
      msgidx = 0;
  } else {
    for (var key in lastSentValues) {
      if (typeof lastSentValues[key] == 'number')
        lastSentValues[key] += Math.random()
    }
    lastSentValues['timeStamp'] = new Date();
    payload = JSON.stringify(lastSentValues);
  }
  */
  let payload = {"something_random": MATH.random()}
  //let messageBytes = Buffer.from(payload, "utf8");
  let messageBytes = Buffer.from(JSON.stringify(payload))
  let message = new Message(messageBytes);
/*
  message.contentEncoding = "utf-8";
  message.contentType = "application/json";
*/
  client.sendEvent(message, function (err) {
    if (err) {
      console.error('Could not send: ' + err.toString());
    } else {
      console.error('Event sent to hub: ' + JSON.stringify(payload));
    }
  });
}

var client = Client.fromConnectionString(connectionString, Protocol);
if (authType == 'x509') {
  certFile = currentPath + '/cert/' + deviceId + '_cert.pem';
  keyFile = currentPath + '/cert/' + deviceId + '_key.pem';
  if (!certFile || !keyFile) {
    console.log('Invalid or Missing X.509 files');
    process.exit(-1);
  } else {
    var options = {
      cert: fs.readFileSync(certFile, 'utf-8').toString(),
      key: fs.readFileSync(keyFile, 'utf-8').toString()
    };
    client.setOptions(options);
  }
}


console.log('......will try to connect....');

client.open(function (err) {
  console.log('.....trying to connect to iothub .....');
  if (err) {
    console.error('Could not connect: ' + err.message);
  } else {
    console.log(`${deviceId} connected`);
  }
});

client.getTwin(function (err, twin) {
  if (err) {
    console.error('could not get twin');
    process.exit(-1);
  } else {
    console.log('twin created');
    twin.on('properties.desired', function (delta) {
      console.log('new desired properties received:');
      console.log(JSON.stringify(delta));
      if (delta.hasOwnProperty('telemetry')) {
        if (delta.telemetry.status) {
          console.log('send telemetry at ' + delta.telemetry.interval + ' interval')
          tele = setInterval(telemetry, delta.telemetry.interval);
        } else {
          console.log('stop telemetry')
          clearInterval(tele)
        }
      }
    });
  }
});

client.on('error', function (err) {
  console.error(err.message);
  process.exit(-1);
});

client.on('message', function (msg) {
  console.log('-------------------------------');
  console.log(' ' + msg.data.toString());
  console.log('-------------------------------');

  client.complete(msg, function (err) {
    if (err) {
      client.error('could not settle message: ' + err.toString());
      process.exit(-1);
    } else {
      console.log(`message received`);
    }
  });
});

// register handler for 'start'
client.onDeviceMethod('start', function (request, response) {
  var responsePayload = {
    result: 'started'
  };
  if (request.payload !== null) {
    if (request.payload.hasOwnProperty('interval')) {
      interval = request.payload.interval;
    }
  }
  console.log('received a request to start telemetry at interval: ' + interval);

  tele = setInterval(telemetry, interval);
  var responsePayload = {
    result: 'telemetry startd at intervals of: ' + interval + ' ms'
  };
  response.send(200, responsePayload, function (err) {
    if (err) {
      console.error('Unable to send method response: ' + err.toString());
    }
  });
});

// register handler for 'stop'
client.onDeviceMethod('stop', function (request, response) {
  console.log('\nreceived a request to stop telemetry');
  clearInterval(tele);

  var responsePayload = {
    result: 'stopped'
  };

  response.send(200, responsePayload, function (err) {
    if (err) {
      console.error('Unable to send method response: ' + err.toString());
    }
  });
});

// register handler for 'reset'
client.onDeviceMethod('reset', function (request, response) {
  console.log('received a request for reset');
  lastSentValues = Object.assign({}, defaults);

  var responsePayload = {
    result: 'sensor reset'
  };

  response.send(200, responsePayload, function (err) {
    if (err) {
      console.error('Unable to send method response: ' + err.toString());
    }
  });
});

// register handler for 'close'
client.onDeviceMethod('close', function (request, response) {
  console.log('received a request to disconnect');

  var responsePayload = {
    result: 'device will disconnect'
  };

  response.send(200, responsePayload, function (err) {
    if (err) {
      console.error('Unable to send method response: ' + err.toString());
    } else {
      client.close(function (err) {
        if (err) {
          console.error('Unable to close the connection: ' + err.toString());
        } else {
          console.log('exiting....')
          process.exit(0);
        }
      });
    }
  });
});