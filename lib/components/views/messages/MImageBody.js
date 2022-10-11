"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.HiddenImagePlaceholder = void 0;

var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireWildcard(require("react"));

var _reactBlurhash = require("react-blurhash");

var _classnames = _interopRequireDefault(require("classnames"));

var _reactTransitionGroup = require("react-transition-group");

var _logger = require("matrix-js-sdk/src/logger");

var _client = require("matrix-js-sdk/src/client");

var _MFileBody = _interopRequireDefault(require("./MFileBody"));

var _Modal = _interopRequireDefault(require("../../../Modal"));

var _languageHandler = require("../../../languageHandler");

var _SettingsStore = _interopRequireDefault(require("../../../settings/SettingsStore"));

var _Spinner = _interopRequireDefault(require("../elements/Spinner"));

var _Media = require("../../../customisations/Media");

var _imageMedia = require("../../../utils/image-media");

var _ImageView = _interopRequireDefault(require("../elements/ImageView"));

var _ImageSize = require("../../../settings/enums/ImageSize");

var _MatrixClientPeg = require("../../../MatrixClientPeg");

var _RoomContext = _interopRequireWildcard(require("../../../contexts/RoomContext"));

var _Image = require("../../../utils/Image");

var _FileUtils = require("../../../utils/FileUtils");

var _connection = require("../../../utils/connection");

var _MediaProcessingError = _interopRequireDefault(require("./shared/MediaProcessingError"));

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

/*
Copyright 2015 - 2021 The Matrix.org Foundation C.I.C.
Copyright 2018, 2019 Michael Telatynski <7t3chguy@gmail.com>

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
var Placeholder;

(function (Placeholder) {
  Placeholder[Placeholder["NoImage"] = 0] = "NoImage";
  Placeholder[Placeholder["Blurhash"] = 1] = "Blurhash";
})(Placeholder || (Placeholder = {}));

class MImageBody extends _react.default.Component {
  constructor(props) {
    super(props);
    (0, _defineProperty2.default)(this, "context", void 0);
    (0, _defineProperty2.default)(this, "unmounted", true);
    (0, _defineProperty2.default)(this, "image", /*#__PURE__*/(0, _react.createRef)());
    (0, _defineProperty2.default)(this, "timeout", void 0);
    (0, _defineProperty2.default)(this, "sizeWatcher", void 0);
    (0, _defineProperty2.default)(this, "reconnectedListener", void 0);
    (0, _defineProperty2.default)(this, "onClick", ev => {
      if (ev.button === 0 && !ev.metaKey) {
        ev.preventDefault();

        if (!this.state.showImage) {
          this.showImage();
          return;
        }

        const content = this.props.mxEvent.getContent();
        const httpUrl = this.state.contentUrl;
        const params = {
          src: httpUrl,
          name: content.body?.length > 0 ? content.body : (0, _languageHandler._t)('Attachment'),
          mxEvent: this.props.mxEvent,
          permalinkCreator: this.props.permalinkCreator
        };

        if (content.info) {
          params.width = content.info.w;
          params.height = content.info.h;
          params.fileSize = content.info.size;
        }

        if (this.image.current) {
          const clientRect = this.image.current.getBoundingClientRect();
          params.thumbnailInfo = {
            width: clientRect.width,
            height: clientRect.height,
            positionX: clientRect.x,
            positionY: clientRect.y
          };
        }

        _Modal.default.createDialog(_ImageView.default, params, "mx_Dialog_lightbox", null, true);
      }
    });
    (0, _defineProperty2.default)(this, "onImageEnter", e => {
      this.setState({
        hover: true
      });

      if (!this.state.showImage || !this.state.isAnimated || _SettingsStore.default.getValue("autoplayGifs")) {
        return;
      }

      const imgElement = e.currentTarget;
      imgElement.src = this.state.contentUrl;
    });
    (0, _defineProperty2.default)(this, "onImageLeave", e => {
      this.setState({
        hover: false
      });

      if (!this.state.showImage || !this.state.isAnimated || _SettingsStore.default.getValue("autoplayGifs")) {
        return;
      }

      const imgElement = e.currentTarget;
      imgElement.src = this.state.thumbUrl ?? this.state.contentUrl;
    });
    (0, _defineProperty2.default)(this, "clearError", () => {
      _MatrixClientPeg.MatrixClientPeg.get().off(_client.ClientEvent.Sync, this.reconnectedListener);

      this.setState({
        imgError: false
      });
    });
    (0, _defineProperty2.default)(this, "onImageError", () => {
      this.clearBlurhashTimeout();
      this.setState({
        imgError: true
      });

      _MatrixClientPeg.MatrixClientPeg.get().on(_client.ClientEvent.Sync, this.reconnectedListener);
    });
    (0, _defineProperty2.default)(this, "onImageLoad", () => {
      this.clearBlurhashTimeout();
      this.props.onHeightChanged();
      let loadedImageDimensions;

      if (this.image.current) {
        const {
          naturalWidth,
          naturalHeight
        } = this.image.current; // this is only used as a fallback in case content.info.w/h is missing

        loadedImageDimensions = {
          naturalWidth,
          naturalHeight
        };
      }

      this.setState({
        imgLoaded: true,
        loadedImageDimensions
      });
    });
    this.reconnectedListener = (0, _connection.createReconnectedListener)(this.clearError);
    this.state = {
      imgError: false,
      imgLoaded: false,
      hover: false,
      showImage: _SettingsStore.default.getValue("showImages"),
      placeholder: Placeholder.NoImage
    };
  }

  showImage() {
    localStorage.setItem("mx_ShowImage_" + this.props.mxEvent.getId(), "true");
    this.setState({
      showImage: true
    });
    this.downloadImage();
  }

  getContentUrl() {
    // During export, the content url will point to the MSC, which will later point to a local url
    if (this.props.forExport) return this.media.srcMxc;
    return this.media.srcHttp;
  }

  get media() {
    return (0, _Media.mediaFromContent)(this.props.mxEvent.getContent());
  }

  getThumbUrl() {
    // FIXME: we let images grow as wide as you like, rather than capped to 800x600.
    // So either we need to support custom timeline widths here, or reimpose the cap, otherwise the
    // thumbnail resolution will be unnecessarily reduced.
    // custom timeline widths seems preferable.
    const thumbWidth = 800;
    const thumbHeight = 600;
    const content = this.props.mxEvent.getContent();
    const media = (0, _Media.mediaFromContent)(content);
    const info = content.info;

    if (info?.mimetype === "image/svg+xml" && media.hasThumbnail) {
      // Special-case to return clientside sender-generated thumbnails for SVGs, if any,
      // given we deliberately don't thumbnail them serverside to prevent billion lol attacks and similar.
      return media.getThumbnailHttp(thumbWidth, thumbHeight, 'scale');
    } // we try to download the correct resolution for hi-res images (like retina screenshots).
    // Synapse only supports 800x600 thumbnails for now though,
    // so we'll need to download the original image for this to work  well for now.
    // First, let's try a few cases that let us avoid downloading the original, including:
    //   - When displaying a GIF, we always want to thumbnail so that we can
    //     properly respect the user's GIF autoplay setting (which relies on
    //     thumbnailing to produce the static preview image)
    //   - On a low DPI device, always thumbnail to save bandwidth
    //   - If there's no sizing info in the event, default to thumbnail


    if (this.state.isAnimated || window.devicePixelRatio === 1.0 || !info || !info.w || !info.h || !info.size) {
      return media.getThumbnailOfSourceHttp(thumbWidth, thumbHeight);
    } // We should only request thumbnails if the image is bigger than 800x600 (or 1600x1200 on retina) otherwise
    // the image in the timeline will just end up resampled and de-retina'd for no good reason.
    // Ideally the server would pre-gen 1600x1200 thumbnails in order to provide retina thumbnails,
    // but we don't do this currently in synapse for fear of disk space.
    // As a compromise, let's switch to non-retina thumbnails only if the original image is both
    // physically too large and going to be massive to load in the timeline (e.g. >1MB).


    const isLargerThanThumbnail = info.w > thumbWidth || info.h > thumbHeight;
    const isLargeFileSize = info.size > 1 * 1024 * 1024; // 1mb

    if (isLargeFileSize && isLargerThanThumbnail) {
      // image is too large physically and byte-wise to clutter our timeline so,
      // we ask for a thumbnail, despite knowing that it will be max 800x600
      // despite us being retina (as synapse doesn't do 1600x1200 thumbs yet).
      return media.getThumbnailOfSourceHttp(thumbWidth, thumbHeight);
    } // download the original image otherwise, so we can scale it client side to take pixelRatio into account.


    return media.srcHttp;
  }

  async downloadImage() {
    if (this.state.contentUrl) return; // already downloaded

    let thumbUrl;
    let contentUrl;

    if (this.props.mediaEventHelper.media.isEncrypted) {
      try {
        [contentUrl, thumbUrl] = await Promise.all([this.props.mediaEventHelper.sourceUrl.value, this.props.mediaEventHelper.thumbnailUrl.value]);
      } catch (error) {
        if (this.unmounted) return;

        _logger.logger.warn("Unable to decrypt attachment: ", error); // Set a placeholder image when we can't decrypt the image.


        this.setState({
          error
        });
      }
    } else {
      thumbUrl = this.getThumbUrl();
      contentUrl = this.getContentUrl();
    }

    const content = this.props.mxEvent.getContent();
    let isAnimated = (0, _Image.mayBeAnimated)(content.info?.mimetype); // If there is no included non-animated thumbnail then we will generate our own, we can't depend on the server
    // because 1. encryption and 2. we can't ask the server specifically for a non-animated thumbnail.

    if (isAnimated && !_SettingsStore.default.getValue("autoplayGifs")) {
      if (!thumbUrl || !content?.info.thumbnail_info || (0, _Image.mayBeAnimated)(content.info.thumbnail_info.mimetype)) {
        const img = document.createElement("img");
        const loadPromise = new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
        });
        img.crossOrigin = "Anonymous"; // CORS allow canvas access

        img.src = contentUrl;
        await loadPromise;
        const blob = await this.props.mediaEventHelper.sourceBlob.value;

        if (!(await (0, _Image.blobIsAnimated)(content.info.mimetype, blob))) {
          isAnimated = false;
        }

        if (isAnimated) {
          const thumb = await (0, _imageMedia.createThumbnail)(img, img.width, img.height, content.info.mimetype, false);
          thumbUrl = URL.createObjectURL(thumb.thumbnail);
        }
      }
    }

    if (this.unmounted) return;
    this.setState({
      contentUrl,
      thumbUrl,
      isAnimated
    });
  }

  clearBlurhashTimeout() {
    if (this.timeout) {
      clearTimeout(this.timeout);
      this.timeout = undefined;
    }
  }

  componentDidMount() {
    this.unmounted = false;
    const showImage = this.state.showImage || localStorage.getItem("mx_ShowImage_" + this.props.mxEvent.getId()) === "true";

    if (showImage) {
      // noinspection JSIgnoredPromiseFromCall
      this.downloadImage();
      this.setState({
        showImage: true
      });
    } // else don't download anything because we don't want to display anything.
    // Add a 150ms timer for blurhash to first appear.


    if (this.props.mxEvent.getContent().info?.[_imageMedia.BLURHASH_FIELD]) {
      this.clearBlurhashTimeout();
      this.timeout = setTimeout(() => {
        if (!this.state.imgLoaded || !this.state.imgError) {
          this.setState({
            placeholder: Placeholder.Blurhash
          });
        }
      }, 150);
    }

    this.sizeWatcher = _SettingsStore.default.watchSetting("Images.size", null, () => {
      this.forceUpdate(); // we don't really have a reliable thing to update, so just update the whole thing
    });
  }

  componentWillUnmount() {
    this.unmounted = true;

    _MatrixClientPeg.MatrixClientPeg.get().off(_client.ClientEvent.Sync, this.reconnectedListener);

    this.clearBlurhashTimeout();

    _SettingsStore.default.unwatchSetting(this.sizeWatcher);

    if (this.state.isAnimated && this.state.thumbUrl) {
      URL.revokeObjectURL(this.state.thumbUrl);
    }
  }

  getBanner(content) {
    // Hide it for the threads list & the file panel where we show it as text anyway.
    if ([_RoomContext.TimelineRenderingType.ThreadsList, _RoomContext.TimelineRenderingType.File].includes(this.context.timelineRenderingType)) {
      return null;
    }

    return /*#__PURE__*/_react.default.createElement("span", {
      className: "mx_MImageBody_banner"
    }, (0, _FileUtils.presentableTextForFile)(content, (0, _languageHandler._t)("Image"), true, true));
  }

  messageContent(contentUrl, thumbUrl, content, forcedHeight) {
    if (!thumbUrl) thumbUrl = contentUrl; // fallback

    let infoWidth;
    let infoHeight;
    let infoSvg = false;

    if (content.info?.w && content.info?.h) {
      infoWidth = content.info.w;
      infoHeight = content.info.h;
      infoSvg = content.info.mimetype === "image/svg+xml";
    } else {
      // Whilst the image loads, display nothing. We also don't display a blurhash image
      // because we don't really know what size of image we'll end up with.
      //
      // Once loaded, use the loaded image dimensions stored in `loadedImageDimensions`.
      //
      // By doing this, the image "pops" into the timeline, but is still restricted
      // by the same width and height logic below.
      if (!this.state.loadedImageDimensions) {
        let imageElement;

        if (!this.state.showImage) {
          imageElement = /*#__PURE__*/_react.default.createElement(HiddenImagePlaceholder, null);
        } else {
          imageElement = /*#__PURE__*/_react.default.createElement("img", {
            style: {
              display: 'none'
            },
            src: thumbUrl,
            ref: this.image,
            alt: content.body,
            onError: this.onImageError,
            onLoad: this.onImageLoad
          });
        }

        return this.wrapImage(contentUrl, imageElement);
      }

      infoWidth = this.state.loadedImageDimensions.naturalWidth;
      infoHeight = this.state.loadedImageDimensions.naturalHeight;
    } // The maximum size of the thumbnail as it is rendered as an <img>,
    // accounting for any height constraints


    const {
      w: maxWidth,
      h: maxHeight
    } = (0, _ImageSize.suggestedSize)(_SettingsStore.default.getValue("Images.size"), {
      w: infoWidth,
      h: infoHeight
    }, forcedHeight ?? this.props.maxImageHeight);
    let img;
    let placeholder;
    let gifLabel;

    if (!this.props.forExport && !this.state.imgLoaded) {
      placeholder = this.getPlaceholder(maxWidth, maxHeight);
    }

    let showPlaceholder = Boolean(placeholder);

    if (thumbUrl && !this.state.imgError) {
      // Restrict the width of the thumbnail here, otherwise it will fill the container
      // which has the same width as the timeline
      // mx_MImageBody_thumbnail resizes img to exactly container size
      img = /*#__PURE__*/_react.default.createElement("img", {
        className: "mx_MImageBody_thumbnail",
        src: thumbUrl,
        ref: this.image,
        alt: content.body,
        onError: this.onImageError,
        onLoad: this.onImageLoad,
        onMouseEnter: this.onImageEnter,
        onMouseLeave: this.onImageLeave
      });
    }

    if (!this.state.showImage) {
      img = /*#__PURE__*/_react.default.createElement(HiddenImagePlaceholder, {
        maxWidth: maxWidth
      });
      showPlaceholder = false; // because we're hiding the image, so don't show the placeholder.
    }

    if (this.state.isAnimated && !_SettingsStore.default.getValue("autoplayGifs") && !this.state.hover) {
      // XXX: Arguably we may want a different label when the animated image is WEBP and not GIF
      gifLabel = /*#__PURE__*/_react.default.createElement("p", {
        className: "mx_MImageBody_gifLabel"
      }, "GIF");
    }

    let banner;

    if (this.state.showImage && this.state.hover) {
      banner = this.getBanner(content);
    }

    const classes = (0, _classnames.default)({
      'mx_MImageBody_placeholder': true,
      'mx_MImageBody_placeholder--blurhash': this.props.mxEvent.getContent().info?.[_imageMedia.BLURHASH_FIELD]
    }); // many SVGs don't have an intrinsic size if used in <img> elements.
    // due to this we have to set our desired width directly.
    // this way if the image is forced to shrink, the height adapts appropriately.

    const sizing = infoSvg ? {
      maxHeight,
      maxWidth,
      width: maxWidth
    } : {
      maxHeight,
      maxWidth
    };

    const thumbnail = /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_MImageBody_thumbnail_container",
      style: {
        maxHeight,
        maxWidth,
        aspectRatio: `${infoWidth}/${infoHeight}`
      }
    }, /*#__PURE__*/_react.default.createElement(_reactTransitionGroup.SwitchTransition, {
      mode: "out-in"
    }, /*#__PURE__*/_react.default.createElement(_reactTransitionGroup.CSSTransition, {
      classNames: "mx_rtg--fade",
      key: `img-${showPlaceholder}`,
      timeout: 300
    }, showPlaceholder ? /*#__PURE__*/_react.default.createElement("div", {
      className: classes
    }, placeholder) : /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null)
    /* Transition always expects a child */
    )), /*#__PURE__*/_react.default.createElement("div", {
      style: sizing
    }, img, gifLabel, banner), !this.state.imgLoaded && /*#__PURE__*/_react.default.createElement("div", {
      style: {
        height: maxHeight,
        width: maxWidth
      }
    }), this.state.hover && this.getTooltip());

    return this.wrapImage(contentUrl, thumbnail);
  } // Overridden by MStickerBody


  wrapImage(contentUrl, children) {
    return /*#__PURE__*/_react.default.createElement("a", {
      href: contentUrl,
      target: this.props.forExport ? "_blank" : undefined,
      onClick: this.onClick
    }, children);
  } // Overridden by MStickerBody


  getPlaceholder(width, height) {
    const blurhash = this.props.mxEvent.getContent().info?.[_imageMedia.BLURHASH_FIELD];

    if (blurhash) {
      if (this.state.placeholder === Placeholder.NoImage) {
        return null;
      } else if (this.state.placeholder === Placeholder.Blurhash) {
        return /*#__PURE__*/_react.default.createElement(_reactBlurhash.Blurhash, {
          className: "mx_Blurhash",
          hash: blurhash,
          width: width,
          height: height
        });
      }
    }

    return /*#__PURE__*/_react.default.createElement(_Spinner.default, {
      w: 32,
      h: 32
    });
  } // Overridden by MStickerBody


  getTooltip() {
    return null;
  } // Overridden by MStickerBody


  getFileBody() {
    if (this.props.forExport) return null;
    /*
     * In the room timeline or the thread context we don't need the download
     * link as the message action bar will fulfill that
     */

    const hasMessageActionBar = this.context.timelineRenderingType === _RoomContext.TimelineRenderingType.Room || this.context.timelineRenderingType === _RoomContext.TimelineRenderingType.Pinned || this.context.timelineRenderingType === _RoomContext.TimelineRenderingType.Search || this.context.timelineRenderingType === _RoomContext.TimelineRenderingType.Thread || this.context.timelineRenderingType === _RoomContext.TimelineRenderingType.ThreadsList;

    if (!hasMessageActionBar) {
      return /*#__PURE__*/_react.default.createElement(_MFileBody.default, (0, _extends2.default)({}, this.props, {
        showGenericPlaceholder: false
      }));
    }
  }

  render() {
    const content = this.props.mxEvent.getContent();

    if (this.state.error) {
      return /*#__PURE__*/_react.default.createElement(_MediaProcessingError.default, {
        className: "mx_MImageBody"
      }, (0, _languageHandler._t)("Error decrypting image"));
    }

    const contentUrl = this.state.contentUrl;
    let thumbUrl;

    if (this.props.forExport || this.state.isAnimated && _SettingsStore.default.getValue("autoplayGifs")) {
      thumbUrl = contentUrl;
    } else {
      thumbUrl = this.state.thumbUrl ?? this.state.contentUrl;
    }

    const thumbnail = this.messageContent(contentUrl, thumbUrl, content);
    const fileBody = this.getFileBody();
    return /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_MImageBody"
    }, thumbnail, fileBody);
  }

}

