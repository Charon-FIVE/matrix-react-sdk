"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireDefault(require("react"));

var _logger = require("matrix-js-sdk/src/logger");

var _languageHandler = require("../../../languageHandler");

var _SettingsStore = _interopRequireDefault(require("../../../settings/SettingsStore"));

var _theme = require("../../../theme");

var _ThemeWatcher = _interopRequireDefault(require("../../../settings/watchers/ThemeWatcher"));

var _AccessibleButton = _interopRequireDefault(require("../elements/AccessibleButton"));

var _dispatcher = _interopRequireDefault(require("../../../dispatcher/dispatcher"));

var _actions = require("../../../dispatcher/actions");

var _StyledCheckbox = _interopRequireDefault(require("../elements/StyledCheckbox"));

var _Field = _interopRequireDefault(require("../elements/Field"));

var _StyledRadioGroup = _interopRequireDefault(require("../elements/StyledRadioGroup"));

var _SettingLevel = require("../../../settings/SettingLevel");

var _PosthogTrackers = _interopRequireDefault(require("../../../PosthogTrackers"));

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { (0, _defineProperty2.default)(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }

class ThemeChoicePanel extends _react.default.Component {
  constructor(props) {
    super(props);
    (0, _defineProperty2.default)(this, "themeTimer", void 0);
    (0, _defineProperty2.default)(this, "onThemeChange", newTheme => {
      if (this.state.theme === newTheme) return;

      _PosthogTrackers.default.trackInteraction("WebSettingsAppearanceTabThemeSelector"); // doing getValue in the .catch will still return the value we failed to set,
      // so remember what the value was before we tried to set it so we can revert


      const oldTheme = _SettingsStore.default.getValue('theme');

      _SettingsStore.default.setValue("theme", null, _SettingLevel.SettingLevel.DEVICE, newTheme).catch(() => {
        _dispatcher.default.dispatch({
          action: _actions.Action.RecheckTheme
        });

        this.setState({
          theme: oldTheme
        });
      });

      this.setState({
        theme: newTheme
      }); // The settings watcher doesn't fire until the echo comes back from the
      // server, so to make the theme change immediately we need to manually
      // do the dispatch now
      // XXX: The local echoed value appears to be unreliable, in particular
      // when settings custom themes(!) so adding forceTheme to override
      // the value from settings.

      _dispatcher.default.dispatch({
        action: _actions.Action.RecheckTheme,
        forceTheme: newTheme
      });
    });
    (0, _defineProperty2.default)(this, "onUseSystemThemeChanged", checked => {
      this.setState({
        useSystemTheme: checked
      });

      _SettingsStore.default.setValue("use_system_theme", null, _SettingLevel.SettingLevel.DEVICE, checked);

      _dispatcher.default.dispatch({
        action: _actions.Action.RecheckTheme
      });
    });
    (0, _defineProperty2.default)(this, "onAddCustomTheme", async () => {
      let currentThemes = _SettingsStore.default.getValue("custom_themes");

      if (!currentThemes) currentThemes = [];
      currentThemes = currentThemes.map(c => c); // cheap clone

      if (this.themeTimer) {
        clearTimeout(this.themeTimer);
      }

      try {
        const r = await fetch(this.state.customThemeUrl); // XXX: need some schema for this

        const themeInfo = await r.json();

        if (!themeInfo || typeof themeInfo['name'] !== 'string' || typeof themeInfo['colors'] !== 'object') {
          this.setState({
            customThemeMessage: {
              text: (0, _languageHandler._t)("Invalid theme schema."),
              isError: true
            }
          });
          return;
        }

        currentThemes.push(themeInfo);
      } catch (e) {
        _logger.logger.error(e);

        this.setState({
          customThemeMessage: {
            text: (0, _languageHandler._t)("Error downloading theme information."),
            isError: true
          }
        });
        return; // Don't continue on error
      }

      await _SettingsStore.default.setValue("custom_themes", null, _SettingLevel.SettingLevel.ACCOUNT, currentThemes);
      this.setState({
        customThemeUrl: "",
        customThemeMessage: {
          text: (0, _languageHandler._t)("Theme added!"),
          isError: false
        }
      });
      this.themeTimer = setTimeout(() => {
        this.setState({
          customThemeMessage: {
            text: "",
            isError: false
          }
        });
      }, 3000);
    });
    (0, _defineProperty2.default)(this, "onCustomThemeChange", e => {
      this.setState({
        customThemeUrl: e.target.value
      });
    });
    this.state = _objectSpread(_objectSpread({}, ThemeChoicePanel.calculateThemeState()), {}, {
      customThemeUrl: "",
      customThemeMessage: {
        isError: false,
        text: ""
      }
    });
  }

  static calculateThemeState() {
    // We have to mirror the logic from ThemeWatcher.getEffectiveTheme so we
    // show the right values for things.
    const themeChoice = _SettingsStore.default.getValue("theme");

    const systemThemeExplicit = _SettingsStore.default.getValueAt(_SettingLevel.SettingLevel.DEVICE, "use_system_theme", null, false, true);

    const themeExplicit = _SettingsStore.default.getValueAt(_SettingLevel.SettingLevel.DEVICE, "theme", null, false, true); // If the user has enabled system theme matching, use that.


    if (systemThemeExplicit) {
      return {
        theme: themeChoice,
        useSystemTheme: true
      };
    } // If the user has set a theme explicitly, use that (no system theme matching)


    if (themeExplicit) {
      return {
        theme: themeChoice,
        useSystemTheme: false
      };
    } // Otherwise assume the defaults for the settings


    return {
      theme: themeChoice,
      useSystemTheme: _SettingsStore.default.getValueAt(_SettingLevel.SettingLevel.DEVICE, "use_system_theme")
    };
  }

  renderHighContrastCheckbox() {
    if (!this.state.useSystemTheme && ((0, _theme.findHighContrastTheme)(this.state.theme) || (0, _theme.isHighContrastTheme)(this.state.theme))) {
      return /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement(_StyledCheckbox.default, {
        checked: (0, _theme.isHighContrastTheme)(this.state.theme),
        onChange: e => this.highContrastThemeChanged(e.target.checked)
      }, (0, _languageHandler._t)("Use high contrast")));
    }
  }

  highContrastThemeChanged(checked) {
    let newTheme;

    if (checked) {
      newTheme = (0, _theme.findHighContrastTheme)(this.state.theme);
    } else {
      newTheme = (0, _theme.findNonHighContrastTheme)(this.state.theme);
    }

    if (newTheme) {
      this.onThemeChange(newTheme);
    }
  }

  render() {
    const themeWatcher = new _ThemeWatcher.default();
    let systemThemeSection;

    if (themeWatcher.isSystemThemeSupported()) {
      systemThemeSection = /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement(_StyledCheckbox.default, {
        checked: this.state.useSystemTheme,
        onChange: e => this.onUseSystemThemeChanged(e.target.checked)
      }, _SettingsStore.default.getDisplayName("use_system_theme")));
    }

    let customThemeForm;

    if (_SettingsStore.default.getValue("feature_custom_themes")) {
      let messageElement = null;

      if (this.state.customThemeMessage.text) {
        if (this.state.customThemeMessage.isError) {
          messageElement = /*#__PURE__*/_react.default.createElement("div", {
            className: "text-error"
          }, this.state.customThemeMessage.text);
        } else {
          messageElement = /*#__PURE__*/_react.default.createElement("div", {
            className: "text-success"
          }, this.state.customThemeMessage.text);
        }
      }

      customThemeForm = /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_SettingsTab_section"
      }, /*#__PURE__*/_react.default.createElement("form", {
        onSubmit: this.onAddCustomTheme
      }, /*#__PURE__*/_react.default.createElement(_Field.default, {
        label: (0, _languageHandler._t)("Custom theme URL"),
        type: "text",
        id: "mx_GeneralUserSettingsTab_customThemeInput",
        autoComplete: "off",
        onChange: this.onCustomThemeChange,
        value: this.state.customThemeUrl
      }), /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
        onClick: this.onAddCustomTheme,
        type: "submit",
        kind: "primary_sm",
        disabled: !this.state.customThemeUrl.trim()
      }, (0, _languageHandler._t)("Add theme")), messageElement));
    }

    const orderedThemes = (0, _theme.getOrderedThemes)();
    return /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_SettingsTab_section mx_ThemeChoicePanel"
    }, /*#__PURE__*/_react.default.createElement("span", {
      className: "mx_SettingsTab_subheading"
    }, (0, _languageHandler._t)("Theme")), systemThemeSection, /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_ThemeSelectors"
    }, /*#__PURE__*/_react.default.createElement(_StyledRadioGroup.default, {
      name: "theme",
      definitions: orderedThemes.map(t => ({
        value: t.id,
        label: t.name,
        disabled: this.state.useSystemTheme,
        className: "mx_ThemeSelector_" + t.id
      })),
      onChange: this.onThemeChange,
      value: this.apparentSelectedThemeId(),
      outlined: true
    })), this.renderHighContrastCheckbox(), customThemeForm);
  }

  apparentSelectedThemeId() {
    if (this.state.useSystemTheme) {
      return undefined;
    }

    const nonHighContrast = (0, _theme.findNonHighContrastTheme)(this.state.theme);
    return nonHighContrast ? nonHighContrast : this.state.theme;
  }

}

