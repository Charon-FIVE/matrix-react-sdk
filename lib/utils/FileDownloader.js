"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.FileDownloader = exports.DEFAULT_STYLES = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { (0, _defineProperty2.default)(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }

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
// eslint-disable-line @typescript-eslint/naming-convention
const DEFAULT_STYLES = {
  imgSrc: "",
  imgStyle: null,
  // css props
  style: "",
  textContent: ""
};
exports.DEFAULT_STYLES = DEFAULT_STYLES;
// set up the iframe as a singleton so we don't have to figure out destruction of it down the line.
let managedIframe;
let onLoadPromise;

function getManagedIframe() {
  if (managedIframe) return {
    iframe: managedIframe,
    onLoadPromise
  };
  managedIframe = document.createElement("iframe"); // Need to append the iframe in order for the browser to load it.

  document.body.appendChild(managedIframe); // Dev note: the reassignment warnings are entirely incorrect here.

  managedIframe.style.display = "none"; // @ts-ignore
  // noinspection JSConstantReassignment

  managedIframe.sandbox = "allow-scripts allow-downloads allow-downloads-without-user-activation";
  onLoadPromise = new Promise(resolve => {
    managedIframe.onload = () => {
      resolve();
    };

    managedIframe.src = "usercontent/"; // XXX: Should come from the skin
  });
  return {
    iframe: managedIframe,
    onLoadPromise
  };
} // TODO: If we decide to keep the download link behaviour, we should bring the style management into here.

/**
 * Helper to handle safe file downloads. This operates off an iframe for reasons described
 * by the blob helpers. By default, this will use a hidden iframe to manage the download
 * through a user content wrapper, but can be given an iframe reference if the caller needs
 * additional control over the styling/position of the iframe itself.
 */


class FileDownloader {
  /**
   * Creates a new file downloader
   * @param iframeFn Function to get a pre-configured iframe. Set to null to have the downloader
   * use a generic, hidden, iframe.
   */
  constructor() {
    let iframeFn = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
    this.iframeFn = iframeFn;
    (0, _defineProperty2.default)(this, "onLoadPromise", void 0);
  }

  get iframe() {
    const iframe = this.iframeFn?.();

    if (!iframe) {
      const managed = getManagedIframe();
      this.onLoadPromise = managed.onLoadPromise;
      return managed.iframe;
    }

    this.onLoadPromise = null;
    return iframe;
  }

  async download(_ref) {
    let {
      blob,
      name,
      autoDownload = true,
      opts = DEFAULT_STYLES
    } = _ref;
    const iframe = this.iframe; // get the iframe first just in case we need to await onload

    if (this.onLoadPromise) await this.onLoadPromise;
    iframe.contentWindow.postMessage(_objectSpread(_objectSpread({}, opts), {}, {
      blob: blob,
      download: name,
      auto: autoDownload
    }), '*');
  }

}

