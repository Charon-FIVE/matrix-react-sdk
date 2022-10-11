"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _react = _interopRequireWildcard(require("react"));

var _BaseTool = _interopRequireDefault(require("./BaseTool"));

var _languageHandler = require("../../../../languageHandler");

var _useAsyncMemo = require("../../../../hooks/useAsyncMemo");

var _MatrixClientContext = _interopRequireDefault(require("../../../../contexts/MatrixClientContext"));

var _Spinner = _interopRequireDefault(require("../../elements/Spinner"));

var _SyntaxHighlight = _interopRequireDefault(require("../../elements/SyntaxHighlight"));

var _MatrixClientPeg = require("../../../../MatrixClientPeg");

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

/*
Copyright 2022 Michael Telatynski <7t3chguy@gmail.com>

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
const FAILED_TO_LOAD = Symbol("failed-to-load");

const ServerInfo = _ref => {
  let {
    onBack
  } = _ref;
  const cli = (0, _react.useContext)(_MatrixClientContext.default);
  const capabilities = (0, _useAsyncMemo.useAsyncMemo)(() => cli.getCapabilities(true).catch(() => FAILED_TO_LOAD), [cli]);
  const clientVersions = (0, _useAsyncMemo.useAsyncMemo)(() => cli.getVersions().catch(() => FAILED_TO_LOAD), [cli]);
  const serverVersions = (0, _useAsyncMemo.useAsyncMemo)(async () => {
    let baseUrl = cli.getHomeserverUrl();

    try {
      const hsName = _MatrixClientPeg.MatrixClientPeg.getHomeserverName(); // We don't use the js-sdk Autodiscovery module here as it only support client well-known, not server ones.


      const response = await fetch(`https://${hsName}/.well-known/matrix/server`);
      const json = await response.json();

      if (json["m.server"]) {
        baseUrl = `https://${json["m.server"]}`;
      }
    } catch (e) {
      console.warn(e);
    }

    try {
      const response = await fetch(`${baseUrl}/_matrix/federation/v1/version`);
      return response.json();
    } catch (e) {
      console.warn(e);
    }

    return FAILED_TO_LOAD;
  }, [cli]);
  let body;

  if (!capabilities || !clientVersions || !serverVersions) {
    body = /*#__PURE__*/_react.default.createElement(_Spinner.default, null);
  } else {
    body = /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, /*#__PURE__*/_react.default.createElement("h4", null, (0, _languageHandler._t)("Capabilities")), capabilities !== FAILED_TO_LOAD ? /*#__PURE__*/_react.default.createElement(_SyntaxHighlight.default, {
      language: "json",
      children: JSON.stringify(capabilities, null, 4)
    }) : /*#__PURE__*/_react.default.createElement("div", null, (0, _languageHandler._t)("Failed to load.")), /*#__PURE__*/_react.default.createElement("h4", null, (0, _languageHandler._t)("Client Versions")), clientVersions !== FAILED_TO_LOAD ? /*#__PURE__*/_react.default.createElement(_SyntaxHighlight.default, {
      language: "json",
      children: JSON.stringify(clientVersions, null, 4)
    }) : /*#__PURE__*/_react.default.createElement("div", null, (0, _languageHandler._t)("Failed to load.")), /*#__PURE__*/_react.default.createElement("h4", null, (0, _languageHandler._t)("Server Versions")), serverVersions !== FAILED_TO_LOAD ? /*#__PURE__*/_react.default.createElement(_SyntaxHighlight.default, {
      language: "json",
      children: JSON.stringify(serverVersions, null, 4)
    }) : /*#__PURE__*/_react.default.createElement("div", null, (0, _languageHandler._t)("Failed to load.")));
  }

  return /*#__PURE__*/_react.default.createElement(_BaseTool.default, {
    onBack: onBack
  }, body);
};

