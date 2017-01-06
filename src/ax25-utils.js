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

var sprintf=require("sprintf-js").sprintf;

var addressToString=function(address) {
  if (address == undefined) {
    return "??";
  }
  return (address.ssid===0 || address.ssid ==='')?
    address.callsign:sprintf("%s-%s", address.callsign, address.ssid);
}
exports.addressToString=addressToString;

exports.repeaterPathToString=function(repeaterPath) {
  if (!repeaterPath) {
    return "<dir>";
  }
  var path="";
  for(i in repeaterPath) {
    if(i>0) {
      path=path+",";
    }
    path=path+addressToString(repeaterPath[i]);
    if (repeaterPath[i].hasBeenRepeated) {
      path=path+"*";
    }
  }
  return path;
}
