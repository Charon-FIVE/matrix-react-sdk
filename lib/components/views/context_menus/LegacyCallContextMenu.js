"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireDefault(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _languageHandler = require("../../../languageHandler");

var _ContextMenu = _interopRequireWildcard(require("../../structures/ContextMenu"));

var _LegacyCallHandler = _interopRequireDefault(require("../../../LegacyCallHandler"));

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

/*
Copyright 2020 New Vector Ltd

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
class LegacyCallContextMenu extends _react.default.Component {
  constructor(props) {
    super(props);
    (0, _defineProperty2.default)(this, "onHoldClick", () => {
      this.props.call.setRemoteOnHold(true);
      this.props.onFinished();
    });
    (0, _defineProperty2.default)(this, "onUnholdClick", () => {
      _LegacyCallHandler.default.instance.setActiveCallRoomId(this.props.call.roomId);

      this.props.onFinished();
    });
    (0, _defineProperty2.default)(this, "onTransferClick", () => {
      _LegacyCallHandler.default.instance.showTransferDialog(this.props.call);

      this.props.onFinished();
    });
  }

  render() {
    const holdUnholdCaption = this.props.call.isRemoteOnHold() ? (0, _languageHandler._t)("Resume") : (0, _languageHandler._t)("Hold");
    const handler = this.props.call.isRemoteOnHold() ? this.onUnholdClick : this.onHoldClick;
    let transferItem;

    if (this.props.call.opponentCanBeTransferred()) {
      transferItem = /*#__PURE__*/_react.default.createElement(_ContextMenu.MenuItem, {
        className: "mx_LegacyCallContextMenu_item",
        onClick: this.onTransferClick
      }, (0, _languageHandler._t)("Transfer"));
    }

    return /*#__PURE__*/_react.default.createElement(_ContextMenu.default, this.props, /*#__PURE__*/_react.default.createElement(_ContextMenu.MenuItem, {
      className: "mx_LegacyCallContextMenu_item",
      onClick: handler
    }, holdUnholdCaption), transferItem);
  }

}

