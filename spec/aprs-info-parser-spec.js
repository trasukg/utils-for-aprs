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
var APRSInfoParser=require("../aprs-info-parser.js");
var exceptions=require("../exceptions.js");
var sampleFrames=require("./sample-frames.js").sampleFrames;

var aprsParser=new APRSInfoParser();

describe("The APRS info parser", function() {
  it("takes the 0'th sample and parses it", function() {
    var input=new Buffer(sampleFrames[0]);
    var parser=new KISSFrameParser();
    parser.setInput(input);
    var frame=parser.parseFrame();
    console.log("aprs info is " + frame.info)
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
  it("takes the 3rd sample (Position with timestamp) and parses it", function() {
    var input=new Buffer(sampleFrames[3]);
    var parser=new KISSFrameParser();
    parser.setInput(input);
    var frame=parser.parseFrame();
    console.log("Info field is [%s]", frame.info);
    aprsParser.parse(frame);
    // Should get back a position in the same form that html5 would return it.
    expect(frame.dataType).toBe('positionWithTimestamp');
    expect(frame.hasMessaging).toBeFalsy();
    expect(frame.position).toBeDefined();
    expect(frame.position.coords).toBeDefined();
    expect(frame.position.coords.latitude).toBeCloseTo(43.475833,5);
    expect(frame.position.coords.longitude).toBeDefined();
    expect(frame.position.coords.accuracy).toBeDefined();
    expect(frame.position.timestamp).toBeDefined();
    // The two following fields are extensions to the html5 Position object,
    // for APRS.
    expect(frame.position.symbolTableId).toBeDefined();
    expect(frame.position.symbolId).toBeDefined();
  });
  it("takes the 7th sample (Position without timestamp) and parses it", function() {
    var input=new Buffer(sampleFrames[7]);
    var parser=new KISSFrameParser();
    parser.setInput(input);
    var frame=parser.parseFrame();
    console.log("Info field is [%s]", frame.info);
    aprsParser.parse(frame);
    // Should get back a position in the same form that html5 would return it.
    expect(frame.dataType).toBe('positionWithoutTimestamp');
    expect(frame.hasMessaging).toBeTruthy();
    expect(frame.position).toBeDefined();
    expect(frame.position.coords).toBeDefined();
    expect(frame.position.coords.latitude).toBeCloseTo(43.762,5);
    expect(frame.position.coords.longitude).toBeDefined();
    expect(frame.position.coords.accuracy).toBeDefined();
    expect(frame.position.timestamp).toBeUndefined();
    // The two following fields are extensions to the html5 Position object,
    // for APRS.
    expect(frame.position.symbolTableId).toBeDefined();
    expect(frame.position.symbolId).toBeDefined();
  });
  it("takes the 11th sample (Position w/o timestamp, no messaging) and parses it",
  function() {
    var input=new Buffer(sampleFrames[11]);
    var parser=new KISSFrameParser();
    parser.setInput(input);
    var frame=parser.parseFrame();
    console.log("Info field is [%s]", frame.info);
    aprsParser.parse(frame);
    // Should get back a position in the same form that html5 would return it.
    expect(frame.dataType).toBe('positionWithoutTimestamp');
    expect(frame.hasMessaging).toBeFalsy();
    expect(frame.position).toBeDefined();
    expect(frame.position.coords).toBeDefined();
    expect(frame.position.coords.latitude).toBeCloseTo(43.58533333333333,5);
    expect(frame.position.coords.longitude).toBeDefined();
    expect(frame.position.coords.accuracy).toBeDefined();
    expect(frame.position.timestamp).toBeUndefined();
    // The two following fields are extensions to the html5 Position object,
    // for APRS.
    expect(frame.position.symbolTableId).toBeDefined();
    expect(frame.position.symbolId).toBeDefined();
  });
});
