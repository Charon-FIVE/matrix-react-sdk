"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.defaultDispatcher = exports.default = exports.MatrixDispatcher = void 0;

var _flux = require("flux");

var _payloads = require("./payloads");

/*
Copyright 2015, 2016 OpenMarket Ltd
Copyright 2017 New Vector Ltd
Copyright 2020 The Matrix.org Foundation C.I.C.

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

/**
 * A dispatcher for ActionPayloads (the default within the SDK).
 */
class MatrixDispatcher extends _flux.Dispatcher {
  /**
   * Dispatches an event on the dispatcher's event bus.
   * @param {ActionPayload} payload Required. The payload to dispatch.
   * @param {boolean=false} sync Optional. Pass true to dispatch
   *        synchronously. This is useful for anything triggering
   *        an operation that the browser requires user interaction
   *        for. Default false (async).
   */
  dispatch(payload) {
    let sync = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

    if (payload instanceof _payloads.AsyncActionPayload) {
      payload.fn(action => {
        this.dispatch(action, sync);
      });
      return;
    }

    if (sync) {
      super.dispatch(payload);
    } else {
      // Unless the caller explicitly asked for us to dispatch synchronously,
      // we always set a timeout to do this: The flux dispatcher complains
      // if you dispatch from within a dispatch, so rather than action
      // handlers having to worry about not calling anything that might
      // then dispatch, we just do dispatches asynchronously.
      setTimeout(super.dispatch.bind(this, payload), 0);
    }
  }
  /**
   * Shorthand for dispatch({action: Action.WHATEVER}, sync). No additional
   * properties can be included with this version.
   * @param {Action} action The action to dispatch.
   * @param {boolean=false} sync Whether the dispatch should be sync or not.
   * @see dispatch(action: ActionPayload, sync: boolean)
   */


  fire(action) {
    let sync = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
    this.dispatch({
      action
    }, sync);
  }

}

exports.MatrixDispatcher = MatrixDispatcher;
const defaultDispatcher = new MatrixDispatcher();
exports.defaultDispatcher = defaultDispatcher;

if (!window.mxDispatcher) {
  window.mxDispatcher = defaultDispatcher;
}

