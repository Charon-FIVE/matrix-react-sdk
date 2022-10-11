"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.looksValid = looksValid;

/*
Copyright 2016 OpenMarket Ltd

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/
// Regexp based on Simpler Version from https://gist.github.com/gregseth/5582254 - matches RFC2822
const EMAIL_ADDRESS_REGEX = new RegExp("^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*" + // localpart
"@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$", "i");

function looksValid(email) {
  return EMAIL_ADDRESS_REGEX.test(email);
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJFTUFJTF9BRERSRVNTX1JFR0VYIiwiUmVnRXhwIiwibG9va3NWYWxpZCIsImVtYWlsIiwidGVzdCJdLCJzb3VyY2VzIjpbIi4uL3NyYy9lbWFpbC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMTYgT3Blbk1hcmtldCBMdGRcblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG4vLyBSZWdleHAgYmFzZWQgb24gU2ltcGxlciBWZXJzaW9uIGZyb20gaHR0cHM6Ly9naXN0LmdpdGh1Yi5jb20vZ3JlZ3NldGgvNTU4MjI1NCAtIG1hdGNoZXMgUkZDMjgyMlxuY29uc3QgRU1BSUxfQUREUkVTU19SRUdFWCA9IG5ldyBSZWdFeHAoXG4gICAgXCJeW2EtejAtOSEjJCUmJyorLz0/Xl9ge3x9fi1dKyg/OlxcXFwuW2EtejAtOSEjJCUmJyorLz0/Xl9ge3x9fi1dKykqXCIgKyAvLyBsb2NhbHBhcnRcbiAgICBcIkAoPzpbYS16MC05XSg/OlthLXowLTktXSpbYS16MC05XSk/XFxcXC4pK1thLXowLTldKD86W2EtejAtOS1dKlthLXowLTldKT8kXCIsIFwiaVwiKTtcblxuZXhwb3J0IGZ1bmN0aW9uIGxvb2tzVmFsaWQoZW1haWw6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgIHJldHVybiBFTUFJTF9BRERSRVNTX1JFR0VYLnRlc3QoZW1haWwpO1xufVxuIl0sIm1hcHBpbmdzIjoiOzs7Ozs7O0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBRUE7QUFDQSxNQUFNQSxtQkFBbUIsR0FBRyxJQUFJQyxNQUFKLENBQ3hCLHNFQUFzRTtBQUN0RSwwRUFGd0IsRUFFb0QsR0FGcEQsQ0FBNUI7O0FBSU8sU0FBU0MsVUFBVCxDQUFvQkMsS0FBcEIsRUFBNEM7RUFDL0MsT0FBT0gsbUJBQW1CLENBQUNJLElBQXBCLENBQXlCRCxLQUF6QixDQUFQO0FBQ0gifQ==