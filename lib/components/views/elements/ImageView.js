"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireWildcard(require("react"));

var _reactFocusLock = _interopRequireDefault(require("react-focus-lock"));

var _languageHandler = require("../../../languageHandler");

var _AccessibleTooltipButton = _interopRequireDefault(require("./AccessibleTooltipButton"));

var _MemberAvatar = _interopRequireDefault(require("../avatars/MemberAvatar"));

var _ContextMenuTooltipButton = require("../../../accessibility/context_menu/ContextMenuTooltipButton");

var _MessageContextMenu = _interopRequireDefault(require("../context_menus/MessageContextMenu"));

var _ContextMenu = require("../../structures/ContextMenu");

var _MessageTimestamp = _interopRequireDefault(require("../messages/MessageTimestamp"));

var _SettingsStore = _interopRequireDefault(require("../../../settings/SettingsStore"));

var _DateUtils = require("../../../DateUtils");

var _dispatcher = _interopRequireDefault(require("../../../dispatcher/dispatcher"));

var _actions = require("../../../dispatcher/actions");

var _Mouse = require("../../../utils/Mouse");

var _UIStore = _interopRequireDefault(require("../../../stores/UIStore"));

var _KeyboardShortcuts = require("../../../accessibility/KeyboardShortcuts");

var _KeyBindingsManager = require("../../../KeyBindingsManager");

var _FileUtils = require("../../../utils/FileUtils");

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

/*
Copyright 2015, 2016 OpenMarket Ltd
Copyright 2019 Michael Telatynski <7t3chguy@gmail.com>
Copyright 2020, 2021 Šimon Brandner <simon.bra.ag@gmail.com>

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
// Max scale to keep gaps around the image
const MAX_SCALE = 0.95; // This is used for the buttons

const ZOOM_STEP = 0.10; // This is used for mouse wheel events

const ZOOM_COEFFICIENT = 0.0025; // If we have moved only this much we can zoom

const ZOOM_DISTANCE = 10; // Height of mx_ImageView_panel

const getPanelHeight = () => {
  const value = getComputedStyle(document.documentElement).getPropertyValue("--image-view-panel-height"); // Return the value as a number without the unit

  return parseInt(value.slice(0, value.length - 2));
};

class ImageView extends _react.default.Component {
  constructor(props) {
    super(props);
    (0, _defineProperty2.default)(this, "contextMenuButton", /*#__PURE__*/(0, _react.createRef)());
    (0, _defineProperty2.default)(this, "focusLock", /*#__PURE__*/(0, _react.createRef)());
    (0, _defineProperty2.default)(this, "imageWrapper", /*#__PURE__*/(0, _react.createRef)());
    (0, _defineProperty2.default)(this, "image", /*#__PURE__*/(0, _react.createRef)());
    (0, _defineProperty2.default)(this, "initX", 0);
    (0, _defineProperty2.default)(this, "initY", 0);
    (0, _defineProperty2.default)(this, "previousX", 0);
    (0, _defineProperty2.default)(this, "previousY", 0);
    (0, _defineProperty2.default)(this, "animatingLoading", false);
    (0, _defineProperty2.default)(this, "imageIsLoaded", false);
    (0, _defineProperty2.default)(this, "imageLoaded", () => {
      // First, we calculate the zoom, so that the image has the same size as
      // the thumbnail
      const {
        thumbnailInfo
      } = this.props;

      if (thumbnailInfo?.width) {
        this.setState({
          zoom: thumbnailInfo.width / this.image.current.naturalWidth
        });
      } // Once the zoom is set, we the image is considered loaded and we can
      // start animating it into the center of the screen


      this.imageIsLoaded = true;
      this.animatingLoading = true;
      this.setZoomAndRotation();
      this.setState({
        translationX: 0,
        translationY: 0
      }); // Once the position is set, there is no need to animate anymore

      this.animatingLoading = false;
    });
    (0, _defineProperty2.default)(this, "recalculateZoom", () => {
      this.setZoomAndRotation();
    });
    (0, _defineProperty2.default)(this, "setZoomAndRotation", inputRotation => {
      const image = this.image.current;
      const imageWrapper = this.imageWrapper.current;
      const rotation = inputRotation ?? this.state.rotation;
      const imageIsNotFlipped = rotation % 180 === 0; // If the image is rotated take it into account

      const width = imageIsNotFlipped ? image.naturalWidth : image.naturalHeight;
      const height = imageIsNotFlipped ? image.naturalHeight : image.naturalWidth;
      const zoomX = imageWrapper.clientWidth / width;
      const zoomY = imageWrapper.clientHeight / height; // If the image is smaller in both dimensions set its the zoom to 1 to
      // display it in its original size

      if (zoomX >= 1 && zoomY >= 1) {
        this.setState({
          zoom: 1,
          minZoom: 1,
          maxZoom: 1,
          rotation: rotation
        });
        return;
      } // We set minZoom to the min of the zoomX and zoomY to avoid overflow in
      // any direction. We also multiply by MAX_SCALE to get a gap around the
      // image by default


      const minZoom = Math.min(zoomX, zoomY) * MAX_SCALE; // If zoom is smaller than minZoom don't go below that value

      const zoom = this.state.zoom <= this.state.minZoom ? minZoom : this.state.zoom;
      this.setState({
        minZoom: minZoom,
        maxZoom: 1,
        rotation: rotation,
        zoom: zoom
      });
    });
    (0, _defineProperty2.default)(this, "onWheel", ev => {
      if (ev.target === this.image.current) {
        ev.stopPropagation();
        ev.preventDefault();
        const {
          deltaY
        } = (0, _Mouse.normalizeWheelEvent)(ev); // Zoom in on the point on the image targeted by the cursor

        this.zoomDelta(-deltaY * ZOOM_COEFFICIENT, ev.offsetX, ev.offsetY);
      }
    });
    (0, _defineProperty2.default)(this, "onZoomInClick", () => {
      this.zoomDelta(ZOOM_STEP);
    });
    (0, _defineProperty2.default)(this, "onZoomOutClick", () => {
      this.zoomDelta(-ZOOM_STEP);
    });
    (0, _defineProperty2.default)(this, "onKeyDown", ev => {
      const action = (0, _KeyBindingsManager.getKeyBindingsManager)().getAccessibilityAction(ev);

      switch (action) {
        case _KeyboardShortcuts.KeyBindingAction.Escape:
          ev.stopPropagation();
          ev.preventDefault();
          this.props.onFinished();
          break;
      }
    });
    (0, _defineProperty2.default)(this, "onRotateCounterClockwiseClick", () => {
      const cur = this.state.rotation;
      this.setZoomAndRotation(cur - 90);
    });
    (0, _defineProperty2.default)(this, "onRotateClockwiseClick", () => {
      const cur = this.state.rotation;
      this.setZoomAndRotation(cur + 90);
    });
    (0, _defineProperty2.default)(this, "onDownloadClick", () => {
      const a = document.createElement("a");
      a.href = this.props.src;
      a.download = this.props.name;
      a.target = "_blank";
      a.rel = "noreferrer noopener";
      a.click();
    });
    (0, _defineProperty2.default)(this, "onOpenContextMenu", () => {
      this.setState({
        contextMenuDisplayed: true
      });
    });
    (0, _defineProperty2.default)(this, "onCloseContextMenu", () => {
      this.setState({
        contextMenuDisplayed: false
      });
    });
    (0, _defineProperty2.default)(this, "onPermalinkClicked", ev => {
      // This allows the permalink to be opened in a new tab/window or copied as
      // matrix.to, but also for it to enable routing within Element when clicked.
      ev.preventDefault();

      _dispatcher.default.dispatch({
        action: _actions.Action.ViewRoom,
        event_id: this.props.mxEvent.getId(),
        highlighted: true,
        room_id: this.props.mxEvent.getRoomId(),
        metricsTrigger: undefined // room doesn't change

      });

      this.props.onFinished();
    });
    (0, _defineProperty2.default)(this, "onStartMoving", ev => {
      ev.stopPropagation();
      ev.preventDefault(); // Don't do anything if we pressed any
      // other button than the left one

      if (ev.button !== 0) return; // Zoom in if we are completely zoomed out

      if (this.state.zoom === this.state.minZoom) {
        this.zoom(this.state.maxZoom, ev.nativeEvent.offsetX, ev.nativeEvent.offsetY);
        return;
      }

      this.setState({
        moving: true
      });
      this.previousX = this.state.translationX;
      this.previousY = this.state.translationY;
      this.initX = ev.pageX - this.state.translationX;
      this.initY = ev.pageY - this.state.translationY;
    });
    (0, _defineProperty2.default)(this, "onMoving", ev => {
      ev.stopPropagation();
      ev.preventDefault();
      if (!this.state.moving) return;
      this.setState({
        translationX: ev.pageX - this.initX,
        translationY: ev.pageY - this.initY
      });
    });
    (0, _defineProperty2.default)(this, "onEndMoving", () => {
      // Zoom out if we haven't moved much
      if (this.state.moving === true && Math.abs(this.state.translationX - this.previousX) < ZOOM_DISTANCE && Math.abs(this.state.translationY - this.previousY) < ZOOM_DISTANCE) {
        this.zoom(this.state.minZoom);
        this.initX = 0;
        this.initY = 0;
      }

      this.setState({
        moving: false
      });
    });
    const {
      thumbnailInfo: _thumbnailInfo
    } = this.props;
    this.state = {
      zoom: 0,
      // We default to 0 and override this in imageLoaded once we have naturalSize
      minZoom: MAX_SCALE,
      maxZoom: MAX_SCALE,
      rotation: 0,
      translationX: _thumbnailInfo?.positionX + _thumbnailInfo?.width / 2 - _UIStore.default.instance.windowWidth / 2 ?? 0,
      translationY: _thumbnailInfo?.positionY + _thumbnailInfo?.height / 2 - _UIStore.default.instance.windowHeight / 2 - getPanelHeight() / 2 ?? 0,
      moving: false,
      contextMenuDisplayed: false
    };
  } // XXX: Refs to functional components


  componentDidMount() {
    // We have to use addEventListener() because the listener
    // needs to be passive in order to work with Chromium
    this.focusLock.current.addEventListener('wheel', this.onWheel, {
      passive: false
    }); // We want to recalculate zoom whenever the window's size changes

    window.addEventListener("resize", this.recalculateZoom); // After the image loads for the first time we want to calculate the zoom

    this.image.current.addEventListener("load", this.imageLoaded);
  }

  componentWillUnmount() {
    this.focusLock.current.removeEventListener('wheel', this.onWheel);
    window.removeEventListener("resize", this.recalculateZoom);
    this.image.current.removeEventListener("load", this.imageLoaded);
  }

  zoomDelta(delta, anchorX, anchorY) {
    this.zoom(this.state.zoom + delta, anchorX, anchorY);
  }

  zoom(zoomLevel, anchorX, anchorY) {
    const oldZoom = this.state.zoom;
    const newZoom = Math.min(zoomLevel, this.state.maxZoom);

    if (newZoom <= this.state.minZoom) {
      // Zoom out fully
      this.setState({
        zoom: this.state.minZoom,
        translationX: 0,
        translationY: 0
      });
    } else if (typeof anchorX !== "number" && typeof anchorY !== "number") {
      // Zoom relative to the center of the view
      this.setState({
        zoom: newZoom,
        translationX: this.state.translationX * newZoom / oldZoom,
        translationY: this.state.translationY * newZoom / oldZoom
      });
    } else {
      // Zoom relative to the given point on the image.
      // First we need to figure out the offset of the anchor point
      // relative to the center of the image, accounting for rotation.
      let offsetX;
      let offsetY; // The modulo operator can return negative values for some
      // rotations, so we have to do some extra work to normalize it

      switch ((this.state.rotation % 360 + 360) % 360) {
        case 0:
          offsetX = this.image.current.clientWidth / 2 - anchorX;
          offsetY = this.image.current.clientHeight / 2 - anchorY;
          break;

        case 90:
          offsetX = anchorY - this.image.current.clientHeight / 2;
          offsetY = this.image.current.clientWidth / 2 - anchorX;
          break;

        case 180:
          offsetX = anchorX - this.image.current.clientWidth / 2;
          offsetY = anchorY - this.image.current.clientHeight / 2;
          break;

        case 270:
          offsetX = this.image.current.clientHeight / 2 - anchorY;
          offsetY = anchorX - this.image.current.clientWidth / 2;
      } // Apply the zoom and offset


      this.setState({
        zoom: newZoom,
        translationX: this.state.translationX + (newZoom - oldZoom) * offsetX,
        translationY: this.state.translationY + (newZoom - oldZoom) * offsetY
      });
    }
  }

  renderContextMenu() {
    let contextMenu = null;

    if (this.state.contextMenuDisplayed) {
      contextMenu = /*#__PURE__*/_react.default.createElement(_MessageContextMenu.default, (0, _extends2.default)({}, (0, _ContextMenu.aboveLeftOf)(this.contextMenuButton.current.getBoundingClientRect()), {
        mxEvent: this.props.mxEvent,
        permalinkCreator: this.props.permalinkCreator,
        onFinished: this.onCloseContextMenu,
        onCloseDialog: this.props.onFinished
      }));
    }

    return /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, contextMenu);
  }

  render() {
    const showEventMeta = !!this.props.mxEvent;
    const zoomingDisabled = this.state.maxZoom === this.state.minZoom;
    let transitionClassName;
    if (this.animatingLoading) transitionClassName = "mx_ImageView_image_animatingLoading";else if (this.state.moving || !this.imageIsLoaded) transitionClassName = "";else transitionClassName = "mx_ImageView_image_animating";
    let cursor;
    if (this.state.moving) cursor = "grabbing";else if (zoomingDisabled) cursor = "default";else if (this.state.zoom === this.state.minZoom) cursor = "zoom-in";else cursor = "zoom-out";
    const rotationDegrees = this.state.rotation + "deg";
    const zoom = this.state.zoom;
    const translatePixelsX = this.state.translationX + "px";
    const translatePixelsY = this.state.translationY + "px"; // The order of the values is important!
    // First, we translate and only then we rotate, otherwise
    // we would apply the translation to an already rotated
    // image causing it translate in the wrong direction.

    const style = {
      cursor: cursor,
      transform: `translateX(${translatePixelsX})
                        translateY(${translatePixelsY})
                        scale(${zoom})
                        rotate(${rotationDegrees})`
    };
    let info;

    if (showEventMeta) {
      const mxEvent = this.props.mxEvent;

      const showTwelveHour = _SettingsStore.default.getValue("showTwelveHourTimestamps");

      let permalink = "#";

      if (this.props.permalinkCreator) {
        permalink = this.props.permalinkCreator.forEvent(this.props.mxEvent.getId());
      }

      const senderName = mxEvent.sender ? mxEvent.sender.name : mxEvent.getSender();

      const sender = /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_ImageView_info_sender"
      }, senderName);

      const messageTimestamp = /*#__PURE__*/_react.default.createElement("a", {
        href: permalink,
        onClick: this.onPermalinkClicked,
        "aria-label": (0, _DateUtils.formatFullDate)(new Date(this.props.mxEvent.getTs()), showTwelveHour, false)
      }, /*#__PURE__*/_react.default.createElement(_MessageTimestamp.default, {
        showFullDate: true,
        showTwelveHour: showTwelveHour,
        ts: mxEvent.getTs(),
        showSeconds: false
      }));

      const avatar = /*#__PURE__*/_react.default.createElement(_MemberAvatar.default, {
        member: mxEvent.sender,
        fallbackUserId: mxEvent.getSender(),
        width: 32,
        height: 32,
        viewUserOnClick: true
      });

      info = /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_ImageView_info_wrapper"
      }, avatar, /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_ImageView_info"
      }, sender, messageTimestamp));
    } else {
      // If there is no event - we're viewing an avatar, we set
      // an empty div here, since the panel uses space-between
      // and we want the same placement of elements
      info = /*#__PURE__*/_react.default.createElement("div", null);
    }

    let contextMenuButton;

    if (this.props.mxEvent) {
      contextMenuButton = /*#__PURE__*/_react.default.createElement(_ContextMenuTooltipButton.ContextMenuTooltipButton, {
        className: "mx_ImageView_button mx_ImageView_button_more",
        title: (0, _languageHandler._t)("Options"),
        onClick: this.onOpenContextMenu,
        inputRef: this.contextMenuButton,
        isExpanded: this.state.contextMenuDisplayed
      });
    }

    let zoomOutButton;
    let zoomInButton;

    if (!zoomingDisabled) {
      zoomOutButton = /*#__PURE__*/_react.default.createElement(_AccessibleTooltipButton.default, {
        className: "mx_ImageView_button mx_ImageView_button_zoomOut",
        title: (0, _languageHandler._t)("Zoom out"),
        onClick: this.onZoomOutClick
      });
      zoomInButton = /*#__PURE__*/_react.default.createElement(_AccessibleTooltipButton.default, {
        className: "mx_ImageView_button mx_ImageView_button_zoomIn",
        title: (0, _languageHandler._t)("Zoom in"),
        onClick: this.onZoomInClick
      });
    }

    let title;

    if (this.props.mxEvent?.getContent()) {
      title = /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_ImageView_title"
      }, (0, _FileUtils.presentableTextForFile)(this.props.mxEvent?.getContent(), (0, _languageHandler._t)("Image"), true));
    }

    return /*#__PURE__*/_react.default.createElement(_reactFocusLock.default, {
      returnFocus: true,
      lockProps: {
        onKeyDown: this.onKeyDown,
        role: "dialog"
      },
      className: "mx_ImageView",
      ref: this.focusLock
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_ImageView_panel"
    }, info, title, /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_ImageView_toolbar"
    }, zoomOutButton, zoomInButton, /*#__PURE__*/_react.default.createElement(_AccessibleTooltipButton.default, {
      className: "mx_ImageView_button mx_ImageView_button_rotateCCW",
      title: (0, _languageHandler._t)("Rotate Left"),
      onClick: this.onRotateCounterClockwiseClick
    }), /*#__PURE__*/_react.default.createElement(_AccessibleTooltipButton.default, {
      className: "mx_ImageView_button mx_ImageView_button_rotateCW",
      title: (0, _languageHandler._t)("Rotate Right"),
      onClick: this.onRotateClockwiseClick
    }), /*#__PURE__*/_react.default.createElement(_AccessibleTooltipButton.default, {
      className: "mx_ImageView_button mx_ImageView_button_download",
      title: (0, _languageHandler._t)("Download"),
      onClick: this.onDownloadClick
    }), contextMenuButton, /*#__PURE__*/_react.default.createElement(_AccessibleTooltipButton.default, {
      className: "mx_ImageView_button mx_ImageView_button_close",
      title: (0, _languageHandler._t)("Close"),
      onClick: this.props.onFinished
    }), this.renderContextMenu())), /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_ImageView_image_wrapper",
      ref: this.imageWrapper,
      onMouseDown: this.props.onFinished,
      onMouseMove: this.onMoving,
      onMouseUp: this.onEndMoving,
      onMouseLeave: this.onEndMoving
    }, /*#__PURE__*/_react.default.createElement("img", {
      src: this.props.src,
      style: style,
      alt: this.props.name,
      ref: this.image,
      className: `mx_ImageView_image ${transitionClassName}`,
      draggable: true,
      onMouseDown: this.onStartMoving
    })));
  }

}

