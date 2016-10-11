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

/* This function returns a parser function that emits a
data event when a properly framed KISS frame is received.  While processing
the input events, it de-escapes the TNC data stream.

The KISS protocol document recommends no arbitrary limit on packet size.
It also recommends that packets at least 1024 bytes long should be accomodated.

Initially, we're focussing on APRS, so we're probably talking less than.
also we're running on a machine that isn't
fundamentally memory-limited (at least in the context of this program,
even an old RPi with 512MB is pretty big), so we'll use 1024 bytes, which
ought to be plenty.

If it ever comes down to wanting "no limits", the thing to do is to separate
into 'data' event and 'packet-ended' event.  But realistically, APRS packets
are going to be small.
*/

function tncFrameParser() {

  var stateMachine=frameStateMachine(1024);

  return function(emitter, buffer){
    for (var i=0; i<buffer.length; i++) {
      stateMachine(emitter, buffer[i]);
    }
  };
}

function frameStateMachine(bufferLength) {
  var FEND=0xc0;
  var FESC=0xdb;
  var TFEND=0xdc;
  var TFESC=0xdd;

  var outputBuffer=new Buffer(bufferLength);
  var contentLength=0;
  var process;

  var ignore=function(emitter,c) {
    if (c==FEND) {
      process=plain;
    }
  }
  var output=function(c) {
      outputBuffer[contentLength++]=c;
      if (contentLength>bufferLength) {
        // Overflow is an error and will be silently ignored.
        // ignore all data til FEND
        contentLength=0;
        process=ignore;
      }
  };

  var idle=function(emitter, c) {
      switch(c) {
        case FEND:
          break;
        default:
          process=plain;
          output(c);
      }
  };

  var plain=function(emitter, c) {
    switch(c) {
      case FESC:
        process=escaped;
        break;
      case FEND:
        if (contentLength>0) emitter.emit('data', outputBuffer.slice(0,contentLength));
        contentLength=0;
        break;
      default:
        output(c);
    }
  }

  var escaped=function(emitter, c) {
    switch(c) {
      case TFESC:
        output(FESC);
        break;
      case TFEND:
        output(FEND);
        break;
    }
    process=plain;
  }

  process=idle;

  return function(emitter, c) {
    process(emitter, c);
  }
}

exports.tncFrameParser=tncFrameParser;
