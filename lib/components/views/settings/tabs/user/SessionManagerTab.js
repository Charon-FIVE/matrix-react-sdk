"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _objectWithoutProperties2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutProperties"));

var _react = _interopRequireWildcard(require("react"));

var _languageHandler = require("../../../../../languageHandler");

var _useOwnDevices = require("../../devices/useOwnDevices");

var _SettingsSubsection = _interopRequireDefault(require("../../shared/SettingsSubsection"));

var _FilteredDeviceList = require("../../devices/FilteredDeviceList");

var _CurrentDeviceSection = _interopRequireDefault(require("../../devices/CurrentDeviceSection"));

var _SecurityRecommendations = _interopRequireDefault(require("../../devices/SecurityRecommendations"));

var _SettingsTab = _interopRequireDefault(require("../SettingsTab"));

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }

function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }

const SessionManagerTab = () => {
  const {
    devices,
    currentDeviceId,
    isLoading
  } = (0, _useOwnDevices.useOwnDevices)();
  const [filter, setFilter] = (0, _react.useState)();
  const [expandedDeviceIds, setExpandedDeviceIds] = (0, _react.useState)([]);
  const filteredDeviceListRef = (0, _react.useRef)(null);
  const scrollIntoViewTimeoutRef = (0, _react.useRef)();

  const onDeviceExpandToggle = deviceId => {
    if (expandedDeviceIds.includes(deviceId)) {
      setExpandedDeviceIds(expandedDeviceIds.filter(id => id !== deviceId));
    } else {
      setExpandedDeviceIds([...expandedDeviceIds, deviceId]);
    }
  };

  const onGoToFilteredList = filter => {
    setFilter(filter); // @TODO(kerrya) clear selection when added in PSG-659

    clearTimeout(scrollIntoViewTimeoutRef.current); // wait a tick for the filtered section to rerender with different height

    scrollIntoViewTimeoutRef.current = window.setTimeout(() => filteredDeviceListRef.current?.scrollIntoView({
      // align element to top of scrollbox
      block: 'start',
      inline: 'nearest',
      behavior: 'smooth'
    }));
  };

  const {
    [currentDeviceId]: currentDevice
  } = devices,
        otherDevices = (0, _objectWithoutProperties2.default)(devices, [currentDeviceId].map(_toPropertyKey));
  const shouldShowOtherSessions = Object.keys(otherDevices).length > 0;
  (0, _react.useEffect)(() => () => {
    clearTimeout(scrollIntoViewTimeoutRef.current);
  }, [scrollIntoViewTimeoutRef]);
  return /*#__PURE__*/_react.default.createElement(_SettingsTab.default, {
    heading: (0, _languageHandler._t)('Sessions')
  }, /*#__PURE__*/_react.default.createElement(_SecurityRecommendations.default, {
    devices: devices,
    goToFilteredList: onGoToFilteredList,
    currentDeviceId: currentDeviceId
  }), /*#__PURE__*/_react.default.createElement(_CurrentDeviceSection.default, {
    device: currentDevice,
    isLoading: isLoading
  }), shouldShowOtherSessions && /*#__PURE__*/_react.default.createElement(_SettingsSubsection.default, {
    heading: (0, _languageHandler._t)('Other sessions'),
    description: (0, _languageHandler._t)(`For best security, verify your sessions and sign out ` + `from any session that you don't recognize or use anymore.`),
    "data-testid": "other-sessions-section"
  }, /*#__PURE__*/_react.default.createElement(_FilteredDeviceList.FilteredDeviceList, {
    devices: otherDevices,
    filter: filter,
    expandedDeviceIds: expandedDeviceIds,
    onFilterChange: setFilter,
    onDeviceExpandToggle: onDeviceExpandToggle,
    ref: filteredDeviceListRef
  })));
};

