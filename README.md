# Device simulator for IoT Hub Client

## How to run this sample:

Note: if you are running this on a raspberry pi, nake sure you have node.js v10 or higher installed  

0. If you intend to connect using certificates, please visit [this URL](https://docs.microsoft.com/en-us/azure/iot-dps/quick-create-simulated-device-x509-node) for instructions  
1. clone this repo  
```
> git clone git://github.com/lucarv/aziot_devsim.git
> cd aziot_devsim
```
2. install dependencies  
```
> npm install
```
3. edit the payloads.josn file with templates for your telemetry payload. It should be an array, and when you start the script, you pass the array index as the first command line argument  
4. run the sample for a normal device from the command line  
```
> node app [INDEX] "HostName=[HUBNAME].azure-devices.net;DeviceId=[DEVICEID];x509=true"   
or
> node app [INDEX] "HostName=[HUBNAME].azure-devices.net;DeviceId=[DEVICEID];SharedAccessKey=[PSK]"
```
5. run the sample for a constrained device from the command line (better instructions soon)  
```
> node constrained 
```
6. Note eventual text output to the console.
