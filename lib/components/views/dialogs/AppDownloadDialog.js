"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.AppDownloadDialog = void 0;

var _react = _interopRequireDefault(require("react"));

var _fDroid = require("../../../../res/img/badges/f-droid.svg");

var _googlePlay = require("../../../../res/img/badges/google-play.svg");

var _ios = require("../../../../res/img/badges/ios.svg");

var _languageHandler = require("../../../languageHandler");

var _SdkConfig = _interopRequireDefault(require("../../../SdkConfig"));

var _AccessibleButton = _interopRequireDefault(require("../elements/AccessibleButton"));

var _QRCode = _interopRequireDefault(require("../elements/QRCode"));

var _Heading = _interopRequireDefault(require("../typography/Heading"));

var _BaseDialog = _interopRequireDefault(require("./BaseDialog"));

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
const fallbackAppStore = "https://apps.apple.com/app/vector/id1083446067";
const fallbackGooglePlay = "https://play.google.com/store/apps/details?id=im.vector.app";
const fallbackFDroid = "https://f-droid.org/repository/browse/?fdid=im.vector.app";

const AppDownloadDialog = _ref => {
  let {
    onFinished
  } = _ref;

  const brand = _SdkConfig.default.get("brand");

  const desktopBuilds = _SdkConfig.default.getObject("desktop_builds");

  const mobileBuilds = _SdkConfig.default.getObject("mobile_builds");

  const urlAppStore = mobileBuilds?.get("ios") ?? fallbackAppStore;
  const urlAndroid = mobileBuilds?.get("android") ?? mobileBuilds?.get("fdroid") ?? fallbackGooglePlay;
  const urlGooglePlay = mobileBuilds?.get("android") ?? fallbackGooglePlay;
  const urlFDroid = mobileBuilds?.get("fdroid") ?? fallbackFDroid;
  return /*#__PURE__*/_react.default.createElement(_BaseDialog.default, {
    title: (0, _languageHandler._t)("Download %(brand)s", {
      brand
    }),
    className: "mx_AppDownloadDialog",
    fixedWidth: true,
    onFinished: onFinished
  }, desktopBuilds?.get("available") && /*#__PURE__*/_react.default.createElement("div", {
    className: "mx_AppDownloadDialog_desktop"
  }, /*#__PURE__*/_react.default.createElement(_Heading.default, {
    size: "h3"
  }, (0, _languageHandler._t)("Download %(brand)s Desktop", {
    brand
  })), /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
    kind: "primary",
    element: "a",
    href: desktopBuilds?.get("url"),
    target: "_blank",
    onClick: () => {}
  }, (0, _languageHandler._t)("Download %(brand)s Desktop", {
    brand
  }))), /*#__PURE__*/_react.default.createElement("div", {
    className: "mx_AppDownloadDialog_mobile"
  }, /*#__PURE__*/_react.default.createElement("div", {
    className: "mx_AppDownloadDialog_app"
  }, /*#__PURE__*/_react.default.createElement(_Heading.default, {
    size: "h3"
  }, (0, _languageHandler._t)("iOS")), /*#__PURE__*/_react.default.createElement(_QRCode.default, {
    data: urlAppStore,
    margin: 0,
    width: 172
  }), /*#__PURE__*/_react.default.createElement("div", {
    className: "mx_AppDownloadDialog_info"
  }, "or"), /*#__PURE__*/_react.default.createElement("div", {
    className: "mx_AppDownloadDialog_links"
  }, /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
    element: "a",
    href: urlAppStore,
    target: "_blank",
    "aria-label": (0, _languageHandler._t)("Download on the App Store"),
    onClick: () => {}
  }, /*#__PURE__*/_react.default.createElement(_ios.Icon, null)))), /*#__PURE__*/_react.default.createElement("div", {
    className: "mx_AppDownloadDialog_app"
  }, /*#__PURE__*/_react.default.createElement(_Heading.default, {
    size: "h3"
  }, (0, _languageHandler._t)("Android")), /*#__PURE__*/_react.default.createElement(_QRCode.default, {
    data: urlAndroid,
    margin: 0,
    width: 172
  }), /*#__PURE__*/_react.default.createElement("div", {
    className: "mx_AppDownloadDialog_info"
  }, "or"), /*#__PURE__*/_react.default.createElement("div", {
    className: "mx_AppDownloadDialog_links"
  }, /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
    element: "a",
    href: urlGooglePlay,
    target: "_blank",
    "aria-label": (0, _languageHandler._t)("Get it on Google Play"),
    onClick: () => {}
  }, /*#__PURE__*/_react.default.createElement(_googlePlay.Icon, null)), /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
    element: "a",
    href: urlFDroid,
    target: "_blank",
    "aria-label": (0, _languageHandler._t)("Get it on F-Droid"),
    onClick: () => {}
  }, /*#__PURE__*/_react.default.createElement(_fDroid.Icon, null))))), /*#__PURE__*/_react.default.createElement("div", {
    className: "mx_AppDownloadDialog_legal"
  }, /*#__PURE__*/_react.default.createElement("p", null, (0, _languageHandler._t)("App Store® and the Apple logo® are trademarks of Apple Inc.")), /*#__PURE__*/_react.default.createElement("p", null, (0, _languageHandler._t)("Google Play and the Google Play logo are trademarks of Google LLC."))));
};

