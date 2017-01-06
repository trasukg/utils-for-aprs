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

var AddressBuilder=function(callsign) {
  var res=/([A-Z0-9]{2,6})(-([0-9]{1,2}))?/.exec(callsign);
  if (!res) {
    throw new exceptions.FormatError("callsign");
  }
  this.callsign=res[1];
  if(res[3]) {
    this.ssid=parseInt(res[3]);
  } else {
    this.ssid=0;
  }
  this.valueForHasBeenRepeated=false;
  this.extensionBit=false;
}

AddressBuilder.prototype.build=function() {
  var address={
    "callsign": this.callsign,
    "ssid": this.ssid,
    "hasBeenRepeated":this.valueForHasBeenRepeated,
    "rr":3,
    "extensionBit": this.extensionBit
  }
  return address;
}

AddressBuilder.prototype.hasBeenRepeated=function(val) {
  this.valueForHasBeenRepeated=(val===undefined)?true:val;
  return this;
}

AddressBuilder.prototype.withExtensionBit=function(val) {
  this.extensionBit= (val===undefined)?true:val;
  return this;
}

module.exports=function(arg) {
  return new AddressBuilder(arg);
}
