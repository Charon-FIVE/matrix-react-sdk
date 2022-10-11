"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));

var _react = _interopRequireDefault(require("react"));

var _InlineSpinner = _interopRequireDefault(require("../elements/InlineSpinner"));

var _languageHandler = require("../../../languageHandler");

var _RecordingPlayback = _interopRequireDefault(require("../audio_messages/RecordingPlayback"));

var _MAudioBody = _interopRequireDefault(require("./MAudioBody"));

var _MFileBody = _interopRequireDefault(require("./MFileBody"));

var _MediaProcessingError = _interopRequireDefault(require("./shared/MediaProcessingError"));

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
class MVoiceMessageBody extends _MAudioBody.default {
  // A voice message is an audio file but rendered in a special way.
  render() {
    if (this.state.error) {
      return /*#__PURE__*/_react.default.createElement(_MediaProcessingError.default, {
        className: "mx_MVoiceMessageBody"
      }, (0, _languageHandler._t)("Error processing voice message"));
    }

    if (!this.state.playback) {
      return /*#__PURE__*/_react.default.createElement("span", {
        className: "mx_MVoiceMessageBody"
      }, /*#__PURE__*/_react.default.createElement(_InlineSpinner.default, null));
    } // At this point we should have a playable state


    return /*#__PURE__*/_react.default.createElement("span", {
      className: "mx_MVoiceMessageBody"
    }, /*#__PURE__*/_react.default.createElement(_RecordingPlayback.default, {
      playback: this.state.playback
    }), this.showFileBody && /*#__PURE__*/_react.default.createElement(_MFileBody.default, (0, _extends2.default)({}, this.props, {
      showGenericPlaceholder: false
    })));
  }

}

exports.default = MVoiceMessageBody;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJNVm9pY2VNZXNzYWdlQm9keSIsIk1BdWRpb0JvZHkiLCJyZW5kZXIiLCJzdGF0ZSIsImVycm9yIiwiX3QiLCJwbGF5YmFjayIsInNob3dGaWxlQm9keSIsInByb3BzIl0sInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL2NvbXBvbmVudHMvdmlld3MvbWVzc2FnZXMvTVZvaWNlTWVzc2FnZUJvZHkudHN4Il0sInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgMjAyMSBUaGUgTWF0cml4Lm9yZyBGb3VuZGF0aW9uIEMuSS5DLlxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbmltcG9ydCBSZWFjdCBmcm9tIFwicmVhY3RcIjtcblxuaW1wb3J0IElubGluZVNwaW5uZXIgZnJvbSAnLi4vZWxlbWVudHMvSW5saW5lU3Bpbm5lcic7XG5pbXBvcnQgeyBfdCB9IGZyb20gXCIuLi8uLi8uLi9sYW5ndWFnZUhhbmRsZXJcIjtcbmltcG9ydCBSZWNvcmRpbmdQbGF5YmFjayBmcm9tIFwiLi4vYXVkaW9fbWVzc2FnZXMvUmVjb3JkaW5nUGxheWJhY2tcIjtcbmltcG9ydCBNQXVkaW9Cb2R5IGZyb20gXCIuL01BdWRpb0JvZHlcIjtcbmltcG9ydCBNRmlsZUJvZHkgZnJvbSBcIi4vTUZpbGVCb2R5XCI7XG5pbXBvcnQgTWVkaWFQcm9jZXNzaW5nRXJyb3IgZnJvbSBcIi4vc2hhcmVkL01lZGlhUHJvY2Vzc2luZ0Vycm9yXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE1Wb2ljZU1lc3NhZ2VCb2R5IGV4dGVuZHMgTUF1ZGlvQm9keSB7XG4gICAgLy8gQSB2b2ljZSBtZXNzYWdlIGlzIGFuIGF1ZGlvIGZpbGUgYnV0IHJlbmRlcmVkIGluIGEgc3BlY2lhbCB3YXkuXG4gICAgcHVibGljIHJlbmRlcigpIHtcbiAgICAgICAgaWYgKHRoaXMuc3RhdGUuZXJyb3IpIHtcbiAgICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICAgICAgPE1lZGlhUHJvY2Vzc2luZ0Vycm9yIGNsYXNzTmFtZT1cIm14X01Wb2ljZU1lc3NhZ2VCb2R5XCI+XG4gICAgICAgICAgICAgICAgICAgIHsgX3QoXCJFcnJvciBwcm9jZXNzaW5nIHZvaWNlIG1lc3NhZ2VcIikgfVxuICAgICAgICAgICAgICAgIDwvTWVkaWFQcm9jZXNzaW5nRXJyb3I+XG4gICAgICAgICAgICApO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCF0aGlzLnN0YXRlLnBsYXliYWNrKSB7XG4gICAgICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIm14X01Wb2ljZU1lc3NhZ2VCb2R5XCI+XG4gICAgICAgICAgICAgICAgICAgIDxJbmxpbmVTcGlubmVyIC8+XG4gICAgICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIEF0IHRoaXMgcG9pbnQgd2Ugc2hvdWxkIGhhdmUgYSBwbGF5YWJsZSBzdGF0ZVxuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwibXhfTVZvaWNlTWVzc2FnZUJvZHlcIj5cbiAgICAgICAgICAgICAgICA8UmVjb3JkaW5nUGxheWJhY2sgcGxheWJhY2s9e3RoaXMuc3RhdGUucGxheWJhY2t9IC8+XG4gICAgICAgICAgICAgICAgeyB0aGlzLnNob3dGaWxlQm9keSAmJiA8TUZpbGVCb2R5IHsuLi50aGlzLnByb3BzfSBzaG93R2VuZXJpY1BsYWNlaG9sZGVyPXtmYWxzZX0gLz4gfVxuICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICApO1xuICAgIH1cbn1cbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFnQkE7O0FBRUE7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBdkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQVdlLE1BQU1BLGlCQUFOLFNBQWdDQyxtQkFBaEMsQ0FBMkM7RUFDdEQ7RUFDT0MsTUFBTSxHQUFHO0lBQ1osSUFBSSxLQUFLQyxLQUFMLENBQVdDLEtBQWYsRUFBc0I7TUFDbEIsb0JBQ0ksNkJBQUMsNkJBQUQ7UUFBc0IsU0FBUyxFQUFDO01BQWhDLEdBQ00sSUFBQUMsbUJBQUEsRUFBRyxnQ0FBSCxDQUROLENBREo7SUFLSDs7SUFFRCxJQUFJLENBQUMsS0FBS0YsS0FBTCxDQUFXRyxRQUFoQixFQUEwQjtNQUN0QixvQkFDSTtRQUFNLFNBQVMsRUFBQztNQUFoQixnQkFDSSw2QkFBQyxzQkFBRCxPQURKLENBREo7SUFLSCxDQWZXLENBaUJaOzs7SUFDQSxvQkFDSTtNQUFNLFNBQVMsRUFBQztJQUFoQixnQkFDSSw2QkFBQywwQkFBRDtNQUFtQixRQUFRLEVBQUUsS0FBS0gsS0FBTCxDQUFXRztJQUF4QyxFQURKLEVBRU0sS0FBS0MsWUFBTCxpQkFBcUIsNkJBQUMsa0JBQUQsNkJBQWUsS0FBS0MsS0FBcEI7TUFBMkIsc0JBQXNCLEVBQUU7SUFBbkQsR0FGM0IsQ0FESjtFQU1IOztBQTFCcUQifQ==