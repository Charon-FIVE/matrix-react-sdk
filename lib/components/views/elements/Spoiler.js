"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireDefault(require("react"));

/*
 Copyright 2019 Sorunome

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
class Spoiler extends _react.default.Component {
  constructor(props) {
    super(props);
    (0, _defineProperty2.default)(this, "toggleVisible", e => {
      if (!this.state.visible) {
        // we are un-blurring, we don't want this click to propagate to potential child pills
        e.preventDefault();
        e.stopPropagation();
      }

      this.setState({
        visible: !this.state.visible
      });
    });
    this.state = {
      visible: false
    };
  }

  render() {
    const reason = this.props.reason ? /*#__PURE__*/_react.default.createElement("span", {
      className: "mx_EventTile_spoiler_reason"
    }, "(" + this.props.reason + ")") : null; // react doesn't allow appending a DOM node as child.
    // as such, we pass the this.props.contentHtml instead and then set the raw
    // HTML content. This is secure as the contents have already been parsed previously

    return /*#__PURE__*/_react.default.createElement("span", {
      className: "mx_EventTile_spoiler" + (this.state.visible ? " visible" : ""),
      onClick: this.toggleVisible
    }, reason, "\xA0", /*#__PURE__*/_react.default.createElement("span", {
      className: "mx_EventTile_spoiler_content",
      dangerouslySetInnerHTML: {
        __html: this.props.contentHtml
      }
    }));
  }

}

