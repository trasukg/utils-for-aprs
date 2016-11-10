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

/*
  Timestamp is a fixed-length field - 7 bytes.

*/
var parseTimestamp=function() {
  this.lexer.advanceFixed(7);
  var result;
  if (result= /(\d{2})(\d{2})(\d{2})h/.exec(this.lexer.tval)) {
    // HHMMSS zulu time
    var hrs=result[1];
    var mins=result[2];
    var secs=result[3];
    var timestamp=new Date();
    timestamp.setUTCHours(parseInt(hrs));
    timestamp.setUTCMinutes(parseInt(mins));
    timestamp.setUTCSeconds(parseInt(secs));
    timestamp.setUTCMilliseconds(0);
    this.frame.position.timestamp=timestamp;
    //console.log("Got timestamp " + timestamp);
  }  else if (result= /(\d{2})(\d{2})(\d{2})z/.exec(this.lexer.tval)) {
      // ddHHMM zulu time
      var day=result[1];
      var hrs=result[2];
      var mins=result[3];
      var timestamp=new Date();
      timestamp.setUTCHours(parseInt(hrs));
      timestamp.setUTCMinutes(parseInt(mins));
      timestamp.setDate(parseInt(day));
      timestamp.setUTCSeconds(0);
      timestamp.setUTCMilliseconds(0);
      this.frame.position.timestamp=timestamp;
      //console.log("Got timestamp " + timestamp);
    } else if (result= /(\d{2})(\d{2})(\d{2})\//.exec(this.lexer.tval)) {
        // ddHHMM local time
        var day=result[1];
        var hrs=result[2];
        var mins=result[3];
        var timestamp=new Date();
        timestamp.setHours(parseInt(hrs));
        timestamp.setMinutes(parseInt(mins));
        timestamp.setDate(parseInt(day));
        timestamp.setSeconds(0);
        timestamp.setMilliseconds(0);
        this.frame.position.timestamp=timestamp;
        //console.log("Got timestamp " + timestamp);
    }
}
exports.parseTimestamp=parseTimestamp;

exports.parseOptionalTimestamp=function() {
  var peek=this.lexer.peek(7);
  if (/\d{6}[zh\/]/.test(peek)) {
    parseTimestamp.call(this);
  }
}

/*
  APRS101-24.  Coords are latitude symbol table id, longitude, symbol id.
*/
exports.parsePositionCoordinates=function() {
  parseLatitude.call(this);
  parseSymbolTableId.call(this);
  parseLongitude.call(this);
  parseSymbolId.call(this);
}

var digitValues={
  ' ': 0,
  '0': 0,
  '1': 1,
  '2': 2,
  '3': 3,
  '4': 4,
  '5': 5,
  '6': 6,
  '7': 7,
  '8': 8,
  '9': 9
};
exports.digitValues=digitValues;

