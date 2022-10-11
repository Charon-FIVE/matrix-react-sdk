"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireDefault(require("react"));

var _classnames = _interopRequireDefault(require("classnames"));

var _reResizable = require("re-resizable");

var _AppTile = _interopRequireDefault(require("../elements/AppTile"));

var _dispatcher = _interopRequireDefault(require("../../../dispatcher/dispatcher"));

var ScalarMessaging = _interopRequireWildcard(require("../../../ScalarMessaging"));

var _WidgetUtils = _interopRequireDefault(require("../../../utils/WidgetUtils"));

var _WidgetEchoStore = _interopRequireDefault(require("../../../stores/WidgetEchoStore"));

var _ResizeHandle = _interopRequireDefault(require("../elements/ResizeHandle"));

var _resizer = _interopRequireDefault(require("../../../resizer/resizer"));

var _percentage = _interopRequireDefault(require("../../../resizer/distributors/percentage"));

var _WidgetLayoutStore = require("../../../stores/widgets/WidgetLayoutStore");

var _numbers = require("../../../utils/numbers");

var _useStateCallback = require("../../../hooks/useStateCallback");

var _UIStore = _interopRequireDefault(require("../../../stores/UIStore"));

var _Spinner = _interopRequireDefault(require("../elements/Spinner"));

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

/*
Copyright 2017 Vector Creations Ltd
Copyright 2018 New Vector Ltd

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
class AppsDrawer extends _react.default.Component {
  constructor(props) {
    super(props);
    (0, _defineProperty2.default)(this, "unmounted", false);
    (0, _defineProperty2.default)(this, "resizeContainer", void 0);
    (0, _defineProperty2.default)(this, "resizer", void 0);
    (0, _defineProperty2.default)(this, "dispatcherRef", void 0);
    (0, _defineProperty2.default)(this, "onIsResizing", resizing => {
      // This one is the vertical, ie. change height of apps drawer
      this.setState({
        resizingVertical: resizing
      });

      if (!resizing) {
        this.relaxResizer();
      }
    });
    (0, _defineProperty2.default)(this, "collectResizer", ref => {
      if (this.resizeContainer) {
        this.resizer.detach();
      }

      if (ref) {
        this.resizer.container = ref;
        this.resizer.attach();
      }

      this.resizeContainer = ref;
      this.loadResizerPreferences();
    });
    (0, _defineProperty2.default)(this, "getAppsHash", apps => apps.map(app => app.id).join("~"));
    (0, _defineProperty2.default)(this, "relaxResizer", () => {
      const distributors = this.resizer.getDistributors(); // relax all items if they had any overconstrained flexboxes

      distributors.forEach(d => d.start());
      distributors.forEach(d => d.finish());
    });
    (0, _defineProperty2.default)(this, "loadResizerPreferences", () => {
      const distributions = _WidgetLayoutStore.WidgetLayoutStore.instance.getResizerDistributions(this.props.room, _WidgetLayoutStore.Container.Top);

      if (this.state.apps && this.topApps().length - 1 === distributions.length) {
        distributions.forEach((size, i) => {
          const distributor = this.resizer.forHandleAt(i);

          if (distributor) {
            distributor.size = size;
            distributor.finish();
          }
        });
      } else if (this.state.apps) {
        const distributors = this.resizer.getDistributors();
        distributors.forEach(d => d.item.clearSize());
        distributors.forEach(d => d.start());
        distributors.forEach(d => d.finish());
      }
    });
    (0, _defineProperty2.default)(this, "onAction", action => {
      const hideWidgetKey = this.props.room.roomId + '_hide_widget_drawer';

      switch (action.action) {
        case "appsDrawer":
          // Note: these booleans are awkward because localstorage is fundamentally
          // string-based. We also do exact equality on the strings later on.
          if (action.show) {
            localStorage.setItem(hideWidgetKey, "false");
          } else {
            // Store hidden state of widget
            // Don't show if previously hidden
            localStorage.setItem(hideWidgetKey, "true");
          }

          break;
      }
    });
    (0, _defineProperty2.default)(this, "getApps", () => {
      // @ts-ignore
      const appsDict = {};
      appsDict[_WidgetLayoutStore.Container.Top] = _WidgetLayoutStore.WidgetLayoutStore.instance.getContainerWidgets(this.props.room, _WidgetLayoutStore.Container.Top);
      appsDict[_WidgetLayoutStore.Container.Center] = _WidgetLayoutStore.WidgetLayoutStore.instance.getContainerWidgets(this.props.room, _WidgetLayoutStore.Container.Center);
      return appsDict;
    });
    (0, _defineProperty2.default)(this, "topApps", () => this.state.apps[_WidgetLayoutStore.Container.Top]);
    (0, _defineProperty2.default)(this, "centerApps", () => this.state.apps[_WidgetLayoutStore.Container.Center]);
    (0, _defineProperty2.default)(this, "updateApps", () => {
      if (this.unmounted) return;
      this.setState({
        apps: this.getApps()
      });
    });
    this.state = {
      apps: this.getApps(),
      resizingVertical: false,
      resizingHorizontal: false,
      resizing: false
    };
    this.resizer = this.createResizer();
    this.props.resizeNotifier.on("isResizing", this.onIsResizing);
  }

  componentDidMount() {
    ScalarMessaging.startListening();

    _WidgetLayoutStore.WidgetLayoutStore.instance.on(_WidgetLayoutStore.WidgetLayoutStore.emissionForRoom(this.props.room), this.updateApps);

    this.dispatcherRef = _dispatcher.default.register(this.onAction);
  }

  componentWillUnmount() {
    this.unmounted = true;
    ScalarMessaging.stopListening();

    _WidgetLayoutStore.WidgetLayoutStore.instance.off(_WidgetLayoutStore.WidgetLayoutStore.emissionForRoom(this.props.room), this.updateApps);

    if (this.dispatcherRef) _dispatcher.default.unregister(this.dispatcherRef);

    if (this.resizeContainer) {
      this.resizer.detach();
    }

    this.props.resizeNotifier.off("isResizing", this.onIsResizing);
  }

  createResizer() {
    // This is the horizontal one, changing the distribution of the width between the app tiles
    // (ie. a vertical resize handle because, the handle itself is vertical...)
    const classNames = {
      handle: "mx_ResizeHandle",
      vertical: "mx_ResizeHandle_vertical",
      reverse: "mx_ResizeHandle_reverse"
    };
    const collapseConfig = {
      onResizeStart: () => {
        this.resizeContainer.classList.add("mx_AppsDrawer_resizing");
        this.setState({
          resizingHorizontal: true
        });
      },
      onResizeStop: () => {
        this.resizeContainer.classList.remove("mx_AppsDrawer_resizing");

        _WidgetLayoutStore.WidgetLayoutStore.instance.setResizerDistributions(this.props.room, _WidgetLayoutStore.Container.Top, this.topApps().slice(1).map((_, i) => this.resizer.forHandleAt(i).size));

        this.setState({
          resizingHorizontal: false
        });
      }
    }; // pass a truthy container for now, we won't call attach until we update it

    const resizer = new _resizer.default(null, _percentage.default, collapseConfig);
    resizer.setClassNames(classNames);
    return resizer;
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.userId !== this.props.userId || prevProps.room !== this.props.room) {
      // Room has changed, update apps
      this.updateApps();
    } else if (this.getAppsHash(this.topApps()) !== this.getAppsHash(prevState.apps[_WidgetLayoutStore.Container.Top])) {
      this.loadResizerPreferences();
    }
  }

  isResizing() {
    return this.state.resizingVertical || this.state.resizingHorizontal;
  }

  render() {
    if (!this.props.showApps) return /*#__PURE__*/_react.default.createElement("div", null);
    const widgetIsMaxmised = this.centerApps().length > 0;
    const appsToDisplay = widgetIsMaxmised ? this.centerApps() : this.topApps();
    const apps = appsToDisplay.map((app, index, arr) => {
      return /*#__PURE__*/_react.default.createElement(_AppTile.default, {
        key: app.id,
        app: app,
        fullWidth: arr.length < 2,
        room: this.props.room,
        userId: this.props.userId,
        creatorUserId: app.creatorUserId,
        widgetPageTitle: _WidgetUtils.default.getWidgetDataTitle(app),
        waitForIframeLoad: app.waitForIframeLoad,
        pointerEvents: this.isResizing() ? 'none' : undefined
      });
    });

    if (apps.length === 0) {
      return /*#__PURE__*/_react.default.createElement("div", null);
    }

    let spinner;

    if (apps.length === 0 && _WidgetEchoStore.default.roomHasPendingWidgets(this.props.room.roomId, _WidgetUtils.default.getRoomWidgets(this.props.room))) {
      spinner = /*#__PURE__*/_react.default.createElement(_Spinner.default, null);
    }

    const classes = (0, _classnames.default)({
      mx_AppsDrawer: true,
      mx_AppsDrawer_maximise: widgetIsMaxmised,
      mx_AppsDrawer_fullWidth: apps.length < 2,
      mx_AppsDrawer_resizing: this.state.resizing,
      mx_AppsDrawer_2apps: apps.length === 2,
      mx_AppsDrawer_3apps: apps.length === 3
    });

    const appContainers = /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_AppsContainer",
      ref: this.collectResizer
    }, apps.map((app, i) => {
      if (i < 1) return app;
      return /*#__PURE__*/_react.default.createElement(_react.default.Fragment, {
        key: app.key
      }, /*#__PURE__*/_react.default.createElement(_ResizeHandle.default, {
        reverse: i > apps.length / 2
      }), app);
    }));

    let drawer;

    if (widgetIsMaxmised) {
      drawer = appContainers;
    } else {
      drawer = /*#__PURE__*/_react.default.createElement(PersistentVResizer, {
        room: this.props.room,
        minHeight: 100,
        maxHeight: this.props.maxHeight - 50,
        handleClass: "mx_AppsContainer_resizerHandle",
        handleWrapperClass: "mx_AppsContainer_resizerHandleContainer",
        className: "mx_AppsContainer_resizer",
        resizeNotifier: this.props.resizeNotifier
      }, appContainers);
    }

    return /*#__PURE__*/_react.default.createElement("div", {
      className: classes
    }, drawer, spinner);
  }

}

