"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.VoiceRecording = exports.SAMPLE_RATE = exports.RecordingState = exports.RECORDING_PLAYBACK_SAMPLES = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var Recorder = _interopRequireWildcard(require("opus-recorder"));

var _encoderWorkerMin = _interopRequireDefault(require("opus-recorder/dist/encoderWorker.min.js"));

var _matrixWidgetApi = require("matrix-widget-api");

var _events = _interopRequireDefault(require("events"));

var _logger = require("matrix-js-sdk/src/logger");

var _MediaDeviceHandler = _interopRequireDefault(require("../MediaDeviceHandler"));

var _Singleflight = require("../utils/Singleflight");

var _consts = require("./consts");

var _AsyncStore = require("../stores/AsyncStore");

var _Playback = require("./Playback");

var _compat = require("./compat");

var _ContentMessages = require("../ContentMessages");

var _FixedRollingArray = require("../utils/FixedRollingArray");

var _numbers = require("../utils/numbers");

var _RecorderWorklet = _interopRequireDefault(require("./RecorderWorklet"));

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

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
const CHANNELS = 1; // stereo isn't important

const SAMPLE_RATE = 48000; // 48khz is what WebRTC uses. 12khz is where we lose quality.

exports.SAMPLE_RATE = SAMPLE_RATE;
const BITRATE = 24000; // 24kbps is pretty high quality for our use case in opus.

const TARGET_MAX_LENGTH = 900; // 15 minutes in seconds. Somewhat arbitrary, though longer == larger files.

const TARGET_WARN_TIME_LEFT = 10; // 10 seconds, also somewhat arbitrary.

const RECORDING_PLAYBACK_SAMPLES = 44;
exports.RECORDING_PLAYBACK_SAMPLES = RECORDING_PLAYBACK_SAMPLES;
let RecordingState;
exports.RecordingState = RecordingState;

(function (RecordingState) {
  RecordingState["Started"] = "started";
  RecordingState["EndingSoon"] = "ending_soon";
  RecordingState["Ended"] = "ended";
  RecordingState["Uploading"] = "uploading";
  RecordingState["Uploaded"] = "uploaded";
})(RecordingState || (exports.RecordingState = RecordingState = {}));

class VoiceRecording extends _events.default {
  // use this.audioBuffer to access
  // at each second mark, generated
  constructor(client) {
    super();
    this.client = client;
    (0, _defineProperty2.default)(this, "recorder", void 0);
    (0, _defineProperty2.default)(this, "recorderContext", void 0);
    (0, _defineProperty2.default)(this, "recorderSource", void 0);
    (0, _defineProperty2.default)(this, "recorderStream", void 0);
    (0, _defineProperty2.default)(this, "recorderWorklet", void 0);
    (0, _defineProperty2.default)(this, "recorderProcessor", void 0);
    (0, _defineProperty2.default)(this, "buffer", new Uint8Array(0));
    (0, _defineProperty2.default)(this, "lastUpload", void 0);
    (0, _defineProperty2.default)(this, "recording", false);
    (0, _defineProperty2.default)(this, "observable", void 0);
    (0, _defineProperty2.default)(this, "amplitudes", []);
    (0, _defineProperty2.default)(this, "playback", void 0);
    (0, _defineProperty2.default)(this, "liveWaveform", new _FixedRollingArray.FixedRollingArray(RECORDING_PLAYBACK_SAMPLES, 0));
    (0, _defineProperty2.default)(this, "onAudioProcess", ev => {
      this.processAudioUpdate(ev.playbackTime); // We skip the functionality of the worklet regarding waveform calculations: we
      // should get that information pretty quick during the playback info.
    });
    (0, _defineProperty2.default)(this, "processAudioUpdate", timeSeconds => {
      if (!this.recording) return;
      this.observable.update({
        waveform: this.liveWaveform.value.map(v => (0, _numbers.clamp)(v, 0, 1)),
        timeSeconds: timeSeconds
      }); // Now that we've updated the data/waveform, let's do a time check. We don't want to
      // go horribly over the limit. We also emit a warning state if needed.
      //
      // We use the recorder's perspective of time to make sure we don't cut off the last
      // frame of audio, otherwise we end up with a 14:59 clip (899.68 seconds). This extra
      // safety can allow us to overshoot the target a bit, but at least when we say 15min
      // maximum we actually mean it.
      //
      // In testing, recorder time and worker time lag by about 400ms, which is roughly the
      // time needed to encode a sample/frame.
      //
      // Ref for recorderSeconds: https://github.com/chris-rudmin/opus-recorder#instance-fields

      const recorderSeconds = this.recorder.encodedSamplePosition / 48000;
      const secondsLeft = TARGET_MAX_LENGTH - recorderSeconds;

      if (secondsLeft < 0) {
        // go over to make sure we definitely capture that last frame
        // noinspection JSIgnoredPromiseFromCall - we aren't concerned with it overlapping
        this.stop();
      } else if (secondsLeft <= TARGET_WARN_TIME_LEFT) {
        _Singleflight.Singleflight.for(this, "ending_soon").do(() => {
          this.emit(RecordingState.EndingSoon, {
            secondsLeft
          });
          return _Singleflight.Singleflight.Void;
        });
      }
    });
  }

  get contentType() {
    return "audio/ogg";
  }

  get contentLength() {
    return this.buffer.length;
  }

  get durationSeconds() {
    if (!this.recorder) throw new Error("Duration not available without a recording");
    return this.recorderContext.currentTime;
  }

  get isRecording() {
    return this.recording;
  }

  emit(event) {
    for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      args[_key - 1] = arguments[_key];
    }