var parseLatitude=function() {
  var field=this.lexer.advanceFixed(8);
  //console.log("Input for latitude is '%s'", field);
  var result=/^(\d{2})([\d\ ]{2}).([\d ]{2})([NS])$/.exec(field);
  if (result == undefined) {
    throw new exceptions.FormatError("Bad format for latitude: '" + field +"'");
  }
  var degrees=parseFloat(result[1]);
  var minutes=
    digitValues[result[2].charAt(0)]*10 +
      digitValues[result[2].charAt(1)] +
      digitValues[result[3].charAt(0)]/10 +
      digitValues[result[3].charAt(1)]/100;
  degrees += minutes/60;
  degrees = (result[4]=='N')?degrees:-degrees;
  // Calculate the accuracy.
  if (result[2].charAt(0)==' ') {
    minutesAccuracy=60;
  } else if (result[2].charAt(1)==' ') {
    minutesAccuracy=10;
  } else if (result[3].charAt(0)==' ') {
    minutesAccuracy=1;
  } else if (result[3].charAt(1)==' ') {
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
exports.parseLatitude=parseLatitude;

var parseSymbolTableId=function() {
  this.frame.position.symbolTableId=this.lexer.advanceFixed(1);
};
exports.parseSymbolTableId=parseSymbolTableId;

var parseSymbolId=function() {
  this.frame.position.symbolId=this.lexer.advanceFixed(1);
};
exports.parseSymbolId=parseSymbolId;

var parseLongitude=function() {
  var field=this.lexer.advanceFixed(9);
  //console.log("Input for longitude is '%s'", field);
  var result=/^(\d{3})([\d\ ]{2}).([\d ]{2})([EW])$/.exec(field);
  if (result == undefined) {
    throw new exceptions.FormatError("Bad format for longitude");
  }
  var degrees=parseFloat(result[1]);
  var minutes=
    digitValues[result[2].charAt(0)]*10 +
      digitValues[result[2].charAt(1)] +
      digitValues[result[3].charAt(0)]/10 +
      digitValues[result[3].charAt(1)]/100;
  degrees += minutes/60;
  degrees = (result[4]=='E')?degrees:-degrees;

  this.frame.position.coords.longitude=degrees;
}
exports.parseLongitude=parseLongitude;

var phgre=/PHG(\d)(\d)(\d)(\d)/;

/*
  There are very few possible values, so we'll use a lookup table to speed
  things up a little.
*/
var phgValues=[
  {power: 0, height: 10, gain: 0, directivity: undefined },
  {power: 1, height: 20, gain: 1, directivity: 45 },
  {power: 4, height: 40, gain: 2, directivity: 90 },
  {power: 9, height: 80, gain: 3, directivity: 135 },
  {power: 16, height: 160, gain: 4, directivity: 180 },
  {power: 25, height: 320, gain: 5, directivity: 225 },
  {power: 36, height: 640, gain: 6, directivity: 270 },
  {power: 49, height: 1280, gain: 7, directivity: 315 },
  {power: 64, height: 2560, gain: 8, directivity: 360 },
  {power: 81, height: 5120, gain: 9, directivity: undefined },
];

var parseDataExtension=function() {
  var extension=this.lexer.peek(7);
  var result;
  if (result=phgre.exec(extension)) {
    this.lexer.advanceFixed(7);
    this.frame.position.power=phgValues[parseInt(result[1])].power;
    this.frame.position.height=phgValues[parseInt(result[2])].height;
    this.frame.position.gain=phgValues[parseInt(result[3])].gain;
    this.frame.position.directivity=phgValues[parseInt(result[4])].directivity;
  }
}

exports.parseDataExtension=parseDataExtension;

var parseWeatherData=function(comment) {
  var result;
  var weather={};
  // Get wind direction and speed
  result= /^(\d{3})\/(\d{3})/.exec(comment);
  if (result) {
   weather.windDirection=parseFloat(result[1]);
   weather.windSpeed=parseFloat(result[2]);
  }
  // Get wind direction If not at start of comment.
  (result= /c(\d{3})/.exec(comment)) && (weather.windDirection=parseFloat(result[1]));
  // Get wind speed If not at start of comment.
  (result= /s(\d{3})/.exec(comment)) && (weather.windSpeed=parseFloat(result[1]));
  // Get gust
  (result= /g(\d{3})/.exec(comment)) && (weather.gust=parseFloat(result[1]));
  // Get Temperature
  (result= /t(\d{3})/.exec(comment)) && (weather.temperature=parseFloat(result[1]));
  // Get rain in last hour
  (result= /r(\d{3})/.exec(comment)) && (weather.rainLastHour=parseFloat(result[1]));
  // Get rain in last 24 hours.
  (result= /p(\d{3})/.exec(comment)) && (weather.rainLast24Hour=parseFloat(result[1]));
  // Get rain since midnight
  (result= /P(\d{3})/.exec(comment)) && (weather.rainSinceMidnight=parseFloat(result[1]));
  // Get humidity
  (result= /h(\d{2})/.exec(comment)) && (weather.humidity=parseFloat(result[1]));
  // Get Pressure
  (result= /b(\d{5})/.exec(comment)) && (weather.barometer=parseFloat(result[1])/100);
  this.frame.weather=weather;
}

var parseCommentThatMayHaveAltitudeOrWeather=function() {
  var comment=this.lexer.theRest();
  //console.log("comment is '%s'", comment);
  if (this.frame.position.symbolId=="_") {
    parseWeatherData.call(this,comment);
  } else {
    // See if altitude is the first thing.
    var result=/^\/A=(\d{6})/.exec(comment);
    if (result) {
      // If it is, snap the altitude and then strip it from the front.
      this.frame.position.coords.altitude=parseFloat(result[1])*0.3048;
      comment=comment.slice(9);
    } else {
      // See if there's an altitude anywhere.  If so, collect it, but leave it in.
      result=/\/A=(\d{6})/.exec(comment);
      if (result) {
        this.frame.position.coords.altitude=parseFloat(result[1])*0.3048;
      }
    }
  }
  // If comment starts with '/' strip the '/'
  if (comment.startsWith('/')) {
    comment=comment.slice(1);
  }
  comment=comment.trim();
  this.frame.comment=comment;
}
exports.parseCommentThatMayHaveAltitudeOrWeather=parseCommentThatMayHaveAltitudeOrWeather;

var parseAddressee=function() {
  this.frame.addressee=this.lexer.advanceFixed(9).trim();
  this.lexer.advance();
}
exports.parseAddressee=parseAddressee;

var parseMessageText=function() {
  var text=this.lexer.theRest();
  var result=/^([^{]*)([{]([^}]*))?(([}])(.*))?$/.exec(text);
  if(!result) {
    throw new exceptions.FormatError('Bad format for message');
  }
  this.frame.message=result[1];
  this.frame.messageId=result[3];
  this.frame.senderIsReplyAckCapable=(result[5]=='}');
  this.frame.replyAck=result[6];
}
exports.parseMessageText=parseMessageText;

var parseObjectName=function() {
  this.frame.objectName=this.lexer.advanceFixed(9).trim();
  this.lexer.advance();
}
exports.parseObjectName=parseObjectName;
