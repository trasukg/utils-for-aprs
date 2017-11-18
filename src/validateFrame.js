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

var exceptions=require('./exceptions.js');

/**
  This function validates the JSON representation of frames to ensure that
  they can be used by the KISSFrameBuilder.
*/
module.exports=function(frame) {
  if (!frame.source) {
    throw new exceptions.FormatError("Source address is missing.");
  }
  if (!frame.destination) {
    throw new exceptions.FormatError("Destination address is missing.");
  }
  if (!frame.protocol) {
    frame.protocol=240;
  }
  if(!frame.repeaterPath) {
    frame.repeaterPath=[];
  }
  /* AX.25 allows up to 8 repeater path entries. */
  if (frame.repeaterPath.length>8) {
    throw new exceptions.FormatError("Repeater path is longer than 8 entries.")
  }
  /*
    Setup the address constraints - in the AX.25 packet, the last address in
    the block needs to have the 'extension' bit set to true, and all the others
    need to be false.
    The address block is
      <dest><src>[path]*
    So, if there are addresses in the repeater path, the src needs the extension
    bit false, and the last path entry needs to have extension true.
    If there are no addresses in the repeater path, the src needs extension=true.
  */
  frame.destination.extensionBit=false;
  frame.source.extensionBit=(frame.repeaterPath.length===0)
  if (frame.repeaterPath.length>0) {
    for (var i=0;i<frame.repeaterPath.length-1;i++) {
      frame.repeaterPath[i].extensionBit=false;
    }
    frame.repeaterPath[i].extensionBit=true;
  }
}
