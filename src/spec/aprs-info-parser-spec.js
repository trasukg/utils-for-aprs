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
    console.log("Info field is [%s]\n", frame.info);
    aprsParser.parse(frame);
    // Should get back a position in the same form that geolocation API would return it.
    expect(frame.dataType).toBe('positionWithTimestamp');
    expect(frame.hasMessaging).toBeFalsy();
    expect(frame.position).toBeDefined();
    expect(frame.position.coords).toBeDefined();
    expect(frame.position.coords.latitude).toBeCloseTo(43.475833,5);
    expect(frame.position.coords.longitude).toBeDefined();
    expect(frame.position.coords.accuracy).toBeDefined();
    expect(frame.position.coords.altitude).toBeCloseTo(137,0);
    expect(frame.position.timestamp).toBeDefined();
    // The two following fields are extensions to the html5 Position object,
    // for APRS.
    expect(frame.position.symbolTableId).toBeDefined();
    expect(frame.position.symbolId).toBeDefined();
  });
  it("takes the 7th sample (Position/Weather Report without timestamp) and parses it",
  function() {
    var input=new Buffer(sampleFrames[7]);
    var parser=new KISSFrameParser();
    parser.setInput(input);
    var frame=parser.parseFrame();
    console.log("Info field is [%s]\n", frame.info);
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
    expect(frame.position.symbolId).toBe("_");
    expect(frame.weather.windDirection).toBe(172);
    expect(frame.weather.windSpeed).toBe(0);
    expect(frame.weather.gust).toBeUndefined();
    expect(frame.weather.temperature).toBe(28);
    expect(frame.weather.rainLastHour).toBe(0);
    expect(frame.weather.rainLast24Hour).toBe(0);
    expect(frame.weather.rainSinceMidnight).toBeUndefined();
    expect(frame.weather.humidity).toBe(77);
    expect(frame.weather.barometer).toBeCloseTo(102.14,2);
  });
  it("takes the 11th sample (Position w/o timestamp, no messaging) and parses it",
  function() {
    var input=new Buffer(sampleFrames[11]);
    var parser=new KISSFrameParser();
    parser.setInput(input);
    var frame=parser.parseFrame();
    console.log("Info field is [%s]\n", frame.info);
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
  it("takes the 5th sample (MIC-E Data) and parses it",
  function() {
    var input=new Buffer(sampleFrames[5]);
    var parser=new KISSFrameParser();
    parser.setInput(input);
    var frame=parser.parseFrame();
    console.log("To, Info field is [%s][%s]\n",
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
  it("takes the 550th sample (Message) and parses it",
  function() {
    var input=new Buffer(sampleFrames[550]);
    var parser=new KISSFrameParser();
    parser.setInput(input);
    var frame=parser.parseFrame();
    console.log("To, Info field is [%s][%s]\n",
      ax25utils.addressToString(frame.destination),
      frame.info);
    aprsParser.parse(frame);
    // Should get back a position in the same form that html5 would return it.
    expect(frame.dataType).toBe('message');
    expect(frame.position).toBeUndefined();
    // The two following fields are extensions to the html5 Position object,
    // for APRS.
    expect(frame.addressee).toBe('VE3RSB');
    expect(frame.message).toBe('This is a test message.');
    expect(frame.messageId).toBeDefined();
    expect(frame.messageId).toBe('m0001');
    expect(frame.senderIsReplyAckCapable).toBeFalsy();
  });
  it("takes sample 191 (third-party Message) and parses it",
  function() {
    var input=new Buffer(sampleFrames[191]);
    var parser=new KISSFrameParser();
    parser.setInput(input);
    var frame=parser.parseFrame();
    console.log("To, Info field is [%s][%s]\n",
      ax25utils.addressToString(frame.destination),
      frame.info);
    aprsParser.parse(frame);
    // a message packet
    // Source and repeater path are replaced by the third-party data
    expect(frame.source.callsign).toBe('VE3LSG');
    expect(frame.repeaterPath[0].callsign).toBe('TCPIP');
    expect(frame.repeaterPath[0].hasBeenRepeated).toBeFalsy();
    expect(frame.repeaterPath[1].callsign).toBe('VE3YAP');
    expect(frame.repeaterPath[1].hasBeenRepeated).toBeTruthy();
    expect(frame.forwardingSource.callsign).toBe('VE3YAP');
    expect(frame.forwardingDestination.callsign).toBe('APU25N');

    expect(frame.forwardingRepeaterPath[0].callsign).toBe('VE3KWW');
    expect(frame.forwardingRepeaterPath[0].ssid).toBe(1);
    expect(frame.forwardingRepeaterPath[0].hasBeenRepeated).toBeTruthy();

    expect(frame.forwardingRepeaterPath[1].callsign).toBe('WIDE2');
    expect(frame.forwardingRepeaterPath[1].ssid).toBe(1);
    expect(frame.forwardingRepeaterPath[1].hasBeenRepeated).toBeFalsy();

    expect(frame.forwardingRepeaterPath[2].callsign).toBe('VE3KSR');
    expect(frame.forwardingRepeaterPath[2].ssid).toBe(0);
    expect(frame.forwardingRepeaterPath[2].hasBeenRepeated).toBeFalsy();

    expect(frame.dataType).toBe('message');
    expect(frame.position).toBeUndefined();
    expect(frame.addressee).toBe('VA3DVR');
    expect(frame.message).toBe('Hi Martin!');
    expect(frame.messageId).toBeDefined();
    expect(frame.messageId).toBe('06\r'); // Seems wrong, but that's what's in the msg
    expect(frame.senderIsReplyAckCapable).toBeFalsy();
    // Frame info should be adjusted to be the third-party forwarded info
    expect(frame.info).toMatch(/^:VA3DVR/);
  });
  it("takes the 145th sample (Object) and parses it",
  function() {
    var input=new Buffer(sampleFrames[145]);
    var parser=new KISSFrameParser();
    parser.setInput(input);
    var frame=parser.parseFrame();
    console.log("To, Info field is [%s][%s]\n",
      ax25utils.addressToString(frame.destination),
      frame.info);
    aprsParser.parse(frame);
    // Should get back a position in the same form that html5 would return it.
    expect(frame.dataType).toBe('object');
    expect(frame.position).toBeDefined();
    expect(frame.position.coords.latitude).toBeCloseTo(43.07333,5);
    expect(frame.position.coords.longitude).toBeDefined();
    expect(frame.position.coords.accuracy).toBeCloseTo(26,0);
    expect(frame.position.coords.speed).toBeUndefined()
    expect(frame.position.timestamp).toBeDefined();
    // The two following fields are extensions to the html5 Position object,
    // for APRS.
    expect(frame.destination.callsign).toBe('BEACON');
    expect(frame.objectName).toBe('147.360ny');
    expect(frame.killed).toBeFalsy();
    expect(frame.position.symbolTableId).toBeDefined();
    expect(frame.position.symbolId).toBeDefined();
  });
  it("takes the 339th sample (Station Capabilities) and parses it",
  function() {
    var input=new Buffer(sampleFrames[339]);
    var parser=new KISSFrameParser();
    parser.setInput(input);
    var frame=parser.parseFrame();
    console.log("To, Info field is [%s][%s]\n",
      ax25utils.addressToString(frame.destination),
      frame.info);
    aprsParser.parse(frame);
    // Should get station capabilities
    expect(frame.dataType).toBe('stationCapabilities');
    expect(frame.source.callsign).toBe('VE3YAP');
    expect(frame.position).toBeUndefined();
    expect(frame.destination.callsign).toBe('APU25N');
    expect(frame.capability).toBe('IGATE');
    expect(frame.messageCount).toBe(413);
    expect(frame.localStationCount).toBe(35);
  });
});
