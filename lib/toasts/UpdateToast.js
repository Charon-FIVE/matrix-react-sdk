"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.showToast = exports.hideToast = void 0;

var _react = _interopRequireDefault(require("react"));

var _languageHandler = require("../languageHandler");

var _SdkConfig = _interopRequireDefault(require("../SdkConfig"));

var _GenericToast = _interopRequireDefault(require("../components/views/toasts/GenericToast"));

var _ToastStore = _interopRequireDefault(require("../stores/ToastStore"));

var _QuestionDialog = _interopRequireDefault(require("../components/views/dialogs/QuestionDialog"));

var _ChangelogDialog = _interopRequireDefault(require("../components/views/dialogs/ChangelogDialog"));

var _PlatformPeg = _interopRequireDefault(require("../PlatformPeg"));

var _Modal = _interopRequireDefault(require("../Modal"));

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
const TOAST_KEY = "update";
/*
 * Check a version string is compatible with the Changelog
 * dialog ([element-version]-react-[react-sdk-version]-js-[js-sdk-version])
 */

function checkVersion(ver) {
  const parts = ver.split('-');
  return parts.length === 5 && parts[1] === 'react' && parts[3] === 'js';
}

function installUpdate() {
  _PlatformPeg.default.get().installUpdate();
}

const showToast = (version, newVersion, releaseNotes) => {
  function onReject() {
    _PlatformPeg.default.get().deferUpdate(newVersion);
  }

  let onAccept;
  let acceptLabel = (0, _languageHandler._t)("What's new?");

  if (releaseNotes) {
    onAccept = () => {
      _Modal.default.createDialog(_QuestionDialog.default, {
        title: (0, _languageHandler._t)("What's New"),
        description: /*#__PURE__*/_react.default.createElement("pre", null, releaseNotes),
        button: (0, _languageHandler._t)("Update"),
        onFinished: update => {
          if (update && _PlatformPeg.default.get()) {
            _PlatformPeg.default.get().installUpdate();
          }
        }
      });
    };
  } else if (checkVersion(version) && checkVersion(newVersion)) {
    onAccept = () => {
      _Modal.default.createDialog(_ChangelogDialog.default, {
        version,
        newVersion,
        onFinished: update => {
          if (update && _PlatformPeg.default.get()) {
            _PlatformPeg.default.get().installUpdate();
          }
        }
      });
    };
  } else {
    onAccept = installUpdate;
    acceptLabel = (0, _languageHandler._t)("Update");
  }

  const brand = _SdkConfig.default.get().brand;

  _ToastStore.default.sharedInstance().addOrReplaceToast({
    key: TOAST_KEY,
    title: (0, _languageHandler._t)("Update %(brand)s", {
      brand
    }),
    props: {
      description: (0, _languageHandler._t)("New version of %(brand)s is available", {
        brand
      }),
      acceptLabel,
      onAccept,
      rejectLabel: (0, _languageHandler._t)("Dismiss"),
      onReject
    },
    component: _GenericToast.default,
    priority: 20
  });
};

exports.showToast = showToast;

const hideToast = () => {
  _ToastStore.default.sharedInstance().dismissToast(TOAST_KEY);
};

