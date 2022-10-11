"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.LabsSettingToggle = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireDefault(require("react"));

var _lodash = require("lodash");

var _languageHandler = require("../../../../../languageHandler");

var _SettingsStore = _interopRequireDefault(require("../../../../../settings/SettingsStore"));

var _LabelledToggleSwitch = _interopRequireDefault(require("../../../elements/LabelledToggleSwitch"));

var _SettingLevel = require("../../../../../settings/SettingLevel");

var _SdkConfig = _interopRequireDefault(require("../../../../../SdkConfig"));

var _BetaCard = _interopRequireDefault(require("../../../beta/BetaCard"));

var _SettingsFlag = _interopRequireDefault(require("../../../elements/SettingsFlag"));

var _MatrixClientPeg = require("../../../../../MatrixClientPeg");

var _Settings = require("../../../../../settings/Settings");

var _maps = require("../../../../../utils/maps");

/*
Copyright 2019 New Vector Ltd

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
class LabsSettingToggle extends _react.default.Component {
  constructor() {
    super(...arguments);
    (0, _defineProperty2.default)(this, "onChange", async checked => {
      await _SettingsStore.default.setValue(this.props.featureId, null, _SettingLevel.SettingLevel.DEVICE, checked);
      this.forceUpdate();
    });
  }

  render() {
    const label = _SettingsStore.default.getDisplayName(this.props.featureId);

    const value = _SettingsStore.default.getValue(this.props.featureId);

    const canChange = _SettingsStore.default.canSetValue(this.props.featureId, null, _SettingLevel.SettingLevel.DEVICE);

    return /*#__PURE__*/_react.default.createElement(_LabelledToggleSwitch.default, {
      value: value,
      label: label,
      onChange: this.onChange,
      disabled: !canChange
    });
  }

}

exports.LabsSettingToggle = LabsSettingToggle;

class LabsUserSettingsTab extends _react.default.Component {
  constructor(props) {
    super(props);

    const cli = _MatrixClientPeg.MatrixClientPeg.get();

    cli.doesServerSupportUnstableFeature("org.matrix.msc3030").then(showJumpToDate => {
      this.setState({
        showJumpToDate
      });
    });
    cli.doesServerSupportUnstableFeature("org.matrix.msc3827.stable").then(showExploringPublicSpaces => {
      this.setState({
        showExploringPublicSpaces
      });
    });
    this.state = {
      showJumpToDate: false,
      showExploringPublicSpaces: false
    };
  }