var _default = defaultDispatcher;
exports.default = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJNYXRyaXhEaXNwYXRjaGVyIiwiRGlzcGF0Y2hlciIsImRpc3BhdGNoIiwicGF5bG9hZCIsInN5bmMiLCJBc3luY0FjdGlvblBheWxvYWQiLCJmbiIsImFjdGlvbiIsInNldFRpbWVvdXQiLCJiaW5kIiwiZmlyZSIsImRlZmF1bHREaXNwYXRjaGVyIiwid2luZG93IiwibXhEaXNwYXRjaGVyIl0sInNvdXJjZXMiOlsiLi4vLi4vc3JjL2Rpc3BhdGNoZXIvZGlzcGF0Y2hlci50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMTUsIDIwMTYgT3Blbk1hcmtldCBMdGRcbkNvcHlyaWdodCAyMDE3IE5ldyBWZWN0b3IgTHRkXG5Db3B5cmlnaHQgMjAyMCBUaGUgTWF0cml4Lm9yZyBGb3VuZGF0aW9uIEMuSS5DLlxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbmltcG9ydCB7IERpc3BhdGNoZXIgfSBmcm9tIFwiZmx1eFwiO1xuXG5pbXBvcnQgeyBBY3Rpb24gfSBmcm9tIFwiLi9hY3Rpb25zXCI7XG5pbXBvcnQgeyBBY3Rpb25QYXlsb2FkLCBBc3luY0FjdGlvblBheWxvYWQgfSBmcm9tIFwiLi9wYXlsb2Fkc1wiO1xuXG4vKipcbiAqIEEgZGlzcGF0Y2hlciBmb3IgQWN0aW9uUGF5bG9hZHMgKHRoZSBkZWZhdWx0IHdpdGhpbiB0aGUgU0RLKS5cbiAqL1xuZXhwb3J0IGNsYXNzIE1hdHJpeERpc3BhdGNoZXIgZXh0ZW5kcyBEaXNwYXRjaGVyPEFjdGlvblBheWxvYWQ+IHtcbiAgICAvKipcbiAgICAgKiBEaXNwYXRjaGVzIGFuIGV2ZW50IG9uIHRoZSBkaXNwYXRjaGVyJ3MgZXZlbnQgYnVzLlxuICAgICAqIEBwYXJhbSB7QWN0aW9uUGF5bG9hZH0gcGF5bG9hZCBSZXF1aXJlZC4gVGhlIHBheWxvYWQgdG8gZGlzcGF0Y2guXG4gICAgICogQHBhcmFtIHtib29sZWFuPWZhbHNlfSBzeW5jIE9wdGlvbmFsLiBQYXNzIHRydWUgdG8gZGlzcGF0Y2hcbiAgICAgKiAgICAgICAgc3luY2hyb25vdXNseS4gVGhpcyBpcyB1c2VmdWwgZm9yIGFueXRoaW5nIHRyaWdnZXJpbmdcbiAgICAgKiAgICAgICAgYW4gb3BlcmF0aW9uIHRoYXQgdGhlIGJyb3dzZXIgcmVxdWlyZXMgdXNlciBpbnRlcmFjdGlvblxuICAgICAqICAgICAgICBmb3IuIERlZmF1bHQgZmFsc2UgKGFzeW5jKS5cbiAgICAgKi9cbiAgICBkaXNwYXRjaDxUIGV4dGVuZHMgQWN0aW9uUGF5bG9hZD4ocGF5bG9hZDogVCwgc3luYyA9IGZhbHNlKSB7XG4gICAgICAgIGlmIChwYXlsb2FkIGluc3RhbmNlb2YgQXN5bmNBY3Rpb25QYXlsb2FkKSB7XG4gICAgICAgICAgICBwYXlsb2FkLmZuKChhY3Rpb246IEFjdGlvblBheWxvYWQpID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLmRpc3BhdGNoKGFjdGlvbiwgc3luYyk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChzeW5jKSB7XG4gICAgICAgICAgICBzdXBlci5kaXNwYXRjaChwYXlsb2FkKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIFVubGVzcyB0aGUgY2FsbGVyIGV4cGxpY2l0bHkgYXNrZWQgZm9yIHVzIHRvIGRpc3BhdGNoIHN5bmNocm9ub3VzbHksXG4gICAgICAgICAgICAvLyB3ZSBhbHdheXMgc2V0IGEgdGltZW91dCB0byBkbyB0aGlzOiBUaGUgZmx1eCBkaXNwYXRjaGVyIGNvbXBsYWluc1xuICAgICAgICAgICAgLy8gaWYgeW91IGRpc3BhdGNoIGZyb20gd2l0aGluIGEgZGlzcGF0Y2gsIHNvIHJhdGhlciB0aGFuIGFjdGlvblxuICAgICAgICAgICAgLy8gaGFuZGxlcnMgaGF2aW5nIHRvIHdvcnJ5IGFib3V0IG5vdCBjYWxsaW5nIGFueXRoaW5nIHRoYXQgbWlnaHRcbiAgICAgICAgICAgIC8vIHRoZW4gZGlzcGF0Y2gsIHdlIGp1c3QgZG8gZGlzcGF0Y2hlcyBhc3luY2hyb25vdXNseS5cbiAgICAgICAgICAgIHNldFRpbWVvdXQoc3VwZXIuZGlzcGF0Y2guYmluZCh0aGlzLCBwYXlsb2FkKSwgMCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBTaG9ydGhhbmQgZm9yIGRpc3BhdGNoKHthY3Rpb246IEFjdGlvbi5XSEFURVZFUn0sIHN5bmMpLiBObyBhZGRpdGlvbmFsXG4gICAgICogcHJvcGVydGllcyBjYW4gYmUgaW5jbHVkZWQgd2l0aCB0aGlzIHZlcnNpb24uXG4gICAgICogQHBhcmFtIHtBY3Rpb259IGFjdGlvbiBUaGUgYWN0aW9uIHRvIGRpc3BhdGNoLlxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbj1mYWxzZX0gc3luYyBXaGV0aGVyIHRoZSBkaXNwYXRjaCBzaG91bGQgYmUgc3luYyBvciBub3QuXG4gICAgICogQHNlZSBkaXNwYXRjaChhY3Rpb246IEFjdGlvblBheWxvYWQsIHN5bmM6IGJvb2xlYW4pXG4gICAgICovXG4gICAgZmlyZShhY3Rpb246IEFjdGlvbiwgc3luYyA9IGZhbHNlKSB7XG4gICAgICAgIHRoaXMuZGlzcGF0Y2goeyBhY3Rpb24gfSwgc3luYyk7XG4gICAgfVxufVxuXG5leHBvcnQgY29uc3QgZGVmYXVsdERpc3BhdGNoZXIgPSBuZXcgTWF0cml4RGlzcGF0Y2hlcigpO1xuXG5pZiAoIXdpbmRvdy5teERpc3BhdGNoZXIpIHtcbiAgICB3aW5kb3cubXhEaXNwYXRjaGVyID0gZGVmYXVsdERpc3BhdGNoZXI7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGRlZmF1bHREaXNwYXRjaGVyO1xuIl0sIm1hcHBpbmdzIjoiOzs7Ozs7O0FBa0JBOztBQUdBOztBQXJCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQU9BO0FBQ0E7QUFDQTtBQUNPLE1BQU1BLGdCQUFOLFNBQStCQyxnQkFBL0IsQ0FBeUQ7RUFDNUQ7QUFDSjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNJQyxRQUFRLENBQTBCQyxPQUExQixFQUFvRDtJQUFBLElBQWRDLElBQWMsdUVBQVAsS0FBTzs7SUFDeEQsSUFBSUQsT0FBTyxZQUFZRSw0QkFBdkIsRUFBMkM7TUFDdkNGLE9BQU8sQ0FBQ0csRUFBUixDQUFZQyxNQUFELElBQTJCO1FBQ2xDLEtBQUtMLFFBQUwsQ0FBY0ssTUFBZCxFQUFzQkgsSUFBdEI7TUFDSCxDQUZEO01BR0E7SUFDSDs7SUFFRCxJQUFJQSxJQUFKLEVBQVU7TUFDTixNQUFNRixRQUFOLENBQWVDLE9BQWY7SUFDSCxDQUZELE1BRU87TUFDSDtNQUNBO01BQ0E7TUFDQTtNQUNBO01BQ0FLLFVBQVUsQ0FBQyxNQUFNTixRQUFOLENBQWVPLElBQWYsQ0FBb0IsSUFBcEIsRUFBMEJOLE9BQTFCLENBQUQsRUFBcUMsQ0FBckMsQ0FBVjtJQUNIO0VBQ0o7RUFFRDtBQUNKO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0VBQ0lPLElBQUksQ0FBQ0gsTUFBRCxFQUErQjtJQUFBLElBQWRILElBQWMsdUVBQVAsS0FBTztJQUMvQixLQUFLRixRQUFMLENBQWM7TUFBRUs7SUFBRixDQUFkLEVBQTBCSCxJQUExQjtFQUNIOztBQXRDMkQ7OztBQXlDekQsTUFBTU8saUJBQWlCLEdBQUcsSUFBSVgsZ0JBQUosRUFBMUI7OztBQUVQLElBQUksQ0FBQ1ksTUFBTSxDQUFDQyxZQUFaLEVBQTBCO0VBQ3RCRCxNQUFNLENBQUNDLFlBQVAsR0FBc0JGLGlCQUF0QjtBQUNIOztlQUVjQSxpQiJ9