exports.default = LegacyCallContextMenu;
(0, _defineProperty2.default)(LegacyCallContextMenu, "propTypes", {
  // js-sdk User object. Not required because it might not exist.
  user: _propTypes.default.object
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJMZWdhY3lDYWxsQ29udGV4dE1lbnUiLCJSZWFjdCIsIkNvbXBvbmVudCIsImNvbnN0cnVjdG9yIiwicHJvcHMiLCJjYWxsIiwic2V0UmVtb3RlT25Ib2xkIiwib25GaW5pc2hlZCIsIkxlZ2FjeUNhbGxIYW5kbGVyIiwiaW5zdGFuY2UiLCJzZXRBY3RpdmVDYWxsUm9vbUlkIiwicm9vbUlkIiwic2hvd1RyYW5zZmVyRGlhbG9nIiwicmVuZGVyIiwiaG9sZFVuaG9sZENhcHRpb24iLCJpc1JlbW90ZU9uSG9sZCIsIl90IiwiaGFuZGxlciIsIm9uVW5ob2xkQ2xpY2siLCJvbkhvbGRDbGljayIsInRyYW5zZmVySXRlbSIsIm9wcG9uZW50Q2FuQmVUcmFuc2ZlcnJlZCIsIm9uVHJhbnNmZXJDbGljayIsInVzZXIiLCJQcm9wVHlwZXMiLCJvYmplY3QiXSwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvY29tcG9uZW50cy92aWV3cy9jb250ZXh0X21lbnVzL0xlZ2FjeUNhbGxDb250ZXh0TWVudS50c3giXSwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAyMDIwIE5ldyBWZWN0b3IgTHRkXG5cbkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG55b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cblxuaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0JztcbmltcG9ydCBQcm9wVHlwZXMgZnJvbSAncHJvcC10eXBlcyc7XG5pbXBvcnQgeyBNYXRyaXhDYWxsIH0gZnJvbSAnbWF0cml4LWpzLXNkay9zcmMvd2VicnRjL2NhbGwnO1xuXG5pbXBvcnQgeyBfdCB9IGZyb20gJy4uLy4uLy4uL2xhbmd1YWdlSGFuZGxlcic7XG5pbXBvcnQgQ29udGV4dE1lbnUsIHsgSVByb3BzIGFzIElDb250ZXh0TWVudVByb3BzLCBNZW51SXRlbSB9IGZyb20gJy4uLy4uL3N0cnVjdHVyZXMvQ29udGV4dE1lbnUnO1xuaW1wb3J0IExlZ2FjeUNhbGxIYW5kbGVyIGZyb20gJy4uLy4uLy4uL0xlZ2FjeUNhbGxIYW5kbGVyJztcblxuaW50ZXJmYWNlIElQcm9wcyBleHRlbmRzIElDb250ZXh0TWVudVByb3BzIHtcbiAgICBjYWxsOiBNYXRyaXhDYWxsO1xufVxuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBMZWdhY3lDYWxsQ29udGV4dE1lbnUgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQ8SVByb3BzPiB7XG4gICAgc3RhdGljIHByb3BUeXBlcyA9IHtcbiAgICAgICAgLy8ganMtc2RrIFVzZXIgb2JqZWN0LiBOb3QgcmVxdWlyZWQgYmVjYXVzZSBpdCBtaWdodCBub3QgZXhpc3QuXG4gICAgICAgIHVzZXI6IFByb3BUeXBlcy5vYmplY3QsXG4gICAgfTtcblxuICAgIGNvbnN0cnVjdG9yKHByb3BzKSB7XG4gICAgICAgIHN1cGVyKHByb3BzKTtcbiAgICB9XG5cbiAgICBvbkhvbGRDbGljayA9ICgpID0+IHtcbiAgICAgICAgdGhpcy5wcm9wcy5jYWxsLnNldFJlbW90ZU9uSG9sZCh0cnVlKTtcbiAgICAgICAgdGhpcy5wcm9wcy5vbkZpbmlzaGVkKCk7XG4gICAgfTtcblxuICAgIG9uVW5ob2xkQ2xpY2sgPSAoKSA9PiB7XG4gICAgICAgIExlZ2FjeUNhbGxIYW5kbGVyLmluc3RhbmNlLnNldEFjdGl2ZUNhbGxSb29tSWQodGhpcy5wcm9wcy5jYWxsLnJvb21JZCk7XG5cbiAgICAgICAgdGhpcy5wcm9wcy5vbkZpbmlzaGVkKCk7XG4gICAgfTtcblxuICAgIG9uVHJhbnNmZXJDbGljayA9ICgpID0+IHtcbiAgICAgICAgTGVnYWN5Q2FsbEhhbmRsZXIuaW5zdGFuY2Uuc2hvd1RyYW5zZmVyRGlhbG9nKHRoaXMucHJvcHMuY2FsbCk7XG4gICAgICAgIHRoaXMucHJvcHMub25GaW5pc2hlZCgpO1xuICAgIH07XG5cbiAgICByZW5kZXIoKSB7XG4gICAgICAgIGNvbnN0IGhvbGRVbmhvbGRDYXB0aW9uID0gdGhpcy5wcm9wcy5jYWxsLmlzUmVtb3RlT25Ib2xkKCkgPyBfdChcIlJlc3VtZVwiKSA6IF90KFwiSG9sZFwiKTtcbiAgICAgICAgY29uc3QgaGFuZGxlciA9IHRoaXMucHJvcHMuY2FsbC5pc1JlbW90ZU9uSG9sZCgpID8gdGhpcy5vblVuaG9sZENsaWNrIDogdGhpcy5vbkhvbGRDbGljaztcblxuICAgICAgICBsZXQgdHJhbnNmZXJJdGVtO1xuICAgICAgICBpZiAodGhpcy5wcm9wcy5jYWxsLm9wcG9uZW50Q2FuQmVUcmFuc2ZlcnJlZCgpKSB7XG4gICAgICAgICAgICB0cmFuc2Zlckl0ZW0gPSA8TWVudUl0ZW0gY2xhc3NOYW1lPVwibXhfTGVnYWN5Q2FsbENvbnRleHRNZW51X2l0ZW1cIiBvbkNsaWNrPXt0aGlzLm9uVHJhbnNmZXJDbGlja30+XG4gICAgICAgICAgICAgICAgeyBfdChcIlRyYW5zZmVyXCIpIH1cbiAgICAgICAgICAgIDwvTWVudUl0ZW0+O1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIDxDb250ZXh0TWVudSB7Li4udGhpcy5wcm9wc30+XG4gICAgICAgICAgICA8TWVudUl0ZW0gY2xhc3NOYW1lPVwibXhfTGVnYWN5Q2FsbENvbnRleHRNZW51X2l0ZW1cIiBvbkNsaWNrPXtoYW5kbGVyfT5cbiAgICAgICAgICAgICAgICB7IGhvbGRVbmhvbGRDYXB0aW9uIH1cbiAgICAgICAgICAgIDwvTWVudUl0ZW0+XG4gICAgICAgICAgICB7IHRyYW5zZmVySXRlbSB9XG4gICAgICAgIDwvQ29udGV4dE1lbnU+O1xuICAgIH1cbn1cbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFnQkE7O0FBQ0E7O0FBR0E7O0FBQ0E7O0FBQ0E7Ozs7OztBQXRCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFjZSxNQUFNQSxxQkFBTixTQUFvQ0MsY0FBQSxDQUFNQyxTQUExQyxDQUE0RDtFQU12RUMsV0FBVyxDQUFDQyxLQUFELEVBQVE7SUFDZixNQUFNQSxLQUFOO0lBRGUsbURBSUwsTUFBTTtNQUNoQixLQUFLQSxLQUFMLENBQVdDLElBQVgsQ0FBZ0JDLGVBQWhCLENBQWdDLElBQWhDO01BQ0EsS0FBS0YsS0FBTCxDQUFXRyxVQUFYO0lBQ0gsQ0FQa0I7SUFBQSxxREFTSCxNQUFNO01BQ2xCQywwQkFBQSxDQUFrQkMsUUFBbEIsQ0FBMkJDLG1CQUEzQixDQUErQyxLQUFLTixLQUFMLENBQVdDLElBQVgsQ0FBZ0JNLE1BQS9EOztNQUVBLEtBQUtQLEtBQUwsQ0FBV0csVUFBWDtJQUNILENBYmtCO0lBQUEsdURBZUQsTUFBTTtNQUNwQkMsMEJBQUEsQ0FBa0JDLFFBQWxCLENBQTJCRyxrQkFBM0IsQ0FBOEMsS0FBS1IsS0FBTCxDQUFXQyxJQUF6RDs7TUFDQSxLQUFLRCxLQUFMLENBQVdHLFVBQVg7SUFDSCxDQWxCa0I7RUFFbEI7O0VBa0JETSxNQUFNLEdBQUc7SUFDTCxNQUFNQyxpQkFBaUIsR0FBRyxLQUFLVixLQUFMLENBQVdDLElBQVgsQ0FBZ0JVLGNBQWhCLEtBQW1DLElBQUFDLG1CQUFBLEVBQUcsUUFBSCxDQUFuQyxHQUFrRCxJQUFBQSxtQkFBQSxFQUFHLE1BQUgsQ0FBNUU7SUFDQSxNQUFNQyxPQUFPLEdBQUcsS0FBS2IsS0FBTCxDQUFXQyxJQUFYLENBQWdCVSxjQUFoQixLQUFtQyxLQUFLRyxhQUF4QyxHQUF3RCxLQUFLQyxXQUE3RTtJQUVBLElBQUlDLFlBQUo7O0lBQ0EsSUFBSSxLQUFLaEIsS0FBTCxDQUFXQyxJQUFYLENBQWdCZ0Isd0JBQWhCLEVBQUosRUFBZ0Q7TUFDNUNELFlBQVksZ0JBQUcsNkJBQUMscUJBQUQ7UUFBVSxTQUFTLEVBQUMsK0JBQXBCO1FBQW9ELE9BQU8sRUFBRSxLQUFLRTtNQUFsRSxHQUNULElBQUFOLG1CQUFBLEVBQUcsVUFBSCxDQURTLENBQWY7SUFHSDs7SUFFRCxvQkFBTyw2QkFBQyxvQkFBRCxFQUFpQixLQUFLWixLQUF0QixlQUNILDZCQUFDLHFCQUFEO01BQVUsU0FBUyxFQUFDLCtCQUFwQjtNQUFvRCxPQUFPLEVBQUVhO0lBQTdELEdBQ01ILGlCQUROLENBREcsRUFJRE0sWUFKQyxDQUFQO0VBTUg7O0FBM0NzRTs7OzhCQUF0RHBCLHFCLGVBQ0U7RUFDZjtFQUNBdUIsSUFBSSxFQUFFQyxrQkFBQSxDQUFVQztBQUZELEMifQ==