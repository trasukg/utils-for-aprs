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
  This is a processor for KISS-formatted APRS data.
  It can either deal with raw bytes that contain KISS-formatted data, or you
  can feed it KISS frames that have already been decoded for framing and de-escaped.

  Either way, it emits an 'aprsData' event on a good frame decode, and an 'error'
  event on a failed decode.
*/

var util=require('util');
var EventEmitter=require('events');

var KISSFrameParser=require("./kiss-frame-parser.js");
var APRSInfoParser=require("./aprs-info-parser.js");

/**
  @module utils-for-aprs
*/

/**
  @constructor APRSProcessor
  @alias module:utils-for-aprs/APRSProcessor
  Creates a new APRSProcessor object

  @fires APRSProcessor#aprsData
*/
var APRSProcessor=function() {
  this.frameParser=new KISSFrameParser();
  this.aprsParser=new APRSInfoParser();
  /**
    Process a KISS frame.
    The frame should be de-escaped and have the KISS command stripped.
    If the frame decodes successfully, the APRSProcessor will emit an 'aprsData'
    event.  Otherwise it will emit an 'error' event.
  */
  this.data=function(data) {
    var frame;
    this.frameParser.setInput(data);
    try {
      frame=this.frameParser.parseFrame();

    } catch(err) {
      this.emit('error', err);
      return;
    }
    try {
      this.aprsParser.parse(frame);
      /**
        aprsData event
        @event APRSProcessor#aprsData
        @type {object}
      */
      this.emit('aprsData', frame);
    } catch(err) {
      frame.dataType='undecoded';
      frame.undecodeReason=err.message;
      this.emit('aprsData', frame);
    }
  };
}

util.inherits(APRSProcessor, EventEmitter);

module.exports=APRSProcessor;
