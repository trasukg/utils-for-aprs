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

const validateAddress=function(address) {
  var callsignLength=address.callsign.length;
  if (callsignLength>7) {
    throw new exceptions.FormatError('Callsigns need to be 7 characters or less'
      + ' (' + address.callsign + ')' + ' for KISS frames.');
  }
  if (typeof(address.ssid) === 'string' || address.ssid <0 || address.ssid>15) {
    throw new exceptions.FormatError('SSID needs to be integer 0-15 for KISS frame.')
  }
}

const SPACE_IN_CALLSIGN=' '.charCodeAt(0)<<1;

const writeAddress=function(buffer, writeIndex, address){
  validateAddress(address);
  var callsignLength=address.callsign.length;
  // We're going to casually ignore Unicode callsigns for now (are they even a thing?)
  var i=0;
  while(i<callsignLength) {
    buffer[writeIndex++]=address.callsign.charCodeAt(i++)<<1;
  }
  while (i<6) {
    buffer[writeIndex++]=SPACE_IN_CALLSIGN;
    i++;
  }
  buffer[writeIndex++]=
    (address.hasBeenRepeated?0x80:0)
    | (address.ssid<<1)
    | (address.rr<<5)
    | (address.extensionBit?1:0)
  return writeIndex;
};

const writeRepeaterPath=function(buffer, writeIndex, repeaterPath) {
  for(var i=0; i<repeaterPath.length; i++) {
    writeIndex=writeAddress(buffer, writeIndex, repeaterPath[i]);
  }
  return writeIndex;
};

const writeInfo=function(buffer, writeIndex, info) {
  for (var i=0; i < info.length; i++) {
    buffer[writeIndex++]=info.charCodeAt(i);
  }
  return writeIndex;
};

const writeByte=function(buffer, writeIndex, byte) {
  buffer[writeIndex++]=byte;
  return writeIndex;
};

const validateFrame=require('./validateFrame.js');

var KISSFrameBuilder=function() {
  this.frame={};
}

KISSFrameBuilder.prototype.fromFrame=function(frame) {
  this.frame=frame;
  return this;
}

KISSFrameBuilder.prototype.build=function() {
  /* Frame length:
    1 cmd
    7 dest address
    7 src address
    7*ndigis
    1 ctrl field
    1 proto id
    n info length
    ----
      17 + 7*len(repeaterPath) + len(info)
  */
  validateFrame(this.frame);
  // TODO: This really ought to handle UTF-8 info strings properly!
  var frameLength=17 + 7*this.frame.repeaterPath.length + this.frame.info.length;
  var buffer=new Buffer(frameLength);
  var writeIndex=0
  buffer[writeIndex++]=0;
  writeIndex=writeAddress(buffer, writeIndex, this.frame.destination);
  writeIndex=writeAddress(buffer, writeIndex, this.frame.source);
  writeIndex=writeRepeaterPath(buffer, writeIndex, this.frame.repeaterPath);
  // Control field set to 0x03 - UI-frame
  writeIndex=writeByte(buffer, writeIndex, 0x03);
  // Protocol 0xf0 - no level-3 protocol
  writeIndex=writeByte(buffer, writeIndex, 0xf0);
  writeInfo(buffer, writeIndex, this.frame.info);
  return buffer;
}

module.exports=function() {
  return new KISSFrameBuilder();
}
