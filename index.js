// Copyright (c) Microsoft. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

'use strict';
require('dotenv').config()

var uuid = require('uuid');
var Protocol = require('azure-iot-device-mqtt').Mqtt;
// Uncomment one of these transports and then change it in fromConnectionString to test other transports
// var Protocol = require('azure-iot-device-amqp').AmqpWs;
//var Protocol = require('azure-iot-device-http').Http;
//var Protocol = require('azure-iot-device-amqp').Amqp;
// var Protocol = require('azure-iot-device-mqtt').MqttWs;

var Client = require('azure-iot-device').Client;
var Message = require('azure-iot-device').Message;

// String containing Hostname, Device Id & Device Key in the following formats:
//  "HostName=<iothub_host_name>;DeviceId=<device_id>;SharedAccessKey=<device_key>"
var connectionString = process.env.cs;

// fromConnectionString must specify a transport constructor, coming from any transport package.
var client = Client.fromConnectionString(connectionString, Protocol);

var temperature = 25;
var tele;


const telemetry = () => {
  // any type of data can be sent into a message: bytes, JSON...but the SDK will not take care of the serialization of objects.
  //let payload = message_array[Math.floor(Math.random() * (200 - 1) + 1)]
  let payload = {
    "temperature": temperature,
    "timestamp": Date.now()
  }

  console.log('Current Sensor Temperature is: ' + payload.temperature)
  /**/
  let message = new Message(JSON.stringify(payload));

  // A message can have custom properties that are also encoded and can be used for routing
  message.properties.add('deviceType', 'test');

  // A unique identifier can be set to easily track the message in your application
  message.messageId = uuid.v4();
  client.sendEvent(message, function (err) {
    if (err) {
      console.error('Could not send: ' + err.toString());
      process.exit(-1);
    } else {
      temperature += 0.5
    }
  });
};

client.open(function (err) {
  if (err) {
    console.error('Could not connect: ' + err.message);
  } else {
    console.log('Client connected');
    // Create device Twin
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
      // The AMQP and HTTP transports also have the notion of completing, rejecting or abandoning the message.
      // When completing a message, the service that sent the C2D message is notified that the message has been processed.
      // When rejecting a message, the service that sent the C2D message is notified that the message won't be processed by the device. the method to use is client.reject(msg, callback).
      // When abandoning the message, IoT Hub will immediately try to resend it. The method to use is client.abandon(msg, callback).
      // MQTT is simpler: it accepts the message by default, and doesn't support rejecting or abandoning a message.
    });

    // register handler for 'reset'
    client.onDeviceMethod('reset', function (request, response) {
      console.log('received a request for reset');
      temperature = 25
      var responsePayload = {
        result: 'sensor reset'
      };

      response.send(200, responsePayload, function (err) {
        if (err) {
          console.error('Unable to send method response: ' + err.toString());
          process.exit(-1);
        } else {
          console.log('response to reset sent.');
        }
      });
    });
  }
});