"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.UPDATE_EVENT = exports.AsyncStore = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _events = require("events");

var _awaitLock = _interopRequireDefault(require("await-lock"));

/*
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
 * The event/channel to listen for in an AsyncStore.
 */
const UPDATE_EVENT = "update";
/**
 * Represents a minimal store which works similar to Flux stores. Instead
 * of everything needing to happen in a dispatch cycle, everything can
 * happen async to that cycle.
 *
 * The store operates by using Object.assign() to mutate state - it sends the
 * state objects (current and new) through the function onto a new empty
 * object. Because of this, it is recommended to break out your state to be as
 * safe as possible. The state mutations are also locked, preventing concurrent
 * writes.
 *
 * All updates to the store happen on the UPDATE_EVENT event channel with the
 * one argument being the instance of the store.
 *
 * To update the state, use updateState() and preferably await the result to
 * help prevent lock conflicts.
 */

exports.UPDATE_EVENT = UPDATE_EVENT;

class AsyncStore extends _events.EventEmitter {
  /**
   * Creates a new AsyncStore using the given dispatcher.
   * @param {Dispatcher<ActionPayload>} dispatcher The dispatcher to rely upon.
   * @param {T} initialState The initial state for the store.
   */
  constructor(dispatcher) {
    let initialState = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    super();
    this.dispatcher = dispatcher;
    (0, _defineProperty2.default)(this, "storeState", void 0);
    (0, _defineProperty2.default)(this, "lock", new _awaitLock.default());
    (0, _defineProperty2.default)(this, "dispatcherRef", void 0);
    this.dispatcherRef = dispatcher.register(this.onDispatch.bind(this));
    this.storeState = initialState;
  }
  /**
   * The current state of the store. Cannot be mutated.
   */


  get state() {
    return this.storeState;
  }
  /**
   * Stops the store's listening functions, such as the listener to the dispatcher.
   */


  stop() {
    if (this.dispatcherRef) this.dispatcher.unregister(this.dispatcherRef);
  }
  /**
   * Updates the state of the store.
   * @param {T|*} newState The state to update in the store using Object.assign()
   */


  async updateState(newState) {
    await this.lock.acquireAsync();

    try {
      this.storeState = Object.freeze(Object.assign({}, this.storeState, newState));
      this.emit(UPDATE_EVENT, this);
    } finally {
      await this.lock.release();
    }
  }
  /**
   * Resets the store's to the provided state or an empty object.
   * @param {T|*} newState The new state of the store.
   * @param {boolean} quiet If true, the function will not raise an UPDATE_EVENT.
   */


  async reset() {
    let newState = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
    let quiet = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
    await this.lock.acquireAsync();

    try {
      this.storeState = Object.freeze(newState || {});
      if (!quiet) this.emit(UPDATE_EVENT, this);
    } finally {
      await this.lock.release();
    }
  }
  /**
   * Called when the dispatcher broadcasts a dispatch event.
   * @param {ActionPayload} payload The event being dispatched.
   */


}

