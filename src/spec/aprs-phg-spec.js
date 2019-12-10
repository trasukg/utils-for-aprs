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
var ax25utils=require("../ax25-utils.js");

var aprsParser=new APRSInfoParser();

describe("The APRS info parser", function() {

  it("sample 11 should have phg and altitude",
  function() {
    var input=Buffer.from(sampleFrames[11]);
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
    expect(frame.position.power).toEqual(16);
    expect(frame.position.height).toEqual(20);
    expect(frame.position.gain).toEqual(3);
    expect(frame.position.directivity).toBeUndefined();
    expect(frame.comment).toBe("Mississauga City Centre");
  });
  it("takes the 5th sample (MIC-E Data) and parses it",
  function() {
    var input=Buffer.from(sampleFrames[5]);
    var parser=new KISSFrameParser();
    parser.setInput(input);
    var frame=parser.parseFrame();
    console.log("To, Info field is [%s][%s]",
      ax25utils.addressToString(frame.destination),
      frame.info);
    aprsParser.parse(frame);
    // Should get back a position in the same form that html5 would return it.
    expect(frame.dataType).toBe('micEData');
    expect(frame.hasMessaging).toBeFalsy();
    expect(frame.position).toBeDefined();
    expect(frame.position.coords.latitude).toBeCloseTo(43.460167,5);
    expect(frame.position.coords.longitude).toBeDefined();
    expect(frame.position.coords.accuracy).toBeCloseTo(26,0);
    expect(frame.position.coords.speed).toBeCloseTo(0,1);
    expect(frame.position.timestamp).toBeUndefined();
    // The two following fields are extensions to the html5 Position object,
    // for APRS.
    expect(frame.position.symbolTableId).toBeDefined();
    expect(frame.position.symbolId).toBeDefined();
  });
});