  render() {
    const features = _SettingsStore.default.getFeatureSettingNames();

    const [labs, betas] = features.reduce((arr, f) => {
      arr[_SettingsStore.default.getBetaInfo(f) ? 1 : 0].push(f);
      return arr;
    }, [[], []]);
    let betaSection;

    if (betas.length) {
      betaSection = /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_SettingsTab_section"
      }, betas.map(f => /*#__PURE__*/_react.default.createElement(_BetaCard.default, {
        key: f,
        featureId: f
      })));
    }

    let labsSections;

    if (_SdkConfig.default.get("show_labs_settings")) {
      const groups = new _maps.EnhancedMap();
      labs.forEach(f => {
        groups.getOrCreate(_SettingsStore.default.getLabGroup(f), []).push( /*#__PURE__*/_react.default.createElement(LabsSettingToggle, {
          featureId: f,
          key: f
        }));
      });
      groups.getOrCreate(_Settings.LabGroup.Experimental, []).push( /*#__PURE__*/_react.default.createElement(_SettingsFlag.default, {
        key: "lowBandwidth",
        name: "lowBandwidth",
        level: _SettingLevel.SettingLevel.DEVICE
      }));
      groups.getOrCreate(_Settings.LabGroup.Analytics, []).push( /*#__PURE__*/_react.default.createElement(_SettingsFlag.default, {
        key: "automaticErrorReporting",
        name: "automaticErrorReporting",
        level: _SettingLevel.SettingLevel.DEVICE
      }), /*#__PURE__*/_react.default.createElement(_SettingsFlag.default, {
        key: "automaticDecryptionErrorReporting",
        name: "automaticDecryptionErrorReporting",
        level: _SettingLevel.SettingLevel.DEVICE
      }));

      if (this.state.showJumpToDate) {
        groups.getOrCreate(_Settings.LabGroup.Messaging, []).push( /*#__PURE__*/_react.default.createElement(_SettingsFlag.default, {
          key: "feature_jump_to_date",
          name: "feature_jump_to_date",
          level: _SettingLevel.SettingLevel.DEVICE
        }));
      }

      if (this.state.showExploringPublicSpaces) {
        groups.getOrCreate(_Settings.LabGroup.Spaces, []).push( /*#__PURE__*/_react.default.createElement(_SettingsFlag.default, {
          key: "feature_exploring_public_spaces",
          name: "feature_exploring_public_spaces",
          level: _SettingLevel.SettingLevel.DEVICE
        }));
      }

      labsSections = /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, (0, _lodash.sortBy)(Array.from(groups.entries()), "0").map(_ref => {
        let [group, flags] = _ref;
        return /*#__PURE__*/_react.default.createElement("div", {
          className: "mx_SettingsTab_section",
          key: group
        }, /*#__PURE__*/_react.default.createElement("span", {
          className: "mx_SettingsTab_subheading"
        }, (0, _languageHandler._t)(_Settings.labGroupNames[group])), flags);
      }));
    }

    return /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_SettingsTab mx_LabsUserSettingsTab"
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_SettingsTab_heading"
    }, (0, _languageHandler._t)("Labs")), /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_SettingsTab_subsectionText"
    }, (0, _languageHandler._t)('Feeling experimental? Labs are the best way to get things early, ' + 'test out new features and help shape them before they actually launch. ' + '<a>Learn more</a>.', {}, {
      'a': sub => {
        return /*#__PURE__*/_react.default.createElement("a", {
          href: "https://github.com/vector-im/element-web/blob/develop/docs/labs.md",
          rel: "noreferrer noopener",
          target: "_blank"
        }, sub);
      }
    })), betaSection, labsSections);
  }

}

