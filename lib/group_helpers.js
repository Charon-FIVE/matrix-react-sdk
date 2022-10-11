"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.showGroupReplacedWithSpacesDialog = showGroupReplacedWithSpacesDialog;

var React = _interopRequireWildcard(require("react"));

var _Modal = _interopRequireDefault(require("./Modal"));

var _QuestionDialog = _interopRequireDefault(require("./components/views/dialogs/QuestionDialog"));

var _languageHandler = require("./languageHandler");

var _SdkConfig = _interopRequireWildcard(require("./SdkConfig"));

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

/*
Copyright 2022 The Matrix.org Foundation C.I.C.

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
function showGroupReplacedWithSpacesDialog(groupId) {
  const learnMoreUrl = _SdkConfig.default.get().spaces_learn_more_url ?? _SdkConfig.DEFAULTS.spaces_learn_more_url;

  _Modal.default.createDialog(_QuestionDialog.default, {
    title: (0, _languageHandler._t)("That link is no longer supported"),
    description: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("p", null, (0, _languageHandler._t)("You're trying to access a community link (%(groupId)s).<br/>" + "Communities are no longer supported and have been replaced by spaces.<br2/>" + "<a>Learn more about spaces here.</a>", {
      groupId
    }, {
      br: () => /*#__PURE__*/React.createElement("br", null),
      br2: () => /*#__PURE__*/React.createElement("br", null),
      a: sub => /*#__PURE__*/React.createElement("a", {
        href: learnMoreUrl,
        rel: "noreferrer noopener",
        target: "_blank"
      }, sub)
    }))),
    hasCancelButton: false
  });
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJzaG93R3JvdXBSZXBsYWNlZFdpdGhTcGFjZXNEaWFsb2ciLCJncm91cElkIiwibGVhcm5Nb3JlVXJsIiwiU2RrQ29uZmlnIiwiZ2V0Iiwic3BhY2VzX2xlYXJuX21vcmVfdXJsIiwiREVGQVVMVFMiLCJNb2RhbCIsImNyZWF0ZURpYWxvZyIsIlF1ZXN0aW9uRGlhbG9nIiwidGl0bGUiLCJfdCIsImRlc2NyaXB0aW9uIiwiYnIiLCJicjIiLCJhIiwic3ViIiwiaGFzQ2FuY2VsQnV0dG9uIl0sInNvdXJjZXMiOlsiLi4vc3JjL2dyb3VwX2hlbHBlcnMudHN4Il0sInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgMjAyMiBUaGUgTWF0cml4Lm9yZyBGb3VuZGF0aW9uIEMuSS5DLlxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbmltcG9ydCAqIGFzIFJlYWN0IGZyb20gXCJyZWFjdFwiO1xuXG5pbXBvcnQgTW9kYWwgZnJvbSBcIi4vTW9kYWxcIjtcbmltcG9ydCBRdWVzdGlvbkRpYWxvZyBmcm9tIFwiLi9jb21wb25lbnRzL3ZpZXdzL2RpYWxvZ3MvUXVlc3Rpb25EaWFsb2dcIjtcbmltcG9ydCB7IF90IH0gZnJvbSBcIi4vbGFuZ3VhZ2VIYW5kbGVyXCI7XG5pbXBvcnQgU2RrQ29uZmlnLCB7IERFRkFVTFRTIH0gZnJvbSBcIi4vU2RrQ29uZmlnXCI7XG5cbmV4cG9ydCBmdW5jdGlvbiBzaG93R3JvdXBSZXBsYWNlZFdpdGhTcGFjZXNEaWFsb2coZ3JvdXBJZDogc3RyaW5nKSB7XG4gICAgY29uc3QgbGVhcm5Nb3JlVXJsID0gU2RrQ29uZmlnLmdldCgpLnNwYWNlc19sZWFybl9tb3JlX3VybCA/PyBERUZBVUxUUy5zcGFjZXNfbGVhcm5fbW9yZV91cmw7XG4gICAgTW9kYWwuY3JlYXRlRGlhbG9nKFF1ZXN0aW9uRGlhbG9nLCB7XG4gICAgICAgIHRpdGxlOiBfdChcIlRoYXQgbGluayBpcyBubyBsb25nZXIgc3VwcG9ydGVkXCIpLFxuICAgICAgICBkZXNjcmlwdGlvbjogPD5cbiAgICAgICAgICAgIDxwPlxuICAgICAgICAgICAgICAgIHsgX3QoXG4gICAgICAgICAgICAgICAgICAgIFwiWW91J3JlIHRyeWluZyB0byBhY2Nlc3MgYSBjb21tdW5pdHkgbGluayAoJShncm91cElkKXMpLjxici8+XCIgK1xuICAgICAgICAgICAgICAgICAgICAgICAgXCJDb21tdW5pdGllcyBhcmUgbm8gbG9uZ2VyIHN1cHBvcnRlZCBhbmQgaGF2ZSBiZWVuIHJlcGxhY2VkIGJ5IHNwYWNlcy48YnIyLz5cIiArXG4gICAgICAgICAgICAgICAgICAgICAgICBcIjxhPkxlYXJuIG1vcmUgYWJvdXQgc3BhY2VzIGhlcmUuPC9hPlwiLFxuICAgICAgICAgICAgICAgICAgICB7IGdyb3VwSWQgfSxcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgYnI6ICgpID0+IDxiciAvPixcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyMjogKCkgPT4gPGJyIC8+LFxuICAgICAgICAgICAgICAgICAgICAgICAgYTogKHN1YikgPT4gPGEgaHJlZj17bGVhcm5Nb3JlVXJsfSByZWw9XCJub3JlZmVycmVyIG5vb3BlbmVyXCIgdGFyZ2V0PVwiX2JsYW5rXCI+eyBzdWIgfTwvYT4sXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgKSB9XG4gICAgICAgICAgICA8L3A+XG4gICAgICAgIDwvPixcbiAgICAgICAgaGFzQ2FuY2VsQnV0dG9uOiBmYWxzZSxcbiAgICB9KTtcbn1cbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O0FBZ0JBOztBQUVBOztBQUNBOztBQUNBOztBQUNBOzs7Ozs7QUFyQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBU08sU0FBU0EsaUNBQVQsQ0FBMkNDLE9BQTNDLEVBQTREO0VBQy9ELE1BQU1DLFlBQVksR0FBR0Msa0JBQUEsQ0FBVUMsR0FBVixHQUFnQkMscUJBQWhCLElBQXlDQyxtQkFBQSxDQUFTRCxxQkFBdkU7O0VBQ0FFLGNBQUEsQ0FBTUMsWUFBTixDQUFtQkMsdUJBQW5CLEVBQW1DO0lBQy9CQyxLQUFLLEVBQUUsSUFBQUMsbUJBQUEsRUFBRyxrQ0FBSCxDQUR3QjtJQUUvQkMsV0FBVyxlQUFFLHVEQUNULCtCQUNNLElBQUFELG1CQUFBLEVBQ0UsaUVBQ0ksNkVBREosR0FFSSxzQ0FITixFQUlFO01BQUVWO0lBQUYsQ0FKRixFQUtFO01BQ0lZLEVBQUUsRUFBRSxtQkFBTSwrQkFEZDtNQUVJQyxHQUFHLEVBQUUsbUJBQU0sK0JBRmY7TUFHSUMsQ0FBQyxFQUFHQyxHQUFELGlCQUFTO1FBQUcsSUFBSSxFQUFFZCxZQUFUO1FBQXVCLEdBQUcsRUFBQyxxQkFBM0I7UUFBaUQsTUFBTSxFQUFDO01BQXhELEdBQW1FYyxHQUFuRTtJQUhoQixDQUxGLENBRE4sQ0FEUyxDQUZrQjtJQWlCL0JDLGVBQWUsRUFBRTtFQWpCYyxDQUFuQztBQW1CSCJ9