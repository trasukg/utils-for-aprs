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

var addressEncoding = {
    '0' : { latDigit:'0', message:0, north:false, longitudeOffset:0, east:true },
    '1' : { latDigit:'1', message:0, north:false, longitudeOffset:0, east:true },
    '2' : { latDigit:'2', message:0, north:false, longitudeOffset:0, east:true },
    '3' : { latDigit:'3', message:0, north:false, longitudeOffset:0, east:true },
    '4' : { latDigit:'4', message:0, north:false, longitudeOffset:0, east:true },
    '5' : { latDigit:'5', message:0, north:false, longitudeOffset:0, east:true },
    '6' : { latDigit:'6', message:0, north:false, longitudeOffset:0, east:true },
    '7' : { latDigit:'7', message:0, north:false, longitudeOffset:0, east:true },
    '8' : { latDigit:'8', message:0, north:false, longitudeOffset:0, east:true },
    '9' : { latDigit:'9', message:0, north:false, longitudeOffset:0, east:true },
    'A' : { latDigit:'0', message:1, north:false, longitudeOffset:0, east:true },
    'B' : { latDigit:'1', message:1, messageIsCustom:true },
    'C' : { latDigit:'2', message:1, messageIsCustom:true },
    'D' : { latDigit:'3', message:1, messageIsCustom:true },
    'E' : { latDigit:'4', message:1, messageIsCustom:true },
    'F' : { latDigit:'5', message:1, messageIsCustom:true },
    'G' : { latDigit:'6', message:1, messageIsCustom:true },
    'H' : { latDigit:'7', message:1, messageIsCustom:true },
    'I' : { latDigit:'8', message:1, messageIsCustom:true },
    'J' : { latDigit:'9', message:1, messageIsCustom:true },
    'K' : { latDigit:' ', message:1, messageIsCustom:true },
    'L' : { latDigit:' ', message:1, north:false, longitudeOffset:0, east:true },
    'P' : { latDigit:'0', message:1, north:true, longitudeOffset:100, east:false },
    'Q' : { latDigit:'1', message:1, north:true, longitudeOffset:100, east:false },
    'R' : { latDigit:'2', message:1, north:true, longitudeOffset:100, east:false },
    'S' : { latDigit:'3', message:1, north:true, longitudeOffset:100, east:false },
    'T' : { latDigit:'4', message:1, north:true, longitudeOffset:100, east:false },
    'U' : { latDigit:'5', message:1, north:true, longitudeOffset:100, east:false },
    'V' : { latDigit:'6', message:1, north:true, longitudeOffset:100, east:false },
    'W' : { latDigit:'7', message:1, north:true, longitudeOffset:100, east:false },
    'X' : { latDigit:'8', message:1, north:true, longitudeOffset:100, east:false },
    'Y' : { latDigit:'9', message:1, north:true, longitudeOffset:100, east:false },
    'Z' : { latDigit:' ', message:1, north:true, longitudeOffset:100, east:false },
};

module.exports=addressEncoding;
