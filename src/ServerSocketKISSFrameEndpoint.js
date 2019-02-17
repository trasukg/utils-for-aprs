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
@module utils-for-aprs.ServerSocketKISSFrameEndpoint

This is an "Endpoint" that sets up a server socket and then waits for connections
on it.

Once enabled (by calling 'enable()'), the endpoint opens the server socket on the
designated port.

It will emit 'connect' and 'disconnect' events when it makes and/or loses a
connection.  If the initial server socket open fails, or the server socket
has an error, the endpoint waits for a certain period of time (default 5s,
configured by retryTime), and then attempts to open the server socket again.

It emits 'listening' and 'disconnected' events depending on the state of the
server socket.

The KISSConnections spawned on succesful listen() operations send and receive
KISS packets.
*/

var util=require('util');
var net=require('net');
var EventEmitter=require('events');
var KISSConnection=require('./KISSConnection');
var framing=require('./kiss-framing');
var Escaper=framing.Escaper;
var StateMachine=require('@trasukg/state-machine');

var states={
  Idle: {
    enable: 'Opening',
    disable: 'Idle',
    error: 'Idle',
    timeout: 'Idle'
  },
  Opening: {
    onEntry: function() { this.openSocket(); },
    openSucceeded: 'Listening',
    openFailed: 'WaitingRetry',
    error: 'WaitingRetry',
    disable: ['Idle', function() {this.closeSocket(); }],
  },
  Listening: {
    disable: 'Idle',
    error: 'WaitingRetry',
    onExit: function() { this.closeSocketAndEmitDisconnect(); },
    onEntry: function() { this.emitListening(); }
  },
  WaitingRetry: {
    disable: 'Idle',
    error: 'WaitingRetry',
    timeout: 'Opening',
    onEntry: function() { this.triggerWait(); },
  }
};

var ServerSocketKISSFrameEndpoint=function(iface, port) {
  EventEmitter.apply(this);
  StateMachine.call(this, states, 'Idle');
  this.host=iface;
  this.port=port;
  this.kissFrameParser=framing.tncFrameParser();
};

util.inherits(ServerSocketKISSFrameEndpoint, EventEmitter);

ServerSocketKISSFrameEndpoint.prototype.openSocket=function() {
  // The closures will be called in the context of the socket, so store the current
  // value of 'this' for use in the closures.
  var self=this;
  self.serverSocket= net.createServer();
  self.serverSocket.on('error', function(err) {
    //console.log("this=" + JSON.stringify(self));
    console.log("Got error:" + err);
    self.error(err);
  });
  self.serverSocket.on('connection', function(socket) {
    var connection=new ServerSocketKISSConnection(socket, self);
    self.emit('connect', connection);
  });
  self.serverSocket.listen({ host: self.host, port: self.port }, function() {
    self.openSucceeded()
  });
}

/*
  The connection machine state table calls this function when the
  Connected state is entered.  It should create a KISSConnection object that
  is wrapped around the actual connection, and then emit a 'connect' event that
  passes the KISSConnection object as its argument.  Clients can then subscribe
  to either 'data' events on the KISSConnection to receive frames.  They can
  also call 'data(frame)' on the KISSConnection to send a frame.  When the
  connection gets closed, it will emit a 'closed' event, so the client knows to
  stop using it.
*/
ServerSocketKISSFrameEndpoint.prototype.emitListening=function() {
  this.emit('listening');
}

ServerSocketKISSFrameEndpoint.prototype.closeSocketAndEmitDisconnect=function() {
  this.closeSocket();
  this.emit('disconnect');
}

ServerSocketKISSFrameEndpoint.prototype.closeSocket=function() {
  console.log("Closing server socket");
  this.serverSocket.close();
  /*
  It seems this was never actually called, because the usage of getConnections()
  is wrong; it actually returns an integer count of connections, not a list of
  active connections.

  If it turns out to be actually needed, we'll have to implement it ourselves
  by tracking the connect and socket.close events.

  For now just comment it out.
  
  this.serverSocket.getConnections().forEach(function(socket) {
    socket.end();
  });
  */
}
/**
  Called by the state machine states to trigger a timer that will call
  the timeout() method after a fixed time span (5000ms).
*/
ServerSocketKISSFrameEndpoint.prototype.triggerWait=function() {
  // The closures will be called in the context of the socket, so store the current
  // value of 'this' for use in the closures.
  var self=this;
  setTimeout(function() {
    self.timeout();
  }, 5000)
}

// Export the endpoint constructor.
module.exports=ServerSocketKISSFrameEndpoint;

var ServerSocketKISSConnection=function(socket, endpoint) {
  //console.log('Setting up ServerSocketKISSConnection.  endpoint.prototype is =' + JSON.stringify(endpoint.prototype));
  KISSConnection.apply(this);
  var self=this;
  self.socket=socket;
  self.socket.on('close', function() {
    console.log('Got socket closed event.');
    self.emit('close');
  });
  self.socket.on('error', function(err) {
    console.log('Got socket error event.');
    self.emit('socketError', err);
  });
  self.socket.on('data', function(data) {
    // Run the data through the KISSFrameParser.
    // It will emit a 'data' event when it has a frame.
    endpoint.kissFrameParser(self, data);
  });
}

util.inherits(ServerSocketKISSConnection, KISSConnection);

ServerSocketKISSConnection.prototype.write=function(buffer) {
  this.socket.write(buffer);
}

ServerSocketKISSConnection.prototype.flush=function() {
  // No-op
}
