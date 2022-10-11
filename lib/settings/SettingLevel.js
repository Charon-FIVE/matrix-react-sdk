"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SettingLevel = void 0;

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
 * Represents the various setting levels supported by the SettingsStore.
 */
let SettingLevel;
exports.SettingLevel = SettingLevel;

(function (SettingLevel) {
  SettingLevel["DEVICE"] = "device";
  SettingLevel["ROOM_DEVICE"] = "room-device";
  SettingLevel["ROOM_ACCOUNT"] = "room-account";
  SettingLevel["ACCOUNT"] = "account";
  SettingLevel["ROOM"] = "room";
  SettingLevel["PLATFORM"] = "platform";
  SettingLevel["CONFIG"] = "config";
  SettingLevel["DEFAULT"] = "default";
})(SettingLevel || (exports.SettingLevel = SettingLevel = {}));
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJTZXR0aW5nTGV2ZWwiXSwic291cmNlcyI6WyIuLi8uLi9zcmMvc2V0dGluZ3MvU2V0dGluZ0xldmVsLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgMjAyMCBUaGUgTWF0cml4Lm9yZyBGb3VuZGF0aW9uIEMuSS5DLlxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbi8qKlxuICogUmVwcmVzZW50cyB0aGUgdmFyaW91cyBzZXR0aW5nIGxldmVscyBzdXBwb3J0ZWQgYnkgdGhlIFNldHRpbmdzU3RvcmUuXG4gKi9cbmV4cG9ydCBlbnVtIFNldHRpbmdMZXZlbCB7XG4gICAgLy8gVE9ETzogW1RTXSBGb2xsb3cgbmFtaW5nIGNvbnZlbnRpb25cbiAgICBERVZJQ0UgPSBcImRldmljZVwiLFxuICAgIFJPT01fREVWSUNFID0gXCJyb29tLWRldmljZVwiLFxuICAgIFJPT01fQUNDT1VOVCA9IFwicm9vbS1hY2NvdW50XCIsXG4gICAgQUNDT1VOVCA9IFwiYWNjb3VudFwiLFxuICAgIFJPT00gPSBcInJvb21cIixcbiAgICBQTEFURk9STSA9IFwicGxhdGZvcm1cIixcbiAgICBDT05GSUcgPSBcImNvbmZpZ1wiLFxuICAgIERFRkFVTFQgPSBcImRlZmF1bHRcIixcbn1cbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7OztBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7SUFDWUEsWTs7O1dBQUFBLFk7RUFBQUEsWTtFQUFBQSxZO0VBQUFBLFk7RUFBQUEsWTtFQUFBQSxZO0VBQUFBLFk7RUFBQUEsWTtFQUFBQSxZO0dBQUFBLFksNEJBQUFBLFkifQ==