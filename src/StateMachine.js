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

var util=require('util');

//var EventEmitter=require('events');


var StateMachine=function(stateDescriptions, initialState) {
  //console.log("Initializing a new StateMachine...");
  //console.log("stateDescriptions=" + JSON.stringify(stateDescriptions));
  // Create the machine (this)
  // Go through the states, and create the list of events.
  var events={};
  for(var stateName in stateDescriptions) {
    for (event in stateDescriptions[stateName]) {
      if(!events[event]) {
        events[event]=[];
      }
    }
  }
  events=Object.keys(events);
  //console.log("this.events=" + JSON.stringify(events));
  var machine=this;

  // Now put in a function in the main object for every event.
  events.forEach(function(eventName) {
    machine[eventName]=function() {
      // console.log("Creating event " + eventName);
      /* The process is:
        - For the event (method) we're running, lookup the transition function
        on the current state object and run it.  The transition function sets
        the current state to the required new state, then runs any user-supplied
        transition function.

        So.. Each state needs a dictionary of transition functions, one for each
        event.  The transition function sets the new state, then runs the
        user-supplied transition function.

        If the user-supplied state description doesn't specify a transition for
        a given event, then we'll throw an error.
      */
      //console.log("event '" + eventName + "', args=" + JSON.stringify(arguments));
      //console.log("...before transition, state=" + machine.currentState.name);
      var transitionFunc=machine.currentState[eventName];
      return transitionFunc.apply(machine,arguments);
      //console.log("...after transition, state=" + machine.currentState.name);
    };
  });

  // Create the states...We do this first, so the event functions created
  // below have the states, and don't have to do a lookup.
  for (var stateName in stateDescriptions) {
    var newState={};
    // Default entry and exit functions are empty
    newState.onEntry=function() {}
    newState.onExit=function() {}

    machine[stateName]=newState;
    newState.name=stateName;
  }

  var nop=function() {}

  // Now fill in the events.
  for (var stateName in stateDescriptions) {
    var newState=this[stateName];
    machine[stateName]=newState;
    var currentState=machine[stateName];
    var stateDescription=stateDescriptions[stateName];
    events.forEach(function(eventName) {
      var eventDescription=stateDescription[eventName];
      if(eventDescription!=undefined) {
        if (typeof eventDescription=='string') {
        var nextState=machine[eventDescription];
          if (nextState != currentState) {
            newState[eventName]=function() {
              currentState.onExit.call(machine);
              machine.currentState=nextState;
              nextState.onEntry.call(machine);
            };
          } else {
            newState[eventName]=nop;
          }
        } else if (typeof eventDescription=='function') {
          newState[eventName]=eventDescription;
          // No new state, as there was just a function, so stay in current state.
        } else { /* There's a transition function  */
          var nextState=machine[eventDescription[0]];
          var transitionFunction=eventDescription[1];
          if (nextState != currentState) {
            newState[eventName]=function() {
              currentState.onExit.call(machine);
              machine.currentState=nextState;
              /*
              console.log("Calling transition function with args=" +
                JSON.stringify(arguments));
              */
              var retval=transitionFunction.apply(machine,arguments);
              nextState.onEntry.call(machine);
              return retval;
            };
          } else {
            newState[eventName]=function() {
              machine.currentState=nextState;
              /*
              console.log("Calling transition function with args=" +
                JSON.stringify(arguments));
              */
              return transitionFunction.apply(machine,arguments);
            };
          }
        }
      } else {
        if(eventName != 'onEntry' && eventName != 'onExit') {
          newState[eventName]=function() {
            throw new Error('Event \'' + eventName + '\' not allowed in state ' +
            newState.name + "\'");
          }
        }
      }
    });
  }

  // Set the initial state
  /*
  console.log('Initial state is ' + initialState);
  console.log('this[initialState] is ' + JSON.stringify(this[initialState]));
  */
  machine.currentState=this[initialState];
}

//util.inherits(StateMachine, EventEmitter);

module.exports=StateMachine;