exports.FileDownloader = FileDownloader;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJERUZBVUxUX1NUWUxFUyIsImltZ1NyYyIsImltZ1N0eWxlIiwic3R5bGUiLCJ0ZXh0Q29udGVudCIsIm1hbmFnZWRJZnJhbWUiLCJvbkxvYWRQcm9taXNlIiwiZ2V0TWFuYWdlZElmcmFtZSIsImlmcmFtZSIsImRvY3VtZW50IiwiY3JlYXRlRWxlbWVudCIsImJvZHkiLCJhcHBlbmRDaGlsZCIsImRpc3BsYXkiLCJzYW5kYm94IiwiUHJvbWlzZSIsInJlc29sdmUiLCJvbmxvYWQiLCJzcmMiLCJGaWxlRG93bmxvYWRlciIsImNvbnN0cnVjdG9yIiwiaWZyYW1lRm4iLCJtYW5hZ2VkIiwiZG93bmxvYWQiLCJibG9iIiwibmFtZSIsImF1dG9Eb3dubG9hZCIsIm9wdHMiLCJjb250ZW50V2luZG93IiwicG9zdE1lc3NhZ2UiLCJhdXRvIl0sInNvdXJjZXMiOlsiLi4vLi4vc3JjL3V0aWxzL0ZpbGVEb3dubG9hZGVyLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgMjAyMSBUaGUgTWF0cml4Lm9yZyBGb3VuZGF0aW9uIEMuSS5DLlxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbmV4cG9ydCB0eXBlIGdldElmcmFtZUZuID0gKCkgPT4gSFRNTElGcmFtZUVsZW1lbnQ7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25hbWluZy1jb252ZW50aW9uXG5cbmV4cG9ydCBjb25zdCBERUZBVUxUX1NUWUxFUyA9IHtcbiAgICBpbWdTcmM6IFwiXCIsXG4gICAgaW1nU3R5bGU6IG51bGwsIC8vIGNzcyBwcm9wc1xuICAgIHN0eWxlOiBcIlwiLFxuICAgIHRleHRDb250ZW50OiBcIlwiLFxufTtcblxudHlwZSBEb3dubG9hZE9wdGlvbnMgPSB7XG4gICAgYmxvYjogQmxvYjtcbiAgICBuYW1lOiBzdHJpbmc7XG4gICAgYXV0b0Rvd25sb2FkPzogYm9vbGVhbjtcbiAgICBvcHRzPzogdHlwZW9mIERFRkFVTFRfU1RZTEVTO1xufTtcblxuLy8gc2V0IHVwIHRoZSBpZnJhbWUgYXMgYSBzaW5nbGV0b24gc28gd2UgZG9uJ3QgaGF2ZSB0byBmaWd1cmUgb3V0IGRlc3RydWN0aW9uIG9mIGl0IGRvd24gdGhlIGxpbmUuXG5sZXQgbWFuYWdlZElmcmFtZTogSFRNTElGcmFtZUVsZW1lbnQ7XG5sZXQgb25Mb2FkUHJvbWlzZTogUHJvbWlzZTx2b2lkPjtcbmZ1bmN0aW9uIGdldE1hbmFnZWRJZnJhbWUoKTogeyBpZnJhbWU6IEhUTUxJRnJhbWVFbGVtZW50LCBvbkxvYWRQcm9taXNlOiBQcm9taXNlPHZvaWQ+IH0ge1xuICAgIGlmIChtYW5hZ2VkSWZyYW1lKSByZXR1cm4geyBpZnJhbWU6IG1hbmFnZWRJZnJhbWUsIG9uTG9hZFByb21pc2UgfTtcblxuICAgIG1hbmFnZWRJZnJhbWUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiaWZyYW1lXCIpO1xuXG4gICAgLy8gTmVlZCB0byBhcHBlbmQgdGhlIGlmcmFtZSBpbiBvcmRlciBmb3IgdGhlIGJyb3dzZXIgdG8gbG9hZCBpdC5cbiAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKG1hbmFnZWRJZnJhbWUpO1xuXG4gICAgLy8gRGV2IG5vdGU6IHRoZSByZWFzc2lnbm1lbnQgd2FybmluZ3MgYXJlIGVudGlyZWx5IGluY29ycmVjdCBoZXJlLlxuXG4gICAgbWFuYWdlZElmcmFtZS5zdHlsZS5kaXNwbGF5ID0gXCJub25lXCI7XG5cbiAgICAvLyBAdHMtaWdub3JlXG4gICAgLy8gbm9pbnNwZWN0aW9uIEpTQ29uc3RhbnRSZWFzc2lnbm1lbnRcbiAgICBtYW5hZ2VkSWZyYW1lLnNhbmRib3ggPSBcImFsbG93LXNjcmlwdHMgYWxsb3ctZG93bmxvYWRzIGFsbG93LWRvd25sb2Fkcy13aXRob3V0LXVzZXItYWN0aXZhdGlvblwiO1xuXG4gICAgb25Mb2FkUHJvbWlzZSA9IG5ldyBQcm9taXNlKHJlc29sdmUgPT4ge1xuICAgICAgICBtYW5hZ2VkSWZyYW1lLm9ubG9hZCA9ICgpID0+IHtcbiAgICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgfTtcbiAgICAgICAgbWFuYWdlZElmcmFtZS5zcmMgPSBcInVzZXJjb250ZW50L1wiOyAvLyBYWFg6IFNob3VsZCBjb21lIGZyb20gdGhlIHNraW5cbiAgICB9KTtcblxuICAgIHJldHVybiB7IGlmcmFtZTogbWFuYWdlZElmcmFtZSwgb25Mb2FkUHJvbWlzZSB9O1xufVxuXG4vLyBUT0RPOiBJZiB3ZSBkZWNpZGUgdG8ga2VlcCB0aGUgZG93bmxvYWQgbGluayBiZWhhdmlvdXIsIHdlIHNob3VsZCBicmluZyB0aGUgc3R5bGUgbWFuYWdlbWVudCBpbnRvIGhlcmUuXG5cbi8qKlxuICogSGVscGVyIHRvIGhhbmRsZSBzYWZlIGZpbGUgZG93bmxvYWRzLiBUaGlzIG9wZXJhdGVzIG9mZiBhbiBpZnJhbWUgZm9yIHJlYXNvbnMgZGVzY3JpYmVkXG4gKiBieSB0aGUgYmxvYiBoZWxwZXJzLiBCeSBkZWZhdWx0LCB0aGlzIHdpbGwgdXNlIGEgaGlkZGVuIGlmcmFtZSB0byBtYW5hZ2UgdGhlIGRvd25sb2FkXG4gKiB0aHJvdWdoIGEgdXNlciBjb250ZW50IHdyYXBwZXIsIGJ1dCBjYW4gYmUgZ2l2ZW4gYW4gaWZyYW1lIHJlZmVyZW5jZSBpZiB0aGUgY2FsbGVyIG5lZWRzXG4gKiBhZGRpdGlvbmFsIGNvbnRyb2wgb3ZlciB0aGUgc3R5bGluZy9wb3NpdGlvbiBvZiB0aGUgaWZyYW1lIGl0c2VsZi5cbiAqL1xuZXhwb3J0IGNsYXNzIEZpbGVEb3dubG9hZGVyIHtcbiAgICBwcml2YXRlIG9uTG9hZFByb21pc2U6IFByb21pc2U8dm9pZD47XG5cbiAgICAvKipcbiAgICAgKiBDcmVhdGVzIGEgbmV3IGZpbGUgZG93bmxvYWRlclxuICAgICAqIEBwYXJhbSBpZnJhbWVGbiBGdW5jdGlvbiB0byBnZXQgYSBwcmUtY29uZmlndXJlZCBpZnJhbWUuIFNldCB0byBudWxsIHRvIGhhdmUgdGhlIGRvd25sb2FkZXJcbiAgICAgKiB1c2UgYSBnZW5lcmljLCBoaWRkZW4sIGlmcmFtZS5cbiAgICAgKi9cbiAgICBjb25zdHJ1Y3Rvcihwcml2YXRlIGlmcmFtZUZuOiBnZXRJZnJhbWVGbiA9IG51bGwpIHtcbiAgICB9XG5cbiAgICBwcml2YXRlIGdldCBpZnJhbWUoKTogSFRNTElGcmFtZUVsZW1lbnQge1xuICAgICAgICBjb25zdCBpZnJhbWUgPSB0aGlzLmlmcmFtZUZuPy4oKTtcbiAgICAgICAgaWYgKCFpZnJhbWUpIHtcbiAgICAgICAgICAgIGNvbnN0IG1hbmFnZWQgPSBnZXRNYW5hZ2VkSWZyYW1lKCk7XG4gICAgICAgICAgICB0aGlzLm9uTG9hZFByb21pc2UgPSBtYW5hZ2VkLm9uTG9hZFByb21pc2U7XG4gICAgICAgICAgICByZXR1cm4gbWFuYWdlZC5pZnJhbWU7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5vbkxvYWRQcm9taXNlID0gbnVsbDtcbiAgICAgICAgcmV0dXJuIGlmcmFtZTtcbiAgICB9XG5cbiAgICBwdWJsaWMgYXN5bmMgZG93bmxvYWQoeyBibG9iLCBuYW1lLCBhdXRvRG93bmxvYWQgPSB0cnVlLCBvcHRzID0gREVGQVVMVF9TVFlMRVMgfTogRG93bmxvYWRPcHRpb25zKSB7XG4gICAgICAgIGNvbnN0IGlmcmFtZSA9IHRoaXMuaWZyYW1lOyAvLyBnZXQgdGhlIGlmcmFtZSBmaXJzdCBqdXN0IGluIGNhc2Ugd2UgbmVlZCB0byBhd2FpdCBvbmxvYWRcbiAgICAgICAgaWYgKHRoaXMub25Mb2FkUHJvbWlzZSkgYXdhaXQgdGhpcy5vbkxvYWRQcm9taXNlO1xuICAgICAgICBpZnJhbWUuY29udGVudFdpbmRvdy5wb3N0TWVzc2FnZSh7XG4gICAgICAgICAgICAuLi5vcHRzLFxuICAgICAgICAgICAgYmxvYjogYmxvYixcbiAgICAgICAgICAgIGRvd25sb2FkOiBuYW1lLFxuICAgICAgICAgICAgYXV0bzogYXV0b0Rvd25sb2FkLFxuICAgICAgICB9LCAnKicpO1xuICAgIH1cbn1cbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7O0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBRW1EO0FBRTVDLE1BQU1BLGNBQWMsR0FBRztFQUMxQkMsTUFBTSxFQUFFLEVBRGtCO0VBRTFCQyxRQUFRLEVBQUUsSUFGZ0I7RUFFVjtFQUNoQkMsS0FBSyxFQUFFLEVBSG1CO0VBSTFCQyxXQUFXLEVBQUU7QUFKYSxDQUF2Qjs7QUFjUDtBQUNBLElBQUlDLGFBQUo7QUFDQSxJQUFJQyxhQUFKOztBQUNBLFNBQVNDLGdCQUFULEdBQXlGO0VBQ3JGLElBQUlGLGFBQUosRUFBbUIsT0FBTztJQUFFRyxNQUFNLEVBQUVILGFBQVY7SUFBeUJDO0VBQXpCLENBQVA7RUFFbkJELGFBQWEsR0FBR0ksUUFBUSxDQUFDQyxhQUFULENBQXVCLFFBQXZCLENBQWhCLENBSHFGLENBS3JGOztFQUNBRCxRQUFRLENBQUNFLElBQVQsQ0FBY0MsV0FBZCxDQUEwQlAsYUFBMUIsRUFOcUYsQ0FRckY7O0VBRUFBLGFBQWEsQ0FBQ0YsS0FBZCxDQUFvQlUsT0FBcEIsR0FBOEIsTUFBOUIsQ0FWcUYsQ0FZckY7RUFDQTs7RUFDQVIsYUFBYSxDQUFDUyxPQUFkLEdBQXdCLHVFQUF4QjtFQUVBUixhQUFhLEdBQUcsSUFBSVMsT0FBSixDQUFZQyxPQUFPLElBQUk7SUFDbkNYLGFBQWEsQ0FBQ1ksTUFBZCxHQUF1QixNQUFNO01BQ3pCRCxPQUFPO0lBQ1YsQ0FGRDs7SUFHQVgsYUFBYSxDQUFDYSxHQUFkLEdBQW9CLGNBQXBCLENBSm1DLENBSUM7RUFDdkMsQ0FMZSxDQUFoQjtFQU9BLE9BQU87SUFBRVYsTUFBTSxFQUFFSCxhQUFWO0lBQXlCQztFQUF6QixDQUFQO0FBQ0gsQyxDQUVEOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FBQ08sTUFBTWEsY0FBTixDQUFxQjtFQUd4QjtBQUNKO0FBQ0E7QUFDQTtBQUNBO0VBQ0lDLFdBQVcsR0FBdUM7SUFBQSxJQUE5QkMsUUFBOEIsdUVBQU4sSUFBTTtJQUFBLEtBQTlCQSxRQUE4QixHQUE5QkEsUUFBOEI7SUFBQTtFQUNqRDs7RUFFaUIsSUFBTmIsTUFBTSxHQUFzQjtJQUNwQyxNQUFNQSxNQUFNLEdBQUcsS0FBS2EsUUFBTCxJQUFmOztJQUNBLElBQUksQ0FBQ2IsTUFBTCxFQUFhO01BQ1QsTUFBTWMsT0FBTyxHQUFHZixnQkFBZ0IsRUFBaEM7TUFDQSxLQUFLRCxhQUFMLEdBQXFCZ0IsT0FBTyxDQUFDaEIsYUFBN0I7TUFDQSxPQUFPZ0IsT0FBTyxDQUFDZCxNQUFmO0lBQ0g7O0lBQ0QsS0FBS0YsYUFBTCxHQUFxQixJQUFyQjtJQUNBLE9BQU9FLE1BQVA7RUFDSDs7RUFFb0IsTUFBUmUsUUFBUSxPQUE4RTtJQUFBLElBQTdFO01BQUVDLElBQUY7TUFBUUMsSUFBUjtNQUFjQyxZQUFZLEdBQUcsSUFBN0I7TUFBbUNDLElBQUksR0FBRzNCO0lBQTFDLENBQTZFO0lBQy9GLE1BQU1RLE1BQU0sR0FBRyxLQUFLQSxNQUFwQixDQUQrRixDQUNuRTs7SUFDNUIsSUFBSSxLQUFLRixhQUFULEVBQXdCLE1BQU0sS0FBS0EsYUFBWDtJQUN4QkUsTUFBTSxDQUFDb0IsYUFBUCxDQUFxQkMsV0FBckIsaUNBQ09GLElBRFA7TUFFSUgsSUFBSSxFQUFFQSxJQUZWO01BR0lELFFBQVEsRUFBRUUsSUFIZDtNQUlJSyxJQUFJLEVBQUVKO0lBSlYsSUFLRyxHQUxIO0VBTUg7O0FBL0J1QiJ9