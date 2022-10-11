"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _react = _interopRequireDefault(require("react"));

var _DateUtils = require("../../../../DateUtils");

var _languageHandler = require("../../../../languageHandler");

var _Heading = _interopRequireDefault(require("../../typography/Heading"));

var _DeviceVerificationStatusCard = require("./DeviceVerificationStatusCard");

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
const DeviceDetails = _ref => {
  let {
    device
  } = _ref;
  const metadata = [{
    values: [{
      label: (0, _languageHandler._t)('Session ID'),
      value: device.device_id
    }, {
      label: (0, _languageHandler._t)('Last activity'),
      value: device.last_seen_ts && (0, _DateUtils.formatDate)(new Date(device.last_seen_ts))
    }]
  }, {
    heading: (0, _languageHandler._t)('Device'),
    values: [{
      label: (0, _languageHandler._t)('IP address'),
      value: device.last_seen_ip
    }]
  }];
  return /*#__PURE__*/_react.default.createElement("div", {
    className: "mx_DeviceDetails",
    "data-testid": `device-detail-${device.device_id}`
  }, /*#__PURE__*/_react.default.createElement("section", {
    className: "mx_DeviceDetails_section"
  }, /*#__PURE__*/_react.default.createElement(_Heading.default, {
    size: "h3"
  }, device.display_name ?? device.device_id), /*#__PURE__*/_react.default.createElement(_DeviceVerificationStatusCard.DeviceVerificationStatusCard, {
    device: device
  })), /*#__PURE__*/_react.default.createElement("section", {
    className: "mx_DeviceDetails_section"
  }, /*#__PURE__*/_react.default.createElement("p", {
    className: "mx_DeviceDetails_sectionHeading"
  }, (0, _languageHandler._t)('Session details')), metadata.map((_ref2, index) => {
    let {
      heading,
      values
    } = _ref2;
    return /*#__PURE__*/_react.default.createElement("table", {
      className: "mxDeviceDetails_metadataTable",
      key: index
    }, heading && /*#__PURE__*/_react.default.createElement("thead", null, /*#__PURE__*/_react.default.createElement("tr", null, /*#__PURE__*/_react.default.createElement("th", null, heading))), /*#__PURE__*/_react.default.createElement("tbody", null, values.map(_ref3 => {
      let {
        label,
        value
      } = _ref3;
      return /*#__PURE__*/_react.default.createElement("tr", {
        key: label
      }, /*#__PURE__*/_react.default.createElement("td", {
        className: "mxDeviceDetails_metadataLabel"
      }, label), /*#__PURE__*/_react.default.createElement("td", {
        className: "mxDeviceDetails_metadataValue"
      }, value));
    })));
  })));
};

