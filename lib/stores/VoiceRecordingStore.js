"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.VoiceRecordingStore = void 0;

var _objectWithoutProperties2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutProperties"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _event = require("matrix-js-sdk/src/@types/event");

var _AsyncStoreWithClient = require("./AsyncStoreWithClient");

var _dispatcher = _interopRequireDefault(require("../dispatcher/dispatcher"));

var _VoiceRecording = require("../audio/VoiceRecording");

function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }

function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { (0, _defineProperty2.default)(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }

const SEPARATOR = "|";

class VoiceRecordingStore extends _AsyncStoreWithClient.AsyncStoreWithClient {
  constructor() {
    super(_dispatcher.default, {});
  }

  static get instance() {
    if (!this.internalInstance) {
      this.internalInstance = new VoiceRecordingStore();
      this.internalInstance.start();
    }

    return this.internalInstance;
  }

  async onAction(payload) {
    // Nothing to do, but we're required to override the function
    return;
  }

  static getVoiceRecordingId(room, relation) {
    if (relation?.rel_type === "io.element.thread" || relation?.rel_type === _event.RelationType.Thread) {
      return room.roomId + SEPARATOR + relation.event_id;
    } else {
      return room.roomId;
    }
  }
  /**
   * Gets the active recording instance, if any.
   * @param {string} voiceRecordingId The room ID (with optionally the thread ID if in one) to get the recording in.
   * @returns {Optional<VoiceRecording>} The recording, if any.
   */


  getActiveRecording(voiceRecordingId) {
    return this.state[voiceRecordingId];
  }
  /**
   * Starts a new recording if one isn't already in progress. Note that this simply
   * creates a recording instance - whether or not recording is actively in progress
   * can be seen via the VoiceRecording class.
   * @param {string} voiceRecordingId The room ID (with optionally the thread ID if in one) to start recording in.
   * @returns {VoiceRecording} The recording.
   */


  startRecording(voiceRecordingId) {
    if (!this.matrixClient) throw new Error("Cannot start a recording without a MatrixClient");
    if (!voiceRecordingId) throw new Error("Recording must be associated with a room");
    if (this.state[voiceRecordingId]) throw new Error("A recording is already in progress");
    const recording = new _VoiceRecording.VoiceRecording(this.matrixClient); // noinspection JSIgnoredPromiseFromCall - we can safely run this async

    this.updateState(_objectSpread(_objectSpread({}, this.state), {}, {
      [voiceRecordingId]: recording
    }));
    return recording;
  }
  /**
   * Disposes of the current recording, no matter the state of it.
   * @param {string} voiceRecordingId The room ID (with optionally the thread ID if in one) to dispose of the recording in.
   * @returns {Promise<void>} Resolves when complete.
   */


  disposeRecording(voiceRecordingId) {
    this.state[voiceRecordingId]?.destroy(); // stops internally

    const _this$state = this.state,
          {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      [voiceRecordingId]: _toDelete
    } = _this$state,
          newState = (0, _objectWithoutProperties2.default)(_this$state, [voiceRecordingId].map(_toPropertyKey)); // unexpectedly AsyncStore.updateState merges state
    // AsyncStore.reset actually just *sets*

    return this.reset(newState);
  }

}

exports.VoiceRecordingStore = VoiceRecordingStore;
(0, _defineProperty2.default)(VoiceRecordingStore, "internalInstance", void 0);
window.mxVoiceRecordingStore = VoiceRecordingStore.instance;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJTRVBBUkFUT1IiLCJWb2ljZVJlY29yZGluZ1N0b3JlIiwiQXN5bmNTdG9yZVdpdGhDbGllbnQiLCJjb25zdHJ1Y3RvciIsImRlZmF1bHREaXNwYXRjaGVyIiwiaW5zdGFuY2UiLCJpbnRlcm5hbEluc3RhbmNlIiwic3RhcnQiLCJvbkFjdGlvbiIsInBheWxvYWQiLCJnZXRWb2ljZVJlY29yZGluZ0lkIiwicm9vbSIsInJlbGF0aW9uIiwicmVsX3R5cGUiLCJSZWxhdGlvblR5cGUiLCJUaHJlYWQiLCJyb29tSWQiLCJldmVudF9pZCIsImdldEFjdGl2ZVJlY29yZGluZyIsInZvaWNlUmVjb3JkaW5nSWQiLCJzdGF0ZSIsInN0YXJ0UmVjb3JkaW5nIiwibWF0cml4Q2xpZW50IiwiRXJyb3IiLCJyZWNvcmRpbmciLCJWb2ljZVJlY29yZGluZyIsInVwZGF0ZVN0YXRlIiwiZGlzcG9zZVJlY29yZGluZyIsImRlc3Ryb3kiLCJfdG9EZWxldGUiLCJuZXdTdGF0ZSIsInJlc2V0Iiwid2luZG93IiwibXhWb2ljZVJlY29yZGluZ1N0b3JlIl0sInNvdXJjZXMiOlsiLi4vLi4vc3JjL3N0b3Jlcy9Wb2ljZVJlY29yZGluZ1N0b3JlLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgMjAyMSAtIDIwMjIgVGhlIE1hdHJpeC5vcmcgRm91bmRhdGlvbiBDLkkuQy5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQgeyBPcHRpb25hbCB9IGZyb20gXCJtYXRyaXgtZXZlbnRzLXNka1wiO1xuaW1wb3J0IHsgUm9vbSB9IGZyb20gXCJtYXRyaXgtanMtc2RrL3NyYy9tb2RlbHMvcm9vbVwiO1xuaW1wb3J0IHsgUmVsYXRpb25UeXBlIH0gZnJvbSBcIm1hdHJpeC1qcy1zZGsvc3JjL0B0eXBlcy9ldmVudFwiO1xuaW1wb3J0IHsgSUV2ZW50UmVsYXRpb24gfSBmcm9tIFwibWF0cml4LWpzLXNkay9zcmMvbW9kZWxzL2V2ZW50XCI7XG5cbmltcG9ydCB7IEFzeW5jU3RvcmVXaXRoQ2xpZW50IH0gZnJvbSBcIi4vQXN5bmNTdG9yZVdpdGhDbGllbnRcIjtcbmltcG9ydCBkZWZhdWx0RGlzcGF0Y2hlciBmcm9tIFwiLi4vZGlzcGF0Y2hlci9kaXNwYXRjaGVyXCI7XG5pbXBvcnQgeyBBY3Rpb25QYXlsb2FkIH0gZnJvbSBcIi4uL2Rpc3BhdGNoZXIvcGF5bG9hZHNcIjtcbmltcG9ydCB7IFZvaWNlUmVjb3JkaW5nIH0gZnJvbSBcIi4uL2F1ZGlvL1ZvaWNlUmVjb3JkaW5nXCI7XG5cbmNvbnN0IFNFUEFSQVRPUiA9IFwifFwiO1xuXG5pbnRlcmZhY2UgSVN0YXRlIHtcbiAgICBbdm9pY2VSZWNvcmRpbmdJZDogc3RyaW5nXTogT3B0aW9uYWw8Vm9pY2VSZWNvcmRpbmc+O1xufVxuXG5leHBvcnQgY2xhc3MgVm9pY2VSZWNvcmRpbmdTdG9yZSBleHRlbmRzIEFzeW5jU3RvcmVXaXRoQ2xpZW50PElTdGF0ZT4ge1xuICAgIHByaXZhdGUgc3RhdGljIGludGVybmFsSW5zdGFuY2U6IFZvaWNlUmVjb3JkaW5nU3RvcmU7XG5cbiAgICBwdWJsaWMgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHN1cGVyKGRlZmF1bHREaXNwYXRjaGVyLCB7fSk7XG4gICAgfVxuXG4gICAgcHVibGljIHN0YXRpYyBnZXQgaW5zdGFuY2UoKTogVm9pY2VSZWNvcmRpbmdTdG9yZSB7XG4gICAgICAgIGlmICghdGhpcy5pbnRlcm5hbEluc3RhbmNlKSB7XG4gICAgICAgICAgICB0aGlzLmludGVybmFsSW5zdGFuY2UgPSBuZXcgVm9pY2VSZWNvcmRpbmdTdG9yZSgpO1xuICAgICAgICAgICAgdGhpcy5pbnRlcm5hbEluc3RhbmNlLnN0YXJ0KCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXMuaW50ZXJuYWxJbnN0YW5jZTtcbiAgICB9XG5cbiAgICBwcm90ZWN0ZWQgYXN5bmMgb25BY3Rpb24ocGF5bG9hZDogQWN0aW9uUGF5bG9hZCk6IFByb21pc2U8dm9pZD4ge1xuICAgICAgICAvLyBOb3RoaW5nIHRvIGRvLCBidXQgd2UncmUgcmVxdWlyZWQgdG8gb3ZlcnJpZGUgdGhlIGZ1bmN0aW9uXG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBwdWJsaWMgc3RhdGljIGdldFZvaWNlUmVjb3JkaW5nSWQocm9vbTogUm9vbSwgcmVsYXRpb24/OiBJRXZlbnRSZWxhdGlvbik6IHN0cmluZyB7XG4gICAgICAgIGlmIChyZWxhdGlvbj8ucmVsX3R5cGUgPT09IFwiaW8uZWxlbWVudC50aHJlYWRcIiB8fCByZWxhdGlvbj8ucmVsX3R5cGUgPT09IFJlbGF0aW9uVHlwZS5UaHJlYWQpIHtcbiAgICAgICAgICAgIHJldHVybiByb29tLnJvb21JZCArIFNFUEFSQVRPUiArIHJlbGF0aW9uLmV2ZW50X2lkO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIHJvb20ucm9vbUlkO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2V0cyB0aGUgYWN0aXZlIHJlY29yZGluZyBpbnN0YW5jZSwgaWYgYW55LlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSB2b2ljZVJlY29yZGluZ0lkIFRoZSByb29tIElEICh3aXRoIG9wdGlvbmFsbHkgdGhlIHRocmVhZCBJRCBpZiBpbiBvbmUpIHRvIGdldCB0aGUgcmVjb3JkaW5nIGluLlxuICAgICAqIEByZXR1cm5zIHtPcHRpb25hbDxWb2ljZVJlY29yZGluZz59IFRoZSByZWNvcmRpbmcsIGlmIGFueS5cbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0QWN0aXZlUmVjb3JkaW5nKHZvaWNlUmVjb3JkaW5nSWQ6IHN0cmluZyk6IE9wdGlvbmFsPFZvaWNlUmVjb3JkaW5nPiB7XG4gICAgICAgIHJldHVybiB0aGlzLnN0YXRlW3ZvaWNlUmVjb3JkaW5nSWRdO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFN0YXJ0cyBhIG5ldyByZWNvcmRpbmcgaWYgb25lIGlzbid0IGFscmVhZHkgaW4gcHJvZ3Jlc3MuIE5vdGUgdGhhdCB0aGlzIHNpbXBseVxuICAgICAqIGNyZWF0ZXMgYSByZWNvcmRpbmcgaW5zdGFuY2UgLSB3aGV0aGVyIG9yIG5vdCByZWNvcmRpbmcgaXMgYWN0aXZlbHkgaW4gcHJvZ3Jlc3NcbiAgICAgKiBjYW4gYmUgc2VlbiB2aWEgdGhlIFZvaWNlUmVjb3JkaW5nIGNsYXNzLlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSB2b2ljZVJlY29yZGluZ0lkIFRoZSByb29tIElEICh3aXRoIG9wdGlvbmFsbHkgdGhlIHRocmVhZCBJRCBpZiBpbiBvbmUpIHRvIHN0YXJ0IHJlY29yZGluZyBpbi5cbiAgICAgKiBAcmV0dXJucyB7Vm9pY2VSZWNvcmRpbmd9IFRoZSByZWNvcmRpbmcuXG4gICAgICovXG4gICAgcHVibGljIHN0YXJ0UmVjb3JkaW5nKHZvaWNlUmVjb3JkaW5nSWQ6IHN0cmluZyk6IFZvaWNlUmVjb3JkaW5nIHtcbiAgICAgICAgaWYgKCF0aGlzLm1hdHJpeENsaWVudCkgdGhyb3cgbmV3IEVycm9yKFwiQ2Fubm90IHN0YXJ0IGEgcmVjb3JkaW5nIHdpdGhvdXQgYSBNYXRyaXhDbGllbnRcIik7XG4gICAgICAgIGlmICghdm9pY2VSZWNvcmRpbmdJZCkgdGhyb3cgbmV3IEVycm9yKFwiUmVjb3JkaW5nIG11c3QgYmUgYXNzb2NpYXRlZCB3aXRoIGEgcm9vbVwiKTtcbiAgICAgICAgaWYgKHRoaXMuc3RhdGVbdm9pY2VSZWNvcmRpbmdJZF0pIHRocm93IG5ldyBFcnJvcihcIkEgcmVjb3JkaW5nIGlzIGFscmVhZHkgaW4gcHJvZ3Jlc3NcIik7XG5cbiAgICAgICAgY29uc3QgcmVjb3JkaW5nID0gbmV3IFZvaWNlUmVjb3JkaW5nKHRoaXMubWF0cml4Q2xpZW50KTtcblxuICAgICAgICAvLyBub2luc3BlY3Rpb24gSlNJZ25vcmVkUHJvbWlzZUZyb21DYWxsIC0gd2UgY2FuIHNhZmVseSBydW4gdGhpcyBhc3luY1xuICAgICAgICB0aGlzLnVwZGF0ZVN0YXRlKHsgLi4udGhpcy5zdGF0ZSwgW3ZvaWNlUmVjb3JkaW5nSWRdOiByZWNvcmRpbmcgfSk7XG5cbiAgICAgICAgcmV0dXJuIHJlY29yZGluZztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBEaXNwb3NlcyBvZiB0aGUgY3VycmVudCByZWNvcmRpbmcsIG5vIG1hdHRlciB0aGUgc3RhdGUgb2YgaXQuXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHZvaWNlUmVjb3JkaW5nSWQgVGhlIHJvb20gSUQgKHdpdGggb3B0aW9uYWxseSB0aGUgdGhyZWFkIElEIGlmIGluIG9uZSkgdG8gZGlzcG9zZSBvZiB0aGUgcmVjb3JkaW5nIGluLlxuICAgICAqIEByZXR1cm5zIHtQcm9taXNlPHZvaWQ+fSBSZXNvbHZlcyB3aGVuIGNvbXBsZXRlLlxuICAgICAqL1xuICAgIHB1YmxpYyBkaXNwb3NlUmVjb3JkaW5nKHZvaWNlUmVjb3JkaW5nSWQ6IHN0cmluZyk6IFByb21pc2U8dm9pZD4ge1xuICAgICAgICB0aGlzLnN0YXRlW3ZvaWNlUmVjb3JkaW5nSWRdPy5kZXN0cm95KCk7IC8vIHN0b3BzIGludGVybmFsbHlcblxuICAgICAgICBjb25zdCB7XG4gICAgICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLXVudXNlZC12YXJzXG4gICAgICAgICAgICBbdm9pY2VSZWNvcmRpbmdJZF06IF90b0RlbGV0ZSxcbiAgICAgICAgICAgIC4uLm5ld1N0YXRlXG4gICAgICAgIH0gPSB0aGlzLnN0YXRlO1xuICAgICAgICAvLyB1bmV4cGVjdGVkbHkgQXN5bmNTdG9yZS51cGRhdGVTdGF0ZSBtZXJnZXMgc3RhdGVcbiAgICAgICAgLy8gQXN5bmNTdG9yZS5yZXNldCBhY3R1YWxseSBqdXN0ICpzZXRzKlxuICAgICAgICByZXR1cm4gdGhpcy5yZXNldChuZXdTdGF0ZSk7XG4gICAgfVxufVxuXG53aW5kb3cubXhWb2ljZVJlY29yZGluZ1N0b3JlID0gVm9pY2VSZWNvcmRpbmdTdG9yZS5pbnN0YW5jZTtcbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7OztBQWtCQTs7QUFHQTs7QUFDQTs7QUFFQTs7Ozs7Ozs7OztBQUVBLE1BQU1BLFNBQVMsR0FBRyxHQUFsQjs7QUFNTyxNQUFNQyxtQkFBTixTQUFrQ0MsMENBQWxDLENBQStEO0VBRzNEQyxXQUFXLEdBQUc7SUFDakIsTUFBTUMsbUJBQU4sRUFBeUIsRUFBekI7RUFDSDs7RUFFeUIsV0FBUkMsUUFBUSxHQUF3QjtJQUM5QyxJQUFJLENBQUMsS0FBS0MsZ0JBQVYsRUFBNEI7TUFDeEIsS0FBS0EsZ0JBQUwsR0FBd0IsSUFBSUwsbUJBQUosRUFBeEI7TUFDQSxLQUFLSyxnQkFBTCxDQUFzQkMsS0FBdEI7SUFDSDs7SUFDRCxPQUFPLEtBQUtELGdCQUFaO0VBQ0g7O0VBRXVCLE1BQVJFLFFBQVEsQ0FBQ0MsT0FBRCxFQUF3QztJQUM1RDtJQUNBO0VBQ0g7O0VBRWdDLE9BQW5CQyxtQkFBbUIsQ0FBQ0MsSUFBRCxFQUFhQyxRQUFiLEVBQWdEO0lBQzdFLElBQUlBLFFBQVEsRUFBRUMsUUFBVixLQUF1QixtQkFBdkIsSUFBOENELFFBQVEsRUFBRUMsUUFBVixLQUF1QkMsbUJBQUEsQ0FBYUMsTUFBdEYsRUFBOEY7TUFDMUYsT0FBT0osSUFBSSxDQUFDSyxNQUFMLEdBQWNoQixTQUFkLEdBQTBCWSxRQUFRLENBQUNLLFFBQTFDO0lBQ0gsQ0FGRCxNQUVPO01BQ0gsT0FBT04sSUFBSSxDQUFDSyxNQUFaO0lBQ0g7RUFDSjtFQUVEO0FBQ0o7QUFDQTtBQUNBO0FBQ0E7OztFQUNXRSxrQkFBa0IsQ0FBQ0MsZ0JBQUQsRUFBcUQ7SUFDMUUsT0FBTyxLQUFLQyxLQUFMLENBQVdELGdCQUFYLENBQVA7RUFDSDtFQUVEO0FBQ0o7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7RUFDV0UsY0FBYyxDQUFDRixnQkFBRCxFQUEyQztJQUM1RCxJQUFJLENBQUMsS0FBS0csWUFBVixFQUF3QixNQUFNLElBQUlDLEtBQUosQ0FBVSxpREFBVixDQUFOO0lBQ3hCLElBQUksQ0FBQ0osZ0JBQUwsRUFBdUIsTUFBTSxJQUFJSSxLQUFKLENBQVUsMENBQVYsQ0FBTjtJQUN2QixJQUFJLEtBQUtILEtBQUwsQ0FBV0QsZ0JBQVgsQ0FBSixFQUFrQyxNQUFNLElBQUlJLEtBQUosQ0FBVSxvQ0FBVixDQUFOO0lBRWxDLE1BQU1DLFNBQVMsR0FBRyxJQUFJQyw4QkFBSixDQUFtQixLQUFLSCxZQUF4QixDQUFsQixDQUw0RCxDQU81RDs7SUFDQSxLQUFLSSxXQUFMLGlDQUFzQixLQUFLTixLQUEzQjtNQUFrQyxDQUFDRCxnQkFBRCxHQUFvQks7SUFBdEQ7SUFFQSxPQUFPQSxTQUFQO0VBQ0g7RUFFRDtBQUNKO0FBQ0E7QUFDQTtBQUNBOzs7RUFDV0csZ0JBQWdCLENBQUNSLGdCQUFELEVBQTBDO0lBQzdELEtBQUtDLEtBQUwsQ0FBV0QsZ0JBQVgsR0FBOEJTLE9BQTlCLEdBRDZELENBQ3BCOztJQUV6QyxvQkFJSSxLQUFLUixLQUpUO0lBQUEsTUFBTTtNQUNGO01BQ0EsQ0FBQ0QsZ0JBQUQsR0FBb0JVO0lBRmxCLENBQU47SUFBQSxNQUdPQyxRQUhQLHdEQUVLWCxnQkFGTCx1QkFINkQsQ0FRN0Q7SUFDQTs7SUFDQSxPQUFPLEtBQUtZLEtBQUwsQ0FBV0QsUUFBWCxDQUFQO0VBQ0g7O0FBekVpRTs7OzhCQUF6RDdCLG1CO0FBNEViK0IsTUFBTSxDQUFDQyxxQkFBUCxHQUErQmhDLG1CQUFtQixDQUFDSSxRQUFuRCJ9