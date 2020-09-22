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
3. set env properties for CONNECTION_STRING, DEVICE_ID and AUTH_TYPE (set this tp PSK)
```
CONNECTION_STRING=HostName=xxx.azure-devices.net;DeviceId=mydevice;SharedAccessKey=zzzzzzzzzccxcedvdvfebtrwbfdbvad=
DEVICE_ID=mydevice
AUTH_TYPE=PSK
```
4. run the sample for a normal device from the command line  
```
> node app 
```
5. run the sample for a constrained device from the command line (better instructions soon)  
```
> node constrained 
```
6. Note eventual text output to the console.
