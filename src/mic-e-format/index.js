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
var addressEncoding=require("./address-encoding.js");
var digitValues=require("../aprs-formats").digitValues;

/*
  Parse a frame that contains Mic-E data format.
*/
var parse=function() {
  /* First parse the latitude. message and digi path code from the destination
  address field.
  */
  this.frame.dataType='micEData';
  parseDestinationAddressInfo.call(this);
  parseInfo.call(this);
  parseMessage.call(this);

}
module.exports.parse=parse;

var parseDestinationAddressInfo=function() {
  var destAddress=this.frame.destination.callsign;
  var latStr='';
  for (var i=0; i <6; i++) {
    //var c=destAddress.charAt(i);
    //console.log("i=%d, c=%s", i, c);
    //console.log("addressEncoding is ", addressEncoding[c]);
    latStr=latStr.concat(addressEncoding[destAddress.charAt(i)].latDigit);
  }
  latStr=latStr.concat((addressEncoding[destAddress.charAt(3)].north)?"N":"S");
  //console.log("Mic-E Latitude reads %s", latStr);
  var result=/^(\d{2})([\d\ ]{2})([\d ]{2})([NS])$/.exec(latStr);
  if (result === undefined) {
    throw new exceptions.FormatError("Bad format for latitude");
  }
  var degrees=parseFloat(result[1]);

  var minutes=
    digitValues[result[2].charAt(0)]*10 +
    digitValues[result[2].charAt(1)] +
    digitValues[result[3].charAt(0)]/10 +
    digitValues[result[3].charAt(1)]/100;
  degrees += minutes/60;
  degrees = (result[4]==='N')?degrees:-degrees;
  // Calculate the accuracy.
  var minutesAccuracy;
  if (result[2].charAt(0)===' ') {
    minutesAccuracy=60;
  } else if (result[2].charAt(1)===' ') {
    minutesAccuracy=10;
  } else if (result[3].charAt(0)===' ') {
    minutesAccuracy=1;
  } else if (result[3].charAt(1)===' ') {
    minutesAccuracy=0.1;
  } else {
    minutesAccuracy=0.01;
  }
  /*
    1 minute of arc is 1 nm at the equator, but since the APRS ambiguity
    defines a box in degrees, the html5 accuracy must be sqrt(2)*mins,
    converted to meters.
  */
  this.frame.position.coords.accuracy=minutesAccuracy*2619.123517;
  this.frame.position.coords.latitude=degrees;
}

var parseInfo=function() {
  var encodedData=this.lexer.advanceFixed(8);
  var longitudeOffset=
    addressEncoding[this.frame.destination.callsign.charAt(4)].longitudeOffset;
  var east=addressEncoding[this.frame.destination.callsign.charAt(5)].east;
  // Decoding as per APRS101 pp46-53
  var deg=encodedData.charCodeAt(0)-28;
  deg+=longitudeOffset;
  if (180 <= deg && deg <=189) {
    deg -= 80;
  } else if (190 <= deg && deg <= 199) {
    deg -= 190;
  }

  var minutes=encodedData.charCodeAt(1)-28;
  if (minutes>= 60) {
    minutes -= 60;
  }

  var hundredthMinutes=encodedData.charCodeAt(2);

  var longitude=deg + (minutes + hundredthMinutes/100)/60;
  longitude=east?longitude:-longitude;
  this.frame.position.coords.longitude=longitude;

  var speed=(encodedData.charCodeAt(3)-28) * 10;
  var dc=encodedData.charCodeAt(4) - 28;
  // Double bitwise-not converts float to ints in JavaScript
  speed=speed + ~~(dc/10);
  speed=(speed>=800)?speed-800:speed;

  var course=(speed%10) * 100;
  course=course + encodedData.charCodeAt(5) - 28;
  course=(course>400)?course-400:course;

  this.frame.position.coords.heading=course;
  // Convert to m/s
  this.frame.position.coords.speed=speed*0.514444;

  this.frame.position.symbolTableId=encodedData.charAt(7);
  this.frame.position.symbolId=encodedData.charAt(6);
}

/*
  Parse the message bits out of the destination address.
  Note - this is a pretty crazy encoding!
  See APRS101 page 45.
*/
var parseMessage=function() {
  var destAddress=this.frame.destination.callsign;
  var messageBits=0;
  var custom=0;
  for(var i=0; i < 3; i++) {
    messageBits=messageBits<<1;
    custom=custom<<1;
    var encoding=addressEncoding[destAddress.charAt(i)];
    custom=custom | (encoding.messageIsCustom?1:0);
    messageBits=messageBits | encoding.message;
  }
  this.frame.micEMessageBits=messageBits;
  // If all the 'custom' bits are not either 0 or 1, message is undefined.
  switch(custom) {
    case 0:
      this.frame.micEMessageType="standard";
      this.frame.micEMessage=standardMessages[messageBits];
      break;
    case 7:
      this.frame.micEMessageType="custom";
      this.frame.micEMessage=customMessages[messageBits];
      break;
    default:
      this.frame.micEMessageType='undefined';
  }
}

var standardMessages=[
  "Emergency",
  "Priority",
  "Special",
  "Committed",
  "Returning",
  "In Service",
  "En Route",
  "Off Duty"
];

var customMessages=[
  "Emergency",
  "Custom-6",
  "Custom-5",
  "Custom-4",
  "Custom-3",
  "Custom-2",
  "Custom-1",
  "Custom-0"
];