exports.AsyncStore = AsyncStore;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJVUERBVEVfRVZFTlQiLCJBc3luY1N0b3JlIiwiRXZlbnRFbWl0dGVyIiwiY29uc3RydWN0b3IiLCJkaXNwYXRjaGVyIiwiaW5pdGlhbFN0YXRlIiwiQXdhaXRMb2NrIiwiZGlzcGF0Y2hlclJlZiIsInJlZ2lzdGVyIiwib25EaXNwYXRjaCIsImJpbmQiLCJzdG9yZVN0YXRlIiwic3RhdGUiLCJzdG9wIiwidW5yZWdpc3RlciIsInVwZGF0ZVN0YXRlIiwibmV3U3RhdGUiLCJsb2NrIiwiYWNxdWlyZUFzeW5jIiwiT2JqZWN0IiwiZnJlZXplIiwiYXNzaWduIiwiZW1pdCIsInJlbGVhc2UiLCJyZXNldCIsInF1aWV0Il0sInNvdXJjZXMiOlsiLi4vLi4vc3JjL3N0b3Jlcy9Bc3luY1N0b3JlLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgMjAyMCBUaGUgTWF0cml4Lm9yZyBGb3VuZGF0aW9uIEMuSS5DLlxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbmltcG9ydCB7IEV2ZW50RW1pdHRlciB9IGZyb20gJ2V2ZW50cyc7XG5pbXBvcnQgQXdhaXRMb2NrIGZyb20gJ2F3YWl0LWxvY2snO1xuaW1wb3J0IHsgRGlzcGF0Y2hlciB9IGZyb20gXCJmbHV4XCI7XG5cbmltcG9ydCB7IEFjdGlvblBheWxvYWQgfSBmcm9tIFwiLi4vZGlzcGF0Y2hlci9wYXlsb2Fkc1wiO1xuXG4vKipcbiAqIFRoZSBldmVudC9jaGFubmVsIHRvIGxpc3RlbiBmb3IgaW4gYW4gQXN5bmNTdG9yZS5cbiAqL1xuZXhwb3J0IGNvbnN0IFVQREFURV9FVkVOVCA9IFwidXBkYXRlXCI7XG5cbi8qKlxuICogUmVwcmVzZW50cyBhIG1pbmltYWwgc3RvcmUgd2hpY2ggd29ya3Mgc2ltaWxhciB0byBGbHV4IHN0b3Jlcy4gSW5zdGVhZFxuICogb2YgZXZlcnl0aGluZyBuZWVkaW5nIHRvIGhhcHBlbiBpbiBhIGRpc3BhdGNoIGN5Y2xlLCBldmVyeXRoaW5nIGNhblxuICogaGFwcGVuIGFzeW5jIHRvIHRoYXQgY3ljbGUuXG4gKlxuICogVGhlIHN0b3JlIG9wZXJhdGVzIGJ5IHVzaW5nIE9iamVjdC5hc3NpZ24oKSB0byBtdXRhdGUgc3RhdGUgLSBpdCBzZW5kcyB0aGVcbiAqIHN0YXRlIG9iamVjdHMgKGN1cnJlbnQgYW5kIG5ldykgdGhyb3VnaCB0aGUgZnVuY3Rpb24gb250byBhIG5ldyBlbXB0eVxuICogb2JqZWN0LiBCZWNhdXNlIG9mIHRoaXMsIGl0IGlzIHJlY29tbWVuZGVkIHRvIGJyZWFrIG91dCB5b3VyIHN0YXRlIHRvIGJlIGFzXG4gKiBzYWZlIGFzIHBvc3NpYmxlLiBUaGUgc3RhdGUgbXV0YXRpb25zIGFyZSBhbHNvIGxvY2tlZCwgcHJldmVudGluZyBjb25jdXJyZW50XG4gKiB3cml0ZXMuXG4gKlxuICogQWxsIHVwZGF0ZXMgdG8gdGhlIHN0b3JlIGhhcHBlbiBvbiB0aGUgVVBEQVRFX0VWRU5UIGV2ZW50IGNoYW5uZWwgd2l0aCB0aGVcbiAqIG9uZSBhcmd1bWVudCBiZWluZyB0aGUgaW5zdGFuY2Ugb2YgdGhlIHN0b3JlLlxuICpcbiAqIFRvIHVwZGF0ZSB0aGUgc3RhdGUsIHVzZSB1cGRhdGVTdGF0ZSgpIGFuZCBwcmVmZXJhYmx5IGF3YWl0IHRoZSByZXN1bHQgdG9cbiAqIGhlbHAgcHJldmVudCBsb2NrIGNvbmZsaWN0cy5cbiAqL1xuZXhwb3J0IGFic3RyYWN0IGNsYXNzIEFzeW5jU3RvcmU8VCBleHRlbmRzIE9iamVjdD4gZXh0ZW5kcyBFdmVudEVtaXR0ZXIge1xuICAgIHByaXZhdGUgc3RvcmVTdGF0ZTogUmVhZG9ubHk8VD47XG4gICAgcHJpdmF0ZSBsb2NrID0gbmV3IEF3YWl0TG9jaygpO1xuICAgIHByaXZhdGUgcmVhZG9ubHkgZGlzcGF0Y2hlclJlZjogc3RyaW5nO1xuXG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyBhIG5ldyBBc3luY1N0b3JlIHVzaW5nIHRoZSBnaXZlbiBkaXNwYXRjaGVyLlxuICAgICAqIEBwYXJhbSB7RGlzcGF0Y2hlcjxBY3Rpb25QYXlsb2FkPn0gZGlzcGF0Y2hlciBUaGUgZGlzcGF0Y2hlciB0byByZWx5IHVwb24uXG4gICAgICogQHBhcmFtIHtUfSBpbml0aWFsU3RhdGUgVGhlIGluaXRpYWwgc3RhdGUgZm9yIHRoZSBzdG9yZS5cbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgY29uc3RydWN0b3IocHJpdmF0ZSBkaXNwYXRjaGVyOiBEaXNwYXRjaGVyPEFjdGlvblBheWxvYWQ+LCBpbml0aWFsU3RhdGU6IFQgPSA8VD57fSkge1xuICAgICAgICBzdXBlcigpO1xuXG4gICAgICAgIHRoaXMuZGlzcGF0Y2hlclJlZiA9IGRpc3BhdGNoZXIucmVnaXN0ZXIodGhpcy5vbkRpc3BhdGNoLmJpbmQodGhpcykpO1xuICAgICAgICB0aGlzLnN0b3JlU3RhdGUgPSBpbml0aWFsU3RhdGU7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogVGhlIGN1cnJlbnQgc3RhdGUgb2YgdGhlIHN0b3JlLiBDYW5ub3QgYmUgbXV0YXRlZC5cbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgZ2V0IHN0YXRlKCk6IFQge1xuICAgICAgICByZXR1cm4gdGhpcy5zdG9yZVN0YXRlO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFN0b3BzIHRoZSBzdG9yZSdzIGxpc3RlbmluZyBmdW5jdGlvbnMsIHN1Y2ggYXMgdGhlIGxpc3RlbmVyIHRvIHRoZSBkaXNwYXRjaGVyLlxuICAgICAqL1xuICAgIHByb3RlY3RlZCBzdG9wKCkge1xuICAgICAgICBpZiAodGhpcy5kaXNwYXRjaGVyUmVmKSB0aGlzLmRpc3BhdGNoZXIudW5yZWdpc3Rlcih0aGlzLmRpc3BhdGNoZXJSZWYpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFVwZGF0ZXMgdGhlIHN0YXRlIG9mIHRoZSBzdG9yZS5cbiAgICAgKiBAcGFyYW0ge1R8Kn0gbmV3U3RhdGUgVGhlIHN0YXRlIHRvIHVwZGF0ZSBpbiB0aGUgc3RvcmUgdXNpbmcgT2JqZWN0LmFzc2lnbigpXG4gICAgICovXG4gICAgcHJvdGVjdGVkIGFzeW5jIHVwZGF0ZVN0YXRlKG5ld1N0YXRlOiBUIHwgT2JqZWN0KSB7XG4gICAgICAgIGF3YWl0IHRoaXMubG9jay5hY3F1aXJlQXN5bmMoKTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHRoaXMuc3RvcmVTdGF0ZSA9IE9iamVjdC5mcmVlemUoT2JqZWN0LmFzc2lnbig8VD57fSwgdGhpcy5zdG9yZVN0YXRlLCBuZXdTdGF0ZSkpO1xuICAgICAgICAgICAgdGhpcy5lbWl0KFVQREFURV9FVkVOVCwgdGhpcyk7XG4gICAgICAgIH0gZmluYWxseSB7XG4gICAgICAgICAgICBhd2FpdCB0aGlzLmxvY2sucmVsZWFzZSgpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmVzZXRzIHRoZSBzdG9yZSdzIHRvIHRoZSBwcm92aWRlZCBzdGF0ZSBvciBhbiBlbXB0eSBvYmplY3QuXG4gICAgICogQHBhcmFtIHtUfCp9IG5ld1N0YXRlIFRoZSBuZXcgc3RhdGUgb2YgdGhlIHN0b3JlLlxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gcXVpZXQgSWYgdHJ1ZSwgdGhlIGZ1bmN0aW9uIHdpbGwgbm90IHJhaXNlIGFuIFVQREFURV9FVkVOVC5cbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgYXN5bmMgcmVzZXQobmV3U3RhdGU6IFQgfCBPYmplY3QgPSBudWxsLCBxdWlldCA9IGZhbHNlKSB7XG4gICAgICAgIGF3YWl0IHRoaXMubG9jay5hY3F1aXJlQXN5bmMoKTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHRoaXMuc3RvcmVTdGF0ZSA9IE9iamVjdC5mcmVlemUoPFQ+KG5ld1N0YXRlIHx8IHt9KSk7XG4gICAgICAgICAgICBpZiAoIXF1aWV0KSB0aGlzLmVtaXQoVVBEQVRFX0VWRU5ULCB0aGlzKTtcbiAgICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgICAgIGF3YWl0IHRoaXMubG9jay5yZWxlYXNlKCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDYWxsZWQgd2hlbiB0aGUgZGlzcGF0Y2hlciBicm9hZGNhc3RzIGEgZGlzcGF0Y2ggZXZlbnQuXG4gICAgICogQHBhcmFtIHtBY3Rpb25QYXlsb2FkfSBwYXlsb2FkIFRoZSBldmVudCBiZWluZyBkaXNwYXRjaGVkLlxuICAgICAqL1xuICAgIHByb3RlY3RlZCBhYnN0cmFjdCBvbkRpc3BhdGNoKHBheWxvYWQ6IEFjdGlvblBheWxvYWQpO1xufVxuIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQWdCQTs7QUFDQTs7QUFqQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQVFBO0FBQ0E7QUFDQTtBQUNPLE1BQU1BLFlBQVksR0FBRyxRQUFyQjtBQUVQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUFDTyxNQUFlQyxVQUFmLFNBQW9EQyxvQkFBcEQsQ0FBaUU7RUFLcEU7QUFDSjtBQUNBO0FBQ0E7QUFDQTtFQUNjQyxXQUFXLENBQVNDLFVBQVQsRUFBeUU7SUFBQSxJQUF6QkMsWUFBeUIsdUVBQUosRUFBSTtJQUMxRjtJQUQwRixLQUFoRUQsVUFBZ0UsR0FBaEVBLFVBQWdFO0lBQUE7SUFBQSw0Q0FSL0UsSUFBSUUsa0JBQUosRUFRK0U7SUFBQTtJQUcxRixLQUFLQyxhQUFMLEdBQXFCSCxVQUFVLENBQUNJLFFBQVgsQ0FBb0IsS0FBS0MsVUFBTCxDQUFnQkMsSUFBaEIsQ0FBcUIsSUFBckIsQ0FBcEIsQ0FBckI7SUFDQSxLQUFLQyxVQUFMLEdBQWtCTixZQUFsQjtFQUNIO0VBRUQ7QUFDSjtBQUNBOzs7RUFDdUIsSUFBTE8sS0FBSyxHQUFNO0lBQ3JCLE9BQU8sS0FBS0QsVUFBWjtFQUNIO0VBRUQ7QUFDSjtBQUNBOzs7RUFDY0UsSUFBSSxHQUFHO0lBQ2IsSUFBSSxLQUFLTixhQUFULEVBQXdCLEtBQUtILFVBQUwsQ0FBZ0JVLFVBQWhCLENBQTJCLEtBQUtQLGFBQWhDO0VBQzNCO0VBRUQ7QUFDSjtBQUNBO0FBQ0E7OztFQUMrQixNQUFYUSxXQUFXLENBQUNDLFFBQUQsRUFBdUI7SUFDOUMsTUFBTSxLQUFLQyxJQUFMLENBQVVDLFlBQVYsRUFBTjs7SUFDQSxJQUFJO01BQ0EsS0FBS1AsVUFBTCxHQUFrQlEsTUFBTSxDQUFDQyxNQUFQLENBQWNELE1BQU0sQ0FBQ0UsTUFBUCxDQUFpQixFQUFqQixFQUFxQixLQUFLVixVQUExQixFQUFzQ0ssUUFBdEMsQ0FBZCxDQUFsQjtNQUNBLEtBQUtNLElBQUwsQ0FBVXRCLFlBQVYsRUFBd0IsSUFBeEI7SUFDSCxDQUhELFNBR1U7TUFDTixNQUFNLEtBQUtpQixJQUFMLENBQVVNLE9BQVYsRUFBTjtJQUNIO0VBQ0o7RUFFRDtBQUNKO0FBQ0E7QUFDQTtBQUNBOzs7RUFDeUIsTUFBTEMsS0FBSyxHQUE2QztJQUFBLElBQTVDUixRQUE0Qyx1RUFBckIsSUFBcUI7SUFBQSxJQUFmUyxLQUFlLHVFQUFQLEtBQU87SUFDOUQsTUFBTSxLQUFLUixJQUFMLENBQVVDLFlBQVYsRUFBTjs7SUFDQSxJQUFJO01BQ0EsS0FBS1AsVUFBTCxHQUFrQlEsTUFBTSxDQUFDQyxNQUFQLENBQWtCSixRQUFRLElBQUksRUFBOUIsQ0FBbEI7TUFDQSxJQUFJLENBQUNTLEtBQUwsRUFBWSxLQUFLSCxJQUFMLENBQVV0QixZQUFWLEVBQXdCLElBQXhCO0lBQ2YsQ0FIRCxTQUdVO01BQ04sTUFBTSxLQUFLaUIsSUFBTCxDQUFVTSxPQUFWLEVBQU47SUFDSDtFQUNKO0VBRUQ7QUFDSjtBQUNBO0FBQ0E7OztBQS9Ed0UifQ==