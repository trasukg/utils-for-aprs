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

/**
@module utils-for-aprs
*/
exports.APRSProcessor=require("./aprs-processor.js");
exports.ax25utils=require("./ax25-utils.js");
/* Not in the browser
  exports.framing=require('./kiss-framing.js');
  exports.tncSimulator=require('./tnc-simulator.js');
  exports.SocketKISSFrameEndpoint=require('./SocketKISSFrameEndpoint.js');
  exports.newKISSFrame=require('./KISSFrameBuilder.js');
*/
exports.addressBuilder=require('./AddressBuilder.js');
exports.validateFrame=require('./validateFrame.js')
/* Not in browser
  exports.ServerSocketKISSFrameEndpoint=require('./ServerSocketKISSFrameEndpoint.js');
*/
/*No serial in the browser...
  exports.SerialKISSFrameEndpoint=require('./SerialKISSFrameEndpoint.js');
*/
