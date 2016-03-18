
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

var parseLatitude=function() {
  var field=this.lexer.advanceFixed(8);
  //console.log("Input for latitude is '%s'", field);
  var result=/^(\d{2})([\d\ ]{2}).([\d ]{2})([NS])$/.exec(field);
  if (result == undefined) {
    throw new exceptions.FormatError("Bad format for latitude");
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

var parseDataExtension=function() {}
exports.parseDataExtension=parseDataExtension;

var parseCommentThatMayHaveAltitude=function() {}
exports.parseCommentThatMayHaveAltitude=parseCommentThatMayHaveAltitude;
