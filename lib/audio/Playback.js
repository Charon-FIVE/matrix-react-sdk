"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.PlaybackState = exports.Playback = exports.PLAYBACK_WAVEFORM_SAMPLES = exports.DEFAULT_WAVEFORM = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _events = _interopRequireDefault(require("events"));

var _matrixWidgetApi = require("matrix-widget-api");

var _logger = require("matrix-js-sdk/src/logger");

var _AsyncStore = require("../stores/AsyncStore");

var _arrays = require("../utils/arrays");

var _PlaybackClock = require("./PlaybackClock");

var _compat = require("./compat");

var _numbers = require("../utils/numbers");

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
let PlaybackState;
exports.PlaybackState = PlaybackState;

(function (PlaybackState) {
  PlaybackState["Decoding"] = "decoding";
  PlaybackState["Stopped"] = "stopped";
  PlaybackState["Paused"] = "paused";
  PlaybackState["Playing"] = "playing";
})(PlaybackState || (exports.PlaybackState = PlaybackState = {}));

const PLAYBACK_WAVEFORM_SAMPLES = 39;
exports.PLAYBACK_WAVEFORM_SAMPLES = PLAYBACK_WAVEFORM_SAMPLES;
const THUMBNAIL_WAVEFORM_SAMPLES = 100; // arbitrary: [30,120]

const DEFAULT_WAVEFORM = (0, _arrays.arraySeed)(0, PLAYBACK_WAVEFORM_SAMPLES);
exports.DEFAULT_WAVEFORM = DEFAULT_WAVEFORM;

function makePlaybackWaveform(input) {
  // First, convert negative amplitudes to positive so we don't detect zero as "noisy".
  const noiseWaveform = input.map(v => Math.abs(v)); // Then, we'll resample the waveform using a smoothing approach so we can keep the same rough shape.
  // We also rescale the waveform to be 0-1 so we end up with a clamped waveform to rely upon.

  return (0, _arrays.arrayRescale)((0, _arrays.arraySmoothingResample)(noiseWaveform, PLAYBACK_WAVEFORM_SAMPLES), 0, 1);
}

class Playback extends _events.default {
  /**
   * Stable waveform for representing a thumbnail of the media. Values are
   * guaranteed to be between zero and one, inclusive.
   */

  /**
   * Creates a new playback instance from a buffer.
   * @param {ArrayBuffer} buf The buffer containing the sound sample.
   * @param {number[]} seedWaveform Optional seed waveform to present until the proper waveform
   * can be calculated. Contains values between zero and one, inclusive.
   */
  constructor(buf) {
    let seedWaveform = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : DEFAULT_WAVEFORM;
    super(); // Capture the file size early as reading the buffer will result in a 0-length buffer left behind

    this.buf = buf;
    (0, _defineProperty2.default)(this, "thumbnailWaveform", void 0);
    (0, _defineProperty2.default)(this, "context", void 0);
    (0, _defineProperty2.default)(this, "source", void 0);
    (0, _defineProperty2.default)(this, "state", PlaybackState.Decoding);
    (0, _defineProperty2.default)(this, "audioBuf", void 0);
    (0, _defineProperty2.default)(this, "element", void 0);
    (0, _defineProperty2.default)(this, "resampledWaveform", void 0);
    (0, _defineProperty2.default)(this, "waveformObservable", new _matrixWidgetApi.SimpleObservable());
    (0, _defineProperty2.default)(this, "clock", void 0);
    (0, _defineProperty2.default)(this, "fileSize", void 0);
    (0, _defineProperty2.default)(this, "onPlaybackEnd", async () => {
      await this.context.suspend();
      this.emit(PlaybackState.Stopped);
    });
    this.fileSize = this.buf.byteLength;
    this.context = (0, _compat.createAudioContext)();
    this.resampledWaveform = (0, _arrays.arrayFastResample)(seedWaveform ?? DEFAULT_WAVEFORM, PLAYBACK_WAVEFORM_SAMPLES);
    this.thumbnailWaveform = (0, _arrays.arrayFastResample)(seedWaveform ?? DEFAULT_WAVEFORM, THUMBNAIL_WAVEFORM_SAMPLES);
    this.waveformObservable.update(this.resampledWaveform);
    this.clock = new _PlaybackClock.PlaybackClock(this.context);
  }
  /**
   * Size of the audio clip in bytes. May be zero if unknown. This is updated
   * when the playback goes through phase changes.
   */


  get sizeBytes() {
    return this.fileSize;
  }
  /**
   * Stable waveform for the playback. Values are guaranteed to be between
   * zero and one, inclusive.
   */


  get waveform() {
    return this.resampledWaveform;
  }

  get waveformData() {
    return this.waveformObservable;
  }

  get clockInfo() {
    return this.clock;
  }

  get currentState() {
    return this.state;
  }

  get isPlaying() {
    return this.currentState === PlaybackState.Playing;
  }

  emit(event) {
    this.state = event;

    for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      args[_key - 1] = arguments[_key];
    }

