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

/* Note - interesting though this generator function is, it turns
out to be not required for a KISS TNC.  The TNC generates and checks
the CRC, and doesn't pass the value on to the host.
*/

var CRCGenerator=function() {
  this.sr=0xffff;
}

CRCGenerator.prototype.data=function(byte) {
  for(var i=0; i <8; i++) {
    var leftmostBit=(this.sr & 0x8000)>>15;
    this.sr=(this.sr<<1) & 0xffff;
    if (leftmostBit ^ (byte&0x01)) {
      this.sr=this.sr ^ 0x1021;
    }
    byte=byte>>>1;
  }
}

CRCGenerator.prototype.crc=function() {
  return this.sr ^ 0xffff;
}

CRCGenerator.prototype.reset=function() {
  this.sr=0xffff;
}

exports.CRCGenerator=CRCGenerator;
