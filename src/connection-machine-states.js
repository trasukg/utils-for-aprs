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

module.exports = {
  Idle: {
    enable: 'Connecting',
    error: 'Idle',
    timeout: 'Idle',
    disable: 'Idle'
  },
  Connecting: {
    connectionSucceeded: 'Connected',
    connectionFailed: 'WaitingRetry',
    error: 'WaitingRetry',
    disable: ['Idle', function() {this.closeConnection(); }],
    onEntry: function() { this.openConnection(); },
  },
  Connected: {
    disable: 'Idle',
    error: 'WaitingRetry',
    onExit: function() { this.closeConnectionAndEmitDisconnect(); },
    onEntry: function() { this.emitConnect(); }
  },
  WaitingRetry: {
    disable: 'Idle',
    error: 'WaitingRetry',
    timeout: 'Connecting',
    onEntry: function() { this.triggerWait(); },
  }
}