var _default = SessionManagerTab;
exports.default = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJTZXNzaW9uTWFuYWdlclRhYiIsImRldmljZXMiLCJjdXJyZW50RGV2aWNlSWQiLCJpc0xvYWRpbmciLCJ1c2VPd25EZXZpY2VzIiwiZmlsdGVyIiwic2V0RmlsdGVyIiwidXNlU3RhdGUiLCJleHBhbmRlZERldmljZUlkcyIsInNldEV4cGFuZGVkRGV2aWNlSWRzIiwiZmlsdGVyZWREZXZpY2VMaXN0UmVmIiwidXNlUmVmIiwic2Nyb2xsSW50b1ZpZXdUaW1lb3V0UmVmIiwib25EZXZpY2VFeHBhbmRUb2dnbGUiLCJkZXZpY2VJZCIsImluY2x1ZGVzIiwiaWQiLCJvbkdvVG9GaWx0ZXJlZExpc3QiLCJjbGVhclRpbWVvdXQiLCJjdXJyZW50Iiwid2luZG93Iiwic2V0VGltZW91dCIsInNjcm9sbEludG9WaWV3IiwiYmxvY2siLCJpbmxpbmUiLCJiZWhhdmlvciIsImN1cnJlbnREZXZpY2UiLCJvdGhlckRldmljZXMiLCJzaG91bGRTaG93T3RoZXJTZXNzaW9ucyIsIk9iamVjdCIsImtleXMiLCJsZW5ndGgiLCJ1c2VFZmZlY3QiLCJfdCJdLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL3NldHRpbmdzL3RhYnMvdXNlci9TZXNzaW9uTWFuYWdlclRhYi50c3giXSwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAyMDIyIFRoZSBNYXRyaXgub3JnIEZvdW5kYXRpb24gQy5JLkMuXG5cbkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG55b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cblxuaW1wb3J0IFJlYWN0LCB7IHVzZUVmZmVjdCwgdXNlUmVmLCB1c2VTdGF0ZSB9IGZyb20gJ3JlYWN0JztcblxuaW1wb3J0IHsgX3QgfSBmcm9tIFwiLi4vLi4vLi4vLi4vLi4vbGFuZ3VhZ2VIYW5kbGVyXCI7XG5pbXBvcnQgeyB1c2VPd25EZXZpY2VzIH0gZnJvbSAnLi4vLi4vZGV2aWNlcy91c2VPd25EZXZpY2VzJztcbmltcG9ydCBTZXR0aW5nc1N1YnNlY3Rpb24gZnJvbSAnLi4vLi4vc2hhcmVkL1NldHRpbmdzU3Vic2VjdGlvbic7XG5pbXBvcnQgeyBGaWx0ZXJlZERldmljZUxpc3QgfSBmcm9tICcuLi8uLi9kZXZpY2VzL0ZpbHRlcmVkRGV2aWNlTGlzdCc7XG5pbXBvcnQgQ3VycmVudERldmljZVNlY3Rpb24gZnJvbSAnLi4vLi4vZGV2aWNlcy9DdXJyZW50RGV2aWNlU2VjdGlvbic7XG5pbXBvcnQgU2VjdXJpdHlSZWNvbW1lbmRhdGlvbnMgZnJvbSAnLi4vLi4vZGV2aWNlcy9TZWN1cml0eVJlY29tbWVuZGF0aW9ucyc7XG5pbXBvcnQgeyBEZXZpY2VTZWN1cml0eVZhcmlhdGlvbiwgRGV2aWNlV2l0aFZlcmlmaWNhdGlvbiB9IGZyb20gJy4uLy4uL2RldmljZXMvdHlwZXMnO1xuaW1wb3J0IFNldHRpbmdzVGFiIGZyb20gJy4uL1NldHRpbmdzVGFiJztcblxuY29uc3QgU2Vzc2lvbk1hbmFnZXJUYWI6IFJlYWN0LkZDID0gKCkgPT4ge1xuICAgIGNvbnN0IHsgZGV2aWNlcywgY3VycmVudERldmljZUlkLCBpc0xvYWRpbmcgfSA9IHVzZU93bkRldmljZXMoKTtcbiAgICBjb25zdCBbZmlsdGVyLCBzZXRGaWx0ZXJdID0gdXNlU3RhdGU8RGV2aWNlU2VjdXJpdHlWYXJpYXRpb24+KCk7XG4gICAgY29uc3QgW2V4cGFuZGVkRGV2aWNlSWRzLCBzZXRFeHBhbmRlZERldmljZUlkc10gPSB1c2VTdGF0ZTxEZXZpY2VXaXRoVmVyaWZpY2F0aW9uWydkZXZpY2VfaWQnXVtdPihbXSk7XG4gICAgY29uc3QgZmlsdGVyZWREZXZpY2VMaXN0UmVmID0gdXNlUmVmPEhUTUxEaXZFbGVtZW50PihudWxsKTtcbiAgICBjb25zdCBzY3JvbGxJbnRvVmlld1RpbWVvdXRSZWYgPSB1c2VSZWY8UmV0dXJuVHlwZTx0eXBlb2Ygc2V0VGltZW91dD4+KCk7XG5cbiAgICBjb25zdCBvbkRldmljZUV4cGFuZFRvZ2dsZSA9IChkZXZpY2VJZDogRGV2aWNlV2l0aFZlcmlmaWNhdGlvblsnZGV2aWNlX2lkJ10pOiB2b2lkID0+IHtcbiAgICAgICAgaWYgKGV4cGFuZGVkRGV2aWNlSWRzLmluY2x1ZGVzKGRldmljZUlkKSkge1xuICAgICAgICAgICAgc2V0RXhwYW5kZWREZXZpY2VJZHMoZXhwYW5kZWREZXZpY2VJZHMuZmlsdGVyKGlkID0+IGlkICE9PSBkZXZpY2VJZCkpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgc2V0RXhwYW5kZWREZXZpY2VJZHMoWy4uLmV4cGFuZGVkRGV2aWNlSWRzLCBkZXZpY2VJZF0pO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIGNvbnN0IG9uR29Ub0ZpbHRlcmVkTGlzdCA9IChmaWx0ZXI6IERldmljZVNlY3VyaXR5VmFyaWF0aW9uKSA9PiB7XG4gICAgICAgIHNldEZpbHRlcihmaWx0ZXIpO1xuICAgICAgICAvLyBAVE9ETyhrZXJyeWEpIGNsZWFyIHNlbGVjdGlvbiB3aGVuIGFkZGVkIGluIFBTRy02NTlcbiAgICAgICAgY2xlYXJUaW1lb3V0KHNjcm9sbEludG9WaWV3VGltZW91dFJlZi5jdXJyZW50KTtcbiAgICAgICAgLy8gd2FpdCBhIHRpY2sgZm9yIHRoZSBmaWx0ZXJlZCBzZWN0aW9uIHRvIHJlcmVuZGVyIHdpdGggZGlmZmVyZW50IGhlaWdodFxuICAgICAgICBzY3JvbGxJbnRvVmlld1RpbWVvdXRSZWYuY3VycmVudCA9XG4gICAgICAgICAgICB3aW5kb3cuc2V0VGltZW91dCgoKSA9PiBmaWx0ZXJlZERldmljZUxpc3RSZWYuY3VycmVudD8uc2Nyb2xsSW50b1ZpZXcoe1xuICAgICAgICAgICAgICAgIC8vIGFsaWduIGVsZW1lbnQgdG8gdG9wIG9mIHNjcm9sbGJveFxuICAgICAgICAgICAgICAgIGJsb2NrOiAnc3RhcnQnLFxuICAgICAgICAgICAgICAgIGlubGluZTogJ25lYXJlc3QnLFxuICAgICAgICAgICAgICAgIGJlaGF2aW9yOiAnc21vb3RoJyxcbiAgICAgICAgICAgIH0pKTtcbiAgICB9O1xuXG4gICAgY29uc3QgeyBbY3VycmVudERldmljZUlkXTogY3VycmVudERldmljZSwgLi4ub3RoZXJEZXZpY2VzIH0gPSBkZXZpY2VzO1xuICAgIGNvbnN0IHNob3VsZFNob3dPdGhlclNlc3Npb25zID0gT2JqZWN0LmtleXMob3RoZXJEZXZpY2VzKS5sZW5ndGggPiAwO1xuXG4gICAgdXNlRWZmZWN0KCgpID0+ICgpID0+IHtcbiAgICAgICAgY2xlYXJUaW1lb3V0KHNjcm9sbEludG9WaWV3VGltZW91dFJlZi5jdXJyZW50KTtcbiAgICB9LCBbc2Nyb2xsSW50b1ZpZXdUaW1lb3V0UmVmXSk7XG5cbiAgICByZXR1cm4gPFNldHRpbmdzVGFiIGhlYWRpbmc9e190KCdTZXNzaW9ucycpfT5cbiAgICAgICAgPFNlY3VyaXR5UmVjb21tZW5kYXRpb25zXG4gICAgICAgICAgICBkZXZpY2VzPXtkZXZpY2VzfVxuICAgICAgICAgICAgZ29Ub0ZpbHRlcmVkTGlzdD17b25Hb1RvRmlsdGVyZWRMaXN0fVxuICAgICAgICAgICAgY3VycmVudERldmljZUlkPXtjdXJyZW50RGV2aWNlSWR9XG4gICAgICAgIC8+XG4gICAgICAgIDxDdXJyZW50RGV2aWNlU2VjdGlvblxuICAgICAgICAgICAgZGV2aWNlPXtjdXJyZW50RGV2aWNlfVxuICAgICAgICAgICAgaXNMb2FkaW5nPXtpc0xvYWRpbmd9XG4gICAgICAgIC8+XG4gICAgICAgIHtcbiAgICAgICAgICAgIHNob3VsZFNob3dPdGhlclNlc3Npb25zICYmXG4gICAgICAgICAgICA8U2V0dGluZ3NTdWJzZWN0aW9uXG4gICAgICAgICAgICAgICAgaGVhZGluZz17X3QoJ090aGVyIHNlc3Npb25zJyl9XG4gICAgICAgICAgICAgICAgZGVzY3JpcHRpb249e190KFxuICAgICAgICAgICAgICAgICAgICBgRm9yIGJlc3Qgc2VjdXJpdHksIHZlcmlmeSB5b3VyIHNlc3Npb25zIGFuZCBzaWduIG91dCBgICtcbiAgICAgICAgICAgICAgICAgICAgYGZyb20gYW55IHNlc3Npb24gdGhhdCB5b3UgZG9uJ3QgcmVjb2duaXplIG9yIHVzZSBhbnltb3JlLmAsXG4gICAgICAgICAgICAgICAgKX1cbiAgICAgICAgICAgICAgICBkYXRhLXRlc3RpZD0nb3RoZXItc2Vzc2lvbnMtc2VjdGlvbidcbiAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICA8RmlsdGVyZWREZXZpY2VMaXN0XG4gICAgICAgICAgICAgICAgICAgIGRldmljZXM9e290aGVyRGV2aWNlc31cbiAgICAgICAgICAgICAgICAgICAgZmlsdGVyPXtmaWx0ZXJ9XG4gICAgICAgICAgICAgICAgICAgIGV4cGFuZGVkRGV2aWNlSWRzPXtleHBhbmRlZERldmljZUlkc31cbiAgICAgICAgICAgICAgICAgICAgb25GaWx0ZXJDaGFuZ2U9e3NldEZpbHRlcn1cbiAgICAgICAgICAgICAgICAgICAgb25EZXZpY2VFeHBhbmRUb2dnbGU9e29uRGV2aWNlRXhwYW5kVG9nZ2xlfVxuICAgICAgICAgICAgICAgICAgICByZWY9e2ZpbHRlcmVkRGV2aWNlTGlzdFJlZn1cbiAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgPC9TZXR0aW5nc1N1YnNlY3Rpb24+XG4gICAgICAgIH1cbiAgICA8L1NldHRpbmdzVGFiPjtcbn07XG5cbmV4cG9ydCBkZWZhdWx0IFNlc3Npb25NYW5hZ2VyVGFiO1xuIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQWdCQTs7QUFFQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFFQTs7Ozs7Ozs7OztBQUVBLE1BQU1BLGlCQUEyQixHQUFHLE1BQU07RUFDdEMsTUFBTTtJQUFFQyxPQUFGO0lBQVdDLGVBQVg7SUFBNEJDO0VBQTVCLElBQTBDLElBQUFDLDRCQUFBLEdBQWhEO0VBQ0EsTUFBTSxDQUFDQyxNQUFELEVBQVNDLFNBQVQsSUFBc0IsSUFBQUMsZUFBQSxHQUE1QjtFQUNBLE1BQU0sQ0FBQ0MsaUJBQUQsRUFBb0JDLG9CQUFwQixJQUE0QyxJQUFBRixlQUFBLEVBQWdELEVBQWhELENBQWxEO0VBQ0EsTUFBTUcscUJBQXFCLEdBQUcsSUFBQUMsYUFBQSxFQUF1QixJQUF2QixDQUE5QjtFQUNBLE1BQU1DLHdCQUF3QixHQUFHLElBQUFELGFBQUEsR0FBakM7O0VBRUEsTUFBTUUsb0JBQW9CLEdBQUlDLFFBQUQsSUFBeUQ7SUFDbEYsSUFBSU4saUJBQWlCLENBQUNPLFFBQWxCLENBQTJCRCxRQUEzQixDQUFKLEVBQTBDO01BQ3RDTCxvQkFBb0IsQ0FBQ0QsaUJBQWlCLENBQUNILE1BQWxCLENBQXlCVyxFQUFFLElBQUlBLEVBQUUsS0FBS0YsUUFBdEMsQ0FBRCxDQUFwQjtJQUNILENBRkQsTUFFTztNQUNITCxvQkFBb0IsQ0FBQyxDQUFDLEdBQUdELGlCQUFKLEVBQXVCTSxRQUF2QixDQUFELENBQXBCO0lBQ0g7RUFDSixDQU5EOztFQVFBLE1BQU1HLGtCQUFrQixHQUFJWixNQUFELElBQXFDO0lBQzVEQyxTQUFTLENBQUNELE1BQUQsQ0FBVCxDQUQ0RCxDQUU1RDs7SUFDQWEsWUFBWSxDQUFDTix3QkFBd0IsQ0FBQ08sT0FBMUIsQ0FBWixDQUg0RCxDQUk1RDs7SUFDQVAsd0JBQXdCLENBQUNPLE9BQXpCLEdBQ0lDLE1BQU0sQ0FBQ0MsVUFBUCxDQUFrQixNQUFNWCxxQkFBcUIsQ0FBQ1MsT0FBdEIsRUFBK0JHLGNBQS9CLENBQThDO01BQ2xFO01BQ0FDLEtBQUssRUFBRSxPQUYyRDtNQUdsRUMsTUFBTSxFQUFFLFNBSDBEO01BSWxFQyxRQUFRLEVBQUU7SUFKd0QsQ0FBOUMsQ0FBeEIsQ0FESjtFQU9ILENBWkQ7O0VBY0EsTUFBTTtJQUFFLENBQUN2QixlQUFELEdBQW1Cd0I7RUFBckIsSUFBd0R6QixPQUE5RDtFQUFBLE1BQTZDMEIsWUFBN0MsMENBQThEMUIsT0FBOUQsR0FBU0MsZUFBVDtFQUNBLE1BQU0wQix1QkFBdUIsR0FBR0MsTUFBTSxDQUFDQyxJQUFQLENBQVlILFlBQVosRUFBMEJJLE1BQTFCLEdBQW1DLENBQW5FO0VBRUEsSUFBQUMsZ0JBQUEsRUFBVSxNQUFNLE1BQU07SUFDbEJkLFlBQVksQ0FBQ04sd0JBQXdCLENBQUNPLE9BQTFCLENBQVo7RUFDSCxDQUZELEVBRUcsQ0FBQ1Asd0JBQUQsQ0FGSDtFQUlBLG9CQUFPLDZCQUFDLG9CQUFEO0lBQWEsT0FBTyxFQUFFLElBQUFxQixtQkFBQSxFQUFHLFVBQUg7RUFBdEIsZ0JBQ0gsNkJBQUMsZ0NBQUQ7SUFDSSxPQUFPLEVBQUVoQyxPQURiO0lBRUksZ0JBQWdCLEVBQUVnQixrQkFGdEI7SUFHSSxlQUFlLEVBQUVmO0VBSHJCLEVBREcsZUFNSCw2QkFBQyw2QkFBRDtJQUNJLE1BQU0sRUFBRXdCLGFBRFo7SUFFSSxTQUFTLEVBQUV2QjtFQUZmLEVBTkcsRUFXQ3lCLHVCQUF1QixpQkFDdkIsNkJBQUMsMkJBQUQ7SUFDSSxPQUFPLEVBQUUsSUFBQUssbUJBQUEsRUFBRyxnQkFBSCxDQURiO0lBRUksV0FBVyxFQUFFLElBQUFBLG1CQUFBLEVBQ1IsdURBQUQsR0FDQywyREFGUSxDQUZqQjtJQU1JLGVBQVk7RUFOaEIsZ0JBUUksNkJBQUMsc0NBQUQ7SUFDSSxPQUFPLEVBQUVOLFlBRGI7SUFFSSxNQUFNLEVBQUV0QixNQUZaO0lBR0ksaUJBQWlCLEVBQUVHLGlCQUh2QjtJQUlJLGNBQWMsRUFBRUYsU0FKcEI7SUFLSSxvQkFBb0IsRUFBRU8sb0JBTDFCO0lBTUksR0FBRyxFQUFFSDtFQU5ULEVBUkosQ0FaRCxDQUFQO0FBK0JILENBbkVEOztlQXFFZVYsaUIifQ==