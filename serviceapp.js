// Copyright (c) Microsoft. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

'use strict';

var Client = require('azure-iothub').Client;
var Message = require('azure-iot-common').Message;

var connectionString = "HostName=devhub-luca.azure-devices.net;SharedAccessKeyName=service;SharedAccessKey=5RliBOw8ijVwBHraKdCM8A3IKIvPuPnxXqrk7zAJ1PQ=";
if (!connectionString) {
  console.log('Please set the IOTHUB_CONNECTION_STRING environment variable.');
  process.exit(-1);
}

var targetDevice = "javaOnElite";

/*
var methodParams = {
  methodName: 'methodName1',
  payload: '[method payload]',
  responseTimeoutInSeconds: 15 // set response timeout as 15 seconds
};
*/
var client = Client.fromConnectionString(connectionString);
client.open(function (err) {
  if (err) {
    console.error('Could not connect: ' + err.message);
  } else {
    console.log('Client connected');
    let i =0;
    // Create a message and send it to the IoT Hub every second
    var loop = setInterval(function () {
      var data = JSON.stringify({ text : 'foo: ' + i});
      i++;
      var message = new Message(data);
      console.log('Sending message: ' + message.getData());
      client.send(targetDevice, message, () => {});
if (i = 50) loop = 0;
    }, 500);
  }
});
/*
client.invokeDeviceMethod(targetDevice, methodParams, function (err, result) {
  if (err) {
    console.error('Failed to invoke method \'' + methodParams.methodName + '\': ' + err.message);
    process.exit(-1);
  } else {
    console.log(methodParams.methodName + ' on ' + targetDevice + ':');
    console.log(JSON.stringify(result, null, 2));
    process.exit(0);
  }
})*/
