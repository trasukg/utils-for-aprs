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
var exceptions=require("../exceptions.js");
var sampleFrames=require("./sample-frames.js").sampleFrames;
var addressBuilder=require("../index.js").addressBuilder;

function formatBuffer(data) {

  var output="[";
  for(var i=0; i < data.length; i++) {
    if (i !== 0) {
      output=output+", ";
    }
    output=output+ "0x" + data[i].toString(16);
  }
  output=output+"],";
  return output;
}

describe("The KISS Frame builder", function() {
  var newKISSFrame=require("../index.js").newKISSFrame;
  it("is in the main library under 'newKISSFrame'", function() {
    expect(newKISSFrame).toBeDefined();
  });
  it("Builds a sample frame", function() {
    var expectedFrame=Buffer.from([0x0, 0x84, 0x8a, 0x82, 0x86, 0x9e, 0x9c, 0x60, 0xac, 0x8a, 0x66, 0x8e, 0xb0, 0xac, 0x60, 0xac, 0x8a, 0x66, 0xb2, 0x82, 0xa0, 0xe0, 0xac, 0x8a, 0x66, 0x96, 0xae, 0xae, 0xe2, 0xae, 0x92, 0x88, 0x8a, 0x64, 0x40, 0x63, 0x3, 0xf0, 0x21, 0x34, 0x33, 0x33, 0x35, 0x2e, 0x31, 0x32, 0x4e, 0x2f, 0x30, 0x37, 0x39, 0x33, 0x38, 0x2e, 0x39, 0x38, 0x57, 0x2d, 0x50, 0x48, 0x47, 0x34, 0x31, 0x33, 0x30, 0x2f, 0x41, 0x3d, 0x30, 0x30, 0x30, 0x35, 0x32, 0x32, 0x2f, 0x4d, 0x69, 0x73, 0x73, 0x69, 0x73, 0x73, 0x61, 0x75, 0x67, 0x61, 0x20, 0x43, 0x69, 0x74, 0x79, 0x20, 0x43, 0x65, 0x6e, 0x74, 0x72, 0x65, 0xd]);
    var frame={
      "destination": addressBuilder("BEACON").build(),
      "source": addressBuilder("VE3GXV").build(),
      "repeaterPath":[
        addressBuilder('VE3YAP').hasBeenRepeated().build(),
        addressBuilder('VE3KWW-1').hasBeenRepeated().build(),
        addressBuilder('WIDE2-1').withExtensionBit(true).build()
      ],
      "protocol":240,
      "info":"!4335.12N/07938.98W-PHG4130/A=000522/Mississauga City Centre\r"
    };
    var actualFrame=newKISSFrame().fromFrame(frame).build();

    //var parser=new KISSFrameParser();
    //var decodedFrame=parser.parseFrame(actualFrame);
    //console.log("Frame is " + JSON.stringify(frame) + "\n");
    //console.log("KISSFrame is " + formatBuffer(actualFrame) + "\n");
    //console.log("Decoded frame is " + JSON.stringify(decodedFrame));
    expect(actualFrame).toEqual(expectedFrame);
  });
});