exports.default = Spoiler;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJTcG9pbGVyIiwiUmVhY3QiLCJDb21wb25lbnQiLCJjb25zdHJ1Y3RvciIsInByb3BzIiwiZSIsInN0YXRlIiwidmlzaWJsZSIsInByZXZlbnREZWZhdWx0Iiwic3RvcFByb3BhZ2F0aW9uIiwic2V0U3RhdGUiLCJyZW5kZXIiLCJyZWFzb24iLCJ0b2dnbGVWaXNpYmxlIiwiX19odG1sIiwiY29udGVudEh0bWwiXSwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvY29tcG9uZW50cy92aWV3cy9lbGVtZW50cy9TcG9pbGVyLnRzeCJdLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuIENvcHlyaWdodCAyMDE5IFNvcnVub21lXG5cbiBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbiBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG4gVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbiBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbiBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG4gbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4gKi9cblxuaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0JztcblxuaW50ZXJmYWNlIElQcm9wcyB7XG4gICAgcmVhc29uPzogc3RyaW5nO1xuICAgIGNvbnRlbnRIdG1sOiBzdHJpbmc7XG59XG5cbmludGVyZmFjZSBJU3RhdGUge1xuICAgIHZpc2libGU6IGJvb2xlYW47XG59XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFNwb2lsZXIgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQ8SVByb3BzLCBJU3RhdGU+IHtcbiAgICBjb25zdHJ1Y3Rvcihwcm9wczogSVByb3BzKSB7XG4gICAgICAgIHN1cGVyKHByb3BzKTtcbiAgICAgICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgICAgICAgIHZpc2libGU6IGZhbHNlLFxuICAgICAgICB9O1xuICAgIH1cblxuICAgIHByaXZhdGUgdG9nZ2xlVmlzaWJsZSA9IChlOiBSZWFjdC5Nb3VzZUV2ZW50KTogdm9pZCA9PiB7XG4gICAgICAgIGlmICghdGhpcy5zdGF0ZS52aXNpYmxlKSB7XG4gICAgICAgICAgICAvLyB3ZSBhcmUgdW4tYmx1cnJpbmcsIHdlIGRvbid0IHdhbnQgdGhpcyBjbGljayB0byBwcm9wYWdhdGUgdG8gcG90ZW50aWFsIGNoaWxkIHBpbGxzXG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoeyB2aXNpYmxlOiAhdGhpcy5zdGF0ZS52aXNpYmxlIH0pO1xuICAgIH07XG5cbiAgICBwdWJsaWMgcmVuZGVyKCk6IEpTWC5FbGVtZW50IHtcbiAgICAgICAgY29uc3QgcmVhc29uID0gdGhpcy5wcm9wcy5yZWFzb24gPyAoXG4gICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJteF9FdmVudFRpbGVfc3BvaWxlcl9yZWFzb25cIj57IFwiKFwiICsgdGhpcy5wcm9wcy5yZWFzb24gKyBcIilcIiB9PC9zcGFuPlxuICAgICAgICApIDogbnVsbDtcbiAgICAgICAgLy8gcmVhY3QgZG9lc24ndCBhbGxvdyBhcHBlbmRpbmcgYSBET00gbm9kZSBhcyBjaGlsZC5cbiAgICAgICAgLy8gYXMgc3VjaCwgd2UgcGFzcyB0aGUgdGhpcy5wcm9wcy5jb250ZW50SHRtbCBpbnN0ZWFkIGFuZCB0aGVuIHNldCB0aGUgcmF3XG4gICAgICAgIC8vIEhUTUwgY29udGVudC4gVGhpcyBpcyBzZWN1cmUgYXMgdGhlIGNvbnRlbnRzIGhhdmUgYWxyZWFkeSBiZWVuIHBhcnNlZCBwcmV2aW91c2x5XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9e1wibXhfRXZlbnRUaWxlX3Nwb2lsZXJcIiArICh0aGlzLnN0YXRlLnZpc2libGUgPyBcIiB2aXNpYmxlXCIgOiBcIlwiKX0gb25DbGljaz17dGhpcy50b2dnbGVWaXNpYmxlfT5cbiAgICAgICAgICAgICAgICB7IHJlYXNvbiB9XG4gICAgICAgICAgICAgICAgJm5ic3A7XG4gICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwibXhfRXZlbnRUaWxlX3Nwb2lsZXJfY29udGVudFwiIGRhbmdlcm91c2x5U2V0SW5uZXJIVE1MPXt7IF9faHRtbDogdGhpcy5wcm9wcy5jb250ZW50SHRtbCB9fSAvPlxuICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICApO1xuICAgIH1cbn1cbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFnQkE7O0FBaEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQWFlLE1BQU1BLE9BQU4sU0FBc0JDLGNBQUEsQ0FBTUMsU0FBNUIsQ0FBc0Q7RUFDakVDLFdBQVcsQ0FBQ0MsS0FBRCxFQUFnQjtJQUN2QixNQUFNQSxLQUFOO0lBRHVCLHFEQU9GQyxDQUFELElBQStCO01BQ25ELElBQUksQ0FBQyxLQUFLQyxLQUFMLENBQVdDLE9BQWhCLEVBQXlCO1FBQ3JCO1FBQ0FGLENBQUMsQ0FBQ0csY0FBRjtRQUNBSCxDQUFDLENBQUNJLGVBQUY7TUFDSDs7TUFDRCxLQUFLQyxRQUFMLENBQWM7UUFBRUgsT0FBTyxFQUFFLENBQUMsS0FBS0QsS0FBTCxDQUFXQztNQUF2QixDQUFkO0lBQ0gsQ0FkMEI7SUFFdkIsS0FBS0QsS0FBTCxHQUFhO01BQ1RDLE9BQU8sRUFBRTtJQURBLENBQWI7RUFHSDs7RUFXTUksTUFBTSxHQUFnQjtJQUN6QixNQUFNQyxNQUFNLEdBQUcsS0FBS1IsS0FBTCxDQUFXUSxNQUFYLGdCQUNYO01BQU0sU0FBUyxFQUFDO0lBQWhCLEdBQWdELE1BQU0sS0FBS1IsS0FBTCxDQUFXUSxNQUFqQixHQUEwQixHQUExRSxDQURXLEdBRVgsSUFGSixDQUR5QixDQUl6QjtJQUNBO0lBQ0E7O0lBQ0Esb0JBQ0k7TUFBTSxTQUFTLEVBQUUsMEJBQTBCLEtBQUtOLEtBQUwsQ0FBV0MsT0FBWCxHQUFxQixVQUFyQixHQUFrQyxFQUE1RCxDQUFqQjtNQUFrRixPQUFPLEVBQUUsS0FBS007SUFBaEcsR0FDTUQsTUFETix1QkFHSTtNQUFNLFNBQVMsRUFBQyw4QkFBaEI7TUFBK0MsdUJBQXVCLEVBQUU7UUFBRUUsTUFBTSxFQUFFLEtBQUtWLEtBQUwsQ0FBV1c7TUFBckI7SUFBeEUsRUFISixDQURKO0VBT0g7O0FBL0JnRSJ9