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

var exceptions=require("./exceptions.js");
var sprintf=require("sprintf-js").sprintf;
var CRCGenerator=require("./crc-generator.js").CRCGenerator;

function KISSFrameParser() {
  this.crcgen=new CRCGenerator();
}

KISSFrameParser.prototype.setInput=function(buf) {
  if (! (buf instanceof Buffer)) {
    throw new TypeError("Input must be a Buffer");
  }
  this.inputBuffer=buf;
  this.currentIndex=0;
  this.nextByte=this.inputBuffer[0];
  this.crcgen.reset();
}

/* TODO: How do we calculate this? */
KISSFrameParser.prototype.addToFCS=function(byte) {
  this.crcgen.data(byte);
}

/* Advance by one byte, incorporating the last-seen data into the
frame check code.
*/
KISSFrameParser.prototype.advance=function() {
  /* Don't advance if we're already past the end. */
  if (this.nextByte != undefined) {
    this.currentIndex++;
    this.nextByte=this.inputBuffer[this.currentIndex];
  }
}

KISSFrameParser.prototype.parseAddress=function() {
  var address={};
  var callsign="";
  for(var i=0; i <6; i++) {
    if (this.nextByte == undefined) {
      throw new exceptions.FrameError("Incomplete address at " +    this.currentIndex);
    }
    callsign=callsign+String.fromCharCode((this.nextByte)>>1);
    this.advance();
  }
  if (this.nextByte == undefined) {
    throw new exceptions.FrameError("Incomplete address at " + this.currentIndex);
  }
  address.callsign=callsign.trim();
  address.ssid=this.nextByte>>1 & 0x0f;
  address.hasBeenRepeated=((this.nextByte & 0x80) != 0);
  address.rr=this.nextByte>>5 & 0x03;
  address.extensionBit=((this.nextByte & 0x01) != 0);
  this.advance();
  return address;
}

KISSFrameParser.prototype.parseKISSDataFrameCommand=function() {
  if (this.nextByte == undefined) {
    throw new exceptions.FrameError("Empty Frame");
  }
  if (this.nextByte!=0) {
    throw new
      exceptions.FrameError("Expected data frame command(0), but got " +
      "0x" + this.nextByte.toString(16));
  }
  this.advance();
}

KISSFrameParser.prototype.parseUIFrameControlField=function() {
  if (this.nextByte == undefined) {
    throw new exceptions.FrameError("Frame ended before control field");
  }
  if ((this.nextByte & 0xef) != 0x03) {
    throw new
      exceptions.FrameError("Expected UI frame control, but got " +
      "0x" + this.nextByte.toString(16));
  }
  this.advance();
}

KISSFrameParser.prototype.parseRepeaterPath=function() {
  var repeaterPath=[];
  var address=this.parseAddress();
  repeaterPath.push(address);
  while(!address.extensionBit) {
    address=this.parseAddress();
    repeaterPath.push(address);
  }
  return repeaterPath;
}

KISSFrameParser.prototype.parseFrame=function() {
  var frame={};
  if (this.nextByte==undefined) {
    return undefined;
  }
  this.parseKISSDataFrameCommand();
  frame.destination=this.parseAddress();
  frame.source=this.parseAddress();
  frame.repeaterPath=(!frame.source.extensionBit)?
    this.parseRepeaterPath():[];
  // At this time we only recognize UI (APRS) frames.
  // This would be where we deal with other types of frames if required later.
  this.parseUIFrameControlField();
  frame.protocol=this.parseProtocol();
  frame.info=this.parseInfo();
  return frame;
}

KISSFrameParser.prototype.parseProtocol=function() {
  var protocol=this.nextByte;
  this.advance();
  return protocol;
}

KISSFrameParser.prototype.parseInfo=function() {
    var info=this.inputBuffer.slice(this.currentIndex);
    this.currentIndex += info.length;
    return info;
}

module.exports=KISSFrameParser;
