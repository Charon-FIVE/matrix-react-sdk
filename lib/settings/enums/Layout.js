"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Layout = void 0;

/*
Copyright 2021 Šimon Brandner <simon.bra.ag@gmail.com>
Copyright 2021 Quirin Götz <codeworks@supercable.onl>

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

/* TODO: This should be later reworked into something more generic */
let Layout;
exports.Layout = Layout;

(function (Layout) {
  Layout["IRC"] = "irc";
  Layout["Group"] = "group";
  Layout["Bubble"] = "bubble";
})(Layout || (exports.Layout = Layout = {}));
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJMYXlvdXQiXSwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvc2V0dGluZ3MvZW51bXMvTGF5b3V0LnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgMjAyMSDFoGltb24gQnJhbmRuZXIgPHNpbW9uLmJyYS5hZ0BnbWFpbC5jb20+XG5Db3B5cmlnaHQgMjAyMSBRdWlyaW4gR8O2dHogPGNvZGV3b3Jrc0BzdXBlcmNhYmxlLm9ubD5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG4vKiBUT0RPOiBUaGlzIHNob3VsZCBiZSBsYXRlciByZXdvcmtlZCBpbnRvIHNvbWV0aGluZyBtb3JlIGdlbmVyaWMgKi9cbmV4cG9ydCBlbnVtIExheW91dCB7XG4gICAgSVJDID0gXCJpcmNcIixcbiAgICBHcm91cCA9IFwiZ3JvdXBcIixcbiAgICBCdWJibGUgPSBcImJ1YmJsZVwiLFxufVxuIl0sIm1hcHBpbmdzIjoiOzs7Ozs7O0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7SUFDWUEsTTs7O1dBQUFBLE07RUFBQUEsTTtFQUFBQSxNO0VBQUFBLE07R0FBQUEsTSxzQkFBQUEsTSJ9