exports.default = ThemeChoicePanel;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJUaGVtZUNob2ljZVBhbmVsIiwiUmVhY3QiLCJDb21wb25lbnQiLCJjb25zdHJ1Y3RvciIsInByb3BzIiwibmV3VGhlbWUiLCJzdGF0ZSIsInRoZW1lIiwiUG9zdGhvZ1RyYWNrZXJzIiwidHJhY2tJbnRlcmFjdGlvbiIsIm9sZFRoZW1lIiwiU2V0dGluZ3NTdG9yZSIsImdldFZhbHVlIiwic2V0VmFsdWUiLCJTZXR0aW5nTGV2ZWwiLCJERVZJQ0UiLCJjYXRjaCIsImRpcyIsImRpc3BhdGNoIiwiYWN0aW9uIiwiQWN0aW9uIiwiUmVjaGVja1RoZW1lIiwic2V0U3RhdGUiLCJmb3JjZVRoZW1lIiwiY2hlY2tlZCIsInVzZVN5c3RlbVRoZW1lIiwiY3VycmVudFRoZW1lcyIsIm1hcCIsImMiLCJ0aGVtZVRpbWVyIiwiY2xlYXJUaW1lb3V0IiwiciIsImZldGNoIiwiY3VzdG9tVGhlbWVVcmwiLCJ0aGVtZUluZm8iLCJqc29uIiwiY3VzdG9tVGhlbWVNZXNzYWdlIiwidGV4dCIsIl90IiwiaXNFcnJvciIsInB1c2giLCJlIiwibG9nZ2VyIiwiZXJyb3IiLCJBQ0NPVU5UIiwic2V0VGltZW91dCIsInRhcmdldCIsInZhbHVlIiwiY2FsY3VsYXRlVGhlbWVTdGF0ZSIsInRoZW1lQ2hvaWNlIiwic3lzdGVtVGhlbWVFeHBsaWNpdCIsImdldFZhbHVlQXQiLCJ0aGVtZUV4cGxpY2l0IiwicmVuZGVySGlnaENvbnRyYXN0Q2hlY2tib3giLCJmaW5kSGlnaENvbnRyYXN0VGhlbWUiLCJpc0hpZ2hDb250cmFzdFRoZW1lIiwiaGlnaENvbnRyYXN0VGhlbWVDaGFuZ2VkIiwiZmluZE5vbkhpZ2hDb250cmFzdFRoZW1lIiwib25UaGVtZUNoYW5nZSIsInJlbmRlciIsInRoZW1lV2F0Y2hlciIsIlRoZW1lV2F0Y2hlciIsInN5c3RlbVRoZW1lU2VjdGlvbiIsImlzU3lzdGVtVGhlbWVTdXBwb3J0ZWQiLCJvblVzZVN5c3RlbVRoZW1lQ2hhbmdlZCIsImdldERpc3BsYXlOYW1lIiwiY3VzdG9tVGhlbWVGb3JtIiwibWVzc2FnZUVsZW1lbnQiLCJvbkFkZEN1c3RvbVRoZW1lIiwib25DdXN0b21UaGVtZUNoYW5nZSIsInRyaW0iLCJvcmRlcmVkVGhlbWVzIiwiZ2V0T3JkZXJlZFRoZW1lcyIsInQiLCJpZCIsImxhYmVsIiwibmFtZSIsImRpc2FibGVkIiwiY2xhc3NOYW1lIiwiYXBwYXJlbnRTZWxlY3RlZFRoZW1lSWQiLCJ1bmRlZmluZWQiLCJub25IaWdoQ29udHJhc3QiXSwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvY29tcG9uZW50cy92aWV3cy9zZXR0aW5ncy9UaGVtZUNob2ljZVBhbmVsLnRzeCJdLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMjEgVGhlIE1hdHJpeC5vcmcgRm91bmRhdGlvbiBDLkkuQy5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnO1xuaW1wb3J0IHsgbG9nZ2VyIH0gZnJvbSBcIm1hdHJpeC1qcy1zZGsvc3JjL2xvZ2dlclwiO1xuXG5pbXBvcnQgeyBfdCB9IGZyb20gXCIuLi8uLi8uLi9sYW5ndWFnZUhhbmRsZXJcIjtcbmltcG9ydCBTZXR0aW5nc1N0b3JlIGZyb20gXCIuLi8uLi8uLi9zZXR0aW5ncy9TZXR0aW5nc1N0b3JlXCI7XG5pbXBvcnQgeyBmaW5kSGlnaENvbnRyYXN0VGhlbWUsIGZpbmROb25IaWdoQ29udHJhc3RUaGVtZSwgZ2V0T3JkZXJlZFRoZW1lcywgaXNIaWdoQ29udHJhc3RUaGVtZSB9IGZyb20gXCIuLi8uLi8uLi90aGVtZVwiO1xuaW1wb3J0IFRoZW1lV2F0Y2hlciBmcm9tIFwiLi4vLi4vLi4vc2V0dGluZ3Mvd2F0Y2hlcnMvVGhlbWVXYXRjaGVyXCI7XG5pbXBvcnQgQWNjZXNzaWJsZUJ1dHRvbiBmcm9tIFwiLi4vZWxlbWVudHMvQWNjZXNzaWJsZUJ1dHRvblwiO1xuaW1wb3J0IGRpcyBmcm9tIFwiLi4vLi4vLi4vZGlzcGF0Y2hlci9kaXNwYXRjaGVyXCI7XG5pbXBvcnQgeyBSZWNoZWNrVGhlbWVQYXlsb2FkIH0gZnJvbSAnLi4vLi4vLi4vZGlzcGF0Y2hlci9wYXlsb2Fkcy9SZWNoZWNrVGhlbWVQYXlsb2FkJztcbmltcG9ydCB7IEFjdGlvbiB9IGZyb20gJy4uLy4uLy4uL2Rpc3BhdGNoZXIvYWN0aW9ucyc7XG5pbXBvcnQgU3R5bGVkQ2hlY2tib3ggZnJvbSAnLi4vZWxlbWVudHMvU3R5bGVkQ2hlY2tib3gnO1xuaW1wb3J0IEZpZWxkIGZyb20gJy4uL2VsZW1lbnRzL0ZpZWxkJztcbmltcG9ydCBTdHlsZWRSYWRpb0dyb3VwIGZyb20gXCIuLi9lbGVtZW50cy9TdHlsZWRSYWRpb0dyb3VwXCI7XG5pbXBvcnQgeyBTZXR0aW5nTGV2ZWwgfSBmcm9tIFwiLi4vLi4vLi4vc2V0dGluZ3MvU2V0dGluZ0xldmVsXCI7XG5pbXBvcnQgUG9zdGhvZ1RyYWNrZXJzIGZyb20gXCIuLi8uLi8uLi9Qb3N0aG9nVHJhY2tlcnNcIjtcblxuaW50ZXJmYWNlIElQcm9wcyB7XG59XG5cbmludGVyZmFjZSBJVGhlbWVTdGF0ZSB7XG4gICAgdGhlbWU6IHN0cmluZztcbiAgICB1c2VTeXN0ZW1UaGVtZTogYm9vbGVhbjtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBDdXN0b21UaGVtZU1lc3NhZ2Uge1xuICAgIGlzRXJyb3I6IGJvb2xlYW47XG4gICAgdGV4dDogc3RyaW5nO1xufVxuXG5pbnRlcmZhY2UgSVN0YXRlIGV4dGVuZHMgSVRoZW1lU3RhdGUge1xuICAgIGN1c3RvbVRoZW1lVXJsOiBzdHJpbmc7XG4gICAgY3VzdG9tVGhlbWVNZXNzYWdlOiBDdXN0b21UaGVtZU1lc3NhZ2U7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFRoZW1lQ2hvaWNlUGFuZWwgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQ8SVByb3BzLCBJU3RhdGU+IHtcbiAgICBwcml2YXRlIHRoZW1lVGltZXI6IG51bWJlcjtcblxuICAgIGNvbnN0cnVjdG9yKHByb3BzOiBJUHJvcHMpIHtcbiAgICAgICAgc3VwZXIocHJvcHMpO1xuXG4gICAgICAgIHRoaXMuc3RhdGUgPSB7XG4gICAgICAgICAgICAuLi5UaGVtZUNob2ljZVBhbmVsLmNhbGN1bGF0ZVRoZW1lU3RhdGUoKSxcbiAgICAgICAgICAgIGN1c3RvbVRoZW1lVXJsOiBcIlwiLFxuICAgICAgICAgICAgY3VzdG9tVGhlbWVNZXNzYWdlOiB7IGlzRXJyb3I6IGZhbHNlLCB0ZXh0OiBcIlwiIH0sXG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgcHVibGljIHN0YXRpYyBjYWxjdWxhdGVUaGVtZVN0YXRlKCk6IElUaGVtZVN0YXRlIHtcbiAgICAgICAgLy8gV2UgaGF2ZSB0byBtaXJyb3IgdGhlIGxvZ2ljIGZyb20gVGhlbWVXYXRjaGVyLmdldEVmZmVjdGl2ZVRoZW1lIHNvIHdlXG4gICAgICAgIC8vIHNob3cgdGhlIHJpZ2h0IHZhbHVlcyBmb3IgdGhpbmdzLlxuXG4gICAgICAgIGNvbnN0IHRoZW1lQ2hvaWNlOiBzdHJpbmcgPSBTZXR0aW5nc1N0b3JlLmdldFZhbHVlKFwidGhlbWVcIik7XG4gICAgICAgIGNvbnN0IHN5c3RlbVRoZW1lRXhwbGljaXQ6IGJvb2xlYW4gPSBTZXR0aW5nc1N0b3JlLmdldFZhbHVlQXQoXG4gICAgICAgICAgICBTZXR0aW5nTGV2ZWwuREVWSUNFLCBcInVzZV9zeXN0ZW1fdGhlbWVcIiwgbnVsbCwgZmFsc2UsIHRydWUpO1xuICAgICAgICBjb25zdCB0aGVtZUV4cGxpY2l0OiBzdHJpbmcgPSBTZXR0aW5nc1N0b3JlLmdldFZhbHVlQXQoXG4gICAgICAgICAgICBTZXR0aW5nTGV2ZWwuREVWSUNFLCBcInRoZW1lXCIsIG51bGwsIGZhbHNlLCB0cnVlKTtcblxuICAgICAgICAvLyBJZiB0aGUgdXNlciBoYXMgZW5hYmxlZCBzeXN0ZW0gdGhlbWUgbWF0Y2hpbmcsIHVzZSB0aGF0LlxuICAgICAgICBpZiAoc3lzdGVtVGhlbWVFeHBsaWNpdCkge1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICB0aGVtZTogdGhlbWVDaG9pY2UsXG4gICAgICAgICAgICAgICAgdXNlU3lzdGVtVGhlbWU6IHRydWUsXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gSWYgdGhlIHVzZXIgaGFzIHNldCBhIHRoZW1lIGV4cGxpY2l0bHksIHVzZSB0aGF0IChubyBzeXN0ZW0gdGhlbWUgbWF0Y2hpbmcpXG4gICAgICAgIGlmICh0aGVtZUV4cGxpY2l0KSB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHRoZW1lOiB0aGVtZUNob2ljZSxcbiAgICAgICAgICAgICAgICB1c2VTeXN0ZW1UaGVtZTogZmFsc2UsXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gT3RoZXJ3aXNlIGFzc3VtZSB0aGUgZGVmYXVsdHMgZm9yIHRoZSBzZXR0aW5nc1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgdGhlbWU6IHRoZW1lQ2hvaWNlLFxuICAgICAgICAgICAgdXNlU3lzdGVtVGhlbWU6IFNldHRpbmdzU3RvcmUuZ2V0VmFsdWVBdChTZXR0aW5nTGV2ZWwuREVWSUNFLCBcInVzZV9zeXN0ZW1fdGhlbWVcIiksXG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBvblRoZW1lQ2hhbmdlID0gKG5ld1RoZW1lOiBzdHJpbmcpOiB2b2lkID0+IHtcbiAgICAgICAgaWYgKHRoaXMuc3RhdGUudGhlbWUgPT09IG5ld1RoZW1lKSByZXR1cm47XG5cbiAgICAgICAgUG9zdGhvZ1RyYWNrZXJzLnRyYWNrSW50ZXJhY3Rpb24oXCJXZWJTZXR0aW5nc0FwcGVhcmFuY2VUYWJUaGVtZVNlbGVjdG9yXCIpO1xuXG4gICAgICAgIC8vIGRvaW5nIGdldFZhbHVlIGluIHRoZSAuY2F0Y2ggd2lsbCBzdGlsbCByZXR1cm4gdGhlIHZhbHVlIHdlIGZhaWxlZCB0byBzZXQsXG4gICAgICAgIC8vIHNvIHJlbWVtYmVyIHdoYXQgdGhlIHZhbHVlIHdhcyBiZWZvcmUgd2UgdHJpZWQgdG8gc2V0IGl0IHNvIHdlIGNhbiByZXZlcnRcbiAgICAgICAgY29uc3Qgb2xkVGhlbWU6IHN0cmluZyA9IFNldHRpbmdzU3RvcmUuZ2V0VmFsdWUoJ3RoZW1lJyk7XG4gICAgICAgIFNldHRpbmdzU3RvcmUuc2V0VmFsdWUoXCJ0aGVtZVwiLCBudWxsLCBTZXR0aW5nTGV2ZWwuREVWSUNFLCBuZXdUaGVtZSkuY2F0Y2goKCkgPT4ge1xuICAgICAgICAgICAgZGlzLmRpc3BhdGNoPFJlY2hlY2tUaGVtZVBheWxvYWQ+KHsgYWN0aW9uOiBBY3Rpb24uUmVjaGVja1RoZW1lIH0pO1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IHRoZW1lOiBvbGRUaGVtZSB9KTtcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoeyB0aGVtZTogbmV3VGhlbWUgfSk7XG4gICAgICAgIC8vIFRoZSBzZXR0aW5ncyB3YXRjaGVyIGRvZXNuJ3QgZmlyZSB1bnRpbCB0aGUgZWNobyBjb21lcyBiYWNrIGZyb20gdGhlXG4gICAgICAgIC8vIHNlcnZlciwgc28gdG8gbWFrZSB0aGUgdGhlbWUgY2hhbmdlIGltbWVkaWF0ZWx5IHdlIG5lZWQgdG8gbWFudWFsbHlcbiAgICAgICAgLy8gZG8gdGhlIGRpc3BhdGNoIG5vd1xuICAgICAgICAvLyBYWFg6IFRoZSBsb2NhbCBlY2hvZWQgdmFsdWUgYXBwZWFycyB0byBiZSB1bnJlbGlhYmxlLCBpbiBwYXJ0aWN1bGFyXG4gICAgICAgIC8vIHdoZW4gc2V0dGluZ3MgY3VzdG9tIHRoZW1lcyghKSBzbyBhZGRpbmcgZm9yY2VUaGVtZSB0byBvdmVycmlkZVxuICAgICAgICAvLyB0aGUgdmFsdWUgZnJvbSBzZXR0aW5ncy5cbiAgICAgICAgZGlzLmRpc3BhdGNoPFJlY2hlY2tUaGVtZVBheWxvYWQ+KHsgYWN0aW9uOiBBY3Rpb24uUmVjaGVja1RoZW1lLCBmb3JjZVRoZW1lOiBuZXdUaGVtZSB9KTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvblVzZVN5c3RlbVRoZW1lQ2hhbmdlZCA9IChjaGVja2VkOiBib29sZWFuKTogdm9pZCA9PiB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoeyB1c2VTeXN0ZW1UaGVtZTogY2hlY2tlZCB9KTtcbiAgICAgICAgU2V0dGluZ3NTdG9yZS5zZXRWYWx1ZShcInVzZV9zeXN0ZW1fdGhlbWVcIiwgbnVsbCwgU2V0dGluZ0xldmVsLkRFVklDRSwgY2hlY2tlZCk7XG4gICAgICAgIGRpcy5kaXNwYXRjaDxSZWNoZWNrVGhlbWVQYXlsb2FkPih7IGFjdGlvbjogQWN0aW9uLlJlY2hlY2tUaGVtZSB9KTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvbkFkZEN1c3RvbVRoZW1lID0gYXN5bmMgKCk6IFByb21pc2U8dm9pZD4gPT4ge1xuICAgICAgICBsZXQgY3VycmVudFRoZW1lczogc3RyaW5nW10gPSBTZXR0aW5nc1N0b3JlLmdldFZhbHVlKFwiY3VzdG9tX3RoZW1lc1wiKTtcbiAgICAgICAgaWYgKCFjdXJyZW50VGhlbWVzKSBjdXJyZW50VGhlbWVzID0gW107XG4gICAgICAgIGN1cnJlbnRUaGVtZXMgPSBjdXJyZW50VGhlbWVzLm1hcChjID0+IGMpOyAvLyBjaGVhcCBjbG9uZVxuXG4gICAgICAgIGlmICh0aGlzLnRoZW1lVGltZXIpIHtcbiAgICAgICAgICAgIGNsZWFyVGltZW91dCh0aGlzLnRoZW1lVGltZXIpO1xuICAgICAgICB9XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IHIgPSBhd2FpdCBmZXRjaCh0aGlzLnN0YXRlLmN1c3RvbVRoZW1lVXJsKTtcbiAgICAgICAgICAgIC8vIFhYWDogbmVlZCBzb21lIHNjaGVtYSBmb3IgdGhpc1xuICAgICAgICAgICAgY29uc3QgdGhlbWVJbmZvID0gYXdhaXQgci5qc29uKCk7XG4gICAgICAgICAgICBpZiAoIXRoZW1lSW5mbyB8fCB0eXBlb2YodGhlbWVJbmZvWyduYW1lJ10pICE9PSAnc3RyaW5nJyB8fCB0eXBlb2YodGhlbWVJbmZvWydjb2xvcnMnXSkgIT09ICdvYmplY3QnKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IGN1c3RvbVRoZW1lTWVzc2FnZTogeyB0ZXh0OiBfdChcIkludmFsaWQgdGhlbWUgc2NoZW1hLlwiKSwgaXNFcnJvcjogdHJ1ZSB9IH0pO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGN1cnJlbnRUaGVtZXMucHVzaCh0aGVtZUluZm8pO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICBsb2dnZXIuZXJyb3IoZSk7XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHsgY3VzdG9tVGhlbWVNZXNzYWdlOiB7IHRleHQ6IF90KFwiRXJyb3IgZG93bmxvYWRpbmcgdGhlbWUgaW5mb3JtYXRpb24uXCIpLCBpc0Vycm9yOiB0cnVlIH0gfSk7XG4gICAgICAgICAgICByZXR1cm47IC8vIERvbid0IGNvbnRpbnVlIG9uIGVycm9yXG4gICAgICAgIH1cblxuICAgICAgICBhd2FpdCBTZXR0aW5nc1N0b3JlLnNldFZhbHVlKFwiY3VzdG9tX3RoZW1lc1wiLCBudWxsLCBTZXR0aW5nTGV2ZWwuQUNDT1VOVCwgY3VycmVudFRoZW1lcyk7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoeyBjdXN0b21UaGVtZVVybDogXCJcIiwgY3VzdG9tVGhlbWVNZXNzYWdlOiB7IHRleHQ6IF90KFwiVGhlbWUgYWRkZWQhXCIpLCBpc0Vycm9yOiBmYWxzZSB9IH0pO1xuXG4gICAgICAgIHRoaXMudGhlbWVUaW1lciA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IGN1c3RvbVRoZW1lTWVzc2FnZTogeyB0ZXh0OiBcIlwiLCBpc0Vycm9yOiBmYWxzZSB9IH0pO1xuICAgICAgICB9LCAzMDAwKTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvbkN1c3RvbVRoZW1lQ2hhbmdlID0gKGU6IFJlYWN0LkNoYW5nZUV2ZW50PEhUTUxTZWxlY3RFbGVtZW50IHwgSFRNTElucHV0RWxlbWVudD4pOiB2b2lkID0+IHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IGN1c3RvbVRoZW1lVXJsOiBlLnRhcmdldC52YWx1ZSB9KTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSByZW5kZXJIaWdoQ29udHJhc3RDaGVja2JveCgpOiBSZWFjdC5SZWFjdEVsZW1lbnQ8SFRNTERpdkVsZW1lbnQ+IHtcbiAgICAgICAgaWYgKFxuICAgICAgICAgICAgIXRoaXMuc3RhdGUudXNlU3lzdGVtVGhlbWUgJiYgKFxuICAgICAgICAgICAgICAgIGZpbmRIaWdoQ29udHJhc3RUaGVtZSh0aGlzLnN0YXRlLnRoZW1lKSB8fFxuICAgICAgICAgICAgICAgIGlzSGlnaENvbnRyYXN0VGhlbWUodGhpcy5zdGF0ZS50aGVtZSlcbiAgICAgICAgICAgIClcbiAgICAgICAgKSB7XG4gICAgICAgICAgICByZXR1cm4gPGRpdj5cbiAgICAgICAgICAgICAgICA8U3R5bGVkQ2hlY2tib3hcbiAgICAgICAgICAgICAgICAgICAgY2hlY2tlZD17aXNIaWdoQ29udHJhc3RUaGVtZSh0aGlzLnN0YXRlLnRoZW1lKX1cbiAgICAgICAgICAgICAgICAgICAgb25DaGFuZ2U9eyhlKSA9PiB0aGlzLmhpZ2hDb250cmFzdFRoZW1lQ2hhbmdlZChlLnRhcmdldC5jaGVja2VkKX1cbiAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgIHsgX3QoXCJVc2UgaGlnaCBjb250cmFzdFwiKSB9XG4gICAgICAgICAgICAgICAgPC9TdHlsZWRDaGVja2JveD5cbiAgICAgICAgICAgIDwvZGl2PjtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgaGlnaENvbnRyYXN0VGhlbWVDaGFuZ2VkKGNoZWNrZWQ6IGJvb2xlYW4pOiB2b2lkIHtcbiAgICAgICAgbGV0IG5ld1RoZW1lOiBzdHJpbmc7XG4gICAgICAgIGlmIChjaGVja2VkKSB7XG4gICAgICAgICAgICBuZXdUaGVtZSA9IGZpbmRIaWdoQ29udHJhc3RUaGVtZSh0aGlzLnN0YXRlLnRoZW1lKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIG5ld1RoZW1lID0gZmluZE5vbkhpZ2hDb250cmFzdFRoZW1lKHRoaXMuc3RhdGUudGhlbWUpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChuZXdUaGVtZSkge1xuICAgICAgICAgICAgdGhpcy5vblRoZW1lQ2hhbmdlKG5ld1RoZW1lKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHB1YmxpYyByZW5kZXIoKTogUmVhY3QuUmVhY3RFbGVtZW50PEhUTUxEaXZFbGVtZW50PiB7XG4gICAgICAgIGNvbnN0IHRoZW1lV2F0Y2hlciA9IG5ldyBUaGVtZVdhdGNoZXIoKTtcbiAgICAgICAgbGV0IHN5c3RlbVRoZW1lU2VjdGlvbjogSlNYLkVsZW1lbnQ7XG4gICAgICAgIGlmICh0aGVtZVdhdGNoZXIuaXNTeXN0ZW1UaGVtZVN1cHBvcnRlZCgpKSB7XG4gICAgICAgICAgICBzeXN0ZW1UaGVtZVNlY3Rpb24gPSA8ZGl2PlxuICAgICAgICAgICAgICAgIDxTdHlsZWRDaGVja2JveFxuICAgICAgICAgICAgICAgICAgICBjaGVja2VkPXt0aGlzLnN0YXRlLnVzZVN5c3RlbVRoZW1lfVxuICAgICAgICAgICAgICAgICAgICBvbkNoYW5nZT17KGUpID0+IHRoaXMub25Vc2VTeXN0ZW1UaGVtZUNoYW5nZWQoZS50YXJnZXQuY2hlY2tlZCl9XG4gICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICB7IFNldHRpbmdzU3RvcmUuZ2V0RGlzcGxheU5hbWUoXCJ1c2Vfc3lzdGVtX3RoZW1lXCIpIH1cbiAgICAgICAgICAgICAgICA8L1N0eWxlZENoZWNrYm94PlxuICAgICAgICAgICAgPC9kaXY+O1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IGN1c3RvbVRoZW1lRm9ybTogSlNYLkVsZW1lbnQ7XG4gICAgICAgIGlmIChTZXR0aW5nc1N0b3JlLmdldFZhbHVlKFwiZmVhdHVyZV9jdXN0b21fdGhlbWVzXCIpKSB7XG4gICAgICAgICAgICBsZXQgbWVzc2FnZUVsZW1lbnQgPSBudWxsO1xuICAgICAgICAgICAgaWYgKHRoaXMuc3RhdGUuY3VzdG9tVGhlbWVNZXNzYWdlLnRleHQpIHtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5zdGF0ZS5jdXN0b21UaGVtZU1lc3NhZ2UuaXNFcnJvcikge1xuICAgICAgICAgICAgICAgICAgICBtZXNzYWdlRWxlbWVudCA9IDxkaXYgY2xhc3NOYW1lPSd0ZXh0LWVycm9yJz57IHRoaXMuc3RhdGUuY3VzdG9tVGhlbWVNZXNzYWdlLnRleHQgfTwvZGl2PjtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBtZXNzYWdlRWxlbWVudCA9IDxkaXYgY2xhc3NOYW1lPSd0ZXh0LXN1Y2Nlc3MnPnsgdGhpcy5zdGF0ZS5jdXN0b21UaGVtZU1lc3NhZ2UudGV4dCB9PC9kaXY+O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGN1c3RvbVRoZW1lRm9ybSA9IChcbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT0nbXhfU2V0dGluZ3NUYWJfc2VjdGlvbic+XG4gICAgICAgICAgICAgICAgICAgIDxmb3JtIG9uU3VibWl0PXt0aGlzLm9uQWRkQ3VzdG9tVGhlbWV9PlxuICAgICAgICAgICAgICAgICAgICAgICAgPEZpZWxkXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw9e190KFwiQ3VzdG9tIHRoZW1lIFVSTFwiKX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlPSd0ZXh0J1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkPSdteF9HZW5lcmFsVXNlclNldHRpbmdzVGFiX2N1c3RvbVRoZW1lSW5wdXQnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYXV0b0NvbXBsZXRlPVwib2ZmXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbkNoYW5nZT17dGhpcy5vbkN1c3RvbVRoZW1lQ2hhbmdlfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlPXt0aGlzLnN0YXRlLmN1c3RvbVRoZW1lVXJsfVxuICAgICAgICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxBY2Nlc3NpYmxlQnV0dG9uXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb25DbGljaz17dGhpcy5vbkFkZEN1c3RvbVRoZW1lfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU9XCJzdWJtaXRcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGtpbmQ9XCJwcmltYXJ5X3NtXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkaXNhYmxlZD17IXRoaXMuc3RhdGUuY3VzdG9tVGhlbWVVcmwudHJpbSgpfVxuICAgICAgICAgICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsgX3QoXCJBZGQgdGhlbWVcIikgfVxuICAgICAgICAgICAgICAgICAgICAgICAgPC9BY2Nlc3NpYmxlQnV0dG9uPlxuICAgICAgICAgICAgICAgICAgICAgICAgeyBtZXNzYWdlRWxlbWVudCB9XG4gICAgICAgICAgICAgICAgICAgIDwvZm9ybT5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBvcmRlcmVkVGhlbWVzID0gZ2V0T3JkZXJlZFRoZW1lcygpO1xuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9TZXR0aW5nc1RhYl9zZWN0aW9uIG14X1RoZW1lQ2hvaWNlUGFuZWxcIj5cbiAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJteF9TZXR0aW5nc1RhYl9zdWJoZWFkaW5nXCI+eyBfdChcIlRoZW1lXCIpIH08L3NwYW4+XG4gICAgICAgICAgICAgICAgeyBzeXN0ZW1UaGVtZVNlY3Rpb24gfVxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfVGhlbWVTZWxlY3RvcnNcIj5cbiAgICAgICAgICAgICAgICAgICAgPFN0eWxlZFJhZGlvR3JvdXBcbiAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU9XCJ0aGVtZVwiXG4gICAgICAgICAgICAgICAgICAgICAgICBkZWZpbml0aW9ucz17b3JkZXJlZFRoZW1lcy5tYXAodCA9PiAoe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiB0LmlkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsOiB0Lm5hbWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGlzYWJsZWQ6IHRoaXMuc3RhdGUudXNlU3lzdGVtVGhlbWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lOiBcIm14X1RoZW1lU2VsZWN0b3JfXCIgKyB0LmlkLFxuICAgICAgICAgICAgICAgICAgICAgICAgfSkpfVxuICAgICAgICAgICAgICAgICAgICAgICAgb25DaGFuZ2U9e3RoaXMub25UaGVtZUNoYW5nZX1cbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlPXt0aGlzLmFwcGFyZW50U2VsZWN0ZWRUaGVtZUlkKCl9XG4gICAgICAgICAgICAgICAgICAgICAgICBvdXRsaW5lZFxuICAgICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgIHsgdGhpcy5yZW5kZXJIaWdoQ29udHJhc3RDaGVja2JveCgpIH1cbiAgICAgICAgICAgICAgICB7IGN1c3RvbVRoZW1lRm9ybSB9XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgKTtcbiAgICB9XG5cbiAgICBhcHBhcmVudFNlbGVjdGVkVGhlbWVJZCgpIHtcbiAgICAgICAgaWYgKHRoaXMuc3RhdGUudXNlU3lzdGVtVGhlbWUpIHtcbiAgICAgICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3Qgbm9uSGlnaENvbnRyYXN0ID0gZmluZE5vbkhpZ2hDb250cmFzdFRoZW1lKHRoaXMuc3RhdGUudGhlbWUpO1xuICAgICAgICByZXR1cm4gbm9uSGlnaENvbnRyYXN0ID8gbm9uSGlnaENvbnRyYXN0IDogdGhpcy5zdGF0ZS50aGVtZTtcbiAgICB9XG59XG4iXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBZ0JBOztBQUNBOztBQUVBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUVBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOzs7Ozs7QUFvQmUsTUFBTUEsZ0JBQU4sU0FBK0JDLGNBQUEsQ0FBTUMsU0FBckMsQ0FBK0Q7RUFHMUVDLFdBQVcsQ0FBQ0MsS0FB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