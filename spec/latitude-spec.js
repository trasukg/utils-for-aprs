var APRSInfoParser=require("../aprs-info-parser.js");
var formats=require("../aprs-formats");

var parser=new APRSInfoParser();
parser.frame={
  position: {
    coords: {}
  }
};

describe("Latitude parser", function() {
  it("parses degrees alone.", function() {
    parser.lexer.setInput("49  .  N");
    formats.parseLatitude.call(parser);
    expect(parser.frame.position.coords.latitude).toBeCloseTo(49,0.1);
  });
  it("parses a latitude with 10s of minutes", function() {
    parser.lexer.setInput("493 .  N");
    formats.parseLatitude.call(parser);
    expect(parser.frame.position.coords.latitude).toBeCloseTo(49.5,0.1);
  });
  it("parses a latitude with minutes", function() {
    parser.lexer.setInput("4935.  N");
    formats.parseLatitude.call(parser);
    expect(parser.frame.position.coords.latitude).toBeCloseTo(49.5833,4);
  });
  it("parses a latitude with minutes and 10th minutes", function() {
    parser.lexer.setInput("4935.4 N");
    formats.parseLatitude.call(parser);
    expect(parser.frame.position.coords.latitude).toBeCloseTo(49.59,4);
  });
  it("parses a fully specified latitude", function() {
    parser.lexer.setInput("4935.49N");
    formats.parseLatitude.call(parser);
    expect(parser.frame.position.coords.latitude).toBeCloseTo(49.5915,4);
  });
  it("parses a fully specified southern latitude", function() {
    parser.lexer.setInput("4935.49S");
    formats.parseLatitude.call(parser);
    expect(parser.frame.position.coords.latitude).toBeCloseTo(-49.5915,4);
  });
  it("calculates accurace for a 'minute' arc", function() {
    parser.lexer.setInput("4935.  S");
    formats.parseLatitude.call(parser);
    /*
      1 minute of arc is 1 nm at the equator, but since the APRS ambiguity
      defines a box in degrees, the html5 accuracy must be sqrt(2)*mins,
      converted to meters.
    */
    var expectedAccuracy=1.414214*1852;
    expect(parser.frame.position.coords.accuracy).toBeCloseTo(expectedAccuracy,1);
  });});
