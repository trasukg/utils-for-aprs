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
var net=require('net');
var AprsDataEndpoint=require('./AprsDataEndpoint.js');
var AprsDataConnection=require('./AprsDataConnection.js');

/**
This is the browser form of this class, that uses the native WebSocket.

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

@alias utils-for-aprs.SocketKISSFrameEndpoint
@extends utils-for-aprs.KISSFrameEndpoint
@class
*/

var WebSocketAprsDataEndpoint=function(url) {
  AprsDataEndpoint.apply(this);
  this.url=url;
};

util.inherits(WebSocketAprsDataEndpoint, AprsDataEndpoint);

WebSocketAprsDataEndpoint.prototype.openConnection=function() {
  // The closures will be called in the context of the socket, so store the current
  // value of 'this' for use in the closures.
  var self=this;
  self.socket= new WebSocket(self.url);
  self.socket.onopen=function() {
    self.connectionSucceeded();
  };
  self.socket.onerror=function(err) {
    //console.log("this=" + JSON.stringify(self));
    console.log("Got error:" + err);
    self.error(err);
  };
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
*/
WebSocketAprsDataEndpoint.prototype.emitConnect=function() {
  this.connection=new WebSocketAprsDataConnection(this.socket, this);
  this.emit('connect', this.connection);
}

WebSocketAprsDataEndpoint.prototype.closeConnectionAndEmitDisconnect=function() {
  console.log("Closing connection");
  this.socket.close();
  this.connection.emit('close');
  this.emit('disconnect');
}
// Export the endpoint constructor.
module.exports=WebSocketAprsDataEndpoint;

var WebSocketAprsDataConnection=function(socket,endpoint) {
  AprsDataConnection.apply(this);
  var self=this;
  self.socket=socket;
  self.socket.onclose=function() {
    console.log('Got socket closed event.');
    endpoint.error();
  };
  self.socket.onmessage=function(event) {
    var message=JSON.parse(event.data);
    if (message.aprsData) {
      // It will emit a 'data' event when it has a frame.
      endpoint.emit('aprsData', message.aprsData);
    }
  };
}

util.inherits(WebSocketAprsDataConnection, AprsDataConnection);

WebSocketAprsDataConnection.prototype.aprsData=function(data) {
  this.socket.write({aprsData: data});
}
