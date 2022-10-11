"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _react = _interopRequireWildcard(require("react"));

var _classnames = _interopRequireDefault(require("classnames"));

var _maplibreGl = _interopRequireDefault(require("maplibre-gl"));

var _matrix = require("matrix-js-sdk/src/matrix");

var _logger = require("matrix-js-sdk/src/logger");

var _MatrixClientContext = _interopRequireDefault(require("../../../contexts/MatrixClientContext"));

var _useEventEmitter = require("../../../hooks/useEventEmitter");

var _location = require("../../../utils/location");

var _WellKnownUtils = require("../../../utils/WellKnownUtils");

var _useMap = require("../../../utils/location/useMap");

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
const useMapWithStyle = _ref => {
  let {
    id,
    centerGeoUri,
    onError,
    interactive,
    bounds
  } = _ref;
  const bodyId = `mx_Map_${id}`; // style config

  const context = (0, _react.useContext)(_MatrixClientContext.default);
  const mapStyleUrl = (0, _useEventEmitter.useEventEmitterState)(context, _matrix.ClientEvent.ClientWellKnown, clientWellKnown => (0, _WellKnownUtils.tileServerFromWellKnown)(clientWellKnown)?.["map_style_url"]);
  const map = (0, _useMap.useMap)({
    interactive,
    bodyId,
    onError
  });
  (0, _react.useEffect)(() => {
    if (mapStyleUrl && map) {
      map.setStyle(mapStyleUrl);
    }
  }, [mapStyleUrl, map]);
  (0, _react.useEffect)(() => {
    if (map && centerGeoUri) {
      try {
        const coords = (0, _location.parseGeoUri)(centerGeoUri);
        map.setCenter({
          lon: coords.longitude,
          lat: coords.latitude
        });
      } catch (_error) {
        _logger.logger.error('Could not set map center');
      }
    }
  }, [map, centerGeoUri]);
  (0, _react.useEffect)(() => {
    if (map && bounds) {
      try {
        const lngLatBounds = new _maplibreGl.default.LngLatBounds([bounds.west, bounds.south], [bounds.east, bounds.north]);
        map.fitBounds(lngLatBounds, {
          padding: 100,
          maxZoom: 15
        });
      } catch (_error) {
        _logger.logger.error('Invalid map bounds');
      }
    }
  }, [map, bounds]);
  return {
    map,
    bodyId
  };
};

const Map = _ref2 => {
  let {
    bounds,
    centerGeoUri,
    children,
    className,
    id,
    interactive,
    onError,
    onClick
  } = _ref2;
  const {
    map,
    bodyId
  } = useMapWithStyle({
    centerGeoUri,
    onError,
    id,
    interactive,
    bounds
  });

  const onMapClick = event => {
    // Eat click events when clicking the attribution button
    const target = event.target;

    if (target.classList.contains("maplibregl-ctrl-attrib-button")) {
      return;
    }

    onClick && onClick();
  };

  return /*#__PURE__*/_react.default.createElement("div", {
    className: (0, _classnames.default)('mx_Map', className),
    id: bodyId,
    onClick: onMapClick
  }, !!children && !!map && children({
    map
  }));
};

