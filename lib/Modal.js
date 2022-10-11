"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.ModalManager = void 0;

var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireDefault(require("react"));

var _reactDom = _interopRequireDefault(require("react-dom"));

var _classnames = _interopRequireDefault(require("classnames"));

var _utils = require("matrix-js-sdk/src/utils");

var _dispatcher = _interopRequireDefault(require("./dispatcher/dispatcher"));

var _AsyncWrapper = _interopRequireDefault(require("./AsyncWrapper"));

/*
Copyright 2015, 2016 OpenMarket Ltd
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
const DIALOG_CONTAINER_ID = "mx_Dialog_Container";
const STATIC_DIALOG_CONTAINER_ID = "mx_Dialog_StaticContainer";

class ModalManager {
  constructor() {
    (0, _defineProperty2.default)(this, "counter", 0);
    (0, _defineProperty2.default)(this, "priorityModal", null);
    (0, _defineProperty2.default)(this, "staticModal", null);
    (0, _defineProperty2.default)(this, "modals", []);
    (0, _defineProperty2.default)(this, "onBackgroundClick", () => {
      const modal = this.getCurrentModal();

      if (!modal) {
        return;
      } // we want to pass a reason to the onBeforeClose
      // callback, but close is currently defined to
      // pass all number of arguments to the onFinished callback
      // so, pass the reason to close through a member variable


      modal.closeReason = "backgroundClick";
      modal.close();
      modal.closeReason = null;
    });
  }

  static getOrCreateContainer() {
    let container = document.getElementById(DIALOG_CONTAINER_ID);

    if (!container) {
      container = document.createElement("div");
      container.id = DIALOG_CONTAINER_ID;
      document.body.appendChild(container);
    }

    return container;
  }

  static getOrCreateStaticContainer() {
    let container = document.getElementById(STATIC_DIALOG_CONTAINER_ID);

    if (!container) {
      container = document.createElement("div");
      container.id = STATIC_DIALOG_CONTAINER_ID;
      document.body.appendChild(container);
    }

    return container;
  }

  toggleCurrentDialogVisibility() {
    const modal = this.getCurrentModal();
    if (!modal) return;
    modal.hidden = !modal.hidden;
  }

  hasDialogs() {
    return this.priorityModal || this.staticModal || this.modals.length > 0;
  }

  createDialog(Element) {
    for (var _len = arguments.length, rest = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      rest[_key - 1] = arguments[_key];
    }

    return this.createDialogAsync(Promise.resolve(Element), ...rest);
  }

  appendDialog(Element) {
    for (var _len2 = arguments.length, rest = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
      rest[_key2 - 1] = arguments[_key2];
    }

    return this.appendDialogAsync(Promise.resolve(Element), ...rest);
  }

  closeCurrentModal(reason) {
    const modal = this.getCurrentModal();

    if (!modal) {
      return;
    }

    modal.closeReason = reason;
    modal.close();
  }

  buildModal(prom, props, className, options) {
    const modal = {
      onFinished: props ? props.onFinished : null,
      onBeforeClose: options.onBeforeClose,
      beforeClosePromise: null,
      closeReason: null,
      className,
      // these will be set below but we need an object reference to pass to getCloseFn before we can do that
      elem: null,
      close: null
    }; // never call this from onFinished() otherwise it will loop

    const [closeDialog, onFinishedProm] = this.getCloseFn(modal, props); // don't attempt to reuse the same AsyncWrapper for different dialogs,
    // otherwise we'll get confused.

    const modalCount = this.counter++; // FIXME: If a dialog uses getDefaultProps it clobbers the onFinished
    // property set here so you can't close the dialog from a button click!

    modal.elem = /*#__PURE__*/_react.default.createElement(_AsyncWrapper.default, (0, _extends2.default)({
      key: modalCount,
      prom: prom
    }, props, {
      onFinished: closeDialog
    }));
    modal.close = closeDialog;
    return {
      modal,
      closeDialog,
      onFinishedProm
    };
  }

  getCloseFn(modal, props) {
    var _this = this;

    const deferred = (0, _utils.defer)();
    return [async function () {
      if (modal.beforeClosePromise) {
        await modal.beforeClosePromise;
      } else if (modal.onBeforeClose) {
        modal.beforeClosePromise = modal.onBeforeClose(modal.closeReason);
        const shouldClose = await modal.beforeClosePromise;
        modal.beforeClosePromise = null;

        if (!shouldClose) {
          return;
        }
      }

      for (var _len3 = arguments.length, args = new Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
        args[_key3] = arguments[_key3];
      }

      deferred.resolve(args);
      if (props && props.onFinished) props.onFinished.apply(null, args);

      const i = _this.modals.indexOf(modal);

      if (i >= 0) {
        _this.modals.splice(i, 1);
      }

      if (_this.priorityModal === modal) {
        _this.priorityModal = null; // XXX: This is destructive

        _this.modals = [];
      }

      if (_this.staticModal === modal) {
        _this.staticModal = null; // XXX: This is destructive

        _this.modals = [];
      }

      _this.reRender();
    }, deferred.promise];
  }
  /**
   * @callback onBeforeClose
   * @param {string?} reason either "backgroundClick" or null
   * @return {Promise<bool>} whether the dialog should close
   */

  /**
   * Open a modal view.
   *
   * This can be used to display a react component which is loaded as an asynchronous
   * webpack component. To do this, set 'loader' as:
   *
   *   (cb) => {
   *       require(['<module>'], cb);
   *   }
   *
   * @param {Promise} prom   a promise which resolves with a React component
   *   which will be displayed as the modal view.
   *
   * @param {Object} props   properties to pass to the displayed
   *    component. (We will also pass an 'onFinished' property.)
   *
   * @param {String} className   CSS class to apply to the modal wrapper
   *
   * @param {boolean} isPriorityModal if true, this modal will be displayed regardless
   *                                  of other modals that are currently in the stack.
   *                                  Also, when closed, all modals will be removed
   *                                  from the stack.
   * @param {boolean} isStaticModal  if true, this modal will be displayed under other
   *                                 modals in the stack. When closed, all modals will
   *                                 also be removed from the stack. This is not compatible
   *                                 with being a priority modal. Only one modal can be
   *                                 static at a time.
   * @param {Object} options? extra options for the dialog
   * @param {onBeforeClose} options.onBeforeClose a callback to decide whether to close the dialog
   * @returns {object} Object with 'close' parameter being a function that will close the dialog
   */


  createDialogAsync(prom, props, className) {
    let isPriorityModal = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;
    let isStaticModal = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : false;
    let options = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : {};
    const {
      modal,
      closeDialog,
      onFinishedProm
    } = this.buildModal(prom, props, className, options);

    if (isPriorityModal) {
      // XXX: This is destructive
      this.priorityModal = modal;
    } else if (isStaticModal) {
      // This is intentionally destructive
      this.staticModal = modal;
    } else {
      this.modals.unshift(modal);
    }

    this.reRender();
    return {
      close: closeDialog,
      finished: onFinishedProm
    };
  }

  appendDialogAsync(prom, props, className) {
    const {
      modal,
      closeDialog,
      onFinishedProm
    } = this.buildModal(prom, props, className, {});
    this.modals.push(modal);
    this.reRender();
    return {
      close: closeDialog,
      finished: onFinishedProm
    };
  }

  getCurrentModal() {
    return this.priorityModal ? this.priorityModal : this.modals[0] || this.staticModal;
  }

  async reRender() {
    // await next tick because sometimes ReactDOM can race with itself and cause the modal to wrongly stick around
    await (0, _utils.sleep)(0);

    if (this.modals.length === 0 && !this.priorityModal && !this.staticModal) {
      // If there is no modal to render, make all of Element available
      // to screen reader users again
      _dispatcher.default.dispatch({
        action: 'aria_unhide_main_app'
      });

      _reactDom.default.unmountComponentAtNode(ModalManager.getOrCreateContainer());

      _reactDom.default.unmountComponentAtNode(ModalManager.getOrCreateStaticContainer());

      return;
    } // Hide the content outside the modal to screen reader users
    // so they won't be able to navigate into it and act on it using
    // screen reader specific features


    _dispatcher.default.dispatch({
      action: 'aria_hide_main_app'
    });

    if (this.staticModal) {
      const classes = (0, _classnames.default)("mx_Dialog_wrapper mx_Dialog_staticWrapper", this.staticModal.className);

      const staticDialog = /*#__PURE__*/_react.default.createElement("div", {
        className: classes
      }, /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_Dialog"
      }, this.staticModal.elem), /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_Dialog_background mx_Dialog_staticBackground",
        onClick: this.onBackgroundClick
      }));

      _reactDom.default.render(staticDialog, ModalManager.getOrCreateStaticContainer());
    } else {
      // This is safe to call repeatedly if we happen to do that
      _reactDom.default.unmountComponentAtNode(ModalManager.getOrCreateStaticContainer());
    }

    const modal = this.getCurrentModal();

    if (modal !== this.staticModal && !modal.hidden) {
      const classes = (0, _classnames.default)("mx_Dialog_wrapper", modal.className, {
        mx_Dialog_wrapperWithStaticUnder: this.staticModal
      });

      const dialog = /*#__PURE__*/_react.default.createElement("div", {
        className: classes
      }, /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_Dialog"
      }, modal.elem), /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_Dialog_background",
        onClick: this.onBackgroundClick
      }));

      setImmediate(() => _reactDom.default.render(dialog, ModalManager.getOrCreateContainer()));
    } else {
      // This is safe to call repeatedly if we happen to do that
      _reactDom.default.unmountComponentAtNode(ModalManager.getOrCreateContainer());
    }
  }

}

