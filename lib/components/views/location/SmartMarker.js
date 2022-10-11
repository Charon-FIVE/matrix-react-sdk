"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _react = _interopRequireWildcard(require("react"));

var _location = require("../../../utils/location");

var _Marker = _interopRequireDefault(require("./Marker"));

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
const useMapMarker = (map, geoUri) => {
  const [marker, setMarker] = (0, _react.useState)();
  const onElementRef = (0, _react.useCallback)(element => {
    if (marker || !element) {
      return;
    }

    const coords = (0, _location.parseGeoUri)(geoUri);
    const newMarker = (0, _location.createMarker)(coords, element);
    newMarker.addTo(map);
    setMarker(newMarker);
  }, [marker, geoUri, map]);
  (0, _react.useEffect)(() => {
    if (marker) {
      const coords = (0, _location.parseGeoUri)(geoUri);
      marker.setLngLat({
        lon: coords.longitude,
        lat: coords.latitude
      });
    }
  }, [marker, geoUri]);
  (0, _react.useEffect)(() => () => {
    if (marker) {
      marker.remove();
    }
  }, [marker]);
  return {
    marker,
    onElementRef
  };
};

/**
 * Generic location marker
 */
const SmartMarker = _ref => {
  let {
    id,
    map,
    geoUri,
    roomMember,
    useMemberColor,
    tooltip
  } = _ref;
  const {
    onElementRef
  } = useMapMarker(map, geoUri);
  return (
    /*#__PURE__*/
    // maplibregl hijacks the Marker dom element
    // and removes it from the dom when the maplibregl.Marker instance
    // is removed
    // wrap in a span so that react doesn't get confused
    // when trying to unmount this component
    _react.default.createElement("span", null, /*#__PURE__*/_react.default.createElement(_Marker.default, {
      ref: onElementRef,
      id: id,
      roomMember: roomMember,
      useMemberColor: useMemberColor,
      tooltip: tooltip
    }))
  );
};