    super.emit(event, ...args);
    super.emit(_AsyncStore.UPDATE_EVENT, event, ...args);
    return true; // we don't ever care if the event had listeners, so just return "yes"
  }

  destroy() {
    // Dev note: It's critical that we call stop() during cleanup to ensure that downstream callers
    // are aware of the final clock position before the user triggered an unload.
    // noinspection JSIgnoredPromiseFromCall - not concerned about being called async here
    this.stop();
    this.removeAllListeners();
    this.clock.destroy();
    this.waveformObservable.close();

    if (this.element) {
      URL.revokeObjectURL(this.element.src);
      this.element.remove();
    }
  }

  async prepare() {
    // don't attempt to decode the media again
    // AudioContext.decodeAudioData detaches the array buffer `this.buf`
    // meaning it cannot be re-read
    if (this.state !== PlaybackState.Decoding) {
      return;
    } // The point where we use an audio element is fairly arbitrary, though we don't want
    // it to be too low. As of writing, voice messages want to show a waveform but audio
    // messages do not. Using an audio element means we can't show a waveform preview, so
    // we try to target the difference between a voice message file and large audio file.
    // Overall, the point of this is to avoid memory-related issues due to storing a massive
    // audio buffer in memory, as that can balloon to far greater than the input buffer's
    // byte length.


    if (this.buf.byteLength > 5 * 1024 * 1024) {
      // 5mb
      _logger.logger.log("Audio file too large: processing through <audio /> element");

      this.element = document.createElement("AUDIO");
      const prom = new Promise((resolve, reject) => {
        this.element.onloadeddata = () => resolve(null);

        this.element.onerror = e => reject(e);
      });
      this.element.src = URL.createObjectURL(new Blob([this.buf]));
      await prom; // make sure the audio element is ready for us
    } else {
      // Safari compat: promise API not supported on this function
      this.audioBuf = await new Promise((resolve, reject) => {
        this.context.decodeAudioData(this.buf, b => resolve(b), async e => {
          try {
            // This error handler is largely for Safari as well, which doesn't support Opus/Ogg
            // very well.
            _logger.logger.error("Error decoding recording: ", e);

            _logger.logger.warn("Trying to re-encode to WAV instead...");

            const wav = await (0, _compat.decodeOgg)(this.buf); // noinspection ES6MissingAwait - not needed when using callbacks

            this.context.decodeAudioData(wav, b => resolve(b), e => {
              _logger.logger.error("Still failed to decode recording: ", e);

              reject(e);
            });
          } catch (e) {
            _logger.logger.error("Caught decoding error:", e);

            reject(e);
          }
        });
      }); // Update the waveform to the real waveform once we have channel data to use. We don't
      // exactly trust the user-provided waveform to be accurate...

      const waveform = Array.from(this.audioBuf.getChannelData(0));
      this.resampledWaveform = makePlaybackWaveform(waveform);
    }

    this.waveformObservable.update(this.resampledWaveform);
    this.clock.flagLoadTime(); // must happen first because setting the duration fires a clock update

    this.clock.durationSeconds = this.element ? this.element.duration : this.audioBuf.duration; // Signal that we're not decoding anymore. This is done last to ensure the clock is updated for
    // when the downstream callers try to use it.

    this.emit(PlaybackState.Stopped); // signal that we're not decoding anymore
  }

  async play() {
    // We can't restart a buffer source, so we need to create a new one if we hit the end
    if (this.state === PlaybackState.Stopped) {
      this.disconnectSource();
      this.makeNewSourceBuffer();

      if (this.element) {
        await this.element.play();
      } else {
        this.source.start();
      }
    } // We use the context suspend/resume functions because it allows us to pause a source
    // node, but that still doesn't help us when the source node runs out (see above).


    await this.context.resume();
    this.clock.flagStart();
    this.emit(PlaybackState.Playing);
  }

  disconnectSource() {
    if (this.element) return; // leave connected, we can (and must) re-use it

    this.source?.disconnect();
    this.source?.removeEventListener("ended", this.onPlaybackEnd);
  }

  makeNewSourceBuffer() {
    if (this.element && this.source) return; // leave connected, we can (and must) re-use it

    if (this.element) {
      this.source = this.context.createMediaElementSource(this.element);
    } else {
      this.source = this.context.createBufferSource();
      this.source.buffer = this.audioBuf;
    }

    this.source.addEventListener("ended", this.onPlaybackEnd);
    this.source.connect(this.context.destination);
  }

  async pause() {
    await this.context.suspend();
    this.emit(PlaybackState.Paused);
  }

  async stop() {
    await this.onPlaybackEnd();
    this.clock.flagStop();
  }

  async toggle() {
    if (this.isPlaying) await this.pause();else await this.play();
  }

  async skipTo(timeSeconds) {
    // Dev note: this function talks a lot about clock desyncs. There is a clock running
    // independently to the audio context and buffer so that accurate human-perceptible
    // time can be exposed. The PlaybackClock class has more information, but the short
    // version is that we need to line up the useful time (clip position) with the context
    // time, and avoid as many deviations as possible as otherwise the user could see the
    // wrong time, and we stop playback at the wrong time, etc.
    timeSeconds = (0, _numbers.clamp)(timeSeconds, 0, this.clock.durationSeconds); // Track playing state so we don't cause seeking to start playing the track.

    const isPlaying = this.isPlaying;

    if (isPlaying) {
      // Pause first so we can get an accurate measurement of time
      await this.context.suspend();
    } // We can't simply tell the context/buffer to jump to a time, so we have to
    // start a whole new buffer and start it from the new time offset.


    const now = this.context.currentTime;
    this.disconnectSource();
    this.makeNewSourceBuffer(); // We have to resync the clock because it can get confused about where we're
    // at in the audio clip.

    this.clock.syncTo(now, timeSeconds); // Always start the source to queue it up. We have to do this now (and pause
    // quickly if we're not supposed to be playing) as otherwise the clock can desync
    // when it comes time to the user hitting play. After a couple jumps, the user
    // will have desynced the clock enough to be about 10-15 seconds off, while this
    // keeps it as close to perfect as humans can perceive.

    if (this.element) {
      this.element.currentTime = timeSeconds;
    } else {
      this.source.start(now, timeSeconds);
    } // Dev note: it's critical that the code gap between `this.source.start()` and
    // `this.pause()` is as small as possible: we do not want to delay *anything*
    // as that could cause a clock desync, or a buggy feeling as a single note plays
    // during seeking.


    if (isPlaying) {
      // If we were playing before, continue the context so the clock doesn't desync.
      await this.context.resume();
    } else {
      // As mentioned above, we'll have to pause the clip if we weren't supposed to
      // be playing it just yet. If we didn't have this, the audio clip plays but all
      // the states will be wrong: clock won't advance, pause state doesn't match the
      // blaring noise leaving the user's speakers, etc.
      //
      // Also as mentioned, if the code gap is small enough then this should be
      // executed immediately after the start time, leaving no feasible time for the
      // user's speakers to play any sound.
      await this.pause();
    }
  }

}

