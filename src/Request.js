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
var StateMachine=require('@trasukg/state-machine');
var Promise=require('bluebird');

var states={
  Idle: {
    send: ['Sending', function(sender, completer) {
      /* This should return a promise. */
      var self=this;
      return new Promise(function(resolve, reject) {
        self.resolve=resolve;
        self.reject=reject;
        self.completer=completer;
        sender(self.data);
      });
    }]
  },
  Sending: {
    reply: ['Complete', function(data) {
      // console.log('Got reply(' + JSON.stringify(data) + ') in Sending');
      this.resolve(data);
      // console.log('...resolved');
    }],
    timeout: ['Complete', function() {
      this.reject(new Error('Timed Out'));
    }],
    onEntry: function() {
      var self=this;
      setTimeout(function() {
        self.timeout();
      },5000);
    }
  },
  Complete: {
    timeout: 'Complete',
    reply: 'Complete',
    onEntry: function() {
      if(this.completer) {
        this.completer();
      }
    }
  }
};

var Request=function(data) {
  StateMachine.call(this, states, 'Idle');
  this.data=data;
}

util.inherits(Request, StateMachine);

module.exports=Request;
