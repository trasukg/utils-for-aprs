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

var Request=require('../Request');

describe("A Request object", function() {
  var UUT;
  var sender=jasmine.createSpy();
  var completer=jasmine.createSpy();

  beforeEach(function() {
    jasmine.clock().install();
  });

  afterEach(function() {
    jasmine.clock().uninstall();
  });

  var testData={ request: "Hi", messageId:1 };

  it('is created with an object for the request', function() {
    UUT=new Request(testData);
  });

  it('calls the sender function when we call send()', function() {
    UUT=new Request(testData);
    UUT.send(sender);
    expect(sender).toHaveBeenCalledWith(testData);
  });

  it('resolves the promise on reply()', function(done) {
    UUT=new Request(testData);
    var responseFunction=function(data) {
      console.log("got data " + JSON.stringify(data));
      done();
    };

    UUT.send(sender,completer).then(responseFunction).catch(function(err) {
      console.log("Caught error " + err);
    });
    expect(sender).toHaveBeenCalledWith(testData);
    testData.replyTo=testData.messageId;
    UUT.reply(testData);
    expect(completer).toHaveBeenCalled();
  });

  it("times out if there's no reply in time", function(done) {
    UUT=new Request(testData);
    var catchFunction=function(err) {
      console.log("got err " + JSON.stringify(err));
      done();
    }
    UUT.send(sender,completer).catch(catchFunction);
    expect(sender).toHaveBeenCalledWith(testData);
    jasmine.clock().tick(15000);
    expect(completer).toHaveBeenCalled();
  });
});