    super.emit(event, ...args);
    super.emit(_AsyncStore.UPDATE_EVENT, event, ...args);
    return true; // we don't ever care if the event had listeners, so just return "yes"
  }

  async makeRecorder() {
    try {
      this.recorderStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: CHANNELS,
          noiseSuppression: true,
          // browsers ignore constraints they can't honour
          deviceId: _MediaDeviceHandler.default.getAudioInput()
        }
      });
      this.recorderContext = (0, _compat.createAudioContext)({// latencyHint: "interactive", // we don't want a latency hint (this causes data smoothing)
      });
      this.recorderSource = this.recorderContext.createMediaStreamSource(this.recorderStream); // Connect our inputs and outputs

      if (this.recorderContext.audioWorklet) {
        // Set up our worklet. We use this for timing information and waveform analysis: the
        // web audio API prefers this be done async to avoid holding the main thread with math.
        await this.recorderContext.audioWorklet.addModule(_RecorderWorklet.default);
        this.recorderWorklet = new AudioWorkletNode(this.recorderContext, _consts.WORKLET_NAME);
        this.recorderSource.connect(this.recorderWorklet);
        this.recorderWorklet.connect(this.recorderContext.destination); // Dev note: we can't use `addEventListener` for some reason. It just doesn't work.

        this.recorderWorklet.port.onmessage = ev => {
          switch (ev.data['ev']) {
            case _consts.PayloadEvent.Timekeep:
              this.processAudioUpdate(ev.data['timeSeconds']);
              break;

            case _consts.PayloadEvent.AmplitudeMark:
              // Sanity check to make sure we're adding about one sample per second
              if (ev.data['forIndex'] === this.amplitudes.length) {
                this.amplitudes.push(ev.data['amplitude']);
                this.liveWaveform.pushValue(ev.data['amplitude']);
              }

              break;
          }
        };
      } else {
        // Safari fallback: use a processor node instead, buffered to 1024 bytes of data
        // like the worklet is.
        this.recorderProcessor = this.recorderContext.createScriptProcessor(1024, CHANNELS, CHANNELS);
        this.recorderSource.connect(this.recorderProcessor);
        this.recorderProcessor.connect(this.recorderContext.destination);
        this.recorderProcessor.addEventListener("audioprocess", this.onAudioProcess);
      }

      this.recorder = new Recorder({
        encoderPath: _encoderWorkerMin.default,
        // magic from webpack
        encoderSampleRate: SAMPLE_RATE,
        encoderApplication: 2048,
        // voice (default is "audio")
        streamPages: true,
        // this speeds up the encoding process by using CPU over time
        encoderFrameSize: 20,
        // ms, arbitrary frame size we send to the encoder
        numberOfChannels: CHANNELS,
        sourceNode: this.recorderSource,
        encoderBitRate: BITRATE,
        // We use low values for the following to ease CPU usage - the resulting waveform
        // is indistinguishable for a voice message. Note that the underlying library will
        // pick defaults which prefer the highest possible quality, CPU be damned.
        encoderComplexity: 3,
        // 0-10, 10 is slow and high quality.
        resampleQuality: 3 // 0-10, 10 is slow and high quality

      });

      this.recorder.ondataavailable = a => {
        const buf = new Uint8Array(a);
        const newBuf = new Uint8Array(this.buffer.length + buf.length);
        newBuf.set(this.buffer, 0);
        newBuf.set(buf, this.buffer.length);
        this.buffer = newBuf;
      };
    } catch (e) {
      _logger.logger.error("Error starting recording: ", e);

      if (e instanceof DOMException) {
        // Unhelpful DOMExceptions are common - parse them sanely
        _logger.logger.error(`${e.name} (${e.code}): ${e.message}`);
      } // Clean up as best as possible


      if (this.recorderStream) this.recorderStream.getTracks().forEach(t => t.stop());
      if (this.recorderSource) this.recorderSource.disconnect();
      if (this.recorder) this.recorder.close();

      if (this.recorderContext) {
        // noinspection ES6MissingAwait - not important that we wait
        this.recorderContext.close();
      }

      throw e; // rethrow so upstream can handle it
    }
  }

  get audioBuffer() {
    // We need a clone of the buffer to avoid accidentally changing the position
    // on the real thing.
    return this.buffer.slice(0);
  }

  get liveData() {
    if (!this.recording) throw new Error("No observable when not recording");
    return this.observable;
  }

  get isSupported() {
    return !!Recorder.isRecordingSupported();
  }

  get hasRecording() {
    return this.buffer.length > 0;
  }

  async start() {
    if (this.lastUpload || this.hasRecording) {
      throw new Error("Recording already prepared");
    }

    if (this.recording) {
      throw new Error("Recording already in progress");
    }

    if (this.observable) {
      this.observable.close();
    }

    this.observable = new _matrixWidgetApi.SimpleObservable();
    await this.makeRecorder();
    await this.recorder.start();
    this.recording = true;
    this.emit(RecordingState.Started);
  }

  async stop() {
    return _Singleflight.Singleflight.for(this, "stop").do(async () => {
      if (!this.recording) {
        throw new Error("No recording to stop");
      } // Disconnect the source early to start shutting down resources


      await this.recorder.stop(); // stop first to flush the last frame

      this.recorderSource.disconnect();
      if (this.recorderWorklet) this.recorderWorklet.disconnect();

      if (this.recorderProcessor) {
        this.recorderProcessor.disconnect();
        this.recorderProcessor.removeEventListener("audioprocess", this.onAudioProcess);
      } // close the context after the recorder so the recorder doesn't try to
      // connect anything to the context (this would generate a warning)


      await this.recorderContext.close(); // Now stop all the media tracks so we can release them back to the user/OS

      this.recorderStream.getTracks().forEach(t => t.stop()); // Finally do our post-processing and clean up

      this.recording = false;
      await this.recorder.close();
      this.emit(RecordingState.Ended);
      return this.audioBuffer;
    });
  }
  /**
   * Gets a playback instance for this voice recording. Note that the playback will not
   * have been prepared fully, meaning the `prepare()` function needs to be called on it.
   *
   * The same playback instance is returned each time.
   *
   * @returns {Playback} The playback instance.
   */


  getPlayback() {
    this.playback = _Singleflight.Singleflight.for(this, "playback").do(() => {
      return new _Playback.Playback(this.audioBuffer.buffer, this.amplitudes); // cast to ArrayBuffer proper;
    });
    return this.playback;
  }

  destroy() {
    // noinspection JSIgnoredPromiseFromCall - not concerned about stop() being called async here
    this.stop();
    this.removeAllListeners();

    _Singleflight.Singleflight.forgetAllFor(this); // noinspection JSIgnoredPromiseFromCall - not concerned about being called async here


    this.playback?.destroy();
    this.observable.close();
  }

  async upload(inRoomId) {
    if (!this.hasRecording) {
      throw new Error("No recording available to upload");
    }

    if (this.lastUpload) return this.lastUpload;

    try {
      this.emit(RecordingState.Uploading);
      const {
        url: mxc,
        file: encrypted
      } = await (0, _ContentMessages.uploadFile)(this.client, inRoomId, new Blob([this.audioBuffer], {
        type: this.contentType
      }));
      this.lastUpload = {
        mxc,
        encrypted
      };
      this.emit(RecordingState.Uploaded);
    } catch (e) {
      this.emit(RecordingState.Ended);
      throw e;
    }

    return this.lastUpload;
  }

}

