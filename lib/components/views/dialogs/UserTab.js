"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.UserTab = void 0;

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
let UserTab;
exports.UserTab = UserTab;

(function (UserTab) {
  UserTab["General"] = "USER_GENERAL_TAB";
  UserTab["Appearance"] = "USER_APPEARANCE_TAB";
  UserTab["Notifications"] = "USER_NOTIFICATIONS_TAB";
  UserTab["Preferences"] = "USER_PREFERENCES_TAB";
  UserTab["Keyboard"] = "USER_KEYBOARD_TAB";
  UserTab["Sidebar"] = "USER_SIDEBAR_TAB";
  UserTab["Voice"] = "USER_VOICE_TAB";
  UserTab["Security"] = "USER_SECURITY_TAB";
  UserTab["Labs"] = "USER_LABS_TAB";
  UserTab["Mjolnir"] = "USER_MJOLNIR_TAB";
  UserTab["Help"] = "USER_HELP_TAB";
  UserTab["SessionManager"] = "USER_SESSION_MANAGER_TAB";
})(UserTab || (exports.UserTab = UserTab = {}));
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJVc2VyVGFiIl0sInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL2NvbXBvbmVudHMvdmlld3MvZGlhbG9ncy9Vc2VyVGFiLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgMjAyMiBUaGUgTWF0cml4Lm9yZyBGb3VuZGF0aW9uIEMuSS5DLlxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbmV4cG9ydCBlbnVtIFVzZXJUYWIge1xuICAgIEdlbmVyYWwgPSBcIlVTRVJfR0VORVJBTF9UQUJcIixcbiAgICBBcHBlYXJhbmNlID0gXCJVU0VSX0FQUEVBUkFOQ0VfVEFCXCIsXG4gICAgTm90aWZpY2F0aW9ucyA9IFwiVVNFUl9OT1RJRklDQVRJT05TX1RBQlwiLFxuICAgIFByZWZlcmVuY2VzID0gXCJVU0VSX1BSRUZFUkVOQ0VTX1RBQlwiLFxuICAgIEtleWJvYXJkID0gXCJVU0VSX0tFWUJPQVJEX1RBQlwiLFxuICAgIFNpZGViYXIgPSBcIlVTRVJfU0lERUJBUl9UQUJcIixcbiAgICBWb2ljZSA9IFwiVVNFUl9WT0lDRV9UQUJcIixcbiAgICBTZWN1cml0eSA9IFwiVVNFUl9TRUNVUklUWV9UQUJcIixcbiAgICBMYWJzID0gXCJVU0VSX0xBQlNfVEFCXCIsXG4gICAgTWpvbG5pciA9IFwiVVNFUl9NSk9MTklSX1RBQlwiLFxuICAgIEhlbHAgPSBcIlVTRVJfSEVMUF9UQUJcIixcbiAgICBTZXNzaW9uTWFuYWdlciA9IFwiVVNFUl9TRVNTSU9OX01BTkFHRVJfVEFCXCIsXG59XG4iXSwibWFwcGluZ3MiOiI7Ozs7Ozs7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7SUFFWUEsTzs7O1dBQUFBLE87RUFBQUEsTztFQUFBQSxPO0VBQUFBLE87RUFBQUEsTztFQUFBQSxPO0VBQUFBLE87RUFBQUEsTztFQUFBQSxPO0VBQUFBLE87RUFBQUEsTztFQUFBQSxPO0VBQUFBLE87R0FBQUEsTyx1QkFBQUEsTyJ9