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

var KISSFrameParser=require("../kiss-frame-parser.js");
var APRSProcessor=require("../aprs-processor.js");
var sampleFrames=require("./sample-frames.js").sampleFrames;

var Uut=new APRSProcessor();

describe("The APRS processor", function() {
  it("takes gets called with frame data and emits events.", function() {
    var input=new Buffer(sampleFrames[0]);
    var wasCalled=false;
    var receivedPacket=null;

    Uut.on('aprsData', function(packet) {
      wasCalled=true;
      receivedPacket=packet;
    });
    Uut.data(input);
    expect(wasCalled).toBeTruthy();
    expect(receivedPacket).toBeDefined();
    expect(receivedPacket.dataType).toBe('status');
    expect(receivedPacket.statusText).toBe('Burlington Amateur Radio Club');
  });
});