exports.default = ImageView;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJNQVhfU0NBTEUiLCJaT09NX1NURVAiLCJaT09NX0NPRUZGSUNJRU5UIiwiWk9PTV9ESVNUQU5DRSIsImdldFBhbmVsSGVpZ2h0IiwidmFsdWUiLCJnZXRDb21wdXRlZFN0eWxlIiwiZG9jdW1lbnQiLCJkb2N1bWVudEVsZW1lbnQiLCJnZXRQcm9wZXJ0eVZhbHVlIiwicGFyc2VJbnQiLCJzbGljZSIsImxlbmd0aCIsIkltYWdlVmlldyIsIlJlYWN0IiwiQ29tcG9uZW50IiwiY29uc3RydWN0b3IiLCJwcm9wcyIsImNyZWF0ZVJlZiIsInRodW1ibmFpbEluZm8iLCJ3aWR0aCIsInNldFN0YXRlIiwiem9vbSIsImltYWdlIiwiY3VycmVudCIsIm5hdHVyYWxXaWR0aCIsImltYWdlSXNMb2FkZWQiLCJhbmltYXRpbmdMb2FkaW5nIiwic2V0Wm9vbUFuZFJvdGF0aW9uIiwidHJhbnNsYXRpb25YIiwidHJhbnNsYXRpb25ZIiwiaW5wdXRSb3RhdGlvbiIsImltYWdlV3JhcHBlciIsInJvdGF0aW9uIiwic3RhdGUiLCJpbWFnZUlzTm90RmxpcHBlZCIsIm5hdHVyYWxIZWlnaHQiLCJoZWlnaHQiLCJ6b29tWCIsImNsaWVudFdpZHRoIiwiem9vbVkiLCJjbGllbnRIZWlnaHQiLCJtaW5ab29tIiwibWF4Wm9vbSIsIk1hdGgiLCJtaW4iLCJldiIsInRhcmdldCIsInN0b3BQcm9wYWdhdGlvbiIsInByZXZlbnREZWZhdWx0IiwiZGVsdGFZIiwibm9ybWFsaXplV2hlZWxFdmVudCIsInpvb21EZWx0YSIsIm9mZnNldFgiLCJvZmZzZXRZIiwiYWN0aW9uIiwiZ2V0S2V5QmluZGluZ3NNYW5hZ2VyIiwiZ2V0QWNjZXNzaWJpbGl0eUFjdGlvbiIsIktleUJpbmRpbmdBY3Rpb24iLCJFc2NhcGUiLCJvbkZpbmlzaGVkIiwiY3VyIiwiYSIsImNyZWF0ZUVsZW1lbnQiLCJocmVmIiwic3JjIiwiZG93bmxvYWQiLCJuYW1lIiwicmVsIiwiY2xpY2siLCJjb250ZXh0TWVudURpc3BsYXllZCIsImRpcyIsImRpc3BhdGNoIiwiQWN0aW9uIiwiVmlld1Jvb20iLCJldmVudF9pZCIsIm14RXZlbnQiLCJnZXRJZCIsImhpZ2hsaWdodGVkIiwicm9vbV9pZCIsImdldFJvb21JZCIsIm1ldHJpY3NUcmlnZ2VyIiwidW5kZWZpbmVkIiwiYnV0dG9uIiwibmF0aXZlRXZlbnQiLCJtb3ZpbmciLCJwcmV2aW91c1giLCJwcmV2aW91c1kiLCJpbml0WCIsInBhZ2VYIiwiaW5pdFkiLCJwYWdlWSIsImFicyIsInBvc2l0aW9uWCIsIlVJU3RvcmUiLCJpbnN0YW5jZSIsIndpbmRvd1dpZHRoIiwicG9zaXRpb25ZIiwid2luZG93SGVpZ2h0IiwiY29tcG9uZW50RGlkTW91bnQiLCJmb2N1c0xvY2siLCJhZGRFdmVudExpc3RlbmVyIiwib25XaGVlbCIsInBhc3NpdmUiLCJ3aW5kb3ciLCJyZWNhbGN1bGF0ZVpvb20iLCJpbWFnZUxvYWRlZCIsImNvbXBvbmVudFdpbGxVbm1vdW50IiwicmVtb3ZlRXZlbnRMaXN0ZW5lciIsImRlbHRhIiwiYW5jaG9yWCIsImFuY2hvclkiLCJ6b29tTGV2ZWwiLCJvbGRab29tIiwibmV3Wm9vbSIsInJlbmRlckNvbnRleHRNZW51IiwiY29udGV4dE1lbnUiLCJhYm92ZUxlZnRPZiIsImNvbnRleHRNZW51QnV0dG9uIiwiZ2V0Qm91bmRpbmdDbGllbnRSZWN0IiwicGVybWFsaW5rQ3JlYXRvciIsIm9uQ2xvc2VDb250ZXh0TWVudSIsInJlbmRlciIsInNob3dFdmVudE1ldGEiLCJ6b29taW5nRGlzYWJsZWQiLCJ0cmFuc2l0aW9uQ2xhc3NOYW1lIiwiY3Vyc29yIiwicm90YXRpb25EZWdyZWVzIiwidHJhbnNsYXRlUGl4ZWxzWCIsInRyYW5zbGF0ZVBpeGVsc1kiLCJzdHlsZSIsInRyYW5zZm9ybSIsImluZm8iLCJzaG93VHdlbHZlSG91ciIsIlNldHRpbmdzU3RvcmUiLCJnZXRWYWx1ZSIsInBlcm1hbGluayIsImZvckV2ZW50Iiwic2VuZGVyTmFtZSIsInNlbmRlciIsImdldFNlbmRlciIsIm1lc3NhZ2VUaW1lc3RhbXAiLCJvblBlcm1hbGlua0NsaWNrZWQiLCJmb3JtYXRGdWxsRGF0ZSIsIkRhdGUiLCJnZXRUcyIsImF2YXRhciIsIl90Iiwib25PcGVuQ29udGV4dE1lbnUiLCJ6b29tT3V0QnV0dG9uIiwiem9vbUluQnV0dG9uIiwib25ab29tT3V0Q2xpY2siLCJvblpvb21JbkNsaWNrIiwidGl0bGUiLCJnZXRDb250ZW50IiwicHJlc2VudGFibGVUZXh0Rm9yRmlsZSIsIm9uS2V5RG93biIsInJvbGUiLCJvblJvdGF0ZUNvdW50ZXJDbG9ja3dpc2VDbGljayIsIm9uUm90YXRlQ2xvY2t3aXNlQ2xpY2siLCJvbkRvd25sb2FkQ2xpY2siLCJvbk1vdmluZyIsIm9uRW5kTW92aW5nIiwib25TdGFydE1vdmluZyJdLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL2VsZW1lbnRzL0ltYWdlVmlldy50c3giXSwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAyMDE1LCAyMDE2IE9wZW5NYXJrZXQgTHRkXG5Db3B5cmlnaHQgMjAxOSBNaWNoYWVsIFRlbGF0eW5za2kgPDd0M2NoZ3V5QGdtYWlsLmNvbT5cbkNvcHlyaWdodCAyMDIwLCAyMDIxIMWgaW1vbiBCcmFuZG5lciA8c2ltb24uYnJhLmFnQGdtYWlsLmNvbT5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQgUmVhY3QsIHsgY3JlYXRlUmVmIH0gZnJvbSAncmVhY3QnO1xuaW1wb3J0IEZvY3VzTG9jayBmcm9tIFwicmVhY3QtZm9jdXMtbG9ja1wiO1xuaW1wb3J0IHsgTWF0cml4RXZlbnQgfSBmcm9tIFwibWF0cml4LWpzLXNkay9zcmMvbW9kZWxzL2V2ZW50XCI7XG5cbmltcG9ydCB7IF90IH0gZnJvbSAnLi4vLi4vLi4vbGFuZ3VhZ2VIYW5kbGVyJztcbmltcG9ydCBBY2Nlc3NpYmxlVG9vbHRpcEJ1dHRvbiBmcm9tIFwiLi9BY2Nlc3NpYmxlVG9vbHRpcEJ1dHRvblwiO1xuaW1wb3J0IE1lbWJlckF2YXRhciBmcm9tIFwiLi4vYXZhdGFycy9NZW1iZXJBdmF0YXJcIjtcbmltcG9ydCB7IENvbnRleHRNZW51VG9vbHRpcEJ1dHRvbiB9IGZyb20gXCIuLi8uLi8uLi9hY2Nlc3NpYmlsaXR5L2NvbnRleHRfbWVudS9Db250ZXh0TWVudVRvb2x0aXBCdXR0b25cIjtcbmltcG9ydCBNZXNzYWdlQ29udGV4dE1lbnUgZnJvbSBcIi4uL2NvbnRleHRfbWVudXMvTWVzc2FnZUNvbnRleHRNZW51XCI7XG5pbXBvcnQgeyBhYm92ZUxlZnRPZiB9IGZyb20gJy4uLy4uL3N0cnVjdHVyZXMvQ29udGV4dE1lbnUnO1xuaW1wb3J0IE1lc3NhZ2VUaW1lc3RhbXAgZnJvbSBcIi4uL21lc3NhZ2VzL01lc3NhZ2VUaW1lc3RhbXBcIjtcbmltcG9ydCBTZXR0aW5nc1N0b3JlIGZyb20gXCIuLi8uLi8uLi9zZXR0aW5ncy9TZXR0aW5nc1N0b3JlXCI7XG5pbXBvcnQgeyBmb3JtYXRGdWxsRGF0ZSB9IGZyb20gXCIuLi8uLi8uLi9EYXRlVXRpbHNcIjtcbmltcG9ydCBkaXMgZnJvbSAnLi4vLi4vLi4vZGlzcGF0Y2hlci9kaXNwYXRjaGVyJztcbmltcG9ydCB7IEFjdGlvbiB9IGZyb20gJy4uLy4uLy4uL2Rpc3BhdGNoZXIvYWN0aW9ucyc7XG5pbXBvcnQgeyBSb29tUGVybWFsaW5rQ3JlYXRvciB9IGZyb20gXCIuLi8uLi8uLi91dGlscy9wZXJtYWxpbmtzL1Blcm1hbGlua3NcIjtcbmltcG9ydCB7IG5vcm1hbGl6ZVdoZWVsRXZlbnQgfSBmcm9tIFwiLi4vLi4vLi4vdXRpbHMvTW91c2VcIjtcbmltcG9ydCB7IElEaWFsb2dQcm9wcyB9IGZyb20gJy4uL2RpYWxvZ3MvSURpYWxvZ1Byb3BzJztcbmltcG9ydCBVSVN0b3JlIGZyb20gJy4uLy4uLy4uL3N0b3Jlcy9VSVN0b3JlJztcbmltcG9ydCB7IFZpZXdSb29tUGF5bG9hZCB9IGZyb20gXCIuLi8uLi8uLi9kaXNwYXRjaGVyL3BheWxvYWRzL1ZpZXdSb29tUGF5bG9hZFwiO1xuaW1wb3J0IHsgS2V5QmluZGluZ0FjdGlvbiB9IGZyb20gXCIuLi8uLi8uLi9hY2Nlc3NpYmlsaXR5L0tleWJvYXJkU2hvcnRjdXRzXCI7XG5pbXBvcnQgeyBnZXRLZXlCaW5kaW5nc01hbmFnZXIgfSBmcm9tIFwiLi4vLi4vLi4vS2V5QmluZGluZ3NNYW5hZ2VyXCI7XG5pbXBvcnQgeyBwcmVzZW50YWJsZVRleHRGb3JGaWxlIH0gZnJvbSBcIi4uLy4uLy4uL3V0aWxzL0ZpbGVVdGlsc1wiO1xuXG4vLyBNYXggc2NhbGUgdG8ga2VlcCBnYXBzIGFyb3VuZCB0aGUgaW1hZ2VcbmNvbnN0IE1BWF9TQ0FMRSA9IDAuOTU7XG4vLyBUaGlzIGlzIHVzZWQgZm9yIHRoZSBidXR0b25zXG5jb25zdCBaT09NX1NURVAgPSAwLjEwO1xuLy8gVGhpcyBpcyB1c2VkIGZvciBtb3VzZSB3aGVlbCBldmVudHNcbmNvbnN0IFpPT01fQ09FRkZJQ0lFTlQgPSAwLjAwMjU7XG4vLyBJZiB3ZSBoYXZlIG1vdmVkIG9ubHkgdGhpcyBtdWNoIHdlIGNhbiB6b29tXG5jb25zdCBaT09NX0RJU1RBTkNFID0gMTA7XG5cbi8vIEhlaWdodCBvZiBteF9JbWFnZVZpZXdfcGFuZWxcbmNvbnN0IGdldFBhbmVsSGVpZ2h0ID0gKCk6IG51bWJlciA9PiB7XG4gICAgY29uc3QgdmFsdWUgPSBnZXRDb21wdXRlZFN0eWxlKGRvY3VtZW50LmRvY3VtZW50RWxlbWVudCkuZ2V0UHJvcGVydHlWYWx1ZShcIi0taW1hZ2Utdmlldy1wYW5lbC1oZWlnaHRcIik7XG4gICAgLy8gUmV0dXJuIHRoZSB2YWx1ZSBhcyBhIG51bWJlciB3aXRob3V0IHRoZSB1bml0XG4gICAgcmV0dXJuIHBhcnNlSW50KHZhbHVlLnNsaWNlKDAsIHZhbHVlLmxlbmd0aCAtIDIpKTtcbn07XG5cbmludGVyZmFjZSBJUHJvcHMgZXh0ZW5kcyBJRGlhbG9nUHJvcHMge1xuICAgIHNyYzogc3RyaW5nOyAvLyB0aGUgc291cmNlIG9mIHRoZSBpbWFnZSBiZWluZyBkaXNwbGF5ZWRcbiAgICBuYW1lPzogc3RyaW5nOyAvLyB0aGUgbWFpbiB0aXRsZSAoJ25hbWUnKSBmb3IgdGhlIGltYWdlXG4gICAgbGluaz86IHN0cmluZzsgLy8gdGhlIGxpbmsgKGlmIGFueSkgYXBwbGllZCB0byB0aGUgbmFtZSBvZiB0aGUgaW1hZ2VcbiAgICB3aWR0aD86IG51bWJlcjsgLy8gd2lkdGggb2YgdGhlIGltYWdlIHNyYyBpbiBwaXhlbHNcbiAgICBoZWlnaHQ/OiBudW1iZXI7IC8vIGhlaWdodCBvZiB0aGUgaW1hZ2Ugc3JjIGluIHBpeGVsc1xuICAgIGZpbGVTaXplPzogbnVtYmVyOyAvLyBzaXplIG9mIHRoZSBpbWFnZSBzcmMgaW4gYnl0ZXNcblxuICAgIC8vIHRoZSBldmVudCAoaWYgYW55KSB0aGF0IHRoZSBJbWFnZSBpcyBkaXNwbGF5aW5nLiBVc2VkIGZvciBldmVudC1zcGVjaWZpYyBzdHVmZiBsaWtlXG4gICAgLy8gcmVkYWN0aW9ucywgc2VuZGVycywgdGltZXN0YW1wcyBldGMuICBPdGhlciBkZXNjcmlwdG9ycyBhcmUgdGFrZW4gZnJvbSB0aGUgZXhwbGljaXRcbiAgICAvLyBwcm9wZXJ0aWVzIGFib3ZlLCB3aGljaCBsZXQgdXMgdXNlIGxpZ2h0Ym94ZXMgdG8gZGlzcGxheSBpbWFnZXMgd2hpY2ggYXJlbid0IGFzc29jaWF0ZWRcbiAgICAvLyB3aXRoIGV2ZW50cy5cbiAgICBteEV2ZW50PzogTWF0cml4RXZlbnQ7XG4gICAgcGVybWFsaW5rQ3JlYXRvcj86IFJvb21QZXJtYWxpbmtDcmVhdG9yO1xuXG4gICAgdGh1bWJuYWlsSW5mbz86IHtcbiAgICAgICAgcG9zaXRpb25YOiBudW1iZXI7XG4gICAgICAgIHBvc2l0aW9uWTogbnVtYmVyO1xuICAgICAgICB3aWR0aDogbnVtYmVyO1xuICAgICAgICBoZWlnaHQ6IG51bWJlcjtcbiAgICB9O1xufVxuXG5pbnRlcmZhY2UgSVN0YXRlIHtcbiAgICB6b29tOiBudW1iZXI7XG4gICAgbWluWm9vbTogbnVtYmVyO1xuICAgIG1heFpvb206IG51bWJlcjtcbiAgICByb3RhdGlvbjogbnVtYmVyO1xuICAgIHRyYW5zbGF0aW9uWDogbnVtYmVyO1xuICAgIHRyYW5zbGF0aW9uWTogbnVtYmVyO1xuICAgIG1vdmluZzogYm9vbGVhbjtcbiAgICBjb250ZXh0TWVudURpc3BsYXllZDogYm9vbGVhbjtcbn1cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgSW1hZ2VWaWV3IGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50PElQcm9wcywgSVN0YXRlPiB7XG4gICAgY29uc3RydWN0b3IocHJvcHMpIHtcbiAgICAgICAgc3VwZXIocHJvcHMpO1xuXG4gICAgICAgIGNvbnN0IHsgdGh1bWJuYWlsSW5mbyB9ID0gdGhpcy5wcm9wcztcblxuICAgICAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgICAgICAgem9vbTogMCwgLy8gV2UgZGVmYXVsdCB0byAwIGFuZCBvdmVycmlkZSB0aGlzIGluIGltYWdlTG9hZGVkIG9uY2Ugd2UgaGF2ZSBuYXR1cmFsU2l6ZVxuICAgICAgICAgICAgbWluWm9vbTogTUFYX1NDQUxFLFxuICAgICAgICAgICAgbWF4Wm9vbTogTUFYX1NDQUxFLFxuICAgICAgICAgICAgcm90YXRpb246IDAsXG4gICAgICAgICAgICB0cmFuc2xhdGlvblg6IChcbiAgICAgICAgICAgICAgICB0aHVtYm5haWxJbmZvPy5wb3NpdGlvblggK1xuICAgICAgICAgICAgICAgICh0aHVtYm5haWxJbmZvPy53aWR0aCAvIDIpIC1cbiAgICAgICAgICAgICAgICAoVUlTdG9yZS5pbnN0YW5jZS53aW5kb3dXaWR0aCAvIDIpXG4gICAgICAgICAgICApID8/IDAsXG4gICAgICAgICAgICB0cmFuc2xhdGlvblk6IChcbiAgICAgICAgICAgICAgICB0aHVtYm5haWxJbmZvPy5wb3NpdGlvblkgK1xuICAgICAgICAgICAgICAgICh0aHVtYm5haWxJbmZvPy5oZWlnaHQgLyAyKSAtXG4gICAgICAgICAgICAgICAgKFVJU3RvcmUuaW5zdGFuY2Uud2luZG93SGVpZ2h0IC8gMikgLVxuICAgICAgICAgICAgICAgIChnZXRQYW5lbEhlaWdodCgpIC8gMilcbiAgICAgICAgICAgICkgPz8gMCxcbiAgICAgICAgICAgIG1vdmluZzogZmFsc2UsXG4gICAgICAgICAgICBjb250ZXh0TWVudURpc3BsYXllZDogZmFsc2UsXG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgLy8gWFhYOiBSZWZzIHRvIGZ1bmN0aW9uYWwgY29tcG9uZW50c1xuICAgIHByaXZhdGUgY29udGV4dE1lbnVCdXR0b24gPSBjcmVhdGVSZWY8YW55PigpO1xuICAgIHByaXZhdGUgZm9jdXNMb2NrID0gY3JlYXRlUmVmPGFueT4oKTtcbiAgICBwcml2YXRlIGltYWdlV3JhcHBlciA9IGNyZWF0ZVJlZjxIVE1MRGl2RWxlbWVudD4oKTtcbiAgICBwcml2YXRlIGltYWdlID0gY3JlYXRlUmVmPEhUTUxJbWFnZUVsZW1lbnQ+KCk7XG5cbiAgICBwcml2YXRlIGluaXRYID0gMDtcbiAgICBwcml2YXRlIGluaXRZID0gMDtcbiAgICBwcml2YXRlIHByZXZpb3VzWCA9IDA7XG4gICAgcHJpdmF0ZSBwcmV2aW91c1kgPSAwO1xuXG4gICAgcHJpdmF0ZSBhbmltYXRpbmdMb2FkaW5nID0gZmFsc2U7XG4gICAgcHJpdmF0ZSBpbWFnZUlzTG9hZGVkID0gZmFsc2U7XG5cbiAgICBjb21wb25lbnREaWRNb3VudCgpIHtcbiAgICAgICAgLy8gV2UgaGF2ZSB0byB1c2UgYWRkRXZlbnRMaXN0ZW5lcigpIGJlY2F1c2UgdGhlIGxpc3RlbmVyXG4gICAgICAgIC8vIG5lZWRzIHRvIGJlIHBhc3NpdmUgaW4gb3JkZXIgdG8gd29yayB3aXRoIENocm9taXVtXG4gICAgICAgIHRoaXMuZm9jdXNMb2NrLmN1cnJlbnQuYWRkRXZlbnRMaXN0ZW5lcignd2hlZWwnLCB0aGlzLm9uV2hlZWwsIHsgcGFzc2l2ZTogZmFsc2UgfSk7XG4gICAgICAgIC8vIFdlIHdhbnQgdG8gcmVjYWxjdWxhdGUgem9vbSB3aGVuZXZlciB0aGUgd2luZG93J3Mgc2l6ZSBjaGFuZ2VzXG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwicmVzaXplXCIsIHRoaXMucmVjYWxjdWxhdGVab29tKTtcbiAgICAgICAgLy8gQWZ0ZXIgdGhlIGltYWdlIGxvYWRzIGZvciB0aGUgZmlyc3QgdGltZSB3ZSB3YW50IHRvIGNhbGN1bGF0ZSB0aGUgem9vbVxuICAgICAgICB0aGlzLmltYWdlLmN1cnJlbnQuYWRkRXZlbnRMaXN0ZW5lcihcImxvYWRcIiwgdGhpcy5pbWFnZUxvYWRlZCk7XG4gICAgfVxuXG4gICAgY29tcG9uZW50V2lsbFVubW91bnQoKSB7XG4gICAgICAgIHRoaXMuZm9jdXNMb2NrLmN1cnJlbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignd2hlZWwnLCB0aGlzLm9uV2hlZWwpO1xuICAgICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcihcInJlc2l6ZVwiLCB0aGlzLnJlY2FsY3VsYXRlWm9vbSk7XG4gICAgICAgIHRoaXMuaW1hZ2UuY3VycmVudC5yZW1vdmVFdmVudExpc3RlbmVyKFwibG9hZFwiLCB0aGlzLmltYWdlTG9hZGVkKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGltYWdlTG9hZGVkID0gKCkgPT4ge1xuICAgICAgICAvLyBGaXJzdCwgd2UgY2FsY3VsYXRlIHRoZSB6b29tLCBzbyB0aGF0IHRoZSBpbWFnZSBoYXMgdGhlIHNhbWUgc2l6ZSBhc1xuICAgICAgICAvLyB0aGUgdGh1bWJuYWlsXG4gICAgICAgIGNvbnN0IHsgdGh1bWJuYWlsSW5mbyB9ID0gdGhpcy5wcm9wcztcbiAgICAgICAgaWYgKHRodW1ibmFpbEluZm8/LndpZHRoKSB7XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHsgem9vbTogdGh1bWJuYWlsSW5mby53aWR0aCAvIHRoaXMuaW1hZ2UuY3VycmVudC5uYXR1cmFsV2lkdGggfSk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBPbmNlIHRoZSB6b29tIGlzIHNldCwgd2UgdGhlIGltYWdlIGlzIGNvbnNpZGVyZWQgbG9hZGVkIGFuZCB3ZSBjYW5cbiAgICAgICAgLy8gc3RhcnQgYW5pbWF0aW5nIGl0IGludG8gdGhlIGNlbnRlciBvZiB0aGUgc2NyZWVuXG4gICAgICAgIHRoaXMuaW1hZ2VJc0xvYWRlZCA9IHRydWU7XG4gICAgICAgIHRoaXMuYW5pbWF0aW5nTG9hZGluZyA9IHRydWU7XG4gICAgICAgIHRoaXMuc2V0Wm9vbUFuZFJvdGF0aW9uKCk7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgdHJhbnNsYXRpb25YOiAwLFxuICAgICAgICAgICAgdHJhbnNsYXRpb25ZOiAwLFxuICAgICAgICB9KTtcblxuICAgICAgICAvLyBPbmNlIHRoZSBwb3NpdGlvbiBpcyBzZXQsIHRoZXJlIGlzIG5vIG5lZWQgdG8gYW5pbWF0ZSBhbnltb3JlXG4gICAgICAgIHRoaXMuYW5pbWF0aW5nTG9hZGluZyA9IGZhbHNlO1xuICAgIH07XG5cbiAgICBwcml2YXRlIHJlY2FsY3VsYXRlWm9vbSA9ICgpID0+IHtcbiAgICAgICAgdGhpcy5zZXRab29tQW5kUm90YXRpb24oKTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBzZXRab29tQW5kUm90YXRpb24gPSAoaW5wdXRSb3RhdGlvbj86IG51bWJlcikgPT4ge1xuICAgICAgICBjb25zdCBpbWFnZSA9IHRoaXMuaW1hZ2UuY3VycmVudDtcbiAgICAgICAgY29uc3QgaW1hZ2VXcmFwcGVyID0gdGhpcy5pbWFnZVdyYXBwZXIuY3VycmVudDtcblxuICAgICAgICBjb25zdCByb3RhdGlvbiA9IGlucHV0Um90YXRpb24gPz8gdGhpcy5zdGF0ZS5yb3RhdGlvbjtcblxuICAgICAgICBjb25zdCBpbWFnZUlzTm90RmxpcHBlZCA9IHJvdGF0aW9uICUgMTgwID09PSAwO1xuXG4gICAgICAgIC8vIElmIHRoZSBpbWFnZSBpcyByb3RhdGVkIHRha2UgaXQgaW50byBhY2NvdW50XG4gICAgICAgIGNvbnN0IHdpZHRoID0gaW1hZ2VJc05vdEZsaXBwZWQgPyBpbWFnZS5uYXR1cmFsV2lkdGggOiBpbWFnZS5uYXR1cmFsSGVpZ2h0O1xuICAgICAgICBjb25zdCBoZWlnaHQgPSBpbWFnZUlzTm90RmxpcHBlZCA/IGltYWdlLm5hdHVyYWxIZWlnaHQgOiBpbWFnZS5uYXR1cmFsV2lkdGg7XG5cbiAgICAgICAgY29uc3Qgem9vbVggPSBpbWFnZVdyYXBwZXIuY2xpZW50V2lkdGggLyB3aWR0aDtcbiAgICAgICAgY29uc3Qgem9vbVkgPSBpbWFnZVdyYXBwZXIuY2xpZW50SGVpZ2h0IC8gaGVpZ2h0O1xuXG4gICAgICAgIC8vIElmIHRoZSBpbWFnZSBpcyBzbWFsbGVyIGluIGJvdGggZGltZW5zaW9ucyBzZXQgaXRzIHRoZSB6b29tIHRvIDEgdG9cbiAgICAgICAgLy8gZGlzcGxheSBpdCBpbiBpdHMgb3JpZ2luYWwgc2l6ZVxuICAgICAgICBpZiAoem9vbVggPj0gMSAmJiB6b29tWSA+PSAxKSB7XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgICAgICB6b29tOiAxLFxuICAgICAgICAgICAgICAgIG1pblpvb206IDEsXG4gICAgICAgICAgICAgICAgbWF4Wm9vbTogMSxcbiAgICAgICAgICAgICAgICByb3RhdGlvbjogcm90YXRpb24sXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICAvLyBXZSBzZXQgbWluWm9vbSB0byB0aGUgbWluIG9mIHRoZSB6b29tWCBhbmQgem9vbVkgdG8gYXZvaWQgb3ZlcmZsb3cgaW5cbiAgICAgICAgLy8gYW55IGRpcmVjdGlvbi4gV2UgYWxzbyBtdWx0aXBseSBieSBNQVhfU0NBTEUgdG8gZ2V0IGEgZ2FwIGFyb3VuZCB0aGVcbiAgICAgICAgLy8gaW1hZ2UgYnkgZGVmYXVsdFxuICAgICAgICBjb25zdCBtaW5ab29tID0gTWF0aC5taW4oem9vbVgsIHpvb21ZKSAqIE1BWF9TQ0FMRTtcblxuICAgICAgICAvLyBJZiB6b29tIGlzIHNtYWxsZXIgdGhhbiBtaW5ab29tIGRvbid0IGdvIGJlbG93IHRoYXQgdmFsdWVcbiAgICAgICAgY29uc3Qgem9vbSA9ICh0aGlzLnN0YXRlLnpvb20gPD0gdGhpcy5zdGF0ZS5taW5ab29tKSA/IG1pblpvb20gOiB0aGlzLnN0YXRlLnpvb207XG5cbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICBtaW5ab29tOiBtaW5ab29tLFxuICAgICAgICAgICAgbWF4Wm9vbTogMSxcbiAgICAgICAgICAgIHJvdGF0aW9uOiByb3RhdGlvbixcbiAgICAgICAgICAgIHpvb206IHpvb20sXG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICBwcml2YXRlIHpvb21EZWx0YShkZWx0YTogbnVtYmVyLCBhbmNob3JYPzogbnVtYmVyLCBhbmNob3JZPzogbnVtYmVyKSB7XG4gICAgICAgIHRoaXMuem9vbSh0aGlzLnN0YXRlLnpvb20gKyBkZWx0YSwgYW5jaG9yWCwgYW5jaG9yWSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSB6b29tKHpvb21MZXZlbDogbnVtYmVyLCBhbmNob3JYPzogbnVtYmVyLCBhbmNob3JZPzogbnVtYmVyKSB7XG4gICAgICAgIGNvbnN0IG9sZFpvb20gPSB0aGlzLnN0YXRlLnpvb207XG4gICAgICAgIGNvbnN0IG5ld1pvb20gPSBNYXRoLm1pbih6b29tTGV2ZWwsIHRoaXMuc3RhdGUubWF4Wm9vbSk7XG5cbiAgICAgICAgaWYgKG5ld1pvb20gPD0gdGhpcy5zdGF0ZS5taW5ab29tKSB7XG4gICAgICAgICAgICAvLyBab29tIG91dCBmdWxseVxuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICAgICAgem9vbTogdGhpcy5zdGF0ZS5taW5ab29tLFxuICAgICAgICAgICAgICAgIHRyYW5zbGF0aW9uWDogMCxcbiAgICAgICAgICAgICAgICB0cmFuc2xhdGlvblk6IDAsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgYW5jaG9yWCAhPT0gXCJudW1iZXJcIiAmJiB0eXBlb2YgYW5jaG9yWSAhPT0gXCJudW1iZXJcIikge1xuICAgICAgICAgICAgLy8gWm9vbSByZWxhdGl2ZSB0byB0aGUgY2VudGVyIG9mIHRoZSB2aWV3XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgICAgICB6b29tOiBuZXdab29tLFxuICAgICAgICAgICAgICAgIHRyYW5zbGF0aW9uWDogdGhpcy5zdGF0ZS50cmFuc2xhdGlvblggKiBuZXdab29tIC8gb2xkWm9vbSxcbiAgICAgICAgICAgICAgICB0cmFuc2xhdGlvblk6IHRoaXMuc3RhdGUudHJhbnNsYXRpb25ZICogbmV3Wm9vbSAvIG9sZFpvb20sXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIFpvb20gcmVsYXRpdmUgdG8gdGhlIGdpdmVuIHBvaW50IG9uIHRoZSBpbWFnZS5cbiAgICAgICAgICAgIC8vIEZpcnN0IHdlIG5lZWQgdG8gZmlndXJlIG91dCB0aGUgb2Zmc2V0IG9mIHRoZSBhbmNob3IgcG9pbnRcbiAgICAgICAgICAgIC8vIHJlbGF0aXZlIHRvIHRoZSBjZW50ZXIgb2YgdGhlIGltYWdlLCBhY2NvdW50aW5nIGZvciByb3RhdGlvbi5cbiAgICAgICAgICAgIGxldCBvZmZzZXRYO1xuICAgICAgICAgICAgbGV0IG9mZnNldFk7XG4gICAgICAgICAgICAvLyBUaGUgbW9kdWxvIG9wZXJhdG9yIGNhbiByZXR1cm4gbmVnYXRpdmUgdmFsdWVzIGZvciBzb21lXG4gICAgICAgICAgICAvLyByb3RhdGlvbnMsIHNvIHdlIGhhdmUgdG8gZG8gc29tZSBleHRyYSB3b3JrIHRvIG5vcm1hbGl6ZSBpdFxuICAgICAgICAgICAgc3dpdGNoICgoKHRoaXMuc3RhdGUucm90YXRpb24gJSAzNjApICsgMzYwKSAlIDM2MCkge1xuICAgICAgICAgICAgICAgIGNhc2UgMDpcbiAgICAgICAgICAgICAgICAgICAgb2Zmc2V0WCA9IHRoaXMuaW1hZ2UuY3VycmVudC5jbGllbnRXaWR0aCAvIDIgLSBhbmNob3JYO1xuICAgICAgICAgICAgICAgICAgICBvZmZzZXRZID0gdGhpcy5pbWFnZS5jdXJyZW50LmNsaWVudEhlaWdodCAvIDIgLSBhbmNob3JZO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIDkwOlxuICAgICAgICAgICAgICAgICAgICBvZmZzZXRYID0gYW5jaG9yWSAtIHRoaXMuaW1hZ2UuY3VycmVudC5jbGllbnRIZWlnaHQgLyAyO1xuICAgICAgICAgICAgICAgICAgICBvZmZzZXRZID0gdGhpcy5pbWFnZS5jdXJyZW50LmNsaWVudFdpZHRoIC8gMiAtIGFuY2hvclg7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgMTgwOlxuICAgICAgICAgICAgICAgICAgICBvZmZzZXRYID0gYW5jaG9yWCAtIHRoaXMuaW1hZ2UuY3VycmVudC5jbGllbnRXaWR0aCAvIDI7XG4gICAgICAgICAgICAgICAgICAgIG9mZnNldFkgPSBhbmNob3JZIC0gdGhpcy5pbWFnZS5jdXJyZW50LmNsaWVudEhlaWdodCAvIDI7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgMjcwOlxuICAgICAgICAgICAgICAgICAgICBvZmZzZXRYID0gdGhpcy5pbWFnZS5jdXJyZW50LmNsaWVudEhlaWdodCAvIDIgLSBhbmNob3JZO1xuICAgICAgICAgICAgICAgICAgICBvZmZzZXRZID0gYW5jaG9yWCAtIHRoaXMuaW1hZ2UuY3VycmVudC5jbGllbnRXaWR0aCAvIDI7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIEFwcGx5IHRoZSB6b29tIGFuZCBvZmZzZXRcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgIHpvb206IG5ld1pvb20sXG4gICAgICAgICAgICAgICAgdHJhbnNsYXRpb25YOiB0aGlzLnN0YXRlLnRyYW5zbGF0aW9uWCArIChuZXdab29tIC0gb2xkWm9vbSkgKiBvZmZzZXRYLFxuICAgICAgICAgICAgICAgIHRyYW5zbGF0aW9uWTogdGhpcy5zdGF0ZS50cmFuc2xhdGlvblkgKyAobmV3Wm9vbSAtIG9sZFpvb20pICogb2Zmc2V0WSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBvbldoZWVsID0gKGV2OiBXaGVlbEV2ZW50KSA9PiB7XG4gICAgICAgIGlmIChldi50YXJnZXQgPT09IHRoaXMuaW1hZ2UuY3VycmVudCkge1xuICAgICAgICAgICAgZXYuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgICBldi5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgICAgICAgICBjb25zdCB7IGRlbHRhWSB9ID0gbm9ybWFsaXplV2hlZWxFdmVudChldik7XG4gICAgICAgICAgICAvLyBab29tIGluIG9uIHRoZSBwb2ludCBvbiB0aGUgaW1hZ2UgdGFyZ2V0ZWQgYnkgdGhlIGN1cnNvclxuICAgICAgICAgICAgdGhpcy56b29tRGVsdGEoLWRlbHRhWSAqIFpPT01fQ09FRkZJQ0lFTlQsIGV2Lm9mZnNldFgsIGV2Lm9mZnNldFkpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25ab29tSW5DbGljayA9ICgpID0+IHtcbiAgICAgICAgdGhpcy56b29tRGVsdGEoWk9PTV9TVEVQKTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvblpvb21PdXRDbGljayA9ICgpID0+IHtcbiAgICAgICAgdGhpcy56b29tRGVsdGEoLVpPT01fU1RFUCk7XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25LZXlEb3duID0gKGV2OiBLZXlib2FyZEV2ZW50KSA9PiB7XG4gICAgICAgIGNvbnN0IGFjdGlvbiA9IGdldEtleUJpbmRpbmdzTWFuYWdlcigpLmdldEFjY2Vzc2liaWxpdHlBY3Rpb24oZXYpO1xuICAgICAgICBzd2l0Y2ggKGFjdGlvbikge1xuICAgICAgICAgICAgY2FzZSBLZXlCaW5kaW5nQWN0aW9uLkVzY2FwZTpcbiAgICAgICAgICAgICAgICBldi5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgICAgICBldi5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgICAgIHRoaXMucHJvcHMub25GaW5pc2hlZCgpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25Sb3RhdGVDb3VudGVyQ2xvY2t3aXNlQ2xpY2sgPSAoKSA9PiB7XG4gICAgICAgIGNvbnN0IGN1ciA9IHRoaXMuc3RhdGUucm90YXRpb247XG4gICAgICAgIHRoaXMuc2V0Wm9vbUFuZFJvdGF0aW9uKGN1ciAtIDkwKTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvblJvdGF0ZUNsb2Nrd2lzZUNsaWNrID0gKCkgPT4ge1xuICAgICAgICBjb25zdCBjdXIgPSB0aGlzLnN0YXRlLnJvdGF0aW9uO1xuICAgICAgICB0aGlzLnNldFpvb21BbmRSb3RhdGlvbihjdXIgKyA5MCk7XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25Eb3dubG9hZENsaWNrID0gKCkgPT4ge1xuICAgICAgICBjb25zdCBhID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImFcIik7XG4gICAgICAgIGEuaHJlZiA9IHRoaXMucHJvcHMuc3JjO1xuICAgICAgICBhLmRvd25sb2FkID0gdGhpcy5wcm9wcy5uYW1lO1xuICAgICAgICBhLnRhcmdldCA9IFwiX2JsYW5rXCI7XG4gICAgICAgIGEucmVsID0gXCJub3JlZmVycmVyIG5vb3BlbmVyXCI7XG4gICAgICAgIGEuY2xpY2soKTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvbk9wZW5Db250ZXh0TWVudSA9ICgpID0+IHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICBjb250ZXh0TWVudURpc3BsYXllZDogdHJ1ZSxcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25DbG9zZUNvbnRleHRNZW51ID0gKCkgPT4ge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIGNvbnRleHRNZW51RGlzcGxheWVkOiBmYWxzZSxcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25QZXJtYWxpbmtDbGlja2VkID0gKGV2OiBSZWFjdC5Nb3VzZUV2ZW50KSA9PiB7XG4gICAgICAgIC8vIFRoaXMgYWxsb3dzIHRoZSBwZXJtYWxpbmsgdG8gYmUgb3BlbmVkIGluIGEgbmV3IHRhYi93aW5kb3cgb3IgY29waWVkIGFzXG4gICAgICAgIC8vIG1hdHJpeC50bywgYnV0IGFsc28gZm9yIGl0IHRvIGVuYWJsZSByb3V0aW5nIHdpdGhpbiBFbGVtZW50IHdoZW4gY2xpY2tlZC5cbiAgICAgICAgZXYucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgZGlzLmRpc3BhdGNoPFZpZXdSb29tUGF5bG9hZD4oe1xuICAgICAgICAgICAgYWN0aW9uOiBBY3Rpb24uVmlld1Jvb20sXG4gICAgICAgICAgICBldmVudF9pZDogdGhpcy5wcm9wcy5teEV2ZW50LmdldElkKCksXG4gICAgICAgICAgICBoaWdobGlnaHRlZDogdHJ1ZSxcbiAgICAgICAgICAgIHJvb21faWQ6IHRoaXMucHJvcHMubXhFdmVudC5nZXRSb29tSWQoKSxcbiAgICAgICAgICAgIG1ldHJpY3NUcmlnZ2VyOiB1bmRlZmluZWQsIC8vIHJvb20gZG9lc24ndCBjaGFuZ2VcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMucHJvcHMub25GaW5pc2hlZCgpO1xuICAgIH07XG5cbiAgICBwcml2YXRlIG9uU3RhcnRNb3ZpbmcgPSAoZXY6IFJlYWN0Lk1vdXNlRXZlbnQpID0+IHtcbiAgICAgICAgZXYuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgIGV2LnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICAgICAgLy8gRG9uJ3QgZG8gYW55dGhpbmcgaWYgd2UgcHJlc3NlZCBhbnlcbiAgICAgICAgLy8gb3RoZXIgYnV0dG9uIHRoYW4gdGhlIGxlZnQgb25lXG4gICAgICAgIGlmIChldi5idXR0b24gIT09IDApIHJldHVybjtcblxuICAgICAgICAvLyBab29tIGluIGlmIHdlIGFyZSBjb21wbGV0ZWx5IHpvb21lZCBvdXRcbiAgICAgICAgaWYgKHRoaXMuc3RhdGUuem9vbSA9PT0gdGhpcy5zdGF0ZS5taW5ab29tKSB7XG4gICAgICAgICAgICB0aGlzLnpvb20odGhpcy5zdGF0ZS5tYXhab29tLCBldi5uYXRpdmVFdmVudC5vZmZzZXRYLCBldi5uYXRpdmVFdmVudC5vZmZzZXRZKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuc2V0U3RhdGUoeyBtb3Zpbmc6IHRydWUgfSk7XG4gICAgICAgIHRoaXMucHJldmlvdXNYID0gdGhpcy5zdGF0ZS50cmFuc2xhdGlvblg7XG4gICAgICAgIHRoaXMucHJldmlvdXNZID0gdGhpcy5zdGF0ZS50cmFuc2xhdGlvblk7XG4gICAgICAgIHRoaXMuaW5pdFggPSBldi5wYWdlWCAtIHRoaXMuc3RhdGUudHJhbnNsYXRpb25YO1xuICAgICAgICB0aGlzLmluaXRZID0gZXYucGFnZVkgLSB0aGlzLnN0YXRlLnRyYW5zbGF0aW9uWTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvbk1vdmluZyA9IChldjogUmVhY3QuTW91c2VFdmVudCkgPT4ge1xuICAgICAgICBldi5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgZXYucHJldmVudERlZmF1bHQoKTtcblxuICAgICAgICBpZiAoIXRoaXMuc3RhdGUubW92aW5nKSByZXR1cm47XG5cbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICB0cmFuc2xhdGlvblg6IGV2LnBhZ2VYIC0gdGhpcy5pbml0WCxcbiAgICAgICAgICAgIHRyYW5zbGF0aW9uWTogZXYucGFnZVkgLSB0aGlzLmluaXRZLFxuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvbkVuZE1vdmluZyA9ICgpID0+IHtcbiAgICAgICAgLy8gWm9vbSBvdXQgaWYgd2UgaGF2ZW4ndCBtb3ZlZCBtdWNoXG4gICAgICAgIGlmIChcbiAgICAgICAgICAgIHRoaXMuc3RhdGUubW92aW5nID09PSB0cnVlICYmXG4gICAgICAgICAgICBNYXRoLmFicyh0aGlzLnN0YXRlLnRyYW5zbGF0aW9uWCAtIHRoaXMucHJldmlvdXNYKSA8IFpPT01fRElTVEFOQ0UgJiZcbiAgICAgICAgICAgIE1hdGguYWJzKHRoaXMuc3RhdGUudHJhbnNsYXRpb25ZIC0gdGhpcy5wcmV2aW91c1kpIDwgWk9PTV9ESVNUQU5DRVxuICAgICAgICApIHtcbiAgICAgICAgICAgIHRoaXMuem9vbSh0aGlzLnN0YXRlLm1pblpvb20pO1xuICAgICAgICAgICAgdGhpcy5pbml0WCA9IDA7XG4gICAgICAgICAgICB0aGlzLmluaXRZID0gMDtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnNldFN0YXRlKHsgbW92aW5nOiBmYWxzZSB9KTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSByZW5kZXJDb250ZXh0TWVudSgpIHtcbiAgICAgICAgbGV0IGNvbnRleHRNZW51ID0gbnVsbDtcbiAgICAgICAgaWYgKHRoaXMuc3RhdGUuY29udGV4dE1lbnVEaXNwbGF5ZWQpIHtcbiAgICAgICAgICAgIGNvbnRleHRNZW51ID0gKFxuICAgICAgICAgICAgICAgIDxNZXNzYWdlQ29udGV4dE1lbnVcbiAgICAgICAgICAgICAgICAgICAgey4uLmFib3ZlTGVmdE9mKHRoaXMuY29udGV4dE1lbnVCdXR0b24uY3VycmVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKSl9XG4gICAgICAgICAgICAgICAgICAgIG14RXZlbnQ9e3RoaXMucHJvcHMubXhFdmVudH1cbiAgICAgICAgICAgICAgICAgICAgcGVybWFsaW5rQ3JlYXRvcj17dGhpcy5wcm9wcy5wZXJtYWxpbmtDcmVhdG9yfVxuICAgICAgICAgICAgICAgICAgICBvbkZpbmlzaGVkPXt0aGlzLm9uQ2xvc2VDb250ZXh0TWVudX1cbiAgICAgICAgICAgICAgICAgICAgb25DbG9zZURpYWxvZz17dGhpcy5wcm9wcy5vbkZpbmlzaGVkfVxuICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICApO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDxSZWFjdC5GcmFnbWVudD5cbiAgICAgICAgICAgICAgICB7IGNvbnRleHRNZW51IH1cbiAgICAgICAgICAgIDwvUmVhY3QuRnJhZ21lbnQ+XG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgcmVuZGVyKCkge1xuICAgICAgICBjb25zdCBzaG93RXZlbnRNZXRhID0gISF0aGlzLnByb3BzLm14RXZlbnQ7XG4gICAgICAgIGNvbnN0IHpvb21pbmdEaXNhYmxlZCA9IHRoaXMuc3RhdGUubWF4Wm9vbSA9PT0gdGhpcy5zdGF0ZS5taW5ab29tO1xuXG4gICAgICAgIGxldCB0cmFuc2l0aW9uQ2xhc3NOYW1lO1xuICAgICAgICBpZiAodGhpcy5hbmltYXRpbmdMb2FkaW5nKSB0cmFuc2l0aW9uQ2xhc3NOYW1lID0gXCJteF9JbWFnZVZpZXdfaW1hZ2VfYW5pbWF0aW5nTG9hZGluZ1wiO1xuICAgICAgICBlbHNlIGlmICh0aGlzLnN0YXRlLm1vdmluZyB8fCAhdGhpcy5pbWFnZUlzTG9hZGVkKSB0cmFuc2l0aW9uQ2xhc3NOYW1lID0gXCJcIjtcbiAgICAgICAgZWxzZSB0cmFuc2l0aW9uQ2xhc3NOYW1lID0gXCJteF9JbWFnZVZpZXdfaW1hZ2VfYW5pbWF0aW5nXCI7XG5cbiAgICAgICAgbGV0IGN1cnNvcjtcbiAgICAgICAgaWYgKHRoaXMuc3RhdGUubW92aW5nKSBjdXJzb3IgPSBcImdyYWJiaW5nXCI7XG4gICAgICAgIGVsc2UgaWYgKHpvb21pbmdEaXNhYmxlZCkgY3Vyc29yID0gXCJkZWZhdWx0XCI7XG4gICAgICAgIGVsc2UgaWYgKHRoaXMuc3RhdGUuem9vbSA9PT0gdGhpcy5zdGF0ZS5taW5ab29tKSBjdXJzb3IgPSBcInpvb20taW5cIjtcbiAgICAgICAgZWxzZSBjdXJzb3IgPSBcInpvb20tb3V0XCI7XG5cbiAgICAgICAgY29uc3Qgcm90YXRpb25EZWdyZWVzID0gdGhpcy5zdGF0ZS5yb3RhdGlvbiArIFwiZGVnXCI7XG4gICAgICAgIGNvbnN0IHpvb20gPSB0aGlzLnN0YXRlLnpvb207XG4gICAgICAgIGNvbnN0IHRyYW5zbGF0ZVBpeGVsc1ggPSB0aGlzLnN0YXRlLnRyYW5zbGF0aW9uWCArIFwicHhcIjtcbiAgICAgICAgY29uc3QgdHJhbnNsYXRlUGl4ZWxzWSA9IHRoaXMuc3RhdGUudHJhbnNsYXRpb25ZICsgXCJweFwiO1xuICAgICAgICAvLyBUaGUgb3JkZXIgb2YgdGhlIHZhbHVlcyBpcyBpbXBvcnRhbnQhXG4gICAgICAgIC8vIEZpcnN0LCB3ZSB0cmFuc2xhdGUgYW5kIG9ubHkgdGhlbiB3ZSByb3RhdGUsIG90aGVyd2lzZVxuICAgICAgICAvLyB3ZSB3b3VsZCBhcHBseSB0aGUgdHJhbnNsYXRpb24gdG8gYW4gYWxyZWFkeSByb3RhdGVkXG4gICAgICAgIC8vIGltYWdlIGNhdXNpbmcgaXQgdHJhbnNsYXRlIGluIHRoZSB3cm9uZyBkaXJlY3Rpb24uXG4gICAgICAgIGNvbnN0IHN0eWxlID0ge1xuICAgICAgICAgICAgY3Vyc29yOiBjdXJzb3IsXG4gICAgICAgICAgICB0cmFuc2Zvcm06IGB0cmFuc2xhdGVYKCR7dHJhbnNsYXRlUGl4ZWxzWH0pXG4gICAgICAgICAgICAgICAgICAgICAgICB0cmFuc2xhdGVZKCR7dHJhbnNsYXRlUGl4ZWxzWX0pXG4gICAgICAgICAgICAgICAgICAgICAgICBzY2FsZSgke3pvb219KVxuICAgICAgICAgICAgICAgICAgICAgICAgcm90YXRlKCR7cm90YXRpb25EZWdyZWVzfSlgLFxuICAgICAgICB9O1xuXG4gICAgICAgIGxldCBpbmZvO1xuICAgICAgICBpZiAoc2hvd0V2ZW50TWV0YSkge1xuICAgICAgICAgICAgY29uc3QgbXhFdmVudCA9IHRoaXMucHJvcHMubXhFdmVudDtcbiAgICAgICAgICAgIGNvbnN0IHNob3dUd2VsdmVIb3VyID0gU2V0dGluZ3NTdG9yZS5nZXRWYWx1ZShcInNob3dUd2VsdmVIb3VyVGltZXN0YW1wc1wiKTtcbiAgICAgICAgICAgIGxldCBwZXJtYWxpbmsgPSBcIiNcIjtcbiAgICAgICAgICAgIGlmICh0aGlzLnByb3BzLnBlcm1hbGlua0NyZWF0b3IpIHtcbiAgICAgICAgICAgICAgICBwZXJtYWxpbmsgPSB0aGlzLnByb3BzLnBlcm1hbGlua0NyZWF0b3IuZm9yRXZlbnQodGhpcy5wcm9wcy5teEV2ZW50LmdldElkKCkpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjb25zdCBzZW5kZXJOYW1lID0gbXhFdmVudC5zZW5kZXIgPyBteEV2ZW50LnNlbmRlci5uYW1lIDogbXhFdmVudC5nZXRTZW5kZXIoKTtcbiAgICAgICAgICAgIGNvbnN0IHNlbmRlciA9IChcbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X0ltYWdlVmlld19pbmZvX3NlbmRlclwiPlxuICAgICAgICAgICAgICAgICAgICB7IHNlbmRlck5hbWUgfVxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIGNvbnN0IG1lc3NhZ2VUaW1lc3RhbXAgPSAoXG4gICAgICAgICAgICAgICAgPGFcbiAgICAgICAgICAgICAgICAgICAgaHJlZj17cGVybWFsaW5rfVxuICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXt0aGlzLm9uUGVybWFsaW5rQ2xpY2tlZH1cbiAgICAgICAgICAgICAgICAgICAgYXJpYS1sYWJlbD17Zm9ybWF0RnVsbERhdGUobmV3IERhdGUodGhpcy5wcm9wcy5teEV2ZW50LmdldFRzKCkpLCBzaG93VHdlbHZlSG91ciwgZmFsc2UpfVxuICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgPE1lc3NhZ2VUaW1lc3RhbXBcbiAgICAgICAgICAgICAgICAgICAgICAgIHNob3dGdWxsRGF0ZT17dHJ1ZX1cbiAgICAgICAgICAgICAgICAgICAgICAgIHNob3dUd2VsdmVIb3VyPXtzaG93VHdlbHZlSG91cn1cbiAgICAgICAgICAgICAgICAgICAgICAgIHRzPXtteEV2ZW50LmdldFRzKCl9XG4gICAgICAgICAgICAgICAgICAgICAgICBzaG93U2Vjb25kcz17ZmFsc2V9XG4gICAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgPC9hPlxuICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIGNvbnN0IGF2YXRhciA9IChcbiAgICAgICAgICAgICAgICA8TWVtYmVyQXZhdGFyXG4gICAgICAgICAgICAgICAgICAgIG1lbWJlcj17bXhFdmVudC5zZW5kZXJ9XG4gICAgICAgICAgICAgICAgICAgIGZhbGxiYWNrVXNlcklkPXtteEV2ZW50LmdldFNlbmRlcigpfVxuICAgICAgICAgICAgICAgICAgICB3aWR0aD17MzJ9XG4gICAgICAgICAgICAgICAgICAgIGhlaWdodD17MzJ9XG4gICAgICAgICAgICAgICAgICAgIHZpZXdVc2VyT25DbGljaz17dHJ1ZX1cbiAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgKTtcblxuICAgICAgICAgICAgaW5mbyA9IChcbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X0ltYWdlVmlld19pbmZvX3dyYXBwZXJcIj5cbiAgICAgICAgICAgICAgICAgICAgeyBhdmF0YXIgfVxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X0ltYWdlVmlld19pbmZvXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICB7IHNlbmRlciB9XG4gICAgICAgICAgICAgICAgICAgICAgICB7IG1lc3NhZ2VUaW1lc3RhbXAgfVxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBJZiB0aGVyZSBpcyBubyBldmVudCAtIHdlJ3JlIHZpZXdpbmcgYW4gYXZhdGFyLCB3ZSBzZXRcbiAgICAgICAgICAgIC8vIGFuIGVtcHR5IGRpdiBoZXJlLCBzaW5jZSB0aGUgcGFuZWwgdXNlcyBzcGFjZS1iZXR3ZWVuXG4gICAgICAgICAgICAvLyBhbmQgd2Ugd2FudCB0aGUgc2FtZSBwbGFjZW1lbnQgb2YgZWxlbWVudHNcbiAgICAgICAgICAgIGluZm8gPSAoXG4gICAgICAgICAgICAgICAgPGRpdiAvPlxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBjb250ZXh0TWVudUJ1dHRvbjtcbiAgICAgICAgaWYgKHRoaXMucHJvcHMubXhFdmVudCkge1xuICAgICAgICAgICAgY29udGV4dE1lbnVCdXR0b24gPSAoXG4gICAgICAgICAgICAgICAgPENvbnRleHRNZW51VG9vbHRpcEJ1dHRvblxuICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJteF9JbWFnZVZpZXdfYnV0dG9uIG14X0ltYWdlVmlld19idXR0b25fbW9yZVwiXG4gICAgICAgICAgICAgICAgICAgIHRpdGxlPXtfdChcIk9wdGlvbnNcIil9XG4gICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9e3RoaXMub25PcGVuQ29udGV4dE1lbnV9XG4gICAgICAgICAgICAgICAgICAgIGlucHV0UmVmPXt0aGlzLmNvbnRleHRNZW51QnV0dG9ufVxuICAgICAgICAgICAgICAgICAgICBpc0V4cGFuZGVkPXt0aGlzLnN0YXRlLmNvbnRleHRNZW51RGlzcGxheWVkfVxuICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICApO1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IHpvb21PdXRCdXR0b247XG4gICAgICAgIGxldCB6b29tSW5CdXR0b247XG4gICAgICAgIGlmICghem9vbWluZ0Rpc2FibGVkKSB7XG4gICAgICAgICAgICB6b29tT3V0QnV0dG9uID0gKFxuICAgICAgICAgICAgICAgIDxBY2Nlc3NpYmxlVG9vbHRpcEJ1dHRvblxuICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJteF9JbWFnZVZpZXdfYnV0dG9uIG14X0ltYWdlVmlld19idXR0b25fem9vbU91dFwiXG4gICAgICAgICAgICAgICAgICAgIHRpdGxlPXtfdChcIlpvb20gb3V0XCIpfVxuICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXt0aGlzLm9uWm9vbU91dENsaWNrfVxuICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICApO1xuICAgICAgICAgICAgem9vbUluQnV0dG9uID0gKFxuICAgICAgICAgICAgICAgIDxBY2Nlc3NpYmxlVG9vbHRpcEJ1dHRvblxuICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJteF9JbWFnZVZpZXdfYnV0dG9uIG14X0ltYWdlVmlld19idXR0b25fem9vbUluXCJcbiAgICAgICAgICAgICAgICAgICAgdGl0bGU9e190KFwiWm9vbSBpblwiKX1cbiAgICAgICAgICAgICAgICAgICAgb25DbGljaz17dGhpcy5vblpvb21JbkNsaWNrfVxuICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICApO1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IHRpdGxlOiBKU1guRWxlbWVudDtcbiAgICAgICAgaWYgKHRoaXMucHJvcHMubXhFdmVudD8uZ2V0Q29udGVudCgpKSB7XG4gICAgICAgICAgICB0aXRsZSA9IChcbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X0ltYWdlVmlld190aXRsZVwiPlxuICAgICAgICAgICAgICAgICAgICB7IHByZXNlbnRhYmxlVGV4dEZvckZpbGUodGhpcy5wcm9wcy5teEV2ZW50Py5nZXRDb250ZW50KCksIF90KFwiSW1hZ2VcIiksIHRydWUpIH1cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPEZvY3VzTG9ja1xuICAgICAgICAgICAgICAgIHJldHVybkZvY3VzPXt0cnVlfVxuICAgICAgICAgICAgICAgIGxvY2tQcm9wcz17e1xuICAgICAgICAgICAgICAgICAgICBvbktleURvd246IHRoaXMub25LZXlEb3duLFxuICAgICAgICAgICAgICAgICAgICByb2xlOiBcImRpYWxvZ1wiLFxuICAgICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwibXhfSW1hZ2VWaWV3XCJcbiAgICAgICAgICAgICAgICByZWY9e3RoaXMuZm9jdXNMb2NrfVxuICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfSW1hZ2VWaWV3X3BhbmVsXCI+XG4gICAgICAgICAgICAgICAgICAgIHsgaW5mbyB9XG4gICAgICAgICAgICAgICAgICAgIHsgdGl0bGUgfVxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X0ltYWdlVmlld190b29sYmFyXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICB7IHpvb21PdXRCdXR0b24gfVxuICAgICAgICAgICAgICAgICAgICAgICAgeyB6b29tSW5CdXR0b24gfVxuICAgICAgICAgICAgICAgICAgICAgICAgPEFjY2Vzc2libGVUb29sdGlwQnV0dG9uXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwibXhfSW1hZ2VWaWV3X2J1dHRvbiBteF9JbWFnZVZpZXdfYnV0dG9uX3JvdGF0ZUNDV1wiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGl0bGU9e190KFwiUm90YXRlIExlZnRcIil9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb25DbGljaz17dGhpcy5vblJvdGF0ZUNvdW50ZXJDbG9ja3dpc2VDbGlja31cbiAgICAgICAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgICAgICAgICA8QWNjZXNzaWJsZVRvb2x0aXBCdXR0b25cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJteF9JbWFnZVZpZXdfYnV0dG9uIG14X0ltYWdlVmlld19idXR0b25fcm90YXRlQ1dcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRpdGxlPXtfdChcIlJvdGF0ZSBSaWdodFwiKX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXt0aGlzLm9uUm90YXRlQ2xvY2t3aXNlQ2xpY2t9XG4gICAgICAgICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgICAgICAgICAgPEFjY2Vzc2libGVUb29sdGlwQnV0dG9uXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwibXhfSW1hZ2VWaWV3X2J1dHRvbiBteF9JbWFnZVZpZXdfYnV0dG9uX2Rvd25sb2FkXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aXRsZT17X3QoXCJEb3dubG9hZFwiKX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXt0aGlzLm9uRG93bmxvYWRDbGlja31cbiAgICAgICAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgICAgICAgICB7IGNvbnRleHRNZW51QnV0dG9uIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIDxBY2Nlc3NpYmxlVG9vbHRpcEJ1dHRvblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cIm14X0ltYWdlVmlld19idXR0b24gbXhfSW1hZ2VWaWV3X2J1dHRvbl9jbG9zZVwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGl0bGU9e190KFwiQ2xvc2VcIil9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb25DbGljaz17dGhpcy5wcm9wcy5vbkZpbmlzaGVkfVxuICAgICAgICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICAgICAgICAgIHsgdGhpcy5yZW5kZXJDb250ZXh0TWVudSgpIH1cbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgPGRpdlxuICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJteF9JbWFnZVZpZXdfaW1hZ2Vfd3JhcHBlclwiXG4gICAgICAgICAgICAgICAgICAgIHJlZj17dGhpcy5pbWFnZVdyYXBwZXJ9XG4gICAgICAgICAgICAgICAgICAgIG9uTW91c2VEb3duPXt0aGlzLnByb3BzLm9uRmluaXNoZWR9XG4gICAgICAgICAgICAgICAgICAgIG9uTW91c2VNb3ZlPXt0aGlzLm9uTW92aW5nfVxuICAgICAgICAgICAgICAgICAgICBvbk1vdXNlVXA9e3RoaXMub25FbmRNb3Zpbmd9XG4gICAgICAgICAgICAgICAgICAgIG9uTW91c2VMZWF2ZT17dGhpcy5vbkVuZE1vdmluZ31cbiAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgIDxpbWdcbiAgICAgICAgICAgICAgICAgICAgICAgIHNyYz17dGhpcy5wcm9wcy5zcmN9XG4gICAgICAgICAgICAgICAgICAgICAgICBzdHlsZT17c3R5bGV9XG4gICAgICAgICAgICAgICAgICAgICAgICBhbHQ9e3RoaXMucHJvcHMubmFtZX1cbiAgICAgICAgICAgICAgICAgICAgICAgIHJlZj17dGhpcy5pbWFnZX1cbiAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT17YG14X0ltYWdlVmlld19pbWFnZSAke3RyYW5zaXRpb25DbGFzc05hbWV9YH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGRyYWdnYWJsZT17dHJ1ZX1cbiAgICAgICAgICAgICAgICAgICAgICAgIG9uTW91c2VEb3duPXt0aGlzLm9uU3RhcnRNb3Zpbmd9XG4gICAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8L0ZvY3VzTG9jaz5cbiAgICAgICAgKTtcbiAgICB9XG59XG4iXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7QUFrQkE7O0FBQ0E7O0FBR0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBRUE7O0FBRUE7O0FBRUE7O0FBQ0E7O0FBQ0E7Ozs7OztBQXhDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBMEJBO0FBQ0EsTUFBTUEsU0FBUyxHQUFHLElBQWxCLEMsQ0FDQTs7QUFDQSxNQUFNQyxTQUFTLEdBQUcsSUFBbEIsQyxDQUNBOztBQUNBLE1BQU1DLGdCQUFnQixHQUFHLE1BQXpCLEMsQ0FDQTs7QUFDQSxNQUFNQyxhQUFhLEdBQUcsRUFBdEIsQyxDQUVBOztBQUNBLE1BQU1DLGNBQWMs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