exports.default = AppsDrawer;
(0, _defineProperty2.default)(AppsDrawer, "defaultProps", {
  showApps: true
});

const PersistentVResizer = _ref => {
  let {
    room,
    minHeight,
    maxHeight,
    className,
    handleWrapperClass,
    handleClass,
    resizeNotifier,
    children
  } = _ref;

  let defaultHeight = _WidgetLayoutStore.WidgetLayoutStore.instance.getContainerHeight(room, _WidgetLayoutStore.Container.Top); // Arbitrary defaults to avoid NaN problems. 100 px or 3/4 of the visible window.


  if (!minHeight) minHeight = 100;
  if (!maxHeight) maxHeight = _UIStore.default.instance.windowHeight / 4 * 3; // Convert from percentage to height. Note that the default height is 280px.

  if (defaultHeight) {
    defaultHeight = (0, _numbers.clamp)(defaultHeight, 0, 100);
    defaultHeight = (0, _numbers.percentageWithin)(defaultHeight / 100, minHeight, maxHeight);
  } else {
    defaultHeight = 280;
  }

  const [height, setHeight] = (0, _useStateCallback.useStateCallback)(defaultHeight, newHeight => {
    newHeight = (0, _numbers.percentageOf)(newHeight, minHeight, maxHeight) * 100;

    _WidgetLayoutStore.WidgetLayoutStore.instance.setContainerHeight(room, _WidgetLayoutStore.Container.Top, newHeight);
  });
  return /*#__PURE__*/_react.default.createElement(_reResizable.Resizable, {
    size: {
      height: Math.min(height, maxHeight),
      width: undefined
    },
    minHeight: minHeight,
    maxHeight: maxHeight,
    onResizeStart: () => {
      resizeNotifier.startResizing();
    },
    onResize: () => {
      resizeNotifier.notifyTimelineHeightChanged();
    },
    onResizeStop: (e, dir, ref, d) => {
      setHeight(height + d.height);
      resizeNotifier.stopResizing();
    },
    handleWrapperClass: handleWrapperClass,
    handleClasses: {
      bottom: handleClass
    },
    className: className,
    enable: {
      bottom: true
    }
  }, children);
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJBcHBzRHJhd2VyIiwiUmVhY3QiLCJDb21wb25lbnQiLCJjb25zdHJ1Y3RvciIsInByb3BzIiwicmVzaXppbmciLCJzZXRTdGF0ZSIsInJlc2l6aW5nVmVydGljYWwiLCJyZWxheFJlc2l6ZXIiLCJyZWYiLCJyZXNpemVDb250YWluZXIiLCJyZXNpemVyIiwiZGV0YWNoIiwiY29udGFpbmVyIiwiYXR0YWNoIiwibG9hZFJlc2l6ZXJQcmVmZXJlbmNlcyIsImFwcHMiLCJtYXAiLCJhcHAiLCJpZCIsImpvaW4iLCJkaXN0cmlidXRvcnMiLCJnZXREaXN0cmlidXRvcnMiLCJmb3JFYWNoIiwiZCIsInN0YXJ0IiwiZmluaXNoIiwiZGlzdHJpYnV0aW9ucyIsIldpZGdldExheW91dFN0b3JlIiwiaW5zdGFuY2UiLCJnZXRSZXNpemVyRGlzdHJpYnV0aW9ucyIsInJvb20iLCJDb250YWluZXIiLCJUb3AiLCJzdGF0ZSIsInRvcEFwcHMiLCJsZW5ndGgiLCJzaXplIiwiaSIsImRpc3RyaWJ1dG9yIiwiZm9ySGFuZGxlQXQiLCJpdGVtIiwiY2xlYXJTaXplIiwiYWN0aW9uIiwiaGlkZVdpZGdldEtleSIsInJvb21JZCIsInNob3ciLCJsb2NhbFN0b3JhZ2UiLCJzZXRJdGVtIiwiYXBwc0RpY3QiLCJnZXRDb250YWluZXJXaWRnZXRzIiwiQ2VudGVyIiwidW5tb3VudGVkIiwiZ2V0QXBwcyIsInJlc2l6aW5nSG9yaXpvbnRhbCIsImNyZWF0ZVJlc2l6ZXIiLCJyZXNpemVOb3RpZmllciIsIm9uIiwib25Jc1Jlc2l6aW5nIiwiY29tcG9uZW50RGlkTW91bnQiLCJTY2FsYXJNZXNzYWdpbmciLCJzdGFydExpc3RlbmluZyIsImVtaXNzaW9uRm9yUm9vbSIsInVwZGF0ZUFwcHMiLCJkaXNwYXRjaGVyUmVmIiwiZGlzIiwicmVnaXN0ZXIiLCJvbkFjdGlvbiIsImNvbXBvbmVudFdpbGxVbm1vdW50Iiwic3RvcExpc3RlbmluZyIsIm9mZiIsInVucmVnaXN0ZXIiLCJjbGFzc05hbWVzIiwiaGFuZGxlIiwidmVydGljYWwiLCJyZXZlcnNlIiwiY29sbGFwc2VDb25maWciLCJvblJlc2l6ZVN0YXJ0IiwiY2xhc3NMaXN0IiwiYWRkIiwib25SZXNpemVTdG9wIiwicmVtb3ZlIiwic2V0UmVzaXplckRpc3RyaWJ1dGlvbnMiLCJzbGljZSIsIl8iLCJSZXNpemVyIiwiUGVyY2VudGFnZURpc3RyaWJ1dG9yIiwic2V0Q2xhc3NOYW1lcyIsImNvbXBvbmVudERpZFVwZGF0ZSIsInByZXZQcm9wcyIsInByZXZTdGF0ZSIsInVzZXJJZCIsImdldEFwcHNIYXNoIiwiaXNSZXNpemluZyIsInJlbmRlciIsInNob3dBcHBzIiwid2lkZ2V0SXNNYXhtaXNlZCIsImNlbnRlckFwcHMiLCJhcHBzVG9EaXNwbGF5IiwiaW5kZXgiLCJhcnIiLCJjcmVhdG9yVXNlcklkIiwiV2lkZ2V0VXRpbHMiLCJnZXRXaWRnZXREYXRhVGl0bGUiLCJ3YWl0Rm9ySWZyYW1lTG9hZCIsInVuZGVmaW5lZCIsInNwaW5uZXIiLCJXaWRnZXRFY2hvU3RvcmUiLCJyb29tSGFzUGVuZGluZ1dpZGdldHMiLCJnZXRSb29tV2lkZ2V0cyIsImNsYXNzZXMiLCJteF9BcHBzRHJhd2VyIiwibXhfQXBwc0RyYXdlcl9tYXhpbWlzZSIsIm14X0FwcHNEcmF3ZXJfZnVsbFdpZHRoIiwibXhfQXBwc0RyYXdlcl9yZXNpemluZyIsIm14X0FwcHNEcmF3ZXJfMmFwcHMiLCJteF9BcHBzRHJhd2VyXzNhcHBzIiwiYXBwQ29udGFpbmVycyIsImNvbGxlY3RSZXNpemVyIiwia2V5IiwiZHJhd2VyIiwibWF4SGVpZ2h0IiwiUGVyc2lzdGVudFZSZXNpemVyIiwibWluSGVpZ2h0IiwiY2xhc3NOYW1lIiwiaGFuZGxlV3JhcHBlckNsYXNzIiwiaGFuZGxlQ2xhc3MiLCJjaGlsZHJlbiIsImRlZmF1bHRIZWlnaHQiLCJnZXRDb250YWluZXJIZWlnaHQiLCJVSVN0b3JlIiwid2luZG93SGVpZ2h0IiwiY2xhbXAiLCJwZXJjZW50YWdlV2l0aGluIiwiaGVpZ2h0Iiwic2V0SGVpZ2h0IiwidXNlU3RhdGVDYWxsYmFjayIsIm5ld0hlaWdodCIsInBlcmNlbnRhZ2VPZiIsInNldENvbnRhaW5lckhlaWdodCIsIk1hdGgiLCJtaW4iLCJ3aWR0aCIsInN0YXJ0UmVzaXppbmciLCJub3RpZnlUaW1lbGluZUhlaWdodENoYW5nZWQiLCJlIiwiZGlyIiwic3RvcFJlc2l6aW5nIiwiYm90dG9tIl0sInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL2NvbXBvbmVudHMvdmlld3Mvcm9vbXMvQXBwc0RyYXdlci50c3giXSwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAyMDE3IFZlY3RvciBDcmVhdGlvbnMgTHRkXG5Db3B5cmlnaHQgMjAxOCBOZXcgVmVjdG9yIEx0ZFxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbmltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCc7XG5pbXBvcnQgY2xhc3NOYW1lcyBmcm9tICdjbGFzc25hbWVzJztcbmltcG9ydCB7IFJlc2l6YWJsZSB9IGZyb20gXCJyZS1yZXNpemFibGVcIjtcbmltcG9ydCB7IFJvb20gfSBmcm9tIFwibWF0cml4LWpzLXNkay9zcmMvbW9kZWxzL3Jvb21cIjtcblxuaW1wb3J0IEFwcFRpbGUgZnJvbSAnLi4vZWxlbWVudHMvQXBwVGlsZSc7XG5pbXBvcnQgZGlzIGZyb20gJy4uLy4uLy4uL2Rpc3BhdGNoZXIvZGlzcGF0Y2hlcic7XG5pbXBvcnQgKiBhcyBTY2FsYXJNZXNzYWdpbmcgZnJvbSAnLi4vLi4vLi4vU2NhbGFyTWVzc2FnaW5nJztcbmltcG9ydCBXaWRnZXRVdGlscyBmcm9tICcuLi8uLi8uLi91dGlscy9XaWRnZXRVdGlscyc7XG5pbXBvcnQgV2lkZ2V0RWNob1N0b3JlIGZyb20gXCIuLi8uLi8uLi9zdG9yZXMvV2lkZ2V0RWNob1N0b3JlXCI7XG5pbXBvcnQgUmVzaXplTm90aWZpZXIgZnJvbSBcIi4uLy4uLy4uL3V0aWxzL1Jlc2l6ZU5vdGlmaWVyXCI7XG5pbXBvcnQgUmVzaXplSGFuZGxlIGZyb20gXCIuLi9lbGVtZW50cy9SZXNpemVIYW5kbGVcIjtcbmltcG9ydCBSZXNpemVyIGZyb20gXCIuLi8uLi8uLi9yZXNpemVyL3Jlc2l6ZXJcIjtcbmltcG9ydCBQZXJjZW50YWdlRGlzdHJpYnV0b3IgZnJvbSBcIi4uLy4uLy4uL3Jlc2l6ZXIvZGlzdHJpYnV0b3JzL3BlcmNlbnRhZ2VcIjtcbmltcG9ydCB7IENvbnRhaW5lciwgV2lkZ2V0TGF5b3V0U3RvcmUgfSBmcm9tIFwiLi4vLi4vLi4vc3RvcmVzL3dpZGdldHMvV2lkZ2V0TGF5b3V0U3RvcmVcIjtcbmltcG9ydCB7IGNsYW1wLCBwZXJjZW50YWdlT2YsIHBlcmNlbnRhZ2VXaXRoaW4gfSBmcm9tIFwiLi4vLi4vLi4vdXRpbHMvbnVtYmVyc1wiO1xuaW1wb3J0IHsgdXNlU3RhdGVDYWxsYmFjayB9IGZyb20gXCIuLi8uLi8uLi9ob29rcy91c2VTdGF0ZUNhbGxiYWNrXCI7XG5pbXBvcnQgVUlTdG9yZSBmcm9tIFwiLi4vLi4vLi4vc3RvcmVzL1VJU3RvcmVcIjtcbmltcG9ydCB7IElBcHAgfSBmcm9tIFwiLi4vLi4vLi4vc3RvcmVzL1dpZGdldFN0b3JlXCI7XG5pbXBvcnQgeyBBY3Rpb25QYXlsb2FkIH0gZnJvbSBcIi4uLy4uLy4uL2Rpc3BhdGNoZXIvcGF5bG9hZHNcIjtcbmltcG9ydCBTcGlubmVyIGZyb20gXCIuLi9lbGVtZW50cy9TcGlubmVyXCI7XG5cbmludGVyZmFjZSBJUHJvcHMge1xuICAgIHVzZXJJZDogc3RyaW5nO1xuICAgIHJvb206IFJvb207XG4gICAgcmVzaXplTm90aWZpZXI6IFJlc2l6ZU5vdGlmaWVyO1xuICAgIHNob3dBcHBzPzogYm9vbGVhbjsgLy8gU2hvdWxkIGFwcHMgYmUgcmVuZGVyZWRcbiAgICBtYXhIZWlnaHQ6IG51bWJlcjtcbn1cblxuaW50ZXJmYWNlIElTdGF0ZSB7XG4gICAgLy8gQHRzLWlnbm9yZSAtIFRTIHdhbnRzIGEgc3RyaW5nIGtleSwgYnV0IHdlIGtub3cgYmV0dGVyXG4gICAgYXBwczoge1tpZDogQ29udGFpbmVyXTogSUFwcFtdfTtcbiAgICByZXNpemluZ1ZlcnRpY2FsOiBib29sZWFuOyAvLyB0cnVlIHdoZW4gY2hhbmdpbmcgdGhlIGhlaWdodCBvZiB0aGUgYXBwcyBkcmF3ZXJcbiAgICByZXNpemluZ0hvcml6b250YWw6IGJvb2xlYW47IC8vIHRydWUgd2hlbiBjaGFuZ2luZyB0aGUgZGlzdHJpYnV0aW9uIG9mIHRoZSB3aWR0aCBiZXR3ZWVuIHdpZGdldHNcbiAgICByZXNpemluZzogYm9vbGVhbjtcbn1cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQXBwc0RyYXdlciBleHRlbmRzIFJlYWN0LkNvbXBvbmVudDxJUHJvcHMsIElTdGF0ZT4ge1xuICAgIHByaXZhdGUgdW5tb3VudGVkID0gZmFsc2U7XG4gICAgcHJpdmF0ZSByZXNpemVDb250YWluZXI6IEhUTUxEaXZFbGVtZW50O1xuICAgIHByaXZhdGUgcmVzaXplcjogUmVzaXplcjtcbiAgICBwcml2YXRlIGRpc3BhdGNoZXJSZWY6IHN0cmluZztcbiAgICBwdWJsaWMgc3RhdGljIGRlZmF1bHRQcm9wczogUGFydGlhbDxJUHJvcHM+ID0ge1xuICAgICAgICBzaG93QXBwczogdHJ1ZSxcbiAgICB9O1xuXG4gICAgY29uc3RydWN0b3IocHJvcHM6IElQcm9wcykge1xuICAgICAgICBzdXBlcihwcm9wcyk7XG5cbiAgICAgICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgICAgICAgIGFwcHM6IHRoaXMuZ2V0QXBwcygpLFxuICAgICAgICAgICAgcmVzaXppbmdWZXJ0aWNhbDogZmFsc2UsXG4gICAgICAgICAgICByZXNpemluZ0hvcml6b250YWw6IGZhbHNlLFxuICAgICAgICAgICAgcmVzaXppbmc6IGZhbHNlLFxuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMucmVzaXplciA9IHRoaXMuY3JlYXRlUmVzaXplcigpO1xuXG4gICAgICAgIHRoaXMucHJvcHMucmVzaXplTm90aWZpZXIub24oXCJpc1Jlc2l6aW5nXCIsIHRoaXMub25Jc1Jlc2l6aW5nKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgY29tcG9uZW50RGlkTW91bnQoKTogdm9pZCB7XG4gICAgICAgIFNjYWxhck1lc3NhZ2luZy5zdGFydExpc3RlbmluZygpO1xuICAgICAgICBXaWRnZXRMYXlvdXRTdG9yZS5pbnN0YW5jZS5vbihXaWRnZXRMYXlvdXRTdG9yZS5lbWlzc2lvbkZvclJvb20odGhpcy5wcm9wcy5yb29tKSwgdGhpcy51cGRhdGVBcHBzKTtcbiAgICAgICAgdGhpcy5kaXNwYXRjaGVyUmVmID0gZGlzLnJlZ2lzdGVyKHRoaXMub25BY3Rpb24pO1xuICAgIH1cblxuICAgIHB1YmxpYyBjb21wb25lbnRXaWxsVW5tb3VudCgpOiB2b2lkIHtcbiAgICAgICAgdGhpcy51bm1vdW50ZWQgPSB0cnVlO1xuICAgICAgICBTY2FsYXJNZXNzYWdpbmcuc3RvcExpc3RlbmluZygpO1xuICAgICAgICBXaWRnZXRMYXlvdXRTdG9yZS5pbnN0YW5jZS5vZmYoV2lkZ2V0TGF5b3V0U3RvcmUuZW1pc3Npb25Gb3JSb29tKHRoaXMucHJvcHMucm9vbSksIHRoaXMudXBkYXRlQXBwcyk7XG4gICAgICAgIGlmICh0aGlzLmRpc3BhdGNoZXJSZWYpIGRpcy51bnJlZ2lzdGVyKHRoaXMuZGlzcGF0Y2hlclJlZik7XG4gICAgICAgIGlmICh0aGlzLnJlc2l6ZUNvbnRhaW5lcikge1xuICAgICAgICAgICAgdGhpcy5yZXNpemVyLmRldGFjaCgpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMucHJvcHMucmVzaXplTm90aWZpZXIub2ZmKFwiaXNSZXNpemluZ1wiLCB0aGlzLm9uSXNSZXNpemluZyk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBvbklzUmVzaXppbmcgPSAocmVzaXppbmc6IGJvb2xlYW4pOiB2b2lkID0+IHtcbiAgICAgICAgLy8gVGhpcyBvbmUgaXMgdGhlIHZlcnRpY2FsLCBpZS4gY2hhbmdlIGhlaWdodCBvZiBhcHBzIGRyYXdlclxuICAgICAgICB0aGlzLnNldFN0YXRlKHsgcmVzaXppbmdWZXJ0aWNhbDogcmVzaXppbmcgfSk7XG4gICAgICAgIGlmICghcmVzaXppbmcpIHtcbiAgICAgICAgICAgIHRoaXMucmVsYXhSZXNpemVyKCk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBjcmVhdGVSZXNpemVyKCk6IFJlc2l6ZXIge1xuICAgICAgICAvLyBUaGlzIGlzIHRoZSBob3Jpem9udGFsIG9uZSwgY2hhbmdpbmcgdGhlIGRpc3RyaWJ1dGlvbiBvZiB0aGUgd2lkdGggYmV0d2VlbiB0aGUgYXBwIHRpbGVzXG4gICAgICAgIC8vIChpZS4gYSB2ZXJ0aWNhbCByZXNpemUgaGFuZGxlIGJlY2F1c2UsIHRoZSBoYW5kbGUgaXRzZWxmIGlzIHZlcnRpY2FsLi4uKVxuICAgICAgICBjb25zdCBjbGFzc05hbWVzID0ge1xuICAgICAgICAgICAgaGFuZGxlOiBcIm14X1Jlc2l6ZUhhbmRsZVwiLFxuICAgICAgICAgICAgdmVydGljYWw6IFwibXhfUmVzaXplSGFuZGxlX3ZlcnRpY2FsXCIsXG4gICAgICAgICAgICByZXZlcnNlOiBcIm14X1Jlc2l6ZUhhbmRsZV9yZXZlcnNlXCIsXG4gICAgICAgIH07XG4gICAgICAgIGNvbnN0IGNvbGxhcHNlQ29uZmlnID0ge1xuICAgICAgICAgICAgb25SZXNpemVTdGFydDogKCkgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMucmVzaXplQ29udGFpbmVyLmNsYXNzTGlzdC5hZGQoXCJteF9BcHBzRHJhd2VyX3Jlc2l6aW5nXCIpO1xuICAgICAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoeyByZXNpemluZ0hvcml6b250YWw6IHRydWUgfSk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgb25SZXNpemVTdG9wOiAoKSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy5yZXNpemVDb250YWluZXIuY2xhc3NMaXN0LnJlbW92ZShcIm14X0FwcHNEcmF3ZXJfcmVzaXppbmdcIik7XG4gICAgICAgICAgICAgICAgV2lkZ2V0TGF5b3V0U3RvcmUuaW5zdGFuY2Uuc2V0UmVzaXplckRpc3RyaWJ1dGlvbnMoXG4gICAgICAgICAgICAgICAgICAgIHRoaXMucHJvcHMucm9vbSwgQ29udGFpbmVyLlRvcCxcbiAgICAgICAgICAgICAgICAgICAgdGhpcy50b3BBcHBzKCkuc2xpY2UoMSkubWFwKChfLCBpKSA9PiB0aGlzLnJlc2l6ZXIuZm9ySGFuZGxlQXQoaSkuc2l6ZSksXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICB0aGlzLnNldFN0YXRlKHsgcmVzaXppbmdIb3Jpem9udGFsOiBmYWxzZSB9KTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH07XG4gICAgICAgIC8vIHBhc3MgYSB0cnV0aHkgY29udGFpbmVyIGZvciBub3csIHdlIHdvbid0IGNhbGwgYXR0YWNoIHVudGlsIHdlIHVwZGF0ZSBpdFxuICAgICAgICBjb25zdCByZXNpemVyID0gbmV3IFJlc2l6ZXIobnVsbCwgUGVyY2VudGFnZURpc3RyaWJ1dG9yLCBjb2xsYXBzZUNvbmZpZyk7XG4gICAgICAgIHJlc2l6ZXIuc2V0Q2xhc3NOYW1lcyhjbGFzc05hbWVzKTtcbiAgICAgICAgcmV0dXJuIHJlc2l6ZXI7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBjb2xsZWN0UmVzaXplciA9IChyZWY6IEhUTUxEaXZFbGVtZW50KTogdm9pZCA9PiB7XG4gICAgICAgIGlmICh0aGlzLnJlc2l6ZUNvbnRhaW5lcikge1xuICAgICAgICAgICAgdGhpcy5yZXNpemVyLmRldGFjaCgpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHJlZikge1xuICAgICAgICAgICAgdGhpcy5yZXNpemVyLmNvbnRhaW5lciA9IHJlZjtcbiAgICAgICAgICAgIHRoaXMucmVzaXplci5hdHRhY2goKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnJlc2l6ZUNvbnRhaW5lciA9IHJlZjtcbiAgICAgICAgdGhpcy5sb2FkUmVzaXplclByZWZlcmVuY2VzKCk7XG4gICAgfTtcblxuICAgIHByaXZhdGUgZ2V0QXBwc0hhc2ggPSAoYXBwczogSUFwcFtdKTogc3RyaW5nID0+IGFwcHMubWFwKGFwcCA9PiBhcHAuaWQpLmpvaW4oXCJ+XCIpO1xuXG4gICAgcHVibGljIGNvbXBvbmVudERpZFVwZGF0ZShwcmV2UHJvcHM6IElQcm9wcywgcHJldlN0YXRlOiBJU3RhdGUpOiB2b2lkIHtcbiAgICAgICAgaWYgKHByZXZQcm9wcy51c2VySWQgIT09IHRoaXMucHJvcHMudXNlcklkIHx8IHByZXZQcm9wcy5yb29tICE9PSB0aGlzLnByb3BzLnJvb20pIHtcbiAgICAgICAgICAgIC8vIFJvb20gaGFzIGNoYW5nZWQsIHVwZGF0ZSBhcHBzXG4gICAgICAgICAgICB0aGlzLnVwZGF0ZUFwcHMoKTtcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLmdldEFwcHNIYXNoKHRoaXMudG9wQXBwcygpKSAhPT0gdGhpcy5nZXRBcHBzSGFzaChwcmV2U3RhdGUuYXBwc1tDb250YWluZXIuVG9wXSkpIHtcbiAgICAgICAgICAgIHRoaXMubG9hZFJlc2l6ZXJQcmVmZXJlbmNlcygpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSByZWxheFJlc2l6ZXIgPSAoKTogdm9pZCA9PiB7XG4gICAgICAgIGNvbnN0IGRpc3RyaWJ1dG9ycyA9IHRoaXMucmVzaXplci5nZXREaXN0cmlidXRvcnMoKTtcblxuICAgICAgICAvLyByZWxheCBhbGwgaXRlbXMgaWYgdGhleSBoYWQgYW55IG92ZXJjb25zdHJhaW5lZCBmbGV4Ym94ZXNcbiAgICAgICAgZGlzdHJpYnV0b3JzLmZvckVhY2goZCA9PiBkLnN0YXJ0KCkpO1xuICAgICAgICBkaXN0cmlidXRvcnMuZm9yRWFjaChkID0+IGQuZmluaXNoKCkpO1xuICAgIH07XG5cbiAgICBwcml2YXRlIGxvYWRSZXNpemVyUHJlZmVyZW5jZXMgPSAoKTogdm9pZCA9PiB7XG4gICAgICAgIGNvbnN0IGRpc3RyaWJ1dGlvbnMgPSBXaWRnZXRMYXlvdXRTdG9yZS5pbnN0YW5jZS5nZXRSZXNpemVyRGlzdHJpYnV0aW9ucyh0aGlzLnByb3BzLnJvb20sIENvbnRhaW5lci5Ub3ApO1xuICAgICAgICBpZiAodGhpcy5zdGF0ZS5hcHBzICYmICh0aGlzLnRvcEFwcHMoKS5sZW5ndGggLSAxKSA9PT0gZGlzdHJpYnV0aW9ucy5sZW5ndGgpIHtcbiAgICAgICAgICAgIGRpc3RyaWJ1dGlvbnMuZm9yRWFjaCgoc2l6ZSwgaSkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IGRpc3RyaWJ1dG9yID0gdGhpcy5yZXNpemVyLmZvckhhbmRsZUF0KGkpO1xuICAgICAgICAgICAgICAgIGlmIChkaXN0cmlidXRvcikge1xuICAgICAgICAgICAgICAgICAgICBkaXN0cmlidXRvci5zaXplID0gc2l6ZTtcbiAgICAgICAgICAgICAgICAgICAgZGlzdHJpYnV0b3IuZmluaXNoKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5zdGF0ZS5hcHBzKSB7XG4gICAgICAgICAgICBjb25zdCBkaXN0cmlidXRvcnMgPSB0aGlzLnJlc2l6ZXIuZ2V0RGlzdHJpYnV0b3JzKCk7XG4gICAgICAgICAgICBkaXN0cmlidXRvcnMuZm9yRWFjaChkID0+IGQuaXRlbS5jbGVhclNpemUoKSk7XG4gICAgICAgICAgICBkaXN0cmlidXRvcnMuZm9yRWFjaChkID0+IGQuc3RhcnQoKSk7XG4gICAgICAgICAgICBkaXN0cmlidXRvcnMuZm9yRWFjaChkID0+IGQuZmluaXNoKCkpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHByaXZhdGUgaXNSZXNpemluZygpOiBib29sZWFuIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuc3RhdGUucmVzaXppbmdWZXJ0aWNhbCB8fCB0aGlzLnN0YXRlLnJlc2l6aW5nSG9yaXpvbnRhbDtcbiAgICB9XG5cbiAgICBwcml2YXRlIG9uQWN0aW9uID0gKGFjdGlvbjogQWN0aW9uUGF5bG9hZCk6IHZvaWQgPT4ge1xuICAgICAgICBjb25zdCBoaWRlV2lkZ2V0S2V5ID0gdGhpcy5wcm9wcy5yb29tLnJvb21JZCArICdfaGlkZV93aWRnZXRfZHJhd2VyJztcbiAgICAgICAgc3dpdGNoIChhY3Rpb24uYWN0aW9uKSB7XG4gICAgICAgICAgICBjYXNlIFwiYXBwc0RyYXdlclwiOlxuICAgICAgICAgICAgICAgIC8vIE5vdGU6IHRoZXNlIGJvb2xlYW5zIGFyZSBhd2t3YXJkIGJlY2F1c2UgbG9jYWxzdG9yYWdlIGlzIGZ1bmRhbWVudGFsbHlcbiAgICAgICAgICAgICAgICAvLyBzdHJpbmctYmFzZWQuIFdlIGFsc28gZG8gZXhhY3QgZXF1YWxpdHkgb24gdGhlIHN0cmluZ3MgbGF0ZXIgb24uXG4gICAgICAgICAgICAgICAgaWYgKGFjdGlvbi5zaG93KSB7XG4gICAgICAgICAgICAgICAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKGhpZGVXaWRnZXRLZXksIFwiZmFsc2VcIik7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gU3RvcmUgaGlkZGVuIHN0YXRlIG9mIHdpZGdldFxuICAgICAgICAgICAgICAgICAgICAvLyBEb24ndCBzaG93IGlmIHByZXZpb3VzbHkgaGlkZGVuXG4gICAgICAgICAgICAgICAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKGhpZGVXaWRnZXRLZXksIFwidHJ1ZVwiKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgIH07XG4gICAgLy8gQHRzLWlnbm9yZSAtIFRTIHdhbnRzIGEgc3RyaW5nIGtleSwgYnV0IHdlIGtub3cgYmV0dGVyXG4gICAgcHJpdmF0ZSBnZXRBcHBzID0gKCk6IHsgW2lkOiBDb250YWluZXJdOiBJQXBwW10gfSA9PiB7XG4gICAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgICAgY29uc3QgYXBwc0RpY3Q6IHsgW2lkOiBDb250YWluZXJdOiBJQXBwW10gfSA9IHt9O1xuICAgICAgICBhcHBzRGljdFtDb250YWluZXIuVG9wXSA9IFdpZGdldExheW91dFN0b3JlLmluc3RhbmNlLmdldENvbnRhaW5lcldpZGdldHModGhpcy5wcm9wcy5yb29tLCBDb250YWluZXIuVG9wKTtcbiAgICAgICAgYXBwc0RpY3RbQ29udGFpbmVyLkNlbnRlcl0gPSBXaWRnZXRMYXlvdXRTdG9yZS5pbnN0YW5jZS5nZXRDb250YWluZXJXaWRnZXRzKHRoaXMucHJvcHMucm9vbSwgQ29udGFpbmVyLkNlbnRlcik7XG4gICAgICAgIHJldHVybiBhcHBzRGljdDtcbiAgICB9O1xuICAgIHByaXZhdGUgdG9wQXBwcyA9ICgpOiBJQXBwW10gPT4gdGhpcy5zdGF0ZS5hcHBzW0NvbnRhaW5lci5Ub3BdO1xuICAgIHByaXZhdGUgY2VudGVyQXBwcyA9ICgpOiBJQXBwW10gPT4gdGhpcy5zdGF0ZS5hcHBzW0NvbnRhaW5lci5DZW50ZXJdO1xuXG4gICAgcHJpdmF0ZSB1cGRhdGVBcHBzID0gKCk6IHZvaWQgPT4ge1xuICAgICAgICBpZiAodGhpcy51bm1vdW50ZWQpIHJldHVybjtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICBhcHBzOiB0aGlzLmdldEFwcHMoKSxcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIHB1YmxpYyByZW5kZXIoKTogSlNYLkVsZW1lbnQge1xuICAgICAgICBpZiAoIXRoaXMucHJvcHMuc2hvd0FwcHMpIHJldHVybiA8ZGl2IC8+O1xuICAgICAgICBjb25zdCB3aWRnZXRJc01heG1pc2VkOiBib29sZWFuID0gdGhpcy5jZW50ZXJBcHBzKCkubGVuZ3RoID4gMDtcbiAgICAgICAgY29uc3QgYXBwc1RvRGlzcGxheSA9IHdpZGdldElzTWF4bWlzZWQgPyB0aGlzLmNlbnRlckFwcHMoKSA6IHRoaXMudG9wQXBwcygpO1xuICAgICAgICBjb25zdCBhcHBzID0gYXBwc1RvRGlzcGxheS5tYXAoKGFwcCwgaW5kZXgsIGFycikgPT4ge1xuICAgICAgICAgICAgcmV0dXJuICg8QXBwVGlsZVxuICAgICAgICAgICAgICAgIGtleT17YXBwLmlkfVxuICAgICAgICAgICAgICAgIGFwcD17YXBwfVxuICAgICAgICAgICAgICAgIGZ1bGxXaWR0aD17YXJyLmxlbmd0aCA8IDJ9XG4gICAgICAgICAgICAgICAgcm9vbT17dGhpcy5wcm9wcy5yb29tfVxuICAgICAgICAgICAgICAgIHVzZXJJZD17dGhpcy5wcm9wcy51c2VySWR9XG4gICAgICAgICAgICAgICAgY3JlYXRvclVzZXJJZD17YXBwLmNyZWF0b3JVc2VySWR9XG4gICAgICAgICAgICAgICAgd2lkZ2V0UGFnZVRpdGxlPXtXaWRnZXRVdGlscy5nZXRXaWRnZXREYXRhVGl0bGUoYXBwKX1cbiAgICAgICAgICAgICAgICB3YWl0Rm9ySWZyYW1lTG9hZD17YXBwLndhaXRGb3JJZnJhbWVMb2FkfVxuICAgICAgICAgICAgICAgIHBvaW50ZXJFdmVudHM9e3RoaXMuaXNSZXNpemluZygpID8gJ25vbmUnIDogdW5kZWZpbmVkfVxuICAgICAgICAgICAgLz4pO1xuICAgICAgICB9KTtcblxuICAgICAgICBpZiAoYXBwcy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgIHJldHVybiA8ZGl2IC8+O1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IHNwaW5uZXI7XG4gICAgICAgIGlmIChcbiAgICAgICAgICAgIGFwcHMubGVuZ3RoID09PSAwICYmIFdpZGdldEVjaG9TdG9yZS5yb29tSGFzUGVuZGluZ1dpZGdldHMoXG4gICAgICAgICAgICAgICAgdGhpcy5wcm9wcy5yb29tLnJvb21JZCxcbiAgICAgICAgICAgICAgICBXaWRnZXRVdGlscy5nZXRSb29tV2lkZ2V0cyh0aGlzLnByb3BzLnJvb20pLFxuICAgICAgICAgICAgKVxuICAgICAgICApIHtcbiAgICAgICAgICAgIHNwaW5uZXIgPSA8U3Bpbm5lciAvPjtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGNsYXNzZXMgPSBjbGFzc05hbWVzKHtcbiAgICAgICAgICAgIG14X0FwcHNEcmF3ZXI6IHRydWUsXG4gICAgICAgICAgICBteF9BcHBzRHJhd2VyX21heGltaXNlOiB3aWRnZXRJc01heG1pc2VkLFxuICAgICAgICAgICAgbXhfQXBwc0RyYXdlcl9mdWxsV2lkdGg6IGFwcHMubGVuZ3RoIDwgMixcbiAgICAgICAgICAgIG14X0FwcHNEcmF3ZXJfcmVzaXppbmc6IHRoaXMuc3RhdGUucmVzaXppbmcsXG4gICAgICAgICAgICBteF9BcHBzRHJhd2VyXzJhcHBzOiBhcHBzLmxlbmd0aCA9PT0gMixcbiAgICAgICAgICAgIG14X0FwcHNEcmF3ZXJfM2FwcHM6IGFwcHMubGVuZ3RoID09PSAzLFxuICAgICAgICB9KTtcbiAgICAgICAgY29uc3QgYXBwQ29udGFpbmVycyA9XG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X0FwcHNDb250YWluZXJcIiByZWY9e3RoaXMuY29sbGVjdFJlc2l6ZXJ9PlxuICAgICAgICAgICAgICAgIHsgYXBwcy5tYXAoKGFwcCwgaSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZiAoaSA8IDEpIHJldHVybiBhcHA7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiA8UmVhY3QuRnJhZ21lbnQga2V5PXthcHAua2V5fT5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxSZXNpemVIYW5kbGUgcmV2ZXJzZT17aSA+IGFwcHMubGVuZ3RoIC8gMn0gLz5cbiAgICAgICAgICAgICAgICAgICAgICAgIHsgYXBwIH1cbiAgICAgICAgICAgICAgICAgICAgPC9SZWFjdC5GcmFnbWVudD47XG4gICAgICAgICAgICAgICAgfSkgfVxuICAgICAgICAgICAgPC9kaXY+O1xuXG4gICAgICAgIGxldCBkcmF3ZXI7XG4gICAgICAgIGlmICh3aWRnZXRJc01heG1pc2VkKSB7XG4gICAgICAgICAgICBkcmF3ZXIgPSBhcHBDb250YWluZXJzO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZHJhd2VyID0gPFBlcnNpc3RlbnRWUmVzaXplclxuICAgICAgICAgICAgICAgIHJvb209e3RoaXMucHJvcHMucm9vbX1cbiAgICAgICAgICAgICAgICBtaW5IZWlnaHQ9ezEwMH1cbiAgICAgICAgICAgICAgICBtYXhIZWlnaHQ9e3RoaXMucHJvcHMubWF4SGVpZ2h0IC0gNTB9XG4gICAgICAgICAgICAgICAgaGFuZGxlQ2xhc3M9XCJteF9BcHBzQ29udGFpbmVyX3Jlc2l6ZXJIYW5kbGVcIlxuICAgICAgICAgICAgICAgIGhhbmRsZVdyYXBwZXJDbGFzcz1cIm14X0FwcHNDb250YWluZXJfcmVzaXplckhhbmRsZUNvbnRhaW5lclwiXG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwibXhfQXBwc0NvbnRhaW5lcl9yZXNpemVyXCJcbiAgICAgICAgICAgICAgICByZXNpemVOb3RpZmllcj17dGhpcy5wcm9wcy5yZXNpemVOb3RpZmllcn0+XG4gICAgICAgICAgICAgICAgeyBhcHBDb250YWluZXJzIH1cbiAgICAgICAgICAgIDwvUGVyc2lzdGVudFZSZXNpemVyPjtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT17Y2xhc3Nlc30+XG4gICAgICAgICAgICAgICAgeyBkcmF3ZXIgfVxuICAgICAgICAgICAgICAgIHsgc3Bpbm5lciB9XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgKTtcbiAgICB9XG59XG5cbmludGVyZmFjZSBJUGVyc2lzdGVudFJlc2l6ZXJQcm9wcyB7XG4gICAgcm9vbTogUm9vbTtcbiAgICBtaW5IZWlnaHQ6IG51bWJlcjtcbiAgICBtYXhIZWlnaHQ6IG51bWJlcjtcbiAgICBjbGFzc05hbWU6IHN0cmluZztcbiAgICBoYW5kbGVXcmFwcGVyQ2xhc3M6IHN0cmluZztcbiAgICBoYW5kbGVDbGFzczogc3RyaW5nO1xuICAgIHJlc2l6ZU5vdGlmaWVyOiBSZXNpemVOb3RpZmllcjtcbiAgICBjaGlsZHJlbjogUmVhY3QuUmVhY3ROb2RlO1xufVxuXG5jb25zdCBQZXJzaXN0ZW50VlJlc2l6ZXI6IFJlYWN0LkZDPElQZXJzaXN0ZW50UmVzaXplclByb3BzPiA9ICh7XG4gICAgcm9vbSxcbiAgICBtaW5IZWlnaHQsXG4gICAgbWF4SGVpZ2h0LFxuICAgIGNsYXNzTmFtZSxcbiAgICBoYW5kbGVXcmFwcGVyQ2xhc3MsXG4gICAgaGFuZGxlQ2xhc3MsXG4gICAgcmVzaXplTm90aWZpZXIsXG4gICAgY2hpbGRyZW4sXG59KSA9PiB7XG4gICAgbGV0IGRlZmF1bHRIZWlnaHQgPSBXaWRnZXRMYXlvdXRTdG9yZS5pbnN0YW5jZS5nZXRDb250YWluZXJIZWlnaHQocm9vbSwgQ29udGFpbmVyLlRvcCk7XG5cbiAgICAvLyBBcmJpdHJhcnkgZGVmYXVsdHMgdG8gYXZvaWQgTmFOIHByb2JsZW1zLiAxMDAgcHggb3IgMy80IG9mIHRoZSB2aXNpYmxlIHdpbmRvdy5cbiAgICBpZiAoIW1pbkhlaWdodCkgbWluSGVpZ2h0ID0gMTAwO1xuICAgIGlmICghbWF4SGVpZ2h0KSBtYXhIZWlnaHQgPSAoVUlTdG9yZS5pbnN0YW5jZS53aW5kb3dIZWlnaHQgLyA0KSAqIDM7XG5cbiAgICAvLyBDb252ZXJ0IGZyb20gcGVyY2VudGFnZSB0byBoZWlnaHQuIE5vdGUgdGhhdCB0aGUgZGVmYXVsdCBoZWlnaHQgaXMgMjgwcHguXG4gICAgaWYgKGRlZmF1bHRIZWlnaHQpIHtcbiAgICAgICAgZGVmYXVsdEhlaWdodCA9IGNsYW1wKGRlZmF1bHRIZWlnaHQsIDAsIDEwMCk7XG4gICAgICAgIGRlZmF1bHRIZWlnaHQgPSBwZXJjZW50YWdlV2l0aGluKGRlZmF1bHRIZWlnaHQgLyAxMDAsIG1pbkhlaWdodCwgbWF4SGVpZ2h0KTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBkZWZhdWx0SGVpZ2h0ID0gMjgwO1xuICAgIH1cblxuICAgIGNvbnN0IFtoZWlnaHQsIHNldEhlaWdodF0gPSB1c2VTdGF0ZUNhbGxiYWNrKGRlZmF1bHRIZWlnaHQsIG5ld0hlaWdodCA9PiB7XG4gICAgICAgIG5ld0hlaWdodCA9IHBlcmNlbnRhZ2VPZihuZXdIZWlnaHQsIG1pbkhlaWdodCwgbWF4SGVpZ2h0KSAqIDEwMDtcbiAgICAgICAgV2lkZ2V0TGF5b3V0U3RvcmUuaW5zdGFuY2Uuc2V0Q29udGFpbmVySGVpZ2h0KHJvb20sIENvbnRhaW5lci5Ub3AsIG5ld0hlaWdodCk7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gPFJlc2l6YWJsZVxuICAgICAgICBzaXplPXt7IGhlaWdodDogTWF0aC5taW4oaGVpZ2h0LCBtYXhIZWlnaHQpLCB3aWR0aDogdW5kZWZpbmVkIH19XG4gICAgICAgIG1pbkhlaWdodD17bWluSGVpZ2h0fVxuICAgICAgICBtYXhIZWlnaHQ9e21heEhlaWdodH1cbiAgICAgICAgb25SZXNpemVTdGFydD17KCkgPT4ge1xuICAgICAgICAgICAgcmVzaXplTm90aWZpZXIuc3RhcnRSZXNpemluZygpO1xuICAgICAgICB9fVxuICAgICAgICBvblJlc2l6ZT17KCkgPT4ge1xuICAgICAgICAgICAgcmVzaXplTm90aWZpZXIubm90aWZ5VGltZWxpbmVIZWlnaHRDaGFuZ2VkKCk7XG4gICAgICAgIH19XG4gICAgICAgIG9uUmVzaXplU3RvcD17KGUsIGRpciwgcmVmLCBkKSA9PiB7XG4gICAgICAgICAgICBzZXRIZWlnaHQoaGVpZ2h0ICsgZC5oZWlnaHQpO1xuICAgICAgICAgICAgcmVzaXplTm90aWZpZXIuc3RvcFJlc2l6aW5nKCk7XG4gICAgICAgIH19XG4gICAgICAgIGhhbmRsZVdyYXBwZXJDbGFzcz17aGFuZGxlV3JhcHBlckNsYXNzfVxuICAgICAgICBoYW5kbGVDbGFzc2VzPXt7IGJvdHRvbTogaGFuZGxlQ2xhc3MgfX1cbiAgICAgICAgY2xhc3NOYW1lPXtjbGFzc05hbWV9XG4gICAgICAgIGVuYWJsZT17eyBib3R0b206IHRydWUgfX1cbiAgICA+XG4gICAgICAgIHsgY2hpbGRyZW4gfVxuICAgIDwvUmVzaXphYmxlPjtcbn07XG4iXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBaUJBOztBQUNBOztBQUNBOztBQUdBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUVBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUdBOzs7Ozs7QUFyQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUF3Q2UsTUFBTUEsVUFBTixTQUF5QkMsY0FBQSxDQUFNQyxTQUEvQixDQUF5RDtFQVNwRUMsV0FBVyxDQUFDQyxLQUFELEVBQWdCO0lBQ3ZCLE1BQU1BLEtBQU47SUFEdUIsaURBUlAsS0FRTztJQUFBO0lBQUE7SUFBQTtJQUFBLG9EQWdDSEMsUUFBRCxJQUE2QjtNQUNoRDtNQUNBLEtBQUtDLFFBQUwsQ0FBYztRQUFFQyxnQkFBZ0IsRUFBRUY7TUFBcEIsQ0FBZDs7TUFD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