exports.ModalManager = ModalManager;

if (!window.singletonModalManager) {
  window.singletonModalManager = new ModalManager();
}

var _default = window.singletonModalManager;
exports.default = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJESUFMT0dfQ09OVEFJTkVSX0lEIiwiU1RBVElDX0RJQUxPR19DT05UQUlORVJfSUQiLCJNb2RhbE1hbmFnZXIiLCJtb2RhbCIsImdldEN1cnJlbnRNb2RhbCIsImNsb3NlUmVhc29uIiwiY2xvc2UiLCJnZXRPckNyZWF0ZUNvbnRhaW5lciIsImNvbnRhaW5lciIsImRvY3VtZW50IiwiZ2V0RWxlbWVudEJ5SWQiLCJjcmVhdGVFbGVtZW50IiwiaWQiLCJib2R5IiwiYXBwZW5kQ2hpbGQiLCJnZXRPckNyZWF0ZVN0YXRpY0NvbnRhaW5lciIsInRvZ2dsZUN1cnJlbnREaWFsb2dWaXNpYmlsaXR5IiwiaGlkZGVuIiwiaGFzRGlhbG9ncyIsInByaW9yaXR5TW9kYWwiLCJzdGF0aWNNb2RhbCIsIm1vZGFscyIsImxlbmd0aCIsImNyZWF0ZURpYWxvZyIsIkVsZW1lbnQiLCJyZXN0IiwiY3JlYXRlRGlhbG9nQXN5bmMiLCJQcm9taXNlIiwicmVzb2x2ZSIsImFwcGVuZERpYWxvZyIsImFwcGVuZERpYWxvZ0FzeW5jIiwiY2xvc2VDdXJyZW50TW9kYWwiLCJyZWFzb24iLCJidWlsZE1vZGFsIiwicHJvbSIsInByb3BzIiwiY2xhc3NOYW1lIiwib3B0aW9ucyIsIm9uRmluaXNoZWQiLCJvbkJlZm9yZUNsb3NlIiwiYmVmb3JlQ2xvc2VQcm9taXNlIiwiZWxlbSIsImNsb3NlRGlhbG9nIiwib25GaW5pc2hlZFByb20iLCJnZXRDbG9zZUZuIiwibW9kYWxDb3VudCIsImNvdW50ZXIiLCJkZWZlcnJlZCIsImRlZmVyIiwic2hvdWxkQ2xvc2UiLCJhcmdzIiwiYXBwbHkiLCJpIiwiaW5kZXhPZiIsInNwbGljZSIsInJlUmVuZGVyIiwicHJvbWlzZSIsImlzUHJpb3JpdHlNb2RhbCIsImlzU3RhdGljTW9kYWwiLCJ1bnNoaWZ0IiwiZmluaXNoZWQiLCJwdXNoIiwic2xlZXAiLCJkaXMiLCJkaXNwYXRjaCIsImFjdGlvbiIsIlJlYWN0RE9NIiwidW5tb3VudENvbXBvbmVudEF0Tm9kZSIsImNsYXNzZXMiLCJjbGFzc05hbWVzIiwic3RhdGljRGlhbG9nIiwib25CYWNrZ3JvdW5kQ2xpY2siLCJyZW5kZXIiLCJteF9EaWFsb2dfd3JhcHBlcldpdGhTdGF0aWNVbmRlciIsImRpYWxvZyIsInNldEltbWVkaWF0ZSIsIndpbmRvdyIsInNpbmdsZXRvbk1vZGFsTWFuYWdlciJdLCJzb3VyY2VzIjpbIi4uL3NyYy9Nb2RhbC50c3giXSwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAyMDE1LCAyMDE2IE9wZW5NYXJrZXQgTHRkXG5Db3B5cmlnaHQgMjAyMCBUaGUgTWF0cml4Lm9yZyBGb3VuZGF0aW9uIEMuSS5DLlxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbmltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCc7XG5pbXBvcnQgUmVhY3RET00gZnJvbSAncmVhY3QtZG9tJztcbmltcG9ydCBjbGFzc05hbWVzIGZyb20gJ2NsYXNzbmFtZXMnO1xuaW1wb3J0IHsgZGVmZXIsIHNsZWVwIH0gZnJvbSBcIm1hdHJpeC1qcy1zZGsvc3JjL3V0aWxzXCI7XG5cbmltcG9ydCBkaXMgZnJvbSAnLi9kaXNwYXRjaGVyL2Rpc3BhdGNoZXInO1xuaW1wb3J0IEFzeW5jV3JhcHBlciBmcm9tICcuL0FzeW5jV3JhcHBlcic7XG5cbmNvbnN0IERJQUxPR19DT05UQUlORVJfSUQgPSBcIm14X0RpYWxvZ19Db250YWluZXJcIjtcbmNvbnN0IFNUQVRJQ19ESUFMT0dfQ09OVEFJTkVSX0lEID0gXCJteF9EaWFsb2dfU3RhdGljQ29udGFpbmVyXCI7XG5cbmV4cG9ydCBpbnRlcmZhY2UgSU1vZGFsPFQgZXh0ZW5kcyBhbnlbXT4ge1xuICAgIGVsZW06IFJlYWN0LlJlYWN0Tm9kZTtcbiAgICBjbGFzc05hbWU/OiBzdHJpbmc7XG4gICAgYmVmb3JlQ2xvc2VQcm9taXNlPzogUHJvbWlzZTxib29sZWFuPjtcbiAgICBjbG9zZVJlYXNvbj86IHN0cmluZztcbiAgICBvbkJlZm9yZUNsb3NlPyhyZWFzb24/OiBzdHJpbmcpOiBQcm9taXNlPGJvb2xlYW4+O1xuICAgIG9uRmluaXNoZWQoLi4uYXJnczogVCk6IHZvaWQ7XG4gICAgY2xvc2UoLi4uYXJnczogVCk6IHZvaWQ7XG4gICAgaGlkZGVuPzogYm9vbGVhbjtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBJSGFuZGxlPFQgZXh0ZW5kcyBhbnlbXT4ge1xuICAgIGZpbmlzaGVkOiBQcm9taXNlPFQ+O1xuICAgIGNsb3NlKC4uLmFyZ3M6IFQpOiB2b2lkO1xufVxuXG5pbnRlcmZhY2UgSVByb3BzPFQgZXh0ZW5kcyBhbnlbXT4ge1xuICAgIG9uRmluaXNoZWQ/KC4uLmFyZ3M6IFQpOiB2b2lkO1xuICAgIC8vIFRPRE8gaW1wcm92ZSB0eXBpbmcgaGVyZSBvbmNlIGFsbCBNb2RhbHMgYXJlIFRTIGFuZCB3ZSBjYW4gZXhoYXVzdGl2ZWx5IGNoZWNrIHRoZSBwcm9wc1xuICAgIFtrZXk6IHN0cmluZ106IGFueTtcbn1cblxuaW50ZXJmYWNlIElPcHRpb25zPFQgZXh0ZW5kcyBhbnlbXT4ge1xuICAgIG9uQmVmb3JlQ2xvc2U/OiBJTW9kYWw8VD5bXCJvbkJlZm9yZUNsb3NlXCJdO1xufVxuXG50eXBlIFBhcmFtZXRlcnNXaXRob3V0Rmlyc3Q8VCBleHRlbmRzICguLi5hcmdzOiBhbnkpID0+IGFueT4gPSBUIGV4dGVuZHMgKGE6IGFueSwgLi4uYXJnczogaW5mZXIgUCkgPT4gYW55ID8gUCA6IG5ldmVyO1xuXG5leHBvcnQgY2xhc3MgTW9kYWxNYW5hZ2VyIHtcbiAgICBwcml2YXRlIGNvdW50ZXIgPSAwO1xuICAgIC8vIFRoZSBtb2RhbCB0byBwcmlvcml0aXNlIG92ZXIgYWxsIG90aGVycy4gSWYgdGhpcyBpcyBzZXQsIG9ubHkgc2hvd1xuICAgIC8vIHRoaXMgbW9kYWwuIFJlbW92ZSBhbGwgb3RoZXIgbW9kYWxzIGZyb20gdGhlIHN0YWNrIHdoZW4gdGhpcyBtb2RhbFxuICAgIC8vIGlzIGNsb3NlZC5cbiAgICBwcml2YXRlIHByaW9yaXR5TW9kYWw6IElNb2RhbDxhbnk+ID0gbnVsbDtcbiAgICAvLyBUaGUgbW9kYWwgdG8ga2VlcCBvcGVuIHVuZGVybmVhdGggb3RoZXIgbW9kYWxzIGlmIHBvc3NpYmxlLiBVc2VmdWxcbiAgICAvLyBmb3IgY2FzZXMgbGlrZSBTZXR0aW5ncyB3aGVyZSB0aGUgbW9kYWwgc2hvdWxkIHJlbWFpbiBvcGVuIHdoaWxlIHRoZVxuICAgIC8vIHVzZXIgaXMgcHJvbXB0ZWQgZm9yIG1vcmUgaW5mb3JtYXRpb24vZXJyb3JzLlxuICAgIHByaXZhdGUgc3RhdGljTW9kYWw6IElNb2RhbDxhbnk+ID0gbnVsbDtcbiAgICAvLyBBIGxpc3Qgb2YgdGhlIG1vZGFscyB3ZSBoYXZlIHN0YWNrZWQgdXAsIHdpdGggdGhlIG1vc3QgcmVjZW50IGF0IFswXVxuICAgIC8vIE5laXRoZXIgdGhlIHN0YXRpYyBub3IgcHJpb3JpdHkgbW9kYWwgd2lsbCBiZSBpbiB0aGlzIGxpc3QuXG4gICAgcHJpdmF0ZSBtb2RhbHM6IElNb2RhbDxhbnk+W10gPSBbXTtcblxuICAgIHByaXZhdGUgc3RhdGljIGdldE9yQ3JlYXRlQ29udGFpbmVyKCkge1xuICAgICAgICBsZXQgY29udGFpbmVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoRElBTE9HX0NPTlRBSU5FUl9JRCk7XG5cbiAgICAgICAgaWYgKCFjb250YWluZXIpIHtcbiAgICAgICAgICAgIGNvbnRhaW5lciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgICAgICAgICBjb250YWluZXIuaWQgPSBESUFMT0dfQ09OVEFJTkVSX0lEO1xuICAgICAgICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChjb250YWluZXIpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGNvbnRhaW5lcjtcbiAgICB9XG5cbiAgICBwcml2YXRlIHN0YXRpYyBnZXRPckNyZWF0ZVN0YXRpY0NvbnRhaW5lcigpIHtcbiAgICAgICAgbGV0IGNvbnRhaW5lciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFNUQVRJQ19ESUFMT0dfQ09OVEFJTkVSX0lEKTtcblxuICAgICAgICBpZiAoIWNvbnRhaW5lcikge1xuICAgICAgICAgICAgY29udGFpbmVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICAgICAgICAgIGNvbnRhaW5lci5pZCA9IFNUQVRJQ19ESUFMT0dfQ09OVEFJTkVSX0lEO1xuICAgICAgICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChjb250YWluZXIpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGNvbnRhaW5lcjtcbiAgICB9XG5cbiAgICBwdWJsaWMgdG9nZ2xlQ3VycmVudERpYWxvZ1Zpc2liaWxpdHkoKSB7XG4gICAgICAgIGNvbnN0IG1vZGFsID0gdGhpcy5nZXRDdXJyZW50TW9kYWwoKTtcbiAgICAgICAgaWYgKCFtb2RhbCkgcmV0dXJuO1xuICAgICAgICBtb2RhbC5oaWRkZW4gPSAhbW9kYWwuaGlkZGVuO1xuICAgIH1cblxuICAgIHB1YmxpYyBoYXNEaWFsb2dzKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5wcmlvcml0eU1vZGFsIHx8IHRoaXMuc3RhdGljTW9kYWwgfHwgdGhpcy5tb2RhbHMubGVuZ3RoID4gMDtcbiAgICB9XG5cbiAgICBwdWJsaWMgY3JlYXRlRGlhbG9nPFQgZXh0ZW5kcyBhbnlbXT4oXG4gICAgICAgIEVsZW1lbnQ6IFJlYWN0LkNvbXBvbmVudFR5cGUsXG4gICAgICAgIC4uLnJlc3Q6IFBhcmFtZXRlcnNXaXRob3V0Rmlyc3Q8TW9kYWxNYW5hZ2VyW1wiY3JlYXRlRGlhbG9nQXN5bmNcIl0+XG4gICAgKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmNyZWF0ZURpYWxvZ0FzeW5jPFQ+KFByb21pc2UucmVzb2x2ZShFbGVtZW50KSwgLi4ucmVzdCk7XG4gICAgfVxuXG4gICAgcHVibGljIGFwcGVuZERpYWxvZzxUIGV4dGVuZHMgYW55W10+KFxuICAgICAgICBFbGVtZW50OiBSZWFjdC5Db21wb25lbnRUeXBlLFxuICAgICAgICAuLi5yZXN0OiBQYXJhbWV0ZXJzV2l0aG91dEZpcnN0PE1vZGFsTWFuYWdlcltcImFwcGVuZERpYWxvZ0FzeW5jXCJdPlxuICAgICkge1xuICAgICAgICByZXR1cm4gdGhpcy5hcHBlbmREaWFsb2dBc3luYzxUPihQcm9taXNlLnJlc29sdmUoRWxlbWVudCksIC4uLnJlc3QpO1xuICAgIH1cblxuICAgIHB1YmxpYyBjbG9zZUN1cnJlbnRNb2RhbChyZWFzb246IHN0cmluZykge1xuICAgICAgICBjb25zdCBtb2RhbCA9IHRoaXMuZ2V0Q3VycmVudE1vZGFsKCk7XG4gICAgICAgIGlmICghbW9kYWwpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBtb2RhbC5jbG9zZVJlYXNvbiA9IHJlYXNvbjtcbiAgICAgICAgbW9kYWwuY2xvc2UoKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGJ1aWxkTW9kYWw8VCBleHRlbmRzIGFueVtdPihcbiAgICAgICAgcHJvbTogUHJvbWlzZTxSZWFjdC5Db21wb25lbnRUeXBlPixcbiAgICAgICAgcHJvcHM/OiBJUHJvcHM8VD4sXG4gICAgICAgIGNsYXNzTmFtZT86IHN0cmluZyxcbiAgICAgICAgb3B0aW9ucz86IElPcHRpb25zPFQ+LFxuICAgICkge1xuICAgICAgICBjb25zdCBtb2RhbDogSU1vZGFsPFQ+ID0ge1xuICAgICAgICAgICAgb25GaW5pc2hlZDogcHJvcHMgPyBwcm9wcy5vbkZpbmlzaGVkIDogbnVsbCxcbiAgICAgICAgICAgIG9uQmVmb3JlQ2xvc2U6IG9wdGlvbnMub25CZWZvcmVDbG9zZSxcbiAgICAgICAgICAgIGJlZm9yZUNsb3NlUHJvbWlzZTogbnVsbCxcbiAgICAgICAgICAgIGNsb3NlUmVhc29uOiBudWxsLFxuICAgICAgICAgICAgY2xhc3NOYW1lLFxuXG4gICAgICAgICAgICAvLyB0aGVzZSB3aWxsIGJlIHNldCBiZWxvdyBidXQgd2UgbmVlZCBhbiBvYmplY3QgcmVmZXJlbmNlIHRvIHBhc3MgdG8gZ2V0Q2xvc2VGbiBiZWZvcmUgd2UgY2FuIGRvIHRoYXRcbiAgICAgICAgICAgIGVsZW06IG51bGwsXG4gICAgICAgICAgICBjbG9zZTogbnVsbCxcbiAgICAgICAgfTtcblxuICAgICAgICAvLyBuZXZlciBjYWxsIHRoaXMgZnJvbSBvbkZpbmlzaGVkKCkgb3RoZXJ3aXNlIGl0IHdpbGwgbG9vcFxuICAgICAgICBjb25zdCBbY2xvc2VEaWFsb2csIG9uRmluaXNoZWRQcm9tXSA9IHRoaXMuZ2V0Q2xvc2VGbjxUPihtb2RhbCwgcHJvcHMpO1xuXG4gICAgICAgIC8vIGRvbid0IGF0dGVtcHQgdG8gcmV1c2UgdGhlIHNhbWUgQXN5bmNXcmFwcGVyIGZvciBkaWZmZXJlbnQgZGlhbG9ncyxcbiAgICAgICAgLy8gb3RoZXJ3aXNlIHdlJ2xsIGdldCBjb25mdXNlZC5cbiAgICAgICAgY29uc3QgbW9kYWxDb3VudCA9IHRoaXMuY291bnRlcisrO1xuXG4gICAgICAgIC8vIEZJWE1FOiBJZiBhIGRpYWxvZyB1c2VzIGdldERlZmF1bHRQcm9wcyBpdCBjbG9iYmVycyB0aGUgb25GaW5pc2hlZFxuICAgICAgICAvLyBwcm9wZXJ0eSBzZXQgaGVyZSBzbyB5b3UgY2FuJ3QgY2xvc2UgdGhlIGRpYWxvZyBmcm9tIGEgYnV0dG9uIGNsaWNrIVxuICAgICAgICBtb2RhbC5lbGVtID0gPEFzeW5jV3JhcHBlciBrZXk9e21vZGFsQ291bnR9IHByb209e3Byb219IHsuLi5wcm9wc30gb25GaW5pc2hlZD17Y2xvc2VEaWFsb2d9IC8+O1xuICAgICAgICBtb2RhbC5jbG9zZSA9IGNsb3NlRGlhbG9nO1xuXG4gICAgICAgIHJldHVybiB7IG1vZGFsLCBjbG9zZURpYWxvZywgb25GaW5pc2hlZFByb20gfTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGdldENsb3NlRm48VCBleHRlbmRzIGFueVtdPihcbiAgICAgICAgbW9kYWw6IElNb2RhbDxUPixcbiAgICAgICAgcHJvcHM6IElQcm9wczxUPixcbiAgICApOiBbSUhhbmRsZTxUPltcImNsb3NlXCJdLCBJSGFuZGxlPFQ+W1wiZmluaXNoZWRcIl1dIHtcbiAgICAgICAgY29uc3QgZGVmZXJyZWQgPSBkZWZlcjxUPigpO1xuICAgICAgICByZXR1cm4gW2FzeW5jICguLi5hcmdzOiBUKSA9PiB7XG4gICAgICAgICAgICBpZiAobW9kYWwuYmVmb3JlQ2xvc2VQcm9taXNlKSB7XG4gICAgICAgICAgICAgICAgYXdhaXQgbW9kYWwuYmVmb3JlQ2xvc2VQcm9taXNlO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChtb2RhbC5vbkJlZm9yZUNsb3NlKSB7XG4gICAgICAgICAgICAgICAgbW9kYWwuYmVmb3JlQ2xvc2VQcm9taXNlID0gbW9kYWwub25CZWZvcmVDbG9zZShtb2RhbC5jbG9zZVJlYXNvbik7XG4gICAgICAgICAgICAgICAgY29uc3Qgc2hvdWxkQ2xvc2UgPSBhd2FpdCBtb2RhbC5iZWZvcmVDbG9zZVByb21pc2U7XG4gICAgICAgICAgICAgICAgbW9kYWwuYmVmb3JlQ2xvc2VQcm9taXNlID0gbnVsbDtcbiAgICAgICAgICAgICAgICBpZiAoIXNob3VsZENsb3NlKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKGFyZ3MpO1xuICAgICAgICAgICAgaWYgKHByb3BzICYmIHByb3BzLm9uRmluaXNoZWQpIHByb3BzLm9uRmluaXNoZWQuYXBwbHkobnVsbCwgYXJncyk7XG4gICAgICAgICAgICBjb25zdCBpID0gdGhpcy5tb2RhbHMuaW5kZXhPZihtb2RhbCk7XG4gICAgICAgICAgICBpZiAoaSA+PSAwKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5tb2RhbHMuc3BsaWNlKGksIDEpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAodGhpcy5wcmlvcml0eU1vZGFsID09PSBtb2RhbCkge1xuICAgICAgICAgICAgICAgIHRoaXMucHJpb3JpdHlNb2RhbCA9IG51bGw7XG5cbiAgICAgICAgICAgICAgICAvLyBYWFg6IFRoaXMgaXMgZGVzdHJ1Y3RpdmVcbiAgICAgICAgICAgICAgICB0aGlzLm1vZGFscyA9IFtdO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAodGhpcy5zdGF0aWNNb2RhbCA9PT0gbW9kYWwpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnN0YXRpY01vZGFsID0gbnVsbDtcblxuICAgICAgICAgICAgICAgIC8vIFhYWDogVGhpcyBpcyBkZXN0cnVjdGl2ZVxuICAgICAgICAgICAgICAgIHRoaXMubW9kYWxzID0gW107XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoaXMucmVSZW5kZXIoKTtcbiAgICAgICAgfSwgZGVmZXJyZWQucHJvbWlzZV07XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQGNhbGxiYWNrIG9uQmVmb3JlQ2xvc2VcbiAgICAgKiBAcGFyYW0ge3N0cmluZz99IHJlYXNvbiBlaXRoZXIgXCJiYWNrZ3JvdW5kQ2xpY2tcIiBvciBudWxsXG4gICAgICogQHJldHVybiB7UHJvbWlzZTxib29sPn0gd2hldGhlciB0aGUgZGlhbG9nIHNob3VsZCBjbG9zZVxuICAgICAqL1xuXG4gICAgLyoqXG4gICAgICogT3BlbiBhIG1vZGFsIHZpZXcuXG4gICAgICpcbiAgICAgKiBUaGlzIGNhbiBiZSB1c2VkIHRvIGRpc3BsYXkgYSByZWFjdCBjb21wb25lbnQgd2hpY2ggaXMgbG9hZGVkIGFzIGFuIGFzeW5jaHJvbm91c1xuICAgICAqIHdlYnBhY2sgY29tcG9uZW50LiBUbyBkbyB0aGlzLCBzZXQgJ2xvYWRlcicgYXM6XG4gICAgICpcbiAgICAgKiAgIChjYikgPT4ge1xuICAgICAqICAgICAgIHJlcXVpcmUoWyc8bW9kdWxlPiddLCBjYik7XG4gICAgICogICB9XG4gICAgICpcbiAgICAgKiBAcGFyYW0ge1Byb21pc2V9IHByb20gICBhIHByb21pc2Ugd2hpY2ggcmVzb2x2ZXMgd2l0aCBhIFJlYWN0IGNvbXBvbmVudFxuICAgICAqICAgd2hpY2ggd2lsbCBiZSBkaXNwbGF5ZWQgYXMgdGhlIG1vZGFsIHZpZXcuXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gcHJvcHMgICBwcm9wZXJ0aWVzIHRvIHBhc3MgdG8gdGhlIGRpc3BsYXllZFxuICAgICAqICAgIGNvbXBvbmVudC4gKFdlIHdpbGwgYWxzbyBwYXNzIGFuICdvbkZpbmlzaGVkJyBwcm9wZXJ0eS4pXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gY2xhc3NOYW1lICAgQ1NTIGNsYXNzIHRvIGFwcGx5IHRvIHRoZSBtb2RhbCB3cmFwcGVyXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IGlzUHJpb3JpdHlNb2RhbCBpZiB0cnVlLCB0aGlzIG1vZGFsIHdpbGwgYmUgZGlzcGxheWVkIHJlZ2FyZGxlc3NcbiAgICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvZiBvdGhlciBtb2RhbHMgdGhhdCBhcmUgY3VycmVudGx5IGluIHRoZSBzdGFjay5cbiAgICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBBbHNvLCB3aGVuIGNsb3NlZCwgYWxsIG1vZGFscyB3aWxsIGJlIHJlbW92ZWRcbiAgICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmcm9tIHRoZSBzdGFjay5cbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IGlzU3RhdGljTW9kYWwgIGlmIHRydWUsIHRoaXMgbW9kYWwgd2lsbCBiZSBkaXNwbGF5ZWQgdW5kZXIgb3RoZXJcbiAgICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1vZGFscyBpbiB0aGUgc3RhY2suIFdoZW4gY2xvc2VkLCBhbGwgbW9kYWxzIHdpbGxcbiAgICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFsc28gYmUgcmVtb3ZlZCBmcm9tIHRoZSBzdGFjay4gVGhpcyBpcyBub3QgY29tcGF0aWJsZVxuICAgICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgd2l0aCBiZWluZyBhIHByaW9yaXR5IG1vZGFsLiBPbmx5IG9uZSBtb2RhbCBjYW4gYmVcbiAgICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0YXRpYyBhdCBhIHRpbWUuXG4gICAgICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnM/IGV4dHJhIG9wdGlvbnMgZm9yIHRoZSBkaWFsb2dcbiAgICAgKiBAcGFyYW0ge29uQmVmb3JlQ2xvc2V9IG9wdGlvbnMub25CZWZvcmVDbG9zZSBhIGNhbGxiYWNrIHRvIGRlY2lkZSB3aGV0aGVyIHRvIGNsb3NlIHRoZSBkaWFsb2dcbiAgICAgKiBAcmV0dXJucyB7b2JqZWN0fSBPYmplY3Qgd2l0aCAnY2xvc2UnIHBhcmFtZXRlciBiZWluZyBhIGZ1bmN0aW9uIHRoYXQgd2lsbCBjbG9zZSB0aGUgZGlhbG9nXG4gICAgICovXG4gICAgcHVibGljIGNyZWF0ZURpYWxvZ0FzeW5jPFQgZXh0ZW5kcyBhbnlbXT4oXG4gICAgICAgIHByb206IFByb21pc2U8UmVhY3QuQ29tcG9uZW50VHlwZT4sXG4gICAgICAgIHByb3BzPzogSVByb3BzPFQ+LFxuICAgICAgICBjbGFzc05hbWU/OiBzdHJpbmcsXG4gICAgICAgIGlzUHJpb3JpdHlNb2RhbCA9IGZhbHNlLFxuICAgICAgICBpc1N0YXRpY01vZGFsID0gZmFsc2UsXG4gICAgICAgIG9wdGlvbnM6IElPcHRpb25zPFQ+ID0ge30sXG4gICAgKTogSUhhbmRsZTxUPiB7XG4gICAgICAgIGNvbnN0IHsgbW9kYWwsIGNsb3NlRGlhbG9nLCBvbkZpbmlzaGVkUHJvbSB9ID0gdGhpcy5idWlsZE1vZGFsPFQ+KHByb20sIHByb3BzLCBjbGFzc05hbWUsIG9wdGlvbnMpO1xuICAgICAgICBpZiAoaXNQcmlvcml0eU1vZGFsKSB7XG4gICAgICAgICAgICAvLyBYWFg6IFRoaXMgaXMgZGVzdHJ1Y3RpdmVcbiAgICAgICAgICAgIHRoaXMucHJpb3JpdHlNb2RhbCA9IG1vZGFsO1xuICAgICAgICB9IGVsc2UgaWYgKGlzU3RhdGljTW9kYWwpIHtcbiAgICAgICAgICAgIC8vIFRoaXMgaXMgaW50ZW50aW9uYWxseSBkZXN0cnVjdGl2ZVxuICAgICAgICAgICAgdGhpcy5zdGF0aWNNb2RhbCA9IG1vZGFsO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5tb2RhbHMudW5zaGlmdChtb2RhbCk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLnJlUmVuZGVyKCk7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBjbG9zZTogY2xvc2VEaWFsb2csXG4gICAgICAgICAgICBmaW5pc2hlZDogb25GaW5pc2hlZFByb20sXG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBhcHBlbmREaWFsb2dBc3luYzxUIGV4dGVuZHMgYW55W10+KFxuICAgICAgICBwcm9tOiBQcm9taXNlPFJlYWN0LkNvbXBvbmVudFR5cGU+LFxuICAgICAgICBwcm9wcz86IElQcm9wczxUPixcbiAgICAgICAgY2xhc3NOYW1lPzogc3RyaW5nLFxuICAgICk6IElIYW5kbGU8VD4ge1xuICAgICAgICBjb25zdCB7IG1vZGFsLCBjbG9zZURpYWxvZywgb25GaW5pc2hlZFByb20gfSA9IHRoaXMuYnVpbGRNb2RhbDxUPihwcm9tLCBwcm9wcywgY2xhc3NOYW1lLCB7fSk7XG5cbiAgICAgICAgdGhpcy5tb2RhbHMucHVzaChtb2RhbCk7XG4gICAgICAgIHRoaXMucmVSZW5kZXIoKTtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGNsb3NlOiBjbG9zZURpYWxvZyxcbiAgICAgICAgICAgIGZpbmlzaGVkOiBvbkZpbmlzaGVkUHJvbSxcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBwcml2YXRlIG9uQmFja2dyb3VuZENsaWNrID0gKCkgPT4ge1xuICAgICAgICBjb25zdCBtb2RhbCA9IHRoaXMuZ2V0Q3VycmVudE1vZGFsKCk7XG4gICAgICAgIGlmICghbW9kYWwpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICAvLyB3ZSB3YW50IHRvIHBhc3MgYSByZWFzb24gdG8gdGhlIG9uQmVmb3JlQ2xvc2VcbiAgICAgICAgLy8gY2FsbGJhY2ssIGJ1dCBjbG9zZSBpcyBjdXJyZW50bHkgZGVmaW5lZCB0b1xuICAgICAgICAvLyBwYXNzIGFsbCBudW1iZXIgb2YgYXJndW1lbnRzIHRvIHRoZSBvbkZpbmlzaGVkIGNhbGxiYWNrXG4gICAgICAgIC8vIHNvLCBwYXNzIHRoZSByZWFzb24gdG8gY2xvc2UgdGhyb3VnaCBhIG1lbWJlciB2YXJpYWJsZVxuICAgICAgICBtb2RhbC5jbG9zZVJlYXNvbiA9IFwiYmFja2dyb3VuZENsaWNrXCI7XG4gICAgICAgIG1vZGFsLmNsb3NlKCk7XG4gICAgICAgIG1vZGFsLmNsb3NlUmVhc29uID0gbnVsbDtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBnZXRDdXJyZW50TW9kYWwoKTogSU1vZGFsPGFueT4ge1xuICAgICAgICByZXR1cm4gdGhpcy5wcmlvcml0eU1vZGFsID8gdGhpcy5wcmlvcml0eU1vZGFsIDogKHRoaXMubW9kYWxzWzBdIHx8IHRoaXMuc3RhdGljTW9kYWwpO1xuICAgIH1cblxuICAgIHByaXZhdGUgYXN5bmMgcmVSZW5kZXIoKSB7XG4gICAgICAgIC8vIGF3YWl0IG5leHQgdGljayBiZWNhdXNlIHNvbWV0aW1lcyBSZWFjdERPTSBjYW4gcmFjZSB3aXRoIGl0c2VsZiBhbmQgY2F1c2UgdGhlIG1vZGFsIHRvIHdyb25nbHkgc3RpY2sgYXJvdW5kXG4gICAgICAgIGF3YWl0IHNsZWVwKDApO1xuXG4gICAgICAgIGlmICh0aGlzLm1vZGFscy5sZW5ndGggPT09IDAgJiYgIXRoaXMucHJpb3JpdHlNb2RhbCAmJiAhdGhpcy5zdGF0aWNNb2RhbCkge1xuICAgICAgICAgICAgLy8gSWYgdGhlcmUgaXMgbm8gbW9kYWwgdG8gcmVuZGVyLCBtYWtlIGFsbCBvZiBFbGVtZW50IGF2YWlsYWJsZVxuICAgICAgICAgICAgLy8gdG8gc2NyZWVuIHJlYWRlciB1c2VycyBhZ2FpblxuICAgICAgICAgICAgZGlzLmRpc3BhdGNoKHtcbiAgICAgICAgICAgICAgICBhY3Rpb246ICdhcmlhX3VuaGlkZV9tYWluX2FwcCcsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIFJlYWN0RE9NLnVubW91bnRDb21wb25lbnRBdE5vZGUoTW9kYWxNYW5hZ2VyLmdldE9yQ3JlYXRlQ29udGFpbmVyKCkpO1xuICAgICAgICAgICAgUmVhY3RET00udW5tb3VudENvbXBvbmVudEF0Tm9kZShNb2RhbE1hbmFnZXIuZ2V0T3JDcmVhdGVTdGF0aWNDb250YWluZXIoKSk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICAvLyBIaWRlIHRoZSBjb250ZW50IG91dHNpZGUgdGhlIG1vZGFsIHRvIHNjcmVlbiByZWFkZXIgdXNlcnNcbiAgICAgICAgLy8gc28gdGhleSB3b24ndCBiZSBhYmxlIHRvIG5hdmlnYXRlIGludG8gaXQgYW5kIGFjdCBvbiBpdCB1c2luZ1xuICAgICAgICAvLyBzY3JlZW4gcmVhZGVyIHNwZWNpZmljIGZlYXR1cmVzXG4gICAgICAgIGRpcy5kaXNwYXRjaCh7XG4gICAgICAgICAgICBhY3Rpb246ICdhcmlhX2hpZGVfbWFpbl9hcHAnLFxuICAgICAgICB9KTtcblxuICAgICAgICBpZiAodGhpcy5zdGF0aWNNb2RhbCkge1xuICAgICAgICAgICAgY29uc3QgY2xhc3NlcyA9IGNsYXNzTmFtZXMoXCJteF9EaWFsb2dfd3JhcHBlciBteF9EaWFsb2dfc3RhdGljV3JhcHBlclwiLCB0aGlzLnN0YXRpY01vZGFsLmNsYXNzTmFtZSk7XG5cbiAgICAgICAgICAgIGNvbnN0IHN0YXRpY0RpYWxvZyA9IChcbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT17Y2xhc3Nlc30+XG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfRGlhbG9nXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICB7IHRoaXMuc3RhdGljTW9kYWwuZWxlbSB9XG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X0RpYWxvZ19iYWNrZ3JvdW5kIG14X0RpYWxvZ19zdGF0aWNCYWNrZ3JvdW5kXCIgb25DbGljaz17dGhpcy5vbkJhY2tncm91bmRDbGlja30gLz5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICk7XG5cbiAgICAgICAgICAgIFJlYWN0RE9NLnJlbmRlcihzdGF0aWNEaWFsb2csIE1vZGFsTWFuYWdlci5nZXRPckNyZWF0ZVN0YXRpY0NvbnRhaW5lcigpKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIFRoaXMgaXMgc2FmZSB0byBjYWxsIHJlcGVhdGVkbHkgaWYgd2UgaGFwcGVuIHRvIGRvIHRoYXRcbiAgICAgICAgICAgIFJlYWN0RE9NLnVubW91bnRDb21wb25lbnRBdE5vZGUoTW9kYWxNYW5hZ2VyLmdldE9yQ3JlYXRlU3RhdGljQ29udGFpbmVyKCkpO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgbW9kYWwgPSB0aGlzLmdldEN1cnJlbnRNb2RhbCgpO1xuICAgICAgICBpZiAobW9kYWwgIT09IHRoaXMuc3RhdGljTW9kYWwgJiYgIW1vZGFsLmhpZGRlbikge1xuICAgICAgICAgICAgY29uc3QgY2xhc3NlcyA9IGNsYXNzTmFtZXMoXCJteF9EaWFsb2dfd3JhcHBlclwiLCBtb2RhbC5jbGFzc05hbWUsIHtcbiAgICAgICAgICAgICAgICBteF9EaWFsb2dfd3JhcHBlcldpdGhTdGF0aWNVbmRlcjogdGhpcy5zdGF0aWNNb2RhbCxcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBjb25zdCBkaWFsb2cgPSAoXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9e2NsYXNzZXN9PlxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X0RpYWxvZ1wiPlxuICAgICAgICAgICAgICAgICAgICAgICAgeyBtb2RhbC5lbGVtIH1cbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfRGlhbG9nX2JhY2tncm91bmRcIiBvbkNsaWNrPXt0aGlzLm9uQmFja2dyb3VuZENsaWNrfSAvPlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgKTtcblxuICAgICAgICAgICAgc2V0SW1tZWRpYXRlKCgpID0+IFJlYWN0RE9NLnJlbmRlcihkaWFsb2csIE1vZGFsTWFuYWdlci5nZXRPckNyZWF0ZUNvbnRhaW5lcigpKSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBUaGlzIGlzIHNhZmUgdG8gY2FsbCByZXBlYXRlZGx5IGlmIHdlIGhhcHBlbiB0byBkbyB0aGF0XG4gICAgICAgICAgICBSZWFjdERPTS51bm1vdW50Q29tcG9uZW50QXROb2RlKE1vZGFsTWFuYWdlci5nZXRPckNyZWF0ZUNvbnRhaW5lcigpKTtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuaWYgKCF3aW5kb3cuc2luZ2xldG9uTW9kYWxNYW5hZ2VyKSB7XG4gICAgd2luZG93LnNpbmdsZXRvbk1vZGFsTWFuYWdlciA9IG5ldyBNb2RhbE1hbmFnZXIoKTtcbn1cbmV4cG9ydCBkZWZhdWx0IHdpbmRvdy5zaW5nbGV0b25Nb2RhbE1hbmFnZXI7XG4iXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7QUFpQkE7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBRUE7O0FBQ0E7O0FBdkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBVUEsTUFBTUEsbUJBQW1CLEdBQUcscUJBQTVCO0FBQ0EsTUFBTUMsMEJBQTBCLEdBQUcsMkJBQW5DOztBQThCTyxNQUFNQyxZQUFOLENBQW1CO0VBQUE7SUFBQSwrQ0FDSixDQURJO0lBQUEscURBS2UsSUFMZjtJQUFBLG1EQVNhLElBVGI7SUFBQSw4Q0FZVSxFQVpWO0lBQUEseURBK05NLE1BQU07TUFDOUIsTUFBTUMsS0FBSyxHQUFHLEtBQUtDLGVBQUwsRUFBZDs7TUFDQSxJQUFJLENBQUNELEtBQUwsRUFBWTtRQUNSO01BQ0gsQ0FKNkIsQ0FLOUI7TUFDQTtNQUNBO01BQ0E7OztNQUNBQSxLQUFLLENBQUNFLFdBQU4sR0FBb0IsaUJBQXBCO01BQ0FGLEtBQUssQ0FBQ0csS0FBTjtNQUNBSCxLQUFLLENBQUNFLFdBQU4sR0FBb0IsSUFBcEI7SUFDSCxDQTNPcUI7RUFBQTs7RUFjYSxPQUFwQkUsb0JBQW9CLEdBQUc7SUFDbEMsSUFBSUMsU0FBUyxHQUFHQyxRQUFRLENBQUNDLGNBQVQsQ0FBd0JW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