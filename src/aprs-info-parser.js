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

var exceptions=require("./exceptions.js");
var sprintf=require("sprintf-js").sprintf;
var InfoLexer=require("./info-lex.js");
var formats=require("./aprs-formats");
var micE=require("./mic-e-format");

var APRSInfoParser=function() {
  this.lexer=new InfoLexer();
}

module.exports=APRSInfoParser;

APRSInfoParser.prototype.parse=function(frame) {
  this.frame=frame;
  frame.dataTypeChar=frame.info.charCodeAt(0);
  var parser=dataTypeParsers[frame.dataTypeChar];
  if (parser == undefined) {
    throw new exceptions.InfoError(sprintf("%d (%s)",
      frame.dataTypeChar, String.fromCharCode(frame.dataTypeChar)));
  }
  // Prime the lexical analyzer for the rest of the frame.
  this.lexer.setInput(frame.info.slice(1));
  parser.call(this);
  this.frame=undefined;
}

var parseStatus=function() {
  this.frame.dataType='status';
  this.frame.position={
    coords: {}
  };
  formats.parseOptionalTimestamp.call(this);
  parseStatusText.call(this);
}

var parseStatusText=function() {
    this.frame.statusText=this.lexer.theRest();
}

var parseTelemetry=function() {
  this.frame.dataType='telemetry';
  this.frame.telemetry={};
  this.lexer.advance();
  if (this.lexer.current.token==InfoLexer.SEQ_NUMBER) {
    this.frame.telemetry.sequenceNumber=this.lexer.current.tval;
    this.lexer.advance();
    if (this.lexer.current.token!=InfoLexer.COMMA) {
      throw new exceptions.FormatError("SEQ_NUMBER should be followed by a comma");
    }
    this.lexer.advance();
    parseTelemetryValues.call(this);
  } else if (this.lexer.current.token==InfoLexer.MIC) {
    this.lexer.advance();
    if (this.lexer.current.token==InfoLexer.COMMA) {
      this.lexer.advance();
    }
    parseTelemetryValues.call(this);
  } else {
    throw new exceptions.FormatError("Telemetry should start with SEQ_NUMBER or MIC");
  }
}

/*
  APRS specifies five integers followed by 8 flag bits, then the balance is a
  comment.
*/
var parseTelemetryValues=function() {
  this.frame.telemetry.values=[];
  for (var i=0; i<5; i++) {
    if (this.lexer.current.token != InfoLexer.INT) {
      console.log("token value", token);
      throw new exceptions.FormatError("Telemetry value " + i + " should be integer");
    }
    this.frame.telemetry.values.push(this.lexer.current.tval);
    this.lexer.advance();
    if (this.lexer.current.token!=InfoLexer.COMMA) {
      throw new exceptions.FormatError("Telemetry values should end in ','");
    }
    this.lexer.advance();
  }
  if (this.lexer.current.token != InfoLexer.BINARY_OCTET) {
    throw new exceptions.FormatError("Telemetry needs 8 binary bits at the end");
  }
  this.frame.telemetry.flags=this.lexer.current.tval;
  this.frame.comment=this.lexer.theRest();
}

/*
  Info field is something like '/000000h4328.55N/07941.71W#/A=000450'.
  This is pretty much a fixed-width format.
    - 7 bytes for timestamp (APRS101-22)
    - 8 bytes latitude (APRS101-23)
    - '/' is symbol table id. (APRS101-24)
    - 8 bytes longitude (APRS101-24)
    - '#' is the symbol id (APRS101-24)
    - Data extension may follow
    - Comment follows - may have altitude in comments.
*/
var parsePositionWithTimestampNoMessaging=function() {
  this.frame.hasMessaging=false;
  this.frame.dataType='positionWithTimestamp';
  this.frame.position={
    coords: {}
  };
  formats.parseTimestamp.call(this);

  formats.parsePositionCoordinates.call(this);
  formats.parseDataExtension.call(this);
  formats.parseCommentThatMayHaveAltitudeOrWeather.call(this);
}

var parsePositionWithTimestampWithMessaging=function() {
  this.frame.hasMessaging=true;
  this.frame.dataType='positionWithTimestamp';
  this.frame.position={
    coords: {}
  };
  formats.parseTimestamp.call(this);

  formats.parsePositionCoordinates.call(this);
  formats.parseDataExtension.call(this);
  formats.parseCommentThatMayHaveAltitudeOrWeather.call(this);
}

var parsePositionWithoutTimestampWithMessaging=function() {
  this.frame.hasMessaging=true;
  this.frame.dataType='positionWithoutTimestamp';
  this.frame.position={
    coords: {}
  };
  formats.parsePositionCoordinates.call(this);
  formats.parseDataExtension.call(this);
  formats.parseCommentThatMayHaveAltitudeOrWeather.call(this);
}

var parsePositionWithoutTimestampNoMessaging=function() {
  this.frame.hasMessaging=false;
  this.frame.dataType='positionWithoutTimestamp';
  this.frame.position={
    coords: {}
  };
  formats.parsePositionCoordinates.call(this);
  formats.parseDataExtension.call(this);
  formats.parseCommentThatMayHaveAltitudeOrWeather.call(this);
}

var parseCurrentMicEData=function() {
  this.frame.position={
    coords: {}
  };
  micE.parse.call(this);
}

/**
  Messages:
    ':' <addressee> ':' <message-text> ['{' <message-number> ]
*/
var parseMessage=function() {
  this.frame.dataType='message';
  formats.parseAddressee.call(this);
  if (this.lexer.current.token != InfoLexer.COLON) {}
}

var dataTypeParsers={
  62 : parseStatus,
  84 : parseTelemetry,
  47 : parsePositionWithTimestampNoMessaging,
  64 : parsePositionWithTimestampWithMessaging,
  61 : parsePositionWithoutTimestampWithMessaging,
  33 : parsePositionWithoutTimestampNoMessaging,
  96 : parseCurrentMicEData,
  39 : parseCurrentMicEData,
  ':': parseMessage
};