exports.default = MImageBody;
(0, _defineProperty2.default)(MImageBody, "contextType", _RoomContext.default);

class HiddenImagePlaceholder extends _react.default.PureComponent {
  render() {
    const maxWidth = this.props.maxWidth ? this.props.maxWidth + "px" : null;
    let className = 'mx_HiddenImagePlaceholder';
    if (this.props.hover) className += ' mx_HiddenImagePlaceholder_hover';
    return /*#__PURE__*/_react.default.createElement("div", {
      className: className,
      style: {
        maxWidth: `min(100%, ${maxWidth}px)`
      }
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_HiddenImagePlaceholder_button"
    }, /*#__PURE__*/_react.default.createElement("span", {
      className: "mx_HiddenImagePlaceholder_eye"
    }), /*#__PURE__*/_react.default.createElement("span", null, (0, _languageHandler._t)("Show image"))));
  }

}

exports.HiddenImagePlaceholder = HiddenImagePlaceholder;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJQbGFjZWhvbGRlciIsIk1JbWFnZUJvZHkiLCJSZWFjdCIsIkNvbXBvbmVudCIsImNvbnN0cnVjdG9yIiwicHJvcHMiLCJjcmVhdGVSZWYiLCJldiIsImJ1dHRvbiIsIm1ldGFLZXkiLCJwcmV2ZW50RGVmYXVsdCIsInN0YXRlIiwic2hvd0ltYWdlIiwiY29udGVudCIsIm14RXZlbnQiLCJnZXRDb250ZW50IiwiaHR0cFVybCIsImNvbnRlbnRVcmwiLCJwYXJhbXMiLCJzcmMiLCJuYW1lIiwiYm9keSIsImxlbmd0aCIsIl90IiwicGVybWFsaW5rQ3JlYXRvciIsImluZm8iLCJ3aWR0aCIsInciLCJoZWlnaHQiLCJoIiwiZmlsZVNpemUiLCJzaXplIiwiaW1hZ2UiLCJjdXJyZW50IiwiY2xpZW50UmVjdCIsImdldEJvdW5kaW5nQ2xpZW50UmVjdCIsInRodW1ibmFpbEluZm8iLCJwb3NpdGlvblgiLCJ4IiwicG9zaXRpb25ZIiwieSIsIk1vZGFsIiwiY3JlYXRlRGlhbG9nIiwiSW1hZ2VWaWV3IiwiZSIsInNldFN0YXRlIiwiaG92ZXIiLCJpc0FuaW1hdGVkIiwiU2V0dGluZ3NTdG9yZSIsImdldFZhbHVlIiwiaW1nRWxlbWVudCIsImN1cnJlbnRUYXJnZXQiLCJ0aHVtYlVybCIsIk1hdHJpeENsaWVudFBlZyIsImdldCIsIm9mZiIsIkNsaWVudEV2ZW50IiwiU3luYyIsInJlY29ubmVjdGVkTGlzdGVuZXIiLCJpbWdFcnJvciIsImNsZWFyQmx1cmhhc2hUaW1lb3V0Iiwib24iLCJvbkhlaWdodENoYW5nZWQiLCJsb2FkZWRJbWFnZURpbWVuc2lvbnMiLCJuYXR1cmFsV2lkdGgiLCJuYXR1cmFsSGVpZ2h0IiwiaW1nTG9hZGVkIiwiY3JlYXRlUmVjb25uZWN0ZWRMaXN0ZW5lciIsImNsZWFyRXJyb3IiLCJwbGFjZWhvbGRlciIsIk5vSW1hZ2UiLCJsb2NhbFN0b3JhZ2UiLCJzZXRJdGVtIiwiZ2V0SWQiLCJkb3dubG9hZEltYWdlIiwiZ2V0Q29udGVudFVybCIsImZvckV4cG9ydCIsIm1lZGlhIiwic3JjTXhjIiwic3JjSHR0cCIsIm1lZGlhRnJvbUNvbnRlbnQiLCJnZXRUaHVtYlVybCIsInRodW1iV2lkdGgiLCJ0aHVtYkhlaWdodCIsIm1pbWV0eXBlIiwiaGFzVGh1bWJuYWlsIiwiZ2V0VGh1bWJuYWlsSHR0cCIsIndpbmRvdyIsImRldmljZVBpeGVsUmF0aW8iLCJnZXRUaHVtYm5haWxPZlNvdXJjZUh0dHAiLCJpc0xhcmdlclRoYW5UaHVtYm5haWwiLCJpc0xhcmdlRmlsZVNpemUiLCJtZWRpYUV2ZW50SGVscGVyIiwiaXNFbmNyeXB0ZWQiLCJQcm9taXNlIiwiYWxsIiwic291cmNlVXJsIiwidmFsdWUiLCJ0aHVtYm5haWxVcmwiLCJlcnJvciIsInVubW91bnRlZCIsImxvZ2dlciIsIndhcm4iLCJtYXlCZUFuaW1hdGVkIiwidGh1bWJuYWlsX2luZm8iLCJpbWciLCJkb2N1bWVudCIsImNyZWF0ZUVsZW1lbnQiLCJsb2FkUHJvbWlzZSIsInJlc29sdmUiLCJyZWplY3QiLCJvbmxvYWQiLCJvbmVycm9yIiwiY3Jvc3NPcmlnaW4iLCJibG9iIiwic291cmNlQmxvYiIsImJsb2JJc0FuaW1hdGVkIiwidGh1bWIiLCJjcmVhdGVUaHVtYm5haWwiLCJVUkwiLCJjcmVhdGVPYmplY3RVUkwiLCJ0aHVtYm5haWwiLCJ0aW1lb3V0IiwiY2xlYXJUaW1lb3V0IiwidW5kZWZpbmVkIiwiY29tcG9uZW50RGlkTW91bnQiLCJnZXRJdGVtIiwiQkxVUkhBU0hfRklFTEQiLCJzZXRUaW1lb3V0IiwiQmx1cmhhc2giLCJzaXplV2F0Y2hlciIsIndhdGNoU2V0dGluZyIsImZvcmNlVXBkYXRlIiwiY29tcG9uZW50V2lsbFVubW91bnQiLCJ1bndhdGNoU2V0dGluZyIsInJldm9rZU9iamVjdFVSTCIsImdldEJhbm5lciIsIlRpbWVsaW5lUmVuZGVyaW5nVHlwZSIsIlRocmVhZHNMaXN0IiwiRmlsZSIsImluY2x1ZGVzIiwiY29udGV4dCIsInRpbWVsaW5lUmVuZGVyaW5nVHlwZSIsInByZXNlbnRhYmxlVGV4dEZvckZpbGUiLCJtZXNzYWdlQ29udGVudCIsImZvcmNlZEhlaWdodCIsImluZm9XaWR0aCIsImluZm9IZWlnaHQiLCJpbmZvU3ZnIiwiaW1hZ2VFbGVtZW50IiwiZGlzcGxheSIsIm9uSW1hZ2VFcnJvciIsIm9uSW1hZ2VMb2FkIiwid3JhcEltYWdlIiwibWF4V2lkdGgiLCJtYXhIZWlnaHQiLCJzdWdnZXN0ZWRJbWFnZVNpemUiLCJtYXhJbWFnZUhlaWdodCIsImdpZkxhYmVsIiwiZ2V0UGxhY2Vob2xkZXIiLCJzaG93UGxhY2Vob2xkZXIiLCJCb29sZWFuIiwib25JbWFnZUVudGVyIiwib25JbWFnZUxlYXZlIiwiYmFubmVyIiwiY2xhc3NlcyIsImNsYXNzTmFtZXMiLCJzaXppbmciLCJhc3BlY3RSYXRpbyIsImdldFRvb2x0aXAiLCJjaGlsZHJlbiIsIm9uQ2xpY2siLCJibHVyaGFzaCIsImdldEZpbGVCb2R5IiwiaGFzTWVzc2FnZUFjdGlvbkJhciIsIlJvb20iLCJQaW5uZWQiLCJTZWFyY2giLCJUaHJlYWQiLCJyZW5kZXIiLCJmaWxlQm9keSIsIlJvb21Db250ZXh0IiwiSGlkZGVuSW1hZ2VQbGFjZWhvbGRlciIsIlB1cmVDb21wb25lbnQiLCJjbGFzc05hbWUiXSwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvY29tcG9uZW50cy92aWV3cy9tZXNzYWdlcy9NSW1hZ2VCb2R5LnRzeCJdLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMTUgLSAyMDIxIFRoZSBNYXRyaXgub3JnIEZvdW5kYXRpb24gQy5JLkMuXG5Db3B5cmlnaHQgMjAxOCwgMjAxOSBNaWNoYWVsIFRlbGF0eW5za2kgPDd0M2NoZ3V5QGdtYWlsLmNvbT5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQgUmVhY3QsIHsgQ29tcG9uZW50UHJvcHMsIGNyZWF0ZVJlZiB9IGZyb20gJ3JlYWN0JztcbmltcG9ydCB7IEJsdXJoYXNoIH0gZnJvbSBcInJlYWN0LWJsdXJoYXNoXCI7XG5pbXBvcnQgY2xhc3NOYW1lcyBmcm9tICdjbGFzc25hbWVzJztcbmltcG9ydCB7IENTU1RyYW5zaXRpb24sIFN3aXRjaFRyYW5zaXRpb24gfSBmcm9tICdyZWFjdC10cmFuc2l0aW9uLWdyb3VwJztcbmltcG9ydCB7IGxvZ2dlciB9IGZyb20gXCJtYXRyaXgtanMtc2RrL3NyYy9sb2dnZXJcIjtcbmltcG9ydCB7IENsaWVudEV2ZW50LCBDbGllbnRFdmVudEhhbmRsZXJNYXAgfSBmcm9tIFwibWF0cml4LWpzLXNkay9zcmMvY2xpZW50XCI7XG5cbmltcG9ydCBNRmlsZUJvZHkgZnJvbSAnLi9NRmlsZUJvZHknO1xuaW1wb3J0IE1vZGFsIGZyb20gJy4uLy4uLy4uL01vZGFsJztcbmltcG9ydCB7IF90IH0gZnJvbSAnLi4vLi4vLi4vbGFuZ3VhZ2VIYW5kbGVyJztcbmltcG9ydCBTZXR0aW5nc1N0b3JlIGZyb20gXCIuLi8uLi8uLi9zZXR0aW5ncy9TZXR0aW5nc1N0b3JlXCI7XG5pbXBvcnQgU3Bpbm5lciBmcm9tICcuLi9lbGVtZW50cy9TcGlubmVyJztcbmltcG9ydCB7IE1lZGlhLCBtZWRpYUZyb21Db250ZW50IH0gZnJvbSBcIi4uLy4uLy4uL2N1c3RvbWlzYXRpb25zL01lZGlhXCI7XG5pbXBvcnQgeyBCTFVSSEFTSF9GSUVMRCwgY3JlYXRlVGh1bWJuYWlsIH0gZnJvbSBcIi4uLy4uLy4uL3V0aWxzL2ltYWdlLW1lZGlhXCI7XG5pbXBvcnQgeyBJTWVkaWFFdmVudENvbnRlbnQgfSBmcm9tICcuLi8uLi8uLi9jdXN0b21pc2F0aW9ucy9tb2RlbHMvSU1lZGlhRXZlbnRDb250ZW50JztcbmltcG9ydCBJbWFnZVZpZXcgZnJvbSAnLi4vZWxlbWVudHMvSW1hZ2VWaWV3JztcbmltcG9ydCB7IElCb2R5UHJvcHMgfSBmcm9tIFwiLi9JQm9keVByb3BzXCI7XG5pbXBvcnQgeyBJbWFnZVNpemUsIHN1Z2dlc3RlZFNpemUgYXMgc3VnZ2VzdGVkSW1hZ2VTaXplIH0gZnJvbSBcIi4uLy4uLy4uL3NldHRpbmdzL2VudW1zL0ltYWdlU2l6ZVwiO1xuaW1wb3J0IHsgTWF0cml4Q2xpZW50UGVnIH0gZnJvbSAnLi4vLi4vLi4vTWF0cml4Q2xpZW50UGVnJztcbmltcG9ydCBSb29tQ29udGV4dCwgeyBUaW1lbGluZVJlbmRlcmluZ1R5cGUgfSBmcm9tIFwiLi4vLi4vLi4vY29udGV4dHMvUm9vbUNvbnRleHRcIjtcbmltcG9ydCB7IGJsb2JJc0FuaW1hdGVkLCBtYXlCZUFuaW1hdGVkIH0gZnJvbSAnLi4vLi4vLi4vdXRpbHMvSW1hZ2UnO1xuaW1wb3J0IHsgcHJlc2VudGFibGVUZXh0Rm9yRmlsZSB9IGZyb20gXCIuLi8uLi8uLi91dGlscy9GaWxlVXRpbHNcIjtcbmltcG9ydCB7IGNyZWF0ZVJlY29ubmVjdGVkTGlzdGVuZXIgfSBmcm9tICcuLi8uLi8uLi91dGlscy9jb25uZWN0aW9uJztcbmltcG9ydCBNZWRpYVByb2Nlc3NpbmdFcnJvciBmcm9tICcuL3NoYXJlZC9NZWRpYVByb2Nlc3NpbmdFcnJvcic7XG5cbmVudW0gUGxhY2Vob2xkZXIge1xuICAgIE5vSW1hZ2UsXG4gICAgQmx1cmhhc2gsXG59XG5cbmludGVyZmFjZSBJU3RhdGUge1xuICAgIGNvbnRlbnRVcmw/OiBzdHJpbmc7XG4gICAgdGh1bWJVcmw/OiBzdHJpbmc7XG4gICAgaXNBbmltYXRlZD86IGJvb2xlYW47XG4gICAgZXJyb3I/OiBFcnJvcjtcbiAgICBpbWdFcnJvcjogYm9vbGVhbjtcbiAgICBpbWdMb2FkZWQ6IGJvb2xlYW47XG4gICAgbG9hZGVkSW1hZ2VEaW1lbnNpb25zPzoge1xuICAgICAgICBuYXR1cmFsV2lkdGg6IG51bWJlcjtcbiAgICAgICAgbmF0dXJhbEhlaWdodDogbnVtYmVyO1xuICAgIH07XG4gICAgaG92ZXI6IGJvb2xlYW47XG4gICAgc2hvd0ltYWdlOiBib29sZWFuO1xuICAgIHBsYWNlaG9sZGVyOiBQbGFjZWhvbGRlcjtcbn1cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTUltYWdlQm9keSBleHRlbmRzIFJlYWN0LkNvbXBvbmVudDxJQm9keVByb3BzLCBJU3RhdGU+IHtcbiAgICBzdGF0aWMgY29udGV4dFR5cGUgPSBSb29tQ29udGV4dDtcbiAgICBwdWJsaWMgY29udGV4dCE6IFJlYWN0LkNvbnRleHRUeXBlPHR5cGVvZiBSb29tQ29udGV4dD47XG5cbiAgICBwcml2YXRlIHVubW91bnRlZCA9IHRydWU7XG4gICAgcHJpdmF0ZSBpbWFnZSA9IGNyZWF0ZVJlZjxIVE1MSW1hZ2VFbGVtZW50PigpO1xuICAgIHByaXZhdGUgdGltZW91dD86IG51bWJlcjtcbiAgICBwcml2YXRlIHNpemVXYXRjaGVyOiBzdHJpbmc7XG4gICAgcHJpdmF0ZSByZWNvbm5lY3RlZExpc3RlbmVyOiBDbGllbnRFdmVudEhhbmRsZXJNYXBbQ2xpZW50RXZlbnQuU3luY107XG5cbiAgICBjb25zdHJ1Y3Rvcihwcm9wczogSUJvZHlQcm9wcykge1xuICAgICAgICBzdXBlcihwcm9wcyk7XG5cbiAgICAgICAgdGhpcy5yZWNvbm5lY3RlZExpc3RlbmVyID0gY3JlYXRlUmVjb25uZWN0ZWRMaXN0ZW5lcih0aGlzLmNsZWFyRXJyb3IpO1xuXG4gICAgICAgIHRoaXMuc3RhdGUgPSB7XG4gICAgICAgICAgICBpbWdFcnJvcjogZmFsc2UsXG4gICAgICAgICAgICBpbWdMb2FkZWQ6IGZhbHNlLFxuICAgICAgICAgICAgaG92ZXI6IGZhbHNlLFxuICAgICAgICAgICAgc2hvd0ltYWdlOiBTZXR0aW5nc1N0b3JlLmdldFZhbHVlKFwic2hvd0ltYWdlc1wiKSxcbiAgICAgICAgICAgIHBsYWNlaG9sZGVyOiBQbGFjZWhvbGRlci5Ob0ltYWdlLFxuICAgICAgICB9O1xuICAgIH1cblxuICAgIHByb3RlY3RlZCBzaG93SW1hZ2UoKTogdm9pZCB7XG4gICAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKFwibXhfU2hvd0ltYWdlX1wiICsgdGhpcy5wcm9wcy5teEV2ZW50LmdldElkKCksIFwidHJ1ZVwiKTtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IHNob3dJbWFnZTogdHJ1ZSB9KTtcbiAgICAgICAgdGhpcy5kb3dubG9hZEltYWdlKCk7XG4gICAgfVxuXG4gICAgcHJvdGVjdGVkIG9uQ2xpY2sgPSAoZXY6IFJlYWN0Lk1vdXNlRXZlbnQpOiB2b2lkID0+IHtcbiAgICAgICAgaWYgKGV2LmJ1dHRvbiA9PT0gMCAmJiAhZXYubWV0YUtleSkge1xuICAgICAgICAgICAgZXYucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgIGlmICghdGhpcy5zdGF0ZS5zaG93SW1hZ2UpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnNob3dJbWFnZSgpO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgY29uc3QgY29udGVudCA9IHRoaXMucHJvcHMubXhFdmVudC5nZXRDb250ZW50PElNZWRpYUV2ZW50Q29udGVudD4oKTtcbiAgICAgICAgICAgIGNvbnN0IGh0dHBVcmwgPSB0aGlzLnN0YXRlLmNvbnRlbnRVcmw7XG4gICAgICAgICAgICBjb25zdCBwYXJhbXM6IE9taXQ8Q29tcG9uZW50UHJvcHM8dHlwZW9mIEltYWdlVmlldz4sIFwib25GaW5pc2hlZFwiPiA9IHtcbiAgICAgICAgICAgICAgICBzcmM6IGh0dHBVcmwsXG4gICAgICAgICAgICAgICAgbmFtZTogY29udGVudC5ib2R5Py5sZW5ndGggPiAwID8gY29udGVudC5ib2R5IDogX3QoJ0F0dGFjaG1lbnQnKSxcbiAgICAgICAgICAgICAgICBteEV2ZW50OiB0aGlzLnByb3BzLm14RXZlbnQsXG4gICAgICAgICAgICAgICAgcGVybWFsaW5rQ3JlYXRvcjogdGhpcy5wcm9wcy5wZXJtYWxpbmtDcmVhdG9yLFxuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgaWYgKGNvbnRlbnQuaW5mbykge1xuICAgICAgICAgICAgICAgIHBhcmFtcy53aWR0aCA9IGNvbnRlbnQuaW5mby53O1xuICAgICAgICAgICAgICAgIHBhcmFtcy5oZWlnaHQgPSBjb250ZW50LmluZm8uaDtcbiAgICAgICAgICAgICAgICBwYXJhbXMuZmlsZVNpemUgPSBjb250ZW50LmluZm8uc2l6ZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKHRoaXMuaW1hZ2UuY3VycmVudCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGNsaWVudFJlY3QgPSB0aGlzLmltYWdlLmN1cnJlbnQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG5cbiAgICAgICAgICAgICAgICBwYXJhbXMudGh1bWJuYWlsSW5mbyA9IHtcbiAgICAgICAgICAgICAgICAgICAgd2lkdGg6IGNsaWVudFJlY3Qud2lkdGgsXG4gICAgICAgICAgICAgICAgICAgIGhlaWdodDogY2xpZW50UmVjdC5oZWlnaHQsXG4gICAgICAgICAgICAgICAgICAgIHBvc2l0aW9uWDogY2xpZW50UmVjdC54LFxuICAgICAgICAgICAgICAgICAgICBwb3NpdGlvblk6IGNsaWVudFJlY3QueSxcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBNb2RhbC5jcmVhdGVEaWFsb2coSW1hZ2VWaWV3LCBwYXJhbXMsIFwibXhfRGlhbG9nX2xpZ2h0Ym94XCIsIG51bGwsIHRydWUpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHByb3RlY3RlZCBvbkltYWdlRW50ZXIgPSAoZTogUmVhY3QuTW91c2VFdmVudDxIVE1MSW1hZ2VFbGVtZW50Pik6IHZvaWQgPT4ge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHsgaG92ZXI6IHRydWUgfSk7XG5cbiAgICAgICAgaWYgKCF0aGlzLnN0YXRlLnNob3dJbWFnZSB8fCAhdGhpcy5zdGF0ZS5pc0FuaW1hdGVkIHx8IFNldHRpbmdzU3RvcmUuZ2V0VmFsdWUoXCJhdXRvcGxheUdpZnNcIikpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBpbWdFbGVtZW50ID0gZS5jdXJyZW50VGFyZ2V0O1xuICAgICAgICBpbWdFbGVtZW50LnNyYyA9IHRoaXMuc3RhdGUuY29udGVudFVybDtcbiAgICB9O1xuXG4gICAgcHJvdGVjdGVkIG9uSW1hZ2VMZWF2ZSA9IChlOiBSZWFjdC5Nb3VzZUV2ZW50PEhUTUxJbWFnZUVsZW1lbnQ+KTogdm9pZCA9PiB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoeyBob3ZlcjogZmFsc2UgfSk7XG5cbiAgICAgICAgaWYgKCF0aGlzLnN0YXRlLnNob3dJbWFnZSB8fCAhdGhpcy5zdGF0ZS5pc0FuaW1hdGVkIHx8IFNldHRpbmdzU3RvcmUuZ2V0VmFsdWUoXCJhdXRvcGxheUdpZnNcIikpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBpbWdFbGVtZW50ID0gZS5jdXJyZW50VGFyZ2V0O1xuICAgICAgICBpbWdFbGVtZW50LnNyYyA9IHRoaXMuc3RhdGUudGh1bWJVcmwgPz8gdGhpcy5zdGF0ZS5jb250ZW50VXJsO1xuICAgIH07XG5cbiAgICBwcml2YXRlIGNsZWFyRXJyb3IgPSAoKSA9PiB7XG4gICAgICAgIE1hdHJpeENsaWVudFBlZy5nZXQoKS5vZmYoQ2xpZW50RXZlbnQuU3luYywgdGhpcy5yZWNvbm5lY3RlZExpc3RlbmVyKTtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IGltZ0Vycm9yOiBmYWxzZSB9KTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvbkltYWdlRXJyb3IgPSAoKTogdm9pZCA9PiB7XG4gICAgICAgIHRoaXMuY2xlYXJCbHVyaGFzaFRpbWVvdXQoKTtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICBpbWdFcnJvcjogdHJ1ZSxcbiAgICAgICAgfSk7XG4gICAgICAgIE1hdHJpeENsaWVudFBlZy5nZXQoKS5vbihDbGllbnRFdmVudC5TeW5jLCB0aGlzLnJlY29ubmVjdGVkTGlzdGVuZXIpO1xuICAgIH07XG5cbiAgICBwcml2YXRlIG9uSW1hZ2VMb2FkID0gKCk6IHZvaWQgPT4ge1xuICAgICAgICB0aGlzLmNsZWFyQmx1cmhhc2hUaW1lb3V0KCk7XG4gICAgICAgIHRoaXMucHJvcHMub25IZWlnaHRDaGFuZ2VkKCk7XG5cbiAgICAgICAgbGV0IGxvYWRlZEltYWdlRGltZW5zaW9uczogSVN0YXRlW1wibG9hZGVkSW1hZ2VEaW1lbnNpb25zXCJdO1xuXG4gICAgICAgIGlmICh0aGlzLmltYWdlLmN1cnJlbnQpIHtcbiAgICAgICAgICAgIGNvbnN0IHsgbmF0dXJhbFdpZHRoLCBuYXR1cmFsSGVpZ2h0IH0gPSB0aGlzLmltYWdlLmN1cnJlbnQ7XG4gICAgICAgICAgICAvLyB0aGlzIGlzIG9ubHkgdXNlZCBhcyBhIGZhbGxiYWNrIGluIGNhc2UgY29udGVudC5pbmZvLncvaCBpcyBtaXNzaW5nXG4gICAgICAgICAgICBsb2FkZWRJbWFnZURpbWVuc2lvbnMgPSB7IG5hdHVyYWxXaWR0aCwgbmF0dXJhbEhlaWdodCB9O1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoeyBpbWdMb2FkZWQ6IHRydWUsIGxvYWRlZEltYWdlRGltZW5zaW9ucyB9KTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBnZXRDb250ZW50VXJsKCk6IHN0cmluZyB7XG4gICAgICAgIC8vIER1cmluZyBleHBvcnQsIHRoZSBjb250ZW50IHVybCB3aWxsIHBvaW50IHRvIHRoZSBNU0MsIHdoaWNoIHdpbGwgbGF0ZXIgcG9pbnQgdG8gYSBsb2NhbCB1cmxcbiAgICAgICAgaWYgKHRoaXMucHJvcHMuZm9yRXhwb3J0KSByZXR1cm4gdGhpcy5tZWRpYS5zcmNNeGM7XG4gICAgICAgIHJldHVybiB0aGlzLm1lZGlhLnNyY0h0dHA7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBnZXQgbWVkaWEoKTogTWVkaWEge1xuICAgICAgICByZXR1cm4gbWVkaWFGcm9tQ29udGVudCh0aGlzLnByb3BzLm14RXZlbnQuZ2V0Q29udGVudCgpKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGdldFRodW1iVXJsKCk6IHN0cmluZyB7XG4gICAgICAgIC8vIEZJWE1FOiB3ZSBsZXQgaW1hZ2VzIGdyb3cgYXMgd2lkZSBhcyB5b3UgbGlrZSwgcmF0aGVyIHRoYW4gY2FwcGVkIHRvIDgwMHg2MDAuXG4gICAgICAgIC8vIFNvIGVpdGhlciB3ZSBuZWVkIHRvIHN1cHBvcnQgY3VzdG9tIHRpbWVsaW5lIHdpZHRocyBoZXJlLCBvciByZWltcG9zZSB0aGUgY2FwLCBvdGhlcndpc2UgdGhlXG4gICAgICAgIC8vIHRodW1ibmFpbCByZXNvbHV0aW9uIHdpbGwgYmUgdW5uZWNlc3NhcmlseSByZWR1Y2VkLlxuICAgICAgICAvLyBjdXN0b20gdGltZWxpbmUgd2lkdGhzIHNlZW1zIHByZWZlcmFibGUuXG4gICAgICAgIGNvbnN0IHRodW1iV2lkdGggPSA4MDA7XG4gICAgICAgIGNvbnN0IHRodW1iSGVpZ2h0ID0gNjAwO1xuXG4gICAgICAgIGNvbnN0IGNvbnRlbnQgPSB0aGlzLnByb3BzLm14RXZlbnQuZ2V0Q29udGVudDxJTWVkaWFFdmVudENvbnRlbnQ+KCk7XG4gICAgICAgIGNvbnN0IG1lZGlhID0gbWVkaWFGcm9tQ29udGVudChjb250ZW50KTtcbiAgICAgICAgY29uc3QgaW5mbyA9IGNvbnRlbnQuaW5mbztcblxuICAgICAgICBpZiAoaW5mbz8ubWltZXR5cGUgPT09IFwiaW1hZ2Uvc3ZnK3htbFwiICYmIG1lZGlhLmhhc1RodW1ibmFpbCkge1xuICAgICAgICAgICAgLy8gU3BlY2lhbC1jYXNlIHRvIHJldHVybiBjbGllbnRzaWRlIHNlbmRlci1nZW5lcmF0ZWQgdGh1bWJuYWlscyBmb3IgU1ZHcywgaWYgYW55LFxuICAgICAgICAgICAgLy8gZ2l2ZW4gd2UgZGVsaWJlcmF0ZWx5IGRvbid0IHRodW1ibmFpbCB0aGVtIHNlcnZlcnNpZGUgdG8gcHJldmVudCBiaWxsaW9uIGxvbCBhdHRhY2tzIGFuZCBzaW1pbGFyLlxuICAgICAgICAgICAgcmV0dXJuIG1lZGlhLmdldFRodW1ibmFpbEh0dHAodGh1bWJXaWR0aCwgdGh1bWJIZWlnaHQsICdzY2FsZScpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gd2UgdHJ5IHRvIGRvd25sb2FkIHRoZSBjb3JyZWN0IHJlc29sdXRpb24gZm9yIGhpLXJlcyBpbWFnZXMgKGxpa2UgcmV0aW5hIHNjcmVlbnNob3RzKS5cbiAgICAgICAgLy8gU3luYXBzZSBvbmx5IHN1cHBvcnRzIDgwMHg2MDAgdGh1bWJuYWlscyBmb3Igbm93IHRob3VnaCxcbiAgICAgICAgLy8gc28gd2UnbGwgbmVlZCB0byBkb3dubG9hZCB0aGUgb3JpZ2luYWwgaW1hZ2UgZm9yIHRoaXMgdG8gd29yayAgd2VsbCBmb3Igbm93LlxuICAgICAgICAvLyBGaXJzdCwgbGV0J3MgdHJ5IGEgZmV3IGNhc2VzIHRoYXQgbGV0IHVzIGF2b2lkIGRvd25sb2FkaW5nIHRoZSBvcmlnaW5hbCwgaW5jbHVkaW5nOlxuICAgICAgICAvLyAgIC0gV2hlbiBkaXNwbGF5aW5nIGEgR0lGLCB3ZSBhbHdheXMgd2FudCB0byB0aHVtYm5haWwgc28gdGhhdCB3ZSBjYW5cbiAgICAgICAgLy8gICAgIHByb3Blcmx5IHJlc3BlY3QgdGhlIHVzZXIncyBHSUYgYXV0b3BsYXkgc2V0dGluZyAod2hpY2ggcmVsaWVzIG9uXG4gICAgICAgIC8vICAgICB0aHVtYm5haWxpbmcgdG8gcHJvZHVjZSB0aGUgc3RhdGljIHByZXZpZXcgaW1hZ2UpXG4gICAgICAgIC8vICAgLSBPbiBhIGxvdyBEUEkgZGV2aWNlLCBhbHdheXMgdGh1bWJuYWlsIHRvIHNhdmUgYmFuZHdpZHRoXG4gICAgICAgIC8vICAgLSBJZiB0aGVyZSdzIG5vIHNpemluZyBpbmZvIGluIHRoZSBldmVudCwgZGVmYXVsdCB0byB0aHVtYm5haWxcbiAgICAgICAgaWYgKFxuICAgICAgICAgICAgdGhpcy5zdGF0ZS5pc0FuaW1hdGVkIHx8XG4gICAgICAgICAgICB3aW5kb3cuZGV2aWNlUGl4ZWxSYXRpbyA9PT0gMS4wIHx8XG4gICAgICAgICAgICAoIWluZm8gfHwgIWluZm8udyB8fCAhaW5mby5oIHx8ICFpbmZvLnNpemUpXG4gICAgICAgICkge1xuICAgICAgICAgICAgcmV0dXJuIG1lZGlhLmdldFRodW1ibmFpbE9mU291cmNlSHR0cCh0aHVtYldpZHRoLCB0aHVtYkhlaWdodCk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBXZSBzaG91bGQgb25seSByZXF1ZXN0IHRodW1ibmFpbHMgaWYgdGhlIGltYWdlIGlzIGJpZ2dlciB0aGFuIDgwMHg2MDAgKG9yIDE2MDB4MTIwMCBvbiByZXRpbmEpIG90aGVyd2lzZVxuICAgICAgICAvLyB0aGUgaW1hZ2UgaW4gdGhlIHRpbWVsaW5lIHdpbGwganVzdCBlbmQgdXAgcmVzYW1wbGVkIGFuZCBkZS1yZXRpbmEnZCBmb3Igbm8gZ29vZCByZWFzb24uXG4gICAgICAgIC8vIElkZWFsbHkgdGhlIHNlcnZlciB3b3VsZCBwcmUtZ2VuIDE2MDB4MTIwMCB0aHVtYm5haWxzIGluIG9yZGVyIHRvIHByb3ZpZGUgcmV0aW5hIHRodW1ibmFpbHMsXG4gICAgICAgIC8vIGJ1dCB3ZSBkb24ndCBkbyB0aGlzIGN1cnJlbnRseSBpbiBzeW5hcHNlIGZvciBmZWFyIG9mIGRpc2sgc3BhY2UuXG4gICAgICAgIC8vIEFzIGEgY29tcHJvbWlzZSwgbGV0J3Mgc3dpdGNoIHRvIG5vbi1yZXRpbmEgdGh1bWJuYWlscyBvbmx5IGlmIHRoZSBvcmlnaW5hbCBpbWFnZSBpcyBib3RoXG4gICAgICAgIC8vIHBoeXNpY2FsbHkgdG9vIGxhcmdlIGFuZCBnb2luZyB0byBiZSBtYXNzaXZlIHRvIGxvYWQgaW4gdGhlIHRpbWVsaW5lIChlLmcuID4xTUIpLlxuXG4gICAgICAgIGNvbnN0IGlzTGFyZ2VyVGhhblRodW1ibmFpbCA9IChcbiAgICAgICAgICAgIGluZm8udyA+IHRodW1iV2lkdGggfHxcbiAgICAgICAgICAgIGluZm8uaCA+IHRodW1iSGVpZ2h0XG4gICAgICAgICk7XG4gICAgICAgIGNvbnN0IGlzTGFyZ2VGaWxlU2l6ZSA9IGluZm8uc2l6ZSA+IDEgKiAxMDI0ICogMTAyNDsgLy8gMW1iXG5cbiAgICAgICAgaWYgKGlzTGFyZ2VGaWxlU2l6ZSAmJiBpc0xhcmdlclRoYW5UaHVtYm5haWwpIHtcbiAgICAgICAgICAgIC8vIGltYWdlIGlzIHRvbyBsYXJnZSBwaHlzaWNhbGx5IGFuZCBieXRlLXdpc2UgdG8gY2x1dHRlciBvdXIgdGltZWxpbmUgc28sXG4gICAgICAgICAgICAvLyB3ZSBhc2sgZm9yIGEgdGh1bWJuYWlsLCBkZXNwaXRlIGtub3dpbmcgdGhhdCBpdCB3aWxsIGJlIG1heCA4MDB4NjAwXG4gICAgICAgICAgICAvLyBkZXNwaXRlIHVzIGJlaW5nIHJldGluYSAoYXMgc3luYXBzZSBkb2Vzbid0IGRvIDE2MDB4MTIwMCB0aHVtYnMgeWV0KS5cbiAgICAgICAgICAgIHJldHVybiBtZWRpYS5nZXRUaHVtYm5haWxPZlNvdXJjZUh0dHAodGh1bWJXaWR0aCwgdGh1bWJIZWlnaHQpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gZG93bmxvYWQgdGhlIG9yaWdpbmFsIGltYWdlIG90aGVyd2lzZSwgc28gd2UgY2FuIHNjYWxlIGl0IGNsaWVudCBzaWRlIHRvIHRha2UgcGl4ZWxSYXRpbyBpbnRvIGFjY291bnQuXG4gICAgICAgIHJldHVybiBtZWRpYS5zcmNIdHRwO1xuICAgIH1cblxuICAgIHByaXZhdGUgYXN5bmMgZG93bmxvYWRJbWFnZSgpIHtcbiAgICAgICAgaWYgKHRoaXMuc3RhdGUuY29udGVudFVybCkgcmV0dXJuOyAvLyBhbHJlYWR5IGRvd25sb2FkZWRcblxuICAgICAgICBsZXQgdGh1bWJVcmw6IHN0cmluZztcbiAgICAgICAgbGV0IGNvbnRlbnRVcmw6IHN0cmluZztcbiAgICAgICAgaWYgKHRoaXMucHJvcHMubWVkaWFFdmVudEhlbHBlci5tZWRpYS5pc0VuY3J5cHRlZCkge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAoW2NvbnRlbnRVcmwsIHRodW1iVXJsXSA9IGF3YWl0IFByb21pc2UuYWxsKFtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wcm9wcy5tZWRpYUV2ZW50SGVscGVyLnNvdXJjZVVybC52YWx1ZSxcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wcm9wcy5tZWRpYUV2ZW50SGVscGVyLnRodW1ibmFpbFVybC52YWx1ZSxcbiAgICAgICAgICAgICAgICBdKSk7XG4gICAgICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLnVubW91bnRlZCkgcmV0dXJuO1xuICAgICAgICAgICAgICAgIGxvZ2dlci53YXJuKFwiVW5hYmxlIHRvIGRlY3J5cHQgYXR0YWNobWVudDogXCIsIGVycm9yKTtcbiAgICAgICAgICAgICAgICAvLyBTZXQgYSBwbGFjZWhvbGRlciBpbWFnZSB3aGVuIHdlIGNhbid0IGRlY3J5cHQgdGhlIGltYWdlLlxuICAgICAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoeyBlcnJvciB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRodW1iVXJsID0gdGhpcy5nZXRUaHVtYlVybCgpO1xuICAgICAgICAgICAgY29udGVudFVybCA9IHRoaXMuZ2V0Q29udGVudFVybCgpO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgY29udGVudCA9IHRoaXMucHJvcHMubXhFdmVudC5nZXRDb250ZW50PElNZWRpYUV2ZW50Q29udGVudD4oKTtcbiAgICAgICAgbGV0IGlzQW5pbWF0ZWQgPSBtYXlCZUFuaW1hdGVkKGNvbnRlbnQuaW5mbz8ubWltZXR5cGUpO1xuXG4gICAgICAgIC8vIElmIHRoZXJlIGlzIG5vIGluY2x1ZGVkIG5vbi1hbmltYXRlZCB0aHVtYm5haWwgdGhlbiB3ZSB3aWxsIGdlbmVyYXRlIG91ciBvd24sIHdlIGNhbid0IGRlcGVuZCBvbiB0aGUgc2VydmVyXG4gICAgICAgIC8vIGJlY2F1c2UgMS4gZW5jcnlwdGlvbiBhbmQgMi4gd2UgY2FuJ3QgYXNrIHRoZSBzZXJ2ZXIgc3BlY2lmaWNhbGx5IGZvciBhIG5vbi1hbmltYXRlZCB0aHVtYm5haWwuXG4gICAgICAgIGlmIChpc0FuaW1hdGVkICYmICFTZXR0aW5nc1N0b3JlLmdldFZhbHVlKFwiYXV0b3BsYXlHaWZzXCIpKSB7XG4gICAgICAgICAgICBpZiAoIXRodW1iVXJsIHx8ICFjb250ZW50Py5pbmZvLnRodW1ibmFpbF9pbmZvIHx8IG1heUJlQW5pbWF0ZWQoY29udGVudC5pbmZvLnRodW1ibmFpbF9pbmZvLm1pbWV0eXBlKSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGltZyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJpbWdcIik7XG4gICAgICAgICAgICAgICAgY29uc3QgbG9hZFByb21pc2UgPSBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGltZy5vbmxvYWQgPSByZXNvbHZlO1xuICAgICAgICAgICAgICAgICAgICBpbWcub25lcnJvciA9IHJlamVjdDtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBpbWcuY3Jvc3NPcmlnaW4gPSBcIkFub255bW91c1wiOyAvLyBDT1JTIGFsbG93IGNhbnZhcyBhY2Nlc3NcbiAgICAgICAgICAgICAgICBpbWcuc3JjID0gY29udGVudFVybDtcblxuICAgICAgICAgICAgICAgIGF3YWl0IGxvYWRQcm9taXNlO1xuXG4gICAgICAgICAgICAgICAgY29uc3QgYmxvYiA9IGF3YWl0IHRoaXMucHJvcHMubWVkaWFFdmVudEhlbHBlci5zb3VyY2VCbG9iLnZhbHVlO1xuICAgICAgICAgICAgICAgIGlmICghYXdhaXQgYmxvYklzQW5pbWF0ZWQoY29udGVudC5pbmZvLm1pbWV0eXBlLCBibG9iKSkge1xuICAgICAgICAgICAgICAgICAgICBpc0FuaW1hdGVkID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKGlzQW5pbWF0ZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgdGh1bWIgPSBhd2FpdCBjcmVhdGVUaHVtYm5haWwoaW1nLCBpbWcud2lkdGgsIGltZy5oZWlnaHQsIGNvbnRlbnQuaW5mby5taW1ldHlwZSwgZmFsc2UpO1xuICAgICAgICAgICAgICAgICAgICB0aHVtYlVybCA9IFVSTC5jcmVhdGVPYmplY3RVUkwodGh1bWIudGh1bWJuYWlsKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy51bm1vdW50ZWQpIHJldHVybjtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICBjb250ZW50VXJsLFxuICAgICAgICAgICAgdGh1bWJVcmwsXG4gICAgICAgICAgICBpc0FuaW1hdGVkLFxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGNsZWFyQmx1cmhhc2hUaW1lb3V0KCkge1xuICAgICAgICBpZiAodGhpcy50aW1lb3V0KSB7XG4gICAgICAgICAgICBjbGVhclRpbWVvdXQodGhpcy50aW1lb3V0KTtcbiAgICAgICAgICAgIHRoaXMudGltZW91dCA9IHVuZGVmaW5lZDtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGNvbXBvbmVudERpZE1vdW50KCkge1xuICAgICAgICB0aGlzLnVubW91bnRlZCA9IGZhbHNlO1xuXG4gICAgICAgIGNvbnN0IHNob3dJbWFnZSA9IHRoaXMuc3RhdGUuc2hvd0ltYWdlIHx8XG4gICAgICAgICAgICBsb2NhbFN0b3JhZ2UuZ2V0SXRlbShcIm14X1Nob3dJbWFnZV9cIiArIHRoaXMucHJvcHMubXhFdmVudC5nZXRJZCgpKSA9PT0gXCJ0cnVlXCI7XG5cbiAgICAgICAgaWYgKHNob3dJbWFnZSkge1xuICAgICAgICAgICAgLy8gbm9pbnNwZWN0aW9uIEpTSWdub3JlZFByb21pc2VGcm9tQ2FsbFxuICAgICAgICAgICAgdGhpcy5kb3dubG9hZEltYWdlKCk7XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHsgc2hvd0ltYWdlOiB0cnVlIH0pO1xuICAgICAgICB9IC8vIGVsc2UgZG9uJ3QgZG93bmxvYWQgYW55dGhpbmcgYmVjYXVzZSB3ZSBkb24ndCB3YW50IHRvIGRpc3BsYXkgYW55dGhpbmcuXG5cbiAgICAgICAgLy8gQWRkIGEgMTUwbXMgdGltZXIgZm9yIGJsdXJoYXNoIHRvIGZpcnN0IGFwcGVhci5cbiAgICAgICAgaWYgKHRoaXMucHJvcHMubXhFdmVudC5nZXRDb250ZW50KCkuaW5mbz8uW0JMVVJIQVNIX0ZJRUxEXSkge1xuICAgICAgICAgICAgdGhpcy5jbGVhckJsdXJoYXNoVGltZW91dCgpO1xuICAgICAgICAgICAgdGhpcy50aW1lb3V0ID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKCF0aGlzLnN0YXRlLmltZ0xvYWRlZCB8fCAhdGhpcy5zdGF0ZS5pbWdFcnJvcikge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHBsYWNlaG9sZGVyOiBQbGFjZWhvbGRlci5CbHVyaGFzaCxcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSwgMTUwKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuc2l6ZVdhdGNoZXIgPSBTZXR0aW5nc1N0b3JlLndhdGNoU2V0dGluZyhcIkltYWdlcy5zaXplXCIsIG51bGwsICgpID0+IHtcbiAgICAgICAgICAgIHRoaXMuZm9yY2VVcGRhdGUoKTsgLy8gd2UgZG9uJ3QgcmVhbGx5IGhhdmUgYSByZWxpYWJsZSB0aGluZyB0byB1cGRhdGUsIHNvIGp1c3QgdXBkYXRlIHRoZSB3aG9sZSB0aGluZ1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBjb21wb25lbnRXaWxsVW5tb3VudCgpIHtcbiAgICAgICAgdGhpcy51bm1vdW50ZWQgPSB0cnVlO1xuICAgICAgICBNYXRyaXhDbGllbnRQZWcuZ2V0KCkub2ZmKENsaWVudEV2ZW50LlN5bmMsIHRoaXMucmVjb25uZWN0ZWRMaXN0ZW5lcik7XG4gICAgICAgIHRoaXMuY2xlYXJCbHVyaGFzaFRpbWVvdXQoKTtcbiAgICAgICAgU2V0dGluZ3NTdG9yZS51bndhdGNoU2V0dGluZyh0aGlzLnNpemVXYXRjaGVyKTtcbiAgICAgICAgaWYgKHRoaXMuc3RhdGUuaXNBbmltYXRlZCAmJiB0aGlzLnN0YXRlLnRodW1iVXJsKSB7XG4gICAgICAgICAgICBVUkwucmV2b2tlT2JqZWN0VVJMKHRoaXMuc3RhdGUudGh1bWJVcmwpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJvdGVjdGVkIGdldEJhbm5lcihjb250ZW50OiBJTWVkaWFFdmVudENvbnRlbnQpOiBKU1guRWxlbWVudCB7XG4gICAgICAgIC8vIEhpZGUgaXQgZm9yIHRoZSB0aHJlYWRzIGxpc3QgJiB0aGUgZmlsZSBwYW5lbCB3aGVyZSB3ZSBzaG93IGl0IGFzIHRleHQgYW55d2F5LlxuICAgICAgICBpZiAoW1xuICAgICAgICAgICAgVGltZWxpbmVSZW5kZXJpbmdUeXBlLlRocmVhZHNMaXN0LFxuICAgICAgICAgICAgVGltZWxpbmVSZW5kZXJpbmdUeXBlLkZpbGUsXG4gICAgICAgIF0uaW5jbHVkZXModGhpcy5jb250ZXh0LnRpbWVsaW5lUmVuZGVyaW5nVHlwZSkpIHtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIm14X01JbWFnZUJvZHlfYmFubmVyXCI+XG4gICAgICAgICAgICAgICAgeyBwcmVzZW50YWJsZVRleHRGb3JGaWxlKGNvbnRlbnQsIF90KFwiSW1hZ2VcIiksIHRydWUsIHRydWUpIH1cbiAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgKTtcbiAgICB9XG5cbiAgICBwcm90ZWN0ZWQgbWVzc2FnZUNvbnRlbnQoXG4gICAgICAgIGNvbnRlbnRVcmw6IHN0cmluZyxcbiAgICAgICAgdGh1bWJVcmw6IHN0cmluZyxcbiAgICAgICAgY29udGVudDogSU1lZGlhRXZlbnRDb250ZW50LFxuICAgICAgICBmb3JjZWRIZWlnaHQ/OiBudW1iZXIsXG4gICAgKTogSlNYLkVsZW1lbnQge1xuICAgICAgICBpZiAoIXRodW1iVXJsKSB0aHVtYlVybCA9IGNvbnRlbnRVcmw7IC8vIGZhbGxiYWNrXG5cbiAgICAgICAgbGV0IGluZm9XaWR0aDogbnVtYmVyO1xuICAgICAgICBsZXQgaW5mb0hlaWdodDogbnVtYmVyO1xuICAgICAgICBsZXQgaW5mb1N2ZyA9IGZhbHNlO1xuXG4gICAgICAgIGlmIChjb250ZW50LmluZm8/LncgJiYgY29udGVudC5pbmZvPy5oKSB7XG4gICAgICAgICAgICBpbmZvV2lkdGggPSBjb250ZW50LmluZm8udztcbiAgICAgICAgICAgIGluZm9IZWlnaHQgPSBjb250ZW50LmluZm8uaDtcbiAgICAgICAgICAgIGluZm9TdmcgPSBjb250ZW50LmluZm8ubWltZXR5cGUgPT09IFwiaW1hZ2Uvc3ZnK3htbFwiO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gV2hpbHN0IHRoZSBpbWFnZSBsb2FkcywgZGlzcGxheSBub3RoaW5nLiBXZSBhbHNvIGRvbid0IGRpc3BsYXkgYSBibHVyaGFzaCBpbWFnZVxuICAgICAgICAgICAgLy8gYmVjYXVzZSB3ZSBkb24ndCByZWFsbHkga25vdyB3aGF0IHNpemUgb2YgaW1hZ2Ugd2UnbGwgZW5kIHVwIHdpdGguXG4gICAgICAgICAgICAvL1xuICAgICAgICAgICAgLy8gT25jZSBsb2FkZWQsIHVzZSB0aGUgbG9hZGVkIGltYWdlIGRpbWVuc2lvbnMgc3RvcmVkIGluIGBsb2FkZWRJbWFnZURpbWVuc2lvbnNgLlxuICAgICAgICAgICAgLy9cbiAgICAgICAgICAgIC8vIEJ5IGRvaW5nIHRoaXMsIHRoZSBpbWFnZSBcInBvcHNcIiBpbnRvIHRoZSB0aW1lbGluZSwgYnV0IGlzIHN0aWxsIHJlc3RyaWN0ZWRcbiAgICAgICAgICAgIC8vIGJ5IHRoZSBzYW1lIHdpZHRoIGFuZCBoZWlnaHQgbG9naWMgYmVsb3cuXG4gICAgICAgICAgICBpZiAoIXRoaXMuc3RhdGUubG9hZGVkSW1hZ2VEaW1lbnNpb25zKSB7XG4gICAgICAgICAgICAgICAgbGV0IGltYWdlRWxlbWVudDtcbiAgICAgICAgICAgICAgICBpZiAoIXRoaXMuc3RhdGUuc2hvd0ltYWdlKSB7XG4gICAgICAgICAgICAgICAgICAgIGltYWdlRWxlbWVudCA9IDxIaWRkZW5JbWFnZVBsYWNlaG9sZGVyIC8+O1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGltYWdlRWxlbWVudCA9IChcbiAgICAgICAgICAgICAgICAgICAgICAgIDxpbWdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdHlsZT17eyBkaXNwbGF5OiAnbm9uZScgfX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzcmM9e3RodW1iVXJsfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlZj17dGhpcy5pbWFnZX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhbHQ9e2NvbnRlbnQuYm9keX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbkVycm9yPXt0aGlzLm9uSW1hZ2VFcnJvcn1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbkxvYWQ9e3RoaXMub25JbWFnZUxvYWR9XG4gICAgICAgICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy53cmFwSW1hZ2UoY29udGVudFVybCwgaW1hZ2VFbGVtZW50KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGluZm9XaWR0aCA9IHRoaXMuc3RhdGUubG9hZGVkSW1hZ2VEaW1lbnNpb25zLm5hdHVyYWxXaWR0aDtcbiAgICAgICAgICAgIGluZm9IZWlnaHQgPSB0aGlzLnN0YXRlLmxvYWRlZEltYWdlRGltZW5zaW9ucy5uYXR1cmFsSGVpZ2h0O1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gVGhlIG1heGltdW0gc2l6ZSBvZiB0aGUgdGh1bWJuYWlsIGFzIGl0IGlzIHJlbmRlcmVkIGFzIGFuIDxpbWc+LFxuICAgICAgICAvLyBhY2NvdW50aW5nIGZvciBhbnkgaGVpZ2h0IGNvbnN0cmFpbnRzXG4gICAgICAgIGNvbnN0IHsgdzogbWF4V2lkdGgsIGg6IG1heEhlaWdodCB9ID0gc3VnZ2VzdGVkSW1hZ2VTaXplKFxuICAgICAgICAgICAgU2V0dGluZ3NTdG9yZS5nZXRWYWx1ZShcIkltYWdlcy5zaXplXCIpIGFzIEltYWdlU2l6ZSxcbiAgICAgICAgICAgIHsgdzogaW5mb1dpZHRoLCBoOiBpbmZvSGVpZ2h0IH0sXG4gICAgICAgICAgICBmb3JjZWRIZWlnaHQgPz8gdGhpcy5wcm9wcy5tYXhJbWFnZUhlaWdodCxcbiAgICAgICAgKTtcblxuICAgICAgICBsZXQgaW1nOiBKU1guRWxlbWVudDtcbiAgICAgICAgbGV0IHBsYWNlaG9sZGVyOiBKU1guRWxlbWVudDtcbiAgICAgICAgbGV0IGdpZkxhYmVsOiBKU1guRWxlbWVudDtcblxuICAgICAgICBpZiAoIXRoaXMucHJvcHMuZm9yRXhwb3J0ICYmICF0aGlzLnN0YXRlLmltZ0xvYWRlZCkge1xuICAgICAgICAgICAgcGxhY2Vob2xkZXIgPSB0aGlzLmdldFBsYWNlaG9sZGVyKG1heFdpZHRoLCBtYXhIZWlnaHQpO1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IHNob3dQbGFjZWhvbGRlciA9IEJvb2xlYW4ocGxhY2Vob2xkZXIpO1xuXG4gICAgICAgIGlmICh0aHVtYlVybCAmJiAhdGhpcy5zdGF0ZS5pbWdFcnJvcikge1xuICAgICAgICAgICAgLy8gUmVzdHJpY3QgdGhlIHdpZHRoIG9mIHRoZSB0aHVtYm5haWwgaGVyZSwgb3RoZXJ3aXNlIGl0IHdpbGwgZmlsbCB0aGUgY29udGFpbmVyXG4gICAgICAgICAgICAvLyB3aGljaCBoYXMgdGhlIHNhbWUgd2lkdGggYXMgdGhlIHRpbWVsaW5lXG4gICAgICAgICAgICAvLyBteF9NSW1hZ2VCb2R5X3RodW1ibmFpbCByZXNpemVzIGltZyB0byBleGFjdGx5IGNvbnRhaW5lciBzaXplXG4gICAgICAgICAgICBpbWcgPSAoXG4gICAgICAgICAgICAgICAgPGltZ1xuICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJteF9NSW1hZ2VCb2R5X3RodW1ibmFpbFwiXG4gICAgICAgICAgICAgICAgICAgIHNyYz17dGh1bWJVcmx9XG4gICAgICAgICAgICAgICAgICAgIHJlZj17dGhpcy5pbWFnZX1cbiAgICAgICAgICAgICAgICAgICAgYWx0PXtjb250ZW50LmJvZHl9XG4gICAgICAgICAgICAgICAgICAgIG9uRXJyb3I9e3RoaXMub25JbWFnZUVycm9yfVxuICAgICAgICAgICAgICAgICAgICBvbkxvYWQ9e3RoaXMub25JbWFnZUxvYWR9XG4gICAgICAgICAgICAgICAgICAgIG9uTW91c2VFbnRlcj17dGhpcy5vbkltYWdlRW50ZXJ9XG4gICAgICAgICAgICAgICAgICAgIG9uTW91c2VMZWF2ZT17dGhpcy5vbkltYWdlTGVhdmV9XG4gICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIXRoaXMuc3RhdGUuc2hvd0ltYWdlKSB7XG4gICAgICAgICAgICBpbWcgPSA8SGlkZGVuSW1hZ2VQbGFjZWhvbGRlciBtYXhXaWR0aD17bWF4V2lkdGh9IC8+O1xuICAgICAgICAgICAgc2hvd1BsYWNlaG9sZGVyID0gZmFsc2U7IC8vIGJlY2F1c2Ugd2UncmUgaGlkaW5nIHRoZSBpbWFnZSwgc28gZG9uJ3Qgc2hvdyB0aGUgcGxhY2Vob2xkZXIuXG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5zdGF0ZS5pc0FuaW1hdGVkICYmICFTZXR0aW5nc1N0b3JlLmdldFZhbHVlKFwiYXV0b3BsYXlHaWZzXCIpICYmICF0aGlzLnN0YXRlLmhvdmVyKSB7XG4gICAgICAgICAgICAvLyBYWFg6IEFyZ3VhYmx5IHdlIG1heSB3YW50IGEgZGlmZmVyZW50IGxhYmVsIHdoZW4gdGhlIGFuaW1hdGVkIGltYWdlIGlzIFdFQlAgYW5kIG5vdCBHSUZcbiAgICAgICAgICAgIGdpZkxhYmVsID0gPHAgY2xhc3NOYW1lPVwibXhfTUltYWdlQm9keV9naWZMYWJlbFwiPkdJRjwvcD47XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgYmFubmVyOiBKU1guRWxlbWVudDtcbiAgICAgICAgaWYgKHRoaXMuc3RhdGUuc2hvd0ltYWdlICYmIHRoaXMuc3RhdGUuaG92ZXIpIHtcbiAgICAgICAgICAgIGJhbm5lciA9IHRoaXMuZ2V0QmFubmVyKGNvbnRlbnQpO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgY2xhc3NlcyA9IGNsYXNzTmFtZXMoe1xuICAgICAgICAgICAgJ214X01JbWFnZUJvZHlfcGxhY2Vob2xkZXInOiB0cnVlLFxuICAgICAgICAgICAgJ214X01JbWFnZUJvZHlfcGxhY2Vob2xkZXItLWJsdXJoYXNoJzogdGhpcy5wcm9wcy5teEV2ZW50LmdldENvbnRlbnQoKS5pbmZvPy5bQkxVUkhBU0hfRklFTERdLFxuICAgICAgICB9KTtcblxuICAgICAgICAvLyBtYW55IFNWR3MgZG9uJ3QgaGF2ZSBhbiBpbnRyaW5zaWMgc2l6ZSBpZiB1c2VkIGluIDxpbWc+IGVsZW1lbnRzLlxuICAgICAgICAvLyBkdWUgdG8gdGhpcyB3ZSBoYXZlIHRvIHNldCBvdXIgZGVzaXJlZCB3aWR0aCBkaXJlY3RseS5cbiAgICAgICAgLy8gdGhpcyB3YXkgaWYgdGhlIGltYWdlIGlzIGZvcmNlZCB0byBzaHJpbmssIHRoZSBoZWlnaHQgYWRhcHRzIGFwcHJvcHJpYXRlbHkuXG4gICAgICAgIGNvbnN0IHNpemluZyA9IGluZm9TdmcgPyB7IG1heEhlaWdodCwgbWF4V2lkdGgsIHdpZHRoOiBtYXhXaWR0aCB9IDogeyBtYXhIZWlnaHQsIG1heFdpZHRoIH07XG5cbiAgICAgICAgY29uc3QgdGh1bWJuYWlsID0gKFxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9NSW1hZ2VCb2R5X3RodW1ibmFpbF9jb250YWluZXJcIiBzdHlsZT17eyBtYXhIZWlnaHQsIG1heFdpZHRoLCBhc3BlY3RSYXRpbzogYCR7aW5mb1dpZHRofS8ke2luZm9IZWlnaHR9YCB9fT5cbiAgICAgICAgICAgICAgICA8U3dpdGNoVHJhbnNpdGlvbiBtb2RlPVwib3V0LWluXCI+XG4gICAgICAgICAgICAgICAgICAgIDxDU1NUcmFuc2l0aW9uXG4gICAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWVzPVwibXhfcnRnLS1mYWRlXCJcbiAgICAgICAgICAgICAgICAgICAgICAgIGtleT17YGltZy0ke3Nob3dQbGFjZWhvbGRlcn1gfVxuICAgICAgICAgICAgICAgICAgICAgICAgdGltZW91dD17MzAwfVxuICAgICAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgICAgICB7IHNob3dQbGFjZWhvbGRlciA/IDxkaXYgY2xhc3NOYW1lPXtjbGFzc2VzfT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IHBsYWNlaG9sZGVyIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PiA6IDw+PC8+IC8qIFRyYW5zaXRpb24gYWx3YXlzIGV4cGVjdHMgYSBjaGlsZCAqLyB9XG4gICAgICAgICAgICAgICAgICAgIDwvQ1NTVHJhbnNpdGlvbj5cbiAgICAgICAgICAgICAgICA8L1N3aXRjaFRyYW5zaXRpb24+XG5cbiAgICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXtzaXppbmd9PlxuICAgICAgICAgICAgICAgICAgICB7IGltZyB9XG4gICAgICAgICAgICAgICAgICAgIHsgZ2lmTGFiZWwgfVxuICAgICAgICAgICAgICAgICAgICB7IGJhbm5lciB9XG4gICAgICAgICAgICAgICAgPC9kaXY+XG5cbiAgICAgICAgICAgICAgICB7IC8qIEhBQ0s6IFRoaXMgZGl2IGZpbGxzIG91dCBzcGFjZSB3aGlsZSB0aGUgaW1hZ2UgbG9hZHMsIHRvIHByZXZlbnQgc2Nyb2xsIGp1bXBzICovIH1cbiAgICAgICAgICAgICAgICB7ICF0aGlzLnN0YXRlLmltZ0xvYWRlZCAmJiA8ZGl2IHN0eWxlPXt7IGhlaWdodDogbWF4SGVpZ2h0LCB3aWR0aDogbWF4V2lkdGggfX0gLz4gfVxuXG4gICAgICAgICAgICAgICAgeyB0aGlzLnN0YXRlLmhvdmVyICYmIHRoaXMuZ2V0VG9vbHRpcCgpIH1cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICApO1xuXG4gICAgICAgIHJldHVybiB0aGlzLndyYXBJbWFnZShjb250ZW50VXJsLCB0aHVtYm5haWwpO1xuICAgIH1cblxuICAgIC8vIE92ZXJyaWRkZW4gYnkgTVN0aWNrZXJCb2R5XG4gICAgcHJvdGVjdGVkIHdyYXBJbWFnZShjb250ZW50VXJsOiBzdHJpbmcsIGNoaWxkcmVuOiBKU1guRWxlbWVudCk6IEpTWC5FbGVtZW50IHtcbiAgICAgICAgcmV0dXJuIDxhIGhyZWY9e2NvbnRlbnRVcmx9IHRhcmdldD17dGhpcy5wcm9wcy5mb3JFeHBvcnQgPyBcIl9ibGFua1wiIDogdW5kZWZpbmVkfSBvbkNsaWNrPXt0aGlzLm9uQ2xpY2t9PlxuICAgICAgICAgICAgeyBjaGlsZHJlbiB9XG4gICAgICAgIDwvYT47XG4gICAgfVxuXG4gICAgLy8gT3ZlcnJpZGRlbiBieSBNU3RpY2tlckJvZHlcbiAgICBwcm90ZWN0ZWQgZ2V0UGxhY2Vob2xkZXIod2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXIpOiBKU1guRWxlbWVudCB7XG4gICAgICAgIGNvbnN0IGJsdXJoYXNoID0gdGhpcy5wcm9wcy5teEV2ZW50LmdldENvbnRlbnQoKS5pbmZvPy5bQkxVUkhBU0hfRklFTERdO1xuXG4gICAgICAgIGlmIChibHVyaGFzaCkge1xuICAgICAgICAgICAgaWYgKHRoaXMuc3RhdGUucGxhY2Vob2xkZXIgPT09IFBsYWNlaG9sZGVyLk5vSW1hZ2UpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy5zdGF0ZS5wbGFjZWhvbGRlciA9PT0gUGxhY2Vob2xkZXIuQmx1cmhhc2gpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gPEJsdXJoYXNoIGNsYXNzTmFtZT1cIm14X0JsdXJoYXNoXCIgaGFzaD17Ymx1cmhhc2h9IHdpZHRoPXt3aWR0aH0gaGVpZ2h0PXtoZWlnaHR9IC8+O1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiA8U3Bpbm5lciB3PXszMn0gaD17MzJ9IC8+O1xuICAgIH1cblxuICAgIC8vIE92ZXJyaWRkZW4gYnkgTVN0aWNrZXJCb2R5XG4gICAgcHJvdGVjdGVkIGdldFRvb2x0aXAoKTogSlNYLkVsZW1lbnQge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICAvLyBPdmVycmlkZGVuIGJ5IE1TdGlja2VyQm9keVxuICAgIHByb3RlY3RlZCBnZXRGaWxlQm9keSgpOiBzdHJpbmcgfCBKU1guRWxlbWVudCB7XG4gICAgICAgIGlmICh0aGlzLnByb3BzLmZvckV4cG9ydCkgcmV0dXJuIG51bGw7XG4gICAgICAgIC8qXG4gICAgICAgICAqIEluIHRoZSByb29tIHRpbWVsaW5lIG9yIHRoZSB0aHJlYWQgY29udGV4dCB3ZSBkb24ndCBuZWVkIHRoZSBkb3dubG9hZFxuICAgICAgICAgKiBsaW5rIGFzIHRoZSBtZXNzYWdlIGFjdGlvbiBiYXIgd2lsbCBmdWxmaWxsIHRoYXRcbiAgICAgICAgICovXG4gICAgICAgIGNvbnN0IGhhc01lc3NhZ2VBY3Rpb25CYXIgPSAoXG4gICAgICAgICAgICB0aGlzLmNvbnRleHQudGltZWxpbmVSZW5kZXJpbmdUeXBlID09PSBUaW1lbGluZVJlbmRlcmluZ1R5cGUuUm9vbSB8fFxuICAgICAgICAgICAgdGhpcy5jb250ZXh0LnRpbWVsaW5lUmVuZGVyaW5nVHlwZSA9PT0gVGltZWxpbmVSZW5kZXJpbmdUeXBlLlBpbm5lZCB8fFxuICAgICAgICAgICAgdGhpcy5jb250ZXh0LnRpbWVsaW5lUmVuZGVyaW5nVHlwZSA9PT0gVGltZWxpbmVSZW5kZXJpbmdUeXBlLlNlYXJjaCB8fFxuICAgICAgICAgICAgdGhpcy5jb250ZXh0LnRpbWVsaW5lUmVuZGVyaW5nVHlwZSA9PT0gVGltZWxpbmVSZW5kZXJpbmdUeXBlLlRocmVhZCB8fFxuICAgICAgICAgICAgdGhpcy5jb250ZXh0LnRpbWVsaW5lUmVuZGVyaW5nVHlwZSA9PT0gVGltZWxpbmVSZW5kZXJpbmdUeXBlLlRocmVhZHNMaXN0XG4gICAgICAgICk7XG4gICAgICAgIGlmICghaGFzTWVzc2FnZUFjdGlvbkJhcikge1xuICAgICAgICAgICAgcmV0dXJuIDxNRmlsZUJvZHkgey4uLnRoaXMucHJvcHN9IHNob3dHZW5lcmljUGxhY2Vob2xkZXI9e2ZhbHNlfSAvPjtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJlbmRlcigpIHtcbiAgICAgICAgY29uc3QgY29udGVudCA9IHRoaXMucHJvcHMubXhFdmVudC5nZXRDb250ZW50PElNZWRpYUV2ZW50Q29udGVudD4oKTtcblxuICAgICAgICBpZiAodGhpcy5zdGF0ZS5lcnJvcikge1xuICAgICAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgICAgICA8TWVkaWFQcm9jZXNzaW5nRXJyb3IgY2xhc3NOYW1lPVwibXhfTUltYWdlQm9keVwiPlxuICAgICAgICAgICAgICAgICAgICB7IF90KFwiRXJyb3IgZGVjcnlwdGluZyBpbWFnZVwiKSB9XG4gICAgICAgICAgICAgICAgPC9NZWRpYVByb2Nlc3NpbmdFcnJvcj5cbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBjb250ZW50VXJsID0gdGhpcy5zdGF0ZS5jb250ZW50VXJsO1xuICAgICAgICBsZXQgdGh1bWJVcmw6IHN0cmluZztcbiAgICAgICAgaWYgKHRoaXMucHJvcHMuZm9yRXhwb3J0IHx8ICh0aGlzLnN0YXRlLmlzQW5pbWF0ZWQgJiYgU2V0dGluZ3NTdG9yZS5nZXRWYWx1ZShcImF1dG9wbGF5R2lmc1wiKSkpIHtcbiAgICAgICAgICAgIHRodW1iVXJsID0gY29udGVudFVybDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRodW1iVXJsID0gdGhpcy5zdGF0ZS50aHVtYlVybCA/PyB0aGlzLnN0YXRlLmNvbnRlbnRVcmw7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCB0aHVtYm5haWwgPSB0aGlzLm1lc3NhZ2VDb250ZW50KGNvbnRlbnRVcmwsIHRodW1iVXJsLCBjb250ZW50KTtcbiAgICAgICAgY29uc3QgZmlsZUJvZHkgPSB0aGlzLmdldEZpbGVCb2R5KCk7XG5cbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfTUltYWdlQm9keVwiPlxuICAgICAgICAgICAgICAgIHsgdGh1bWJuYWlsIH1cbiAgICAgICAgICAgICAgICB7IGZpbGVCb2R5IH1cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICApO1xuICAgIH1cbn1cblxuaW50ZXJmYWNlIFBsYWNlaG9sZGVySVByb3BzIHtcbiAgICBob3Zlcj86IGJvb2xlYW47XG4gICAgbWF4V2lkdGg/OiBudW1iZXI7XG59XG5cbmV4cG9ydCBjbGFzcyBIaWRkZW5JbWFnZVBsYWNlaG9sZGVyIGV4dGVuZHMgUmVhY3QuUHVyZUNvbXBvbmVudDxQbGFjZWhvbGRlcklQcm9wcz4ge1xuICAgIHJlbmRlcigpIHtcbiAgICAgICAgY29uc3QgbWF4V2lkdGggPSB0aGlzLnByb3BzLm1heFdpZHRoID8gdGhpcy5wcm9wcy5tYXhXaWR0aCArIFwicHhcIiA6IG51bGw7XG4gICAgICAgIGxldCBjbGFzc05hbWUgPSAnbXhfSGlkZGVuSW1hZ2VQbGFjZWhvbGRlcic7XG4gICAgICAgIGlmICh0aGlzLnByb3BzLmhvdmVyKSBjbGFzc05hbWUgKz0gJyBteF9IaWRkZW5JbWFnZVBsYWNlaG9sZGVyX2hvdmVyJztcbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPXtjbGFzc05hbWV9IHN0eWxlPXt7IG1heFdpZHRoOiBgbWluKDEwMCUsICR7bWF4V2lkdGh9cHgpYCB9fT5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT0nbXhfSGlkZGVuSW1hZ2VQbGFjZWhvbGRlcl9idXR0b24nPlxuICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9J214X0hpZGRlbkltYWdlUGxhY2Vob2xkZXJfZXllJyAvPlxuICAgICAgICAgICAgICAgICAgICA8c3Bhbj57IF90KFwiU2hvdyBpbWFnZVwiKSB9PC9zcGFuPlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICk7XG4gICAgfVxufVxuIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7O0FBaUJBOztBQUNBOztBQUNBOztBQUNBOztB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