exports.VoiceRecording = VoiceRecording;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJDSEFOTkVMUyIsIlNBTVBMRV9SQVRFIiwiQklUUkFURSIsIlRBUkdFVF9NQVhfTEVOR1RIIiwiVEFSR0VUX1dBUk5fVElNRV9MRUZUIiwiUkVDT1JESU5HX1BMQVlCQUNLX1NBTVBMRVMiLCJSZWNvcmRpbmdTdGF0ZSIsIlZvaWNlUmVjb3JkaW5nIiwiRXZlbnRFbWl0dGVyIiwiY29uc3RydWN0b3IiLCJjbGllbnQiLCJVaW50OEFycmF5IiwiRml4ZWRSb2xsaW5nQXJyYXkiLCJldiIsInByb2Nlc3NBdWRpb1VwZGF0ZSIsInBsYXliYWNrVGltZSIsInRpbWVTZWNvbmRzIiwicmVjb3JkaW5nIiwib2JzZXJ2YWJsZSIsInVwZGF0ZSIsIndhdmVmb3JtIiwibGl2ZVdhdmVmb3JtIiwidmFsdWUiLCJtYXAiLCJ2IiwiY2xhbXAiLCJyZWNvcmRlclNlY29uZHMiLCJyZWNvcmRlciIsImVuY29kZWRTYW1wbGVQb3NpdGlvbiIsInNlY29uZHNMZWZ0Iiwic3RvcCIsIlNpbmdsZWZsaWdodCIsImZvciIsImRvIiwiZW1pdCIsIkVuZGluZ1Nvb24iLCJWb2lkIiwiY29udGVudFR5cGUiLCJjb250ZW50TGVuZ3RoIiwiYnVmZmVyIiwibGVuZ3RoIiwiZHVyYXRpb25TZWNvbmRzIiwiRXJyb3IiLCJyZWNvcmRlckNvbnRleHQiLCJjdXJyZW50VGltZSIsImlzUmVjb3JkaW5nIiwiZXZlbnQiLCJhcmdzIiwiVVBEQVRFX0VWRU5UIiwibWFrZVJlY29yZGVyIiwicmVjb3JkZXJTdHJlYW0iLCJuYXZpZ2F0b3IiLCJtZWRpYURldmljZXMiLCJnZXRVc2VyTWVkaWEiLCJhdWRpbyIsImNoYW5uZWxDb3VudCIsIm5vaXNlU3VwcHJlc3Npb24iLCJkZXZpY2VJZCIsIk1lZGlhRGV2aWNlSGFuZGxlciIsImdldEF1ZGlvSW5wdXQiLCJjcmVhdGVBdWRpb0NvbnRleHQiLCJyZWNvcmRlclNvdXJjZSIsImNyZWF0ZU1lZGlhU3RyZWFtU291cmNlIiwiYXVkaW9Xb3JrbGV0IiwiYWRkTW9kdWxlIiwibXhSZWNvcmRlcldvcmtsZXRQYXRoIiwicmVjb3JkZXJXb3JrbGV0IiwiQXVkaW9Xb3JrbGV0Tm9kZSIsIldPUktMRVRfTkFNRSIsImNvbm5lY3QiLCJkZXN0aW5hdGlvbiIsInBvcnQiLCJvbm1lc3NhZ2UiLCJkYXRhIiwiUGF5bG9hZEV2ZW50IiwiVGltZWtlZXAiLCJBbXBsaXR1ZGVNYXJrIiwiYW1wbGl0dWRlcyIsInB1c2giLCJwdXNoVmFsdWUiLCJyZWNvcmRlclByb2Nlc3NvciIsImNyZWF0ZVNjcmlwdFByb2Nlc3NvciIsImFkZEV2ZW50TGlzdGVuZXIiLCJvbkF1ZGlvUHJvY2VzcyIsIlJlY29yZGVyIiwiZW5jb2RlclBhdGgiLCJlbmNvZGVyU2FtcGxlUmF0ZSIsImVuY29kZXJBcHBsaWNhdGlvbiIsInN0cmVhbVBhZ2VzIiwiZW5jb2RlckZyYW1lU2l6ZSIsIm51bWJlck9mQ2hhbm5lbHMiLCJzb3VyY2VOb2RlIiwiZW5jb2RlckJpdFJhdGUiLCJlbmNvZGVyQ29tcGxleGl0eSIsInJlc2FtcGxlUXVhbGl0eSIsIm9uZGF0YWF2YWlsYWJsZSIsImEiLCJidWYiLCJuZXdCdWYiLCJzZXQiLCJlIiwibG9nZ2VyIiwiZXJyb3IiLCJET01FeGNlcHRpb24iLCJuYW1lIiwiY29kZSIsIm1lc3NhZ2UiLCJnZXRUcmFja3MiLCJmb3JFYWNoIiwidCIsImRpc2Nvbm5lY3QiLCJjbG9zZSIsImF1ZGlvQnVmZmVyIiwic2xpY2UiLCJsaXZlRGF0YSIsImlzU3VwcG9ydGVkIiwiaXNSZWNvcmRpbmdTdXBwb3J0ZWQiLCJoYXNSZWNvcmRpbmciLCJzdGFydCIsImxhc3RVcGxvYWQiLCJTaW1wbGVPYnNlcnZhYmxlIiwiU3RhcnRlZCIsInJlbW92ZUV2ZW50TGlzdGVuZXIiLCJFbmRlZCIsImdldFBsYXliYWNrIiwicGxheWJhY2siLCJQbGF5YmFjayIsImRlc3Ryb3kiLCJyZW1vdmVBbGxMaXN0ZW5lcnMiLCJmb3JnZXRBbGxGb3IiLCJ1cGxvYWQiLCJpblJvb21JZCIsIlVwbG9hZGluZyIsInVybCIsIm14YyIsImZpbGUiLCJlbmNyeXB0ZWQiLCJ1cGxvYWRGaWxlIiwiQmxvYiIsInR5cGUiLCJVcGxvYWRlZCJdLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9hdWRpby9Wb2ljZVJlY29yZGluZy50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMjEgVGhlIE1hdHJpeC5vcmcgRm91bmRhdGlvbiBDLkkuQy5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQgKiBhcyBSZWNvcmRlciBmcm9tICdvcHVzLXJlY29yZGVyJztcbmltcG9ydCBlbmNvZGVyUGF0aCBmcm9tICdvcHVzLXJlY29yZGVyL2Rpc3QvZW5jb2Rlcldvcmtlci5taW4uanMnO1xuaW1wb3J0IHsgTWF0cml4Q2xpZW50IH0gZnJvbSBcIm1hdHJpeC1qcy1zZGsvc3JjL2NsaWVudFwiO1xuaW1wb3J0IHsgU2ltcGxlT2JzZXJ2YWJsZSB9IGZyb20gXCJtYXRyaXgtd2lkZ2V0LWFwaVwiO1xuaW1wb3J0IEV2ZW50RW1pdHRlciBmcm9tIFwiZXZlbnRzXCI7XG5pbXBvcnQgeyBJRW5jcnlwdGVkRmlsZSB9IGZyb20gXCJtYXRyaXgtanMtc2RrL3NyYy9AdHlwZXMvZXZlbnRcIjtcbmltcG9ydCB7IGxvZ2dlciB9IGZyb20gXCJtYXRyaXgtanMtc2RrL3NyYy9sb2dnZXJcIjtcblxuaW1wb3J0IE1lZGlhRGV2aWNlSGFuZGxlciBmcm9tIFwiLi4vTWVkaWFEZXZpY2VIYW5kbGVyXCI7XG5pbXBvcnQgeyBJRGVzdHJveWFibGUgfSBmcm9tIFwiLi4vdXRpbHMvSURlc3Ryb3lhYmxlXCI7XG5pbXBvcnQgeyBTaW5nbGVmbGlnaHQgfSBmcm9tIFwiLi4vdXRpbHMvU2luZ2xlZmxpZ2h0XCI7XG5pbXBvcnQgeyBQYXlsb2FkRXZlbnQsIFdPUktMRVRfTkFNRSB9IGZyb20gXCIuL2NvbnN0c1wiO1xuaW1wb3J0IHsgVVBEQVRFX0VWRU5UIH0gZnJvbSBcIi4uL3N0b3Jlcy9Bc3luY1N0b3JlXCI7XG5pbXBvcnQgeyBQbGF5YmFjayB9IGZyb20gXCIuL1BsYXliYWNrXCI7XG5pbXBvcnQgeyBjcmVhdGVBdWRpb0NvbnRleHQgfSBmcm9tIFwiLi9jb21wYXRcIjtcbmltcG9ydCB7IHVwbG9hZEZpbGUgfSBmcm9tIFwiLi4vQ29udGVudE1lc3NhZ2VzXCI7XG5pbXBvcnQgeyBGaXhlZFJvbGxpbmdBcnJheSB9IGZyb20gXCIuLi91dGlscy9GaXhlZFJvbGxpbmdBcnJheVwiO1xuaW1wb3J0IHsgY2xhbXAgfSBmcm9tIFwiLi4vdXRpbHMvbnVtYmVyc1wiO1xuaW1wb3J0IG14UmVjb3JkZXJXb3JrbGV0UGF0aCBmcm9tIFwiLi9SZWNvcmRlcldvcmtsZXRcIjtcblxuY29uc3QgQ0hBTk5FTFMgPSAxOyAvLyBzdGVyZW8gaXNuJ3QgaW1wb3J0YW50XG5leHBvcnQgY29uc3QgU0FNUExFX1JBVEUgPSA0ODAwMDsgLy8gNDhraHogaXMgd2hhdCBXZWJSVEMgdXNlcy4gMTJraHogaXMgd2hlcmUgd2UgbG9zZSBxdWFsaXR5LlxuY29uc3QgQklUUkFURSA9IDI0MDAwOyAvLyAyNGticHMgaXMgcHJldHR5IGhpZ2ggcXVhbGl0eSBmb3Igb3VyIHVzZSBjYXNlIGluIG9wdXMuXG5jb25zdCBUQVJHRVRfTUFYX0xFTkdUSCA9IDkwMDsgLy8gMTUgbWludXRlcyBpbiBzZWNvbmRzLiBTb21ld2hhdCBhcmJpdHJhcnksIHRob3VnaCBsb25nZXIgPT0gbGFyZ2VyIGZpbGVzLlxuY29uc3QgVEFSR0VUX1dBUk5fVElNRV9MRUZUID0gMTA7IC8vIDEwIHNlY29uZHMsIGFsc28gc29tZXdoYXQgYXJiaXRyYXJ5LlxuXG5leHBvcnQgY29uc3QgUkVDT1JESU5HX1BMQVlCQUNLX1NBTVBMRVMgPSA0NDtcblxuZXhwb3J0IGludGVyZmFjZSBJUmVjb3JkaW5nVXBkYXRlIHtcbiAgICB3YXZlZm9ybTogbnVtYmVyW107IC8vIGZsb2F0aW5nIHBvaW50cyBiZXR3ZWVuIDAgKGxvdykgYW5kIDEgKGhpZ2gpLlxuICAgIHRpbWVTZWNvbmRzOiBudW1iZXI7IC8vIGZsb2F0XG59XG5cbmV4cG9ydCBlbnVtIFJlY29yZGluZ1N0YXRlIHtcbiAgICBTdGFydGVkID0gXCJzdGFydGVkXCIsXG4gICAgRW5kaW5nU29vbiA9IFwiZW5kaW5nX3Nvb25cIiwgLy8gZW1pdHMgYW4gb2JqZWN0IHdpdGggYSBzaW5nbGUgbnVtZXJpY2FsIHZhbHVlOiBzZWNvbmRzTGVmdFxuICAgIEVuZGVkID0gXCJlbmRlZFwiLFxuICAgIFVwbG9hZGluZyA9IFwidXBsb2FkaW5nXCIsXG4gICAgVXBsb2FkZWQgPSBcInVwbG9hZGVkXCIsXG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgSVVwbG9hZCB7XG4gICAgbXhjPzogc3RyaW5nOyAvLyBmb3IgdW5lbmNyeXB0ZWQgdXBsb2Fkc1xuICAgIGVuY3J5cHRlZD86IElFbmNyeXB0ZWRGaWxlO1xufVxuXG5leHBvcnQgY2xhc3MgVm9pY2VSZWNvcmRpbmcgZXh0ZW5kcyBFdmVudEVtaXR0ZXIgaW1wbGVtZW50cyBJRGVzdHJveWFibGUge1xuICAgIHByaXZhdGUgcmVjb3JkZXI6IFJlY29yZGVyO1xuICAgIHByaXZhdGUgcmVjb3JkZXJDb250ZXh0OiBBdWRpb0NvbnRleHQ7XG4gICAgcHJpdmF0ZSByZWNvcmRlclNvdXJjZTogTWVkaWFTdHJlYW1BdWRpb1NvdXJjZU5vZGU7XG4gICAgcHJpdmF0ZSByZWNvcmRlclN0cmVhbTogTWVkaWFTdHJlYW07XG4gICAgcHJpdmF0ZSByZWNvcmRlcldvcmtsZXQ6IEF1ZGlvV29ya2xldE5vZGU7XG4gICAgcHJpdmF0ZSByZWNvcmRlclByb2Nlc3NvcjogU2NyaXB0UHJvY2Vzc29yTm9kZTtcbiAgICBwcml2YXRlIGJ1ZmZlciA9IG5ldyBVaW50OEFycmF5KDApOyAvLyB1c2UgdGhpcy5hdWRpb0J1ZmZlciB0byBhY2Nlc3NcbiAgICBwcml2YXRlIGxhc3RVcGxvYWQ6IElVcGxvYWQ7XG4gICAgcHJpdmF0ZSByZWNvcmRpbmcgPSBmYWxzZTtcbiAgICBwcml2YXRlIG9ic2VydmFibGU6IFNpbXBsZU9ic2VydmFibGU8SVJlY29yZGluZ1VwZGF0ZT47XG4gICAgcHJpdmF0ZSBhbXBsaXR1ZGVzOiBudW1iZXJbXSA9IFtdOyAvLyBhdCBlYWNoIHNlY29uZCBtYXJrLCBnZW5lcmF0ZWRcbiAgICBwcml2YXRlIHBsYXliYWNrOiBQbGF5YmFjaztcbiAgICBwcml2YXRlIGxpdmVXYXZlZm9ybSA9IG5ldyBGaXhlZFJvbGxpbmdBcnJheShSRUNPUkRJTkdfUExBWUJBQ0tfU0FNUExFUywgMCk7XG5cbiAgICBwdWJsaWMgY29uc3RydWN0b3IocHJpdmF0ZSBjbGllbnQ6IE1hdHJpeENsaWVudCkge1xuICAgICAgICBzdXBlcigpO1xuICAgIH1cblxuICAgIHB1YmxpYyBnZXQgY29udGVudFR5cGUoKTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIFwiYXVkaW8vb2dnXCI7XG4gICAgfVxuXG4gICAgcHVibGljIGdldCBjb250ZW50TGVuZ3RoKCk6IG51bWJlciB7XG4gICAgICAgIHJldHVybiB0aGlzLmJ1ZmZlci5sZW5ndGg7XG4gICAgfVxuXG4gICAgcHVibGljIGdldCBkdXJhdGlvblNlY29uZHMoKTogbnVtYmVyIHtcbiAgICAgICAgaWYgKCF0aGlzLnJlY29yZGVyKSB0aHJvdyBuZXcgRXJyb3IoXCJEdXJhdGlvbiBub3QgYXZhaWxhYmxlIHdpdGhvdXQgYSByZWNvcmRpbmdcIik7XG4gICAgICAgIHJldHVybiB0aGlzLnJlY29yZGVyQ29udGV4dC5jdXJyZW50VGltZTtcbiAgICB9XG5cbiAgICBwdWJsaWMgZ2V0IGlzUmVjb3JkaW5nKCk6IGJvb2xlYW4ge1xuICAgICAgICByZXR1cm4gdGhpcy5yZWNvcmRpbmc7XG4gICAgfVxuXG4gICAgcHVibGljIGVtaXQoZXZlbnQ6IHN0cmluZywgLi4uYXJnczogYW55W10pOiBib29sZWFuIHtcbiAgICAgICAgc3VwZXIuZW1pdChldmVudCwgLi4uYXJncyk7XG4gICAgICAgIHN1cGVyLmVtaXQoVVBEQVRFX0VWRU5ULCBldmVudCwgLi4uYXJncyk7XG4gICAgICAgIHJldHVybiB0cnVlOyAvLyB3ZSBkb24ndCBldmVyIGNhcmUgaWYgdGhlIGV2ZW50IGhhZCBsaXN0ZW5lcnMsIHNvIGp1c3QgcmV0dXJuIFwieWVzXCJcbiAgICB9XG5cbiAgICBwcml2YXRlIGFzeW5jIG1ha2VSZWNvcmRlcigpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHRoaXMucmVjb3JkZXJTdHJlYW0gPSBhd2FpdCBuYXZpZ2F0b3IubWVkaWFEZXZpY2VzLmdldFVzZXJNZWRpYSh7XG4gICAgICAgICAgICAgICAgYXVkaW86IHtcbiAgICAgICAgICAgICAgICAgICAgY2hhbm5lbENvdW50OiBDSEFOTkVMUyxcbiAgICAgICAgICAgICAgICAgICAgbm9pc2VTdXBwcmVzc2lvbjogdHJ1ZSwgLy8gYnJvd3NlcnMgaWdub3JlIGNvbnN0cmFpbnRzIHRoZXkgY2FuJ3QgaG9ub3VyXG4gICAgICAgICAgICAgICAgICAgIGRldmljZUlkOiBNZWRpYURldmljZUhhbmRsZXIuZ2V0QXVkaW9JbnB1dCgpLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHRoaXMucmVjb3JkZXJDb250ZXh0ID0gY3JlYXRlQXVkaW9Db250ZXh0KHtcbiAgICAgICAgICAgICAgICAvLyBsYXRlbmN5SGludDogXCJpbnRlcmFjdGl2ZVwiLCAvLyB3ZSBkb24ndCB3YW50IGEgbGF0ZW5jeSBoaW50ICh0aGlzIGNhdXNlcyBkYXRhIHNtb290aGluZylcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgdGhpcy5yZWNvcmRlclNvdXJjZSA9IHRoaXMucmVjb3JkZXJDb250ZXh0LmNyZWF0ZU1lZGlhU3RyZWFtU291cmNlKHRoaXMucmVjb3JkZXJTdHJlYW0pO1xuXG4gICAgICAgICAgICAvLyBDb25uZWN0IG91ciBpbnB1dHMgYW5kIG91dHB1dHNcbiAgICAgICAgICAgIGlmICh0aGlzLnJlY29yZGVyQ29udGV4dC5hdWRpb1dvcmtsZXQpIHtcbiAgICAgICAgICAgICAgICAvLyBTZXQgdXAgb3VyIHdvcmtsZXQuIFdlIHVzZSB0aGlzIGZvciB0aW1pbmcgaW5mb3JtYXRpb24gYW5kIHdhdmVmb3JtIGFuYWx5c2lzOiB0aGVcbiAgICAgICAgICAgICAgICAvLyB3ZWIgYXVkaW8gQVBJIHByZWZlcnMgdGhpcyBiZSBkb25lIGFzeW5jIHRvIGF2b2lkIGhvbGRpbmcgdGhlIG1haW4gdGhyZWFkIHdpdGggbWF0aC5cbiAgICAgICAgICAgICAgICBhd2FpdCB0aGlzLnJlY29yZGVyQ29udGV4dC5hdWRpb1dvcmtsZXQuYWRkTW9kdWxlKG14UmVjb3JkZXJXb3JrbGV0UGF0aCk7XG4gICAgICAgICAgICAgICAgdGhpcy5yZWNvcmRlcldvcmtsZXQgPSBuZXcgQXVkaW9Xb3JrbGV0Tm9kZSh0aGlzLnJlY29yZGVyQ29udGV4dCwgV09SS0xFVF9OQU1FKTtcbiAgICAgICAgICAgICAgICB0aGlzLnJlY29yZGVyU291cmNlLmNvbm5lY3QodGhpcy5yZWNvcmRlcldvcmtsZXQpO1xuICAgICAgICAgICAgICAgIHRoaXMucmVjb3JkZXJXb3JrbGV0LmNvbm5lY3QodGhpcy5yZWNvcmRlckNvbnRleHQuZGVzdGluYXRpb24pO1xuXG4gICAgICAgICAgICAgICAgLy8gRGV2IG5vdGU6IHdlIGNhbid0IHVzZSBgYWRkRXZlbnRMaXN0ZW5lcmAgZm9yIHNvbWUgcmVhc29uLiBJdCBqdXN0IGRvZXNuJ3Qgd29yay5cbiAgICAgICAgICAgICAgICB0aGlzLnJlY29yZGVyV29ya2xldC5wb3J0Lm9ubWVzc2FnZSA9IChldikgPT4ge1xuICAgICAgICAgICAgICAgICAgICBzd2l0Y2ggKGV2LmRhdGFbJ2V2J10pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgUGF5bG9hZEV2ZW50LlRpbWVrZWVwOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucHJvY2Vzc0F1ZGlvVXBkYXRlKGV2LmRhdGFbJ3RpbWVTZWNvbmRzJ10pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSBQYXlsb2FkRXZlbnQuQW1wbGl0dWRlTWFyazpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBTYW5pdHkgY2hlY2sgdG8gbWFrZSBzdXJlIHdlJ3JlIGFkZGluZyBhYm91dCBvbmUgc2FtcGxlIHBlciBzZWNvbmRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoZXYuZGF0YVsnZm9ySW5kZXgnXSA9PT0gdGhpcy5hbXBsaXR1ZGVzLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmFtcGxpdHVkZXMucHVzaChldi5kYXRhWydhbXBsaXR1ZGUnXSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubGl2ZVdhdmVmb3JtLnB1c2hWYWx1ZShldi5kYXRhWydhbXBsaXR1ZGUnXSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgLy8gU2FmYXJpIGZhbGxiYWNrOiB1c2UgYSBwcm9jZXNzb3Igbm9kZSBpbnN0ZWFkLCBidWZmZXJlZCB0byAxMDI0IGJ5dGVzIG9mIGRhdGFcbiAgICAgICAgICAgICAgICAvLyBsaWtlIHRoZSB3b3JrbGV0IGlzLlxuICAgICAgICAgICAgICAgIHRoaXMucmVjb3JkZXJQcm9jZXNzb3IgPSB0aGlzLnJlY29yZGVyQ29udGV4dC5jcmVhdGVTY3JpcHRQcm9jZXNzb3IoMTAyNCwgQ0hBTk5FTFMsIENIQU5ORUxTKTtcbiAgICAgICAgICAgICAgICB0aGlzLnJlY29yZGVyU291cmNlLmNvbm5lY3QodGhpcy5yZWNvcmRlclByb2Nlc3Nvcik7XG4gICAgICAgICAgICAgICAgdGhpcy5yZWNvcmRlclByb2Nlc3Nvci5jb25uZWN0KHRoaXMucmVjb3JkZXJDb250ZXh0LmRlc3RpbmF0aW9uKTtcbiAgICAgICAgICAgICAgICB0aGlzLnJlY29yZGVyUHJvY2Vzc29yLmFkZEV2ZW50TGlzdGVuZXIoXCJhdWRpb3Byb2Nlc3NcIiwgdGhpcy5vbkF1ZGlvUHJvY2Vzcyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoaXMucmVjb3JkZXIgPSBuZXcgUmVjb3JkZXIoe1xuICAgICAgICAgICAgICAgIGVuY29kZXJQYXRoLCAvLyBtYWdpYyBmcm9tIHdlYnBhY2tcbiAgICAgICAgICAgICAgICBlbmNvZGVyU2FtcGxlUmF0ZTogU0FNUExFX1JBVEUsXG4gICAgICAgICAgICAgICAgZW5jb2RlckFwcGxpY2F0aW9uOiAyMDQ4LCAvLyB2b2ljZSAoZGVmYXVsdCBpcyBcImF1ZGlvXCIpXG4gICAgICAgICAgICAgICAgc3RyZWFtUGFnZXM6IHRydWUsIC8vIHRoaXMgc3BlZWRzIHVwIHRoZSBlbmNvZGluZyBwcm9jZXNzIGJ5IHVzaW5nIENQVSBvdmVyIHRpbWVcbiAgICAgICAgICAgICAgICBlbmNvZGVyRnJhbWVTaXplOiAyMCwgLy8gbXMsIGFyYml0cmFyeSBmcmFtZSBzaXplIHdlIHNlbmQgdG8gdGhlIGVuY29kZXJcbiAgICAgICAgICAgICAgICBudW1iZXJPZkNoYW5uZWxzOiBDSEFOTkVMUyxcbiAgICAgICAgICAgICAgICBzb3VyY2VOb2RlOiB0aGlzLnJlY29yZGVyU291cmNlLFxuICAgICAgICAgICAgICAgIGVuY29kZXJCaXRSYXRlOiBCSVRSQVRFLFxuXG4gICAgICAgICAgICAgICAgLy8gV2UgdXNlIGxvdyB2YWx1ZXMgZm9yIHRoZSBmb2xsb3dpbmcgdG8gZWFzZSBDUFUgdXNhZ2UgLSB0aGUgcmVzdWx0aW5nIHdhdmVmb3JtXG4gICAgICAgICAgICAgICAgLy8gaXMgaW5kaXN0aW5ndWlzaGFibGUgZm9yIGEgdm9pY2UgbWVzc2FnZS4gTm90ZSB0aGF0IHRoZSB1bmRlcmx5aW5nIGxpYnJhcnkgd2lsbFxuICAgICAgICAgICAgICAgIC8vIHBpY2sgZGVmYXVsdHMgd2hpY2ggcHJlZmVyIHRoZSBoaWdoZXN0IHBvc3NpYmxlIHF1YWxpdHksIENQVSBiZSBkYW1uZWQuXG4gICAgICAgICAgICAgICAgZW5jb2RlckNvbXBsZXhpdHk6IDMsIC8vIDAtMTAsIDEwIGlzIHNsb3cgYW5kIGhpZ2ggcXVhbGl0eS5cbiAgICAgICAgICAgICAgICByZXNhbXBsZVF1YWxpdHk6IDMsIC8vIDAtMTAsIDEwIGlzIHNsb3cgYW5kIGhpZ2ggcXVhbGl0eVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB0aGlzLnJlY29yZGVyLm9uZGF0YWF2YWlsYWJsZSA9IChhOiBBcnJheUJ1ZmZlcikgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IGJ1ZiA9IG5ldyBVaW50OEFycmF5KGEpO1xuICAgICAgICAgICAgICAgIGNvbnN0IG5ld0J1ZiA9IG5ldyBVaW50OEFycmF5KHRoaXMuYnVmZmVyLmxlbmd0aCArIGJ1Zi5sZW5ndGgpO1xuICAgICAgICAgICAgICAgIG5ld0J1Zi5zZXQodGhpcy5idWZmZXIsIDApO1xuICAgICAgICAgICAgICAgIG5ld0J1Zi5zZXQoYnVmLCB0aGlzLmJ1ZmZlci5sZW5ndGgpO1xuICAgICAgICAgICAgICAgIHRoaXMuYnVmZmVyID0gbmV3QnVmO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgbG9nZ2VyLmVycm9yKFwiRXJyb3Igc3RhcnRpbmcgcmVjb3JkaW5nOiBcIiwgZSk7XG4gICAgICAgICAgICBpZiAoZSBpbnN0YW5jZW9mIERPTUV4Y2VwdGlvbikgeyAvLyBVbmhlbHBmdWwgRE9NRXhjZXB0aW9ucyBhcmUgY29tbW9uIC0gcGFyc2UgdGhlbSBzYW5lbHlcbiAgICAgICAgICAgICAgICBsb2dnZXIuZXJyb3IoYCR7ZS5uYW1lfSAoJHtlLmNvZGV9KTogJHtlLm1lc3NhZ2V9YCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIENsZWFuIHVwIGFzIGJlc3QgYXMgcG9zc2libGVcbiAgICAgICAgICAgIGlmICh0aGlzLnJlY29yZGVyU3RyZWFtKSB0aGlzLnJlY29yZGVyU3RyZWFtLmdldFRyYWNrcygpLmZvckVhY2godCA9PiB0LnN0b3AoKSk7XG4gICAgICAgICAgICBpZiAodGhpcy5yZWNvcmRlclNvdXJjZSkgdGhpcy5yZWNvcmRlclNvdXJjZS5kaXNjb25uZWN0KCk7XG4gICAgICAgICAgICBpZiAodGhpcy5yZWNvcmRlcikgdGhpcy5yZWNvcmRlci5jbG9zZSgpO1xuICAgICAgICAgICAgaWYgKHRoaXMucmVjb3JkZXJDb250ZXh0KSB7XG4gICAgICAgICAgICAgICAgLy8gbm9pbnNwZWN0aW9uIEVTNk1pc3NpbmdBd2FpdCAtIG5vdCBpbXBvcnRhbnQgdGhhdCB3ZSB3YWl0XG4gICAgICAgICAgICAgICAgdGhpcy5yZWNvcmRlckNvbnRleHQuY2xvc2UoKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhyb3cgZTsgLy8gcmV0aHJvdyBzbyB1cHN0cmVhbSBjYW4gaGFuZGxlIGl0XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIGdldCBhdWRpb0J1ZmZlcigpOiBVaW50OEFycmF5IHtcbiAgICAgICAgLy8gV2UgbmVlZCBhIGNsb25lIG9mIHRoZSBidWZmZXIgdG8gYXZvaWQgYWNjaWRlbnRhbGx5IGNoYW5naW5nIHRoZSBwb3NpdGlvblxuICAgICAgICAvLyBvbiB0aGUgcmVhbCB0aGluZy5cbiAgICAgICAgcmV0dXJuIHRoaXMuYnVmZmVyLnNsaWNlKDApO1xuICAgIH1cblxuICAgIHB1YmxpYyBnZXQgbGl2ZURhdGEoKTogU2ltcGxlT2JzZXJ2YWJsZTxJUmVjb3JkaW5nVXBkYXRlPiB7XG4gICAgICAgIGlmICghdGhpcy5yZWNvcmRpbmcpIHRocm93IG5ldyBFcnJvcihcIk5vIG9ic2VydmFibGUgd2hlbiBub3QgcmVjb3JkaW5nXCIpO1xuICAgICAgICByZXR1cm4gdGhpcy5vYnNlcnZhYmxlO1xuICAgIH1cblxuICAgIHB1YmxpYyBnZXQgaXNTdXBwb3J0ZWQoKTogYm9vbGVhbiB7XG4gICAgICAgIHJldHVybiAhIVJlY29yZGVyLmlzUmVjb3JkaW5nU3VwcG9ydGVkKCk7XG4gICAgfVxuXG4gICAgcHVibGljIGdldCBoYXNSZWNvcmRpbmcoKTogYm9vbGVhbiB7XG4gICAgICAgIHJldHVybiB0aGlzLmJ1ZmZlci5sZW5ndGggPiAwO1xuICAgIH1cblxuICAgIHByaXZhdGUgb25BdWRpb1Byb2Nlc3MgPSAoZXY6IEF1ZGlvUHJvY2Vzc2luZ0V2ZW50KSA9PiB7XG4gICAgICAgIHRoaXMucHJvY2Vzc0F1ZGlvVXBkYXRlKGV2LnBsYXliYWNrVGltZSk7XG5cbiAgICAgICAgLy8gV2Ugc2tpcCB0aGUgZnVuY3Rpb25hbGl0eSBvZiB0aGUgd29ya2xldCByZWdhcmRpbmcgd2F2ZWZvcm0gY2FsY3VsYXRpb25zOiB3ZVxuICAgICAgICAvLyBzaG91bGQgZ2V0IHRoYXQgaW5mb3JtYXRpb24gcHJldHR5IHF1aWNrIGR1cmluZyB0aGUgcGxheWJhY2sgaW5mby5cbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBwcm9jZXNzQXVkaW9VcGRhdGUgPSAodGltZVNlY29uZHM6IG51bWJlcikgPT4ge1xuICAgICAgICBpZiAoIXRoaXMucmVjb3JkaW5nKSByZXR1cm47XG5cbiAgICAgICAgdGhpcy5vYnNlcnZhYmxlLnVwZGF0ZSh7XG4gICAgICAgICAgICB3YXZlZm9ybTogdGhpcy5saXZlV2F2ZWZvcm0udmFsdWUubWFwKHYgPT4gY2xhbXAodiwgMCwgMSkpLFxuICAgICAgICAgICAgdGltZVNlY29uZHM6IHRpbWVTZWNvbmRzLFxuICAgICAgICB9KTtcblxuICAgICAgICAvLyBOb3cgdGhhdCB3ZSd2ZSB1cGRhdGVkIHRoZSBkYXRhL3dhdmVmb3JtLCBsZXQncyBkbyBhIHRpbWUgY2hlY2suIFdlIGRvbid0IHdhbnQgdG9cbiAgICAgICAgLy8gZ28gaG9ycmlibHkgb3ZlciB0aGUgbGltaXQuIFdlIGFsc28gZW1pdCBhIHdhcm5pbmcgc3RhdGUgaWYgbmVlZGVkLlxuICAgICAgICAvL1xuICAgICAgICAvLyBXZSB1c2UgdGhlIHJlY29yZGVyJ3MgcGVyc3BlY3RpdmUgb2YgdGltZSB0byBtYWtlIHN1cmUgd2UgZG9uJ3QgY3V0IG9mZiB0aGUgbGFzdFxuICAgICAgICAvLyBmcmFtZSBvZiBhdWRpbywgb3RoZXJ3aXNlIHdlIGVuZCB1cCB3aXRoIGEgMTQ6NTkgY2xpcCAoODk5LjY4IHNlY29uZHMpLiBUaGlzIGV4dHJhXG4gICAgICAgIC8vIHNhZmV0eSBjYW4gYWxsb3cgdXMgdG8gb3ZlcnNob290IHRoZSB0YXJnZXQgYSBiaXQsIGJ1dCBhdCBsZWFzdCB3aGVuIHdlIHNheSAxNW1pblxuICAgICAgICAvLyBtYXhpbXVtIHdlIGFjdHVhbGx5IG1lYW4gaXQuXG4gICAgICAgIC8vXG4gICAgICAgIC8vIEluIHRlc3RpbmcsIHJlY29yZGVyIHRpbWUgYW5kIHdvcmtlciB0aW1lIGxhZyBieSBhYm91dCA0MDBtcywgd2hpY2ggaXMgcm91Z2hseSB0aGVcbiAgICAgICAgLy8gdGltZSBuZWVkZWQgdG8gZW5jb2RlIGEgc2FtcGxlL2ZyYW1lLlxuICAgICAgICAvL1xuICAgICAgICAvLyBSZWYgZm9yIHJlY29yZGVyU2Vjb25kczogaHR0cHM6Ly9naXRodWIuY29tL2NocmlzLXJ1ZG1pbi9vcHVzLXJlY29yZGVyI2luc3RhbmNlLWZpZWxkc1xuICAgICAgICBjb25zdCByZWNvcmRlclNlY29uZHMgPSB0aGlzLnJlY29yZGVyLmVuY29kZWRTYW1wbGVQb3NpdGlvbiAvIDQ4MDAwO1xuICAgICAgICBjb25zdCBzZWNvbmRzTGVmdCA9IFRBUkdFVF9NQVhfTEVOR1RIIC0gcmVjb3JkZXJTZWNvbmRzO1xuICAgICAgICBpZiAoc2Vjb25kc0xlZnQgPCAwKSB7IC8vIGdvIG92ZXIgdG8gbWFrZSBzdXJlIHdlIGRlZmluaXRlbHkgY2FwdHVyZSB0aGF0IGxhc3QgZnJhbWVcbiAgICAgICAgICAgIC8vIG5vaW5zcGVjdGlvbiBKU0lnbm9yZWRQcm9taXNlRnJvbUNhbGwgLSB3ZSBhcmVuJ3QgY29uY2VybmVkIHdpdGggaXQgb3ZlcmxhcHBpbmdcbiAgICAgICAgICAgIHRoaXMuc3RvcCgpO1xuICAgICAgICB9IGVsc2UgaWYgKHNlY29uZHNMZWZ0IDw9IFRBUkdFVF9XQVJOX1RJTUVfTEVGVCkge1xuICAgICAgICAgICAgU2luZ2xlZmxpZ2h0LmZvcih0aGlzLCBcImVuZGluZ19zb29uXCIpLmRvKCgpID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLmVtaXQoUmVjb3JkaW5nU3RhdGUuRW5kaW5nU29vbiwgeyBzZWNvbmRzTGVmdCB9KTtcbiAgICAgICAgICAgICAgICByZXR1cm4gU2luZ2xlZmxpZ2h0LlZvaWQ7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBwdWJsaWMgYXN5bmMgc3RhcnQoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgICAgIGlmICh0aGlzLmxhc3RVcGxvYWQgfHwgdGhpcy5oYXNSZWNvcmRpbmcpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIlJlY29yZGluZyBhbHJlYWR5IHByZXBhcmVkXCIpO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLnJlY29yZGluZykge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiUmVjb3JkaW5nIGFscmVhZHkgaW4gcHJvZ3Jlc3NcIik7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMub2JzZXJ2YWJsZSkge1xuICAgICAgICAgICAgdGhpcy5vYnNlcnZhYmxlLmNsb3NlKCk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5vYnNlcnZhYmxlID0gbmV3IFNpbXBsZU9ic2VydmFibGU8SVJlY29yZGluZ1VwZGF0ZT4oKTtcbiAgICAgICAgYXdhaXQgdGhpcy5tYWtlUmVjb3JkZXIoKTtcbiAgICAgICAgYXdhaXQgdGhpcy5yZWNvcmRlci5zdGFydCgpO1xuICAgICAgICB0aGlzLnJlY29yZGluZyA9IHRydWU7XG4gICAgICAgIHRoaXMuZW1pdChSZWNvcmRpbmdTdGF0ZS5TdGFydGVkKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgYXN5bmMgc3RvcCgpOiBQcm9taXNlPFVpbnQ4QXJyYXk+IHtcbiAgICAgICAgcmV0dXJuIFNpbmdsZWZsaWdodC5mb3IodGhpcywgXCJzdG9wXCIpLmRvKGFzeW5jICgpID0+IHtcbiAgICAgICAgICAgIGlmICghdGhpcy5yZWNvcmRpbmcpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJObyByZWNvcmRpbmcgdG8gc3RvcFwiKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gRGlzY29ubmVjdCB0aGUgc291cmNlIGVhcmx5IHRvIHN0YXJ0IHNodXR0aW5nIGRvd24gcmVzb3VyY2VzXG4gICAgICAgICAgICBhd2FpdCB0aGlzLnJlY29yZGVyLnN0b3AoKTsgLy8gc3RvcCBmaXJzdCB0byBmbHVzaCB0aGUgbGFzdCBmcmFtZVxuICAgICAgICAgICAgdGhpcy5yZWNvcmRlclNvdXJjZS5kaXNjb25uZWN0KCk7XG4gICAgICAgICAgICBpZiAodGhpcy5yZWNvcmRlcldvcmtsZXQpIHRoaXMucmVjb3JkZXJXb3JrbGV0LmRpc2Nvbm5lY3QoKTtcbiAgICAgICAgICAgIGlmICh0aGlzLnJlY29yZGVyUHJvY2Vzc29yKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5yZWNvcmRlclByb2Nlc3Nvci5kaXNjb25uZWN0KCk7XG4gICAgICAgICAgICAgICAgdGhpcy5yZWNvcmRlclByb2Nlc3Nvci5yZW1vdmVFdmVudExpc3RlbmVyKFwiYXVkaW9wcm9jZXNzXCIsIHRoaXMub25BdWRpb1Byb2Nlc3MpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBjbG9zZSB0aGUgY29udGV4dCBhZnRlciB0aGUgcmVjb3JkZXIgc28gdGhlIHJlY29yZGVyIGRvZXNuJ3QgdHJ5IHRvXG4gICAgICAgICAgICAvLyBjb25uZWN0IGFueXRoaW5nIHRvIHRoZSBjb250ZXh0ICh0aGlzIHdvdWxkIGdlbmVyYXRlIGEgd2FybmluZylcbiAgICAgICAgICAgIGF3YWl0IHRoaXMucmVjb3JkZXJDb250ZXh0LmNsb3NlKCk7XG5cbiAgICAgICAgICAgIC8vIE5vdyBzdG9wIGFsbCB0aGUgbWVkaWEgdHJhY2tzIHNvIHdlIGNhbiByZWxlYXNlIHRoZW0gYmFjayB0byB0aGUgdXNlci9PU1xuICAgICAgICAgICAgdGhpcy5yZWNvcmRlclN0cmVhbS5nZXRUcmFja3MoKS5mb3JFYWNoKHQgPT4gdC5zdG9wKCkpO1xuXG4gICAgICAgICAgICAvLyBGaW5hbGx5IGRvIG91ciBwb3N0LXByb2Nlc3NpbmcgYW5kIGNsZWFuIHVwXG4gICAgICAgICAgICB0aGlzLnJlY29yZGluZyA9IGZhbHNlO1xuICAgICAgICAgICAgYXdhaXQgdGhpcy5yZWNvcmRlci5jbG9zZSgpO1xuICAgICAgICAgICAgdGhpcy5lbWl0KFJlY29yZGluZ1N0YXRlLkVuZGVkKTtcblxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuYXVkaW9CdWZmZXI7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdldHMgYSBwbGF5YmFjayBpbnN0YW5jZSBmb3IgdGhpcyB2b2ljZSByZWNvcmRpbmcuIE5vdGUgdGhhdCB0aGUgcGxheWJhY2sgd2lsbCBub3RcbiAgICAgKiBoYXZlIGJlZW4gcHJlcGFyZWQgZnVsbHksIG1lYW5pbmcgdGhlIGBwcmVwYXJlKClgIGZ1bmN0aW9uIG5lZWRzIHRvIGJlIGNhbGxlZCBvbiBpdC5cbiAgICAgKlxuICAgICAqIFRoZSBzYW1lIHBsYXliYWNrIGluc3RhbmNlIGlzIHJldHVybmVkIGVhY2ggdGltZS5cbiAgICAgKlxuICAgICAqIEByZXR1cm5zIHtQbGF5YmFja30gVGhlIHBsYXliYWNrIGluc3RhbmNlLlxuICAgICAqL1xuICAgIHB1YmxpYyBnZXRQbGF5YmFjaygpOiBQbGF5YmFjayB7XG4gICAgICAgIHRoaXMucGxheWJhY2sgPSBTaW5nbGVmbGlnaHQuZm9yKHRoaXMsIFwicGxheWJhY2tcIikuZG8oKCkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIG5ldyBQbGF5YmFjayh0aGlzLmF1ZGlvQnVmZmVyLmJ1ZmZlciwgdGhpcy5hbXBsaXR1ZGVzKTsgLy8gY2FzdCB0byBBcnJheUJ1ZmZlciBwcm9wZXI7XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gdGhpcy5wbGF5YmFjaztcbiAgICB9XG5cbiAgICBwdWJsaWMgZGVzdHJveSgpIHtcbiAgICAgICAgLy8gbm9pbnNwZWN0aW9uIEpTSWdub3JlZFByb21pc2VGcm9tQ2FsbCAtIG5vdCBjb25jZXJuZWQgYWJvdXQgc3RvcCgpIGJlaW5nIGNhbGxlZCBhc3luYyBoZXJlXG4gICAgICAgIHRoaXMuc3RvcCgpO1xuICAgICAgICB0aGlzLnJlbW92ZUFsbExpc3RlbmVycygpO1xuICAgICAgICBTaW5nbGVmbGlnaHQuZm9yZ2V0QWxsRm9yKHRoaXMpO1xuICAgICAgICAvLyBub2luc3BlY3Rpb24gSlNJZ25vcmVkUHJvbWlzZUZyb21DYWxsIC0gbm90IGNvbmNlcm5lZCBhYm91dCBiZWluZyBjYWxsZWQgYXN5bmMgaGVyZVxuICAgICAgICB0aGlzLnBsYXliYWNrPy5kZXN0cm95KCk7XG4gICAgICAgIHRoaXMub2JzZXJ2YWJsZS5jbG9zZSgpO1xuICAgIH1cblxuICAgIHB1YmxpYyBhc3luYyB1cGxvYWQoaW5Sb29tSWQ6IHN0cmluZyk6IFByb21pc2U8SVVwbG9hZD4ge1xuICAgICAgICBpZiAoIXRoaXMuaGFzUmVjb3JkaW5nKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJObyByZWNvcmRpbmcgYXZhaWxhYmxlIHRvIHVwbG9hZFwiKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLmxhc3RVcGxvYWQpIHJldHVybiB0aGlzLmxhc3RVcGxvYWQ7XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHRoaXMuZW1pdChSZWNvcmRpbmdTdGF0ZS5VcGxvYWRpbmcpO1xuICAgICAgICAgICAgY29uc3QgeyB1cmw6IG14YywgZmlsZTogZW5jcnlwdGVkIH0gPSBhd2FpdCB1cGxvYWRGaWxlKHRoaXMuY2xpZW50LCBpblJvb21JZCwgbmV3IEJsb2IoW3RoaXMuYXVkaW9CdWZmZXJdLCB7XG4gICAgICAgICAgICAgICAgdHlwZTogdGhpcy5jb250ZW50VHlwZSxcbiAgICAgICAgICAgIH0pKTtcbiAgICAgICAgICAgIHRoaXMubGFzdFVwbG9hZCA9IHsgbXhjLCBlbmNyeXB0ZWQgfTtcbiAgICAgICAgICAgIHRoaXMuZW1pdChSZWNvcmRpbmdTdGF0ZS5VcGxvYWRlZCk7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIHRoaXMuZW1pdChSZWNvcmRpbmdTdGF0ZS5FbmRlZCk7XG4gICAgICAgICAgICB0aHJvdyBlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzLmxhc3RVcGxvYWQ7XG4gICAgfVxufVxuIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQWdCQTs7QUFDQTs7QUFFQTs7QUFDQTs7QUFFQTs7QUFFQTs7QUFFQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7Ozs7O0FBbENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQXNCQSxNQUFNQSxRQUFRLEdBQUcsQ0FBakIsQyxDQUFvQjs7QUFDYixNQUFNQyxXQUFXLEdBQUcsS0FBcEIsQyxDQUEyQjs7O0FBQ2xDLE1BQU1DLE9BQU8sR0FBRyxLQUFoQixDLENBQXVCOztBQUN2QixNQUFNQyxpQkFBaUIsR0FBRyxHQUExQixDLENBQStCOztBQUMvQixNQUFNQyxxQkFBcUIsR0FBRyxFQUE5QixDLENBQWtDOztBQUUzQixNQUFNQywwQkFBMEIsR0FBRyxFQUFuQzs7SUFPS0MsYzs7O1dBQUFBLGM7RUFBQUEsYztFQUFBQSxjO0VBQUFBLGM7RUFBQUEsYztFQUFBQSxjO0dBQUFBLGMsOEJBQUFBLGM7O0FBYUwsTUFBTUMsY0FBTixTQUE2QkMsZUFBN0IsQ0FBa0U7RUFPakM7RUFJRDtFQUk1QkMsV0FBVyxDQUFTQyxNQUFULEVBQStCO0lBQzdDO0lBRDZDLEtBQXRCQSxNQUFzQixHQUF0QkEsTUFBc0I7SUFBQTtJQUFBO0lBQUE7SUFBQTtJQUFBO0lBQUE7SUFBQSw4Q0FSaEMsSUFBSUMsVUFBSixDQUFlLENBQWYsQ0FRZ0M7SUFBQTtJQUFBLGlEQU43QixLQU02QjtJQUFBO0lBQUEsa0RBSmxCLEVBSWtCO0lBQUE7SUFBQSxvREFGMUIsSUFBSUMsb0NBQUosQ0FBc0JQLDBCQUF0QixFQUFrRCxDQUFsRCxDQUUwQjtJQUFBLHNEQXVJdkJRLEVBQUQsSUFBOEI7TUFDbkQsS0FBS0Msa0JBQUwsQ0FBd0JE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