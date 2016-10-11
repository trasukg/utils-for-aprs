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
var framing=require('./kiss-framing.js');
var KISSConnection=require('./KISSConnection.js');

// 'connection-machine-states' contains a state machine description that has the
// persistent connection behaviour that we want.
var states= require('./connection-machine-states.js');

var KISSFrameEndpoint=function() {
  EventEmitter.apply(this);
  StateMachine.call(this, states, 'Idle');
  this.kissFrameParser=framing.tncFrameParser();
};

util.inherits(KISSFrameEndpoint, EventEmitter);

/**
  @abstract openConnection
  This function should open the physical connection.  It is called on
  entry to the Connecting state.  On successful opening, it should call
  'self.connectionSucceeded()' and on failure, it should call 'self.connectionFailed()',
  as expected by the state machine.

*/
KISSFrameEndpoint.prototype.openConnection=function() {

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

  When data arrives on the underlying port, it should be passed through the
  kissFrameParser, such that the connection object emits a 'data' event that
  contains the unescaped KISS frame, with the command header stripped.
*/
KISSFrameEndpoint.prototype.emitConnection=function() {
  this.emit('connection', undefined);
}

KISSFrameEndpoint.prototype.closeConnectionAndEmitDisconnect=function() {
  this.emit('disconnect');
}

KISSFrameEndpoint.prototype.triggerWait=function() {
  // The closures will be called in the context of the socket, so store the current
  // value of 'this' for use in the closures.
  var self=this;
  setTimeout(function() {
    self.timeout();
  }, 5000)
}

// Export the endpoint constructor.
module.exports=KISSFrameEndpoint;
