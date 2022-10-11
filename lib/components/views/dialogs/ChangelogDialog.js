"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _react = _interopRequireDefault(require("react"));

var _browserRequest = _interopRequireDefault(require("browser-request"));

var _languageHandler = require("../../../languageHandler");

var _QuestionDialog = _interopRequireDefault(require("./QuestionDialog"));

var _Spinner = _interopRequireDefault(require("../elements/Spinner"));

/*
 Copyright 2016 Aviral Dasgupta
Copyright 2019 Michael Telatynski <7t3chguy@gmail.com>

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
const REPOS = ['vector-im/element-web', 'matrix-org/matrix-react-sdk', 'matrix-org/matrix-js-sdk'];

class ChangelogDialog extends _react.default.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    const version = this.props.newVersion.split('-');
    const version2 = this.props.version.split('-');
    if (version == null || version2 == null) return; // parse versions of form: [vectorversion]-react-[react-sdk-version]-js-[js-sdk-version]

    for (let i = 0; i < REPOS.length; i++) {
      const oldVersion = version2[2 * i];
      const newVersion = version[2 * i];
      const url = `https://riot.im/github/repos/${REPOS[i]}/compare/${oldVersion}...${newVersion}`;
      (0, _browserRequest.default)(url, (err, response, body) => {
        if (response.statusCode < 200 || response.statusCode >= 300) {
          this.setState({
            [REPOS[i]]: response.statusText
          });
          return;
        }

        this.setState({
          [REPOS[i]]: JSON.parse(body).commits
        });
      });
    }
  }

  elementsForCommit(commit) {
    return /*#__PURE__*/_react.default.createElement("li", {
      key: commit.sha,
      className: "mx_ChangelogDialog_li"
    }, /*#__PURE__*/_react.default.createElement("a", {
      href: commit.html_url,
      target: "_blank",
      rel: "noreferrer noopener"
    }, commit.commit.message.split('\n')[0]));
  }

  render() {
    const logs = REPOS.map(repo => {
      let content;

      if (this.state[repo] == null) {
        content = /*#__PURE__*/_react.default.createElement(_Spinner.default, {
          key: repo
        });
      } else if (typeof this.state[repo] === "string") {
        content = (0, _languageHandler._t)("Unable to load commit detail: %(msg)s", {
          msg: this.state[repo]
        });
      } else {
        content = this.state[repo].map(this.elementsForCommit);
      }

      return /*#__PURE__*/_react.default.createElement("div", {
        key: repo
      }, /*#__PURE__*/_react.default.createElement("h2", null, repo), /*#__PURE__*/_react.default.createElement("ul", null, content));
    });

    const content = /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_ChangelogDialog_content"
    }, this.props.version == null || this.props.newVersion == null ? /*#__PURE__*/_react.default.createElement("h2", null, (0, _languageHandler._t)("Unavailable")) : logs);

    return /*#__PURE__*/_react.default.createElement(_QuestionDialog.default, {
      title: (0, _languageHandler._t)("Changelog"),
      description: content,
      button: (0, _languageHandler._t)("Update"),
      onFinished: this.props.onFinished
    });
  }

}

