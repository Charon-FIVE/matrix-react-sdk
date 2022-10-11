"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));

var _objectWithoutProperties2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutProperties"));

var _react = _interopRequireWildcard(require("react"));

var _MediaDeviceHandler = _interopRequireWildcard(require("../../../MediaDeviceHandler"));

var _IconizedContextMenu = _interopRequireWildcard(require("./IconizedContextMenu"));

var _languageHandler = require("../../../languageHandler");

const _excluded = ["deviceKinds"];

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

const SECTION_NAMES = {
  [_MediaDeviceHandler.MediaDeviceKindEnum.AudioInput]: (0, _languageHandler._td)("Input devices"),
  [_MediaDeviceHandler.MediaDeviceKindEnum.AudioOutput]: (0, _languageHandler._td)("Output devices"),
  [_MediaDeviceHandler.MediaDeviceKindEnum.VideoInput]: (0, _languageHandler._td)("Cameras")
};

const DeviceContextMenuDevice = _ref => {
  let {
    label,
    selected,
    onClick
  } = _ref;
  return /*#__PURE__*/_react.default.createElement(_IconizedContextMenu.IconizedContextMenuRadio, {
    iconClassName: "mx_DeviceContextMenu_device_icon",
    label: label,
    active: selected,
    onClick: onClick
  });
};

const DeviceContextMenuSection = _ref2 => {
  let {
    deviceKind
  } = _ref2;
  const [devices, setDevices] = (0, _react.useState)([]);
  const [selectedDevice, setSelectedDevice] = (0, _react.useState)(_MediaDeviceHandler.default.getDevice(deviceKind));
  (0, _react.useEffect)(() => {
    const getDevices = async () => {
      return setDevices((await _MediaDeviceHandler.default.getDevices())[deviceKind]);
    };

    getDevices();
  }, [deviceKind]);

  const onDeviceClick = deviceId => {
    _MediaDeviceHandler.default.instance.setDevice(deviceId, deviceKind);

    setSelectedDevice(deviceId);
  };

  return /*#__PURE__*/_react.default.createElement(_IconizedContextMenu.IconizedContextMenuOptionList, {
    label: (0, _languageHandler._t)(SECTION_NAMES[deviceKind])
  }, devices.map(_ref3 => {
    let {
      label,
      deviceId
    } = _ref3;
    return /*#__PURE__*/_react.default.createElement(DeviceContextMenuDevice, {
      key: deviceId,
      label: label,
      selected: selectedDevice === deviceId,
      onClick: () => onDeviceClick(deviceId)
    });
  }));
};

const DeviceContextMenu = _ref4 => {
  let {
    deviceKinds
  } = _ref4,
      props = (0, _objectWithoutProperties2.default)(_ref4, _excluded);
  return /*#__PURE__*/_react.default.createElement(_IconizedContextMenu.default, (0, _extends2.default)({
    compact: true,
    className: "mx_DeviceContextMenu"
  }, props), deviceKinds.map(kind => {
    return /*#__PURE__*/_react.default.createElement(DeviceContextMenuSection, {
      key: kind,
      deviceKind: kind
    });
  }));
};

