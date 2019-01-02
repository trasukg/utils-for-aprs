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

var AprsDataEndpoint=require('../AprsDataEndpoint');
var Promise=require('bluebird');

describe("An AprsDataEndpoint object", function() {
  var UUT;

  beforeEach(function() {
    UUT=new AprsDataEndpoint();
    /* This looks odd, but is here to alleviate a problem when running 'gulp test'
    where something else is installing a jasmine clock.
    https://stackoverflow.com/questions/39600819/conflict-between-zone-js-and-jasmines-clock
    */
    jasmine.clock().uninstall();
    jasmine.clock().install();
  });

  afterEach(function() {
    jasmine.clock().uninstall();
  });

  it('has an openConnection function', function() {
    expect(UUT.openConnection).toBeDefined();
  });

  it('Starts in an idle state', function() {
    spyOn(UUT, 'openConnection');
    expect(UUT.currentState.name).toBe('Idle');
  });

  it('goes to Connecting and opens the port when we enable()', function() {
    spyOn(UUT, 'openConnection');
    expect(UUT.currentState.name).toBe('Idle');
    UUT.enable();
    expect(UUT.currentState.name).toBe('Connecting');
    expect(UUT.openConnection).toHaveBeenCalled();
  });

  it('goes to Connected if the port opens', function() {
    spyOn(UUT, 'openConnection');
    expect(UUT.currentState.name).toBe('Idle');
    UUT.enable();
    expect(UUT.currentState.name).toBe('Connecting');
    expect(UUT.openConnection).toHaveBeenCalled();
    UUT.connectionSucceeded();
    expect(UUT.currentState.name).toBe('Connected');
  });

  it('goes to WaitingRetry if the port doesnt open', function() {
    spyOn(UUT, 'openConnection');
    expect(UUT.currentState.name).toBe('Idle');
    UUT.enable();
    expect(UUT.currentState.name).toBe('Connecting');
    expect(UUT.openConnection).toHaveBeenCalled();
    UUT.connectionFailed();
    expect(UUT.currentState.name).toBe('WaitingRetry');
  });

  it('tries opening again upon timeout', function() {
    spyOn(UUT, 'openConnection');
    expect(UUT.currentState.name).toBe('Idle');
    UUT.enable();
    expect(UUT.currentState.name).toBe('Connecting');
    expect(UUT.openConnection).toHaveBeenCalled();
    UUT.connectionFailed();
    expect(UUT.currentState.name).toBe('WaitingRetry');
    UUT.openConnection.calls.reset();
    UUT.timeout();
    expect(UUT.currentState.name).toBe('Connecting');
    expect(UUT.openConnection).toHaveBeenCalled();
  });

  it('fires a "connect" event if the port opens', function() {
    spyOn(UUT, 'openConnection');
    var eventMethod=jasmine.createSpy();
    UUT.on('connect', eventMethod);
    expect(UUT.currentState.name).toBe('Idle');
    UUT.enable();
    expect(UUT.currentState.name).toBe('Connecting');
    expect(UUT.openConnection).toHaveBeenCalled();
    UUT.connectionSucceeded();
    expect(UUT.currentState.name).toBe('Connected');
    expect(eventMethod).toHaveBeenCalled();
  });

  describe('A connected AprsDataEndpoint', function() {
    var UUT;

    beforeEach(function() {
      UUT=new AprsDataEndpoint();
      /* This looks odd, but is here to alleviate a problem when running 'gulp test'
      where something else is installing a jasmine clock.
      https://stackoverflow.com/questions/39600819/conflict-between-zone-js-and-jasmines-clock
      */
      jasmine.clock().uninstall();
      jasmine.clock().install();
      UUT.enable();
      UUT.connectionSucceeded();
    });

    afterEach(function() {
      jasmine.clock().uninstall();
    });

    it('Has a request() method', function() {
      expect(UUT.request).toBeDefined();
    });

    it('Sends a request message when we call request() method', function(done) {
      spyOn(UUT, 'send');
      Promise.resolve().then(function() {
        var promise=UUT.request({ command: "config?", msgId: 1});
        expect(promise instanceof Promise).toBeTruthy();
      }).then(function() {
        expect(UUT.send).toHaveBeenCalled();
      }).finally(done);
    });

    it('Completes request message when there is a reply', function(done) {
      spyOn(UUT, 'send');
      var responseHandler=jasmine.createSpy();
      var expectedResponse={ replyTo: 1, response: "Blah blah"};
      Promise.resolve().then(function() {
        var promise=UUT.request({ command: "config?", msgId: 1});
        expect(promise instanceof Promise).toBeTruthy();
        promise.then(responseHandler);
      }).then(function() {
        expect(UUT.send).toHaveBeenCalled();
      }).then(function() {
        UUT._incoming_message(expectedResponse);
      }).then(function() {
        jasmine.clock().tick(100);
      }).then(function() {
        expect(responseHandler).toHaveBeenCalledWith(expectedResponse);
        expect(UUT._outstandingRequests.size).toBe(0);
      })
      .finally(done);
    });


  })
});
