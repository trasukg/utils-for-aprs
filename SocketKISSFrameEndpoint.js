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
var EventEmitter=require('events');
var net=require('net');
var framing=require('./kiss-framing.js');

// 'connection-machine-states' contains a state machine description that has the
// persistent connection behaviour that we want.
var states= require('./connection-machine-states.js');

var SocketKISSFrameEndpoint=function(host, port) {
  this.host=host;
  this.port=port;
  StateMachine.call(self, states, 'Idle');
  this.kissFrameParser=framing.tncFrameParser();
};

util.inherits(SocketKISSFrameEndpoint, EventEmitter);

SocketKISSFrameEndpoint.prototype.openConnection=function() {
  // The closures will be called in the context of the socket, so store the current
  // value of 'this' for use in the closures.
  var self=this;
  self.socket= net.connect({
    host: self.host,
    port: self.port
  }, function(err) {
    if(!err) {
      self.connectionSucceeded();
    } else {
      self.connectionFailed(err);
    }
  });
  self.socket.on('error', function(err) {
    //console.log("this=" + JSON.stringify(self));
    console.log("Got error:" + err);
    self.error(err);
  });
  self.socket.on('close', function() {
    console.log('Got socket closed event.');
    self.error();
  })
  self.socket.on('data', function(data) {
    // Run the data through the KISSFrameParser.
    // It will emit a 'data' event when it has a frame.
    self.kissFrameParser.data(self, data);
  });
}

SocketKISSFrameEndpoint.prototype.closeConnection=function() {
  console.log("Closing connection");
  this.socket.destroy();
}

SocketKISSFrameEndpoint.prototype.triggerWait=function() {
  // The closures will be called in the context of the socket, so store the current
  // value of 'this' for use in the closures.
  var self=this;
  setTimeout(function() {
    self.timeout();
  }, 5000)
}

// Export the endpoint constructor.
module.exports=SocketKISSFrameEndpoint;
