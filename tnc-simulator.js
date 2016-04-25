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

/**
  This simulator function sets up an ongoing background timer that gets a
  buffer from the packetBufferSource, then calls the deliveryFunction with it.

  It starts out at an initial rate for some initial interval, then switches to
  a sustained rate.
*/
var tncSimulator=function(packetBufferSource, deliveryFunction, initialInterval,
  initialRate, sustainedRate) {

  var count=0;
  var cancelFlag=false;

  var timeoutInInitialState=function() {
    if (cancelFlag) return;
    deliveryFunction(packetBufferSource());
    count=count+1;
    if (count > initialInterval*initialRate) {
      console.log("timeoutInInitialState: next timeout is " + (1000/sustainedRate) + "ms");
      setTimeout(timeoutInSustainedState, 1000/sustainedRate);
    } else {
      console.log("timeoutInInitialState: next timeout is " + (1000/initialRate) + "ms");
      setTimeout(timeoutInInitialState, 1000/initialRate);
    }
  }
  var timeoutInSustainedState=function() {
    if (cancelFlag) {
      return;
    }
    deliveryFunction(packetBufferSource());
    console.log("timeoutInSustainedState: next timeout is " + (1000/sustainedRate) + "ms");
    setTimeout(timeoutInSustainedState, 1000/sustainedRate);
  }
  timeoutInInitialState();
  return function() {
    cancelFlag=true;
  }
}
module.exports=tncSimulator;
