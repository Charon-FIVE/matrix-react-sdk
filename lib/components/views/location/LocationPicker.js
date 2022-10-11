"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireDefault(require("react"));

var _maplibreGl = _interopRequireDefault(require("maplibre-gl"));

var _logger = require("matrix-js-sdk/src/logger");

var _client = require("matrix-js-sdk/src/client");

var _languageHandler = require("../../../languageHandler");

var _MatrixClientContext = _interopRequireDefault(require("../../../contexts/MatrixClientContext"));

var _Modal = _interopRequireDefault(require("../../../Modal"));

var _SdkConfig = _interopRequireDefault(require("../../../SdkConfig"));

var _WellKnownUtils = require("../../../utils/WellKnownUtils");

var _beacon = require("../../../utils/beacon");

var _location = require("../../../utils/location");

var _ErrorDialog = _interopRequireDefault(require("../dialogs/ErrorDialog"));

var _AccessibleButton = _interopRequireDefault(require("../elements/AccessibleButton"));

var _MapError = require("./MapError");

var _LiveDurationDropdown = _interopRequireWildcard(require("./LiveDurationDropdown"));

var _shareLocation = require("./shareLocation");

var _Marker = _interopRequireDefault(require("./Marker"));

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

/*
Copyright 2021 The Matrix.org Foundation C.I.C.

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
const isSharingOwnLocation = shareType => shareType === _shareLocation.LocationShareType.Own || shareType === _shareLocation.LocationShareType.Live;

class LocationPicker extends _react.default.Component {
  constructor(props) {
    super(props);
    (0, _defineProperty2.default)(this, "context", void 0);
    (0, _defineProperty2.default)(this, "map", null);
    (0, _defineProperty2.default)(this, "geolocate", null);
    (0, _defineProperty2.default)(this, "marker", null);
    (0, _defineProperty2.default)(this, "getMarkerId", () => {
      return "mx_MLocationPicker_marker";
    });
    (0, _defineProperty2.default)(this, "addMarkerToMap", () => {
      this.marker = new _maplibreGl.default.Marker({
        element: document.getElementById(this.getMarkerId()),
        anchor: 'bottom',
        offset: [0, -1]
      }).setLngLat(new _maplibreGl.default.LngLat(0, 0)).addTo(this.map);
    });
    (0, _defineProperty2.default)(this, "updateStyleUrl", clientWellKnown => {
      const style = (0, _WellKnownUtils.tileServerFromWellKnown)(clientWellKnown)?.["map_style_url"];

      if (style) {
        this.map?.setStyle(style);
      }
    });
    (0, _defineProperty2.default)(this, "onGeolocate", position => {
      if (!this.marker) {
        this.addMarkerToMap();
      }

      this.setState({
        position: (0, _beacon.genericPositionFromGeolocation)(position)
      });
      this.marker?.setLngLat(new _maplibreGl.default.LngLat(position.coords.longitude, position.coords.latitude));
    });
    (0, _defineProperty2.default)(this, "onClick", event => {
      if (!this.marker) {
        this.addMarkerToMap();
      }

      this.marker?.setLngLat(event.lngLat);
      this.setState({
        position: {
          timestamp: Date.now(),
          latitude: event.lngLat.lat,
          longitude: event.lngLat.lng
        }
      });
    });
    (0, _defineProperty2.default)(this, "onGeolocateError", e => {
      _logger.logger.error("Could not fetch location", e); // close the dialog and show an error when trying to share own location
      // pin drop location without permissions is ok


      if (isSharingOwnLocation(this.props.shareType)) {
        this.props.onFinished();

        _Modal.default.createDialog(_ErrorDialog.default, {
          title: (0, _languageHandler._t)("Could not fetch location"),
          description: positionFailureMessage(e.code)
        });
      }

      if (this.geolocate) {
        this.map?.removeControl(this.geolocate);
      }
    });
    (0, _defineProperty2.default)(this, "onTimeoutChange", timeout => {
      this.setState({
        timeout
      });
    });
    (0, _defineProperty2.default)(this, "onOk", () => {
      const {
        timeout,
        position
      } = this.state;
      this.props.onChoose(position ? {
        uri: (0, _beacon.getGeoUri)(position),
        timestamp: position.timestamp,
        timeout
      } : {
        timeout
      });
      this.props.onFinished();
    });
    this.state = {
      position: undefined,
      timeout: _LiveDurationDropdown.DEFAULT_DURATION_MS,
      error: undefined
    };
  }

  componentDidMount() {
    this.context.on(_client.ClientEvent.ClientWellKnown, this.updateStyleUrl);

    try {
      this.map = new _maplibreGl.default.Map({
        container: 'mx_LocationPicker_map',
        style: (0, _location.findMapStyleUrl)(),
        center: [0, 0],
        zoom: 1
      }); // Add geolocate control to the map.

      this.geolocate = new _maplibreGl.default.GeolocateControl({
        positionOptions: {
          enableHighAccuracy: true
        },
        trackUserLocation: false
      });
      this.map.addControl(this.geolocate);
      this.map.on('error', e => {
        _logger.logger.error("Failed to load map: check map_style_url in config.json " + "has a valid URL and API key", e.error);

        this.setState({
          error: _location.LocationShareError.MapStyleUrlNotReachable
        });
      });
      this.map.on('load', () => {
        this.geolocate.trigger();
      });
      this.geolocate.on('error', this.onGeolocateError);

      if (isSharingOwnLocation(this.props.shareType)) {
        this.geolocate.on('geolocate', this.onGeolocate);
      }

      if (this.props.shareType === _shareLocation.LocationShareType.Pin) {
        const navigationControl = new _maplibreGl.default.NavigationControl({
          showCompass: false,
          showZoom: true
        });
        this.map.addControl(navigationControl, 'bottom-right');
        this.map.on('click', this.onClick);
      }
    } catch (e) {
      _logger.logger.error("Failed to render map", e);

      const errorType = e?.message === _location.LocationShareError.MapStyleUrlNotConfigured ? _location.LocationShareError.MapStyleUrlNotConfigured : _location.LocationShareError.Default;
      this.setState({
        error: errorType
      });
    }
  }

  componentWillUnmount() {
    this.geolocate?.off('error', this.onGeolocateError);
    this.geolocate?.off('geolocate', this.onGeolocate);
    this.map?.off('click', this.onClick);
    this.context.off(_client.ClientEvent.ClientWellKnown, this.updateStyleUrl);
  }

  render() {
    if (this.state.error) {
      return /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_LocationPicker mx_LocationPicker_hasError"
      }, /*#__PURE__*/_react.default.createElement(_MapError.MapError, {
        error: this.state.error,
        onFinished: this.props.onFinished
      }));
    }

    return /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_LocationPicker"
    }, /*#__PURE__*/_react.default.createElement("div", {
      id: "mx_LocationPicker_map"
    }), this.props.shareType === _shareLocation.LocationShareType.Pin && /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_LocationPicker_pinText"
    }, /*#__PURE__*/_react.default.createElement("span", null, this.state.position ? (0, _languageHandler._t)("Click to move the pin") : (0, _languageHandler._t)("Click to drop a pin"))), /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_LocationPicker_footer"
    }, /*#__PURE__*/_react.default.createElement("form", {
      onSubmit: this.onOk
    }, this.props.shareType === _shareLocation.LocationShareType.Live && /*#__PURE__*/_react.default.createElement(_LiveDurationDropdown.default, {
      onChange: this.onTimeoutChange,
      timeout: this.state.timeout
    }), /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
      "data-test-id": "location-picker-submit-button",
      type: "submit",
      element: "button",
      kind: "primary",
      className: "mx_LocationPicker_submitButton",
      disabled: !this.state.position,
      onClick: this.onOk
    }, (0, _languageHandler._t)('Share location')))), /*#__PURE__*/_react.default.createElement("div", {
      id: this.getMarkerId()
    }, !!this.marker && /*#__PURE__*/_react.default.createElement(_Marker.default, {
      roomMember: isSharingOwnLocation(this.props.shareType) ? this.props.sender : undefined,
      useMemberColor: this.props.shareType === _shareLocation.LocationShareType.Live
    })));
  }

}

