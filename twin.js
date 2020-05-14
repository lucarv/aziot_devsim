// Copyright (c) Microsoft. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

'use strict';
require('dotenv').config()
var Client = require('azure-iot-device').Client;
//var Protocol = require('azure-iot-device-amqp').Amqp;
var Protocol = require('azure-iot-device-mqtt').Mqtt;
var _ = require('lodash');

var deviceConnectionString = process.env.CONNECTION_STRING;
console.log(deviceConnectionString)
// create the IoTHub client
var client = Client.fromConnectionString(deviceConnectionString, Protocol);
console.log('got client');

// connect to the hub
client.open(function(err) {
  if (err) {
    console.error('could not open IotHub client');
  }  else {
    console.log('client opened');

    // Create device Twin
    client.getTwin(function(err, twin) {
      if (err) {
        console.error('could not get twin');
      } else {
        console.log('twin created');
        twin.on('properties.desired', function(delta) {
            console.log('new desired properties received:');
            console.log(JSON.stringify(delta));
        });
      }
    });
  }
});

        /*
        // Usage example #2: receiving an event if anything under
        // properties.desired.climate changes
        //
        // This code will output desired min and max temperature every time
        // the service updates either one.
        //
        // For example (service API code):
        //  twin.properties.desired.update({
        //    climate : {
        //      minTemperature: 68,
        //      maxTemperature: 76
        //    }
        //  });
        //
        
        twin.on('properties.desired.climate', function(delta) {
            if (delta.minTemperature || delta.maxTemperature) {
              console.log('updating desired temp:');
              console.log('min temp = ' + twin.properties.desired.climate.minTemperature);
              console.log('max temp = ' + twin.properties.desired.climate.maxTemperature);
            }
        });

        twin.on('properties.desired.climate.hvac.sytemControl', function(fanOn) {
            console.log('setting fan state to ' + fanOn);
        });

        // Usage example #4: handle add or delete operations.  The app developer
        // is responsible for inferring add/update/delete operations based on
        // the contents of the patch.
        //
        // This code will output the results of adding, updating, or deleting
        // modules.
        //
        // Add example (service API code):
        //  twin.properties.desired.update({
        //    modules : {
        //      wifi : { channel = 6, ssid = 'my_network' },
        //      climate : { id = 17, units = 'farenheit' }
        //    }
        //  });
        //
        // Update example (service API code):
        //  twin.properties.desired.update({
        //    modules : {
        //      wifi : { channel = 7, encryption = 'wpa', passphrase = 'foo' }
        //    }
        //  });
        //
        // Delete example (service API code):
        //  twin.properties.desired.update({
        //    modules : {
        //      climate = null
        //    }
        //  });
        //

        // To do this, first we have to keep track of "all modules that we know
        // about".
        var moduleList = {};

        // Then we use this internal list and compare it to the delta to know
        // if anything was added, removed, or updated.
        twin.on('properties.desired.modules', function(delta) {
          Object.keys(delta).forEach(function(key) {

            if (delta[key] === null && moduleList[key]) {
              // If our patch contains a null value, but we have a record of
              // this module, then this is a delete operation.
              console.log('deleting module ' + key);
              delete moduleList[key];

            } else if (delta[key]) {
              if (moduleList[key]) {
                // Our patch contains a module, and we've seen this before.
                // Must be an update operation.
                console.log('updating module ' + key + ':');
                console.log(JSON.stringify(delta[key]));
                // Store the complete object instead of just the delta
                moduleList[key] = twin.properties.desired.modules[key];

              } else {
                // Our patch contains a module, but we've never seen this
                // before.  Must be an add operation.
                console.log('adding module ' + key + ':');
                console.log(JSON.stringify(delta[key]));
                // Store the complete object instead of just the delta
                moduleList[key] = twin.properties.desired.modules[key];
              }
            }
          });
        });

        // create a patch to send to the hub
        var patch = {
          firmwareVersion:'1.2.1',
          weather:{
            temperature: 72,
            humidity: 17
          }
        };

         // send the patch
        twin.properties.reported.update(patch, function(err) {
          if (err) throw err;
          console.log('twin state reported');
        });
      }
    });
  }
});
*/