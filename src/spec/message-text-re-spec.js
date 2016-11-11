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

describe('The message text regular expresssion', function() {
  var mtre=/^([^{]*)([{]([^}]*))?(([}])(.*))?$/;
  it('accepts "Hello"', function() {
    result=mtre.exec("Hello");
    expect(result).toBeDefined();
    expect(result[1]).toBe('Hello');
  });
  it('accepts "Hello{m0001"', function() {
    result=mtre.exec("Hello{m0001");
    expect(result).toBeDefined();
    expect(result[1]).toBe('Hello');
    expect(result[2]).toBe('{m0001');
    expect(result[3]).toBe('m0001');
  })
  it('accepts "Hello{m0001}m0000"', function() {
    result=mtre.exec("Hello{m0001}m0000");
    expect(result).toBeDefined();
    expect(result[1]).toBe('Hello');
    expect(result[2]).toBe('{m0001');
    expect(result[3]).toBe('m0001');
    expect(result[4]).toBe('}m0000');
    expect(result[5]).toBe('}');
    expect(result[6]).toBe('m0000');
  })
});