exports.Playback = Playback;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJQbGF5YmFja1N0YXRlIiwiUExBWUJBQ0tfV0FWRUZPUk1fU0FNUExFUyIsIlRIVU1CTkFJTF9XQVZFRk9STV9TQU1QTEVTIiwiREVGQVVMVF9XQVZFRk9STSIsImFycmF5U2VlZCIsIm1ha2VQbGF5YmFja1dhdmVmb3JtIiwiaW5wdXQiLCJub2lzZVdhdmVmb3JtIiwibWFwIiwidiIsIk1hdGgiLCJhYnMiLCJhcnJheVJlc2NhbGUiLCJhcnJheVNtb290aGluZ1Jlc2FtcGxlIiwiUGxheWJhY2siLCJFdmVudEVtaXR0ZXIiLCJjb25zdHJ1Y3RvciIsImJ1ZiIsInNlZWRXYXZlZm9ybSIsIkRlY29kaW5nIiwiU2ltcGxlT2JzZXJ2YWJsZSIsImNvbnRleHQiLCJzdXNwZW5kIiwiZW1pdCIsIlN0b3BwZWQiLCJmaWxlU2l6ZSIsImJ5dGVMZW5ndGgiLCJjcmVhdGVBdWRpb0NvbnRleHQiLCJyZXNhbXBsZWRXYXZlZm9ybSIsImFycmF5RmFzdFJlc2FtcGxlIiwidGh1bWJuYWlsV2F2ZWZvcm0iLCJ3YXZlZm9ybU9ic2VydmFibGUiLCJ1cGRhdGUiLCJjbG9jayIsIlBsYXliYWNrQ2xvY2siLCJzaXplQnl0ZXMiLCJ3YXZlZm9ybSIsIndhdmVmb3JtRGF0YSIsImNsb2NrSW5mbyIsImN1cnJlbnRTdGF0ZSIsInN0YXRlIiwiaXNQbGF5aW5nIiwiUGxheWluZyIsImV2ZW50IiwiYXJncyIsIlVQREFURV9FVkVOVCIsImRlc3Ryb3kiLCJzdG9wIiwicmVtb3ZlQWxsTGlzdGVuZXJzIiwiY2xvc2UiLCJlbGVtZW50IiwiVVJMIiwicmV2b2tlT2JqZWN0VVJMIiwic3JjIiwicmVtb3ZlIiwicHJlcGFyZSIsImxvZ2dlciIsImxvZyIsImRvY3VtZW50IiwiY3JlYXRlRWxlbWVudCIsInByb20iLCJQcm9taXNlIiwicmVzb2x2ZSIsInJlamVjdCIsIm9ubG9hZGVkZGF0YSIsIm9uZXJyb3IiLCJlIiwiY3JlYXRlT2JqZWN0VVJMIiwiQmxvYiIsImF1ZGlvQnVmIiwiZGVjb2RlQXVkaW9EYXRhIiwiYiIsImVycm9yIiwid2FybiIsIndhdiIsImRlY29kZU9nZyIsIkFycmF5IiwiZnJvbSIsImdldENoYW5uZWxEYXRhIiwiZmxhZ0xvYWRUaW1lIiwiZHVyYXRpb25TZWNvbmRzIiwiZHVyYXRpb24iLCJwbGF5IiwiZGlzY29ubmVjdFNvdXJjZSIsIm1ha2VOZXdTb3VyY2VCdWZmZXIiLCJzb3VyY2UiLCJzdGFydCIsInJlc3VtZSIsImZsYWdTdGFydCIsImRpc2Nvbm5lY3QiLCJyZW1vdmVFdmVudExpc3RlbmVyIiwib25QbGF5YmFja0VuZCIsImNyZWF0ZU1lZGlhRWxlbWVudFNvdXJjZSIsImNyZWF0ZUJ1ZmZlclNvdXJjZSIsImJ1ZmZlciIsImFkZEV2ZW50TGlzdGVuZXIiLCJjb25uZWN0IiwiZGVzdGluYXRpb24iLCJwYXVzZSIsIlBhdXNlZCIsImZsYWdTdG9wIiwidG9nZ2xlIiwic2tpcFRvIiwidGltZVNlY29uZHMiLCJjbGFtcCIsIm5vdyIsImN1cnJlbnRUaW1lIiwic3luY1RvIl0sInNvdXJjZXMiOlsiLi4vLi4vc3JjL2F1ZGlvL1BsYXliYWNrLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgMjAyMSBUaGUgTWF0cml4Lm9yZyBGb3VuZGF0aW9uIEMuSS5DLlxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbmltcG9ydCBFdmVudEVtaXR0ZXIgZnJvbSBcImV2ZW50c1wiO1xuaW1wb3J0IHsgU2ltcGxlT2JzZXJ2YWJsZSB9IGZyb20gXCJtYXRyaXgtd2lkZ2V0LWFwaVwiO1xuaW1wb3J0IHsgbG9nZ2VyIH0gZnJvbSBcIm1hdHJpeC1qcy1zZGsvc3JjL2xvZ2dlclwiO1xuXG5pbXBvcnQgeyBVUERBVEVfRVZFTlQgfSBmcm9tIFwiLi4vc3RvcmVzL0FzeW5jU3RvcmVcIjtcbmltcG9ydCB7IGFycmF5RmFzdFJlc2FtcGxlLCBhcnJheVJlc2NhbGUsIGFycmF5U2VlZCwgYXJyYXlTbW9vdGhpbmdSZXNhbXBsZSB9IGZyb20gXCIuLi91dGlscy9hcnJheXNcIjtcbmltcG9ydCB7IElEZXN0cm95YWJsZSB9IGZyb20gXCIuLi91dGlscy9JRGVzdHJveWFibGVcIjtcbmltcG9ydCB7IFBsYXliYWNrQ2xvY2sgfSBmcm9tIFwiLi9QbGF5YmFja0Nsb2NrXCI7XG5pbXBvcnQgeyBjcmVhdGVBdWRpb0NvbnRleHQsIGRlY29kZU9nZyB9IGZyb20gXCIuL2NvbXBhdFwiO1xuaW1wb3J0IHsgY2xhbXAgfSBmcm9tIFwiLi4vdXRpbHMvbnVtYmVyc1wiO1xuXG5leHBvcnQgZW51bSBQbGF5YmFja1N0YXRlIHtcbiAgICBEZWNvZGluZyA9IFwiZGVjb2RpbmdcIixcbiAgICBTdG9wcGVkID0gXCJzdG9wcGVkXCIsIC8vIG5vIHByb2dyZXNzIG9uIHRpbWVsaW5lXG4gICAgUGF1c2VkID0gXCJwYXVzZWRcIiwgLy8gc29tZSBwcm9ncmVzcyBvbiB0aW1lbGluZVxuICAgIFBsYXlpbmcgPSBcInBsYXlpbmdcIiwgLy8gYWN0aXZlIHByb2dyZXNzIHRocm91Z2ggdGltZWxpbmVcbn1cblxuZXhwb3J0IGNvbnN0IFBMQVlCQUNLX1dBVkVGT1JNX1NBTVBMRVMgPSAzOTtcbmNvbnN0IFRIVU1CTkFJTF9XQVZFRk9STV9TQU1QTEVTID0gMTAwOyAvLyBhcmJpdHJhcnk6IFszMCwxMjBdXG5leHBvcnQgY29uc3QgREVGQVVMVF9XQVZFRk9STSA9IGFycmF5U2VlZCgwLCBQTEFZQkFDS19XQVZFRk9STV9TQU1QTEVTKTtcblxuZnVuY3Rpb24gbWFrZVBsYXliYWNrV2F2ZWZvcm0oaW5wdXQ6IG51bWJlcltdKTogbnVtYmVyW10ge1xuICAgIC8vIEZpcnN0LCBjb252ZXJ0IG5lZ2F0aXZlIGFtcGxpdHVkZXMgdG8gcG9zaXRpdmUgc28gd2UgZG9uJ3QgZGV0ZWN0IHplcm8gYXMgXCJub2lzeVwiLlxuICAgIGNvbnN0IG5vaXNlV2F2ZWZvcm0gPSBpbnB1dC5tYXAodiA9PiBNYXRoLmFicyh2KSk7XG5cbiAgICAvLyBUaGVuLCB3ZSdsbCByZXNhbXBsZSB0aGUgd2F2ZWZvcm0gdXNpbmcgYSBzbW9vdGhpbmcgYXBwcm9hY2ggc28gd2UgY2FuIGtlZXAgdGhlIHNhbWUgcm91Z2ggc2hhcGUuXG4gICAgLy8gV2UgYWxzbyByZXNjYWxlIHRoZSB3YXZlZm9ybSB0byBiZSAwLTEgc28gd2UgZW5kIHVwIHdpdGggYSBjbGFtcGVkIHdhdmVmb3JtIHRvIHJlbHkgdXBvbi5cbiAgICByZXR1cm4gYXJyYXlSZXNjYWxlKGFycmF5U21vb3RoaW5nUmVzYW1wbGUobm9pc2VXYXZlZm9ybSwgUExBWUJBQ0tfV0FWRUZPUk1fU0FNUExFUyksIDAsIDEpO1xufVxuXG5leHBvcnQgY2xhc3MgUGxheWJhY2sgZXh0ZW5kcyBFdmVudEVtaXR0ZXIgaW1wbGVtZW50cyBJRGVzdHJveWFibGUge1xuICAgIC8qKlxuICAgICAqIFN0YWJsZSB3YXZlZm9ybSBmb3IgcmVwcmVzZW50aW5nIGEgdGh1bWJuYWlsIG9mIHRoZSBtZWRpYS4gVmFsdWVzIGFyZVxuICAgICAqIGd1YXJhbnRlZWQgdG8gYmUgYmV0d2VlbiB6ZXJvIGFuZCBvbmUsIGluY2x1c2l2ZS5cbiAgICAgKi9cbiAgICBwdWJsaWMgcmVhZG9ubHkgdGh1bWJuYWlsV2F2ZWZvcm06IG51bWJlcltdO1xuXG4gICAgcHJpdmF0ZSByZWFkb25seSBjb250ZXh0OiBBdWRpb0NvbnRleHQ7XG4gICAgcHJpdmF0ZSBzb3VyY2U6IEF1ZGlvQnVmZmVyU291cmNlTm9kZSB8IE1lZGlhRWxlbWVudEF1ZGlvU291cmNlTm9kZTtcbiAgICBwcml2YXRlIHN0YXRlID0gUGxheWJhY2tTdGF0ZS5EZWNvZGluZztcbiAgICBwcml2YXRlIGF1ZGlvQnVmOiBBdWRpb0J1ZmZlcjtcbiAgICBwcml2YXRlIGVsZW1lbnQ6IEhUTUxBdWRpb0VsZW1lbnQ7XG4gICAgcHJpdmF0ZSByZXNhbXBsZWRXYXZlZm9ybTogbnVtYmVyW107XG4gICAgcHJpdmF0ZSB3YXZlZm9ybU9ic2VydmFibGUgPSBuZXcgU2ltcGxlT2JzZXJ2YWJsZTxudW1iZXJbXT4oKTtcbiAgICBwcml2YXRlIHJlYWRvbmx5IGNsb2NrOiBQbGF5YmFja0Nsb2NrO1xuICAgIHByaXZhdGUgcmVhZG9ubHkgZmlsZVNpemU6IG51bWJlcjtcblxuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgYSBuZXcgcGxheWJhY2sgaW5zdGFuY2UgZnJvbSBhIGJ1ZmZlci5cbiAgICAgKiBAcGFyYW0ge0FycmF5QnVmZmVyfSBidWYgVGhlIGJ1ZmZlciBjb250YWluaW5nIHRoZSBzb3VuZCBzYW1wbGUuXG4gICAgICogQHBhcmFtIHtudW1iZXJbXX0gc2VlZFdhdmVmb3JtIE9wdGlvbmFsIHNlZWQgd2F2ZWZvcm0gdG8gcHJlc2VudCB1bnRpbCB0aGUgcHJvcGVyIHdhdmVmb3JtXG4gICAgICogY2FuIGJlIGNhbGN1bGF0ZWQuIENvbnRhaW5zIHZhbHVlcyBiZXR3ZWVuIHplcm8gYW5kIG9uZSwgaW5jbHVzaXZlLlxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKHByaXZhdGUgYnVmOiBBcnJheUJ1ZmZlciwgc2VlZFdhdmVmb3JtID0gREVGQVVMVF9XQVZFRk9STSkge1xuICAgICAgICBzdXBlcigpO1xuICAgICAgICAvLyBDYXB0dXJlIHRoZSBmaWxlIHNpemUgZWFybHkgYXMgcmVhZGluZyB0aGUgYnVmZmVyIHdpbGwgcmVzdWx0IGluIGEgMC1sZW5ndGggYnVmZmVyIGxlZnQgYmVoaW5kXG4gICAgICAgIHRoaXMuZmlsZVNpemUgPSB0aGlzLmJ1Zi5ieXRlTGVuZ3RoO1xuICAgICAgICB0aGlzLmNvbnRleHQgPSBjcmVhdGVBdWRpb0NvbnRleHQoKTtcbiAgICAgICAgdGhpcy5yZXNhbXBsZWRXYXZlZm9ybSA9IGFycmF5RmFzdFJlc2FtcGxlKHNlZWRXYXZlZm9ybSA/PyBERUZBVUxUX1dBVkVGT1JNLCBQTEFZQkFDS19XQVZFRk9STV9TQU1QTEVTKTtcbiAgICAgICAgdGhpcy50aHVtYm5haWxXYXZlZm9ybSA9IGFycmF5RmFzdFJlc2FtcGxlKHNlZWRXYXZlZm9ybSA/PyBERUZBVUxUX1dBVkVGT1JNLCBUSFVNQk5BSUxfV0FWRUZPUk1fU0FNUExFUyk7XG4gICAgICAgIHRoaXMud2F2ZWZvcm1PYnNlcnZhYmxlLnVwZGF0ZSh0aGlzLnJlc2FtcGxlZFdhdmVmb3JtKTtcbiAgICAgICAgdGhpcy5jbG9jayA9IG5ldyBQbGF5YmFja0Nsb2NrKHRoaXMuY29udGV4dCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogU2l6ZSBvZiB0aGUgYXVkaW8gY2xpcCBpbiBieXRlcy4gTWF5IGJlIHplcm8gaWYgdW5rbm93bi4gVGhpcyBpcyB1cGRhdGVkXG4gICAgICogd2hlbiB0aGUgcGxheWJhY2sgZ29lcyB0aHJvdWdoIHBoYXNlIGNoYW5nZXMuXG4gICAgICovXG4gICAgcHVibGljIGdldCBzaXplQnl0ZXMoKTogbnVtYmVyIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZmlsZVNpemU7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogU3RhYmxlIHdhdmVmb3JtIGZvciB0aGUgcGxheWJhY2suIFZhbHVlcyBhcmUgZ3VhcmFudGVlZCB0byBiZSBiZXR3ZWVuXG4gICAgICogemVybyBhbmQgb25lLCBpbmNsdXNpdmUuXG4gICAgICovXG4gICAgcHVibGljIGdldCB3YXZlZm9ybSgpOiBudW1iZXJbXSB7XG4gICAgICAgIHJldHVybiB0aGlzLnJlc2FtcGxlZFdhdmVmb3JtO1xuICAgIH1cblxuICAgIHB1YmxpYyBnZXQgd2F2ZWZvcm1EYXRhKCk6IFNpbXBsZU9ic2VydmFibGU8bnVtYmVyW10+IHtcbiAgICAgICAgcmV0dXJuIHRoaXMud2F2ZWZvcm1PYnNlcnZhYmxlO1xuICAgIH1cblxuICAgIHB1YmxpYyBnZXQgY2xvY2tJbmZvKCk6IFBsYXliYWNrQ2xvY2sge1xuICAgICAgICByZXR1cm4gdGhpcy5jbG9jaztcbiAgICB9XG5cbiAgICBwdWJsaWMgZ2V0IGN1cnJlbnRTdGF0ZSgpOiBQbGF5YmFja1N0YXRlIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuc3RhdGU7XG4gICAgfVxuXG4gICAgcHVibGljIGdldCBpc1BsYXlpbmcoKTogYm9vbGVhbiB7XG4gICAgICAgIHJldHVybiB0aGlzLmN1cnJlbnRTdGF0ZSA9PT0gUGxheWJhY2tTdGF0ZS5QbGF5aW5nO1xuICAgIH1cblxuICAgIHB1YmxpYyBlbWl0KGV2ZW50OiBQbGF5YmFja1N0YXRlLCAuLi5hcmdzOiBhbnlbXSk6IGJvb2xlYW4ge1xuICAgICAgICB0aGlzLnN0YXRlID0gZXZlbnQ7XG4gICAgICAgIHN1cGVyLmVtaXQoZXZlbnQsIC4uLmFyZ3MpO1xuICAgICAgICBzdXBlci5lbWl0KFVQREFURV9FVkVOVCwgZXZlbnQsIC4uLmFyZ3MpO1xuICAgICAgICByZXR1cm4gdHJ1ZTsgLy8gd2UgZG9uJ3QgZXZlciBjYXJlIGlmIHRoZSBldmVudCBoYWQgbGlzdGVuZXJzLCBzbyBqdXN0IHJldHVybiBcInllc1wiXG4gICAgfVxuXG4gICAgcHVibGljIGRlc3Ryb3koKSB7XG4gICAgICAgIC8vIERldiBub3RlOiBJdCdzIGNyaXRpY2FsIHRoYXQgd2UgY2FsbCBzdG9wKCkgZHVyaW5nIGNsZWFudXAgdG8gZW5zdXJlIHRoYXQgZG93bnN0cmVhbSBjYWxsZXJzXG4gICAgICAgIC8vIGFyZSBhd2FyZSBvZiB0aGUgZmluYWwgY2xvY2sgcG9zaXRpb24gYmVmb3JlIHRoZSB1c2VyIHRyaWdnZXJlZCBhbiB1bmxvYWQuXG4gICAgICAgIC8vIG5vaW5zcGVjdGlvbiBKU0lnbm9yZWRQcm9taXNlRnJvbUNhbGwgLSBub3QgY29uY2VybmVkIGFib3V0IGJlaW5nIGNhbGxlZCBhc3luYyBoZXJlXG4gICAgICAgIHRoaXMuc3RvcCgpO1xuICAgICAgICB0aGlzLnJlbW92ZUFsbExpc3RlbmVycygpO1xuICAgICAgICB0aGlzLmNsb2NrLmRlc3Ryb3koKTtcbiAgICAgICAgdGhpcy53YXZlZm9ybU9ic2VydmFibGUuY2xvc2UoKTtcbiAgICAgICAgaWYgKHRoaXMuZWxlbWVudCkge1xuICAgICAgICAgICAgVVJMLnJldm9rZU9iamVjdFVSTCh0aGlzLmVsZW1lbnQuc3JjKTtcbiAgICAgICAgICAgIHRoaXMuZWxlbWVudC5yZW1vdmUoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHB1YmxpYyBhc3luYyBwcmVwYXJlKCkge1xuICAgICAgICAvLyBkb24ndCBhdHRlbXB0IHRvIGRlY29kZSB0aGUgbWVkaWEgYWdhaW5cbiAgICAgICAgLy8gQXVkaW9Db250ZXh0LmRlY29kZUF1ZGlvRGF0YSBkZXRhY2hlcyB0aGUgYXJyYXkgYnVmZmVyIGB0aGlzLmJ1ZmBcbiAgICAgICAgLy8gbWVhbmluZyBpdCBjYW5ub3QgYmUgcmUtcmVhZFxuICAgICAgICBpZiAodGhpcy5zdGF0ZSAhPT0gUGxheWJhY2tTdGF0ZS5EZWNvZGluZykge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gVGhlIHBvaW50IHdoZXJlIHdlIHVzZSBhbiBhdWRpbyBlbGVtZW50IGlzIGZhaXJseSBhcmJpdHJhcnksIHRob3VnaCB3ZSBkb24ndCB3YW50XG4gICAgICAgIC8vIGl0IHRvIGJlIHRvbyBsb3cuIEFzIG9mIHdyaXRpbmcsIHZvaWNlIG1lc3NhZ2VzIHdhbnQgdG8gc2hvdyBhIHdhdmVmb3JtIGJ1dCBhdWRpb1xuICAgICAgICAvLyBtZXNzYWdlcyBkbyBub3QuIFVzaW5nIGFuIGF1ZGlvIGVsZW1lbnQgbWVhbnMgd2UgY2FuJ3Qgc2hvdyBhIHdhdmVmb3JtIHByZXZpZXcsIHNvXG4gICAgICAgIC8vIHdlIHRyeSB0byB0YXJnZXQgdGhlIGRpZmZlcmVuY2UgYmV0d2VlbiBhIHZvaWNlIG1lc3NhZ2UgZmlsZSBhbmQgbGFyZ2UgYXVkaW8gZmlsZS5cbiAgICAgICAgLy8gT3ZlcmFsbCwgdGhlIHBvaW50IG9mIHRoaXMgaXMgdG8gYXZvaWQgbWVtb3J5LXJlbGF0ZWQgaXNzdWVzIGR1ZSB0byBzdG9yaW5nIGEgbWFzc2l2ZVxuICAgICAgICAvLyBhdWRpbyBidWZmZXIgaW4gbWVtb3J5LCBhcyB0aGF0IGNhbiBiYWxsb29uIHRvIGZhciBncmVhdGVyIHRoYW4gdGhlIGlucHV0IGJ1ZmZlcidzXG4gICAgICAgIC8vIGJ5dGUgbGVuZ3RoLlxuICAgICAgICBpZiAodGhpcy5idWYuYnl0ZUxlbmd0aCA+IDUgKiAxMDI0ICogMTAyNCkgeyAvLyA1bWJcbiAgICAgICAgICAgIGxvZ2dlci5sb2coXCJBdWRpbyBmaWxlIHRvbyBsYXJnZTogcHJvY2Vzc2luZyB0aHJvdWdoIDxhdWRpbyAvPiBlbGVtZW50XCIpO1xuICAgICAgICAgICAgdGhpcy5lbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcIkFVRElPXCIpIGFzIEhUTUxBdWRpb0VsZW1lbnQ7XG4gICAgICAgICAgICBjb25zdCBwcm9tID0gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMuZWxlbWVudC5vbmxvYWRlZGRhdGEgPSAoKSA9PiByZXNvbHZlKG51bGwpO1xuICAgICAgICAgICAgICAgIHRoaXMuZWxlbWVudC5vbmVycm9yID0gKGUpID0+IHJlamVjdChlKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgdGhpcy5lbGVtZW50LnNyYyA9IFVSTC5jcmVhdGVPYmplY3RVUkwobmV3IEJsb2IoW3RoaXMuYnVmXSkpO1xuICAgICAgICAgICAgYXdhaXQgcHJvbTsgLy8gbWFrZSBzdXJlIHRoZSBhdWRpbyBlbGVtZW50IGlzIHJlYWR5IGZvciB1c1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gU2FmYXJpIGNvbXBhdDogcHJvbWlzZSBBUEkgbm90IHN1cHBvcnRlZCBvbiB0aGlzIGZ1bmN0aW9uXG4gICAgICAgICAgICB0aGlzLmF1ZGlvQnVmID0gYXdhaXQgbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMuY29udGV4dC5kZWNvZGVBdWRpb0RhdGEodGhpcy5idWYsIGIgPT4gcmVzb2x2ZShiKSwgYXN5bmMgZSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBUaGlzIGVycm9yIGhhbmRsZXIgaXMgbGFyZ2VseSBmb3IgU2FmYXJpIGFzIHdlbGwsIHdoaWNoIGRvZXNuJ3Qgc3VwcG9ydCBPcHVzL09nZ1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gdmVyeSB3ZWxsLlxuICAgICAgICAgICAgICAgICAgICAgICAgbG9nZ2VyLmVycm9yKFwiRXJyb3IgZGVjb2RpbmcgcmVjb3JkaW5nOiBcIiwgZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBsb2dnZXIud2FybihcIlRyeWluZyB0byByZS1lbmNvZGUgdG8gV0FWIGluc3RlYWQuLi5cIik7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHdhdiA9IGF3YWl0IGRlY29kZU9nZyh0aGlzLmJ1Zik7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIG5vaW5zcGVjdGlvbiBFUzZNaXNzaW5nQXdhaXQgLSBub3QgbmVlZGVkIHdoZW4gdXNpbmcgY2FsbGJhY2tzXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmNvbnRleHQuZGVjb2RlQXVkaW9EYXRhKHdhdiwgYiA9PiByZXNvbHZlKGIpLCBlID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb2dnZXIuZXJyb3IoXCJTdGlsbCBmYWlsZWQgdG8gZGVjb2RlIHJlY29yZGluZzogXCIsIGUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlamVjdChlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsb2dnZXIuZXJyb3IoXCJDYXVnaHQgZGVjb2RpbmcgZXJyb3I6XCIsIGUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVqZWN0KGUpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgLy8gVXBkYXRlIHRoZSB3YXZlZm9ybSB0byB0aGUgcmVhbCB3YXZlZm9ybSBvbmNlIHdlIGhhdmUgY2hhbm5lbCBkYXRhIHRvIHVzZS4gV2UgZG9uJ3RcbiAgICAgICAgICAgIC8vIGV4YWN0bHkgdHJ1c3QgdGhlIHVzZXItcHJvdmlkZWQgd2F2ZWZvcm0gdG8gYmUgYWNjdXJhdGUuLi5cbiAgICAgICAgICAgIGNvbnN0IHdhdmVmb3JtID0gQXJyYXkuZnJvbSh0aGlzLmF1ZGlvQnVmLmdldENoYW5uZWxEYXRhKDApKTtcbiAgICAgICAgICAgIHRoaXMucmVzYW1wbGVkV2F2ZWZvcm0gPSBtYWtlUGxheWJhY2tXYXZlZm9ybSh3YXZlZm9ybSk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLndhdmVmb3JtT2JzZXJ2YWJsZS51cGRhdGUodGhpcy5yZXNhbXBsZWRXYXZlZm9ybSk7XG5cbiAgICAgICAgdGhpcy5jbG9jay5mbGFnTG9hZFRpbWUoKTsgLy8gbXVzdCBoYXBwZW4gZmlyc3QgYmVjYXVzZSBzZXR0aW5nIHRoZSBkdXJhdGlvbiBmaXJlcyBhIGNsb2NrIHVwZGF0ZVxuICAgICAgICB0aGlzLmNsb2NrLmR1cmF0aW9uU2Vjb25kcyA9IHRoaXMuZWxlbWVudCA/IHRoaXMuZWxlbWVudC5kdXJhdGlvbiA6IHRoaXMuYXVkaW9CdWYuZHVyYXRpb247XG5cbiAgICAgICAgLy8gU2lnbmFsIHRoYXQgd2UncmUgbm90IGRlY29kaW5nIGFueW1vcmUuIFRoaXMgaXMgZG9uZSBsYXN0IHRvIGVuc3VyZSB0aGUgY2xvY2sgaXMgdXBkYXRlZCBmb3JcbiAgICAgICAgLy8gd2hlbiB0aGUgZG93bnN0cmVhbSBjYWxsZXJzIHRyeSB0byB1c2UgaXQuXG4gICAgICAgIHRoaXMuZW1pdChQbGF5YmFja1N0YXRlLlN0b3BwZWQpOyAvLyBzaWduYWwgdGhhdCB3ZSdyZSBub3QgZGVjb2RpbmcgYW55bW9yZVxuICAgIH1cblxuICAgIHByaXZhdGUgb25QbGF5YmFja0VuZCA9IGFzeW5jICgpID0+IHtcbiAgICAgICAgYXdhaXQgdGhpcy5jb250ZXh0LnN1c3BlbmQoKTtcbiAgICAgICAgdGhpcy5lbWl0KFBsYXliYWNrU3RhdGUuU3RvcHBlZCk7XG4gICAgfTtcblxuICAgIHB1YmxpYyBhc3luYyBwbGF5KCkge1xuICAgICAgICAvLyBXZSBjYW4ndCByZXN0YXJ0IGEgYnVmZmVyIHNvdXJjZSwgc28gd2UgbmVlZCB0byBjcmVhdGUgYSBuZXcgb25lIGlmIHdlIGhpdCB0aGUgZW5kXG4gICAgICAgIGlmICh0aGlzLnN0YXRlID09PSBQbGF5YmFja1N0YXRlLlN0b3BwZWQpIHtcbiAgICAgICAgICAgIHRoaXMuZGlzY29ubmVjdFNvdXJjZSgpO1xuICAgICAgICAgICAgdGhpcy5tYWtlTmV3U291cmNlQnVmZmVyKCk7XG4gICAgICAgICAgICBpZiAodGhpcy5lbGVtZW50KSB7XG4gICAgICAgICAgICAgICAgYXdhaXQgdGhpcy5lbGVtZW50LnBsYXkoKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgKHRoaXMuc291cmNlIGFzIEF1ZGlvQnVmZmVyU291cmNlTm9kZSkuc3RhcnQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFdlIHVzZSB0aGUgY29udGV4dCBzdXNwZW5kL3Jlc3VtZSBmdW5jdGlvbnMgYmVjYXVzZSBpdCBhbGxvd3MgdXMgdG8gcGF1c2UgYSBzb3VyY2VcbiAgICAgICAgLy8gbm9kZSwgYnV0IHRoYXQgc3RpbGwgZG9lc24ndCBoZWxwIHVzIHdoZW4gdGhlIHNvdXJjZSBub2RlIHJ1bnMgb3V0IChzZWUgYWJvdmUpLlxuICAgICAgICBhd2FpdCB0aGlzLmNvbnRleHQucmVzdW1lKCk7XG4gICAgICAgIHRoaXMuY2xvY2suZmxhZ1N0YXJ0KCk7XG4gICAgICAgIHRoaXMuZW1pdChQbGF5YmFja1N0YXRlLlBsYXlpbmcpO1xuICAgIH1cblxuICAgIHByaXZhdGUgZGlzY29ubmVjdFNvdXJjZSgpIHtcbiAgICAgICAgaWYgKHRoaXMuZWxlbWVudCkgcmV0dXJuOyAvLyBsZWF2ZSBjb25uZWN0ZWQsIHdlIGNhbiAoYW5kIG11c3QpIHJlLXVzZSBpdFxuICAgICAgICB0aGlzLnNvdXJjZT8uZGlzY29ubmVjdCgpO1xuICAgICAgICB0aGlzLnNvdXJjZT8ucmVtb3ZlRXZlbnRMaXN0ZW5lcihcImVuZGVkXCIsIHRoaXMub25QbGF5YmFja0VuZCk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBtYWtlTmV3U291cmNlQnVmZmVyKCkge1xuICAgICAgICBpZiAodGhpcy5lbGVtZW50ICYmIHRoaXMuc291cmNlKSByZXR1cm47IC8vIGxlYXZlIGNvbm5lY3RlZCwgd2UgY2FuIChhbmQgbXVzdCkgcmUtdXNlIGl0XG5cbiAgICAgICAgaWYgKHRoaXMuZWxlbWVudCkge1xuICAgICAgICAgICAgdGhpcy5zb3VyY2UgPSB0aGlzLmNvbnRleHQuY3JlYXRlTWVkaWFFbGVtZW50U291cmNlKHRoaXMuZWxlbWVudCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLnNvdXJjZSA9IHRoaXMuY29udGV4dC5jcmVhdGVCdWZmZXJTb3VyY2UoKTtcbiAgICAgICAgICAgIHRoaXMuc291cmNlLmJ1ZmZlciA9IHRoaXMuYXVkaW9CdWY7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLnNvdXJjZS5hZGRFdmVudExpc3RlbmVyKFwiZW5kZWRcIiwgdGhpcy5vblBsYXliYWNrRW5kKTtcbiAgICAgICAgdGhpcy5zb3VyY2UuY29ubmVjdCh0aGlzLmNvbnRleHQuZGVzdGluYXRpb24pO1xuICAgIH1cblxuICAgIHB1YmxpYyBhc3luYyBwYXVzZSgpIHtcbiAgICAgICAgYXdhaXQgdGhpcy5jb250ZXh0LnN1c3BlbmQoKTtcbiAgICAgICAgdGhpcy5lbWl0KFBsYXliYWNrU3RhdGUuUGF1c2VkKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgYXN5bmMgc3RvcCgpIHtcbiAgICAgICAgYXdhaXQgdGhpcy5vblBsYXliYWNrRW5kKCk7XG4gICAgICAgIHRoaXMuY2xvY2suZmxhZ1N0b3AoKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgYXN5bmMgdG9nZ2xlKCkge1xuICAgICAgICBpZiAodGhpcy5pc1BsYXlpbmcpIGF3YWl0IHRoaXMucGF1c2UoKTtcbiAgICAgICAgZWxzZSBhd2FpdCB0aGlzLnBsYXkoKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgYXN5bmMgc2tpcFRvKHRpbWVTZWNvbmRzOiBudW1iZXIpIHtcbiAgICAgICAgLy8gRGV2IG5vdGU6IHRoaXMgZnVuY3Rpb24gdGFsa3MgYSBsb3QgYWJvdXQgY2xvY2sgZGVzeW5jcy4gVGhlcmUgaXMgYSBjbG9jayBydW5uaW5nXG4gICAgICAgIC8vIGluZGVwZW5kZW50bHkgdG8gdGhlIGF1ZGlvIGNvbnRleHQgYW5kIGJ1ZmZlciBzbyB0aGF0IGFjY3VyYXRlIGh1bWFuLXBlcmNlcHRpYmxlXG4gICAgICAgIC8vIHRpbWUgY2FuIGJlIGV4cG9zZWQuIFRoZSBQbGF5YmFja0Nsb2NrIGNsYXNzIGhhcyBtb3JlIGluZm9ybWF0aW9uLCBidXQgdGhlIHNob3J0XG4gICAgICAgIC8vIHZlcnNpb24gaXMgdGhhdCB3ZSBuZWVkIHRvIGxpbmUgdXAgdGhlIHVzZWZ1bCB0aW1lIChjbGlwIHBvc2l0aW9uKSB3aXRoIHRoZSBjb250ZXh0XG4gICAgICAgIC8vIHRpbWUsIGFuZCBhdm9pZCBhcyBtYW55IGRldmlhdGlvbnMgYXMgcG9zc2libGUgYXMgb3RoZXJ3aXNlIHRoZSB1c2VyIGNvdWxkIHNlZSB0aGVcbiAgICAgICAgLy8gd3JvbmcgdGltZSwgYW5kIHdlIHN0b3AgcGxheWJhY2sgYXQgdGhlIHdyb25nIHRpbWUsIGV0Yy5cblxuICAgICAgICB0aW1lU2Vjb25kcyA9IGNsYW1wKHRpbWVTZWNvbmRzLCAwLCB0aGlzLmNsb2NrLmR1cmF0aW9uU2Vjb25kcyk7XG5cbiAgICAgICAgLy8gVHJhY2sgcGxheWluZyBzdGF0ZSBzbyB3ZSBkb24ndCBjYXVzZSBzZWVraW5nIHRvIHN0YXJ0IHBsYXlpbmcgdGhlIHRyYWNrLlxuICAgICAgICBjb25zdCBpc1BsYXlpbmcgPSB0aGlzLmlzUGxheWluZztcblxuICAgICAgICBpZiAoaXNQbGF5aW5nKSB7XG4gICAgICAgICAgICAvLyBQYXVzZSBmaXJzdCBzbyB3ZSBjYW4gZ2V0IGFuIGFjY3VyYXRlIG1lYXN1cmVtZW50IG9mIHRpbWVcbiAgICAgICAgICAgIGF3YWl0IHRoaXMuY29udGV4dC5zdXNwZW5kKCk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBXZSBjYW4ndCBzaW1wbHkgdGVsbCB0aGUgY29udGV4dC9idWZmZXIgdG8ganVtcCB0byBhIHRpbWUsIHNvIHdlIGhhdmUgdG9cbiAgICAgICAgLy8gc3RhcnQgYSB3aG9sZSBuZXcgYnVmZmVyIGFuZCBzdGFydCBpdCBmcm9tIHRoZSBuZXcgdGltZSBvZmZzZXQuXG4gICAgICAgIGNvbnN0IG5vdyA9IHRoaXMuY29udGV4dC5jdXJyZW50VGltZTtcbiAgICAgICAgdGhpcy5kaXNjb25uZWN0U291cmNlKCk7XG4gICAgICAgIHRoaXMubWFrZU5ld1NvdXJjZUJ1ZmZlcigpO1xuXG4gICAgICAgIC8vIFdlIGhhdmUgdG8gcmVzeW5jIHRoZSBjbG9jayBiZWNhdXNlIGl0IGNhbiBnZXQgY29uZnVzZWQgYWJvdXQgd2hlcmUgd2UncmVcbiAgICAgICAgLy8gYXQgaW4gdGhlIGF1ZGlvIGNsaXAuXG4gICAgICAgIHRoaXMuY2xvY2suc3luY1RvKG5vdywgdGltZVNlY29uZHMpO1xuXG4gICAgICAgIC8vIEFsd2F5cyBzdGFydCB0aGUgc291cmNlIHRvIHF1ZXVlIGl0IHVwLiBXZSBoYXZlIHRvIGRvIHRoaXMgbm93IChhbmQgcGF1c2VcbiAgICAgICAgLy8gcXVpY2tseSBpZiB3ZSdyZSBub3Qgc3VwcG9zZWQgdG8gYmUgcGxheWluZykgYXMgb3RoZXJ3aXNlIHRoZSBjbG9jayBjYW4gZGVzeW5jXG4gICAgICAgIC8vIHdoZW4gaXQgY29tZXMgdGltZSB0byB0aGUgdXNlciBoaXR0aW5nIHBsYXkuIEFmdGVyIGEgY291cGxlIGp1bXBzLCB0aGUgdXNlclxuICAgICAgICAvLyB3aWxsIGhhdmUgZGVzeW5jZWQgdGhlIGNsb2NrIGVub3VnaCB0byBiZSBhYm91dCAxMC0xNSBzZWNvbmRzIG9mZiwgd2hpbGUgdGhpc1xuICAgICAgICAvLyBrZWVwcyBpdCBhcyBjbG9zZSB0byBwZXJmZWN0IGFzIGh1bWFucyBjYW4gcGVyY2VpdmUuXG4gICAgICAgIGlmICh0aGlzLmVsZW1lbnQpIHtcbiAgICAgICAgICAgIHRoaXMuZWxlbWVudC5jdXJyZW50VGltZSA9IHRpbWVTZWNvbmRzO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgKHRoaXMuc291cmNlIGFzIEF1ZGlvQnVmZmVyU291cmNlTm9kZSkuc3RhcnQobm93LCB0aW1lU2Vjb25kcyk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBEZXYgbm90ZTogaXQncyBjcml0aWNhbCB0aGF0IHRoZSBjb2RlIGdhcCBiZXR3ZWVuIGB0aGlzLnNvdXJjZS5zdGFydCgpYCBhbmRcbiAgICAgICAgLy8gYHRoaXMucGF1c2UoKWAgaXMgYXMgc21hbGwgYXMgcG9zc2libGU6IHdlIGRvIG5vdCB3YW50IHRvIGRlbGF5ICphbnl0aGluZypcbiAgICAgICAgLy8gYXMgdGhhdCBjb3VsZCBjYXVzZSBhIGNsb2NrIGRlc3luYywgb3IgYSBidWdneSBmZWVsaW5nIGFzIGEgc2luZ2xlIG5vdGUgcGxheXNcbiAgICAgICAgLy8gZHVyaW5nIHNlZWtpbmcuXG5cbiAgICAgICAgaWYgKGlzUGxheWluZykge1xuICAgICAgICAgICAgLy8gSWYgd2Ugd2VyZSBwbGF5aW5nIGJlZm9yZSwgY29udGludWUgdGhlIGNvbnRleHQgc28gdGhlIGNsb2NrIGRvZXNuJ3QgZGVzeW5jLlxuICAgICAgICAgICAgYXdhaXQgdGhpcy5jb250ZXh0LnJlc3VtZSgpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gQXMgbWVudGlvbmVkIGFib3ZlLCB3ZSdsbCBoYXZlIHRvIHBhdXNlIHRoZSBjbGlwIGlmIHdlIHdlcmVuJ3Qgc3VwcG9zZWQgdG9cbiAgICAgICAgICAgIC8vIGJlIHBsYXlpbmcgaXQganVzdCB5ZXQuIElmIHdlIGRpZG4ndCBoYXZlIHRoaXMsIHRoZSBhdWRpbyBjbGlwIHBsYXlzIGJ1dCBhbGxcbiAgICAgICAgICAgIC8vIHRoZSBzdGF0ZXMgd2lsbCBiZSB3cm9uZzogY2xvY2sgd29uJ3QgYWR2YW5jZSwgcGF1c2Ugc3RhdGUgZG9lc24ndCBtYXRjaCB0aGVcbiAgICAgICAgICAgIC8vIGJsYXJpbmcgbm9pc2UgbGVhdmluZyB0aGUgdXNlcidzIHNwZWFrZXJzLCBldGMuXG4gICAgICAgICAgICAvL1xuICAgICAgICAgICAgLy8gQWxzbyBhcyBtZW50aW9uZWQsIGlmIHRoZSBjb2RlIGdhcCBpcyBzbWFsbCBlbm91Z2ggdGhlbiB0aGlzIHNob3VsZCBiZVxuICAgICAgICAgICAgLy8gZXhlY3V0ZWQgaW1tZWRpYXRlbHkgYWZ0ZXIgdGhlIHN0YXJ0IHRpbWUsIGxlYXZpbmcgbm8gZmVhc2libGUgdGltZSBmb3IgdGhlXG4gICAgICAgICAgICAvLyB1c2VyJ3Mgc3BlYWtlcnMgdG8gcGxheSBhbnkgc291bmQuXG4gICAgICAgICAgICBhd2FpdCB0aGlzLnBhdXNlKCk7XG4gICAgICAgIH1cbiAgICB9XG59XG4iXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBZ0JBOztBQUNBOztBQUNBOztBQUVBOztBQUNBOztBQUVBOztBQUNBOztBQUNBOztBQXpCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7SUFhWUEsYTs7O1dBQUFBLGE7RUFBQUEsYTtFQUFBQSxhO0VBQUFBLGE7RUFBQUEsYTtHQUFBQSxhLDZCQUFBQSxhOztBQU9MLE1BQU1DLHlCQUF5QixHQUFHLEVBQWxDOztBQUNQLE1BQU1DLDBCQUEwQixHQUFHLEdBQW5DLEMsQ0FBd0M7O0FBQ2pDLE1BQU1DLGdCQUFnQixHQUFHLElBQUFDLGlCQUFBLEVBQVUsQ0FBVixFQUFhSCx5QkFBYixDQUF6Qjs7O0FBRVAsU0FBU0ksb0JBQVQsQ0FBOEJDLEtBQTlCLEVBQXlEO0VBQ3JEO0VBQ0EsTUFBTUMsYUFBYSxHQUFHRCxLQUFLLENBQUNFLEdBQU4sQ0FBVUMsQ0FBQyxJQUFJQyxJQUFJLENBQUNDLEdBQUwsQ0FBU0YsQ0FBVCxDQUFmLENBQXRCLENBRnFELENBSXJEO0VBQ0E7O0VBQ0EsT0FBTyxJQUFBRyxvQkFBQSxFQUFhLElBQUFDLDhCQUFBLEVBQXVCTixhQUF2QixFQUFzQ04seUJBQXRDLENBQWIsRUFBK0UsQ0FBL0UsRUFBa0YsQ0FBbEYsQ0FBUDtBQUNIOztBQUVNLE1BQU1hLFFBQU4sU0FBdUJDLGVBQXZCLENBQTREO0VBQy9EO0FBQ0o7QUFDQTtBQUNBOztFQWFJO0FBQ0o7QUFDQTtBQUNB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