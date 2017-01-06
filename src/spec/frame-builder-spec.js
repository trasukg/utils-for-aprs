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

var exceptions=require("../exceptions.js");

describe("The Address builder", function() {
  var addressBuilder=require("../index.js").addressBuilder;
  it("is in the main library under 'addressBuilder'", function() {
    expect(addressBuilder).toBeDefined();
  });
  it("Builds an address", function() {
    var address=addressBuilder("VE3GXV").build();

    expect(address).toEqual(
      {
        "callsign":"VE3GXV",
        "ssid":0,
        "hasBeenRepeated":false,
        "rr":3,"extensionBit":false
      }
    );
  });
  it("Builds an address with SSID", function() {
    expect(addressBuilder("VE3GXV-0").build()).toEqual(
      {
        "callsign":"VE3GXV",
        "ssid":0,
        "hasBeenRepeated":false,
        "rr":3,"extensionBit":false
      }
    );
    expect(addressBuilder("VE3GXV-1").build()).toEqual(
      {
        "callsign":"VE3GXV",
        "ssid":1,
        "hasBeenRepeated":false,
        "rr":3,"extensionBit":false
      }
    );
  });
  it("supports hasBeenRepeated()", function() {
    expect(addressBuilder("VE3GXV-0").hasBeenRepeated().build()).toEqual(
      {
        "callsign":"VE3GXV",
        "ssid":0,
        "hasBeenRepeated":true,
        "rr":3,"extensionBit":false
      }
    );
    expect(addressBuilder("VE3GXV-0").hasBeenRepeated(true).build()).toEqual(
      {
        "callsign":"VE3GXV",
        "ssid":0,
        "hasBeenRepeated":true,
        "rr":3,"extensionBit":false
      }
    );
    expect(addressBuilder("VE3GXV-0").hasBeenRepeated(false).build()).toEqual(
      {
        "callsign":"VE3GXV",
        "ssid":0,
        "hasBeenRepeated":false,
        "rr":3,"extensionBit":false
      }
    );
  });
  it("supports withExtensionBit", function() {
    expect(addressBuilder("VE3GXV-0").withExtensionBit().build()).toEqual(
      {
        "callsign":"VE3GXV",
        "ssid":0,
        "hasBeenRepeated":false,
        "rr":3,
        "extensionBit":true
      }
    );
    expect(addressBuilder("VE3GXV-0").withExtensionBit(true).build()).toEqual(
      {
        "callsign":"VE3GXV",
        "ssid":0,
        "hasBeenRepeated":false,
        "rr":3,"extensionBit":true
      }
    );
    expect(addressBuilder("VE3GXV-0").withExtensionBit(false).build()).toEqual(
      {
        "callsign":"VE3GXV",
        "ssid":0,
        "hasBeenRepeated":false,
        "rr":3,"extensionBit":false
      }
    );
  });
});

describe("The frame validator", function() {
  var addressBuilder=require("../index.js").addressBuilder;
  var validateFrame=require("../index.js").validateFrame;
  it("is in the main library under 'validateFrame'", function() {
    expect(validateFrame).toBeDefined();
  });
  it("Rejects a frame with no source", function() {
    var badFrame={
      destination: addressBuilder("VE3GXV").build()
    }

    expect(function() { validateFrame(badFrame)} ).toThrowError(/Source address/);
  });
  it("Rejects a frame with no destination", function() {
    var badFrame={
      source: addressBuilder("VE3GXV").build()
    }

    expect(function() { validateFrame(badFrame)} ).toThrowError(/Destination address/);
  });
  it("Rejects a frame with no more than 8 repeater path steps", function() {
    var badFrame={
      source: addressBuilder("VE3GXV").build(),
      destination: addressBuilder("APZTSK").build(),
      repeaterPath: [
        addressBuilder("A1").build(),
        addressBuilder("A2").build(),
        addressBuilder("A3").build(),
        addressBuilder("A4").build(),
        addressBuilder("A5").build(),
        addressBuilder("A6").build(),
        addressBuilder("A7").build(),
        addressBuilder("A8").build(),
        addressBuilder("A9").build()
      ]
    }

    expect(function() { validateFrame(badFrame)} ).toThrowError(/Repeater path/);
  });
  it("Patches the extension bits as appropriate when there's no repeat path",
  function() {
    var frame={
      source: addressBuilder("VE3GXV").build(),
      destination: addressBuilder("APZTSK").withExtensionBit().build(),
    };
    validateFrame(frame);
    expect(frame.source.extensionBit).toBe(true);
    expect(frame.destination.extensionBit).toBe(false);
  });
  it("Patches the extension bits as appropriate when is a single repeat path",
  function() {
    var frame={
      source: addressBuilder("VE3GXV").build(),
      destination: addressBuilder("APZTSK").withExtensionBit().build(),
      repeaterPath: [
        addressBuilder("A1").build()
      ]
    };
    validateFrame(frame);
    expect(frame.source.extensionBit).toBe(false);
    expect(frame.destination.extensionBit).toBe(false);
    expect(frame.repeaterPath[0].extensionBit).toBe(true);
  });
  it("Patches the extension bits as appropriate when is a multi repeat path",
  function() {
    var frame={
      source: addressBuilder("VE3GXV").build(),
      destination: addressBuilder("APZTSK").withExtensionBit().build(),
      repeaterPath: [
        addressBuilder("A1").withExtensionBit().build(),
        addressBuilder("A2").build()
      ]
    };
    validateFrame(frame);
    expect(frame.source.extensionBit).toBe(false);
    expect(frame.destination.extensionBit).toBe(false);
    expect(frame.repeaterPath[0].extensionBit).toBe(false);
    expect(frame.repeaterPath[1].extensionBit).toBe(true);
  });
});
