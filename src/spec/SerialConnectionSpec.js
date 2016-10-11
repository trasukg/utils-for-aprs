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

var SerialConnection=require("../SerialConnection.js");
var StateMachine=require('../StateMachine.js');

describe('SerialConnection',function() {
  var UUT;
  beforeEach(function() {
    UUT=new SerialConnection("/dev/null", {});
  });

  it('is an instance of SerialConnection', function() {
    expect(UUT instanceof SerialConnection).toBeTruthy();
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

});
