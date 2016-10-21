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

var util=require("util");
var Lexer=require("lex");

module.exports=InfoLexer;

function InfoLexer() {
  Lexer.call(this);

  this.theRest=function() {
    return this.input.slice(this.index);
  };

  this.addRule(/#(\d{1,3})/, function(lexeme, n) {
    return {
      token: InfoLexer.SEQ_NUMBER,
      tval: parseInt(n, 10)
    };
  });
  this.addRule(/MIC/, function() {
    return {
      token: InfoLexer.MIC
    };
  });
  this.addRule(/,/, function() {
    return {
      token: InfoLexer.COMMA
    };
  });
  this.addRule(/:/, function() {
    return {
      token: InfoLexer.COLON
    };
  });
  this.addRule(/\d{1,3}/, function(lexeme) {
    return {
      token: InfoLexer.INT,
      tval: parseInt(lexeme)
    };
  });
  this.addRule(/[01]{8}/, function(lexeme) {
    return {
      token: InfoLexer.BINARY_OCTET,
      tval: parseInt(lexeme,2)
    };
  });

  this.advance=function() {
    this.current=this.lex();
  }

  // Advance and read a fixed-length field of n characters.
  this.advanceFixed=function(n) {
    this.token=InfoLexer.FIXED_WIDTH;
    this.tval=this.input.slice(this.index, this.index+n);
    this.index += n;
    return this.tval;
  }

  // Peek at a possible fixed-width field.
  this.peek=function(n) {
    return this.input.slice(this.index, this.index+n);
  }
}

util.inherits(InfoLexer,Lexer);


InfoLexer.SEQ_NUMBER=0;
InfoLexer.MIC=1;
InfoLexer.COMMA=2;
InfoLexer.INT=3;
InfoLexer.BINARY_OCTET=4;
InfoLexer.FIXED_WIDTH=5;
InfoLexer.COLON=6;