var _default = Map;
exports.default = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJ1c2VNYXBXaXRoU3R5bGUiLCJpZCIsImNlbnRlckdlb1VyaSIsIm9uRXJyb3IiLCJpbnRlcmFjdGl2ZSIsImJvdW5kcyIsImJvZHlJZCIsImNvbnRleHQiLCJ1c2VDb250ZXh0IiwiTWF0cml4Q2xpZW50Q29udGV4dCIsIm1hcFN0eWxlVXJsIiwidXNlRXZlbnRFbWl0dGVyU3RhdGUiLCJDbGllbnRFdmVudCIsIkNsaWVudFdlbGxLbm93biIsImNsaWVudFdlbGxLbm93biIsInRpbGVTZXJ2ZXJGcm9tV2VsbEtub3duIiwibWFwIiwidXNlTWFwIiwidXNlRWZmZWN0Iiwic2V0U3R5bGUiLCJjb29yZHMiLCJwYXJzZUdlb1VyaSIsInNldENlbnRlciIsImxvbiIsImxvbmdpdHVkZSIsImxhdCIsImxhdGl0dWRlIiwiX2Vycm9yIiwibG9nZ2VyIiwiZXJyb3IiLCJsbmdMYXRCb3VuZHMiLCJtYXBsaWJyZWdsIiwiTG5nTGF0Qm91bmRzIiwid2VzdCIsInNvdXRoIiwiZWFzdCIsIm5vcnRoIiwiZml0Qm91bmRzIiwicGFkZGluZyIsIm1heFpvb20iLCJNYXAiLCJjaGlsZHJlbiIsImNsYXNzTmFtZSIsIm9uQ2xpY2siLCJvbk1hcENsaWNrIiwiZXZlbnQiLCJ0YXJnZXQiLCJjbGFzc0xpc3QiLCJjb250YWlucyIsImNsYXNzTmFtZXMiXSwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvY29tcG9uZW50cy92aWV3cy9sb2NhdGlvbi9NYXAudHN4Il0sInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgMjAyMiBUaGUgTWF0cml4Lm9yZyBGb3VuZGF0aW9uIEMuSS5DLlxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbmltcG9ydCBSZWFjdCwgeyBSZWFjdE5vZGUsIHVzZUNvbnRleHQsIHVzZUVmZmVjdCB9IGZyb20gJ3JlYWN0JztcbmltcG9ydCBjbGFzc05hbWVzIGZyb20gJ2NsYXNzbmFtZXMnO1xuaW1wb3J0IG1hcGxpYnJlZ2wgZnJvbSAnbWFwbGlicmUtZ2wnO1xuaW1wb3J0IHsgQ2xpZW50RXZlbnQsIElDbGllbnRXZWxsS25vd24gfSBmcm9tICdtYXRyaXgtanMtc2RrL3NyYy9tYXRyaXgnO1xuaW1wb3J0IHsgbG9nZ2VyIH0gZnJvbSAnbWF0cml4LWpzLXNkay9zcmMvbG9nZ2VyJztcblxuaW1wb3J0IE1hdHJpeENsaWVudENvbnRleHQgZnJvbSAnLi4vLi4vLi4vY29udGV4dHMvTWF0cml4Q2xpZW50Q29udGV4dCc7XG5pbXBvcnQgeyB1c2VFdmVudEVtaXR0ZXJTdGF0ZSB9IGZyb20gJy4uLy4uLy4uL2hvb2tzL3VzZUV2ZW50RW1pdHRlcic7XG5pbXBvcnQgeyBwYXJzZUdlb1VyaSB9IGZyb20gJy4uLy4uLy4uL3V0aWxzL2xvY2F0aW9uJztcbmltcG9ydCB7IHRpbGVTZXJ2ZXJGcm9tV2VsbEtub3duIH0gZnJvbSAnLi4vLi4vLi4vdXRpbHMvV2VsbEtub3duVXRpbHMnO1xuaW1wb3J0IHsgdXNlTWFwIH0gZnJvbSAnLi4vLi4vLi4vdXRpbHMvbG9jYXRpb24vdXNlTWFwJztcbmltcG9ydCB7IEJvdW5kcyB9IGZyb20gJy4uLy4uLy4uL3V0aWxzL2JlYWNvbi9ib3VuZHMnO1xuXG5jb25zdCB1c2VNYXBXaXRoU3R5bGUgPSAoeyBpZCwgY2VudGVyR2VvVXJpLCBvbkVycm9yLCBpbnRlcmFjdGl2ZSwgYm91bmRzIH0pID0+IHtcbiAgICBjb25zdCBib2R5SWQgPSBgbXhfTWFwXyR7aWR9YDtcblxuICAgIC8vIHN0eWxlIGNvbmZpZ1xuICAgIGNvbnN0IGNvbnRleHQgPSB1c2VDb250ZXh0KE1hdHJpeENsaWVudENvbnRleHQpO1xuICAgIGNvbnN0IG1hcFN0eWxlVXJsID0gdXNlRXZlbnRFbWl0dGVyU3RhdGUoXG4gICAgICAgIGNvbnRleHQsXG4gICAgICAgIENsaWVudEV2ZW50LkNsaWVudFdlbGxLbm93bixcbiAgICAgICAgKGNsaWVudFdlbGxLbm93bjogSUNsaWVudFdlbGxLbm93bikgPT4gdGlsZVNlcnZlckZyb21XZWxsS25vd24oY2xpZW50V2VsbEtub3duKT8uW1wibWFwX3N0eWxlX3VybFwiXSxcbiAgICApO1xuXG4gICAgY29uc3QgbWFwID0gdXNlTWFwKHsgaW50ZXJhY3RpdmUsIGJvZHlJZCwgb25FcnJvciB9KTtcblxuICAgIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgICAgIGlmIChtYXBTdHlsZVVybCAmJiBtYXApIHtcbiAgICAgICAgICAgIG1hcC5zZXRTdHlsZShtYXBTdHlsZVVybCk7XG4gICAgICAgIH1cbiAgICB9LCBbbWFwU3R5bGVVcmwsIG1hcF0pO1xuXG4gICAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICAgICAgaWYgKG1hcCAmJiBjZW50ZXJHZW9VcmkpIHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgY29uc3QgY29vcmRzID0gcGFyc2VHZW9VcmkoY2VudGVyR2VvVXJpKTtcbiAgICAgICAgICAgICAgICBtYXAuc2V0Q2VudGVyKHsgbG9uOiBjb29yZHMubG9uZ2l0dWRlLCBsYXQ6IGNvb3Jkcy5sYXRpdHVkZSB9KTtcbiAgICAgICAgICAgIH0gY2F0Y2ggKF9lcnJvcikge1xuICAgICAgICAgICAgICAgIGxvZ2dlci5lcnJvcignQ291bGQgbm90IHNldCBtYXAgY2VudGVyJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9LCBbbWFwLCBjZW50ZXJHZW9VcmldKTtcblxuICAgIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgICAgIGlmIChtYXAgJiYgYm91bmRzKSB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGxuZ0xhdEJvdW5kcyA9IG5ldyBtYXBsaWJyZWdsLkxuZ0xhdEJvdW5kcyhcbiAgICAgICAgICAgICAgICAgICAgW2JvdW5kcy53ZXN0LCBib3VuZHMuc291dGhdLFxuICAgICAgICAgICAgICAgICAgICBbYm91bmRzLmVhc3QsIGJvdW5kcy5ub3J0aF0sXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICBtYXAuZml0Qm91bmRzKGxuZ0xhdEJvdW5kcywgeyBwYWRkaW5nOiAxMDAsIG1heFpvb206IDE1IH0pO1xuICAgICAgICAgICAgfSBjYXRjaCAoX2Vycm9yKSB7XG4gICAgICAgICAgICAgICAgbG9nZ2VyLmVycm9yKCdJbnZhbGlkIG1hcCBib3VuZHMnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0sIFttYXAsIGJvdW5kc10pO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgbWFwLFxuICAgICAgICBib2R5SWQsXG4gICAgfTtcbn07XG5cbmludGVyZmFjZSBNYXBQcm9wcyB7XG4gICAgaWQ6IHN0cmluZztcbiAgICBpbnRlcmFjdGl2ZT86IGJvb2xlYW47XG4gICAgLyoqXG4gICAgICogc2V0IG1hcCBjZW50ZXIgdG8gZ2VvVXJpIGNvb3Jkc1xuICAgICAqIENlbnRlciB3aWxsIG9ubHkgYmUgc2V0IHRvIHZhbGlkIGdlb1VyaVxuICAgICAqIHRoaXMgcHJvcCBpcyBvbmx5IHNpbXBseSBkaWZmZWQgYnkgdXNlRWZmZWN0LCBzbyB0byB0cmlnZ2VyICpyZWNlbnRlcmluZyogb2YgdGhlIHNhbWUgZ2VvVXJpXG4gICAgICogYXBwZW5kIHRoZSB1cmkgd2l0aCBhIHZhciBub3QgdXNlZCBieSB0aGUgZ2VvVXJpIHNwZWNcbiAgICAgKiBlZyBhIHRpbWVzdGFtcDogYGdlbzo1NCw0MjtteFRzPTEyM2BcbiAgICAgKi9cbiAgICBjZW50ZXJHZW9Vcmk/OiBzdHJpbmc7XG4gICAgYm91bmRzPzogQm91bmRzO1xuICAgIGNsYXNzTmFtZT86IHN0cmluZztcbiAgICBvbkNsaWNrPzogKCkgPT4gdm9pZDtcbiAgICBvbkVycm9yPzogKGVycm9yOiBFcnJvcikgPT4gdm9pZDtcbiAgICBjaGlsZHJlbj86IChyZW5kZXJQcm9wczoge1xuICAgICAgICBtYXA6IG1hcGxpYnJlZ2wuTWFwO1xuICAgIH0pID0+IFJlYWN0Tm9kZTtcbn1cblxuY29uc3QgTWFwOiBSZWFjdC5GQzxNYXBQcm9wcz4gPSAoe1xuICAgIGJvdW5kcyxcbiAgICBjZW50ZXJHZW9VcmksXG4gICAgY2hpbGRyZW4sXG4gICAgY2xhc3NOYW1lLFxuICAgIGlkLFxuICAgIGludGVyYWN0aXZlLFxuICAgIG9uRXJyb3IsIG9uQ2xpY2ssXG59KSA9PiB7XG4gICAgY29uc3QgeyBtYXAsIGJvZHlJZCB9ID0gdXNlTWFwV2l0aFN0eWxlKHsgY2VudGVyR2VvVXJpLCBvbkVycm9yLCBpZCwgaW50ZXJhY3RpdmUsIGJvdW5kcyB9KTtcblxuICAgIGNvbnN0IG9uTWFwQ2xpY2sgPSAoXG4gICAgICAgIGV2ZW50OiBSZWFjdC5Nb3VzZUV2ZW50PEhUTUxEaXZFbGVtZW50LCBNb3VzZUV2ZW50PixcbiAgICApID0+IHtcbiAgICAgICAgLy8gRWF0IGNsaWNrIGV2ZW50cyB3aGVuIGNsaWNraW5nIHRoZSBhdHRyaWJ1dGlvbiBidXR0b25cbiAgICAgICAgY29uc3QgdGFyZ2V0ID0gZXZlbnQudGFyZ2V0IGFzIEVsZW1lbnQ7XG4gICAgICAgIGlmICh0YXJnZXQuY2xhc3NMaXN0LmNvbnRhaW5zKFwibWFwbGlicmVnbC1jdHJsLWF0dHJpYi1idXR0b25cIikpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIG9uQ2xpY2sgJiYgb25DbGljaygpO1xuICAgIH07XG5cbiAgICByZXR1cm4gPGRpdiBjbGFzc05hbWU9e2NsYXNzTmFtZXMoJ214X01hcCcsIGNsYXNzTmFtZSl9XG4gICAgICAgIGlkPXtib2R5SWR9XG4gICAgICAgIG9uQ2xpY2s9e29uTWFwQ2xpY2t9XG4gICAgPlxuICAgICAgICB7ICEhY2hpbGRyZW4gJiYgISFtYXAgJiYgY2hpbGRyZW4oeyBtYXAgfSkgfVxuICAgIDwvZGl2Pjtcbn07XG5cbmV4cG9ydCBkZWZhdWx0IE1hcDtcbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O0FBZ0JBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUVBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOzs7Ozs7QUExQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBZUEsTUFBTUEsZUFBZSxHQUFHLFFBQXdEO0VBQUEsSUFBdkQ7SUFBRUMsRUFBRjtJQUFNQyxZQUFOO0lBQW9CQyxPQUFwQjtJQUE2QkMsV0FBN0I7SUFBMENDO0VBQTFDLENBQXVEO0VBQzVFLE1BQU1DLE1BQU0sR0FBSSxVQUFTTCxFQUFHLEVBQTVCLENBRDRFLENBRzVFOztFQUNBLE1BQU1NLE9BQU8sR0FBRyxJQUFBQyxpQkFBQSxFQUFXQyw0QkFBWCxDQUFoQjtFQUNBLE1BQU1DLFdBQVcsR0FBRyxJQUFBQyxxQ0FBQSxFQUNoQkosT0FEZ0IsRUFFaEJLLG1CQUFBLENBQVlDLGVBRkksRUFHZkMsZUFBRCxJQUF1QyxJQUFBQyx1Q0FBQSxFQUF3QkQs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