var _default = ServerInfo;
exports.default = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJGQUlMRURfVE9fTE9BRCIsIlN5bWJvbCIsIlNlcnZlckluZm8iLCJvbkJhY2siLCJjbGkiLCJ1c2VDb250ZXh0IiwiTWF0cml4Q2xpZW50Q29udGV4dCIsImNhcGFiaWxpdGllcyIsInVzZUFzeW5jTWVtbyIsImdldENhcGFiaWxpdGllcyIsImNhdGNoIiwiY2xpZW50VmVyc2lvbnMiLCJnZXRWZXJzaW9ucyIsInNlcnZlclZlcnNpb25zIiwiYmFzZVVybCIsImdldEhvbWVzZXJ2ZXJVcmwiLCJoc05hbWUiLCJNYXRyaXhDbGllbnRQZWciLCJnZXRIb21lc2VydmVyTmFtZSIsInJlc3BvbnNlIiwiZmV0Y2giLCJqc29uIiwiZSIsImNvbnNvbGUiLCJ3YXJuIiwiYm9keSIsIl90IiwiSlNPTiIsInN0cmluZ2lmeSJdLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL2RpYWxvZ3MvZGV2dG9vbHMvU2VydmVySW5mby50c3giXSwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAyMDIyIE1pY2hhZWwgVGVsYXR5bnNraSA8N3QzY2hndXlAZ21haWwuY29tPlxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbmltcG9ydCBSZWFjdCwgeyB1c2VDb250ZXh0IH0gZnJvbSBcInJlYWN0XCI7XG5cbmltcG9ydCBCYXNlVG9vbCwgeyBJRGV2dG9vbHNQcm9wcyB9IGZyb20gXCIuL0Jhc2VUb29sXCI7XG5pbXBvcnQgeyBfdCB9IGZyb20gXCIuLi8uLi8uLi8uLi9sYW5ndWFnZUhhbmRsZXJcIjtcbmltcG9ydCB7IHVzZUFzeW5jTWVtbyB9IGZyb20gXCIuLi8uLi8uLi8uLi9ob29rcy91c2VBc3luY01lbW9cIjtcbmltcG9ydCBNYXRyaXhDbGllbnRDb250ZXh0IGZyb20gXCIuLi8uLi8uLi8uLi9jb250ZXh0cy9NYXRyaXhDbGllbnRDb250ZXh0XCI7XG5pbXBvcnQgU3Bpbm5lciBmcm9tIFwiLi4vLi4vZWxlbWVudHMvU3Bpbm5lclwiO1xuaW1wb3J0IFN5bnRheEhpZ2hsaWdodCBmcm9tIFwiLi4vLi4vZWxlbWVudHMvU3ludGF4SGlnaGxpZ2h0XCI7XG5pbXBvcnQgeyBNYXRyaXhDbGllbnRQZWcgfSBmcm9tIFwiLi4vLi4vLi4vLi4vTWF0cml4Q2xpZW50UGVnXCI7XG5cbmNvbnN0IEZBSUxFRF9UT19MT0FEID0gU3ltYm9sKFwiZmFpbGVkLXRvLWxvYWRcIik7XG5cbmludGVyZmFjZSBJU2VydmVyV2VsbEtub3duIHtcbiAgICBzZXJ2ZXI6IHtcbiAgICAgICAgbmFtZTogc3RyaW5nO1xuICAgICAgICB2ZXJzaW9uOiBzdHJpbmc7XG4gICAgfTtcbn1cblxuY29uc3QgU2VydmVySW5mbyA9ICh7IG9uQmFjayB9OiBJRGV2dG9vbHNQcm9wcykgPT4ge1xuICAgIGNvbnN0IGNsaSA9IHVzZUNvbnRleHQoTWF0cml4Q2xpZW50Q29udGV4dCk7XG4gICAgY29uc3QgY2FwYWJpbGl0aWVzID0gdXNlQXN5bmNNZW1vKCgpID0+IGNsaS5nZXRDYXBhYmlsaXRpZXModHJ1ZSkuY2F0Y2goKCkgPT4gRkFJTEVEX1RPX0xPQUQpLCBbY2xpXSk7XG4gICAgY29uc3QgY2xpZW50VmVyc2lvbnMgPSB1c2VBc3luY01lbW8oKCkgPT4gY2xpLmdldFZlcnNpb25zKCkuY2F0Y2goKCkgPT4gRkFJTEVEX1RPX0xPQUQpLCBbY2xpXSk7XG4gICAgY29uc3Qgc2VydmVyVmVyc2lvbnMgPSB1c2VBc3luY01lbW88SVNlcnZlcldlbGxLbm93biB8IHN5bWJvbD4oYXN5bmMgKCkgPT4ge1xuICAgICAgICBsZXQgYmFzZVVybCA9IGNsaS5nZXRIb21lc2VydmVyVXJsKCk7XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IGhzTmFtZSA9IE1hdHJpeENsaWVudFBlZy5nZXRIb21lc2VydmVyTmFtZSgpO1xuICAgICAgICAgICAgLy8gV2UgZG9uJ3QgdXNlIHRoZSBqcy1zZGsgQXV0b2Rpc2NvdmVyeSBtb2R1bGUgaGVyZSBhcyBpdCBvbmx5IHN1cHBvcnQgY2xpZW50IHdlbGwta25vd24sIG5vdCBzZXJ2ZXIgb25lcy5cbiAgICAgICAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZmV0Y2goYGh0dHBzOi8vJHtoc05hbWV9Ly53ZWxsLWtub3duL21hdHJpeC9zZXJ2ZXJgKTtcbiAgICAgICAgICAgIGNvbnN0IGpzb24gPSBhd2FpdCByZXNwb25zZS5qc29uKCk7XG4gICAgICAgICAgICBpZiAoanNvbltcIm0uc2VydmVyXCJdKSB7XG4gICAgICAgICAgICAgICAgYmFzZVVybCA9IGBodHRwczovLyR7anNvbltcIm0uc2VydmVyXCJdfWA7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGZldGNoKGAke2Jhc2VVcmx9L19tYXRyaXgvZmVkZXJhdGlvbi92MS92ZXJzaW9uYCk7XG4gICAgICAgICAgICByZXR1cm4gcmVzcG9uc2UuanNvbigpO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oZSk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gRkFJTEVEX1RPX0xPQUQ7XG4gICAgfSwgW2NsaV0pO1xuXG4gICAgbGV0IGJvZHk6IEpTWC5FbGVtZW50O1xuICAgIGlmICghY2FwYWJpbGl0aWVzIHx8ICFjbGllbnRWZXJzaW9ucyB8fCAhc2VydmVyVmVyc2lvbnMpIHtcbiAgICAgICAgYm9keSA9IDxTcGlubmVyIC8+O1xuICAgIH0gZWxzZSB7XG4gICAgICAgIGJvZHkgPSA8PlxuICAgICAgICAgICAgPGg0PnsgX3QoXCJDYXBhYmlsaXRpZXNcIikgfTwvaDQ+XG4gICAgICAgICAgICB7IGNhcGFiaWxpdGllcyAhPT0gRkFJTEVEX1RPX0xPQURcbiAgICAgICAgICAgICAgICA/IDxTeW50YXhIaWdobGlnaHQgbGFuZ3VhZ2U9XCJqc29uXCIgY2hpbGRyZW49e0pTT04uc3RyaW5naWZ5KGNhcGFiaWxpdGllcywgbnVsbCwgNCl9IC8+XG4gICAgICAgICAgICAgICAgOiA8ZGl2PnsgX3QoXCJGYWlsZWQgdG8gbG9hZC5cIikgfTwvZGl2PlxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICA8aDQ+eyBfdChcIkNsaWVudCBWZXJzaW9uc1wiKSB9PC9oND5cbiAgICAgICAgICAgIHsgY2xpZW50VmVyc2lvbnMgIT09IEZBSUxFRF9UT19MT0FEXG4gICAgICAgICAgICAgICAgPyA8U3ludGF4SGlnaGxpZ2h0IGxhbmd1YWdlPVwianNvblwiIGNoaWxkcmVuPXtKU09OLnN0cmluZ2lmeShjbGllbnRWZXJzaW9ucywgbnVsbCwgNCl9IC8+XG4gICAgICAgICAgICAgICAgOiA8ZGl2PnsgX3QoXCJGYWlsZWQgdG8gbG9hZC5cIikgfTwvZGl2PlxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICA8aDQ+eyBfdChcIlNlcnZlciBWZXJzaW9uc1wiKSB9PC9oND5cbiAgICAgICAgICAgIHsgc2VydmVyVmVyc2lvbnMgIT09IEZBSUxFRF9UT19MT0FEXG4gICAgICAgICAgICAgICAgPyA8U3ludGF4SGlnaGxpZ2h0IGxhbmd1YWdlPVwianNvblwiIGNoaWxkcmVuPXtKU09OLnN0cmluZ2lmeShzZXJ2ZXJWZXJzaW9ucywgbnVsbCwgNCl9IC8+XG4gICAgICAgICAgICAgICAgOiA8ZGl2PnsgX3QoXCJGYWlsZWQgdG8gbG9hZC5cIikgfTwvZGl2PlxuICAgICAgICAgICAgfVxuICAgICAgICA8Lz47XG4gICAgfVxuXG4gICAgcmV0dXJuIDxCYXNlVG9vbCBvbkJhY2s9e29uQmFja30+XG4gICAgICAgIHsgYm9keSB9XG4gICAgPC9CYXNlVG9vbD47XG59O1xuXG5leHBvcnQgZGVmYXVsdCBTZXJ2ZXJJbmZvO1xuIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7QUFnQkE7O0FBRUE7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7Ozs7OztBQXhCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFZQSxNQUFNQSxjQUFjLEdBQUdDLE1BQU0sQ0FBQyxnQkFBRCxDQUE3Qjs7QUFTQSxNQUFNQyxVQUFVLEdBQUcsUUFBZ0M7RUFBQSxJQUEvQjtJQUFFQztFQUFGLENBQStCO0VBQy9DLE1BQU1DLEdBQUcsR0FBRyxJQUFBQyxpQkFBQSxFQUFXQyw0QkFBWCxDQUFaO0VBQ0EsTUFBTUMsWUFBWSxHQUFHLElBQUFDLDBCQUFBLEVBQWEsTUFBTUosR0FBRyxDQUFDSyxlQUFKLENBQW9CLElBQXBCLEVBQTBCQyxLQUExQixDQUFnQyxNQUFNVixjQUF0QyxDQUFuQixFQUEwRSxDQUFDSSxHQUFELENB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