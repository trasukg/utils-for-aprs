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

describe("The AX.25 KISS Frame Parser", function() {
  describe("has a context object that we can load a Buffer into", function() {
    var parser=new KISSFrameParser();
    var sampleBuf=new Buffer([0x0, 0x84, 0x8a, 0x82, 0x86, 0x9e, 0x9c, 0x60, 0xac, 0x8a, 0x66, 0x8e, 0xb0, 0xac, 0x60, 0xac, 0x8a, 0x66, 0xb2, 0x82, 0xa0, 0xe0, 0xac, 0x8a, 0x66, 0x96, 0xae, 0xae, 0xe2, 0xae, 0x92, 0x88, 0x8a, 0x64, 0x40, 0x63, 0x3, 0xf0, 0x21, 0x34, 0x33, 0x33, 0x35, 0x2e, 0x31, 0x32, 0x4e, 0x2f, 0x30, 0x37, 0x39, 0x33, 0x38, 0x2e, 0x39, 0x38, 0x57, 0x2d, 0x50, 0x48, 0x47, 0x34, 0x31, 0x33, 0x30, 0x2f, 0x41, 0x3d, 0x30, 0x30, 0x30, 0x35, 0x32, 0x32, 0x2f, 0x4d, 0x69, 0x73, 0x73, 0x69, 0x73, 0x73, 0x61, 0x75, 0x67, 0x61, 0x20, 0x43, 0x69, 0x74, 0x79, 0x20, 0x43, 0x65, 0x6e, 0x74, 0x72, 0x65, 0xd]);
    parser.setInput(sampleBuf);

    it("and we can read out the length", function() {
      expect(parser.inputBuffer.length).toBe(99);
    });
    it("and it has a currentIndex count that gets set to 0 on input.", function(){
      expect(parser.currentIndex).toBe(0);
    });
    it("Can read the source and data addresses", function() {
      parser.parseKISSDataFrameCommand();
      var dest=parser.parseAddress();
      var src=parser.parseAddress();
      expect(dest.callsign).toBe("BEACON");
      expect(src.callsign).toBe("VE3GXV");
    })
  });
  describe("can parse a callsign as per AX25 spec, reading", function() {
    var parser=new KISSFrameParser();
    var sampleBuf=new Buffer([0x9c, 0x94, 0x6e, 0xa0, 0x40, 0x40, 0xe0]);
    parser.setInput(sampleBuf);
    var address=parser.parseAddress();
    it("the callsign correctly", function() {
      expect(address.callsign).toBe("NJ7P");
    });
    it("the ssid correctly", function() {
      expect(address.ssid).toBe(0);
    });
  });
  describe("can parse a callsign as per AX25 spec, reading", function() {
    var parser=new KISSFrameParser();
    var sampleBuf=new Buffer([0x9c, 0x94, 0x6e, 0xa0, 0x40, 0x40, 0xe2]);
    parser.setInput(sampleBuf);
    var address=parser.parseAddress();
    it("the callsign correctly", function() {
      expect(address.callsign).toBe("NJ7P");
    });
    it("the ssid correctly", function() {
      expect(address.ssid).toBe(1);
    });
  });
  it("throws an exception if the buffer is too short.", function() {
    var parser=new KISSFrameParser();
    var sampleBuf=new Buffer([0x9c, 0x94, 0x6e, 0xa0, 0x40]);
    parser.setInput(sampleBuf);

    expect(function() {
      var address=parser.parseAddress();
    }).toThrowError(exceptions.FrameError);
  });

  describe("parses a destination with repeat path", function() {
    var parser=new KISSFrameParser();
    var sampleBuf=new Buffer([0x9c, 0x94, 0x6e, 0xa0, 0x40, 0x40, 0xe2,
      0x9c, 0x6e, 0x98, 0x8a, 0x9a, 0x40, 0x60,
      0x9c, 0x6e, 0x9e, 0x9e, 0x40, 0x40, 0xe3]);
    parser.setInput(sampleBuf);
    var repeaterPath=parser.parseRepeaterPath();
    it("gets the length right", function() {
      expect(repeaterPath.length).toBe(3);
    });
    it("reads the first callsign correctly", function() {
      expect(repeaterPath[0].callsign).toBe("NJ7P");
    });
    it("reads the second callsign correctly", function() {
      expect(repeaterPath[1].callsign).toBe("N7LEM");
    });
    it("reads the third callsign correctly", function() {
      expect(repeaterPath[2].callsign).toBe("N7OO");
    });
  });

  describe("parses a complete frame, giving us an object that contains the frame." +
            "  When complete, we can abandon or re-use the input buffer",
    function() {
    var parser=new KISSFrameParser();
    parser.setInput(new Buffer(sampleFrames[0]));
    var frame=parser.parseFrame();

    it("decodes the source address correctly", function() {
      expect(frame.source.callsign).toBe("VE3NDQ");
      expect(frame.source.ssid).toBe(10);
    });
    it("decodes the destination address correctly", function() {
      expect(frame.destination.callsign).toBe("APTT4");
      expect(frame.destination.ssid).toBe(0);
    });

    it("decodes the repeater path correctly", function() {
      expect(frame.repeaterPath.length).toBe(1);
      expect(frame.repeaterPath[0].callsign).toBe("WIDE1");
    });

    it("decodes the information subfield", function() {
      expect(frame.info).toBeDefined();
    });
  });

});
