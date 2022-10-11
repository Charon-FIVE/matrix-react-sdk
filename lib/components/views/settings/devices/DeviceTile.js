"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _react = _interopRequireWildcard(require("react"));

var _inactive = require("../../../../../res/img/element-icons/settings/inactive.svg");

var _languageHandler = require("../../../../languageHandler");

var _DateUtils = require("../../../../DateUtils");

var _TooltipTarget = _interopRequireDefault(require("../../elements/TooltipTarget"));

var _Tooltip = require("../../elements/Tooltip");

var _Heading = _interopRequireDefault(require("../../typography/Heading"));

var _filter = require("./filter");

var _DeviceType = require("./DeviceType");

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
const DeviceTileName = _ref => {
  let {
    device
  } = _ref;

  if (device.display_name) {
    return /*#__PURE__*/_react.default.createElement(_TooltipTarget.default, {
      alignment: _Tooltip.Alignment.Top,
      label: `${device.display_name} (${device.device_id})`
    }, /*#__PURE__*/_react.default.createElement(_Heading.default, {
      size: "h4"
    }, device.display_name));
  }

  return /*#__PURE__*/_react.default.createElement(_Heading.default, {
    size: "h4"
  }, device.device_id);
};

const MS_DAY = 24 * 60 * 60 * 1000;
const MS_6_DAYS = 6 * MS_DAY;

const formatLastActivity = function (timestamp) {
  let now = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : new Date().getTime();

  // less than a week ago
  if (timestamp + MS_6_DAYS >= now) {
    const date = new Date(timestamp); // Tue 20:15

    return (0, _DateUtils.formatDate)(date);
  }

  return (0, _DateUtils.formatRelativeTime)(new Date(timestamp));
};

const getInactiveMetadata = device => {
  const isInactive = (0, _filter.isDeviceInactive)(device);

  if (!isInactive) {
    return undefined;
  }

  return {
    id: 'inactive',
    value: /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, /*#__PURE__*/_react.default.createElement(_inactive.Icon, {
      className: "mx_DeviceTile_inactiveIcon"
    }), (0, _languageHandler._t)('Inactive for %(inactiveAgeDays)s+ days', {
      inactiveAgeDays: _filter.INACTIVE_DEVICE_AGE_DAYS
    }) + ` (${formatLastActivity(device.last_seen_ts)})`)
  };
};

const DeviceMetadata = _ref2 => {
  let {
    value,
    id
  } = _ref2;
  return value ? /*#__PURE__*/_react.default.createElement("span", {
    "data-testid": `device-metadata-${id}`
  }, value) : null;
};

const DeviceTile = _ref3 => {
  let {
    device,
    children,
    onClick
  } = _ref3;
  const inactive = getInactiveMetadata(device);
  const lastActivity = device.last_seen_ts && `${(0, _languageHandler._t)('Last activity')} ${formatLastActivity(device.last_seen_ts)}`;
  const verificationStatus = device.isVerified ? (0, _languageHandler._t)('Verified') : (0, _languageHandler._t)('Unverified'); // if device is inactive, don't display last activity or verificationStatus

  const metadata = inactive ? [inactive, {
    id: 'lastSeenIp',
    value: device.last_seen_ip
  }] : [{
    id: 'isVerified',
    value: verificationStatus
  }, {
    id: 'lastActivity',
    value: lastActivity
  }, {
    id: 'lastSeenIp',
    value: device.last_seen_ip
  }];
  return /*#__PURE__*/_react.default.createElement("div", {
    className: "mx_DeviceTile",
    "data-testid": `device-tile-${device.device_id}`
  }, /*#__PURE__*/_react.default.createElement(_DeviceType.DeviceType, {
    isVerified: device.isVerified
  }), /*#__PURE__*/_react.default.createElement("div", {
    className: "mx_DeviceTile_info",
    onClick: onClick
  }, /*#__PURE__*/_react.default.createElement(DeviceTileName, {
    device: device
  }), /*#__PURE__*/_react.default.createElement("div", {
    className: "mx_DeviceTile_metadata"
  }, metadata.map((_ref4, index) => {
    let {
      id,
      value
    } = _ref4;
    return /*#__PURE__*/_react.default.createElement(_react.Fragment, {
      key: id
    }, !!index && ' · ', /*#__PURE__*/_react.default.createElement(DeviceMetadata, {
      id: id,
      value: value
    }));
  }))), /*#__PURE__*/_react.default.createElement("div", {
    className: "mx_DeviceTile_actions"
  }, children));
};

