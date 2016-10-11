
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

/*
A FrameEndpoint is an object that represents a connection from "outside"
the system.

Potential subclasses might be a
  SerialKISSFrameEndpoint, which connects to a KISS TNC via a serial port,
  SocketKISSFrameEndpoint, which connects to a socket (e.g. Direwolf),
  SocketKISSFrameServerEndpoint, which establishes a server socket that APRX might
    connect to, or
  APRSISFrameEndpoint, that would connect to an APRSIS server.

When the FrameEndpoint is "Enabled", it attempts to make its connection to the
outside world.  When the connection is successful, it goes into the "Connected"
state and fires a "connect" event.  If for any reason the connection is lost,
it fires a "disconnect" event and goes into "Unconnected" state.

Input and output streams.
-------------------------

On input (from the outside interface into the system), a FrameEndpoint performs
no buffering.  It just fires events and whoever receives the events does
whatever they need to with the frame,

To output, call the stream's 'data' function.

On output, the FrameEndpoint _may_ perform buffering.  In that case, the buffering
has the following states:

BufferClear: No restriction
Buffering: Output is limited, but plenty of room in the buffer.
HighWater: Output is limited, buffer is getting full.  Time to throttle the input
Full: No room in buffer, further output will be discarded.

*/
