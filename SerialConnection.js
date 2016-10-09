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

var SerialPort=require('serialport');
var util=require('util');
var StateMachine=require('./StateMachine.js');
var EventEmitter=require('events');

var states= require('./connection-machine-states.js');

var SerialConnection=function(device, options) {
  var self=this;

  StateMachine.call(this, states, 'Idle');
};

util.inherits(SerialConnection, EventEmitter);

SerialConnection.prototype.openConnection=function() {
  this.port=new SerialPort(device, options, function(err) {
    if(!err) {
      this.connectionSucceeded();
    } else {
      this.connectionFailed(err);
    }
  });
  this.port.on('error', function(err) {
    this.error(err);
  });
  this.port.on('data', function(data) {
    this.emit('data', data);
  });
}

SerialConnection.prototype.closeConnection=function() {
  this.port.close();
}

SerialConnection.prototype.triggerWait=function() {
  // TODO: Put in a wait function.
}

module.exports=SerialConnection;
