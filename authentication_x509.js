// Copyright (c) Microsoft. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

'use strict';

var fs = require('fs');
var Protocol = require('azure-iot-device-mqtt').Mqtt;
// Uncomment one of these transports and then change it in fromConnectionString to test other transports
// var Protocol = require('azure-iot-device-amqp').AmqpWs;
// var Protocol = require('azure-iot-device-http').Http;
// var Protocol = require('azure-iot-device-amqp').Amqp;
var Client = require('azure-iot-device').Client;

// String containing Hostname and Device Id in the following format:
//  "HostName=<iothub_host_name>;DeviceId=<device_id>;x509=true"
var connectionString = "HostName=devhub-luca.azure-devices.net;DeviceId=kumanx509;x509=true";
var certFile = "./cert/kumanx509_cert.pem"
var keyFile = "./cert/kumanx509_key.pem";

if (!connectionString || !certFile || !keyFile) {
  console.log('Please set the DEVICE_CONNECTION_STRING, DEVICE_CERT_FILE and DEVICE_CERT_KEY_FILE environment variables. If your key file requires a passphrase please set the DEVICE_CERT_KEY_PASSPHRASE environmenet variable');
  process.exit(-1);
}

// fromConnectionString must specify a transport constructor, coming from any transport package.
var client = Client.fromConnectionString(connectionString, Protocol);


 var options = {
   cert : fs.readFileSync(certFile, 'utf-8').toString(),
   key : fs.readFileSync(keyFile, 'utf-8').toString(),
   passphrase: passphrase
 };

// Calling setOptions with the x509 certificate and key (and optionally, passphrase) will configure the client transport to use x509 when connecting to IoT Hub
client.setOptions(options);

client.open(function (err) {
  if (err) {
    console.error(err.toString());
    process.exit(-1);
  } else {
    console.log('Successfully connected with the x509 certificate');
    process.exit(0);
  }
});
