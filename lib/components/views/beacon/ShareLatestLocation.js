"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _react = _interopRequireWildcard(require("react"));

var _externalLink = require("../../../../res/img/external-link.svg");

var _languageHandler = require("../../../languageHandler");

var _location = require("../../../utils/location");

var _CopyableText = _interopRequireDefault(require("../elements/CopyableText"));

var _TooltipTarget = _interopRequireDefault(require("../elements/TooltipTarget"));

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
const ShareLatestLocation = _ref => {
  let {
    latestLocationState
  } = _ref;
  const [coords, setCoords] = (0, _react.useState)(null);
  (0, _react.useEffect)(() => {
    if (!latestLocationState) {
      return;
    }

    const coords = (0, _location.parseGeoUri)(latestLocationState.uri);
    setCoords(coords);
  }, [latestLocationState]);

  if (!latestLocationState || !coords) {
    return null;
  }

  const latLonString = `${coords.latitude},${coords.longitude}`;
  const mapLink = (0, _location.makeMapSiteLink)(coords);
  return /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, /*#__PURE__*/_react.default.createElement(_TooltipTarget.default, {
    label: (0, _languageHandler._t)('Open in OpenStreetMap')
  }, /*#__PURE__*/_react.default.createElement("a", {
    "data-test-id": "open-location-in-osm",
    href: mapLink,
    target: "_blank",
    rel: "noreferrer noopener"
  }, /*#__PURE__*/_react.default.createElement(_externalLink.Icon, {
    className: "mx_ShareLatestLocation_icon"
  }))), /*#__PURE__*/_react.default.createElement(_CopyableText.default, {
    className: "mx_ShareLatestLocation_copy",
    border: false,
    getTextToCopy: () => latLonString
  }));
};

