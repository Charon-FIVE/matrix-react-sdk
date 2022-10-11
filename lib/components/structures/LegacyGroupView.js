"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var React = _interopRequireWildcard(require("react"));

var _AutoHideScrollbar = _interopRequireDefault(require("./AutoHideScrollbar"));

var _languageHandler = require("../../languageHandler");

var _SdkConfig = _interopRequireWildcard(require("../../SdkConfig"));

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

/*
Copyright 2020 The Matrix.org Foundation C.I.C.

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
const LegacyGroupView = _ref => {
  let {
    groupId
  } = _ref;

  // XXX: Stealing classes from the HomePage component for CSS simplicity.
  // XXX: Inline CSS because this is all temporary
  const learnMoreUrl = _SdkConfig.default.get().spaces_learn_more_url ?? _SdkConfig.DEFAULTS.spaces_learn_more_url;

  return /*#__PURE__*/React.createElement(_AutoHideScrollbar.default, {
    className: "mx_HomePage mx_HomePage_default"
  }, /*#__PURE__*/React.createElement("div", {
    className: "mx_HomePage_default_wrapper"
  }, /*#__PURE__*/React.createElement("h1", {
    style: {
      fontSize: '24px'
    }
  }, (0, _languageHandler._t)("That link is no longer supported")), /*#__PURE__*/React.createElement("p", null, (0, _languageHandler._t)("You're trying to access a community link (%(groupId)s).<br/>" + "Communities are no longer supported and have been replaced by spaces.<br2/>" + "<a>Learn more about spaces here.</a>", {
    groupId
  }, {
    br: () => /*#__PURE__*/React.createElement("br", null),
    br2: () => /*#__PURE__*/React.createElement("br", null),
    a: sub => /*#__PURE__*/React.createElement("a", {
      href: learnMoreUrl,
      rel: "noreferrer noopener",
      target: "_blank"
    }, sub)
  }))));
};