exports.hideToast = hideToast;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJUT0FTVF9LRVkiLCJjaGVja1ZlcnNpb24iLCJ2ZXIiLCJwYXJ0cyIsInNwbGl0IiwibGVuZ3RoIiwiaW5zdGFsbFVwZGF0ZSIsIlBsYXRmb3JtUGVnIiwiZ2V0Iiwic2hvd1RvYXN0IiwidmVyc2lvbiIsIm5ld1ZlcnNpb24iLCJyZWxlYXNlTm90ZXMiLCJvblJlamVjdCIsImRlZmVyVXBkYXRlIiwib25BY2NlcHQiLCJhY2NlcHRMYWJlbCIsIl90IiwiTW9kYWwiLCJjcmVhdGVEaWFsb2ciLCJRdWVzdGlvbkRpYWxvZyIsInRpdGxlIiwiZGVzY3JpcHRpb24iLCJidXR0b24iLCJvbkZpbmlzaGVkIiwidXBkYXRlIiwiQ2hhbmdlbG9nRGlhbG9nIiwiYnJhbmQiLCJTZGtDb25maWciLCJUb2FzdFN0b3JlIiwic2hhcmVkSW5zdGFuY2UiLCJhZGRPclJlcGxhY2VUb2FzdCIsImtleSIsInByb3BzIiwicmVqZWN0TGFiZWwiLCJjb21wb25lbnQiLCJHZW5lcmljVG9hc3QiLCJwcmlvcml0eSIsImhpZGVUb2FzdCIsImRpc21pc3NUb2FzdCJdLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy90b2FzdHMvVXBkYXRlVG9hc3QudHN4Il0sInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgMjAyMCBUaGUgTWF0cml4Lm9yZyBGb3VuZGF0aW9uIEMuSS5DLlxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbmh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cblxuaW1wb3J0IFJlYWN0IGZyb20gXCJyZWFjdFwiO1xuXG5pbXBvcnQgeyBfdCB9IGZyb20gXCIuLi9sYW5ndWFnZUhhbmRsZXJcIjtcbmltcG9ydCBTZGtDb25maWcgZnJvbSBcIi4uL1Nka0NvbmZpZ1wiO1xuaW1wb3J0IEdlbmVyaWNUb2FzdCBmcm9tIFwiLi4vY29tcG9uZW50cy92aWV3cy90b2FzdHMvR2VuZXJpY1RvYXN0XCI7XG5pbXBvcnQgVG9hc3RTdG9yZSBmcm9tIFwiLi4vc3RvcmVzL1RvYXN0U3RvcmVcIjtcbmltcG9ydCBRdWVzdGlvbkRpYWxvZyBmcm9tIFwiLi4vY29tcG9uZW50cy92aWV3cy9kaWFsb2dzL1F1ZXN0aW9uRGlhbG9nXCI7XG5pbXBvcnQgQ2hhbmdlbG9nRGlhbG9nIGZyb20gXCIuLi9jb21wb25lbnRzL3ZpZXdzL2RpYWxvZ3MvQ2hhbmdlbG9nRGlhbG9nXCI7XG5pbXBvcnQgUGxhdGZvcm1QZWcgZnJvbSBcIi4uL1BsYXRmb3JtUGVnXCI7XG5pbXBvcnQgTW9kYWwgZnJvbSBcIi4uL01vZGFsXCI7XG5cbmNvbnN0IFRPQVNUX0tFWSA9IFwidXBkYXRlXCI7XG5cbi8qXG4gKiBDaGVjayBhIHZlcnNpb24gc3RyaW5nIGlzIGNvbXBhdGlibGUgd2l0aCB0aGUgQ2hhbmdlbG9nXG4gKiBkaWFsb2cgKFtlbGVtZW50LXZlcnNpb25dLXJlYWN0LVtyZWFjdC1zZGstdmVyc2lvbl0tanMtW2pzLXNkay12ZXJzaW9uXSlcbiAqL1xuZnVuY3Rpb24gY2hlY2tWZXJzaW9uKHZlcikge1xuICAgIGNvbnN0IHBhcnRzID0gdmVyLnNwbGl0KCctJyk7XG4gICAgcmV0dXJuIHBhcnRzLmxlbmd0aCA9PT0gNSAmJiBwYXJ0c1sxXSA9PT0gJ3JlYWN0JyAmJiBwYXJ0c1szXSA9PT0gJ2pzJztcbn1cblxuZnVuY3Rpb24gaW5zdGFsbFVwZGF0ZSgpIHtcbiAgICBQbGF0Zm9ybVBlZy5nZXQoKS5pbnN0YWxsVXBkYXRlKCk7XG59XG5cbmV4cG9ydCBjb25zdCBzaG93VG9hc3QgPSAodmVyc2lvbjogc3RyaW5nLCBuZXdWZXJzaW9uOiBzdHJpbmcsIHJlbGVhc2VOb3Rlcz86IHN0cmluZykgPT4ge1xuICAgIGZ1bmN0aW9uIG9uUmVqZWN0KCkge1xuICAgICAgICBQbGF0Zm9ybVBlZy5nZXQoKS5kZWZlclVwZGF0ZShuZXdWZXJzaW9uKTtcbiAgICB9XG5cbiAgICBsZXQgb25BY2NlcHQ7XG4gICAgbGV0IGFjY2VwdExhYmVsID0gX3QoXCJXaGF0J3MgbmV3P1wiKTtcbiAgICBpZiAocmVsZWFzZU5vdGVzKSB7XG4gICAgICAgIG9uQWNjZXB0ID0gKCkgPT4ge1xuICAgICAgICAgICAgTW9kYWwuY3JlYXRlRGlhbG9nKFF1ZXN0aW9uRGlhbG9nLCB7XG4gICAgICAgICAgICAgICAgdGl0bGU6IF90KFwiV2hhdCdzIE5ld1wiKSxcbiAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogPHByZT57IHJlbGVhc2VOb3RlcyB9PC9wcmU+LFxuICAgICAgICAgICAgICAgIGJ1dHRvbjogX3QoXCJVcGRhdGVcIiksXG4gICAgICAgICAgICAgICAgb25GaW5pc2hlZDogKHVwZGF0ZSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZiAodXBkYXRlICYmIFBsYXRmb3JtUGVnLmdldCgpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBQbGF0Zm9ybVBlZy5nZXQoKS5pbnN0YWxsVXBkYXRlKCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH07XG4gICAgfSBlbHNlIGlmIChjaGVja1ZlcnNpb24odmVyc2lvbikgJiYgY2hlY2tWZXJzaW9uKG5ld1ZlcnNpb24pKSB7XG4gICAgICAgIG9uQWNjZXB0ID0gKCkgPT4ge1xuICAgICAgICAgICAgTW9kYWwuY3JlYXRlRGlhbG9nKENoYW5nZWxvZ0RpYWxvZywge1xuICAgICAgICAgICAgICAgIHZlcnNpb24sXG4gICAgICAgICAgICAgICAgbmV3VmVyc2lvbixcbiAgICAgICAgICAgICAgICBvbkZpbmlzaGVkOiAodXBkYXRlKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGlmICh1cGRhdGUgJiYgUGxhdGZvcm1QZWcuZ2V0KCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIFBsYXRmb3JtUGVnLmdldCgpLmluc3RhbGxVcGRhdGUoKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBvbkFjY2VwdCA9IGluc3RhbGxVcGRhdGU7XG4gICAgICAgIGFjY2VwdExhYmVsID0gX3QoXCJVcGRhdGVcIik7XG4gICAgfVxuXG4gICAgY29uc3QgYnJhbmQgPSBTZGtDb25maWcuZ2V0KCkuYnJhbmQ7XG4gICAgVG9hc3RTdG9yZS5zaGFyZWRJbnN0YW5jZSgpLmFkZE9yUmVwbGFjZVRvYXN0KHtcbiAgICAgICAga2V5OiBUT0FTVF9LRVksXG4gICAgICAgIHRpdGxlOiBfdChcIlVwZGF0ZSAlKGJyYW5kKXNcIiwgeyBicmFuZCB9KSxcbiAgICAgICAgcHJvcHM6IHtcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBfdChcIk5ldyB2ZXJzaW9uIG9mICUoYnJhbmQpcyBpcyBhdmFpbGFibGVcIiwgeyBicmFuZCB9KSxcbiAgICAgICAgICAgIGFjY2VwdExhYmVsLFxuICAgICAgICAgICAgb25BY2NlcHQsXG4gICAgICAgICAgICByZWplY3RMYWJlbDogX3QoXCJEaXNtaXNzXCIpLFxuICAgICAgICAgICAgb25SZWplY3QsXG4gICAgICAgIH0sXG4gICAgICAgIGNvbXBvbmVudDogR2VuZXJpY1RvYXN0LFxuICAgICAgICBwcmlvcml0eTogMjAsXG4gICAgfSk7XG59O1xuXG5leHBvcnQgY29uc3QgaGlkZVRvYXN0ID0gKCkgPT4ge1xuICAgIFRvYXN0U3RvcmUuc2hhcmVkSW5zdGFuY2UoKS5kaXNtaXNzVG9hc3QoVE9BU1RfS0VZKTtcbn07XG4iXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztBQWdCQTs7QUFFQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUF6QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBYUEsTUFBTUEsU0FBUyxHQUFHLFFBQWxCO0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBQ0EsU0FBU0MsWUFBVCxDQUFzQkMsR0FBdEIsRUFBMkI7RUFDdkIsTUFBTUMsS0FBSyxHQUFHRCxHQUFHLENBQUNFLEtBQUosQ0FBVSxHQUFWLENBQWQ7RUFDQSxPQUFPRCxLQUFLLENBQUNFLE1BQU4sS0FBaUIsQ0FBakIsSUFBc0JGLEtBQUssQ0FBQyxDQUFELENBQUwsS0FBYSxPQUFuQyxJQUE4Q0EsS0FBSyxDQUFDLENBQUQsQ0FBTCxLQUFhLElBQWxFO0FBQ0g7O0FBRUQsU0FBU0csYUFBVCxHQUF5QjtFQUNyQkMsb0JBQUEsQ0FBWUMsR0FBWixHQUFrQkYsYUFBbEI7QUFDSDs7QUFFTSxNQUFNRyxTQUFTLEdBQUcsQ0FBQ0MsT0FBRCxFQUFrQkMsVUFBbEIsRUFBc0NDLFlBQXRDLEtBQWdFO0VBQ3JGLFNBQVNDLFFBQVQsR0FBb0I7SUFDaEJOLG9CQUFBLENBQVlDLEdBQVosR0FBa0JNLFdBQWxCLENBQThCSCxVQUE5QjtFQUNIOztFQUVELElBQUlJLFFBQUo7RUFDQSxJQUFJQyxXQUFXLEdBQUcsSUFBQUMsbUJBQUEsRUFBRyxhQUFILENBQWxCOztFQUNBLElBQUlMLFlBQUosRUFBa0I7SUFDZEcsUUFBUSxHQUFHLE1BQU07TUFDYkcsY0FBQSxDQUFNQyxZQUFOLENBQW1CQyx1QkFBbkIsRUFBbUM7UUFDL0JDLEtBQUssRUFBRSxJQUFBSixtQkFBQSxFQUFHLFlBQUgsQ0FEd0I7UUFFL0JLLFdBQVcsZUFBRSwwQ0FBT1YsWUFBUCxDQUZrQjtRQUcvQlcsTUFBTSxFQUFFLElBQUFOLG1CQUFBLEVBQUcsUUFBSCxDQUh1QjtRQUkvQk8sVUFBVSxFQUFHQyxNQUFELElBQVk7VUFDcEIsSUFBSUEsTUFBTSxJQUFJbEIsb0JBQUEsQ0FBWUMsR0FBWixFQUFkLEVBQWlDO1lBQzdCRCxvQkFBQSxDQUFZQyxHQUFaLEdBQWtCRixhQUFsQjtVQUNIO1FBQ0o7TUFSOEIsQ0FBbkM7SUFVSCxDQVhEO0VBWUgsQ0FiRCxNQWFPLElBQUlMLFlBQVksQ0FBQ1MsT0FBRCxDQUFaLElBQXlCVCxZQUFZLENBQUNVLFVBQUQsQ0FBekMsRUFBdUQ7SUFDMURJLFFBQVEsR0FBRyxNQUFNO01BQ2JHLGNBQUEsQ0FBTUMsWUFBTixDQUFtQk8sd0JBQW5CLEVBQW9DO1FBQ2hDaEIsT0FEZ0M7UUFFaENDLFVBRmdDO1FBR2hDYSxVQUFVLEVBQUdDLE1BQUQsSUFBWTtVQUNwQixJQUFJQSxNQUFNLElBQUlsQixvQkFBQSxDQUFZQyxHQUFaLEVBQWQsRUFBaUM7WUFDN0JELG9CQUFBLENBQVlDLEdBQVosR0FBa0JGLGFBQWxCO1VBQ0g7UUFDSjtNQVArQixDQUFwQztJQVNILENBVkQ7RUFXSCxDQVpNLE1BWUE7SUFDSFMsUUFBUSxHQUFHVCxhQUFYO0lBQ0FVLFdBQVcsR0FBRyxJQUFBQyxtQkFBQSxFQUFHLFFBQUgsQ0FBZDtFQUNIOztFQUVELE1BQU1VLEtBQUssR0FBR0Msa0JBQUEsQ0FBVXBCLEdBQVYsR0FBZ0JtQixLQUE5Qjs7RUFDQUUsbUJBQUEsQ0FBV0MsY0FBWCxHQUE0QkMsaUJBQTVCLENBQThDO0lBQzFDQyxHQUFHLEVBQUVoQyxTQURxQztJQUUxQ3FCLEtBQUssRUFBRSxJQUFBSixtQkFBQSxFQUFHLGtCQUFILEVBQXVCO01BQUVVO0lBQUYsQ0FBdkIsQ0FGbUM7SUFHMUNNLEtBQUssRUFBRTtNQUNIWCxXQUFXLEVBQUUsSUFBQUwsbUJBQUEsRUFBRyx1Q0FBSCxFQUE0QztRQUFFVTtNQUFGLENBQTVDLENBRFY7TUFFSFgsV0FGRztNQUdIRCxRQUhHO01BSUhtQixXQUFXLEVBQUUsSUFBQWpCLG1CQUFBLEVBQUcsU0FBSCxDQUpWO01BS0hKO0lBTEcsQ0FIbUM7SUFVMUNzQixTQUFTLEVBQUVDLHFCQVYrQjtJQVcxQ0MsUUFBUSxFQUFFO0VBWGdDLENBQTlDO0FBYUgsQ0FuRE07Ozs7QUFxREEsTUFBTUMsU0FBUyxHQUFHLE1BQU07RUFDM0JULG1CQUFBLENBQVdDLGNBQVgsR0FBNEJTLFlBQTVCLENBQXlDdkMsU0FBekM7QUFDSCxDQUZNIn0=