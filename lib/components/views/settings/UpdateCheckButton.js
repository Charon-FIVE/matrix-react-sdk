"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _objectWithoutProperties2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutProperties"));

var _react = _interopRequireWildcard(require("react"));

var _BasePlatform = require("../../../BasePlatform");

var _PlatformPeg = _interopRequireDefault(require("../../../PlatformPeg"));

var _useDispatcher = require("../../../hooks/useDispatcher");

var _dispatcher = _interopRequireDefault(require("../../../dispatcher/dispatcher"));

var _actions = require("../../../dispatcher/actions");

var _languageHandler = require("../../../languageHandler");

var _InlineSpinner = _interopRequireDefault(require("../../../components/views/elements/InlineSpinner"));

var _AccessibleButton = _interopRequireDefault(require("../../../components/views/elements/AccessibleButton"));

const _excluded = ["action"];

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function installUpdate() {
  _PlatformPeg.default.get().installUpdate();
}

function getStatusText(status, errorDetail) {
  switch (status) {
    case _BasePlatform.UpdateCheckStatus.Error:
      return (0, _languageHandler._t)('Error encountered (%(errorDetail)s).', {
        errorDetail
      });

    case _BasePlatform.UpdateCheckStatus.Checking:
      return (0, _languageHandler._t)('Checking for an update...');

    case _BasePlatform.UpdateCheckStatus.NotAvailable:
      return (0, _languageHandler._t)('No update available.');

    case _BasePlatform.UpdateCheckStatus.Downloading:
      return (0, _languageHandler._t)('Downloading update...');

    case _BasePlatform.UpdateCheckStatus.Ready:
      return (0, _languageHandler._t)("New version available. <a>Update now.</a>", {}, {
        a: sub => /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
          kind: "link_inline",
          onClick: installUpdate
        }, sub)
      });
  }
}

const doneStatuses = [_BasePlatform.UpdateCheckStatus.Ready, _BasePlatform.UpdateCheckStatus.Error, _BasePlatform.UpdateCheckStatus.NotAvailable];

const UpdateCheckButton = () => {
  const [state, setState] = (0, _react.useState)(null);

  const onCheckForUpdateClick = () => {
    setState(null);

    _PlatformPeg.default.get().startUpdateCheck();
  };

  (0, _useDispatcher.useDispatcher)(_dispatcher.default, _ref => {
    let {
      action
    } = _ref,
        params = (0, _objectWithoutProperties2.default)(_ref, _excluded);

    if (action === _actions.Action.CheckUpdates) {
      setState(params);
    }
  });
  const busy = state && !doneStatuses.includes(state.status);
  let suffix;

  if (state) {
    suffix = /*#__PURE__*/_react.default.createElement("span", {
      className: "mx_UpdateCheckButton_summary"
    }, getStatusText(state.status, state.detail), busy && /*#__PURE__*/_react.default.createElement(_InlineSpinner.default, null));
  }

  return /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
    onClick: onCheckForUpdateClick,
    kind: "primary",
    disabled: busy
  }, (0, _languageHandler._t)("Check for update")), suffix);
};

