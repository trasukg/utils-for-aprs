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

var lexer=new InfoLexer();
var token={};

function advance() {
  token=lexer.lex();
}

function parse(frame) {
  frame.dataTypeChar=frame.info.charCodeAt(0);
  var parser=dataTypeParsers[frame.dataTypeChar];
  if (parser == undefined) {
    throw new exceptions.InfoError(sprintf("%d (%s)",
      frame.dataTypeChar, String.fromCharCode(frame.dataTypeChar)));
  }
  // Prime the lexical analyzer for the rest of the frame.
  lexer.setInput(frame.info.slice(1));
  parser(frame);
}

exports.parse=parse;

function parseStatus(frame) {
  frame.dataType='status';
  var infoString=frame.info.toString('utf8');
  //console.log("InfoString is " + infoString);
  var result=/^>(\d{6}z)?(.*)$/.exec(infoString);
  if (result == undefined) {
    throw new exceptions.InfoError(sprintf("Bad Format: %s", infoString));
  }
  console.log("Result is " + result);
  if (result[1] != undefined) {
    throw new exceptions.InfoError("timestamp not implemented yet");
    //console.log("timestamp string is %s", result[1]);
    // Make a time value from the timestamp.
  }
  frame.statusText=result[2];
}

function parseTelemetry(frame) {
  frame.dataType='telemetry';
  frame.telemetry={};
  advance();
  if (token.token==InfoLexer.SEQ_NUMBER) {
    frame.telemetry.sequenceNumber=token.tval;
    advance();
    if (token.token!=InfoLexer.COMMA) {
      throw new exceptions.FormatError("SEQ_NUMBER should be followed by a comma");
    }
    advance();
    parseTelemetryValues(frame);
  } else if (token.token==InforLexer.MIC) {
    advance();
    if (token.token==InfoLexer.COMMA) {
      advance();
    }
    parseTelemetryValues(frame);
  } else {
    throw new exceptions.FormatError("Telemetry should start with SEQ_NUMBER or MIC");
  }
}

/*
  APRS specifies five integers followed by 8 flag bits, then the balance is a
  comment.
*/
function parseTelemetryValues(frame) {
  frame.telemetry.values=[];
  for (var i=0; i<5; i++) {
    if (token.token != InfoLexer.INT) {
      console.log("token value", token);
      throw new exceptions.FormatError("Telemetry value " + i + " should be integer");
    }
    frame.telemetry.values.push(token.tval);
    advance();
    if (token.token!=InfoLexer.COMMA) {
      throw new exceptions.FormatError("Telemetry values should end in ','");
    }
    advance();
  }
  if (token.token != InfoLexer.BINARY_OCTET) {
    throw new exceptions.FormatError("Telemetry needs 8 binary bits at the end");
  }
  frame.telemetry.flags=token.tval;
  frame.comment=lexer.theRest();
}

var dataTypeParsers={
  62 : parseStatus,
  84 : parseTelemetry
};