var _default = ShareLatestLocation;
exports.default = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJTaGFyZUxhdGVzdExvY2F0aW9uIiwibGF0ZXN0TG9jYXRpb25TdGF0ZSIsImNvb3JkcyIsInNldENvb3JkcyIsInVzZVN0YXRlIiwidXNlRWZmZWN0IiwicGFyc2VHZW9VcmkiLCJ1cmkiLCJsYXRMb25TdHJpbmciLCJsYXRpdHVkZSIsImxvbmdpdHVkZSIsIm1hcExpbmsiLCJtYWtlTWFwU2l0ZUxpbmsiLCJfdCJdLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL2JlYWNvbi9TaGFyZUxhdGVzdExvY2F0aW9uLnRzeCJdLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMjIgVGhlIE1hdHJpeC5vcmcgRm91bmRhdGlvbiBDLkkuQy5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQgUmVhY3QsIHsgdXNlRWZmZWN0LCB1c2VTdGF0ZSB9IGZyb20gJ3JlYWN0JztcbmltcG9ydCB7IEJlYWNvbkxvY2F0aW9uU3RhdGUgfSBmcm9tICdtYXRyaXgtanMtc2RrL3NyYy9jb250ZW50LWhlbHBlcnMnO1xuXG5pbXBvcnQgeyBJY29uIGFzIEV4dGVybmFsTGlua0ljb24gfSBmcm9tICcuLi8uLi8uLi8uLi9yZXMvaW1nL2V4dGVybmFsLWxpbmsuc3ZnJztcbmltcG9ydCB7IF90IH0gZnJvbSAnLi4vLi4vLi4vbGFuZ3VhZ2VIYW5kbGVyJztcbmltcG9ydCB7IG1ha2VNYXBTaXRlTGluaywgcGFyc2VHZW9VcmkgfSBmcm9tICcuLi8uLi8uLi91dGlscy9sb2NhdGlvbic7XG5pbXBvcnQgQ29weWFibGVUZXh0IGZyb20gJy4uL2VsZW1lbnRzL0NvcHlhYmxlVGV4dCc7XG5pbXBvcnQgVG9vbHRpcFRhcmdldCBmcm9tICcuLi9lbGVtZW50cy9Ub29sdGlwVGFyZ2V0JztcblxuaW50ZXJmYWNlIFByb3BzIHtcbiAgICBsYXRlc3RMb2NhdGlvblN0YXRlPzogQmVhY29uTG9jYXRpb25TdGF0ZTtcbn1cblxuY29uc3QgU2hhcmVMYXRlc3RMb2NhdGlvbjogUmVhY3QuRkM8UHJvcHM+ID0gKHsgbGF0ZXN0TG9jYXRpb25TdGF0ZSB9KSA9PiB7XG4gICAgY29uc3QgW2Nvb3Jkcywgc2V0Q29vcmRzXSA9IHVzZVN0YXRlKG51bGwpO1xuICAgIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgICAgIGlmICghbGF0ZXN0TG9jYXRpb25TdGF0ZSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGNvb3JkcyA9IHBhcnNlR2VvVXJpKGxhdGVzdExvY2F0aW9uU3RhdGUudXJpKTtcbiAgICAgICAgc2V0Q29vcmRzKGNvb3Jkcyk7XG4gICAgfSwgW2xhdGVzdExvY2F0aW9uU3RhdGVdKTtcblxuICAgIGlmICghbGF0ZXN0TG9jYXRpb25TdGF0ZSB8fCAhY29vcmRzKSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIGNvbnN0IGxhdExvblN0cmluZyA9IGAke2Nvb3Jkcy5sYXRpdHVkZX0sJHtjb29yZHMubG9uZ2l0dWRlfWA7XG4gICAgY29uc3QgbWFwTGluayA9IG1ha2VNYXBTaXRlTGluayhjb29yZHMpO1xuXG4gICAgcmV0dXJuIDw+XG4gICAgICAgIDxUb29sdGlwVGFyZ2V0IGxhYmVsPXtfdCgnT3BlbiBpbiBPcGVuU3RyZWV0TWFwJyl9PlxuICAgICAgICAgICAgPGFcbiAgICAgICAgICAgICAgICBkYXRhLXRlc3QtaWQ9J29wZW4tbG9jYXRpb24taW4tb3NtJ1xuICAgICAgICAgICAgICAgIGhyZWY9e21hcExpbmt9XG4gICAgICAgICAgICAgICAgdGFyZ2V0PSdfYmxhbmsnXG4gICAgICAgICAgICAgICAgcmVsPSdub3JlZmVycmVyIG5vb3BlbmVyJ1xuICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgIDxFeHRlcm5hbExpbmtJY29uIGNsYXNzTmFtZT0nbXhfU2hhcmVMYXRlc3RMb2NhdGlvbl9pY29uJyAvPlxuICAgICAgICAgICAgPC9hPlxuICAgICAgICA8L1Rvb2x0aXBUYXJnZXQ+XG4gICAgICAgIDxDb3B5YWJsZVRleHRcbiAgICAgICAgICAgIGNsYXNzTmFtZT0nbXhfU2hhcmVMYXRlc3RMb2NhdGlvbl9jb3B5J1xuICAgICAgICAgICAgYm9yZGVyPXtmYWxzZX1cbiAgICAgICAgICAgIGdldFRleHRUb0NvcHk9eygpID0+IGxhdExvblN0cmluZ31cbiAgICAgICAgLz5cbiAgICA8Lz47XG59O1xuXG5leHBvcnQgZGVmYXVsdCBTaGFyZUxhdGVzdExvY2F0aW9uO1xuIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7QUFnQkE7O0FBR0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7Ozs7OztBQXZCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFlQSxNQUFNQSxtQkFBb0MsR0FBRyxRQUE2QjtFQUFBLElBQTVCO0lBQUVDO0VBQUYsQ0FBNEI7RUFDdEUsTUFBTSxDQUFDQyxNQUFELEVBQVNDLFNBQVQsSUFBc0IsSUFBQUMsZUFBQSxFQUFTLElBQVQsQ0FBNUI7RUFDQSxJQUFBQyxnQkFBQSxFQUFVLE1BQU07SUFDWixJQUFJLENBQUNKLG1CQUFMLEVBQTBCO01BQ3RCO0lBQ0g7O0lBQ0QsTUFBTUMsTUFBTSxHQUFHLElBQUFJLHFCQUFBLEVBQVlMLG1CQUFtQixDQUFDTSxHQUFoQyxDQUFmO0lBQ0FKLFNBQVMsQ0FBQ0QsTUFBRCxDQUFUO0VBQ0gsQ0FORCxFQU1HLENBQUNELG1CQUFELENBTkg7O0VBUUEsSUFBSSxDQUFDQSxtQkFBRCxJQUF3QixDQUFDQyxNQUE3QixFQUFxQztJQUNqQyxPQUFPLElBQVA7RUFDSDs7RUFFRCxNQUFNTSxZQUFZLEdBQUksR0FBRU4sTUFBTSxDQUFDTyxRQUFTLElBQUdQLE1BQU0sQ0FBQ1EsU0FBVSxFQUE1RDtFQUNBLE1BQU1DLE9BQU8sR0FBRyxJQUFBQyx5QkFBQSxFQUFnQlYsTUFBaEIsQ0FBaEI7RUFFQSxvQkFBTyx5RUFDSCw2QkFBQyxzQkFBRDtJQUFlLEtBQUssRUFBRSxJQUFBVyxtQkFBQSxFQUFHLHVCQUFIO0VBQXRCLGdCQUNJO0lBQ0ksZ0JBQWEsc0JBRGpCO0lBRUksSUFBSSxFQUFFRixPQUZWO0lBR0ksTUFBTSxFQUFDLFFBSFg7SUFJSSxHQUFHLEVBQUM7RUFKUixnQkFNSSw2QkFBQyxrQkFBRDtJQUFrQixTQUFTLEVBQUM7RUFBNUIsRUFOSixDQURKLENBREcsZUFXSCw2QkFBQyxxQkFBRDtJQUNJLFNBQVMsRUFBQyw2QkFEZDtJQUVJLE1BQU0sRUFBRSxLQUZaO0lBR0ksYUFBYSxFQUFFLE1BQU1IO0VBSHpCLEVBWEcsQ0FBUDtBQWlCSCxDQWxDRDs7ZUFvQ2VSLG1CIn0=