var _default = UpdateCheckButton;
exports.default = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJpbnN0YWxsVXBkYXRlIiwiUGxhdGZvcm1QZWciLCJnZXQiLCJnZXRTdGF0dXNUZXh0Iiwic3RhdHVzIiwiZXJyb3JEZXRhaWwiLCJVcGRhdGVDaGVja1N0YXR1cyIsIkVycm9yIiwiX3QiLCJDaGVja2luZyIsIk5vdEF2YWlsYWJsZSIsIkRvd25sb2FkaW5nIiwiUmVhZHkiLCJhIiwic3ViIiwiZG9uZVN0YXR1c2VzIiwiVXBkYXRlQ2hlY2tCdXR0b24iLCJzdGF0ZSIsInNldFN0YXRlIiwidXNlU3RhdGUiLCJvbkNoZWNrRm9yVXBkYXRlQ2xpY2siLCJzdGFydFVwZGF0ZUNoZWNrIiwidXNlRGlzcGF0Y2hlciIsImRpcyIsImFjdGlvbiIsInBhcmFtcyIsIkFjdGlvbiIsIkNoZWNrVXBkYXRlcyIsImJ1c3kiLCJpbmNsdWRlcyIsInN1ZmZpeCIsImRldGFpbCJdLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL3NldHRpbmdzL1VwZGF0ZUNoZWNrQnV0dG9uLnRzeCJdLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMjAgVGhlIE1hdHJpeC5vcmcgRm91bmRhdGlvbiBDLkkuQy5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQgUmVhY3QsIHsgdXNlU3RhdGUgfSBmcm9tIFwicmVhY3RcIjtcblxuaW1wb3J0IHsgVXBkYXRlQ2hlY2tTdGF0dXMgfSBmcm9tIFwiLi4vLi4vLi4vQmFzZVBsYXRmb3JtXCI7XG5pbXBvcnQgUGxhdGZvcm1QZWcgZnJvbSBcIi4uLy4uLy4uL1BsYXRmb3JtUGVnXCI7XG5pbXBvcnQgeyB1c2VEaXNwYXRjaGVyIH0gZnJvbSBcIi4uLy4uLy4uL2hvb2tzL3VzZURpc3BhdGNoZXJcIjtcbmltcG9ydCBkaXMgZnJvbSBcIi4uLy4uLy4uL2Rpc3BhdGNoZXIvZGlzcGF0Y2hlclwiO1xuaW1wb3J0IHsgQWN0aW9uIH0gZnJvbSBcIi4uLy4uLy4uL2Rpc3BhdGNoZXIvYWN0aW9uc1wiO1xuaW1wb3J0IHsgX3QgfSBmcm9tIFwiLi4vLi4vLi4vbGFuZ3VhZ2VIYW5kbGVyXCI7XG5pbXBvcnQgSW5saW5lU3Bpbm5lciBmcm9tIFwiLi4vLi4vLi4vY29tcG9uZW50cy92aWV3cy9lbGVtZW50cy9JbmxpbmVTcGlubmVyXCI7XG5pbXBvcnQgQWNjZXNzaWJsZUJ1dHRvbiBmcm9tIFwiLi4vLi4vLi4vY29tcG9uZW50cy92aWV3cy9lbGVtZW50cy9BY2Nlc3NpYmxlQnV0dG9uXCI7XG5pbXBvcnQgeyBDaGVja1VwZGF0ZXNQYXlsb2FkIH0gZnJvbSBcIi4uLy4uLy4uL2Rpc3BhdGNoZXIvcGF5bG9hZHMvQ2hlY2tVcGRhdGVzUGF5bG9hZFwiO1xuXG5mdW5jdGlvbiBpbnN0YWxsVXBkYXRlKCkge1xuICAgIFBsYXRmb3JtUGVnLmdldCgpLmluc3RhbGxVcGRhdGUoKTtcbn1cblxuZnVuY3Rpb24gZ2V0U3RhdHVzVGV4dChzdGF0dXM6IFVwZGF0ZUNoZWNrU3RhdHVzLCBlcnJvckRldGFpbD86IHN0cmluZykge1xuICAgIHN3aXRjaCAoc3RhdHVzKSB7XG4gICAgICAgIGNhc2UgVXBkYXRlQ2hlY2tTdGF0dXMuRXJyb3I6XG4gICAgICAgICAgICByZXR1cm4gX3QoJ0Vycm9yIGVuY291bnRlcmVkICglKGVycm9yRGV0YWlsKXMpLicsIHsgZXJyb3JEZXRhaWwgfSk7XG4gICAgICAgIGNhc2UgVXBkYXRlQ2hlY2tTdGF0dXMuQ2hlY2tpbmc6XG4gICAgICAgICAgICByZXR1cm4gX3QoJ0NoZWNraW5nIGZvciBhbiB1cGRhdGUuLi4nKTtcbiAgICAgICAgY2FzZSBVcGRhdGVDaGVja1N0YXR1cy5Ob3RBdmFpbGFibGU6XG4gICAgICAgICAgICByZXR1cm4gX3QoJ05vIHVwZGF0ZSBhdmFpbGFibGUuJyk7XG4gICAgICAgIGNhc2UgVXBkYXRlQ2hlY2tTdGF0dXMuRG93bmxvYWRpbmc6XG4gICAgICAgICAgICByZXR1cm4gX3QoJ0Rvd25sb2FkaW5nIHVwZGF0ZS4uLicpO1xuICAgICAgICBjYXNlIFVwZGF0ZUNoZWNrU3RhdHVzLlJlYWR5OlxuICAgICAgICAgICAgcmV0dXJuIF90KFwiTmV3IHZlcnNpb24gYXZhaWxhYmxlLiA8YT5VcGRhdGUgbm93LjwvYT5cIiwge30sIHtcbiAgICAgICAgICAgICAgICBhOiBzdWIgPT4gPEFjY2Vzc2libGVCdXR0b24ga2luZD1cImxpbmtfaW5saW5lXCIgb25DbGljaz17aW5zdGFsbFVwZGF0ZX0+eyBzdWIgfTwvQWNjZXNzaWJsZUJ1dHRvbj4sXG4gICAgICAgICAgICB9KTtcbiAgICB9XG59XG5cbmNvbnN0IGRvbmVTdGF0dXNlcyA9IFtcbiAgICBVcGRhdGVDaGVja1N0YXR1cy5SZWFkeSxcbiAgICBVcGRhdGVDaGVja1N0YXR1cy5FcnJvcixcbiAgICBVcGRhdGVDaGVja1N0YXR1cy5Ob3RBdmFpbGFibGUsXG5dO1xuXG5jb25zdCBVcGRhdGVDaGVja0J1dHRvbiA9ICgpID0+IHtcbiAgICBjb25zdCBbc3RhdGUsIHNldFN0YXRlXSA9IHVzZVN0YXRlPENoZWNrVXBkYXRlc1BheWxvYWQ+KG51bGwpO1xuXG4gICAgY29uc3Qgb25DaGVja0ZvclVwZGF0ZUNsaWNrID0gKCkgPT4ge1xuICAgICAgICBzZXRTdGF0ZShudWxsKTtcbiAgICAgICAgUGxhdGZvcm1QZWcuZ2V0KCkuc3RhcnRVcGRhdGVDaGVjaygpO1xuICAgIH07XG5cbiAgICB1c2VEaXNwYXRjaGVyKGRpcywgKHsgYWN0aW9uLCAuLi5wYXJhbXMgfSkgPT4ge1xuICAgICAgICBpZiAoYWN0aW9uID09PSBBY3Rpb24uQ2hlY2tVcGRhdGVzKSB7XG4gICAgICAgICAgICBzZXRTdGF0ZShwYXJhbXMgYXMgQ2hlY2tVcGRhdGVzUGF5bG9hZCk7XG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIGNvbnN0IGJ1c3kgPSBzdGF0ZSAmJiAhZG9uZVN0YXR1c2VzLmluY2x1ZGVzKHN0YXRlLnN0YXR1cyk7XG5cbiAgICBsZXQgc3VmZml4O1xuICAgIGlmIChzdGF0ZSkge1xuICAgICAgICBzdWZmaXggPSA8c3BhbiBjbGFzc05hbWU9XCJteF9VcGRhdGVDaGVja0J1dHRvbl9zdW1tYXJ5XCI+XG4gICAgICAgICAgICB7IGdldFN0YXR1c1RleHQoc3RhdGUuc3RhdHVzLCBzdGF0ZS5kZXRhaWwpIH1cbiAgICAgICAgICAgIHsgYnVzeSAmJiA8SW5saW5lU3Bpbm5lciAvPiB9XG4gICAgICAgIDwvc3Bhbj47XG4gICAgfVxuXG4gICAgcmV0dXJuIDxSZWFjdC5GcmFnbWVudD5cbiAgICAgICAgPEFjY2Vzc2libGVCdXR0b24gb25DbGljaz17b25DaGVja0ZvclVwZGF0ZUNsaWNrfSBraW5kPVwicHJpbWFyeVwiIGRpc2FibGVkPXtidXN5fT5cbiAgICAgICAgICAgIHsgX3QoXCJDaGVjayBmb3IgdXBkYXRlXCIpIH1cbiAgICAgICAgPC9BY2Nlc3NpYmxlQnV0dG9uPlxuICAgICAgICB7IHN1ZmZpeCB9XG4gICAgPC9SZWFjdC5GcmFnbWVudD47XG59O1xuXG5leHBvcnQgZGVmYXVsdCBVcGRhdGVDaGVja0J1dHRvbjtcbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFnQkE7O0FBRUE7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7Ozs7Ozs7O0FBR0EsU0FBU0EsYUFBVCxHQUF5QjtFQUNyQkMsb0JBQUEsQ0FBWUMsR0FBWixHQUFrQkYsYUFBbEI7QUFDSDs7QUFFRCxTQUFTRyxhQUFULENBQXVCQyxNQUF2QixFQUFrREMsV0FBbEQsRUFBd0U7RUFDcEUsUUFBUUQsTUFBUjtJQUNJLEtBQUtFLCtCQUFBLENBQWtCQyxLQUF2QjtNQUNJLE9BQU8sSUFBQUMsbUJBQUEsRUFBRyxzQ0FBSCxFQUEyQztRQUFFSDtNQUFGLENBQTNDLENBQVA7O0lBQ0osS0FBS0MsK0JBQUEsQ0FBa0JHLFFBQXZCO01BQ0ksT0FBTyxJQUFBRCxtQkFBQSxFQUFHLDJCQUFILENBQVA7O0lBQ0osS0FBS0YsK0JBQUEsQ0FBa0JJLFlBQXZCO01BQ0ksT0FBTyxJQUFBRixtQkFBQSxFQUFHLHNCQUFILENBQVA7O0lBQ0osS0FBS0YsK0JBQUEsQ0FBa0JLLFdBQXZCO01BQ0ksT0FBTyxJQUFBSCxtQkFBQSxFQUFHLHVCQUFILENBQVA7O0lBQ0osS0FBS0YsK0JBQUEsQ0FBa0JNLEtBQXZCO01BQ0ksT0FBTyxJQUFBSixtQkFBQSxFQUFHLDJDQUFILEVBQWdELEVBQWhELEVBQW9EO1FBQ3ZESyxDQUFDLEVBQUVDLEdBQUcsaUJBQUksNkJBQUMseUJBQUQ7VUFBa0IsSUFBSSxFQUFDLGFBQXZCO1VBQXFDLE9BQU8sRUFBRWQ7UUFBOUMsR0FBK0RjLEdBQS9EO01BRDZDLENBQXBELENBQVA7RUFWUjtBQWNIOztBQUVELE1BQU1DLFlBQVksR0FBRyxDQUNqQlQsK0JBQUEsQ0FBa0JNLEtBREQsRUFFakJOLCtCQUFBLENBQWtCQyxLQUZELEVBR2pCRCwrQkFBQSxDQUFrQkksWUFIRCxDQUFyQjs7QUFNQSxNQUFNTSxpQkFBaUIsR0FBRyxNQUFNO0VBQzVCLE1BQU0sQ0FBQ0MsS0FBRCxFQUFRQyxRQUFSLElBQW9CLElBQUFDLGVBQUEsRUFBOEIsSUFBOUIsQ0FBMUI7O0VBRUEsTUFBTUMscUJBQXFCLEdBQUcsTUFBTTtJQUNoQ0YsUUFBUSxDQUFDLElBQUQsQ0FBUjs7SUFDQWpCLG9CQUFBLENBQVlDLEdBQVosR0FBa0JtQixnQkFBbEI7RUFDSCxDQUhEOztFQUtBLElBQUFDLDRCQUFBLEVBQWNDLG1CQUFkLEVBQW1CLFFBQTJCO0lBQUEsSUFBMUI7TUFBRUM7SUFBRixDQUEwQjtJQUFBLElBQWJDLE1BQWE7O0lBQzFDLElBQUlELE1BQU0sS0FBS0UsZUFBQSxDQUFPQyxZQUF0QixFQUFvQztNQUNoQ1QsUUFBUSxDQUFDTyxNQUFELENBQVI7SUFDSDtFQUNKLENBSkQ7RUFNQSxNQUFNRyxJQUFJLEdBQUdYLEtBQUssSUFBSSxDQUFDRixZQUFZLENBQUNjLFFBQWIsQ0FBc0JaLEtBQUssQ0FBQ2IsTUFBNUIsQ0FBdkI7RUFFQSxJQUFJMEIsTUFBSjs7RUFDQSxJQUFJYixLQUFKLEVBQVc7SUFDUGEsTUFBTSxnQkFBRztNQUFNLFNBQVMsRUFBQztJQUFoQixHQUNIM0IsYUFBYSxDQUFDYyxLQUFLLENBQUNiLE1BQVAsRUFBZWEsS0FBSyxDQUFDYyxNQUFyQixDQURWLEVBRUhILElBQUksaUJBQUksNkJBQUMsc0JBQUQsT0FGTCxDQUFUO0VBSUg7O0VBRUQsb0JBQU8sNkJBQUMsY0FBRCxDQUFPLFFBQVAscUJBQ0gsNkJBQUMseUJBQUQ7SUFBa0IsT0FBTyxFQUFFUixxQkFBM0I7SUFBa0QsSUFBSSxFQUFDLFNBQXZEO0lBQWlFLFFBQVEsRUFBRVE7RUFBM0UsR0FDTSxJQUFBcEIsbUJBQUEsRUFBRyxrQkFBSCxDQUROLENBREcsRUFJRHNCLE1BSkMsQ0FBUDtBQU1ILENBOUJEOztlQWdDZWQsaUIifQ==