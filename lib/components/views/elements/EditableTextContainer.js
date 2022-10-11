"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireDefault(require("react"));

var _Spinner = _interopRequireDefault(require("./Spinner"));

var _EditableText = _interopRequireDefault(require("./EditableText"));

/*
Copyright 2015, 2016 OpenMarket Ltd

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
 * A component which wraps an EditableText, with a spinner while updates take
 * place.
 *
 * Parent components should supply an 'onSubmit' callback which returns a
 * promise; a spinner is shown until the promise resolves.
 *
 * The parent can also supply a 'getInitialValue' callback, which works in a
 * similarly asynchronous way. If this is not provided, the initial value is
 * taken from the 'initialValue' property.
 */
class EditableTextContainer extends _react.default.Component {
  constructor(props) {
    super(props);
    (0, _defineProperty2.default)(this, "unmounted", false);
    (0, _defineProperty2.default)(this, "onValueChanged", (value, shouldSubmit) => {
      if (!shouldSubmit) {
        return;
      }

      this.setState({
        busy: true,
        errorString: null
      });
      this.props.onSubmit(value).then(() => {
        if (this.unmounted) {
          return;
        }

        this.setState({
          busy: false,
          value: value
        });
      }, error => {
        if (this.unmounted) {
          return;
        }

        this.setState({
          errorString: error.toString(),
          busy: false
        });
      });
    });
    this.state = {
      busy: false,
      errorString: null,
      value: props.initialValue
    };
  }

  async componentDidMount() {
    // use whatever was given in the initialValue property.
    if (this.props.getInitialValue === undefined) return;
    this.setState({
      busy: true
    });

    try {
      const initialValue = await this.props.getInitialValue();
      if (this.unmounted) return;
      this.setState({
        busy: false,
        value: initialValue
      });
    } catch (error) {
      if (this.unmounted) return;
      this.setState({
        errorString: error.toString(),
        busy: false
      });
    }
  }

  componentWillUnmount() {
    this.unmounted = true;
  }

  render() {
    if (this.state.busy) {
      return /*#__PURE__*/_react.default.createElement(_Spinner.default, null);
    } else if (this.state.errorString) {
      return /*#__PURE__*/_react.default.createElement("div", {
        className: "error"
      }, this.state.errorString);
    } else {
      return /*#__PURE__*/_react.default.createElement(_EditableText.default, {
        initialValue: this.state.value,
        placeholder: this.props.placeholder,
        onValueChanged: this.onValueChanged,
        blurToSubmit: this.props.blurToSubmit
      });
    }
  }

}

