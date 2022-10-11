"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _react = _interopRequireDefault(require("react"));

var _languageHandler = require("../../../languageHandler");

var _AccessibleButton = _interopRequireDefault(require("../elements/AccessibleButton"));

var _plusButton = require("../../../../res/img/element-icons/plus-button.svg");

var _minusButton = require("../../../../res/img/element-icons/minus-button.svg");

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
const ZoomButtons = _ref => {
  let {
    map
  } = _ref;

  const onZoomIn = () => {
    map.zoomIn();
  };

  const onZoomOut = () => {
    map.zoomOut();
  };

  return /*#__PURE__*/_react.default.createElement("div", {
    className: "mx_ZoomButtons"
  }, /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
    onClick: onZoomIn,
    "data-test-id": "map-zoom-in-button",
    title: (0, _languageHandler._t)("Zoom in"),
    className: "mx_ZoomButtons_button"
  }, /*#__PURE__*/_react.default.createElement(_plusButton.Icon, {
    className: "mx_ZoomButtons_icon"
  })), /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
    onClick: onZoomOut,
    "data-test-id": "map-zoom-out-button",
    title: (0, _languageHandler._t)("Zoom out"),
    className: "mx_ZoomButtons_button"
  }, /*#__PURE__*/_react.default.createElement(_minusButton.Icon, {
    className: "mx_ZoomButtons_icon"
  })));
};

