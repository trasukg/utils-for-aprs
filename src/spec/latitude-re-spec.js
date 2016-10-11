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
