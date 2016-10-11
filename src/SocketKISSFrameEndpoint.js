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
var net=require('net');
var KISSFrameEndpoint=require('./KISSFrameEndpoint.js');
var KISSConnection=require('./KISSConnection.js');

var SocketKISSFrameEndpoint=function(host, port) {
  KISSFrameEndpoint.apply(this);
  this.host=host;
  this.port=port;
};

util.inherits(SocketKISSFrameEndpoint, KISSFrameEndpoint);

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
SocketKISSFrameEndpoint.prototype.emitConnect=function() {
  this.connection=new SocketKISSConnection(this.socket, this);
  this.emit('connect', this.connection);
}

SocketKISSFrameEndpoint.prototype.closeConnectionAndEmitDisconnect=function() {
  console.log("Closing connection");
  this.socket.destroy();
  this.connection.emit('close');
  this.emit('disconnect');
}
// Export the endpoint constructor.
module.exports=SocketKISSFrameEndpoint;

var SocketKISSConnection=function(socket,endpoint) {
  KISSConnection.apply(this);
  var self=this;
  self.socket=socket;
  self.socket.on('close', function() {
    console.log('Got socket closed event.');
    endpoint.error();
  })
  self.socket.on('data', function(data) {
    // Run the data through the KISSFrameParser.
    // It will emit a 'data' event when it has a frame.
    endpoint.kissFrameParser.data(self, data);
  });
}

util.inherits(SocketKISSConnection, KISSConnection);

SocketKISSConnection.write=function(buffer) {
  this.port.data(buffer);
}
