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

var util=require('util');
var SerialPort=null; //require('serialport');
var KISSConnection=require('./KISSConnection.js');
var KISSFrameEndpoint=require('./KISSFrameEndpoint');

/**
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
@alias module:utils-for-aprs.SerialKISSFrameEndpoint
@extends KISSFrameEndpoint
@fires KISSFrameEndpoint#connection
@constructor
*/
var SerialKISSFrameEndpoint=function(options) {
  // Lazy-load the serialport library, only if we try to create a serial 
  // connection.
  if (SerialPort === null) {
    SerialPort=require("serialport").SerialPort;
  }
  KISSFrameEndpoint.apply(this);
  this.options=options;
};

util.inherits(SerialKISSFrameEndpoint, KISSFrameEndpoint);

/**
  Open the serial connection, and then call connectionSucceeded() or connectionFailed()
  as appropriate.  The state machine then transitions, and will look after
  emitting the appropriate event.
  @private
*/
SerialKISSFrameEndpoint.prototype.openConnection=function() {
  // The closures will be called in the context of the socket, so store the current
  // value of 'this' for use in the closures.
  var self=this;
  self.emit('connecting', self.device, self.options);
  self.port=new SerialPort(self.options, function(err) {
    if(!err) {
      self.connectionSucceeded();
    } else {
      self.connectionFailed(err);
    }
  });
  self.port.on('error', function(err) {
    self.error(err);
  });
  self.port.on('close', function() {
    self.error();
  })
  self.port.on('data', function(data) {
    // Run the data through the KISSFrameParser.
    // It will emit a 'data' event when it has a frame.
    self.kissFrameParser(self.connection, data);
  });
}

/**
  The connection machine state table calls this function when the
  Connected state is entered.  It should create a KISSConnection object that
  is wrapped around the actual connection, and then emit a 'connect' event that
  passes the KISSConnection object as its argument.  Clients can then subscribe
  to either 'data' events on the KISSConnection to receive frames.  They can
  also call 'data(frame)' on the KISSConnection to send a frame.  When the
  connection gets closed, it will emit a 'closed' event, so the client knows to
  stop using it.

  @private
*/
SerialKISSFrameEndpoint.prototype.emitConnect=function() {
  this.connection=new SerialKISSConnection(this.port, this);
  this.emit('connect', this.connection);
}

SerialKISSFrameEndpoint.prototype.closeConnectionAndEmitDisconnect=function() {
  console.log("Closing connection");
  this.port.close();
  this.connection.emit('close');
  this.emit('disconnect');
}

// Export the endpoint constructor.
module.exports=SerialKISSFrameEndpoint;

var SerialKISSConnection=function(port, endpoint) {
  KISSConnection.apply(this);
  this.port=port;
  this.endpoint=endpoint;
}

util.inherits(SerialKISSConnection, KISSConnection);

SerialKISSConnection.prototype.write=function(buffer) {
  this.port.write(buffer);
};

SerialKISSConnection.prototype.flush=function() {
  // No-op
}