exports.AppDownloadDialog = AppDownloadDialog;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJmYWxsYmFja0FwcFN0b3JlIiwiZmFsbGJhY2tHb29nbGVQbGF5IiwiZmFsbGJhY2tGRHJvaWQiLCJBcHBEb3dubG9hZERpYWxvZyIsIm9uRmluaXNoZWQiLCJicmFuZCIsIlNka0NvbmZpZyIsImdldCIsImRlc2t0b3BCdWlsZHMiLCJnZXRPYmplY3QiLCJtb2JpbGVCdWlsZHMiLCJ1cmxBcHBTdG9yZSIsInVybEFuZHJvaWQiLCJ1cmxHb29nbGVQbGF5IiwidXJsRkRyb2lkIiwiX3QiXSwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvY29tcG9uZW50cy92aWV3cy9kaWFsb2dzL0FwcERvd25sb2FkRGlhbG9nLnRzeCJdLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMjIgVGhlIE1hdHJpeC5vcmcgRm91bmRhdGlvbiBDLkkuQy5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQgUmVhY3QsIHsgRkMgfSBmcm9tIFwicmVhY3RcIjtcblxuaW1wb3J0IHsgSWNvbiBhcyBGRHJvaWRCYWRnZSB9IGZyb20gXCIuLi8uLi8uLi8uLi9yZXMvaW1nL2JhZGdlcy9mLWRyb2lkLnN2Z1wiO1xuaW1wb3J0IHsgSWNvbiBhcyBHb29nbGVQbGF5QmFkZ2UgfSBmcm9tIFwiLi4vLi4vLi4vLi4vcmVzL2ltZy9iYWRnZXMvZ29vZ2xlLXBsYXkuc3ZnXCI7XG5pbXBvcnQgeyBJY29uIGFzIElPU0JhZGdlIH0gZnJvbSBcIi4uLy4uLy4uLy4uL3Jlcy9pbWcvYmFkZ2VzL2lvcy5zdmdcIjtcbmltcG9ydCB7IF90IH0gZnJvbSBcIi4uLy4uLy4uL2xhbmd1YWdlSGFuZGxlclwiO1xuaW1wb3J0IFNka0NvbmZpZyBmcm9tIFwiLi4vLi4vLi4vU2RrQ29uZmlnXCI7XG5pbXBvcnQgQWNjZXNzaWJsZUJ1dHRvbiBmcm9tIFwiLi4vZWxlbWVudHMvQWNjZXNzaWJsZUJ1dHRvblwiO1xuaW1wb3J0IFFSQ29kZSBmcm9tIFwiLi4vZWxlbWVudHMvUVJDb2RlXCI7XG5pbXBvcnQgSGVhZGluZyBmcm9tIFwiLi4vdHlwb2dyYXBoeS9IZWFkaW5nXCI7XG5pbXBvcnQgQmFzZURpYWxvZyBmcm9tIFwiLi9CYXNlRGlhbG9nXCI7XG5pbXBvcnQgeyBJRGlhbG9nUHJvcHMgfSBmcm9tIFwiLi9JRGlhbG9nUHJvcHNcIjtcblxuY29uc3QgZmFsbGJhY2tBcHBTdG9yZSA9IFwiaHR0cHM6Ly9hcHBzLmFwcGxlLmNvbS9hcHAvdmVjdG9yL2lkMTA4MzQ0NjA2N1wiO1xuY29uc3QgZmFsbGJhY2tHb29nbGVQbGF5ID0gXCJodHRwczovL3BsYXkuZ29vZ2xlLmNvbS9zdG9yZS9hcHBzL2RldGFpbHM/aWQ9aW0udmVjdG9yLmFwcFwiO1xuY29uc3QgZmFsbGJhY2tGRHJvaWQgPSBcImh0dHBzOi8vZi1kcm9pZC5vcmcvcmVwb3NpdG9yeS9icm93c2UvP2ZkaWQ9aW0udmVjdG9yLmFwcFwiO1xuXG5leHBvcnQgY29uc3QgQXBwRG93bmxvYWREaWFsb2c6IEZDPElEaWFsb2dQcm9wcz4gPSAoeyBvbkZpbmlzaGVkIH06IElEaWFsb2dQcm9wcykgPT4ge1xuICAgIGNvbnN0IGJyYW5kID0gU2RrQ29uZmlnLmdldChcImJyYW5kXCIpO1xuICAgIGNvbnN0IGRlc2t0b3BCdWlsZHMgPSBTZGtDb25maWcuZ2V0T2JqZWN0KFwiZGVza3RvcF9idWlsZHNcIik7XG4gICAgY29uc3QgbW9iaWxlQnVpbGRzID0gU2RrQ29uZmlnLmdldE9iamVjdChcIm1vYmlsZV9idWlsZHNcIik7XG5cbiAgICBjb25zdCB1cmxBcHBTdG9yZSA9IG1vYmlsZUJ1aWxkcz8uZ2V0KFwiaW9zXCIpID8/IGZhbGxiYWNrQXBwU3RvcmU7XG5cbiAgICBjb25zdCB1cmxBbmRyb2lkID0gbW9iaWxlQnVpbGRzPy5nZXQoXCJhbmRyb2lkXCIpID8/IG1vYmlsZUJ1aWxkcz8uZ2V0KFwiZmRyb2lkXCIpID8/IGZhbGxiYWNrR29vZ2xlUGxheTtcbiAgICBjb25zdCB1cmxHb29nbGVQbGF5ID0gbW9iaWxlQnVpbGRzPy5nZXQoXCJhbmRyb2lkXCIpID8/IGZhbGxiYWNrR29vZ2xlUGxheTtcbiAgICBjb25zdCB1cmxGRHJvaWQgPSBtb2JpbGVCdWlsZHM/LmdldChcImZkcm9pZFwiKSA/PyBmYWxsYmFja0ZEcm9pZDtcblxuICAgIHJldHVybiAoXG4gICAgICAgIDxCYXNlRGlhbG9nXG4gICAgICAgICAgICB0aXRsZT17X3QoXCJEb3dubG9hZCAlKGJyYW5kKXNcIiwgeyBicmFuZCB9KX1cbiAgICAgICAgICAgIGNsYXNzTmFtZT1cIm14X0FwcERvd25sb2FkRGlhbG9nXCJcbiAgICAgICAgICAgIGZpeGVkV2lkdGhcbiAgICAgICAgICAgIG9uRmluaXNoZWQ9e29uRmluaXNoZWR9PlxuICAgICAgICAgICAgeyBkZXNrdG9wQnVpbGRzPy5nZXQoXCJhdmFpbGFibGVcIikgJiYgKFxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfQXBwRG93bmxvYWREaWFsb2dfZGVza3RvcFwiPlxuICAgICAgICAgICAgICAgICAgICA8SGVhZGluZyBzaXplPVwiaDNcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgIHsgX3QoXCJEb3dubG9hZCAlKGJyYW5kKXMgRGVza3RvcFwiLCB7IGJyYW5kIH0pIH1cbiAgICAgICAgICAgICAgICAgICAgPC9IZWFkaW5nPlxuICAgICAgICAgICAgICAgICAgICA8QWNjZXNzaWJsZUJ1dHRvblxuICAgICAgICAgICAgICAgICAgICAgICAga2luZD1cInByaW1hcnlcIlxuICAgICAgICAgICAgICAgICAgICAgICAgZWxlbWVudD1cImFcIlxuICAgICAgICAgICAgICAgICAgICAgICAgaHJlZj17ZGVza3RvcEJ1aWxkcz8uZ2V0KFwidXJsXCIpfVxuICAgICAgICAgICAgICAgICAgICAgICAgdGFyZ2V0PVwiX2JsYW5rXCJcbiAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHt9fT5cbiAgICAgICAgICAgICAgICAgICAgICAgIHsgX3QoXCJEb3dubG9hZCAlKGJyYW5kKXMgRGVza3RvcFwiLCB7IGJyYW5kIH0pIH1cbiAgICAgICAgICAgICAgICAgICAgPC9BY2Nlc3NpYmxlQnV0dG9uPlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgKSB9XG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X0FwcERvd25sb2FkRGlhbG9nX21vYmlsZVwiPlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfQXBwRG93bmxvYWREaWFsb2dfYXBwXCI+XG4gICAgICAgICAgICAgICAgICAgIDxIZWFkaW5nIHNpemU9XCJoM1wiPlxuICAgICAgICAgICAgICAgICAgICAgICAgeyBfdChcImlPU1wiKSB9XG4gICAgICAgICAgICAgICAgICAgIDwvSGVhZGluZz5cbiAgICAgICAgICAgICAgICAgICAgPFFSQ29kZSBkYXRhPXt1cmxBcHBTdG9yZX0gbWFyZ2luPXswfSB3aWR0aD17MTcyfSAvPlxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X0FwcERvd25sb2FkRGlhbG9nX2luZm9cIj5vcjwvZGl2PlxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X0FwcERvd25sb2FkRGlhbG9nX2xpbmtzXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICA8QWNjZXNzaWJsZUJ1dHRvblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsZW1lbnQ9XCJhXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBocmVmPXt1cmxBcHBTdG9yZX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0YXJnZXQ9XCJfYmxhbmtcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFyaWEtbGFiZWw9e190KFwiRG93bmxvYWQgb24gdGhlIEFwcCBTdG9yZVwiKX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiB7fX0+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPElPU0JhZGdlIC8+XG4gICAgICAgICAgICAgICAgICAgICAgICA8L0FjY2Vzc2libGVCdXR0b24+XG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfQXBwRG93bmxvYWREaWFsb2dfYXBwXCI+XG4gICAgICAgICAgICAgICAgICAgIDxIZWFkaW5nIHNpemU9XCJoM1wiPlxuICAgICAgICAgICAgICAgICAgICAgICAgeyBfdChcIkFuZHJvaWRcIikgfVxuICAgICAgICAgICAgICAgICAgICA8L0hlYWRpbmc+XG4gICAgICAgICAgICAgICAgICAgIDxRUkNvZGUgZGF0YT17dXJsQW5kcm9pZH0gbWFyZ2luPXswfSB3aWR0aD17MTcyfSAvPlxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X0FwcERvd25sb2FkRGlhbG9nX2luZm9cIj5vcjwvZGl2PlxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X0FwcERvd25sb2FkRGlhbG9nX2xpbmtzXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICA8QWNjZXNzaWJsZUJ1dHRvblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsZW1lbnQ9XCJhXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBocmVmPXt1cmxHb29nbGVQbGF5fVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRhcmdldD1cIl9ibGFua1wiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYXJpYS1sYWJlbD17X3QoXCJHZXQgaXQgb24gR29vZ2xlIFBsYXlcIil9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4ge319PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxHb29nbGVQbGF5QmFkZ2UgLz5cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvQWNjZXNzaWJsZUJ1dHRvbj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxBY2Nlc3NpYmxlQnV0dG9uXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxlbWVudD1cImFcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGhyZWY9e3VybEZEcm9pZH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0YXJnZXQ9XCJfYmxhbmtcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFyaWEtbGFiZWw9e190KFwiR2V0IGl0IG9uIEYtRHJvaWRcIil9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4ge319PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxGRHJvaWRCYWRnZSAvPlxuICAgICAgICAgICAgICAgICAgICAgICAgPC9BY2Nlc3NpYmxlQnV0dG9uPlxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9BcHBEb3dubG9hZERpYWxvZ19sZWdhbFwiPlxuICAgICAgICAgICAgICAgIDxwPnsgX3QoXCJBcHAgU3RvcmXCriBhbmQgdGhlIEFwcGxlIGxvZ2/CriBhcmUgdHJhZGVtYXJrcyBvZiBBcHBsZSBJbmMuXCIpIH08L3A+XG4gICAgICAgICAgICAgICAgPHA+eyBfdChcIkdvb2dsZSBQbGF5IGFuZCB0aGUgR29vZ2xlIFBsYXkgbG9nbyBhcmUgdHJhZGVtYXJrcyBvZiBHb29nbGUgTExDLlwiKSB9PC9wPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvQmFzZURpYWxvZz5cbiAgICApO1xufTtcbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O0FBZ0JBOztBQUVBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQTFCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFlQSxNQUFNQSxnQkFBZ0IsR0FBRyxnREFBekI7QUFDQSxNQUFNQyxrQkFBa0IsR0FBRyw2REFBM0I7QUFDQSxNQUFNQyxjQUFjLEdBQUcsMkRBQXZCOztBQUVPLE1BQU1DLGlCQUFtQyxHQUFHLFFBQWtDO0VBQUEsSUFBakM7SUFBRUM7RUFBRixDQUFpQzs7RUFDakYsTUFBTUMsS0FBSyxHQUFHQyxrQkFBQSxDQUFVQyxHQUFWLENBQWMsT0FBZCxDQUFkOztFQUNBLE1BQU1DLGFBQWEsR0FBR0Ysa0JBQUEsQ0FBVUcsU0FBVixDQUFvQixnQkFBcEIsQ0FBdEI7O0VBQ0EsTUFBTUMsWUFBWSxHQUFHSixrQkFBQSxDQUFVRyxTQUFWLENBQW9CLGVBQXBCLENBQXJCOztFQUVBLE1BQU1F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