var _default = DeviceTile;
exports.default = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJEZXZpY2VUaWxlTmFtZSIsImRldmljZSIsImRpc3BsYXlfbmFtZSIsIkFsaWdubWVudCIsIlRvcCIsImRldmljZV9pZCIsIk1TX0RBWSIsIk1TXzZfREFZUyIsImZvcm1hdExhc3RBY3Rpdml0eSIsInRpbWVzdGFtcCIsIm5vdyIsIkRhdGUiLCJnZXRUaW1lIiwiZGF0ZSIsImZvcm1hdERhdGUiLCJmb3JtYXRSZWxhdGl2ZVRpbWUiLCJnZXRJbmFjdGl2ZU1ldGFkYXRhIiwiaXNJbmFjdGl2ZSIsImlzRGV2aWNlSW5hY3RpdmUiLCJ1bmRlZmluZWQiLCJpZCIsInZhbHVlIiwiX3QiLCJpbmFjdGl2ZUFnZURheXMiLCJJTkFDVElWRV9ERVZJQ0VfQUdFX0RBWVMiLCJsYXN0X3NlZW5fdHMiLCJEZXZpY2VNZXRhZGF0YSIsIkRldmljZVRpbGUiLCJjaGlsZHJlbiIsIm9uQ2xpY2siLCJpbmFjdGl2ZSIsImxhc3RBY3Rpdml0eSIsInZlcmlmaWNhdGlvblN0YXR1cyIsImlzVmVyaWZpZWQiLCJtZXRhZGF0YSIsImxhc3Rfc2Vlbl9pcCIsIm1hcCIsImluZGV4Il0sInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL2NvbXBvbmVudHMvdmlld3Mvc2V0dGluZ3MvZGV2aWNlcy9EZXZpY2VUaWxlLnRzeCJdLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMjIgVGhlIE1hdHJpeC5vcmcgRm91bmRhdGlvbiBDLkkuQy5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQgUmVhY3QsIHsgRnJhZ21lbnQgfSBmcm9tIFwicmVhY3RcIjtcblxuaW1wb3J0IHsgSWNvbiBhcyBJbmFjdGl2ZUljb24gfSBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXMvaW1nL2VsZW1lbnQtaWNvbnMvc2V0dGluZ3MvaW5hY3RpdmUuc3ZnJztcbmltcG9ydCB7IF90IH0gZnJvbSBcIi4uLy4uLy4uLy4uL2xhbmd1YWdlSGFuZGxlclwiO1xuaW1wb3J0IHsgZm9ybWF0RGF0ZSwgZm9ybWF0UmVsYXRpdmVUaW1lIH0gZnJvbSBcIi4uLy4uLy4uLy4uL0RhdGVVdGlsc1wiO1xuaW1wb3J0IFRvb2x0aXBUYXJnZXQgZnJvbSBcIi4uLy4uL2VsZW1lbnRzL1Rvb2x0aXBUYXJnZXRcIjtcbmltcG9ydCB7IEFsaWdubWVudCB9IGZyb20gXCIuLi8uLi9lbGVtZW50cy9Ub29sdGlwXCI7XG5pbXBvcnQgSGVhZGluZyBmcm9tIFwiLi4vLi4vdHlwb2dyYXBoeS9IZWFkaW5nXCI7XG5pbXBvcnQgeyBJTkFDVElWRV9ERVZJQ0VfQUdFX0RBWVMsIGlzRGV2aWNlSW5hY3RpdmUgfSBmcm9tIFwiLi9maWx0ZXJcIjtcbmltcG9ydCB7IERldmljZVdpdGhWZXJpZmljYXRpb24gfSBmcm9tIFwiLi90eXBlc1wiO1xuaW1wb3J0IHsgRGV2aWNlVHlwZSB9IGZyb20gXCIuL0RldmljZVR5cGVcIjtcbmV4cG9ydCBpbnRlcmZhY2UgRGV2aWNlVGlsZVByb3BzIHtcbiAgICBkZXZpY2U6IERldmljZVdpdGhWZXJpZmljYXRpb247XG4gICAgY2hpbGRyZW4/OiBSZWFjdC5SZWFjdE5vZGU7XG4gICAgb25DbGljaz86ICgpID0+IHZvaWQ7XG59XG5cbmNvbnN0IERldmljZVRpbGVOYW1lOiBSZWFjdC5GQzx7IGRldmljZTogRGV2aWNlV2l0aFZlcmlmaWNhdGlvbiB9PiA9ICh7IGRldmljZSB9KSA9PiB7XG4gICAgaWYgKGRldmljZS5kaXNwbGF5X25hbWUpIHtcbiAgICAgICAgcmV0dXJuIDxUb29sdGlwVGFyZ2V0XG4gICAgICAgICAgICBhbGlnbm1lbnQ9e0FsaWdubWVudC5Ub3B9XG4gICAgICAgICAgICBsYWJlbD17YCR7ZGV2aWNlLmRpc3BsYXlfbmFtZX0gKCR7ZGV2aWNlLmRldmljZV9pZH0pYH1cbiAgICAgICAgPlxuICAgICAgICAgICAgPEhlYWRpbmcgc2l6ZT0naDQnPlxuICAgICAgICAgICAgICAgIHsgZGV2aWNlLmRpc3BsYXlfbmFtZSB9XG4gICAgICAgICAgICA8L0hlYWRpbmc+XG4gICAgICAgIDwvVG9vbHRpcFRhcmdldD47XG4gICAgfVxuICAgIHJldHVybiA8SGVhZGluZyBzaXplPSdoNCc+XG4gICAgICAgIHsgZGV2aWNlLmRldmljZV9pZCB9XG4gICAgPC9IZWFkaW5nPjtcbn07XG5cbmNvbnN0IE1TX0RBWSA9IDI0ICogNjAgKiA2MCAqIDEwMDA7XG5jb25zdCBNU182X0RBWVMgPSA2ICogTVNfREFZO1xuY29uc3QgZm9ybWF0TGFzdEFjdGl2aXR5ID0gKHRpbWVzdGFtcDogbnVtYmVyLCBub3cgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKSk6IHN0cmluZyA9PiB7XG4gICAgLy8gbGVzcyB0aGFuIGEgd2VlayBhZ29cbiAgICBpZiAodGltZXN0YW1wICsgTVNfNl9EQVlTID49IG5vdykge1xuICAgICAgICBjb25zdCBkYXRlID0gbmV3IERhdGUodGltZXN0YW1wKTtcbiAgICAgICAgLy8gVHVlIDIwOjE1XG4gICAgICAgIHJldHVybiBmb3JtYXREYXRlKGRhdGUpO1xuICAgIH1cbiAgICByZXR1cm4gZm9ybWF0UmVsYXRpdmVUaW1lKG5ldyBEYXRlKHRpbWVzdGFtcCkpO1xufTtcblxuY29uc3QgZ2V0SW5hY3RpdmVNZXRhZGF0YSA9IChkZXZpY2U6IERldmljZVdpdGhWZXJpZmljYXRpb24pOiB7IGlkOiBzdHJpbmcsIHZhbHVlOiBSZWFjdC5SZWFjdE5vZGUgfSB8IHVuZGVmaW5lZCA9PiB7XG4gICAgY29uc3QgaXNJbmFjdGl2ZSA9IGlzRGV2aWNlSW5hY3RpdmUoZGV2aWNlKTtcblxuICAgIGlmICghaXNJbmFjdGl2ZSkge1xuICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH1cbiAgICByZXR1cm4geyBpZDogJ2luYWN0aXZlJywgdmFsdWU6IChcbiAgICAgICAgPD5cbiAgICAgICAgICAgIDxJbmFjdGl2ZUljb24gY2xhc3NOYW1lPVwibXhfRGV2aWNlVGlsZV9pbmFjdGl2ZUljb25cIiAvPlxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIF90KCdJbmFjdGl2ZSBmb3IgJShpbmFjdGl2ZUFnZURheXMpcysgZGF5cycsIHsgaW5hY3RpdmVBZ2VEYXlzOiBJTkFDVElWRV9ERVZJQ0VfQUdFX0RBWVMgfSkgK1xuICAgICAgICAgICAgICAgIGAgKCR7Zm9ybWF0TGFzdEFjdGl2aXR5KGRldmljZS5sYXN0X3NlZW5fdHMpfSlgXG4gICAgICAgICAgICB9XG4gICAgICAgIDwvPiksXG4gICAgfTtcbn07XG5cbmNvbnN0IERldmljZU1ldGFkYXRhOiBSZWFjdC5GQzx7IHZhbHVlOiBzdHJpbmcgfCBSZWFjdC5SZWFjdE5vZGUsIGlkOiBzdHJpbmcgfT4gPSAoeyB2YWx1ZSwgaWQgfSkgPT4gKFxuICAgIHZhbHVlID8gPHNwYW4gZGF0YS10ZXN0aWQ9e2BkZXZpY2UtbWV0YWRhdGEtJHtpZH1gfT57IHZhbHVlIH08L3NwYW4+IDogbnVsbFxuKTtcblxuY29uc3QgRGV2aWNlVGlsZTogUmVhY3QuRkM8RGV2aWNlVGlsZVByb3BzPiA9ICh7IGRldmljZSwgY2hpbGRyZW4sIG9uQ2xpY2sgfSkgPT4ge1xuICAgIGNvbnN0IGluYWN0aXZlID0gZ2V0SW5hY3RpdmVNZXRhZGF0YShkZXZpY2UpO1xuICAgIGNvbnN0IGxhc3RBY3Rpdml0eSA9IGRldmljZS5sYXN0X3NlZW5fdHMgJiYgYCR7X3QoJ0xhc3QgYWN0aXZpdHknKX0gJHtmb3JtYXRMYXN0QWN0aXZpdHkoZGV2aWNlLmxhc3Rfc2Vlbl90cyl9YDtcbiAgICBjb25zdCB2ZXJpZmljYXRpb25TdGF0dXMgPSBkZXZpY2UuaXNWZXJpZmllZCA/IF90KCdWZXJpZmllZCcpIDogX3QoJ1VudmVyaWZpZWQnKTtcbiAgICAvLyBpZiBkZXZpY2UgaXMgaW5hY3RpdmUsIGRvbid0IGRpc3BsYXkgbGFzdCBhY3Rpdml0eSBvciB2ZXJpZmljYXRpb25TdGF0dXNcbiAgICBjb25zdCBtZXRhZGF0YSA9IGluYWN0aXZlXG4gICAgICAgID8gW2luYWN0aXZlLCB7IGlkOiAnbGFzdFNlZW5JcCcsIHZhbHVlOiBkZXZpY2UubGFzdF9zZWVuX2lwIH1dXG4gICAgICAgIDogW1xuICAgICAgICAgICAgeyBpZDogJ2lzVmVyaWZpZWQnLCB2YWx1ZTogdmVyaWZpY2F0aW9uU3RhdHVzIH0sXG4gICAgICAgICAgICB7IGlkOiAnbGFzdEFjdGl2aXR5JywgdmFsdWU6IGxhc3RBY3Rpdml0eSB9LFxuICAgICAgICAgICAgeyBpZDogJ2xhc3RTZWVuSXAnLCB2YWx1ZTogZGV2aWNlLmxhc3Rfc2Vlbl9pcCB9LFxuICAgICAgICBdO1xuXG4gICAgcmV0dXJuIDxkaXYgY2xhc3NOYW1lPVwibXhfRGV2aWNlVGlsZVwiIGRhdGEtdGVzdGlkPXtgZGV2aWNlLXRpbGUtJHtkZXZpY2UuZGV2aWNlX2lkfWB9PlxuICAgICAgICA8RGV2aWNlVHlwZSBpc1ZlcmlmaWVkPXtkZXZpY2UuaXNWZXJpZmllZH0gLz5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9EZXZpY2VUaWxlX2luZm9cIiBvbkNsaWNrPXtvbkNsaWNrfT5cbiAgICAgICAgICAgIDxEZXZpY2VUaWxlTmFtZSBkZXZpY2U9e2RldmljZX0gLz5cbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfRGV2aWNlVGlsZV9tZXRhZGF0YVwiPlxuICAgICAgICAgICAgICAgIHsgbWV0YWRhdGEubWFwKCh7IGlkLCB2YWx1ZSB9LCBpbmRleCkgPT5cbiAgICAgICAgICAgICAgICAgICAgPEZyYWdtZW50IGtleT17aWR9PlxuICAgICAgICAgICAgICAgICAgICAgICAgeyAhIWluZGV4ICYmICcgwrcgJyB9XG4gICAgICAgICAgICAgICAgICAgICAgICA8RGV2aWNlTWV0YWRhdGEgaWQ9e2lkfSB2YWx1ZT17dmFsdWV9IC8+XG4gICAgICAgICAgICAgICAgICAgIDwvRnJhZ21lbnQ+LFxuICAgICAgICAgICAgICAgICkgfVxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvZGl2PlxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X0RldmljZVRpbGVfYWN0aW9uc1wiPlxuICAgICAgICAgICAgeyBjaGlsZHJlbiB9XG4gICAgICAgIDwvZGl2PlxuICAgIDwvZGl2Pjtcbn07XG5cbmV4cG9ydCBkZWZhdWx0IERldmljZVRpbGU7XG4iXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztBQWdCQTs7QUFFQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFFQTs7Ozs7O0FBMUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQW1CQSxNQUFNQSxjQUE0RCxHQUFHLFFBQWdCO0VBQUEsSUFBZjtJQUFFQztFQUFGLENBQWU7O0VBQ2pGLElBQUlBLE1BQU0sQ0FBQ0MsWUFBWCxFQUF5QjtJQUNyQixvQkFBTyw2QkFBQyxzQkFBRDtNQUNILFNBQVMsRUFBRUMs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