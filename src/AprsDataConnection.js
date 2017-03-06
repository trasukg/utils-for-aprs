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
var EventEmitter=require('events');
var Escaper=require('./kiss-framing.js').Escaper;

/**
  This class is a base class for some class that knows how to write data
  to an AprsData connection.
  @alias module:utils-for-aprs.AprsDataConnection
  @fires module:utils-for-aprs.AprsDataConnection#data
  @fires module:utils-for-aprs.AprsDataConnection#close
  @class
*/
module.exports=function() {

}

util.inherits(module.exports, EventEmitter);

/**
  Write APRS data to the connection.
  @param data An object containing an APRS packet.
  @alias module:utils-for-aprs.AprsDataConnection.data
*/
module.exports.prototype.aprsData=function(aprsData) {

}

/**
  Incoming Data Event.  The event payload is a buffer that contains a de-escaped
  KISS frame.
  @event module:utils-for-aprs.AprsDataConnection#aprsData
  @type {Object}
*/

/**
  Close event.  The connection is being closed.
  @event module:utils-for-aprs.AprsDataConnection#close
  @type {void}
*/