var _default = LegacyGroupView;
exports.default = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJMZWdhY3lHcm91cFZpZXciLCJncm91cElkIiwibGVhcm5Nb3JlVXJsIiwiU2RrQ29uZmlnIiwiZ2V0Iiwic3BhY2VzX2xlYXJuX21vcmVfdXJsIiwiREVGQVVMVFMiLCJmb250U2l6ZSIsIl90IiwiYnIiLCJicjIiLCJhIiwic3ViIl0sInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2NvbXBvbmVudHMvc3RydWN0dXJlcy9MZWdhY3lHcm91cFZpZXcudHN4Il0sInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgMjAyMCBUaGUgTWF0cml4Lm9yZyBGb3VuZGF0aW9uIEMuSS5DLlxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbmltcG9ydCAqIGFzIFJlYWN0IGZyb20gXCJyZWFjdFwiO1xuXG5pbXBvcnQgQXV0b0hpZGVTY3JvbGxiYXIgZnJvbSAnLi9BdXRvSGlkZVNjcm9sbGJhcic7XG5pbXBvcnQgeyBfdCB9IGZyb20gXCIuLi8uLi9sYW5ndWFnZUhhbmRsZXJcIjtcbmltcG9ydCBTZGtDb25maWcsIHsgREVGQVVMVFMgfSBmcm9tIFwiLi4vLi4vU2RrQ29uZmlnXCI7XG5cbmludGVyZmFjZSBJUHJvcHMge1xuICAgIGdyb3VwSWQ6IHN0cmluZztcbn1cblxuY29uc3QgTGVnYWN5R3JvdXBWaWV3OiBSZWFjdC5GQzxJUHJvcHM+ID0gKHsgZ3JvdXBJZCB9KSA9PiB7XG4gICAgLy8gWFhYOiBTdGVhbGluZyBjbGFzc2VzIGZyb20gdGhlIEhvbWVQYWdlIGNvbXBvbmVudCBmb3IgQ1NTIHNpbXBsaWNpdHkuXG4gICAgLy8gWFhYOiBJbmxpbmUgQ1NTIGJlY2F1c2UgdGhpcyBpcyBhbGwgdGVtcG9yYXJ5XG4gICAgY29uc3QgbGVhcm5Nb3JlVXJsID0gU2RrQ29uZmlnLmdldCgpLnNwYWNlc19sZWFybl9tb3JlX3VybCA/PyBERUZBVUxUUy5zcGFjZXNfbGVhcm5fbW9yZV91cmw7XG4gICAgcmV0dXJuIDxBdXRvSGlkZVNjcm9sbGJhciBjbGFzc05hbWU9XCJteF9Ib21lUGFnZSBteF9Ib21lUGFnZV9kZWZhdWx0XCI+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfSG9tZVBhZ2VfZGVmYXVsdF93cmFwcGVyXCI+XG4gICAgICAgICAgICA8aDEgc3R5bGU9e3sgZm9udFNpemU6ICcyNHB4JyB9fT57IF90KFwiVGhhdCBsaW5rIGlzIG5vIGxvbmdlciBzdXBwb3J0ZWRcIikgfTwvaDE+XG4gICAgICAgICAgICA8cD5cbiAgICAgICAgICAgICAgICB7IF90KFxuICAgICAgICAgICAgICAgICAgICBcIllvdSdyZSB0cnlpbmcgdG8gYWNjZXNzIGEgY29tbXVuaXR5IGxpbmsgKCUoZ3JvdXBJZClzKS48YnIvPlwiICtcbiAgICAgICAgICAgICAgICAgICAgXCJDb21tdW5pdGllcyBhcmUgbm8gbG9uZ2VyIHN1cHBvcnRlZCBhbmQgaGF2ZSBiZWVuIHJlcGxhY2VkIGJ5IHNwYWNlcy48YnIyLz5cIiArXG4gICAgICAgICAgICAgICAgICAgIFwiPGE+TGVhcm4gbW9yZSBhYm91dCBzcGFjZXMgaGVyZS48L2E+XCIsXG4gICAgICAgICAgICAgICAgICAgIHsgZ3JvdXBJZCB9LFxuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICBicjogKCkgPT4gPGJyIC8+LFxuICAgICAgICAgICAgICAgICAgICAgICAgYnIyOiAoKSA9PiA8YnIgLz4sXG4gICAgICAgICAgICAgICAgICAgICAgICBhOiAoc3ViKSA9PiA8YSBocmVmPXtsZWFybk1vcmVVcmx9IHJlbD1cIm5vcmVmZXJyZXIgbm9vcGVuZXJcIiB0YXJnZXQ9XCJfYmxhbmtcIj57IHN1YiB9PC9hPixcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICApIH1cbiAgICAgICAgICAgIDwvcD5cbiAgICAgICAgPC9kaXY+XG4gICAgPC9BdXRvSGlkZVNjcm9sbGJhcj47XG59O1xuXG5leHBvcnQgZGVmYXVsdCBMZWdhY3lHcm91cFZpZXc7XG4iXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztBQWdCQTs7QUFFQTs7QUFDQTs7QUFDQTs7Ozs7O0FBcEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQVlBLE1BQU1BLGVBQWlDLEdBQUcsUUFBaUI7RUFBQSxJQUFoQjtJQUFFQztFQUFGLENBQWdCOztFQUN2RDtFQUNBO0VBQ0EsTUFBTUMsWUFBWSxHQUFHQyxrQkFBQSxDQUFVQyxHQUFWLEdBQWdCQyxxQkFBaEIsSUFBeUNDLG1CQUFBLENBQVNELHFCQUF2RTs7RUFDQSxvQkFBTyxvQkFBQywwQkFBRDtJQUFtQixTQUFTLEVBQUM7RUFBN0IsZ0JBQ0g7SUFBSyxTQUFTLEVBQUM7RUFBZixnQkFDSTtJQUFJLEtBQUssRUFBRTtNQUFFRSxRQUFRLEVBQUU7SUFBWjtFQUFYLEdBQW1DLElBQUFDLG1CQUFBLEVBQUcsa0NBQUgsQ0FBbkMsQ0FESixlQUVJLCtCQUNNLElBQUFBLG1CQUFBLEVBQ0UsaUVBQ0EsNkVBREEsR0FFQSxzQ0FIRixFQUlFO0lBQUVQO0VBQUYsQ0FKRixFQUtFO0lBQ0lRLEVBQUUsRUFBRSxtQkFBTSwrQkFEZDtJQUVJQyxHQUFHLEVBQUUsbUJBQU0sK0JBRmY7SUFHSUMsQ0FBQyxFQUFHQyxHQUFELGlCQUFTO01BQUcsSUFBSSxFQUFFVixZQUFUO01BQXVCLEdBQUcsRUFBQyxxQkFBM0I7TUFBaUQsTUFBTSxFQUFDO0lBQXhELEdBQW1FVSxHQUFuRTtFQUhoQixDQUxGLENBRE4sQ0FGSixDQURHLENBQVA7QUFrQkgsQ0F0QkQ7O2VBd0JlWixlIn0=