var _default = DeviceContextMenu;
exports.default = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJTRUNUSU9OX05BTUVTIiwiTWVkaWFEZXZpY2VLaW5kRW51bSIsIkF1ZGlvSW5wdXQiLCJfdGQiLCJBdWRpb091dHB1dCIsIlZpZGVvSW5wdXQiLCJEZXZpY2VDb250ZXh0TWVudURldmljZSIsImxhYmVsIiwic2VsZWN0ZWQiLCJvbkNsaWNrIiwiRGV2aWNlQ29udGV4dE1lbnVTZWN0aW9uIiwiZGV2aWNlS2luZCIsImRldmljZXMiLCJzZXREZXZpY2VzIiwidXNlU3RhdGUiLCJzZWxlY3RlZERldmljZSIsInNldFNlbGVjdGVkRGV2aWNlIiwiTWVkaWFEZXZpY2VIYW5kbGVyIiwiZ2V0RGV2aWNlIiwidXNlRWZmZWN0IiwiZ2V0RGV2aWNlcyIsIm9uRGV2aWNlQ2xpY2siLCJkZXZpY2VJZCIsImluc3RhbmNlIiwic2V0RGV2aWNlIiwiX3QiLCJtYXAiLCJEZXZpY2VDb250ZXh0TWVudSIsImRldmljZUtpbmRzIiwicHJvcHMiLCJraW5kIl0sInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL2NvbXBvbmVudHMvdmlld3MvY29udGV4dF9tZW51cy9EZXZpY2VDb250ZXh0TWVudS50c3giXSwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAyMDIxIMWgaW1vbiBCcmFuZG5lciA8c2ltb24uYnJhLmFnQGdtYWlsLmNvbT5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQgUmVhY3QsIHsgdXNlRWZmZWN0LCB1c2VTdGF0ZSB9IGZyb20gXCJyZWFjdFwiO1xuXG5pbXBvcnQgTWVkaWFEZXZpY2VIYW5kbGVyLCB7IE1lZGlhRGV2aWNlS2luZEVudW0gfSBmcm9tIFwiLi4vLi4vLi4vTWVkaWFEZXZpY2VIYW5kbGVyXCI7XG5pbXBvcnQgSWNvbml6ZWRDb250ZXh0TWVudSwgeyBJY29uaXplZENvbnRleHRNZW51T3B0aW9uTGlzdCwgSWNvbml6ZWRDb250ZXh0TWVudVJhZGlvIH0gZnJvbSBcIi4vSWNvbml6ZWRDb250ZXh0TWVudVwiO1xuaW1wb3J0IHsgSVByb3BzIGFzIElDb250ZXh0TWVudVByb3BzIH0gZnJvbSBcIi4uLy4uL3N0cnVjdHVyZXMvQ29udGV4dE1lbnVcIjtcbmltcG9ydCB7IF90LCBfdGQgfSBmcm9tIFwiLi4vLi4vLi4vbGFuZ3VhZ2VIYW5kbGVyXCI7XG5cbmNvbnN0IFNFQ1RJT05fTkFNRVM6IFJlY29yZDxNZWRpYURldmljZUtpbmRFbnVtLCBzdHJpbmc+ID0ge1xuICAgIFtNZWRpYURldmljZUtpbmRFbnVtLkF1ZGlvSW5wdXRdOiBfdGQoXCJJbnB1dCBkZXZpY2VzXCIpLFxuICAgIFtNZWRpYURldmljZUtpbmRFbnVtLkF1ZGlvT3V0cHV0XTogX3RkKFwiT3V0cHV0IGRldmljZXNcIiksXG4gICAgW01lZGlhRGV2aWNlS2luZEVudW0uVmlkZW9JbnB1dF06IF90ZChcIkNhbWVyYXNcIiksXG59O1xuXG5pbnRlcmZhY2UgSURldmljZUNvbnRleHRNZW51RGV2aWNlUHJvcHMge1xuICAgIGxhYmVsOiBzdHJpbmc7XG4gICAgc2VsZWN0ZWQ6IGJvb2xlYW47XG4gICAgb25DbGljazogKCkgPT4gdm9pZDtcbn1cblxuY29uc3QgRGV2aWNlQ29udGV4dE1lbnVEZXZpY2U6IFJlYWN0LkZDPElEZXZpY2VDb250ZXh0TWVudURldmljZVByb3BzPiA9ICh7IGxhYmVsLCBzZWxlY3RlZCwgb25DbGljayB9KSA9PiB7XG4gICAgcmV0dXJuIDxJY29uaXplZENvbnRleHRNZW51UmFkaW9cbiAgICAgICAgaWNvbkNsYXNzTmFtZT1cIm14X0RldmljZUNvbnRleHRNZW51X2RldmljZV9pY29uXCJcbiAgICAgICAgbGFiZWw9e2xhYmVsfVxuICAgICAgICBhY3RpdmU9e3NlbGVjdGVkfVxuICAgICAgICBvbkNsaWNrPXtvbkNsaWNrfVxuICAgIC8+O1xufTtcblxuaW50ZXJmYWNlIElEZXZpY2VDb250ZXh0TWVudVNlY3Rpb25Qcm9wcyB7XG4gICAgZGV2aWNlS2luZDogTWVkaWFEZXZpY2VLaW5kRW51bTtcbn1cblxuY29uc3QgRGV2aWNlQ29udGV4dE1lbnVTZWN0aW9uOiBSZWFjdC5GQzxJRGV2aWNlQ29udGV4dE1lbnVTZWN0aW9uUHJvcHM+ID0gKHsgZGV2aWNlS2luZCB9KSA9PiB7XG4gICAgY29uc3QgW2RldmljZXMsIHNldERldmljZXNdID0gdXNlU3RhdGU8TWVkaWFEZXZpY2VJbmZvW10+KFtdKTtcbiAgICBjb25zdCBbc2VsZWN0ZWREZXZpY2UsIHNldFNlbGVjdGVkRGV2aWNlXSA9IHVzZVN0YXRlKE1lZGlhRGV2aWNlSGFuZGxlci5nZXREZXZpY2UoZGV2aWNlS2luZCkpO1xuXG4gICAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICAgICAgY29uc3QgZ2V0RGV2aWNlcyA9IGFzeW5jICgpID0+IHtcbiAgICAgICAgICAgIHJldHVybiBzZXREZXZpY2VzKChhd2FpdCBNZWRpYURldmljZUhhbmRsZXIuZ2V0RGV2aWNlcygpKVtkZXZpY2VLaW5kXSk7XG4gICAgICAgIH07XG4gICAgICAgIGdldERldmljZXMoKTtcbiAgICB9LCBbZGV2aWNlS2luZF0pO1xuXG4gICAgY29uc3Qgb25EZXZpY2VDbGljayA9IChkZXZpY2VJZDogc3RyaW5nKTogdm9pZCA9PiB7XG4gICAgICAgIE1lZGlhRGV2aWNlSGFuZGxlci5pbnN0YW5jZS5zZXREZXZpY2UoZGV2aWNlSWQsIGRldmljZUtpbmQpO1xuICAgICAgICBzZXRTZWxlY3RlZERldmljZShkZXZpY2VJZCk7XG4gICAgfTtcblxuICAgIHJldHVybiA8SWNvbml6ZWRDb250ZXh0TWVudU9wdGlvbkxpc3QgbGFiZWw9e190KFNFQ1RJT05fTkFNRVNbZGV2aWNlS2luZF0pfT5cbiAgICAgICAgeyBkZXZpY2VzLm1hcCgoeyBsYWJlbCwgZGV2aWNlSWQgfSkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIDxEZXZpY2VDb250ZXh0TWVudURldmljZVxuICAgICAgICAgICAgICAgIGtleT17ZGV2aWNlSWR9XG4gICAgICAgICAgICAgICAgbGFiZWw9e2xhYmVsfVxuICAgICAgICAgICAgICAgIHNlbGVjdGVkPXtzZWxlY3RlZERldmljZSA9PT0gZGV2aWNlSWR9XG4gICAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4gb25EZXZpY2VDbGljayhkZXZpY2VJZCl9XG4gICAgICAgICAgICAvPjtcbiAgICAgICAgfSkgfVxuICAgIDwvSWNvbml6ZWRDb250ZXh0TWVudU9wdGlvbkxpc3Q+O1xufTtcblxuaW50ZXJmYWNlIElQcm9wcyBleHRlbmRzIElDb250ZXh0TWVudVByb3BzIHtcbiAgICBkZXZpY2VLaW5kczogTWVkaWFEZXZpY2VLaW5kW107XG59XG5cbmNvbnN0IERldmljZUNvbnRleHRNZW51OiBSZWFjdC5GQzxJUHJvcHM+ID0gKHsgZGV2aWNlS2luZHMsIC4uLnByb3BzIH0pID0+IHtcbiAgICByZXR1cm4gPEljb25pemVkQ29udGV4dE1lbnUgY29tcGFjdCBjbGFzc05hbWU9XCJteF9EZXZpY2VDb250ZXh0TWVudVwiIHsuLi5wcm9wc30+XG4gICAgICAgIHsgZGV2aWNlS2luZHMubWFwKChraW5kKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gPERldmljZUNvbnRleHRNZW51U2VjdGlvbiBrZXk9e2tpbmR9IGRldmljZUtpbmQ9e2tpbmQgYXMgTWVkaWFEZXZpY2VLaW5kRW51bX0gLz47XG4gICAgICAgIH0pIH1cbiAgICA8L0ljb25pemVkQ29udGV4dE1lbnU+O1xufTtcblxuZXhwb3J0IGRlZmF1bHQgRGV2aWNlQ29udGV4dE1lbnU7XG4iXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7QUFnQkE7O0FBRUE7O0FBQ0E7O0FBRUE7Ozs7Ozs7O0FBRUEsTUFBTUEsYUFBa0QsR0FBRztFQUN2RCxDQUFDQyx1Q0FBQSxDQUFvQkMsVUFBckIsR0FBa0MsSUFBQUMsb0JBQUEsRUFBSSxlQUFKLENBRHFCO0VBRXZELENBQUNGLHVDQUFBLENBQW9CRyxXQUFyQixHQUFtQyxJQUFBRCxvQkFBQSxFQUFJLGdCQUFKLENBRm9CO0VBR3ZELENBQUNGLHVDQUFBLENBQW9CSSxVQUFyQixHQUFrQyxJQUFBRixvQkFBQSxFQUFJLFNBQUo7QUFIcUIsQ0FBM0Q7O0FBWUEsTUFBTUcsdUJBQWdFLEdBQUcsUUFBa0M7RUFBQSxJQUFqQztJQUFFQyxLQUFGO0lBQVNDLFFBQVQ7SUFBbUJDO0VBQW5CLENBQWlDO0VBQ3ZHLG9CQUFPLDZCQUFDLDZDQUFEO0lBQ0gsYUFBYSxFQUFDLGtDQURYO0lBRUgsS0FBSyxFQUFFRixLQUZKO0lBR0gsTUFBTSxFQUFFQyxRQUhMO0lBSUgsT0FBTyxFQUFFQztFQUpOLEVBQVA7QUFNSCxDQVBEOztBQWFBLE1BQU1DLHdCQUFrRSxHQUFHLFNBQW9CO0VBQUEsSUFBbkI7SUFBRUM7RUFBRixDQUFtQjtFQUMzRixNQUFNLENBQUNDLE9BQUQsRUFBVUMsVUFBVixJQUF3QixJQUFBQyxlQUFBLEVBQTRCLEVBQTVCLENBQTlCO0VBQ0EsTUFBTSxDQUFDQyxjQUFELEVBQWlCQyxpQkFBakIsSUFBc0MsSUFBQUYsZUFBQSxFQUFTRywyQkFBQSxDQUFtQkMsU0FBbkIsQ0FBNkJQLFVBQTdCLENBQVQsQ0FBNUM7RUFFQSxJQUFBUSxnQkFBQSxFQUFVLE1BQU07SUFDWixNQUFNQyxVQUFVLEdBQUcsWUFBWTtNQUMzQixPQUFPUCxVQUFVLENBQUMsQ0FBQyxNQUFNSSwyQkFBQSxDQUFtQkcsVUFBbkIsRUFBUCxFQUF3Q1QsVUFBeEMsQ0FBRCxDQUFqQjtJQUNILENBRkQ7O0lBR0FTLFVBQVU7RUFDYixDQUxELEVBS0csQ0FBQ1QsVUFBRCxDQUxIOztFQU9BLE1BQU1VLGFBQWEsR0FBSUMsUUFBRCxJQUE0QjtJQUM5Q0wsMkJBQUEsQ0FBbUJNLFFBQW5CLENBQTRCQyxTQUE1QixDQUFzQ0YsUUFBdEMsRUFBZ0RYLFVBQWhEOztJQUNBSyxpQkFBaUIsQ0FBQ00sUUFBRCxDQUFqQjtFQUNILENBSEQ7O0VBS0Esb0JBQU8sNkJBQUMsa0RBQUQ7SUFBK0IsS0FBSyxFQUFFLElBQUFHLG1CQUFBLEVBQUd6QixhQUFhLENBQUNXLFVBQUQsQ0FBaEI7RUFBdEMsR0FDREMsT0FBTyxDQUFDYyxHQUFSLENBQVksU0FBeUI7SUFBQSxJQUF4QjtNQUFFbkIsS0FBRjtNQUFTZTtJQUFULENBQXdCO0lBQ25DLG9CQUFPLDZCQUFDLHVCQUFEO01BQ0gsR0FBRyxFQUFFQSxRQURGO01BRUgsS0FBSyxFQUFFZixLQUZKO01BR0gsUUFBUSxFQUFFUSxjQUFjLEtBQUtPLFFBSDFCO01BSUgsT0FBTyxFQUFFLE1BQU1ELGFBQWEsQ0FBQ0MsUUFBRDtJQUp6QixFQUFQO0VBTUgsQ0FQQyxDQURDLENBQVA7QUFVSCxDQTFCRDs7QUFnQ0EsTUFBTUssaUJBQW1DLEdBQUcsU0FBK0I7RUFBQSxJQUE5QjtJQUFFQztFQUFGLENBQThCO0VBQUEsSUFBWkMsS0FBWTtFQUN2RSxvQkFBTyw2QkFBQyw0QkFBRDtJQUFxQixPQUFPLE1BQTVCO0lBQTZCLFNBQVMsRUFBQztFQUF2QyxHQUFrRUEsS0FBbEUsR0FDREQsV0FBVyxDQUFDRixHQUFaLENBQWlCSSxJQUFELElBQVU7SUFDeEIsb0JBQU8sNkJBQUMsd0JBQUQ7TUFBMEIsR0FBRyxFQUFFQSxJQUEvQjtNQUFxQyxVQUFVLEVBQUVBO0lBQWpELEVBQVA7RUFDSCxDQUZDLENBREMsQ0FBUDtBQUtILENBTkQ7O2VBUWVILGlCIn0=