exports.default = LabsUserSettingsTab;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJMYWJzU2V0dGluZ1RvZ2dsZSIsIlJlYWN0IiwiQ29tcG9uZW50IiwiY2hlY2tlZCIsIlNldHRpbmdzU3RvcmUiLCJzZXRWYWx1ZSIsInByb3BzIiwiZmVhdHVyZUlkIiwiU2V0dGluZ0xldmVsIiwiREVWSUNFIiwiZm9yY2VVcGRhdGUiLCJyZW5kZXIiLCJsYWJlbCIsImdldERpc3BsYXlOYW1lIiwidmFsdWUiLCJnZXRWYWx1ZSIsImNhbkNoYW5nZSIsImNhblNldFZhbHVlIiwib25DaGFuZ2UiLCJMYWJzVXNlclNldHRpbmdzVGFiIiwiY29uc3RydWN0b3IiLCJjbGkiLCJNYXRyaXhDbGllbnRQZWciLCJnZXQiLCJkb2VzU2VydmVyU3VwcG9ydFVuc3RhYmxlRmVhdHVyZSIsInRoZW4iLCJzaG93SnVtcFRvRGF0ZSIsInNldFN0YXRlIiwic2hvd0V4cGxvcmluZ1B1YmxpY1NwYWNlcyIsInN0YXRlIiwiZmVhdHVyZXMiLCJnZXRGZWF0dXJlU2V0dGluZ05hbWVzIiwibGFicyIsImJldGFzIiwicmVkdWNlIiwiYXJyIiwiZiIsImdldEJldGFJbmZvIiwicHVzaCIsImJldGFTZWN0aW9uIiwibGVuZ3RoIiwibWFwIiwibGFic1NlY3Rpb25zIiwiU2RrQ29uZmlnIiwiZ3JvdXBzIiwiRW5oYW5jZWRNYXAiLCJmb3JFYWNoIiwiZ2V0T3JDcmVhdGUiLCJnZXRMYWJHcm91cCIsIkxhYkdyb3VwIiwiRXhwZXJpbWVudGFsIiwiQW5hbHl0aWNzIiwiTWVzc2FnaW5nIiwiU3BhY2VzIiwic29ydEJ5IiwiQXJyYXkiLCJmcm9tIiwiZW50cmllcyIsImdyb3VwIiwiZmxhZ3MiLCJfdCIsImxhYkdyb3VwTmFtZXMiLCJzdWIiXSwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvY29tcG9uZW50cy92aWV3cy9zZXR0aW5ncy90YWJzL3VzZXIvTGFic1VzZXJTZXR0aW5nc1RhYi50c3giXSwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAyMDE5IE5ldyBWZWN0b3IgTHRkXG5cbkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG55b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cblxuaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0JztcbmltcG9ydCB7IHNvcnRCeSB9IGZyb20gXCJsb2Rhc2hcIjtcblxuaW1wb3J0IHsgX3QgfSBmcm9tIFwiLi4vLi4vLi4vLi4vLi4vbGFuZ3VhZ2VIYW5kbGVyXCI7XG5pbXBvcnQgU2V0dGluZ3NTdG9yZSBmcm9tIFwiLi4vLi4vLi4vLi4vLi4vc2V0dGluZ3MvU2V0dGluZ3NTdG9yZVwiO1xuaW1wb3J0IExhYmVsbGVkVG9nZ2xlU3dpdGNoIGZyb20gXCIuLi8uLi8uLi9lbGVtZW50cy9MYWJlbGxlZFRvZ2dsZVN3aXRjaFwiO1xuaW1wb3J0IHsgU2V0dGluZ0xldmVsIH0gZnJvbSBcIi4uLy4uLy4uLy4uLy4uL3NldHRpbmdzL1NldHRpbmdMZXZlbFwiO1xuaW1wb3J0IFNka0NvbmZpZyBmcm9tIFwiLi4vLi4vLi4vLi4vLi4vU2RrQ29uZmlnXCI7XG5pbXBvcnQgQmV0YUNhcmQgZnJvbSBcIi4uLy4uLy4uL2JldGEvQmV0YUNhcmRcIjtcbmltcG9ydCBTZXR0aW5nc0ZsYWcgZnJvbSAnLi4vLi4vLi4vZWxlbWVudHMvU2V0dGluZ3NGbGFnJztcbmltcG9ydCB7IE1hdHJpeENsaWVudFBlZyB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL01hdHJpeENsaWVudFBlZyc7XG5pbXBvcnQgeyBMYWJHcm91cCwgbGFiR3JvdXBOYW1lcyB9IGZyb20gXCIuLi8uLi8uLi8uLi8uLi9zZXR0aW5ncy9TZXR0aW5nc1wiO1xuaW1wb3J0IHsgRW5oYW5jZWRNYXAgfSBmcm9tIFwiLi4vLi4vLi4vLi4vLi4vdXRpbHMvbWFwc1wiO1xuXG5pbnRlcmZhY2UgSUxhYnNTZXR0aW5nVG9nZ2xlUHJvcHMge1xuICAgIGZlYXR1cmVJZDogc3RyaW5nO1xufVxuXG5leHBvcnQgY2xhc3MgTGFic1NldHRpbmdUb2dnbGUgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQ8SUxhYnNTZXR0aW5nVG9nZ2xlUHJvcHM+IHtcbiAgICBwcml2YXRlIG9uQ2hhbmdlID0gYXN5bmMgKGNoZWNrZWQ6IGJvb2xlYW4pOiBQcm9taXNlPHZvaWQ+ID0+IHtcbiAgICAgICAgYXdhaXQgU2V0dGluZ3NTdG9yZS5zZXRWYWx1ZSh0aGlzLnByb3BzLmZlYXR1cmVJZCwgbnVsbCwgU2V0dGluZ0xldmVsLkRFVklDRSwgY2hlY2tlZCk7XG4gICAgICAgIHRoaXMuZm9yY2VVcGRhdGUoKTtcbiAgICB9O1xuXG4gICAgcHVibGljIHJlbmRlcigpOiBKU1guRWxlbWVudCB7XG4gICAgICAgIGNvbnN0IGxhYmVsID0gU2V0dGluZ3NTdG9yZS5nZXREaXNwbGF5TmFtZSh0aGlzLnByb3BzLmZlYXR1cmVJZCk7XG4gICAgICAgIGNvbnN0IHZhbHVlID0gU2V0dGluZ3NTdG9yZS5nZXRWYWx1ZSh0aGlzLnByb3BzLmZlYXR1cmVJZCk7XG4gICAgICAgIGNvbnN0IGNhbkNoYW5nZSA9IFNldHRpbmdzU3RvcmUuY2FuU2V0VmFsdWUodGhpcy5wcm9wcy5mZWF0dXJlSWQsIG51bGwsIFNldHRpbmdMZXZlbC5ERVZJQ0UpO1xuICAgICAgICByZXR1cm4gPExhYmVsbGVkVG9nZ2xlU3dpdGNoIHZhbHVlPXt2YWx1ZX0gbGFiZWw9e2xhYmVsfSBvbkNoYW5nZT17dGhpcy5vbkNoYW5nZX0gZGlzYWJsZWQ9eyFjYW5DaGFuZ2V9IC8+O1xuICAgIH1cbn1cblxuaW50ZXJmYWNlIElTdGF0ZSB7XG4gICAgc2hvd0p1bXBUb0RhdGU6IGJvb2xlYW47XG4gICAgc2hvd0V4cGxvcmluZ1B1YmxpY1NwYWNlczogYm9vbGVhbjtcbn1cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTGFic1VzZXJTZXR0aW5nc1RhYiBleHRlbmRzIFJlYWN0LkNvbXBvbmVudDx7fSwgSVN0YXRlPiB7XG4gICAgY29uc3RydWN0b3IocHJvcHM6IHt9KSB7XG4gICAgICAgIHN1cGVyKHByb3BzKTtcblxuICAgICAgICBjb25zdCBjbGkgPSBNYXRyaXhDbGllbnRQZWcuZ2V0KCk7XG5cbiAgICAgICAgY2xpLmRvZXNTZXJ2ZXJTdXBwb3J0VW5zdGFibGVGZWF0dXJlKFwib3JnLm1hdHJpeC5tc2MzMDMwXCIpLnRoZW4oKHNob3dKdW1wVG9EYXRlKSA9PiB7XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHsgc2hvd0p1bXBUb0RhdGUgfSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGNsaS5kb2VzU2VydmVyU3VwcG9ydFVuc3RhYmxlRmVhdHVyZShcIm9yZy5tYXRyaXgubXNjMzgyNy5zdGFibGVcIikudGhlbigoc2hvd0V4cGxvcmluZ1B1YmxpY1NwYWNlcykgPT4ge1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IHNob3dFeHBsb3JpbmdQdWJsaWNTcGFjZXMgfSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHRoaXMuc3RhdGUgPSB7XG4gICAgICAgICAgICBzaG93SnVtcFRvRGF0ZTogZmFsc2UsXG4gICAgICAgICAgICBzaG93RXhwbG9yaW5nUHVibGljU3BhY2VzOiBmYWxzZSxcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBwdWJsaWMgcmVuZGVyKCk6IEpTWC5FbGVtZW50IHtcbiAgICAgICAgY29uc3QgZmVhdHVyZXMgPSBTZXR0aW5nc1N0b3JlLmdldEZlYXR1cmVTZXR0aW5nTmFtZXMoKTtcbiAgICAgICAgY29uc3QgW2xhYnMsIGJldGFzXSA9IGZlYXR1cmVzLnJlZHVjZSgoYXJyLCBmKSA9PiB7XG4gICAgICAgICAgICBhcnJbU2V0dGluZ3NTdG9yZS5nZXRCZXRhSW5mbyhmKSA/IDEgOiAwXS5wdXNoKGYpO1xuICAgICAgICAgICAgcmV0dXJuIGFycjtcbiAgICAgICAgfSwgW1tdLCBbXV0gYXMgW3N0cmluZ1tdLCBzdHJpbmdbXV0pO1xuXG4gICAgICAgIGxldCBiZXRhU2VjdGlvbjtcbiAgICAgICAgaWYgKGJldGFzLmxlbmd0aCkge1xuICAgICAgICAgICAgYmV0YVNlY3Rpb24gPSA8ZGl2IGNsYXNzTmFtZT1cIm14X1NldHRpbmdzVGFiX3NlY3Rpb25cIj5cbiAgICAgICAgICAgICAgICB7IGJldGFzLm1hcChmID0+IDxCZXRhQ2FyZCBrZXk9e2Z9IGZlYXR1cmVJZD17Zn0gLz4pIH1cbiAgICAgICAgICAgIDwvZGl2PjtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBsYWJzU2VjdGlvbnM7XG4gICAgICAgIGlmIChTZGtDb25maWcuZ2V0KFwic2hvd19sYWJzX3NldHRpbmdzXCIpKSB7XG4gICAgICAgICAgICBjb25zdCBncm91cHMgPSBuZXcgRW5oYW5jZWRNYXA8TGFiR3JvdXAsIEpTWC5FbGVtZW50W10+KCk7XG4gICAgICAgICAgICBsYWJzLmZvckVhY2goZiA9PiB7XG4gICAgICAgICAgICAgICAgZ3JvdXBzLmdldE9yQ3JlYXRlKFNldHRpbmdzU3RvcmUuZ2V0TGFiR3JvdXAoZiksIFtdKS5wdXNoKFxuICAgICAgICAgICAgICAgICAgICA8TGFic1NldHRpbmdUb2dnbGUgZmVhdHVyZUlkPXtmfSBrZXk9e2Z9IC8+LFxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgZ3JvdXBzLmdldE9yQ3JlYXRlKExhYkdyb3VwLkV4cGVyaW1lbnRhbCwgW10pLnB1c2goXG4gICAgICAgICAgICAgICAgPFNldHRpbmdzRmxhZ1xuICAgICAgICAgICAgICAgICAgICBrZXk9XCJsb3dCYW5kd2lkdGhcIlxuICAgICAgICAgICAgICAgICAgICBuYW1lPVwibG93QmFuZHdpZHRoXCJcbiAgICAgICAgICAgICAgICAgICAgbGV2ZWw9e1NldHRpbmdMZXZlbC5ERVZJQ0V9XG4gICAgICAgICAgICAgICAgLz4sXG4gICAgICAgICAgICApO1xuXG4gICAgICAgICAgICBncm91cHMuZ2V0T3JDcmVhdGUoTGFiR3JvdXAuQW5hbHl0aWNzLCBbXSkucHVzaChcbiAgICAgICAgICAgICAgICA8U2V0dGluZ3NGbGFnXG4gICAgICAgICAgICAgICAgICAgIGtleT1cImF1dG9tYXRpY0Vycm9yUmVwb3J0aW5nXCJcbiAgICAgICAgICAgICAgICAgICAgbmFtZT1cImF1dG9tYXRpY0Vycm9yUmVwb3J0aW5nXCJcbiAgICAgICAgICAgICAgICAgICAgbGV2ZWw9e1NldHRpbmdMZXZlbC5ERVZJQ0V9XG4gICAgICAgICAgICAgICAgLz4sXG4gICAgICAgICAgICAgICAgPFNldHRpbmdzRmxhZ1xuICAgICAgICAgICAgICAgICAgICBrZXk9XCJhdXRvbWF0aWNEZWNyeXB0aW9uRXJyb3JSZXBvcnRpbmdcIlxuICAgICAgICAgICAgICAgICAgICBuYW1lPVwiYXV0b21hdGljRGVjcnlwdGlvbkVycm9yUmVwb3J0aW5nXCJcbiAgICAgICAgICAgICAgICAgICAgbGV2ZWw9e1NldHRpbmdMZXZlbC5ERVZJQ0V9XG4gICAgICAgICAgICAgICAgLz4sXG4gICAgICAgICAgICApO1xuXG4gICAgICAgICAgICBpZiAodGhpcy5zdGF0ZS5zaG93SnVtcFRvRGF0ZSkge1xuICAgICAgICAgICAgICAgIGdyb3Vwcy5nZXRPckNyZWF0ZShMYWJHcm91cC5NZXNzYWdpbmcsIFtdKS5wdXNoKFxuICAgICAgICAgICAgICAgICAgICA8U2V0dGluZ3NGbGFnXG4gICAgICAgICAgICAgICAgICAgICAgICBrZXk9XCJmZWF0dXJlX2p1bXBfdG9fZGF0ZVwiXG4gICAgICAgICAgICAgICAgICAgICAgICBuYW1lPVwiZmVhdHVyZV9qdW1wX3RvX2RhdGVcIlxuICAgICAgICAgICAgICAgICAgICAgICAgbGV2ZWw9e1NldHRpbmdMZXZlbC5ERVZJQ0V9XG4gICAgICAgICAgICAgICAgICAgIC8+LFxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICh0aGlzLnN0YXRlLnNob3dFeHBsb3JpbmdQdWJsaWNTcGFjZXMpIHtcbiAgICAgICAgICAgICAgICBncm91cHMuZ2V0T3JDcmVhdGUoTGFiR3JvdXAuU3BhY2VzLCBbXSkucHVzaChcbiAgICAgICAgICAgICAgICAgICAgPFNldHRpbmdzRmxhZ1xuICAgICAgICAgICAgICAgICAgICAgICAga2V5PVwiZmVhdHVyZV9leHBsb3JpbmdfcHVibGljX3NwYWNlc1wiXG4gICAgICAgICAgICAgICAgICAgICAgICBuYW1lPVwiZmVhdHVyZV9leHBsb3JpbmdfcHVibGljX3NwYWNlc1wiXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXZlbD17U2V0dGluZ0xldmVsLkRFVklDRX1cbiAgICAgICAgICAgICAgICAgICAgLz4sXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgbGFic1NlY3Rpb25zID0gPD5cbiAgICAgICAgICAgICAgICB7IHNvcnRCeShBcnJheS5mcm9tKGdyb3Vwcy5lbnRyaWVzKCkpLCBcIjBcIikubWFwKChbZ3JvdXAsIGZsYWdzXSkgPT4gKFxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X1NldHRpbmdzVGFiX3NlY3Rpb25cIiBrZXk9e2dyb3VwfT5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIm14X1NldHRpbmdzVGFiX3N1YmhlYWRpbmdcIj57IF90KGxhYkdyb3VwTmFtZXNbZ3JvdXBdKSB9PC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICAgICAgeyBmbGFncyB9XG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICkpIH1cbiAgICAgICAgICAgIDwvPjtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X1NldHRpbmdzVGFiIG14X0xhYnNVc2VyU2V0dGluZ3NUYWJcIj5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X1NldHRpbmdzVGFiX2hlYWRpbmdcIj57IF90KFwiTGFic1wiKSB9PC9kaXY+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9J214X1NldHRpbmdzVGFiX3N1YnNlY3Rpb25UZXh0Jz5cbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgX3QoJ0ZlZWxpbmcgZXhwZXJpbWVudGFsPyBMYWJzIGFyZSB0aGUgYmVzdCB3YXkgdG8gZ2V0IHRoaW5ncyBlYXJseSwgJyArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJ3Rlc3Qgb3V0IG5ldyBmZWF0dXJlcyBhbmQgaGVscCBzaGFwZSB0aGVtIGJlZm9yZSB0aGV5IGFjdHVhbGx5IGxhdW5jaC4gJyArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJzxhPkxlYXJuIG1vcmU8L2E+LicsIHt9LCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2EnOiAoc3ViKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiA8YVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaHJlZj1cImh0dHBzOi8vZ2l0aHViLmNvbS92ZWN0b3ItaW0vZWxlbWVudC13ZWIvYmxvYi9kZXZlbG9wL2RvY3MvbGFicy5tZFwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWw9J25vcmVmZXJyZXIgbm9vcGVuZXInXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0YXJnZXQ9J19ibGFuaydcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPnsgc3ViIH08L2E+O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgeyBiZXRhU2VjdGlvbiB9XG4gICAgICAgICAgICAgICAgeyBsYWJzU2VjdGlvbnMgfVxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICk7XG4gICAgfVxufVxuIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQWdCQTs7QUFDQTs7QUFFQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUE1QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBb0JPLE1BQU1BLGlCQUFOLFNBQWdDQyxjQUFBLENBQU1DLFNBQXRDLENBQXlFO0VBQUE7SUFBQTtJQUFBLGdEQUN6RCxNQUFPQyxPQUFQLElBQTJDO01BQzFELE1BQU1DLHNCQUFBLENBQWNDLFFBQWQsQ0FBdUIsS0FBS0MsS0FBTCxDQUFXQyxTQUFsQyxFQUE2QyxJQUE3QyxFQUFtREMsMEJBQUEsQ0FBYUMsTUFBaEUsRUFBd0VOLE9BQXhFLENBQU47TUFDQSxLQUFLTyxXQUFMO0lBQ0gsQ0FKMkU7RUFBQTs7RUFNckVDLE1BQU0sR0FBZ0I7SUFDekIs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