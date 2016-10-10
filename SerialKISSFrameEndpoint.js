/*
Licensed to the Apache Software Foundation (ASF) under one
or more contributor license agreements.  See the NOTICE file
distributed with this work for additional information
regarding copyright ownership.  The ASF licenses this file
to you under the Apache License, Version 2.0 (the
"License"); you may not use this file except in compliance
with the License.  You may obtain a copy of the License at

  http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing,
software distributed under the License is distributed on an
"AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, either express or implied.  See the License for the
specific language governing permissions and limitations
under the License.
*/

/*
This is an "Endpoint" that attempts to make a connection to a TCP KISS
device, e.g. an instance of the DireWolf soundcard modem.

Once enabled (by calling 'enable()'), the endpoint attempts to make a connection
to the host and port that have been set into its properties.

It will emit 'connect' and 'disconnect' events when it makes and/or loses a
connection.  If the initial connection fails, or the connection is lost, the
endpoint waits for a certain period of time (default 5s, configured by retryTime),
and then attempts to reconnect.

Once connected, it scans the input for properly-framed KISS packets, removing any
byte-stuffing as required.  When a KISS frame is received, the endpoint emits a
'data' event, with the received frame as the argument.
*/

var util=require('util');
var StateMachine=require('./StateMachine.js');
var SerialPort=require('serialport').SerialPort;
var EventEmitter=require('events');
var net=require('net');
var framing=require('./kiss-framing.js');

// 'connection-machine-states' contains a state machine description that has the
// persistent connection behaviour that we want.
var states= require('./connection-machine-states.js');

var SerialKISSFrameEndpoint=function(device, options) {
  this.device=device;
  this.options=options;
  StateMachine.call(this, states, 'Idle');
  this.kissFrameParser=framing.tncFrameParser();
};

util.inherits(SerialKISSFrameEndpoint, EventEmitter);

SerialKISSFrameEndpoint.prototype.openConnection=function() {
  // The closures will be called in the context of the socket, so store the current
  // value of 'this' for use in the closures.
  var self=this;
  self.port=new SerialPort(self.device, self.options, function(err) {
    if(!err) {
      self.connectionSucceeded();
    } else {
      self.connectionFailed(err);
    }
  });
  self.port.on('error', function(err) {
    //console.log("this=" + JSON.stringify(self));
    console.log("Got error:" + err);
    self.error(err);
  });
  self.port.on('close', function() {
    console.log('Got socket closed event.');
    self.error();
  })
  self.port.on('data', function(data) {
    // Run the data through the KISSFrameParser.
    // It will emit a 'data' event when it has a frame.
    self.kissFrameParser(self, data);
  });
}

SerialKISSFrameEndpoint.prototype.closeConnection=function() {
  console.log("Closing connection");
  this.port.close();
}

SerialKISSFrameEndpoint.prototype.triggerWait=function() {
  // The closures will be called in the context of the socket, so store the current
  // value of 'this' for use in the closures.
  var self=this;
  setTimeout(function() {
    self.timeout();
  }, 5000)
}

// Export the endpoint constructor.
module.exports=SerialKISSFrameEndpoint;
