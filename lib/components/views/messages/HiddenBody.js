"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _react = _interopRequireDefault(require("react"));

var _languageHandler = require("../../../languageHandler");

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

/**
 * A message hidden from the user pending moderation.
 *
 * Note: This component must not be used when the user is the author of the message
 * or has a sufficient powerlevel to see the message.
 */
const HiddenBody = /*#__PURE__*/_react.default.forwardRef((_ref, ref) => {
  let {
    mxEvent
  } = _ref;
  let text;
  const visibility = mxEvent.messageVisibility();

  switch (visibility.visible) {
    case true:
      throw new Error("HiddenBody should only be applied to hidden messages");

    case false:
      if (visibility.reason) {
        text = (0, _languageHandler._t)("Message pending moderation: %(reason)s", {
          reason: visibility.reason
        });
      } else {
        text = (0, _languageHandler._t)("Message pending moderation");
      }

      break;
  }

  return /*#__PURE__*/_react.default.createElement("span", {
    className: "mx_HiddenBody",
    ref: ref
  }, text);
});

var _default = HiddenBody;
exports.default = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJIaWRkZW5Cb2R5IiwiUmVhY3QiLCJmb3J3YXJkUmVmIiwicmVmIiwibXhFdmVudCIsInRleHQiLCJ2aXNpYmlsaXR5IiwibWVzc2FnZVZpc2liaWxpdHkiLCJ2aXNpYmxlIiwiRXJyb3IiLCJyZWFzb24iLCJfdCJdLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL21lc3NhZ2VzL0hpZGRlbkJvZHkudHN4Il0sInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgMjAyMiBUaGUgTWF0cml4Lm9yZyBGb3VuZGF0aW9uIEMuSS5DLlxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbmltcG9ydCBSZWFjdCBmcm9tIFwicmVhY3RcIjtcbmltcG9ydCB7IE1hdHJpeEV2ZW50IH0gZnJvbSBcIm1hdHJpeC1qcy1zZGsvc3JjL21vZGVscy9ldmVudFwiO1xuXG5pbXBvcnQgeyBfdCB9IGZyb20gXCIuLi8uLi8uLi9sYW5ndWFnZUhhbmRsZXJcIjtcbmltcG9ydCB7IElCb2R5UHJvcHMgfSBmcm9tIFwiLi9JQm9keVByb3BzXCI7XG5cbmludGVyZmFjZSBJUHJvcHMge1xuICAgIG14RXZlbnQ6IE1hdHJpeEV2ZW50O1xufVxuXG4vKipcbiAqIEEgbWVzc2FnZSBoaWRkZW4gZnJvbSB0aGUgdXNlciBwZW5kaW5nIG1vZGVyYXRpb24uXG4gKlxuICogTm90ZTogVGhpcyBjb21wb25lbnQgbXVzdCBub3QgYmUgdXNlZCB3aGVuIHRoZSB1c2VyIGlzIHRoZSBhdXRob3Igb2YgdGhlIG1lc3NhZ2VcbiAqIG9yIGhhcyBhIHN1ZmZpY2llbnQgcG93ZXJsZXZlbCB0byBzZWUgdGhlIG1lc3NhZ2UuXG4gKi9cbmNvbnN0IEhpZGRlbkJvZHkgPSBSZWFjdC5mb3J3YXJkUmVmPGFueSwgSVByb3BzIHwgSUJvZHlQcm9wcz4oKHsgbXhFdmVudCB9LCByZWYpID0+IHtcbiAgICBsZXQgdGV4dDtcbiAgICBjb25zdCB2aXNpYmlsaXR5ID0gbXhFdmVudC5tZXNzYWdlVmlzaWJpbGl0eSgpO1xuICAgIHN3aXRjaCAodmlzaWJpbGl0eS52aXNpYmxlKSB7XG4gICAgICAgIGNhc2UgdHJ1ZTpcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkhpZGRlbkJvZHkgc2hvdWxkIG9ubHkgYmUgYXBwbGllZCB0byBoaWRkZW4gbWVzc2FnZXNcIik7XG4gICAgICAgIGNhc2UgZmFsc2U6XG4gICAgICAgICAgICBpZiAodmlzaWJpbGl0eS5yZWFzb24pIHtcbiAgICAgICAgICAgICAgICB0ZXh0ID0gX3QoXCJNZXNzYWdlIHBlbmRpbmcgbW9kZXJhdGlvbjogJShyZWFzb24pc1wiLCB7IHJlYXNvbjogdmlzaWJpbGl0eS5yZWFzb24gfSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRleHQgPSBfdChcIk1lc3NhZ2UgcGVuZGluZyBtb2RlcmF0aW9uXCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYnJlYWs7XG4gICAgfVxuXG4gICAgcmV0dXJuIChcbiAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwibXhfSGlkZGVuQm9keVwiIHJlZj17cmVmfT5cbiAgICAgICAgICAgIHsgdGV4dCB9XG4gICAgICAgIDwvc3Bhbj5cbiAgICApO1xufSk7XG5cbmV4cG9ydCBkZWZhdWx0IEhpZGRlbkJvZHk7XG4iXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztBQWdCQTs7QUFHQTs7QUFuQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQVlBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQU1BLFVBQVUsZ0JBQUdDLGNBQUEsQ0FBTUMsVUFBTixDQUEyQyxPQUFjQyxHQUFkLEtBQXNCO0VBQUEsSUFBckI7SUFBRUM7RUFBRixDQUFxQjtFQUNoRixJQUFJQyxJQUFKO0VBQ0EsTUFBTUMsVUFBVSxHQUFHRixPQUFPLENBQUNHLGlCQUFSLEVBQW5COztFQUNBLFFBQVFELFVBQVUsQ0FBQ0UsT0FBbkI7SUFDSSxLQUFLLElBQUw7TUFDSSxNQUFNLElBQUlDLEtBQUosQ0FBVSxzREFBVixDQUFOOztJQUNKLEtBQUssS0FBTDtNQUNJLElBQUlILFVBQVUsQ0FBQ0ksTUFBZixFQUF1QjtRQUNuQkwsSUFBSSxHQUFHLElBQUFNLG1CQUFBLEVBQUcsd0NBQUgsRUFBNkM7VUFBRUQsTUFBTSxFQUFFSixVQUFVLENBQUNJO1FBQXJCLENBQTdDLENBQVA7TUFDSCxDQUZELE1BRU87UUFDSEwsSUFBSSxHQUFHLElBQUFNLG1CQUFBLEVBQUcsNEJBQUgsQ0FBUDtNQUNIOztNQUNEO0VBVFI7O0VBWUEsb0JBQ0k7SUFBTSxTQUFTLEVBQUMsZUFBaEI7SUFBZ0MsR0FBRyxFQUFFUjtFQUFyQyxHQUNNRSxJQUROLENBREo7QUFLSCxDQXBCa0IsQ0FBbkI7O2VBc0JlTCxVIn0=