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
  @class
  This class is a base class for some class that knows how to write data
  to a KISS Connection.
  @param bufferLength The length of the output buffer.  Defaults to 1024 if
  undefined.
*/
module.exports=function(bufferLength) {
  this.escaper=new Escaper(bufferLength?bufferLength:1024);
}

util.inherits(module.exports, EventEmitter);

module.exports.prototype.data=function(data) {
  buffer=this.escaper.escapeAndWriteKISSCommand(data);
  this.writeOutput(buffer);
  this.flush();
}
