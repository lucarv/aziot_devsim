// Copyright (c) Microsoft. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

'use strict';
require('dotenv').config()
var uuid = require('uuid');

var Protocol = require('azure-iot-device-mqtt').Mqtt;
var Client = require('azure-iot-device').Client;
var Message = require('azure-iot-device').Message;

// String containing Hostname, Device Id & Device Key in the following formats:
//  "HostName=<iothub_host_name>;DeviceId=<device_id>;SharedAccessKey=<device_key>"
var connectionString = process.env.cs;
var deviceId = connectionString.substring((connectionString.indexOf(';Device') + 10), connectionString.indexOf(';SharedAccess'))
console.log(deviceId);

// fromConnectionString must specify a transport constructor, coming from any transport package.
var client = Client.fromConnectionString(connectionString, Protocol);

var counter = 0;

const run = () => {
  counter++;
  client.open(function (err) {
    if (err) {
      console.error('Could not connect: ' + err.message);
    } else {
      // connect
      console.log(`${new Date()}: ${deviceId} connected`);
      let payload = {
        counter,
        "messageId": uuid.v4()
      }
      let message = new Message(JSON.stringify(payload));
      message.properties.add('tenant', 'electrolux');
      // send telemetry
      client.sendEvent(message, function (err) {
        if (err) {
          console.error('Could not send: ' + err.toString());
          process.exit(-1);
        } else {
          console.log('sent message #' + counter);
          // wait 5 seconds then disconnect
          setTimeout(function () {
            client.close(function (err) {
              if (err) {
                console.error('Unable to close the connection: ' + err.toString());
              } else {
                console.log(`${new Date()}: ${deviceId} disconnected`);
              }
            });
          }, process.env.wait);
        }
      });
    }
  });
};

setInterval(run, process.env.FREQ);