exports.default = ChangelogDialog;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJSRVBPUyIsIkNoYW5nZWxvZ0RpYWxvZyIsIlJlYWN0IiwiQ29tcG9uZW50IiwiY29uc3RydWN0b3IiLCJwcm9wcyIsInN0YXRlIiwiY29tcG9uZW50RGlkTW91bnQiLCJ2ZXJzaW9uIiwibmV3VmVyc2lvbiIsInNwbGl0IiwidmVyc2lvbjIiLCJpIiwibGVuZ3RoIiwib2xkVmVyc2lvbiIsInVybCIsInJlcXVlc3QiLCJlcnIiLCJyZXNwb25zZSIsImJvZHkiLCJzdGF0dXNDb2RlIiwic2V0U3RhdGUiLCJzdGF0dXNUZXh0IiwiSlNPTiIsInBhcnNlIiwiY29tbWl0cyIsImVsZW1lbnRzRm9yQ29tbWl0IiwiY29tbWl0Iiwic2hhIiwiaHRtbF91cmwiLCJtZXNzYWdlIiwicmVuZGVyIiwibG9ncyIsIm1hcCIsInJlcG8iLCJjb250ZW50IiwiX3QiLCJtc2ciLCJvbkZpbmlzaGVkIl0sInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL2NvbXBvbmVudHMvdmlld3MvZGlhbG9ncy9DaGFuZ2Vsb2dEaWFsb2cudHN4Il0sInNvdXJjZXNDb250ZW50IjpbIi8qXG4gQ29weXJpZ2h0IDIwMTYgQXZpcmFsIERhc2d1cHRhXG5Db3B5cmlnaHQgMjAxOSBNaWNoYWVsIFRlbGF0eW5za2kgPDd0M2NoZ3V5QGdtYWlsLmNvbT5cblxuIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4geW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cbiBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4gZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbiBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiAqL1xuXG5pbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnO1xuaW1wb3J0IHJlcXVlc3QgZnJvbSAnYnJvd3Nlci1yZXF1ZXN0JztcblxuaW1wb3J0IHsgX3QgfSBmcm9tICcuLi8uLi8uLi9sYW5ndWFnZUhhbmRsZXInO1xuaW1wb3J0IFF1ZXN0aW9uRGlhbG9nIGZyb20gXCIuL1F1ZXN0aW9uRGlhbG9nXCI7XG5pbXBvcnQgU3Bpbm5lciBmcm9tIFwiLi4vZWxlbWVudHMvU3Bpbm5lclwiO1xuXG5pbnRlcmZhY2UgSVByb3BzIHtcbiAgICBuZXdWZXJzaW9uOiBzdHJpbmc7XG4gICAgdmVyc2lvbjogc3RyaW5nO1xuICAgIG9uRmluaXNoZWQ6IChzdWNjZXNzOiBib29sZWFuKSA9PiB2b2lkO1xufVxuXG5jb25zdCBSRVBPUyA9IFsndmVjdG9yLWltL2VsZW1lbnQtd2ViJywgJ21hdHJpeC1vcmcvbWF0cml4LXJlYWN0LXNkaycsICdtYXRyaXgtb3JnL21hdHJpeC1qcy1zZGsnXTtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQ2hhbmdlbG9nRGlhbG9nIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50PElQcm9wcz4ge1xuICAgIGNvbnN0cnVjdG9yKHByb3BzKSB7XG4gICAgICAgIHN1cGVyKHByb3BzKTtcblxuICAgICAgICB0aGlzLnN0YXRlID0ge307XG4gICAgfVxuXG4gICAgcHVibGljIGNvbXBvbmVudERpZE1vdW50KCkge1xuICAgICAgICBjb25zdCB2ZXJzaW9uID0gdGhpcy5wcm9wcy5uZXdWZXJzaW9uLnNwbGl0KCctJyk7XG4gICAgICAgIGNvbnN0IHZlcnNpb24yID0gdGhpcy5wcm9wcy52ZXJzaW9uLnNwbGl0KCctJyk7XG4gICAgICAgIGlmICh2ZXJzaW9uID09IG51bGwgfHwgdmVyc2lvbjIgPT0gbnVsbCkgcmV0dXJuO1xuICAgICAgICAvLyBwYXJzZSB2ZXJzaW9ucyBvZiBmb3JtOiBbdmVjdG9ydmVyc2lvbl0tcmVhY3QtW3JlYWN0LXNkay12ZXJzaW9uXS1qcy1banMtc2RrLXZlcnNpb25dXG4gICAgICAgIGZvciAobGV0IGk9MDsgaTxSRVBPUy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgY29uc3Qgb2xkVmVyc2lvbiA9IHZlcnNpb24yWzIqaV07XG4gICAgICAgICAgICBjb25zdCBuZXdWZXJzaW9uID0gdmVyc2lvblsyKmldO1xuICAgICAgICAgICAgY29uc3QgdXJsID0gYGh0dHBzOi8vcmlvdC5pbS9naXRodWIvcmVwb3MvJHtSRVBPU1tpXX0vY29tcGFyZS8ke29sZFZlcnNpb259Li4uJHtuZXdWZXJzaW9ufWA7XG4gICAgICAgICAgICByZXF1ZXN0KHVybCwgKGVyciwgcmVzcG9uc2UsIGJvZHkpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAocmVzcG9uc2Uuc3RhdHVzQ29kZSA8IDIwMCB8fCByZXNwb25zZS5zdGF0dXNDb2RlID49IDMwMCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnNldFN0YXRlKHsgW1JFUE9TW2ldXTogcmVzcG9uc2Uuc3RhdHVzVGV4dCB9KTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB0aGlzLnNldFN0YXRlKHsgW1JFUE9TW2ldXTogSlNPTi5wYXJzZShib2R5KS5jb21taXRzIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIGVsZW1lbnRzRm9yQ29tbWl0KGNvbW1pdCk6IEpTWC5FbGVtZW50IHtcbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDxsaSBrZXk9e2NvbW1pdC5zaGF9IGNsYXNzTmFtZT1cIm14X0NoYW5nZWxvZ0RpYWxvZ19saVwiPlxuICAgICAgICAgICAgICAgIDxhIGhyZWY9e2NvbW1pdC5odG1sX3VybH0gdGFyZ2V0PVwiX2JsYW5rXCIgcmVsPVwibm9yZWZlcnJlciBub29wZW5lclwiPlxuICAgICAgICAgICAgICAgICAgICB7IGNvbW1pdC5jb21taXQubWVzc2FnZS5zcGxpdCgnXFxuJylbMF0gfVxuICAgICAgICAgICAgICAgIDwvYT5cbiAgICAgICAgICAgIDwvbGk+XG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgcHVibGljIHJlbmRlcigpIHtcbiAgICAgICAgY29uc3QgbG9ncyA9IFJFUE9TLm1hcChyZXBvID0+IHtcbiAgICAgICAgICAgIGxldCBjb250ZW50O1xuICAgICAgICAgICAgaWYgKHRoaXMuc3RhdGVbcmVwb10gPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIGNvbnRlbnQgPSA8U3Bpbm5lciBrZXk9e3JlcG99IC8+O1xuICAgICAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgdGhpcy5zdGF0ZVtyZXBvXSA9PT0gXCJzdHJpbmdcIikge1xuICAgICAgICAgICAgICAgIGNvbnRlbnQgPSBfdChcIlVuYWJsZSB0byBsb2FkIGNvbW1pdCBkZXRhaWw6ICUobXNnKXNcIiwge1xuICAgICAgICAgICAgICAgICAgICBtc2c6IHRoaXMuc3RhdGVbcmVwb10sXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGNvbnRlbnQgPSB0aGlzLnN0YXRlW3JlcG9dLm1hcCh0aGlzLmVsZW1lbnRzRm9yQ29tbWl0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICAgICAgPGRpdiBrZXk9e3JlcG99PlxuICAgICAgICAgICAgICAgICAgICA8aDI+eyByZXBvIH08L2gyPlxuICAgICAgICAgICAgICAgICAgICA8dWw+eyBjb250ZW50IH08L3VsPlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgY29uc3QgY29udGVudCA9IChcbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfQ2hhbmdlbG9nRGlhbG9nX2NvbnRlbnRcIj5cbiAgICAgICAgICAgICAgICB7IHRoaXMucHJvcHMudmVyc2lvbiA9PSBudWxsIHx8IHRoaXMucHJvcHMubmV3VmVyc2lvbiA9PSBudWxsID8gPGgyPnsgX3QoXCJVbmF2YWlsYWJsZVwiKSB9PC9oMj4gOiBsb2dzIH1cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICApO1xuXG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8UXVlc3Rpb25EaWFsb2dcbiAgICAgICAgICAgICAgICB0aXRsZT17X3QoXCJDaGFuZ2Vsb2dcIil9XG4gICAgICAgICAgICAgICAgZGVzY3JpcHRpb249e2NvbnRlbnR9XG4gICAgICAgICAgICAgICAgYnV0dG9uPXtfdChcIlVwZGF0ZVwiKX1cbiAgICAgICAgICAgICAgICBvbkZpbmlzaGVkPXt0aGlzLnByb3BzLm9uRmluaXNoZWR9XG4gICAgICAgICAgICAvPlxuICAgICAgICApO1xuICAgIH1cbn1cbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O0FBaUJBOztBQUNBOztBQUVBOztBQUNBOztBQUNBOztBQXRCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQWVBLE1BQU1BLEtBQUssR0FBRyxDQUFDLHVCQUFELEVBQTBCLDZCQUExQixFQUF5RCwwQkFBekQsQ0FBZDs7QUFFZSxNQUFNQyxlQUFOLFNBQThCQyxjQUFBLENBQU1DLFNBQXBDLENBQXNEO0VBQ2pFQyxXQUFXLENBQUNDLEtBQUQsRUFBUTtJQUNmLE1BQU1B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