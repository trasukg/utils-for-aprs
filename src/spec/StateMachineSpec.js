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

var EventEmitter=require('events');

describe("The StateMachine generator", function() {
  var StateMachine=require('../StateMachine.js');
  it('exists in a module', function() {
    expect(typeof(StateMachine)).toBe('function');
  });

  var trBWasCalled=false;

  var trB=function() {
    trBWasCalled=true;
  }

  var calledValue=null;

  var entryCalled=false;
  var exitCalled=false;
  var stayWasCalled=false;

  var states={
    A: {
      go: 'B',
      takeArgs: ['A', function(val) {
        calledValue=val;
      }],
      stay: function() {
        stayWasCalled=true;
      }
    },
    B: {
      go: ['A', function() { trB(); }],
      onEntry: function() {
        entryCalled=true;
      },
      onExit: function() {
        exitCalled=true;
      }
    }
  };
  var machine=null;
  beforeEach(function() {
    machine=new StateMachine(states,'A');
    //console.log("Created machine is:");
    //console.log(machine);
  });

  it('creates a machine that inherits from StateMachine', function() {
      console.log("machine's prototype is " + JSON.stringify(machine.prototype));
      expect(machine instanceof StateMachine).toBe(true);
  });

  it('creates a machine that inherits from EventEmitter', function() {
      console.log("machine's prototype is " + JSON.stringify(machine.prototype));
      expect(machine instanceof EventEmitter).toBe(true);
  });

  it('creates an object when we define states', function() {
    expect(typeof(machine)).toBe('object');
  });

  it('creates an object with a "go" method when we hand it a state table',
   function() {
     expect(typeof(machine.go)).toBe('function');
  });

  it('Starts in state A', function() {
    expect(machine.currentState.name).toBe('A');
  });

  it('Goes to state B when we call go.', function() {
    machine.go();
    expect(machine.currentState.name).toBe('B');
  });

  it('Goes to state A while calling the transition function when we call go',
  function() {
    machine.go();
    expect(machine.currentState.name).toBe('B');
    machine.go();
    expect(machine.currentState.name).toBe('A');
    expect(trBWasCalled).toBe(true);
  });

  it('Passes arguments to the transition functions', function() {
    expect(machine.currentState.name).toBe('A');
    machine.takeArgs("YYZ");
    expect(machine.currentState.name).toBe('A');
    expect(calledValue).toBe("YYZ");
  });

  it('Recognizes an event with function only', function() {
    expect(machine.currentState.name).toBe('A');
    machine.stay();
    expect(stayWasCalled).toBe(true);
    expect(machine.currentState.name).toBe('A');
  });

  it('Calls onEntry and onExit functions', function() {
    machine.go();
    expect(machine.currentState.name).toBe('B');
    expect(entryCalled).toBe(true);
    machine.go();
    expect(machine.currentState.name).toBe('A');
    expect(exitCalled).toBe(true);
  });
});
