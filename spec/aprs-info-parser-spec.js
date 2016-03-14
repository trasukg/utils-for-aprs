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
var aprsParser=require("../aprs-info-parser.js");
var exceptions=require("../exceptions.js");
var sampleFrames=require("./sample-frames.js").sampleFrames;

describe("The APRS info parser", function() {
  it("takes the 0'th sample and parses it", function() {
    var input=new Buffer(sampleFrames[0]);
    var parser=new KISSFrameParser();
    parser.setInput(input);
    var frame=parser.parseFrame();
    aprsParser.parse(frame);
    expect(frame.dataType).toBe('status');
    expect(frame.statusText).toBe('Burlington Amateur Radio Club');
  });
  it("takes the 1'th sample and parses it", function() {
    var input=new Buffer(sampleFrames[1]);
    var parser=new KISSFrameParser();
    parser.setInput(input);
    var frame=parser.parseFrame();
    expect(frame).toBeUndefined();
  });
  it("takes the 2nd sample and parses it", function() {
    var input=new Buffer(sampleFrames[2]);
    var parser=new KISSFrameParser();
    parser.setInput(input);
    var frame=parser.parseFrame();
    //console.log("Info field is [%s]", frame.info);
    aprsParser.parse(frame);
    expect(frame.dataType).toBe('telemetry');
    expect(frame.telemetry.sequenceNumber).toBe(630);
    expect(frame.telemetry.values).toEqual([131,30,999,670,517]);
    expect(frame.telemetry.flags).toBe(parseInt("00001011",2));
  });
  it("takes the 3rd sample and parses it", function() {
    var input=new Buffer(sampleFrames[3]);
    var parser=new KISSFrameParser();
    parser.setInput(input);
    var frame=parser.parseFrame();
    console.log("Info field is [%s]", frame.info);
    aprsParser.parse(frame);
    expect(frame.dataType).toBe('telemetry');
    expect(frame.telemetry.sequenceNumber).toBe(630);
    expect(frame.telemetry.values).toEqual([131,30,999,670,517]);
    expect(frame.telemetry.flags).toBe(parseInt("00001011",2));
  });
});
