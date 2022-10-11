"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.polyfillTouchEvent = polyfillTouchEvent;

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
// This is intended to fix re-resizer because of its unguarded `instanceof TouchEvent` checks.
function polyfillTouchEvent() {
  // Firefox doesn't have touch events without touch devices being present, so create a fake
  // one we can rely on lying about.
  if (!window.TouchEvent) {
    // We have no intention of actually using this, so just lie.
    window.TouchEvent = class TouchEvent extends UIEvent {
      get altKey() {
        return false;
      }

      get changedTouches() {
        return [];
      }

      get ctrlKey() {
        return false;
      }

      get metaKey() {
        return false;
      }

      get shiftKey() {
        return false;
      }

      get targetTouches() {
        return [];
      }

      get touches() {
        return [];
      }

      get rotation() {
        return 0.0;
      }

      get scale() {
        return 0.0;
      }

      constructor(eventType, params) {
        super(eventType, params);
      }

    };
  }
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJwb2x5ZmlsbFRvdWNoRXZlbnQiLCJ3aW5kb3ciLCJUb3VjaEV2ZW50IiwiVUlFdmVudCIsImFsdEtleSIsImNoYW5nZWRUb3VjaGVzIiwiY3RybEtleSIsIm1ldGFLZXkiLCJzaGlmdEtleSIsInRhcmdldFRvdWNoZXMiLCJ0b3VjaGVzIiwicm90YXRpb24iLCJzY2FsZSIsImNvbnN0cnVjdG9yIiwiZXZlbnRUeXBlIiwicGFyYW1zIl0sInNvdXJjZXMiOlsiLi4vLi4vc3JjL0B0eXBlcy9wb2x5ZmlsbC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMjAgVGhlIE1hdHJpeC5vcmcgRm91bmRhdGlvbiBDLkkuQy5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG4vLyBUaGlzIGlzIGludGVuZGVkIHRvIGZpeCByZS1yZXNpemVyIGJlY2F1c2Ugb2YgaXRzIHVuZ3VhcmRlZCBgaW5zdGFuY2VvZiBUb3VjaEV2ZW50YCBjaGVja3MuXG5leHBvcnQgZnVuY3Rpb24gcG9seWZpbGxUb3VjaEV2ZW50KCkge1xuICAgIC8vIEZpcmVmb3ggZG9lc24ndCBoYXZlIHRvdWNoIGV2ZW50cyB3aXRob3V0IHRvdWNoIGRldmljZXMgYmVpbmcgcHJlc2VudCwgc28gY3JlYXRlIGEgZmFrZVxuICAgIC8vIG9uZSB3ZSBjYW4gcmVseSBvbiBseWluZyBhYm91dC5cbiAgICBpZiAoIXdpbmRvdy5Ub3VjaEV2ZW50KSB7XG4gICAgICAgIC8vIFdlIGhhdmUgbm8gaW50ZW50aW9uIG9mIGFjdHVhbGx5IHVzaW5nIHRoaXMsIHNvIGp1c3QgbGllLlxuICAgICAgICB3aW5kb3cuVG91Y2hFdmVudCA9IGNsYXNzIFRvdWNoRXZlbnQgZXh0ZW5kcyBVSUV2ZW50IHtcbiAgICAgICAgICAgIHB1YmxpYyBnZXQgYWx0S2V5KCk6IGJvb2xlYW4geyByZXR1cm4gZmFsc2U7IH1cbiAgICAgICAgICAgIHB1YmxpYyBnZXQgY2hhbmdlZFRvdWNoZXMoKTogYW55IHsgcmV0dXJuIFtdOyB9XG4gICAgICAgICAgICBwdWJsaWMgZ2V0IGN0cmxLZXkoKTogYm9vbGVhbiB7IHJldHVybiBmYWxzZTsgfVxuICAgICAgICAgICAgcHVibGljIGdldCBtZXRhS2V5KCk6IGJvb2xlYW4geyByZXR1cm4gZmFsc2U7IH1cbiAgICAgICAgICAgIHB1YmxpYyBnZXQgc2hpZnRLZXkoKTogYm9vbGVhbiB7IHJldHVybiBmYWxzZTsgfVxuICAgICAgICAgICAgcHVibGljIGdldCB0YXJnZXRUb3VjaGVzKCk6IGFueSB7IHJldHVybiBbXTsgfVxuICAgICAgICAgICAgcHVibGljIGdldCB0b3VjaGVzKCk6IGFueSB7IHJldHVybiBbXTsgfVxuICAgICAgICAgICAgcHVibGljIGdldCByb3RhdGlvbigpOiBudW1iZXIgeyByZXR1cm4gMC4wOyB9XG4gICAgICAgICAgICBwdWJsaWMgZ2V0IHNjYWxlKCk6IG51bWJlciB7IHJldHVybiAwLjA7IH1cbiAgICAgICAgICAgIGNvbnN0cnVjdG9yKGV2ZW50VHlwZTogc3RyaW5nLCBwYXJhbXM/OiBhbnkpIHtcbiAgICAgICAgICAgICAgICBzdXBlcihldmVudFR5cGUsIHBhcmFtcyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgfVxufVxuIl0sIm1hcHBpbmdzIjoiOzs7Ozs7O0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBRUE7QUFDTyxTQUFTQSxrQkFBVCxHQUE4QjtFQUNqQztFQUNBO0VBQ0EsSUFBSSxDQUFDQyxNQUFNLENBQUNDLFVBQVosRUFBd0I7SUFDcEI7SUFDQUQsTUFBTSxDQUFDQyxVQUFQLEdBQW9CLE1BQU1BLFVBQU4sU0FBeUJDLE9BQXpCLENBQWlDO01BQ2hDLElBQU5DLE1BQU0sR0FBWTtRQUFFLE9BQU8sS0FBUDtNQUFlOztNQUNyQixJQUFkQyxjQUFjLEdBQVE7UUFBRSxPQUFPLEVBQVA7TUFBWTs7TUFDN0IsSUFBUEMsT0FBTyxHQUFZO1FBQUUsT0FBTyxLQUFQO01BQWU7O01BQzdCLElBQVBDLE9BQU8sR0FBWTtRQUFFLE9BQU8sS0FBUDtNQUFlOztNQUM1QixJQUFSQyxRQUFRLEdBQVk7UUFBRSxPQUFPLEtBQVA7TUFBZTs7TUFDeEIsSUFBYkMsYUFBYSxHQUFRO1FBQUUsT0FBTyxFQUFQO01BQVk7O01BQzVCLElBQVBDLE9BQU8sR0FBUTtRQUFFLE9BQU8sRUFBUDtNQUFZOztNQUNyQixJQUFSQyxRQUFRLEdBQVc7UUFBRSxPQUFPLEdBQVA7TUFBYTs7TUFDN0IsSUFBTEMsS0FBSyxHQUFXO1FBQUUsT0FBTyxHQUFQO01BQWE7O01BQzFDQyxXQUFXLENBQUNDLFNBQUQsRUFBb0JDLE1BQXBCLEVBQWtDO1FBQ3pDLE1BQU1ELFNBQU4sRUFBaUJDLE1BQWpCO01BQ0g7O0lBWmdELENBQXJEO0VBY0g7QUFDSiJ9