var _default = DeviceDetails;
exports.default = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJEZXZpY2VEZXRhaWxzIiwiZGV2aWNlIiwibWV0YWRhdGEiLCJ2YWx1ZXMiLCJsYWJlbCIsIl90IiwidmFsdWUiLCJkZXZpY2VfaWQiLCJsYXN0X3NlZW5fdHMiLCJmb3JtYXREYXRlIiwiRGF0ZSIsImhlYWRpbmciLCJsYXN0X3NlZW5faXAiLCJkaXNwbGF5X25hbWUiLCJtYXAiLCJpbmRleCJdLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL3NldHRpbmdzL2RldmljZXMvRGV2aWNlRGV0YWlscy50c3giXSwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAyMDIyIFRoZSBNYXRyaXgub3JnIEZvdW5kYXRpb24gQy5JLkMuXG5cbkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG55b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cblxuaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0JztcblxuaW1wb3J0IHsgZm9ybWF0RGF0ZSB9IGZyb20gJy4uLy4uLy4uLy4uL0RhdGVVdGlscyc7XG5pbXBvcnQgeyBfdCB9IGZyb20gJy4uLy4uLy4uLy4uL2xhbmd1YWdlSGFuZGxlcic7XG5pbXBvcnQgSGVhZGluZyBmcm9tICcuLi8uLi90eXBvZ3JhcGh5L0hlYWRpbmcnO1xuaW1wb3J0IHsgRGV2aWNlVmVyaWZpY2F0aW9uU3RhdHVzQ2FyZCB9IGZyb20gJy4vRGV2aWNlVmVyaWZpY2F0aW9uU3RhdHVzQ2FyZCc7XG5pbXBvcnQgeyBEZXZpY2VXaXRoVmVyaWZpY2F0aW9uIH0gZnJvbSAnLi90eXBlcyc7XG5cbmludGVyZmFjZSBQcm9wcyB7XG4gICAgZGV2aWNlOiBEZXZpY2VXaXRoVmVyaWZpY2F0aW9uO1xufVxuXG5pbnRlcmZhY2UgTWV0YWRhdGFUYWJsZSB7XG4gICAgaGVhZGluZz86IHN0cmluZztcbiAgICB2YWx1ZXM6IHsgbGFiZWw6IHN0cmluZywgdmFsdWU/OiBzdHJpbmcgfCBSZWFjdC5SZWFjdE5vZGUgfVtdO1xufVxuXG5jb25zdCBEZXZpY2VEZXRhaWxzOiBSZWFjdC5GQzxQcm9wcz4gPSAoeyBkZXZpY2UgfSkgPT4ge1xuICAgIGNvbnN0IG1ldGFkYXRhOiBNZXRhZGF0YVRhYmxlW10gPSBbXG4gICAgICAgIHtcbiAgICAgICAgICAgIHZhbHVlczogW1xuICAgICAgICAgICAgICAgIHsgbGFiZWw6IF90KCdTZXNzaW9uIElEJyksIHZhbHVlOiBkZXZpY2UuZGV2aWNlX2lkIH0sXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBsYWJlbDogX3QoJ0xhc3QgYWN0aXZpdHknKSxcbiAgICAgICAgICAgICAgICAgICAgdmFsdWU6IGRldmljZS5sYXN0X3NlZW5fdHMgJiYgZm9ybWF0RGF0ZShuZXcgRGF0ZShkZXZpY2UubGFzdF9zZWVuX3RzKSksXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIF0sXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICAgIGhlYWRpbmc6IF90KCdEZXZpY2UnKSxcbiAgICAgICAgICAgIHZhbHVlczogW1xuICAgICAgICAgICAgICAgIHsgbGFiZWw6IF90KCdJUCBhZGRyZXNzJyksIHZhbHVlOiBkZXZpY2UubGFzdF9zZWVuX2lwIH0sXG4gICAgICAgICAgICBdLFxuICAgICAgICB9LFxuICAgIF07XG4gICAgcmV0dXJuIDxkaXYgY2xhc3NOYW1lPSdteF9EZXZpY2VEZXRhaWxzJyBkYXRhLXRlc3RpZD17YGRldmljZS1kZXRhaWwtJHtkZXZpY2UuZGV2aWNlX2lkfWB9PlxuICAgICAgICA8c2VjdGlvbiBjbGFzc05hbWU9J214X0RldmljZURldGFpbHNfc2VjdGlvbic+XG4gICAgICAgICAgICA8SGVhZGluZyBzaXplPSdoMyc+eyBkZXZpY2UuZGlzcGxheV9uYW1lID8/IGRldmljZS5kZXZpY2VfaWQgfTwvSGVhZGluZz5cbiAgICAgICAgICAgIDxEZXZpY2VWZXJpZmljYXRpb25TdGF0dXNDYXJkIGRldmljZT17ZGV2aWNlfSAvPlxuICAgICAgICA8L3NlY3Rpb24+XG4gICAgICAgIDxzZWN0aW9uIGNsYXNzTmFtZT0nbXhfRGV2aWNlRGV0YWlsc19zZWN0aW9uJz5cbiAgICAgICAgICAgIDxwIGNsYXNzTmFtZT0nbXhfRGV2aWNlRGV0YWlsc19zZWN0aW9uSGVhZGluZyc+eyBfdCgnU2Vzc2lvbiBkZXRhaWxzJykgfTwvcD5cbiAgICAgICAgICAgIHsgbWV0YWRhdGEubWFwKCh7IGhlYWRpbmcsIHZhbHVlcyB9LCBpbmRleCkgPT4gPHRhYmxlXG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lPSdteERldmljZURldGFpbHNfbWV0YWRhdGFUYWJsZSdcbiAgICAgICAgICAgICAgICBrZXk9e2luZGV4fVxuICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgIHsgaGVhZGluZyAmJlxuICAgICAgICAgICAgICAgICAgICA8dGhlYWQ+XG4gICAgICAgICAgICAgICAgICAgICAgICA8dHI+PHRoPnsgaGVhZGluZyB9PC90aD48L3RyPlxuICAgICAgICAgICAgICAgICAgICA8L3RoZWFkPlxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICA8dGJvZHk+XG5cbiAgICAgICAgICAgICAgICAgICAgeyB2YWx1ZXMubWFwKCh7IGxhYmVsLCB2YWx1ZSB9KSA9PiA8dHIga2V5PXtsYWJlbH0+XG4gICAgICAgICAgICAgICAgICAgICAgICA8dGQgY2xhc3NOYW1lPSdteERldmljZURldGFpbHNfbWV0YWRhdGFMYWJlbCc+eyBsYWJlbCB9PC90ZD5cbiAgICAgICAgICAgICAgICAgICAgICAgIDx0ZCBjbGFzc05hbWU9J214RGV2aWNlRGV0YWlsc19tZXRhZGF0YVZhbHVlJz57IHZhbHVlIH08L3RkPlxuICAgICAgICAgICAgICAgICAgICA8L3RyPikgfVxuICAgICAgICAgICAgICAgIDwvdGJvZHk+XG4gICAgICAgICAgICA8L3RhYmxlPixcbiAgICAgICAgICAgICkgfVxuICAgICAgICA8L3NlY3Rpb24+XG4gICAgPC9kaXY+O1xufTtcblxuZXhwb3J0IGRlZmF1bHQgRGV2aWNlRGV0YWlscztcbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O0FBZ0JBOztBQUVBOztBQUNBOztBQUNBOztBQUNBOztBQXJCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFtQkEsTUFBTUEsYUFBOEIsR0FBRyxRQUFnQjtFQUFBLElBQWY7SUFBRUM7RUFBRixDQUFlO0VBQ25ELE1BQU1DLFFBQXlCLEdBQUcsQ0FDOUI7SUFDSUMsTUFBTSxFQUFFLENBQ0o7TUFBRUMsS0FBSyxFQUFFLElBQUFDLG1CQUFBLEVBQUcsWUFBSCxDQUFUO01BQTJCQyxLQUFLLEVBQUVMLE1BQU0sQ0FBQ007SUFBekMsQ0FESSxFQUVKO01BQ0lILEtBQUssRUFBRSxJQUFBQyxtQkFBQSxFQUFHLGVBQUgsQ0FEWDtNQUVJQyxLQUFLLEVBQUVMLE1BQU0sQ0FBQ08sWUFBUCxJQUF1QixJQUFBQyxxQkFBQSxFQUFXLElBQUlDLElBQUosQ0FBU1QsTUFBTSxDQUFDTyxZQUFoQixDQUFYO0lBRmxDLENBRkk7RUFEWixDQUQ4QixFQVU5QjtJQUNJRyxPQUFPLEVBQUUsSUFBQU4sbUJBQUEsRUFBRyxRQUFILENBRGI7SUFFSUYsTUFBTSxFQUFFLENBQ0o7TUFBRUMsS0FBSyxFQUFFLElBQUFDLG1CQUFBLEVBQUcsWUFBSCxDQUFUO01BQTJCQyxLQUFLLEVBQUVMLE1BQU0sQ0FBQ1c7SUFBekMsQ0FESTtFQUZaLENBVjhCLENBQWxDO0VBaUJBLG9CQUFPO0lBQUssU0FBUyxFQUFDLGtCQUFmO0lBQWtDLGVBQWMsaUJBQWdCWCxNQUFNLENBQUNNLFNBQVU7RUFBakYsZ0JBQ0g7SUFBUyxTQUFTLEVBQUM7RUFBbkIsZ0JBQ0ksNkJBQUMsZ0JBQUQ7SUFBUyxJQUFJLEVBQUM7RUFBZCxHQUFxQk4sTUFBTSxDQUFDWSxZQUFQLElBQXVCWixNQUFNLENBQUNNLFNBQW5ELENBREosZUFFSSw2QkFBQywwREFBRDtJQUE4QixNQUFNLEVBQUVOO0VBQXRDLEVBRkosQ0FERyxlQUtIO0lBQVMsU0FBUyxFQUFDO0VBQW5CLGdCQUNJO0lBQUcsU0FBUyxFQUFDO0VBQWIsR0FBaUQsSUFBQUksbUJBQUEsRUFBRyxpQkFBSCxDQUFqRCxDQURKLEVBRU1ILFFBQVEsQ0FBQ1ksR0FBVCxDQUFhLFFBQXNCQyxLQUF0QjtJQUFBLElBQUM7TUFBRUosT0FBRjtNQUFXUjtJQUFYLENBQUQ7SUFBQSxvQkFBZ0M7TUFDM0MsU0FBUyxFQUFDLCtCQURpQztNQUUzQyxHQUFHLEVBQUVZO0lBRnNDLEdBSXpDSixPQUFPLGlCQUNMLHlEQUNJLHNEQUFJLHlDQUFNQSxPQUFOLENBQUosQ0FESixDQUx1QyxlQVMzQyw0Q0FFTVIsTUFBTSxDQUFDVyxHQUFQLENBQVc7TUFBQSxJQUFDO1FBQUVWLEtBQUY7UUFBU0U7TUFBVCxDQUFEO01BQUEsb0JBQXNCO1FBQUksR0FBRyxFQUFFRjtNQUFULGdCQUMvQjtRQUFJLFNBQVMsRUFBQztNQUFkLEdBQWdEQSxLQUFoRCxDQUQrQixlQUUvQjtRQUFJLFNBQVMsRUFBQztNQUFkLEdBQWdERSxLQUFoRCxDQUYrQixDQUF0QjtJQUFBLENBQVgsQ0FGTixDQVQyQyxDQUFoQztFQUFBLENBQWIsQ0FGTixDQUxHLENBQVA7QUEyQkgsQ0E3Q0Q7O2VBK0NlTixhIn0=