var _default = ZoomButtons;
exports.default = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJab29tQnV0dG9ucyIsIm1hcCIsIm9uWm9vbUluIiwiem9vbUluIiwib25ab29tT3V0Iiwiem9vbU91dCIsIl90Il0sInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL2NvbXBvbmVudHMvdmlld3MvbG9jYXRpb24vWm9vbUJ1dHRvbnMudHN4Il0sInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgMjAyMiBUaGUgTWF0cml4Lm9yZyBGb3VuZGF0aW9uIEMuSS5DLlxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbmltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCc7XG5pbXBvcnQgbWFwbGlicmVnbCBmcm9tICdtYXBsaWJyZS1nbCc7XG5cbmltcG9ydCB7IF90IH0gZnJvbSAnLi4vLi4vLi4vbGFuZ3VhZ2VIYW5kbGVyJztcbmltcG9ydCBBY2Nlc3NpYmxlQnV0dG9uIGZyb20gJy4uL2VsZW1lbnRzL0FjY2Vzc2libGVCdXR0b24nO1xuaW1wb3J0IHsgSWNvbiBhcyBQbHVzSWNvbiB9IGZyb20gJy4uLy4uLy4uLy4uL3Jlcy9pbWcvZWxlbWVudC1pY29ucy9wbHVzLWJ1dHRvbi5zdmcnO1xuaW1wb3J0IHsgSWNvbiBhcyBNaW51c0ljb24gfSBmcm9tICcuLi8uLi8uLi8uLi9yZXMvaW1nL2VsZW1lbnQtaWNvbnMvbWludXMtYnV0dG9uLnN2Zyc7XG5cbmludGVyZmFjZSBQcm9wcyB7XG4gICAgbWFwOiBtYXBsaWJyZWdsLk1hcDtcbn1cblxuY29uc3QgWm9vbUJ1dHRvbnM6IFJlYWN0LkZDPFByb3BzPiA9ICh7IG1hcCB9KSA9PiB7XG4gICAgY29uc3Qgb25ab29tSW4gPSAoKSA9PiB7XG4gICAgICAgIG1hcC56b29tSW4oKTtcbiAgICB9O1xuXG4gICAgY29uc3Qgb25ab29tT3V0ID0gKCkgPT4ge1xuICAgICAgICBtYXAuem9vbU91dCgpO1xuICAgIH07XG5cbiAgICByZXR1cm4gPGRpdiBjbGFzc05hbWU9XCJteF9ab29tQnV0dG9uc1wiPlxuICAgICAgICA8QWNjZXNzaWJsZUJ1dHRvblxuICAgICAgICAgICAgb25DbGljaz17b25ab29tSW59XG4gICAgICAgICAgICBkYXRhLXRlc3QtaWQ9J21hcC16b29tLWluLWJ1dHRvbidcbiAgICAgICAgICAgIHRpdGxlPXtfdChcIlpvb20gaW5cIil9XG4gICAgICAgICAgICBjbGFzc05hbWU9J214X1pvb21CdXR0b25zX2J1dHRvbidcbiAgICAgICAgPlxuICAgICAgICAgICAgPFBsdXNJY29uIGNsYXNzTmFtZT0nbXhfWm9vbUJ1dHRvbnNfaWNvbicgLz5cbiAgICAgICAgPC9BY2Nlc3NpYmxlQnV0dG9uPlxuICAgICAgICA8QWNjZXNzaWJsZUJ1dHRvblxuICAgICAgICAgICAgb25DbGljaz17b25ab29tT3V0fVxuICAgICAgICAgICAgZGF0YS10ZXN0LWlkPSdtYXAtem9vbS1vdXQtYnV0dG9uJ1xuICAgICAgICAgICAgdGl0bGU9e190KFwiWm9vbSBvdXRcIil9XG4gICAgICAgICAgICBjbGFzc05hbWU9J214X1pvb21CdXR0b25zX2J1dHRvbidcbiAgICAgICAgPlxuICAgICAgICAgICAgPE1pbnVzSWNvbiBjbGFzc05hbWU9J214X1pvb21CdXR0b25zX2ljb24nIC8+XG4gICAgICAgIDwvQWNjZXNzaWJsZUJ1dHRvbj5cbiAgICA8L2Rpdj47XG59O1xuXG5leHBvcnQgZGVmYXVsdCBab29tQnV0dG9ucztcbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O0FBZ0JBOztBQUdBOztBQUNBOztBQUNBOztBQUNBOztBQXRCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFjQSxNQUFNQSxXQUE0QixHQUFHLFFBQWE7RUFBQSxJQUFaO0lBQUVDO0VBQUYsQ0FBWTs7RUFDOUMsTUFBTUMsUUFBUSxHQUFHLE1BQU07SUFDbkJELEdBQUcsQ0FBQ0UsTUFBSjtFQUNILENBRkQ7O0VBSUEsTUFBTUMsU0FBUyxHQUFHLE1BQU07SUFDcEJILEdBQUcsQ0FBQ0ksT0FBSjtFQUNILENBRkQ7O0VBSUEsb0JBQU87SUFBSyxTQUFTLEVBQUM7RUFBZixnQkFDSCw2QkFBQyx5QkFBRDtJQUNJLE9BQU8sRUFBRUgsUUFEYjtJQUVJLGdCQUFhLG9CQUZqQjtJQUdJLEtBQUssRUFBRSxJQUFBSSxtQkFBQSxFQUFHLFNBQUgsQ0FIWDtJQUlJLFNBQVMsRUFBQztFQUpkLGdCQU1JLDZCQUFDLGdCQUFEO0lBQVUsU0FBUyxFQUFDO0VBQXBCLEVBTkosQ0FERyxlQVNILDZCQUFDLHlCQUFEO0lBQ0ksT0FBTyxFQUFFRixTQURiO0lBRUksZ0JBQWEscUJBRmpCO0lBR0ksS0FBSyxFQUFFLElBQUFFLG1CQUFBLEVBQUcsVUFBSCxDQUhYO0lBSUksU0FBUyxFQUFDO0VBSmQsZ0JBTUksNkJBQUMsaUJBQUQ7SUFBVyxTQUFTLEVBQUM7RUFBckIsRUFOSixDQVRHLENBQVA7QUFrQkgsQ0EzQkQ7O2VBNkJlTixXIn0=