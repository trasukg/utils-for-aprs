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

var exceptions=require("./exceptions");
var sprintf=require("sprintf-js").sprintf;
var InfoLexer=require("./info-lex");
var formats=require("./aprs-formats");
var micE=require("./mic-e-format");

var APRSInfoParser=function() {
  this.lexer=new InfoLexer();
}

module.exports=APRSInfoParser;

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
  if (this.lexer.current.token===InfoLexer.SEQ_NUMBER) {
    this.frame.telemetry.sequenceNumber=this.lexer.current.tval;
    this.lexer.advance();
    if (this.lexer.current.token!==InfoLexer.COMMA) {
      throw new exceptions.FormatError("SEQ_NUMBER should be followed by a comma");
    }
    this.lexer.advance();
    parseTelemetryValues.call(this);
  } else if (this.lexer.current.token===InfoLexer.MIC) {
    this.lexer.advance();
    if (this.lexer.current.token===InfoLexer.COMMA) {
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
    if (this.lexer.current.token !== InfoLexer.INT) {
      //console.log("token value", token);
      throw new exceptions.FormatError("Telemetry value " + i + " should be integer");
    }
    this.frame.telemetry.values.push(this.lexer.current.tval);
    this.lexer.advance();
    if (this.lexer.current.token!==InfoLexer.COMMA) {
      throw new exceptions.FormatError("Telemetry values should end in ','");
    }
    this.lexer.advance();
  }
  if (this.lexer.current.token !== InfoLexer.BINARY_OCTET) {
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
  parsePositionWithTimestampData.call(this);
}

var parsePositionWithTimestampData=function() {
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
  parsePositionWithTimestampData.call(this);
}

var parsePositionWithoutTimestampWithMessaging=function() {
  this.frame.hasMessaging=true;
  this.frame.dataType='positionWithoutTimestamp';
  this.frame.position={
    coords: {}
  };
  parsePositionWithoutTimestampData.call(this);
}

var parsePositionWithoutTimestampNoMessaging=function() {
  this.frame.hasMessaging=false;
  this.frame.dataType='positionWithoutTimestamp';
  parsePositionWithoutTimestampData.call(this);
}

var parsePositionWithoutTimestampData=function() {
  this.frame.position={
    coords: {}
  };
  formats.parsePositionCoordinates.call(this);
  formats.parseDataExtension.call(this);
  formats.parseCommentThatMayHaveAltitudeOrWeather.call(this);
};

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
  if (this.lexer.current.token !== InfoLexer.COLON) {
    //console.log('lexer.theRest=' + this.lexer.theRest());
    throw new exceptions.FormatError("Message format is incorrect - should be ':' after addressee");
  }
  formats.parseMessageText.call(this);
}

/**
  Objects:
    ';' <objectName> (positionWithTimestamp)
*/
var parseObject=function() {
  this.frame.dataType='object';
  formats.parseObjectName.call(this);
  if (this.lexer.current.token === InfoLexer.STAR) {
    this.frame.killed=false;
  } else if (this.lexer.current.token !== InfoLexer.UNDERSCORE) {
    //console.log('lexer.theRest=' + this.lexer.theRest());
    throw new exceptions.FormatError("Object format is incorrect - should be " +
      "* or _ after name");
  }
  parsePositionWithTimestampData.call(this);
}

var parseStationCapability=function() {
  this.frame.dataType='stationCapabilities';
  var rs=/IGATE,MSG_CNT=(\d+),LOC_CNT=(\d+)/.exec(this.lexer.theRest());
  if (!rs) {
    throw new exceptions.FormatError("Unknown station capability:" +
      this.lexer.theRest());
  }
  this.frame.capability='IGATE';
  this.frame.messageCount=parseInt(rs[1]);
  this.frame.localStationCount=parseInt(rs[2]);
}

var parseThirdPartyTraffic=function() {
  // Transfer the source, destination and path to forwardingXYZ
  this.frame.forwardingSource=this.frame.source;
  this.frame.forwardingRepeaterPath=this.frame.repeaterPath;
  this.frame.forwardingDestination=this.frame.destination;
  delete this.frame.destination;
  delete this.frame.source;
  delete this.frame.repeaterPath;

  // Get the lexer started (this isn't done by the parse() function).
  this.lexer.advance();

  parseThirdPartyHeader.call(this);
  parseThirdPartyData.call(this);
};

var parseThirdPartyHeader=function() {
  this.frame.source=formats.parseTNC2Callsign.call(this);
  if (this.lexer.current.token !== InfoLexer.GREATER_THAN) {
    throw new exceptions.FormatError("Third-party header format is incorrect: " +
      "should include '>'");
  }
  this.lexer.advance();
  this.frame.destination=formats.parseTNC2Callsign.call(this);
  this.frame.repeaterPath=[];
  /*
    The third-party header must include network ID and receiving gateway stn.
    We treat this as a repeaterlist, and just keep parsing until the list no
    longer continues (i.e. the next token isn't a comma).
  */
  parseRepeaterPathList.call(this);
  if (this.lexer.current.token !== InfoLexer.COLON) {
    throw new exceptions.FormatError("Expected ':' after third-party header");
  }

};

var parseRepeaterPathList=function() {
  if(this.lexer.current.token===InfoLexer.COMMA) {
    this.lexer.advance();
    this.frame.repeaterPath.push(formats.parseTNC2Callsign.call(this));
    parseRepeaterPathList.call(this);
  }
}
var parseThirdPartyData=function() {
  this.frame.info=this.lexer.theRest();
  parseInfo.call(this);
};

var dataTypeParsers={
  62 : parseStatus,
  84 : parseTelemetry,
  47 : parsePositionWithTimestampNoMessaging,
  64 : parsePositionWithTimestampWithMessaging,
  61 : parsePositionWithoutTimestampWithMessaging,
  33 : parsePositionWithoutTimestampNoMessaging,
  96 : parseCurrentMicEData,
  39 : parseCurrentMicEData,
  58 : parseMessage,
  59 : parseObject,
  60 : parseStationCapability,
  125 : parseThirdPartyTraffic
};

var parseInfo=function() {
  this.frame.dataTypeChar=this.lexer.advanceFixed(1).charCodeAt(0);
  var parser=dataTypeParsers[this.frame.dataTypeChar];
  if (parser === undefined) {
    throw new exceptions.InfoError(sprintf("%d (%s)",
      this.frame.dataTypeChar, String.fromCharCode(this.frame.dataTypeChar)));
  }
  parser.call(this);
};

APRSInfoParser.prototype.parse=function(frame) {
  this.frame=frame;
  // Prime the lexical analyzer for the rest of the frame.
  this.lexer.setInput(frame.info);
  parseInfo.call(this);
  this.frame=undefined;
}