exports.default = EditableTextContainer;
(0, _defineProperty2.default)(EditableTextContainer, "defaultProps", {
  initialValue: "",
  placeholder: "",
  blurToSubmit: false,
  onSubmit: () => {
    return Promise.resolve();
  }
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJFZGl0YWJsZVRleHRDb250YWluZXIiLCJSZWFjdCIsIkNvbXBvbmVudCIsImNvbnN0cnVjdG9yIiwicHJvcHMiLCJ2YWx1ZSIsInNob3VsZFN1Ym1pdCIsInNldFN0YXRlIiwiYnVzeSIsImVycm9yU3RyaW5nIiwib25TdWJtaXQiLCJ0aGVuIiwidW5tb3VudGVkIiwiZXJyb3IiLCJ0b1N0cmluZyIsInN0YXRlIiwiaW5pdGlhbFZhbHVlIiwiY29tcG9uZW50RGlkTW91bnQiLCJnZXRJbml0aWFsVmFsdWUiLCJ1bmRlZmluZWQiLCJjb21wb25lbnRXaWxsVW5tb3VudCIsInJlbmRlciIsInBsYWNlaG9sZGVyIiwib25WYWx1ZUNoYW5nZWQiLCJibHVyVG9TdWJtaXQiLCJQcm9taXNlIiwicmVzb2x2ZSJdLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL2VsZW1lbnRzL0VkaXRhYmxlVGV4dENvbnRhaW5lci50c3giXSwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAyMDE1LCAyMDE2IE9wZW5NYXJrZXQgTHRkXG5cbkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG55b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cblxuaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0JztcblxuaW1wb3J0IFNwaW5uZXIgZnJvbSBcIi4vU3Bpbm5lclwiO1xuaW1wb3J0IEVkaXRhYmxlVGV4dCBmcm9tIFwiLi9FZGl0YWJsZVRleHRcIjtcblxuaW50ZXJmYWNlIElQcm9wcyB7XG4gICAgLyogY2FsbGJhY2sgdG8gcmV0cmlldmUgdGhlIGluaXRpYWwgdmFsdWUuICovXG4gICAgZ2V0SW5pdGlhbFZhbHVlPzogKCkgPT4gUHJvbWlzZTxzdHJpbmc+O1xuXG4gICAgLyogaW5pdGlhbCB2YWx1ZTsgdXNlZCBpZiBnZXRJbml0aWFsVmFsdWUgaXMgbm90IGdpdmVuICovXG4gICAgaW5pdGlhbFZhbHVlPzogc3RyaW5nO1xuXG4gICAgLyogcGxhY2Vob2xkZXIgdGV4dCB0byB1c2Ugd2hlbiB0aGUgdmFsdWUgaXMgZW1wdHkgKGFuZCBub3QgYmVpbmdcbiAgICAgKiBlZGl0ZWQpICovXG4gICAgcGxhY2Vob2xkZXI/OiBzdHJpbmc7XG5cbiAgICAvKiBjYWxsYmFjayB0byB1cGRhdGUgdGhlIHZhbHVlLiBDYWxsZWQgd2l0aCBhIHNpbmdsZSBhcmd1bWVudDogdGhlIG5ld1xuICAgICAqIHZhbHVlLiAqL1xuICAgIG9uU3VibWl0PzogKHZhbHVlOiBzdHJpbmcpID0+IFByb21pc2U8e30gfCB2b2lkPjtcblxuICAgIC8qIHNob3VsZCB0aGUgaW5wdXQgc3VibWl0IHdoZW4gZm9jdXMgaXMgbG9zdD8gKi9cbiAgICBibHVyVG9TdWJtaXQ/OiBib29sZWFuO1xufVxuXG5pbnRlcmZhY2UgSVN0YXRlIHtcbiAgICBidXN5OiBib29sZWFuO1xuICAgIGVycm9yU3RyaW5nOiBzdHJpbmc7XG4gICAgdmFsdWU6IHN0cmluZztcbn1cblxuLyoqXG4gKiBBIGNvbXBvbmVudCB3aGljaCB3cmFwcyBhbiBFZGl0YWJsZVRleHQsIHdpdGggYSBzcGlubmVyIHdoaWxlIHVwZGF0ZXMgdGFrZVxuICogcGxhY2UuXG4gKlxuICogUGFyZW50IGNvbXBvbmVudHMgc2hvdWxkIHN1cHBseSBhbiAnb25TdWJtaXQnIGNhbGxiYWNrIHdoaWNoIHJldHVybnMgYVxuICogcHJvbWlzZTsgYSBzcGlubmVyIGlzIHNob3duIHVudGlsIHRoZSBwcm9taXNlIHJlc29sdmVzLlxuICpcbiAqIFRoZSBwYXJlbnQgY2FuIGFsc28gc3VwcGx5IGEgJ2dldEluaXRpYWxWYWx1ZScgY2FsbGJhY2ssIHdoaWNoIHdvcmtzIGluIGFcbiAqIHNpbWlsYXJseSBhc3luY2hyb25vdXMgd2F5LiBJZiB0aGlzIGlzIG5vdCBwcm92aWRlZCwgdGhlIGluaXRpYWwgdmFsdWUgaXNcbiAqIHRha2VuIGZyb20gdGhlICdpbml0aWFsVmFsdWUnIHByb3BlcnR5LlxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBFZGl0YWJsZVRleHRDb250YWluZXIgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQ8SVByb3BzLCBJU3RhdGU+IHtcbiAgICBwcml2YXRlIHVubW91bnRlZCA9IGZhbHNlO1xuICAgIHB1YmxpYyBzdGF0aWMgZGVmYXVsdFByb3BzOiBQYXJ0aWFsPElQcm9wcz4gPSB7XG4gICAgICAgIGluaXRpYWxWYWx1ZTogXCJcIixcbiAgICAgICAgcGxhY2Vob2xkZXI6IFwiXCIsXG4gICAgICAgIGJsdXJUb1N1Ym1pdDogZmFsc2UsXG4gICAgICAgIG9uU3VibWl0OiAoKSA9PiB7IHJldHVybiBQcm9taXNlLnJlc29sdmUoKTsgfSxcbiAgICB9O1xuXG4gICAgY29uc3RydWN0b3IocHJvcHM6IElQcm9wcykge1xuICAgICAgICBzdXBlcihwcm9wcyk7XG5cbiAgICAgICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgICAgICAgIGJ1c3k6IGZhbHNlLFxuICAgICAgICAgICAgZXJyb3JTdHJpbmc6IG51bGwsXG4gICAgICAgICAgICB2YWx1ZTogcHJvcHMuaW5pdGlhbFZhbHVlLFxuICAgICAgICB9O1xuICAgIH1cblxuICAgIHB1YmxpYyBhc3luYyBjb21wb25lbnREaWRNb3VudCgpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICAgICAgLy8gdXNlIHdoYXRldmVyIHdhcyBnaXZlbiBpbiB0aGUgaW5pdGlhbFZhbHVlIHByb3BlcnR5LlxuICAgICAgICBpZiAodGhpcy5wcm9wcy5nZXRJbml0aWFsVmFsdWUgPT09IHVuZGVmaW5lZCkgcmV0dXJuO1xuXG4gICAgICAgIHRoaXMuc2V0U3RhdGUoeyBidXN5OiB0cnVlIH0pO1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgaW5pdGlhbFZhbHVlID0gYXdhaXQgdGhpcy5wcm9wcy5nZXRJbml0aWFsVmFsdWUoKTtcbiAgICAgICAgICAgIGlmICh0aGlzLnVubW91bnRlZCkgcmV0dXJuO1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICAgICAgYnVzeTogZmFsc2UsXG4gICAgICAgICAgICAgICAgdmFsdWU6IGluaXRpYWxWYWx1ZSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgaWYgKHRoaXMudW5tb3VudGVkKSByZXR1cm47XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgICAgICBlcnJvclN0cmluZzogZXJyb3IudG9TdHJpbmcoKSxcbiAgICAgICAgICAgICAgICBidXN5OiBmYWxzZSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHVibGljIGNvbXBvbmVudFdpbGxVbm1vdW50KCk6IHZvaWQge1xuICAgICAgICB0aGlzLnVubW91bnRlZCA9IHRydWU7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBvblZhbHVlQ2hhbmdlZCA9ICh2YWx1ZTogc3RyaW5nLCBzaG91bGRTdWJtaXQ6IGJvb2xlYW4pOiB2b2lkID0+IHtcbiAgICAgICAgaWYgKCFzaG91bGRTdWJtaXQpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgYnVzeTogdHJ1ZSxcbiAgICAgICAgICAgIGVycm9yU3RyaW5nOiBudWxsLFxuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLnByb3BzLm9uU3VibWl0KHZhbHVlKS50aGVuKFxuICAgICAgICAgICAgKCkgPT4ge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLnVubW91bnRlZCkgeyByZXR1cm47IH1cbiAgICAgICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgICAgICAgICAgYnVzeTogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlOiB2YWx1ZSxcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAoZXJyb3IpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy51bm1vdW50ZWQpIHsgcmV0dXJuOyB9XG4gICAgICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICAgICAgICAgIGVycm9yU3RyaW5nOiBlcnJvci50b1N0cmluZygpLFxuICAgICAgICAgICAgICAgICAgICBidXN5OiBmYWxzZSxcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICk7XG4gICAgfTtcblxuICAgIHB1YmxpYyByZW5kZXIoKTogSlNYLkVsZW1lbnQge1xuICAgICAgICBpZiAodGhpcy5zdGF0ZS5idXN5KSB7XG4gICAgICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgICAgIDxTcGlubmVyIC8+XG4gICAgICAgICAgICApO1xuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuc3RhdGUuZXJyb3JTdHJpbmcpIHtcbiAgICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJlcnJvclwiPnsgdGhpcy5zdGF0ZS5lcnJvclN0cmluZyB9PC9kaXY+XG4gICAgICAgICAgICApO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgICAgICA8RWRpdGFibGVUZXh0IGluaXRpYWxWYWx1ZT17dGhpcy5zdGF0ZS52YWx1ZX1cbiAgICAgICAgICAgICAgICAgICAgcGxhY2Vob2xkZXI9e3RoaXMucHJvcHMucGxhY2Vob2xkZXJ9XG4gICAgICAgICAgICAgICAgICAgIG9uVmFsdWVDaGFuZ2VkPXt0aGlzLm9uVmFsdWVDaGFuZ2VkfVxuICAgICAgICAgICAgICAgICAgICBibHVyVG9TdWJtaXQ9e3RoaXMucHJvcHMuYmx1clRvU3VibWl0fVxuICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgfVxufVxuXG4iXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBZ0JBOztBQUVBOztBQUNBOztBQW5CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBZ0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDZSxNQUFNQSxxQkFBTixTQUFvQ0MsY0FBQSxDQUFNQyxTQUExQyxDQUFvRTtFQVMvRUMsV0FBVyxDQUFDQyxLQUFELEVBQWdCO0lBQ3ZCLE1BQU1BLEtBQU47SUFEdUIsaURBUlAsS0FRTztJQUFBLHNEQW1DRixDQUFDQyxLQUFELEVBQWdCQyxZQUFoQixLQUFnRDtNQUNyRSxJQUFJLENBQUNBLFlBQUwsRUFBbUI7UUFDZjtNQUNIOztNQUVELEtBQUtDLFFBQUwsQ0FBYztRQUNWQyxJQUFJLEVBQUUsSUFESTtRQUVWQyxXQUFXLEVBQUU7TUFGSCxDQUFkO01BS0EsS0FBS0wsS0FBTCxDQUFXTSxRQUFYLENBQW9CTCxLQUFwQixFQUEyQk0sSUFBM0IsQ0FDSSxNQUFNO1FBQ0YsSUFBSSxLQUFLQyxTQUFULEVBQW9CO1VBQUU7UUFBUzs7UUFDL0IsS0FBS0wsUUFBTCxDQUFjO1VBQ1ZDLElBQUksRUFBRSxLQURJO1VBRVZILEtBQUssRUFBRUE7UUFGRyxDQUFkO01BSUgsQ0FQTCxFQVFLUSxLQUFELElBQVc7UUFDUCxJQUFJLEtBQUtELFNBQVQsRUFBb0I7VUFBRTtRQUFTOztRQUMvQixLQUFLTCxRQUFMLENBQWM7VUFDVkUsV0FBVyxFQUFFSSxLQUFLLENBQUNDLFFBQU4sRUFESDtVQUVWTixJQUFJLEVBQUU7UUFGSSxDQUFkO01BSUgsQ0FkTDtJQWdCSCxDQTdEMEI7SUFHdkIsS0FBS08sS0FBTCxHQUFhO01BQ1RQLElBQUksRUFBRSxLQURHO01BRVRDLFdBQVcsRUFBRSxJQUZKO01BR1RKLEtBQUssRUFBRUQsS0FBSyxDQUFDWTtJQUhKLENBQWI7RUFLSDs7RUFFNkIsTUFBakJDLGlCQUFpQixHQUFrQjtJQUM1QztJQUNBLElBQUksS0FBS2IsS0FBTCxDQUFXYyxlQUFYLEtBQStCQyxTQUFuQyxFQUE4QztJQUU5QyxLQUFLWixRQUFMLENBQWM7TUFBRUMsSUFBSSxFQUFFO0lBQVIsQ0FBZDs7SUFDQSxJQUFJO01BQ0EsTUFBTVEsWUFBWSxHQUFHLE1BQU0sS0FBS1osS0FBTCxDQUFXYyxlQUFYLEVBQTNCO01BQ0EsSUFBSSxLQUFLTixTQUFULEVBQW9CO01BQ3BCLEtBQUtMLFFBQUwsQ0FBYztRQUNWQyxJQUFJLEVBQUUsS0FESTtRQUVWSCxLQUFLLEVBQUVXO01BRkcsQ0FBZDtJQUlILENBUEQsQ0FPRSxPQUFPSCxLQUFQLEVBQWM7TUFDWixJQUFJLEtBQUtELFNBQVQsRUFBb0I7TUFDcEIsS0FBS0wsUUFBTCxDQUFjO1FBQ1ZFLFdBQVcsRUFBRUksS0FBSyxDQUFDQyxRQUFOLEVBREg7UUFFVk4sSUFBSSxFQUFFO01BRkksQ0FBZDtJQUlIO0VBQ0o7O0VBRU1ZLG9CQUFvQixHQUFTO0lBQ2hDLEtBQUtSLFNBQUwsR0FBaUIsSUFBakI7RUFDSDs7RUE4Qk1TLE1BQU0sR0FBZ0I7SUFDekIsSUFBSSxLQUFLTixLQUFMLENBQVdQLElBQWYsRUFBcUI7TUFDakIsb0JBQ0ksNkJBQUMsZ0JBQUQsT0FESjtJQUdILENBSkQsTUFJTyxJQUFJLEtBQUtPLEtBQUwsQ0FBV04sV0FBZixFQUE0QjtNQUMvQixvQkFDSTtRQUFLLFNBQVMsRUFBQztNQUFmLEdBQXlCLEtBQUtNLEtBQUwsQ0FBV04sV0FBcEMsQ0FESjtJQUdILENBSk0sTUFJQTtNQUNILG9CQUNJLDZCQUFDLHFCQUFEO1FBQWMsWUFBWSxFQUFFLEtBQUtNLEtBQUwsQ0FBV1YsS0FBdkM7UUFDSSxXQUFXLEVBQUUsS0FBS0QsS0FBTCxDQUFXa0IsV0FENUI7UUFFSSxjQUFjLEVBQUUsS0FBS0MsY0FGekI7UUFHSSxZQUFZLEVBQUUsS0FBS25CLEtBQUwsQ0FBV29CO01BSDdCLEVBREo7SUFPSDtFQUNKOztBQTFGOEU7Ozs4QkFBOUR4QixxQixrQkFFNkI7RUFDMUNnQixZQUFZLEVBQUUsRUFENEI7RUFFMUNNLFdBQVcsRUFBRSxFQUY2QjtFQUcxQ0UsWUFBWSxFQUFFLEtBSDRCO0VBSTFDZCxRQUFRLEVBQUUsTUFBTTtJQUFFLE9BQU9lLE9BQU8sQ0FBQ0MsT0FBUixFQUFQO0VBQTJCO0FBSkgsQyJ9