(0, _defineProperty2.default)(LocationPicker, "contextType", _MatrixClientContext.default);
var _default = LocationPicker;
exports.default = _default;

function positionFailureMessage(code) {
  const brand = _SdkConfig.default.get().brand;

  switch (code) {
    case 1:
      return (0, _languageHandler._t)("%(brand)s was denied permission to fetch your location. " + "Please allow location access in your browser settings.", {
        brand
      });

    case 2:
      return (0, _languageHandler._t)("Failed to fetch your location. Please try again later.");

    case 3:
      return (0, _languageHandler._t)("Timed out trying to fetch your location. Please try again later.");

    case 4:
      return (0, _languageHandler._t)("Unknown error fetching location. Please try again later.");
  }
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJpc1NoYXJpbmdPd25Mb2NhdGlvbiIsInNoYXJlVHlwZSIsIkxvY2F0aW9uU2hhcmVUeXBlIiwiT3duIiwiTGl2ZSIsIkxvY2F0aW9uUGlja2VyIiwiUmVhY3QiLCJDb21wb25lbnQiLCJjb25zdHJ1Y3RvciIsInByb3BzIiwibWFya2VyIiwibWFwbGlicmVnbCIsIk1hcmtlciIsImVsZW1lbnQiLCJkb2N1bWVudCIsImdldEVsZW1lbnRCeUlkIiwiZ2V0TWFya2VySWQiLCJhbmNob3IiLCJvZmZzZXQiLCJzZXRMbmdMYXQiLCJMbmdMYXQiLCJhZGRUbyIsIm1hcCIsImNsaWVudFdlbGxLbm93biIsInN0eWxlIiwidGlsZVNlcnZlckZyb21XZWxsS25vd24iLCJzZXRTdHlsZSIsInBvc2l0aW9uIiwiYWRkTWFya2VyVG9NYXAiLCJzZXRTdGF0ZSIsImdlbmVyaWNQb3NpdGlvbkZyb21HZW9sb2NhdGlvbiIsImNvb3JkcyIsImxvbmdpdHVkZSIsImxhdGl0dWRlIiwiZXZlbnQiLCJsbmdMYXQiLCJ0aW1lc3RhbXAiLCJEYXRlIiwibm93IiwibGF0IiwibG5nIiwiZSIsImxvZ2dlciIsImVycm9yIiwib25GaW5pc2hlZCIsIk1vZGFsIiwiY3JlYXRlRGlhbG9nIiwiRXJyb3JEaWFsb2ciLCJ0aXRsZSIsIl90IiwiZGVzY3JpcHRpb24iLCJwb3NpdGlvbkZhaWx1cmVNZXNzYWdlIiwiY29kZSIsImdlb2xvY2F0ZSIsInJlbW92ZUNvbnRyb2wiLCJ0aW1lb3V0Iiwic3RhdGUiLCJvbkNob29zZSIsInVyaSIsImdldEdlb1VyaSIsInVuZGVmaW5lZCIsIkRFRkFVTFRfRFVSQVRJT05fTVMiLCJjb21wb25lbnREaWRNb3VudCIsImNvbnRleHQiLCJvbiIsIkNsaWVudEV2ZW50IiwiQ2xpZW50V2VsbEtub3duIiwidXBkYXRlU3R5bGVVcmwiLCJNYXAiLCJjb250YWluZXIiLCJmaW5kTWFwU3R5bGVVcmwiLCJjZW50ZXIiLCJ6b29tIiwiR2VvbG9jYXRlQ29udHJvbCIsInBvc2l0aW9uT3B0aW9ucyIsImVuYWJsZUhpZ2hBY2N1cmFjeSIsInRyYWNrVXNlckxvY2F0aW9uIiwiYWRkQ29udHJvbCIsIkxvY2F0aW9uU2hhcmVFcnJvciIsIk1hcFN0eWxlVXJsTm90UmVhY2hhYmxlIiwidHJpZ2dlciIsIm9uR2VvbG9jYXRlRXJyb3IiLCJvbkdlb2xvY2F0ZSIsIlBpbiIsIm5hdmlnYXRpb25Db250cm9sIiwiTmF2aWdhdGlvbkNvbnRyb2wiLCJzaG93Q29tcGFzcyIsInNob3dab29tIiwib25DbGljayIsImVycm9yVHlwZSIsIm1lc3NhZ2UiLCJNYXBTdHlsZVVybE5vdENvbmZpZ3VyZWQiLCJEZWZhdWx0IiwiY29tcG9uZW50V2lsbFVubW91bnQiLCJvZmYiLCJyZW5kZXIiLCJvbk9rIiwib25UaW1lb3V0Q2hhbmdlIiwic2VuZGVyIiwiTWF0cml4Q2xpZW50Q29udGV4dCIsImJyYW5kIiwiU2RrQ29uZmlnIiwiZ2V0Il0sInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL2NvbXBvbmVudHMvdmlld3MvbG9jYXRpb24vTG9jYXRpb25QaWNrZXIudHN4Il0sInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgMjAyMSBUaGUgTWF0cml4Lm9yZyBGb3VuZGF0aW9uIEMuSS5DLlxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbmltcG9ydCBSZWFjdCwgeyBTeW50aGV0aWNFdmVudCB9IGZyb20gJ3JlYWN0JztcbmltcG9ydCBtYXBsaWJyZWdsLCB7IE1hcE1vdXNlRXZlbnQgfSBmcm9tICdtYXBsaWJyZS1nbCc7XG5pbXBvcnQgeyBsb2dnZXIgfSBmcm9tIFwibWF0cml4LWpzLXNkay9zcmMvbG9nZ2VyXCI7XG5pbXBvcnQgeyBSb29tTWVtYmVyIH0gZnJvbSAnbWF0cml4LWpzLXNkay9zcmMvbW9kZWxzL3Jvb20tbWVtYmVyJztcbmltcG9ydCB7IENsaWVudEV2ZW50LCBJQ2xpZW50V2VsbEtub3duIH0gZnJvbSAnbWF0cml4LWpzLXNkay9zcmMvY2xpZW50JztcblxuaW1wb3J0IHsgX3QgfSBmcm9tICcuLi8uLi8uLi9sYW5ndWFnZUhhbmRsZXInO1xuaW1wb3J0IE1hdHJpeENsaWVudENvbnRleHQgZnJvbSAnLi4vLi4vLi4vY29udGV4dHMvTWF0cml4Q2xpZW50Q29udGV4dCc7XG5pbXBvcnQgTW9kYWwgZnJvbSAnLi4vLi4vLi4vTW9kYWwnO1xuaW1wb3J0IFNka0NvbmZpZyBmcm9tICcuLi8uLi8uLi9TZGtDb25maWcnO1xuaW1wb3J0IHsgdGlsZVNlcnZlckZyb21XZWxsS25vd24gfSBmcm9tICcuLi8uLi8uLi91dGlscy9XZWxsS25vd25VdGlscyc7XG5pbXBvcnQgeyBHZW5lcmljUG9zaXRpb24sIGdlbmVyaWNQb3NpdGlvbkZyb21HZW9sb2NhdGlvbiwgZ2V0R2VvVXJpIH0gZnJvbSAnLi4vLi4vLi4vdXRpbHMvYmVhY29uJztcbmltcG9ydCB7IExvY2F0aW9uU2hhcmVFcnJvciwgZmluZE1hcFN0eWxlVXJsIH0gZnJvbSAnLi4vLi4vLi4vdXRpbHMvbG9jYXRpb24nO1xuaW1wb3J0IEVycm9yRGlhbG9nIGZyb20gJy4uL2RpYWxvZ3MvRXJyb3JEaWFsb2cnO1xuaW1wb3J0IEFjY2Vzc2libGVCdXR0b24gZnJvbSAnLi4vZWxlbWVudHMvQWNjZXNzaWJsZUJ1dHRvbic7XG5pbXBvcnQgeyBNYXBFcnJvciB9IGZyb20gJy4vTWFwRXJyb3InO1xuaW1wb3J0IExpdmVEdXJhdGlvbkRyb3Bkb3duLCB7IERFRkFVTFRfRFVSQVRJT05fTVMgfSBmcm9tICcuL0xpdmVEdXJhdGlvbkRyb3Bkb3duJztcbmltcG9ydCB7IExvY2F0aW9uU2hhcmVUeXBlLCBTaGFyZUxvY2F0aW9uRm4gfSBmcm9tICcuL3NoYXJlTG9jYXRpb24nO1xuaW1wb3J0IE1hcmtlciBmcm9tICcuL01hcmtlcic7XG5cbmV4cG9ydCBpbnRlcmZhY2UgSUxvY2F0aW9uUGlja2VyUHJvcHMge1xuICAgIHNlbmRlcjogUm9vbU1lbWJlcjtcbiAgICBzaGFyZVR5cGU6IExvY2F0aW9uU2hhcmVUeXBlO1xuICAgIG9uQ2hvb3NlOiBTaGFyZUxvY2F0aW9uRm47XG4gICAgb25GaW5pc2hlZChldj86IFN5bnRoZXRpY0V2ZW50KTogdm9pZDtcbn1cblxuaW50ZXJmYWNlIElTdGF0ZSB7XG4gICAgdGltZW91dDogbnVtYmVyO1xuICAgIHBvc2l0aW9uPzogR2VuZXJpY1Bvc2l0aW9uO1xuICAgIGVycm9yPzogTG9jYXRpb25TaGFyZUVycm9yO1xufVxuXG5jb25zdCBpc1NoYXJpbmdPd25Mb2NhdGlvbiA9IChzaGFyZVR5cGU6IExvY2F0aW9uU2hhcmVUeXBlKTogYm9vbGVhbiA9PlxuICAgIHNoYXJlVHlwZSA9PT0gTG9jYXRpb25TaGFyZVR5cGUuT3duIHx8IHNoYXJlVHlwZSA9PT0gTG9jYXRpb25TaGFyZVR5cGUuTGl2ZTtcblxuY2xhc3MgTG9jYXRpb25QaWNrZXIgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQ8SUxvY2F0aW9uUGlja2VyUHJvcHMsIElTdGF0ZT4ge1xuICAgIHB1YmxpYyBzdGF0aWMgY29udGV4dFR5cGUgPSBNYXRyaXhDbGllbnRDb250ZXh0O1xuICAgIHB1YmxpYyBjb250ZXh0ITogUmVhY3QuQ29udGV4dFR5cGU8dHlwZW9mIE1hdHJpeENsaWVudENvbnRleHQ+O1xuICAgIHByaXZhdGUgbWFwPzogbWFwbGlicmVnbC5NYXAgPSBudWxsO1xuICAgIHByaXZhdGUgZ2VvbG9jYXRlPzogbWFwbGlicmVnbC5HZW9sb2NhdGVDb250cm9sID0gbnVsbDtcbiAgICBwcml2YXRlIG1hcmtlcj86IG1hcGxpYnJlZ2wuTWFya2VyID0gbnVsbDtcblxuICAgIGNvbnN0cnVjdG9yKHByb3BzOiBJTG9jYXRpb25QaWNrZXJQcm9wcykge1xuICAgICAgICBzdXBlcihwcm9wcyk7XG5cbiAgICAgICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgICAgICAgIHBvc2l0aW9uOiB1bmRlZmluZWQsXG4gICAgICAgICAgICB0aW1lb3V0OiBERUZBVUxUX0RVUkFUSU9OX01TLFxuICAgICAgICAgICAgZXJyb3I6IHVuZGVmaW5lZCxcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGdldE1hcmtlcklkID0gKCkgPT4ge1xuICAgICAgICByZXR1cm4gXCJteF9NTG9jYXRpb25QaWNrZXJfbWFya2VyXCI7XG4gICAgfTtcblxuICAgIGNvbXBvbmVudERpZE1vdW50KCkge1xuICAgICAgICB0aGlzLmNvbnRleHQub24oQ2xpZW50RXZlbnQuQ2xpZW50V2VsbEtub3duLCB0aGlzLnVwZGF0ZVN0eWxlVXJsKTtcblxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgdGhpcy5tYXAgPSBuZXcgbWFwbGlicmVnbC5NYXAoe1xuICAgICAgICAgICAgICAgIGNvbnRhaW5lcjogJ214X0xvY2F0aW9uUGlja2VyX21hcCcsXG4gICAgICAgICAgICAgICAgc3R5bGU6IGZpbmRNYXBTdHlsZVVybCgpLFxuICAgICAgICAgICAgICAgIGNlbnRlcjogWzAsIDBdLFxuICAgICAgICAgICAgICAgIHpvb206IDEsXG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgLy8gQWRkIGdlb2xvY2F0ZSBjb250cm9sIHRvIHRoZSBtYXAuXG4gICAgICAgICAgICB0aGlzLmdlb2xvY2F0ZSA9IG5ldyBtYXBsaWJyZWdsLkdlb2xvY2F0ZUNvbnRyb2woe1xuICAgICAgICAgICAgICAgIHBvc2l0aW9uT3B0aW9uczoge1xuICAgICAgICAgICAgICAgICAgICBlbmFibGVIaWdoQWNjdXJhY3k6IHRydWUsXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB0cmFja1VzZXJMb2NhdGlvbjogZmFsc2UsXG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgdGhpcy5tYXAuYWRkQ29udHJvbCh0aGlzLmdlb2xvY2F0ZSk7XG5cbiAgICAgICAgICAgIHRoaXMubWFwLm9uKCdlcnJvcicsIChlKSA9PiB7XG4gICAgICAgICAgICAgICAgbG9nZ2VyLmVycm9yKFxuICAgICAgICAgICAgICAgICAgICBcIkZhaWxlZCB0byBsb2FkIG1hcDogY2hlY2sgbWFwX3N0eWxlX3VybCBpbiBjb25maWcuanNvbiBcIlxuICAgICAgICAgICAgICAgICAgICArIFwiaGFzIGEgdmFsaWQgVVJMIGFuZCBBUEkga2V5XCIsXG4gICAgICAgICAgICAgICAgICAgIGUuZXJyb3IsXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICB0aGlzLnNldFN0YXRlKHsgZXJyb3I6IExvY2F0aW9uU2hhcmVFcnJvci5NYXBTdHlsZVVybE5vdFJlYWNoYWJsZSB9KTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICB0aGlzLm1hcC5vbignbG9hZCcsICgpID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLmdlb2xvY2F0ZS50cmlnZ2VyKCk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgdGhpcy5nZW9sb2NhdGUub24oJ2Vycm9yJywgdGhpcy5vbkdlb2xvY2F0ZUVycm9yKTtcblxuICAgICAgICAgICAgaWYgKGlzU2hhcmluZ093bkxvY2F0aW9uKHRoaXMucHJvcHMuc2hhcmVUeXBlKSkge1xuICAgICAgICAgICAgICAgIHRoaXMuZ2VvbG9jYXRlLm9uKCdnZW9sb2NhdGUnLCB0aGlzLm9uR2VvbG9jYXRlKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKHRoaXMucHJvcHMuc2hhcmVUeXBlID09PSBMb2NhdGlvblNoYXJlVHlwZS5QaW4pIHtcbiAgICAgICAgICAgICAgICBjb25zdCBuYXZpZ2F0aW9uQ29udHJvbCA9IG5ldyBtYXBsaWJyZWdsLk5hdmlnYXRpb25Db250cm9sKHtcbiAgICAgICAgICAgICAgICAgICAgc2hvd0NvbXBhc3M6IGZhbHNlLCBzaG93Wm9vbTogdHJ1ZSxcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB0aGlzLm1hcC5hZGRDb250cm9sKG5hdmlnYXRpb25Db250cm9sLCAnYm90dG9tLXJpZ2h0Jyk7XG4gICAgICAgICAgICAgICAgdGhpcy5tYXAub24oJ2NsaWNrJywgdGhpcy5vbkNsaWNrKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgbG9nZ2VyLmVycm9yKFwiRmFpbGVkIHRvIHJlbmRlciBtYXBcIiwgZSk7XG4gICAgICAgICAgICBjb25zdCBlcnJvclR5cGUgPSBlPy5tZXNzYWdlID09PSBMb2NhdGlvblNoYXJlRXJyb3IuTWFwU3R5bGVVcmxOb3RDb25maWd1cmVkID9cbiAgICAgICAgICAgICAgICBMb2NhdGlvblNoYXJlRXJyb3IuTWFwU3R5bGVVcmxOb3RDb25maWd1cmVkIDpcbiAgICAgICAgICAgICAgICBMb2NhdGlvblNoYXJlRXJyb3IuRGVmYXVsdDtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoeyBlcnJvcjogZXJyb3JUeXBlIH0pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgY29tcG9uZW50V2lsbFVubW91bnQoKSB7XG4gICAgICAgIHRoaXMuZ2VvbG9jYXRlPy5vZmYoJ2Vycm9yJywgdGhpcy5vbkdlb2xvY2F0ZUVycm9yKTtcbiAgICAgICAgdGhpcy5nZW9sb2NhdGU/Lm9mZignZ2VvbG9jYXRlJywgdGhpcy5vbkdlb2xvY2F0ZSk7XG4gICAgICAgIHRoaXMubWFwPy5vZmYoJ2NsaWNrJywgdGhpcy5vbkNsaWNrKTtcbiAgICAgICAgdGhpcy5jb250ZXh0Lm9mZihDbGllbnRFdmVudC5DbGllbnRXZWxsS25vd24sIHRoaXMudXBkYXRlU3R5bGVVcmwpO1xuICAgIH1cblxuICAgIHByaXZhdGUgYWRkTWFya2VyVG9NYXAgPSAoKSA9PiB7XG4gICAgICAgIHRoaXMubWFya2VyID0gbmV3IG1hcGxpYnJlZ2wuTWFya2VyKHtcbiAgICAgICAgICAgIGVsZW1lbnQ6IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKHRoaXMuZ2V0TWFya2VySWQoKSksXG4gICAgICAgICAgICBhbmNob3I6ICdib3R0b20nLFxuICAgICAgICAgICAgb2Zmc2V0OiBbMCwgLTFdLFxuICAgICAgICB9KS5zZXRMbmdMYXQobmV3IG1hcGxpYnJlZ2wuTG5nTGF0KDAsIDApKVxuICAgICAgICAgICAgLmFkZFRvKHRoaXMubWFwKTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSB1cGRhdGVTdHlsZVVybCA9IChjbGllbnRXZWxsS25vd246IElDbGllbnRXZWxsS25vd24pID0+IHtcbiAgICAgICAgY29uc3Qgc3R5bGUgPSB0aWxlU2VydmVyRnJvbVdlbGxLbm93bihjbGllbnRXZWxsS25vd24pPy5bXCJtYXBfc3R5bGVfdXJsXCJdO1xuICAgICAgICBpZiAoc3R5bGUpIHtcbiAgICAgICAgICAgIHRoaXMubWFwPy5zZXRTdHlsZShzdHlsZSk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvbkdlb2xvY2F0ZSA9IChwb3NpdGlvbjogR2VvbG9jYXRpb25Qb3NpdGlvbikgPT4ge1xuICAgICAgICBpZiAoIXRoaXMubWFya2VyKSB7XG4gICAgICAgICAgICB0aGlzLmFkZE1hcmtlclRvTWFwKCk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IHBvc2l0aW9uOiBnZW5lcmljUG9zaXRpb25Gcm9tR2VvbG9jYXRpb24ocG9zaXRpb24pIH0pO1xuICAgICAgICB0aGlzLm1hcmtlcj8uc2V0TG5nTGF0KFxuICAgICAgICAgICAgbmV3IG1hcGxpYnJlZ2wuTG5nTGF0KFxuICAgICAgICAgICAgICAgIHBvc2l0aW9uLmNvb3Jkcy5sb25naXR1ZGUsXG4gICAgICAgICAgICAgICAgcG9zaXRpb24uY29vcmRzLmxhdGl0dWRlLFxuICAgICAgICAgICAgKSxcbiAgICAgICAgKTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvbkNsaWNrID0gKGV2ZW50OiBNYXBNb3VzZUV2ZW50KSA9PiB7XG4gICAgICAgIGlmICghdGhpcy5tYXJrZXIpIHtcbiAgICAgICAgICAgIHRoaXMuYWRkTWFya2VyVG9NYXAoKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLm1hcmtlcj8uc2V0TG5nTGF0KGV2ZW50LmxuZ0xhdCk7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgcG9zaXRpb246IHtcbiAgICAgICAgICAgICAgICB0aW1lc3RhbXA6IERhdGUubm93KCksXG4gICAgICAgICAgICAgICAgbGF0aXR1ZGU6IGV2ZW50LmxuZ0xhdC5sYXQsXG4gICAgICAgICAgICAgICAgbG9uZ2l0dWRlOiBldmVudC5sbmdMYXQubG5nLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25HZW9sb2NhdGVFcnJvciA9IChlOiBHZW9sb2NhdGlvblBvc2l0aW9uRXJyb3IpID0+IHtcbiAgICAgICAgbG9nZ2VyLmVycm9yKFwiQ291bGQgbm90IGZldGNoIGxvY2F0aW9uXCIsIGUpO1xuICAgICAgICAvLyBjbG9zZSB0aGUgZGlhbG9nIGFuZCBzaG93IGFuIGVycm9yIHdoZW4gdHJ5aW5nIHRvIHNoYXJlIG93biBsb2NhdGlvblxuICAgICAgICAvLyBwaW4gZHJvcCBsb2NhdGlvbiB3aXRob3V0IHBlcm1pc3Npb25zIGlzIG9rXG4gICAgICAgIGlmIChpc1NoYXJpbmdPd25Mb2NhdGlvbih0aGlzLnByb3BzLnNoYXJlVHlwZSkpIHtcbiAgICAgICAgICAgIHRoaXMucHJvcHMub25GaW5pc2hlZCgpO1xuICAgICAgICAgICAgTW9kYWwuY3JlYXRlRGlhbG9nKEVycm9yRGlhbG9nLCB7XG4gICAgICAgICAgICAgICAgdGl0bGU6IF90KFwiQ291bGQgbm90IGZldGNoIGxvY2F0aW9uXCIpLFxuICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBwb3NpdGlvbkZhaWx1cmVNZXNzYWdlKGUuY29kZSksXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLmdlb2xvY2F0ZSkge1xuICAgICAgICAgICAgdGhpcy5tYXA/LnJlbW92ZUNvbnRyb2wodGhpcy5nZW9sb2NhdGUpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25UaW1lb3V0Q2hhbmdlID0gKHRpbWVvdXQ6IG51bWJlcik6IHZvaWQgPT4ge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHsgdGltZW91dCB9KTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvbk9rID0gKCkgPT4ge1xuICAgICAgICBjb25zdCB7IHRpbWVvdXQsIHBvc2l0aW9uIH0gPSB0aGlzLnN0YXRlO1xuXG4gICAgICAgIHRoaXMucHJvcHMub25DaG9vc2UoXG4gICAgICAgICAgICBwb3NpdGlvbiA/IHsgdXJpOiBnZXRHZW9VcmkocG9zaXRpb24pLCB0aW1lc3RhbXA6IHBvc2l0aW9uLnRpbWVzdGFtcCwgdGltZW91dCB9IDoge1xuICAgICAgICAgICAgICAgIHRpbWVvdXQsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5wcm9wcy5vbkZpbmlzaGVkKCk7XG4gICAgfTtcblxuICAgIHJlbmRlcigpIHtcbiAgICAgICAgaWYgKHRoaXMuc3RhdGUuZXJyb3IpIHtcbiAgICAgICAgICAgIHJldHVybiA8ZGl2IGNsYXNzTmFtZT1cIm14X0xvY2F0aW9uUGlja2VyIG14X0xvY2F0aW9uUGlja2VyX2hhc0Vycm9yXCI+XG4gICAgICAgICAgICAgICAgPE1hcEVycm9yXG4gICAgICAgICAgICAgICAgICAgIGVycm9yPXt0aGlzLnN0YXRlLmVycm9yfVxuICAgICAgICAgICAgICAgICAgICBvbkZpbmlzaGVkPXt0aGlzLnByb3BzLm9uRmluaXNoZWR9IC8+XG4gICAgICAgICAgICA8L2Rpdj47XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9Mb2NhdGlvblBpY2tlclwiPlxuICAgICAgICAgICAgICAgIDxkaXYgaWQ9XCJteF9Mb2NhdGlvblBpY2tlcl9tYXBcIiAvPlxuXG4gICAgICAgICAgICAgICAgeyB0aGlzLnByb3BzLnNoYXJlVHlwZSA9PT0gTG9jYXRpb25TaGFyZVR5cGUuUGluICYmIDxkaXYgY2xhc3NOYW1lPVwibXhfTG9jYXRpb25QaWNrZXJfcGluVGV4dFwiPlxuICAgICAgICAgICAgICAgICAgICA8c3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgICAgIHsgdGhpcy5zdGF0ZS5wb3NpdGlvbiA/IF90KFwiQ2xpY2sgdG8gbW92ZSB0aGUgcGluXCIpIDogX3QoXCJDbGljayB0byBkcm9wIGEgcGluXCIpIH1cbiAgICAgICAgICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X0xvY2F0aW9uUGlja2VyX2Zvb3RlclwiPlxuICAgICAgICAgICAgICAgICAgICA8Zm9ybSBvblN1Ym1pdD17dGhpcy5vbk9rfT5cbiAgICAgICAgICAgICAgICAgICAgICAgIHsgdGhpcy5wcm9wcy5zaGFyZVR5cGUgPT09IExvY2F0aW9uU2hhcmVUeXBlLkxpdmUgJiZcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8TGl2ZUR1cmF0aW9uRHJvcGRvd25cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb25DaGFuZ2U9e3RoaXMub25UaW1lb3V0Q2hhbmdlfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aW1lb3V0PXt0aGlzLnN0YXRlLnRpbWVvdXR9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIDxBY2Nlc3NpYmxlQnV0dG9uXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS10ZXN0LWlkPVwibG9jYXRpb24tcGlja2VyLXN1Ym1pdC1idXR0b25cIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU9XCJzdWJtaXRcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsZW1lbnQ9J2J1dHRvbidcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBraW5kPSdwcmltYXJ5J1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT0nbXhfTG9jYXRpb25QaWNrZXJfc3VibWl0QnV0dG9uJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRpc2FibGVkPXshdGhpcy5zdGF0ZS5wb3NpdGlvbn1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXt0aGlzLm9uT2t9PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsgX3QoJ1NoYXJlIGxvY2F0aW9uJykgfVxuICAgICAgICAgICAgICAgICAgICAgICAgPC9BY2Nlc3NpYmxlQnV0dG9uPlxuICAgICAgICAgICAgICAgICAgICA8L2Zvcm0+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgPGRpdiBpZD17dGhpcy5nZXRNYXJrZXJJZCgpfT5cbiAgICAgICAgICAgICAgICAgICAgeyAvKlxuICAgICAgICAgICAgICAgICAgICBtYXBsaWJyZWdsIGhpamFja3MgdGhlIGRpdiBhYm92ZSB0byBzdHlsZSB0aGUgbWFya2VyXG4gICAgICAgICAgICAgICAgICAgIGl0IG11c3QgYmUgaW4gdGhlIGRvbSB3aGVuIHRoZSBtYXAgaXMgaW5pdGlhbGlzZWRcbiAgICAgICAgICAgICAgICAgICAgYW5kIGtlZXAgYSBjb25zaXN0ZW50IGNsYXNzXG4gICAgICAgICAgICAgICAgICAgIHdlIHdhbnQgdG8gaGlkZSB0aGUgbWFya2VyIHVudGlsIGl0IGlzIHNldCBpbiB0aGUgY2FzZSBvZiBwaW4gZHJvcFxuICAgICAgICAgICAgICAgICAgICBzbyBoaWRlIHRoZSBpbnRlcm5hbCB2aXNpYmxlIGVsZW1lbnRzXG4gICAgICAgICAgICAgICAgICAgICovIH1cblxuICAgICAgICAgICAgICAgICAgICB7ICEhdGhpcy5tYXJrZXIgJiYgPE1hcmtlclxuICAgICAgICAgICAgICAgICAgICAgICAgcm9vbU1lbWJlcj17aXNTaGFyaW5nT3duTG9jYXRpb24odGhpcy5wcm9wcy5zaGFyZVR5cGUpID8gdGhpcy5wcm9wcy5zZW5kZXIgOiB1bmRlZmluZWR9XG4gICAgICAgICAgICAgICAgICAgICAgICB1c2VNZW1iZXJDb2xvcj17dGhpcy5wcm9wcy5zaGFyZVR5cGUgPT09IExvY2F0aW9uU2hhcmVUeXBlLkxpdmV9XG4gICAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICApO1xuICAgIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgTG9jYXRpb25QaWNrZXI7XG5cbmZ1bmN0aW9uIHBvc2l0aW9uRmFpbHVyZU1lc3NhZ2UoY29kZTogbnVtYmVyKTogc3RyaW5nIHtcbiAgICBjb25zdCBicmFuZCA9IFNka0NvbmZpZy5nZXQoKS5icmFuZDtcbiAgICBzd2l0Y2ggKGNvZGUpIHtcbiAgICAgICAgY2FzZSAxOiByZXR1cm4gX3QoXG4gICAgICAgICAgICBcIiUoYnJhbmQpcyB3YXMgZGVuaWVkIHBlcm1pc3Npb24gdG8gZmV0Y2ggeW91ciBsb2NhdGlvbi4gXCIgK1xuICAgICAgICAgICAgXCJQbGVhc2UgYWxsb3cgbG9jYXRpb24gYWNjZXNzIGluIHlvdXIgYnJvd3NlciBzZXR0aW5ncy5cIiwgeyBicmFuZCB9LFxuICAgICAgICApO1xuICAgICAgICBjYXNlIDI6IHJldHVybiBfdChcbiAgICAgICAgICAgIFwiRmFpbGVkIHRvIGZldGNoIHlvdXIgbG9jYXRpb24uIFBsZWFzZSB0cnkgYWdhaW4gbGF0ZXIuXCIsXG4gICAgICAgICk7XG4gICAgICAgIGNhc2UgMzogcmV0dXJuIF90KFxuICAgICAgICAgICAgXCJUaW1lZCBvdXQgdHJ5aW5nIHRvIGZldGNoIHlvdXIgbG9jYXRpb24uIFBsZWFzZSB0cnkgYWdhaW4gbGF0ZXIuXCIsXG4gICAgICAgICk7XG4gICAgICAgIGNhc2UgNDogcmV0dXJuIF90KFxuICAgICAgICAgICAgXCJVbmtub3duIGVycm9yIGZldGNoaW5nIGxvY2F0aW9uLiBQbGVhc2UgdHJ5IGFnYWluIGxhdGVyLlwiLFxuICAgICAgICApO1xuICAgIH1cbn1cbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFnQkE7O0FBQ0E7O0FBQ0E7O0FBRUE7O0FBRUE7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7Ozs7OztBQWxDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFtQ0EsTUFBTUEsb0JBQW9CLEdBQUlDLFNBQUQsSUFDekJBLFNBQVMsS0FBS0MsZ0NBQUEsQ0FBa0JDLEdBQWhDLElBQXVDRixTQUFTLEtBQUtDLGdD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