var _default = SmartMarker;
exports.default = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJ1c2VNYXBNYXJrZXIiLCJtYXAiLCJnZW9VcmkiLCJtYXJrZXIiLCJzZXRNYXJrZXIiLCJ1c2VTdGF0ZSIsIm9uRWxlbWVudFJlZiIsInVzZUNhbGxiYWNrIiwiZWxlbWVudCIsImNvb3JkcyIsInBhcnNlR2VvVXJpIiwibmV3TWFya2VyIiwiY3JlYXRlTWFya2VyIiwiYWRkVG8iLCJ1c2VFZmZlY3QiLCJzZXRMbmdMYXQiLCJsb24iLCJsb25naXR1ZGUiLCJsYXQiLCJsYXRpdHVkZSIsInJlbW92ZSIsIlNtYXJ0TWFya2VyIiwiaWQiLCJyb29tTWVtYmVyIiwidXNlTWVtYmVyQ29sb3IiLCJ0b29sdGlwIl0sInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL2NvbXBvbmVudHMvdmlld3MvbG9jYXRpb24vU21hcnRNYXJrZXIudHN4Il0sInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgMjAyMiBUaGUgTWF0cml4Lm9yZyBGb3VuZGF0aW9uIEMuSS5DLlxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbmltcG9ydCBSZWFjdCwgeyBSZWFjdE5vZGUsIHVzZUNhbGxiYWNrLCB1c2VFZmZlY3QsIHVzZVN0YXRlIH0gZnJvbSAncmVhY3QnO1xuaW1wb3J0IG1hcGxpYnJlZ2wgZnJvbSAnbWFwbGlicmUtZ2wnO1xuaW1wb3J0IHsgUm9vbU1lbWJlciB9IGZyb20gJ21hdHJpeC1qcy1zZGsvc3JjL21hdHJpeCc7XG5cbmltcG9ydCB7IGNyZWF0ZU1hcmtlciwgcGFyc2VHZW9VcmkgfSBmcm9tICcuLi8uLi8uLi91dGlscy9sb2NhdGlvbic7XG5pbXBvcnQgTWFya2VyIGZyb20gJy4vTWFya2VyJztcblxuY29uc3QgdXNlTWFwTWFya2VyID0gKFxuICAgIG1hcDogbWFwbGlicmVnbC5NYXAsXG4gICAgZ2VvVXJpOiBzdHJpbmcsXG4pOiB7IG1hcmtlcj86IG1hcGxpYnJlZ2wuTWFya2VyLCBvbkVsZW1lbnRSZWY6IChlbDogSFRNTERpdkVsZW1lbnQpID0+IHZvaWQgfSA9PiB7XG4gICAgY29uc3QgW21hcmtlciwgc2V0TWFya2VyXSA9IHVzZVN0YXRlPG1hcGxpYnJlZ2wuTWFya2VyPigpO1xuXG4gICAgY29uc3Qgb25FbGVtZW50UmVmID0gdXNlQ2FsbGJhY2soKGVsZW1lbnQ6IEhUTUxEaXZFbGVtZW50KSA9PiB7XG4gICAgICAgIGlmIChtYXJrZXIgfHwgIWVsZW1lbnQpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBjb29yZHMgPSBwYXJzZUdlb1VyaShnZW9VcmkpO1xuICAgICAgICBjb25zdCBuZXdNYXJrZXIgPSBjcmVhdGVNYXJrZXIoY29vcmRzLCBlbGVtZW50KTtcbiAgICAgICAgbmV3TWFya2VyLmFkZFRvKG1hcCk7XG4gICAgICAgIHNldE1hcmtlcihuZXdNYXJrZXIpO1xuICAgIH0sIFttYXJrZXIsIGdlb1VyaSwgbWFwXSk7XG5cbiAgICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgICAgICBpZiAobWFya2VyKSB7XG4gICAgICAgICAgICBjb25zdCBjb29yZHMgPSBwYXJzZUdlb1VyaShnZW9VcmkpO1xuICAgICAgICAgICAgbWFya2VyLnNldExuZ0xhdCh7IGxvbjogY29vcmRzLmxvbmdpdHVkZSwgbGF0OiBjb29yZHMubGF0aXR1ZGUgfSk7XG4gICAgICAgIH1cbiAgICB9LCBbbWFya2VyLCBnZW9VcmldKTtcblxuICAgIHVzZUVmZmVjdCgoKSA9PiAoKSA9PiB7XG4gICAgICAgIGlmIChtYXJrZXIpIHtcbiAgICAgICAgICAgIG1hcmtlci5yZW1vdmUoKTtcbiAgICAgICAgfVxuICAgIH0sIFttYXJrZXJdKTtcblxuICAgIHJldHVybiB7XG4gICAgICAgIG1hcmtlcixcbiAgICAgICAgb25FbGVtZW50UmVmLFxuICAgIH07XG59O1xuXG5pbnRlcmZhY2UgU21hcnRNYXJrZXJQcm9wcyB7XG4gICAgbWFwOiBtYXBsaWJyZWdsLk1hcDtcbiAgICBnZW9Vcmk6IHN0cmluZztcbiAgICBpZD86IHN0cmluZztcbiAgICAvLyByZW5kZXJzIE1lbWJlckF2YXRhciB3aGVuIHByb3ZpZGVkXG4gICAgcm9vbU1lbWJlcj86IFJvb21NZW1iZXI7XG4gICAgLy8gdXNlIG1lbWJlciB0ZXh0IGNvbG9yIGFzIGJhY2tncm91bmRcbiAgICB1c2VNZW1iZXJDb2xvcj86IGJvb2xlYW47XG4gICAgdG9vbHRpcD86IFJlYWN0Tm9kZTtcbn1cblxuLyoqXG4gKiBHZW5lcmljIGxvY2F0aW9uIG1hcmtlclxuICovXG5jb25zdCBTbWFydE1hcmtlcjogUmVhY3QuRkM8U21hcnRNYXJrZXJQcm9wcz4gPSAoeyBpZCwgbWFwLCBnZW9VcmksIHJvb21NZW1iZXIsIHVzZU1lbWJlckNvbG9yLCB0b29sdGlwIH0pID0+IHtcbiAgICBjb25zdCB7IG9uRWxlbWVudFJlZiB9ID0gdXNlTWFwTWFya2VyKG1hcCwgZ2VvVXJpKTtcblxuICAgIHJldHVybiAoXG4gICAgICAgIC8vIG1hcGxpYnJlZ2wgaGlqYWNrcyB0aGUgTWFya2VyIGRvbSBlbGVtZW50XG4gICAgICAgIC8vIGFuZCByZW1vdmVzIGl0IGZyb20gdGhlIGRvbSB3aGVuIHRoZSBtYXBsaWJyZWdsLk1hcmtlciBpbnN0YW5jZVxuICAgICAgICAvLyBpcyByZW1vdmVkXG4gICAgICAgIC8vIHdyYXAgaW4gYSBzcGFuIHNvIHRoYXQgcmVhY3QgZG9lc24ndCBnZXQgY29uZnVzZWRcbiAgICAgICAgLy8gd2hlbiB0cnlpbmcgdG8gdW5tb3VudCB0aGlzIGNvbXBvbmVudFxuICAgICAgICA8c3Bhbj5cbiAgICAgICAgICAgIDxNYXJrZXJcbiAgICAgICAgICAgICAgICByZWY9e29uRWxlbWVudFJlZn1cbiAgICAgICAgICAgICAgICBpZD17aWR9XG4gICAgICAgICAgICAgICAgcm9vbU1lbWJlcj17cm9vbU1lbWJlcn1cbiAgICAgICAgICAgICAgICB1c2VNZW1iZXJDb2xvcj17dXNlTWVtYmVyQ29sb3J9XG4gICAgICAgICAgICAgICAgdG9vbHRpcD17dG9vbHRpcH1cbiAgICAgICAgICAgIC8+XG4gICAgICAgIDwvc3Bhbj5cbiAgICApO1xufTtcblxuZXhwb3J0IGRlZmF1bHQgU21hcnRNYXJrZXI7XG4iXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztBQWdCQTs7QUFJQTs7QUFDQTs7Ozs7O0FBckJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQVNBLE1BQU1BLFlBQVksR0FBRyxDQUNqQkMsR0FEaUIsRUFFakJDLE1BRmlCLEtBRzREO0VBQzdFLE1BQU0sQ0FBQ0MsTUFBRCxFQUFTQyxTQUFULElBQXNCLElBQUFDLGVBQUEsR0FBNUI7RUFFQSxNQUFNQyxZQUFZLEdBQUcsSUFBQUMsa0JBQUEsRUFBYUMsT0FBRCxJQUE2QjtJQUMxRCxJQUFJTCxNQUFNLElBQUksQ0FBQ0ssT0FBZixFQUF3QjtNQUNwQjtJQUNIOztJQUNELE1BQU1DLE1BQU0sR0FBRyxJQUFBQyxxQkFBQSxFQUFZUixNQUFaLENBQWY7SUFDQSxNQUFNUyxTQUFTLEdBQUcsSUFBQUMsc0JBQUEsRUFBYUgsTUFBYixFQUFxQkQsT0FBckIsQ0FBbEI7SUFDQUcsU0FBUyxDQUFDRSxLQUFWLENBQWdCWixHQUFoQjtJQUNBRyxTQUFTLENBQUNPLFNBQUQsQ0FBVDtFQUNILENBUm9CLEVBUWxCLENBQUNSLE1BQUQsRUFBU0QsTUFBVCxFQUFpQkQsR0FBakIsQ0FSa0IsQ0FBckI7RUFVQSxJQUFBYSxnQkFBQSxFQUFVLE1BQU07SUFDWixJQUFJWCxNQUFKLEVBQVk7TUFDUixNQUFNTSxNQUFNLEdBQUcsSUFBQUMscUJBQUEsRUFBWVIsTUFBWixDQUFmO01BQ0FDLE1BQU0sQ0FBQ1ksU0FBUCxDQUFpQjtRQUFFQyxHQUFHLEVBQUVQLE1BQU0sQ0FBQ1EsU0FBZDtRQUF5QkMsR0FBRyxFQUFFVCxNQUFNLENBQUNVO01BQXJDLENBQWpCO0lBQ0g7RUFDSixDQUxELEVBS0csQ0FBQ2hCLE1BQUQsRUFBU0QsTUFBVCxDQUxIO0VBT0EsSUFBQVksZ0JBQUEsRUFBVSxNQUFNLE1BQU07SUFDbEIsSUFBSVgsTUFBSixFQUFZO01BQ1JBLE1BQU0sQ0FBQ2lCLE1BQVA7SUFDSDtFQUNKLENBSkQsRUFJRyxDQUFDakIsTUFBRCxDQUpIO0VBTUEsT0FBTztJQUNIQSxNQURHO0lBRUhHO0VBRkcsQ0FBUDtBQUlILENBakNEOztBQThDQTtBQUNBO0FBQ0E7QUFDQSxNQUFNZSxXQUF1QyxHQUFHLFFBQThEO0VBQUEsSUFBN0Q7SUFBRUMsRUFBRjtJQUFNckIsR0FBTjtJQUFXQyxNQUFYO0lBQW1CcUIsVUFBbkI7SUFBK0JDLGNBQS9CO0lBQStDQztFQUEvQyxDQUE2RDtFQUMxRyxNQUFNO0lBQUVuQjtFQUFGLElBQW1CTixZQUFZLENBQUNDLEdBQUQsRUFBTUMsTUFBTixDQUFyQztFQUVBO0lBQUE7SUFDSTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0Esd0RBQ0ksNkJBQUMsZUFBRDtNQUNJLEdBQUcsRUFBRUksWUFEVDtNQUVJLEVBQUUsRUFBRWdCLEVBRlI7TUFHSSxVQUFVLEVBQUVDLFVBSGhCO01BSUksY0FBYyxFQUFFQyxjQUpwQjtNQUtJLE9BQU8sRUFBRUM7SUFMYixFQURKO0VBTko7QUFnQkgsQ0FuQkQ7O2VBcUJlSixXIn0=