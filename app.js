// Copyright (c) Microsoft. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

'use strict';
var fs = require('fs');
var Protocol = require('azure-iot-device-mqtt').Mqtt;
var Client = require('azure-iot-device').Client;
var Message = require('azure-iot-device').Message;
var payloads = require('./payloads.json');
var defaults = payloads[0];

/*
new stuff for later 

var type = process.argv[2]
let defaults = payloads[type];

var connectionString = process.argv[3];
*/

var connectionString = { ENTER YOUR CONNECTION STRING HERE }
//"HostName=XXXXX.azure-devices.net;DeviceId=XXXXX;SharedAccessKey=XXXXX"
var type = '0';
var deviceIdMarker = connectionString.indexOf(';DeviceId');
var x509Marker = connectionString.indexOf(';x509')
var edgeMarker = connectionString.indexOf(';GatewayHostName')
var deviceId, certFile, keyFile;
var currentPath = process.cwd();
var x509 = false;

if ( x509Marker > -1 ){
  x509 = true;
  deviceId = connectionString.substring(deviceIdMarker + 10, endMarker);
  console.log('X509: ' + deviceId);
  certFile = currentPath + '/cert/' + deviceId +'_cert.pem';
  keyFile = currentPath + '/cert/' + deviceId +'_key.pem';
  if (!connectionString || !certFile || !keyFile) {
    console.log('Invalid or Missing X.509 files');
    process.exit(-1);
  }
} else {
  console.log('PSK: ' + deviceId);
  deviceId = connectionString.substring((connectionString.indexOf(';DeviceId') + 10), connectionString.indexOf(';SharedAccess'))

}

var client = Client.fromConnectionString(connectionString, Protocol);
if (x509) {
  var options = {
    cert : fs.readFileSync(certFile, 'utf-8').toString(),
    key : fs.readFileSync(keyFile, 'utf-8').toString()
  };
 client.setOptions(options);
}
var tele;

const telemetry = () => {
  var payload = {}
  switch (type) {
    case '0':
      for(var key in defaults){
        if (typeof defaults[key] == 'number')
          defaults[key] = defaults[key] + Math.random()
          payload[key] =   defaults[key]    
      }
      payload.posix_time = Date.now();
      break;
    case '1':
      for(var key in defaults){
        if (typeof defaults[key] == 'number')
          payload[key] = defaults[key] + Math.random() ;
          else  
          payload[key] = defaults[key]   
      }
      payload.posix_time = Date.now();
      break;
    case '2':
      for(var key in defaults){
        if (typeof defaults[key] == 'number')
          payload[key] = defaults[key] + Math.random() ;
          else  
          payload[key] = defaults[key]   
      }
      payload.time = new Date();
      break;
    case '3': {
      payload["messageVersion"] = 1;
      payload["timestamp"] = new Date();
      payload["resourceID"] = "Machine01";
      payload["eventType"] = 0;
      payload["data"] = {
        "productionOrderNumber": 123456788,
        "materialNumber": 987654321,
        "amount": Math.round(Math.random() * (20 - 1) + 1),
        "productStatus": Math.round(Math.random() * (3 - 1) + 1)
      }
      break;
    }
    default: {
      process.exit(0);
      break;
    }
  }
  // Encode message body using UTF-8  
  let messageBody = JSON.stringify(Object.assign({}, payload));
  let messageBytes = Buffer.from(messageBody, "utf8");
  let message = new Message(messageBytes);

  message.contentEncoding = "utf-8";
  message.contentType = "application/json";

  client.sendEvent(message, function (err) {
    if (err) {
      console.error('Could not send: ' + err.toString());
    } else {
      console.error('Event sent to hub: ' + JSON.stringify(payload));
    }
  });
};

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
      console.log('message successfully accepted');
    }
  });
});

// register handler for 'start'
client.onDeviceMethod('start', function (request, response) {
  var interval = 5000;
  console.log('received a request to start telemetry');
  var responsePayload = {
    result: 'started'
  };
  if (request.payload !== null) {
    if (request.payload.interval !== 'null') {
      interval = request.payload.interval;
    }
  }

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
  defaults.temperature = 20
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