

var latRe=/^(\d{2})([\d\ ]{2}).([\d ]{2})([NS])$/;

describe("The regexp for latitude", function() {
  it("matches a fully specified latitude", function() {
    expect("4532.28N".match(latRe)).toBeTruthy();
  });
  it("matches a latitude with 10th minutes", function() {
    expect("4532.2 N".match(latRe)).toBeTruthy();
  });
  it("matches a latitude with no decimal minutes", function() {
    expect("4532.  N".match(latRe)).toBeTruthy();
  });
  it("matches a latitude with 10s of minutes", function() {
    expect("453 .  N".match(latRe)).toBeTruthy();
  });
  it("matches a latitude with no minutes", function() {
    expect("45  .  N".match(latRe)).toBeTruthy();
  });
});
