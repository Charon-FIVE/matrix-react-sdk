"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireDefault(require("react"));

var _blurhash = require("blurhash");

var _logger = require("matrix-js-sdk/src/logger");

var _languageHandler = require("../../../languageHandler");

var _SettingsStore = _interopRequireDefault(require("../../../settings/SettingsStore"));

var _InlineSpinner = _interopRequireDefault(require("../elements/InlineSpinner"));

var _Media = require("../../../customisations/Media");

var _imageMedia = require("../../../utils/image-media");

var _MFileBody = _interopRequireDefault(require("./MFileBody"));

var _ImageSize = require("../../../settings/enums/ImageSize");

var _RoomContext = _interopRequireWildcard(require("../../../contexts/RoomContext"));

var _MediaProcessingError = _interopRequireDefault(require("./shared/MediaProcessingError"));

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

/*
Copyright 2015 - 2021 The Matrix.org Foundation C.I.C.

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
class MVideoBody extends _react.default.PureComponent {
  constructor(props) {
    super(props);
    (0, _defineProperty2.default)(this, "context", void 0);
    (0, _defineProperty2.default)(this, "videoRef", /*#__PURE__*/_react.default.createRef());
    (0, _defineProperty2.default)(this, "sizeWatcher", void 0);
    (0, _defineProperty2.default)(this, "videoOnPlay", async () => {
      if (this.hasContentUrl() || this.state.fetchingData || this.state.error) {
        // We have the file, we are fetching the file, or there is an error.
        return;
      }

      this.setState({
        // To stop subsequent download attempts
        fetchingData: true
      });

      if (!this.props.mediaEventHelper.media.isEncrypted) {
        this.setState({
          error: "No file given in content"
        });
        return;
      }

      this.setState({
        decryptedUrl: await this.props.mediaEventHelper.sourceUrl.value,
        decryptedBlob: await this.props.mediaEventHelper.sourceBlob.value,
        fetchingData: false
      }, () => {
        if (!this.videoRef.current) return;
        this.videoRef.current.play();
      });
      this.props.onHeightChanged();
    });
    (0, _defineProperty2.default)(this, "getFileBody", () => {
      if (this.props.forExport) return null;
      return this.showFileBody && /*#__PURE__*/_react.default.createElement(_MFileBody.default, (0, _extends2.default)({}, this.props, {
        showGenericPlaceholder: false
      }));
    });
    this.state = {
      fetchingData: false,
      decryptedUrl: null,
      decryptedThumbnailUrl: null,
      decryptedBlob: null,
      error: null,
      posterLoading: false,
      blurhashUrl: null
    };
  }

  getContentUrl() {
    const content = this.props.mxEvent.getContent(); // During export, the content url will point to the MSC, which will later point to a local url

    if (this.props.forExport) return content.file?.url || content.url;
    const media = (0, _Media.mediaFromContent)(content);

    if (media.isEncrypted) {
      return this.state.decryptedUrl;
    } else {
      return media.srcHttp;
    }
  }

  hasContentUrl() {
    const url = this.getContentUrl();
    return url && !url.startsWith("data:");
  }

  getThumbUrl() {
    // there's no need of thumbnail when the content is local
    if (this.props.forExport) return null;
    const content = this.props.mxEvent.getContent();
    const media = (0, _Media.mediaFromContent)(content);

    if (media.isEncrypted && this.state.decryptedThumbnailUrl) {
      return this.state.decryptedThumbnailUrl;
    } else if (this.state.posterLoading) {
      return this.state.blurhashUrl;
    } else if (media.hasThumbnail) {
      return media.thumbnailHttp;
    } else {
      return null;
    }
  }

  loadBlurhash() {
    const info = this.props.mxEvent.getContent()?.info;
    if (!info[_imageMedia.BLURHASH_FIELD]) return;
    const canvas = document.createElement("canvas");
    const {
      w: width,
      h: height
    } = (0, _ImageSize.suggestedSize)(_SettingsStore.default.getValue("Images.size"), {
      w: info.w,
      h: info.h
    });
    canvas.width = width;
    canvas.height = height;
    const pixels = (0, _blurhash.decode)(info[_imageMedia.BLURHASH_FIELD], width, height);
    const ctx = canvas.getContext("2d");
    const imgData = ctx.createImageData(width, height);
    imgData.data.set(pixels);
    ctx.putImageData(imgData, 0, 0);
    this.setState({
      blurhashUrl: canvas.toDataURL(),
      posterLoading: true
    });
    const content = this.props.mxEvent.getContent();
    const media = (0, _Media.mediaFromContent)(content);

    if (media.hasThumbnail) {
      const image = new Image();

      image.onload = () => {
        this.setState({
          posterLoading: false
        });
      };

      image.src = media.thumbnailHttp;
    }
  }

  async componentDidMount() {
    this.sizeWatcher = _SettingsStore.default.watchSetting("Images.size", null, () => {
      this.forceUpdate(); // we don't really have a reliable thing to update, so just update the whole thing
    });

    try {
      this.loadBlurhash();
    } catch (e) {
      _logger.logger.error("Failed to load blurhash", e);
    }

    if (this.props.mediaEventHelper.media.isEncrypted && this.state.decryptedUrl === null) {
      try {
        const autoplay = _SettingsStore.default.getValue("autoplayVideo");

        const thumbnailUrl = await this.props.mediaEventHelper.thumbnailUrl.value;

        if (autoplay) {
          _logger.logger.log("Preloading video");

          this.setState({
            decryptedUrl: await this.props.mediaEventHelper.sourceUrl.value,
            decryptedThumbnailUrl: thumbnailUrl,
            decryptedBlob: await this.props.mediaEventHelper.sourceBlob.value
          });
          this.props.onHeightChanged();
        } else {
          _logger.logger.log("NOT preloading video");

          const content = this.props.mxEvent.getContent();
          let mimetype = content?.info?.mimetype; // clobber quicktime muxed files to be considered MP4 so browsers
          // are willing to play them

          if (mimetype == "video/quicktime") {
            mimetype = "video/mp4";
          }

          this.setState({
            // For Chrome and Electron, we need to set some non-empty `src` to
            // enable the play button. Firefox does not seem to care either
            // way, so it's fine to do for all browsers.
            decryptedUrl: `data:${mimetype},`,
            decryptedThumbnailUrl: thumbnailUrl || `data:${mimetype},`,
            decryptedBlob: null
          });
        }
      } catch (err) {
        _logger.logger.warn("Unable to decrypt attachment: ", err); // Set a placeholder image when we can't decrypt the image.


        this.setState({
          error: err
        });
      }
    }
  }

  componentWillUnmount() {
    _SettingsStore.default.unwatchSetting(this.sizeWatcher);
  }

  get showFileBody() {
    return this.context.timelineRenderingType !== _RoomContext.TimelineRenderingType.Room && this.context.timelineRenderingType !== _RoomContext.TimelineRenderingType.Pinned && this.context.timelineRenderingType !== _RoomContext.TimelineRenderingType.Search;
  }

  render() {
    const content = this.props.mxEvent.getContent();

    const autoplay = _SettingsStore.default.getValue("autoplayVideo");

    let aspectRatio;

    if (content.info?.w && content.info?.h) {
      aspectRatio = `${content.info.w}/${content.info.h}`;
    }

    const {
      w: maxWidth,
      h: maxHeight
    } = (0, _ImageSize.suggestedSize)(_SettingsStore.default.getValue("Images.size"), {
      w: content.info?.w,
      h: content.info?.h
    }); // HACK: This div fills out space while the video loads, to prevent scroll jumps

    const spaceFiller = /*#__PURE__*/_react.default.createElement("div", {
      style: {
        width: maxWidth,
        height: maxHeight
      }
    });

    if (this.state.error !== null) {
      return /*#__PURE__*/_react.default.createElement(_MediaProcessingError.default, {
        className: "mx_MVideoBody"
      }, (0, _languageHandler._t)("Error decrypting video"));
    } // Important: If we aren't autoplaying and we haven't decrypted it yet, show a video with a poster.


    if (!this.props.forExport && content.file !== undefined && this.state.decryptedUrl === null && autoplay) {
      // Need to decrypt the attachment
      // The attachment is decrypted in componentDidMount.
      // For now show a spinner.
      return /*#__PURE__*/_react.default.createElement("span", {
        className: "mx_MVideoBody"
      }, /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_MVideoBody_container",
        style: {
          maxWidth,
          maxHeight,
          aspectRatio
        }
      }, /*#__PURE__*/_react.default.createElement(_InlineSpinner.default, null)), spaceFiller);
    }

    const contentUrl = this.getContentUrl();
    const thumbUrl = this.getThumbUrl();
    let poster = null;
    let preload = "metadata";

    if (content.info && thumbUrl) {
      poster = thumbUrl;
      preload = "none";
    }

    const fileBody = this.getFileBody();
    return /*#__PURE__*/_react.default.createElement("span", {
      className: "mx_MVideoBody"
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_MVideoBody_container",
      style: {
        maxWidth,
        maxHeight,
        aspectRatio
      }
    }, /*#__PURE__*/_react.default.createElement("video", {
      className: "mx_MVideoBody",
      ref: this.videoRef,
      src: contentUrl,
      title: content.body,
      controls: true // Disable downloading as it doesn't work with e2ee video,
      // users should use the dedicated Download button in the Message Action Bar
      ,
      controlsList: "nodownload",
      preload: preload,
      muted: autoplay,
      autoPlay: autoplay,
      poster: poster,
      onPlay: this.videoOnPlay
    }), spaceFiller), fileBody);
  }

}

exports.default = MVideoBody;
(0, _defineProperty2.default)(MVideoBody, "contextType", _RoomContext.default);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJNVmlkZW9Cb2R5IiwiUmVhY3QiLCJQdXJlQ29tcG9uZW50IiwiY29uc3RydWN0b3IiLCJwcm9wcyIsImNyZWF0ZVJlZiIsImhhc0NvbnRlbnRVcmwiLCJzdGF0ZSIsImZldGNoaW5nRGF0YSIsImVycm9yIiwic2V0U3RhdGUiLCJtZWRpYUV2ZW50SGVscGVyIiwibWVkaWEiLCJpc0VuY3J5cHRlZCIsImRlY3J5cHRlZFVybCIsInNvdXJjZVVybCIsInZhbHVlIiwiZGVjcnlwdGVkQmxvYiIsInNvdXJjZUJsb2IiLCJ2aWRlb1JlZiIsImN1cnJlbnQiLCJwbGF5Iiwib25IZWlnaHRDaGFuZ2VkIiwiZm9yRXhwb3J0Iiwic2hvd0ZpbGVCb2R5IiwiZGVjcnlwdGVkVGh1bWJuYWlsVXJsIiwicG9zdGVyTG9hZGluZyIsImJsdXJoYXNoVXJsIiwiZ2V0Q29udGVudFVybCIsImNvbnRlbnQiLCJteEV2ZW50IiwiZ2V0Q29udGVudCIsImZpbGUiLCJ1cmwiLCJtZWRpYUZyb21Db250ZW50Iiwic3JjSHR0cCIsInN0YXJ0c1dpdGgiLCJnZXRUaHVtYlVybCIsImhhc1RodW1ibmFpbCIsInRodW1ibmFpbEh0dHAiLCJsb2FkQmx1cmhhc2giLCJpbmZvIiwiQkxVUkhBU0hfRklFTEQiLCJjYW52YXMiLCJkb2N1bWVudCIsImNyZWF0ZUVsZW1lbnQiLCJ3Iiwid2lkdGgiLCJoIiwiaGVpZ2h0Iiwic3VnZ2VzdGVkVmlkZW9TaXplIiwiU2V0dGluZ3NTdG9yZSIsImdldFZhbHVlIiwicGl4ZWxzIiwiZGVjb2RlIiwiY3R4IiwiZ2V0Q29udGV4dCIsImltZ0RhdGEiLCJjcmVhdGVJbWFnZURhdGEiLCJkYXRhIiwic2V0IiwicHV0SW1hZ2VEYXRhIiwidG9EYXRhVVJMIiwiaW1hZ2UiLCJJbWFnZSIsIm9ubG9hZCIsInNyYyIsImNvbXBvbmVudERpZE1vdW50Iiwic2l6ZVdhdGNoZXIiLCJ3YXRjaFNldHRpbmciLCJmb3JjZVVwZGF0ZSIsImUiLCJsb2dnZXIiLCJhdXRvcGxheSIsInRodW1ibmFpbFVybCIsImxvZyIsIm1pbWV0eXBlIiwiZXJyIiwid2FybiIsImNvbXBvbmVudFdpbGxVbm1vdW50IiwidW53YXRjaFNldHRpbmciLCJjb250ZXh0IiwidGltZWxpbmVSZW5kZXJpbmdUeXBlIiwiVGltZWxpbmVSZW5kZXJpbmdUeXBlIiwiUm9vbSIsIlBpbm5lZCIsIlNlYXJjaCIsInJlbmRlciIsImFzcGVjdFJhdGlvIiwibWF4V2lkdGgiLCJtYXhIZWlnaHQiLCJzcGFjZUZpbGxlciIsIl90IiwidW5kZWZpbmVkIiwiY29udGVudFVybCIsInRodW1iVXJsIiwicG9zdGVyIiwicHJlbG9hZCIsImZpbGVCb2R5IiwiZ2V0RmlsZUJvZHkiLCJib2R5IiwidmlkZW9PblBsYXkiLCJSb29tQ29udGV4dCJdLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL21lc3NhZ2VzL01WaWRlb0JvZHkudHN4Il0sInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgMjAxNSAtIDIwMjEgVGhlIE1hdHJpeC5vcmcgRm91bmRhdGlvbiBDLkkuQy5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnO1xuaW1wb3J0IHsgZGVjb2RlIH0gZnJvbSBcImJsdXJoYXNoXCI7XG5pbXBvcnQgeyBsb2dnZXIgfSBmcm9tIFwibWF0cml4LWpzLXNkay9zcmMvbG9nZ2VyXCI7XG5cbmltcG9ydCB7IF90IH0gZnJvbSAnLi4vLi4vLi4vbGFuZ3VhZ2VIYW5kbGVyJztcbmltcG9ydCBTZXR0aW5nc1N0b3JlIGZyb20gXCIuLi8uLi8uLi9zZXR0aW5ncy9TZXR0aW5nc1N0b3JlXCI7XG5pbXBvcnQgSW5saW5lU3Bpbm5lciBmcm9tICcuLi9lbGVtZW50cy9JbmxpbmVTcGlubmVyJztcbmltcG9ydCB7IG1lZGlhRnJvbUNvbnRlbnQgfSBmcm9tIFwiLi4vLi4vLi4vY3VzdG9taXNhdGlvbnMvTWVkaWFcIjtcbmltcG9ydCB7IEJMVVJIQVNIX0ZJRUxEIH0gZnJvbSBcIi4uLy4uLy4uL3V0aWxzL2ltYWdlLW1lZGlhXCI7XG5pbXBvcnQgeyBJTWVkaWFFdmVudENvbnRlbnQgfSBmcm9tIFwiLi4vLi4vLi4vY3VzdG9taXNhdGlvbnMvbW9kZWxzL0lNZWRpYUV2ZW50Q29udGVudFwiO1xuaW1wb3J0IHsgSUJvZHlQcm9wcyB9IGZyb20gXCIuL0lCb2R5UHJvcHNcIjtcbmltcG9ydCBNRmlsZUJvZHkgZnJvbSBcIi4vTUZpbGVCb2R5XCI7XG5pbXBvcnQgeyBJbWFnZVNpemUsIHN1Z2dlc3RlZFNpemUgYXMgc3VnZ2VzdGVkVmlkZW9TaXplIH0gZnJvbSBcIi4uLy4uLy4uL3NldHRpbmdzL2VudW1zL0ltYWdlU2l6ZVwiO1xuaW1wb3J0IFJvb21Db250ZXh0LCB7IFRpbWVsaW5lUmVuZGVyaW5nVHlwZSB9IGZyb20gXCIuLi8uLi8uLi9jb250ZXh0cy9Sb29tQ29udGV4dFwiO1xuaW1wb3J0IE1lZGlhUHJvY2Vzc2luZ0Vycm9yIGZyb20gJy4vc2hhcmVkL01lZGlhUHJvY2Vzc2luZ0Vycm9yJztcblxuaW50ZXJmYWNlIElTdGF0ZSB7XG4gICAgZGVjcnlwdGVkVXJsPzogc3RyaW5nO1xuICAgIGRlY3J5cHRlZFRodW1ibmFpbFVybD86IHN0cmluZztcbiAgICBkZWNyeXB0ZWRCbG9iPzogQmxvYjtcbiAgICBlcnJvcj86IGFueTtcbiAgICBmZXRjaGluZ0RhdGE6IGJvb2xlYW47XG4gICAgcG9zdGVyTG9hZGluZzogYm9vbGVhbjtcbiAgICBibHVyaGFzaFVybDogc3RyaW5nO1xufVxuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBNVmlkZW9Cb2R5IGV4dGVuZHMgUmVhY3QuUHVyZUNvbXBvbmVudDxJQm9keVByb3BzLCBJU3RhdGU+IHtcbiAgICBzdGF0aWMgY29udGV4dFR5cGUgPSBSb29tQ29udGV4dDtcbiAgICBwdWJsaWMgY29udGV4dCE6IFJlYWN0LkNvbnRleHRUeXBlPHR5cGVvZiBSb29tQ29udGV4dD47XG5cbiAgICBwcml2YXRlIHZpZGVvUmVmID0gUmVhY3QuY3JlYXRlUmVmPEhUTUxWaWRlb0VsZW1lbnQ+KCk7XG4gICAgcHJpdmF0ZSBzaXplV2F0Y2hlcjogc3RyaW5nO1xuXG4gICAgY29uc3RydWN0b3IocHJvcHMpIHtcbiAgICAgICAgc3VwZXIocHJvcHMpO1xuXG4gICAgICAgIHRoaXMuc3RhdGUgPSB7XG4gICAgICAgICAgICBmZXRjaGluZ0RhdGE6IGZhbHNlLFxuICAgICAgICAgICAgZGVjcnlwdGVkVXJsOiBudWxsLFxuICAgICAgICAgICAgZGVjcnlwdGVkVGh1bWJuYWlsVXJsOiBudWxsLFxuICAgICAgICAgICAgZGVjcnlwdGVkQmxvYjogbnVsbCxcbiAgICAgICAgICAgIGVycm9yOiBudWxsLFxuICAgICAgICAgICAgcG9zdGVyTG9hZGluZzogZmFsc2UsXG4gICAgICAgICAgICBibHVyaGFzaFVybDogbnVsbCxcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGdldENvbnRlbnRVcmwoKTogc3RyaW5nfG51bGwge1xuICAgICAgICBjb25zdCBjb250ZW50ID0gdGhpcy5wcm9wcy5teEV2ZW50LmdldENvbnRlbnQ8SU1lZGlhRXZlbnRDb250ZW50PigpO1xuICAgICAgICAvLyBEdXJpbmcgZXhwb3J0LCB0aGUgY29udGVudCB1cmwgd2lsbCBwb2ludCB0byB0aGUgTVNDLCB3aGljaCB3aWxsIGxhdGVyIHBvaW50IHRvIGEgbG9jYWwgdXJsXG4gICAgICAgIGlmICh0aGlzLnByb3BzLmZvckV4cG9ydCkgcmV0dXJuIGNvbnRlbnQuZmlsZT8udXJsIHx8IGNvbnRlbnQudXJsO1xuICAgICAgICBjb25zdCBtZWRpYSA9IG1lZGlhRnJvbUNvbnRlbnQoY29udGVudCk7XG4gICAgICAgIGlmIChtZWRpYS5pc0VuY3J5cHRlZCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuc3RhdGUuZGVjcnlwdGVkVXJsO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIG1lZGlhLnNyY0h0dHA7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIGhhc0NvbnRlbnRVcmwoKTogYm9vbGVhbiB7XG4gICAgICAgIGNvbnN0IHVybCA9IHRoaXMuZ2V0Q29udGVudFVybCgpO1xuICAgICAgICByZXR1cm4gdXJsICYmICF1cmwuc3RhcnRzV2l0aChcImRhdGE6XCIpO1xuICAgIH1cblxuICAgIHByaXZhdGUgZ2V0VGh1bWJVcmwoKTogc3RyaW5nfG51bGwge1xuICAgICAgICAvLyB0aGVyZSdzIG5vIG5lZWQgb2YgdGh1bWJuYWlsIHdoZW4gdGhlIGNvbnRlbnQgaXMgbG9jYWxcbiAgICAgICAgaWYgKHRoaXMucHJvcHMuZm9yRXhwb3J0KSByZXR1cm4gbnVsbDtcblxuICAgICAgICBjb25zdCBjb250ZW50ID0gdGhpcy5wcm9wcy5teEV2ZW50LmdldENvbnRlbnQ8SU1lZGlhRXZlbnRDb250ZW50PigpO1xuICAgICAgICBjb25zdCBtZWRpYSA9IG1lZGlhRnJvbUNvbnRlbnQoY29udGVudCk7XG5cbiAgICAgICAgaWYgKG1lZGlhLmlzRW5jcnlwdGVkICYmIHRoaXMuc3RhdGUuZGVjcnlwdGVkVGh1bWJuYWlsVXJsKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5zdGF0ZS5kZWNyeXB0ZWRUaHVtYm5haWxVcmw7XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5zdGF0ZS5wb3N0ZXJMb2FkaW5nKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5zdGF0ZS5ibHVyaGFzaFVybDtcbiAgICAgICAgfSBlbHNlIGlmIChtZWRpYS5oYXNUaHVtYm5haWwpIHtcbiAgICAgICAgICAgIHJldHVybiBtZWRpYS50aHVtYm5haWxIdHRwO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIGxvYWRCbHVyaGFzaCgpIHtcbiAgICAgICAgY29uc3QgaW5mbyA9IHRoaXMucHJvcHMubXhFdmVudC5nZXRDb250ZW50KCk/LmluZm87XG4gICAgICAgIGlmICghaW5mb1tCTFVSSEFTSF9GSUVMRF0pIHJldHVybjtcblxuICAgICAgICBjb25zdCBjYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiY2FudmFzXCIpO1xuXG4gICAgICAgIGNvbnN0IHsgdzogd2lkdGgsIGg6IGhlaWdodCB9ID0gc3VnZ2VzdGVkVmlkZW9TaXplKFxuICAgICAgICAgICAgU2V0dGluZ3NTdG9yZS5nZXRWYWx1ZShcIkltYWdlcy5zaXplXCIpIGFzIEltYWdlU2l6ZSxcbiAgICAgICAgICAgIHsgdzogaW5mby53LCBoOiBpbmZvLmggfSxcbiAgICAgICAgKTtcblxuICAgICAgICBjYW52YXMud2lkdGggPSB3aWR0aDtcbiAgICAgICAgY2FudmFzLmhlaWdodCA9IGhlaWdodDtcblxuICAgICAgICBjb25zdCBwaXhlbHMgPSBkZWNvZGUoaW5mb1tCTFVSSEFTSF9GSUVMRF0sIHdpZHRoLCBoZWlnaHQpO1xuICAgICAgICBjb25zdCBjdHggPSBjYW52YXMuZ2V0Q29udGV4dChcIjJkXCIpO1xuICAgICAgICBjb25zdCBpbWdEYXRhID0gY3R4LmNyZWF0ZUltYWdlRGF0YSh3aWR0aCwgaGVpZ2h0KTtcbiAgICAgICAgaW1nRGF0YS5kYXRhLnNldChwaXhlbHMpO1xuICAgICAgICBjdHgucHV0SW1hZ2VEYXRhKGltZ0RhdGEsIDAsIDApO1xuXG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgYmx1cmhhc2hVcmw6IGNhbnZhcy50b0RhdGFVUkwoKSxcbiAgICAgICAgICAgIHBvc3RlckxvYWRpbmc6IHRydWUsXG4gICAgICAgIH0pO1xuXG4gICAgICAgIGNvbnN0IGNvbnRlbnQgPSB0aGlzLnByb3BzLm14RXZlbnQuZ2V0Q29udGVudDxJTWVkaWFFdmVudENvbnRlbnQ+KCk7XG4gICAgICAgIGNvbnN0IG1lZGlhID0gbWVkaWFGcm9tQ29udGVudChjb250ZW50KTtcbiAgICAgICAgaWYgKG1lZGlhLmhhc1RodW1ibmFpbCkge1xuICAgICAgICAgICAgY29uc3QgaW1hZ2UgPSBuZXcgSW1hZ2UoKTtcbiAgICAgICAgICAgIGltYWdlLm9ubG9hZCA9ICgpID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLnNldFN0YXRlKHsgcG9zdGVyTG9hZGluZzogZmFsc2UgfSk7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgaW1hZ2Uuc3JjID0gbWVkaWEudGh1bWJuYWlsSHR0cDtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHB1YmxpYyBhc3luYyBjb21wb25lbnREaWRNb3VudCgpIHtcbiAgICAgICAgdGhpcy5zaXplV2F0Y2hlciA9IFNldHRpbmdzU3RvcmUud2F0Y2hTZXR0aW5nKFwiSW1hZ2VzLnNpemVcIiwgbnVsbCwgKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5mb3JjZVVwZGF0ZSgpOyAvLyB3ZSBkb24ndCByZWFsbHkgaGF2ZSBhIHJlbGlhYmxlIHRoaW5nIHRvIHVwZGF0ZSwgc28ganVzdCB1cGRhdGUgdGhlIHdob2xlIHRoaW5nXG4gICAgICAgIH0pO1xuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICB0aGlzLmxvYWRCbHVyaGFzaCgpO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICBsb2dnZXIuZXJyb3IoXCJGYWlsZWQgdG8gbG9hZCBibHVyaGFzaFwiLCBlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLnByb3BzLm1lZGlhRXZlbnRIZWxwZXIubWVkaWEuaXNFbmNyeXB0ZWQgJiYgdGhpcy5zdGF0ZS5kZWNyeXB0ZWRVcmwgPT09IG51bGwpIHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgY29uc3QgYXV0b3BsYXkgPSBTZXR0aW5nc1N0b3JlLmdldFZhbHVlKFwiYXV0b3BsYXlWaWRlb1wiKSBhcyBib29sZWFuO1xuICAgICAgICAgICAgICAgIGNvbnN0IHRodW1ibmFpbFVybCA9IGF3YWl0IHRoaXMucHJvcHMubWVkaWFFdmVudEhlbHBlci50aHVtYm5haWxVcmwudmFsdWU7XG4gICAgICAgICAgICAgICAgaWYgKGF1dG9wbGF5KSB7XG4gICAgICAgICAgICAgICAgICAgIGxvZ2dlci5sb2coXCJQcmVsb2FkaW5nIHZpZGVvXCIpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlY3J5cHRlZFVybDogYXdhaXQgdGhpcy5wcm9wcy5tZWRpYUV2ZW50SGVscGVyLnNvdXJjZVVybC52YWx1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlY3J5cHRlZFRodW1ibmFpbFVybDogdGh1bWJuYWlsVXJsLFxuICAgICAgICAgICAgICAgICAgICAgICAgZGVjcnlwdGVkQmxvYjogYXdhaXQgdGhpcy5wcm9wcy5tZWRpYUV2ZW50SGVscGVyLnNvdXJjZUJsb2IudmFsdWUsXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnByb3BzLm9uSGVpZ2h0Q2hhbmdlZCgpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGxvZ2dlci5sb2coXCJOT1QgcHJlbG9hZGluZyB2aWRlb1wiKTtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgY29udGVudCA9IHRoaXMucHJvcHMubXhFdmVudC5nZXRDb250ZW50PElNZWRpYUV2ZW50Q29udGVudD4oKTtcblxuICAgICAgICAgICAgICAgICAgICBsZXQgbWltZXR5cGUgPSBjb250ZW50Py5pbmZvPy5taW1ldHlwZTtcblxuICAgICAgICAgICAgICAgICAgICAvLyBjbG9iYmVyIHF1aWNrdGltZSBtdXhlZCBmaWxlcyB0byBiZSBjb25zaWRlcmVkIE1QNCBzbyBicm93c2Vyc1xuICAgICAgICAgICAgICAgICAgICAvLyBhcmUgd2lsbGluZyB0byBwbGF5IHRoZW1cbiAgICAgICAgICAgICAgICAgICAgaWYgKG1pbWV0eXBlID09IFwidmlkZW8vcXVpY2t0aW1lXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG1pbWV0eXBlID0gXCJ2aWRlby9tcDRcIjtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gRm9yIENocm9tZSBhbmQgRWxlY3Ryb24sIHdlIG5lZWQgdG8gc2V0IHNvbWUgbm9uLWVtcHR5IGBzcmNgIHRvXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBlbmFibGUgdGhlIHBsYXkgYnV0dG9uLiBGaXJlZm94IGRvZXMgbm90IHNlZW0gdG8gY2FyZSBlaXRoZXJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIHdheSwgc28gaXQncyBmaW5lIHRvIGRvIGZvciBhbGwgYnJvd3NlcnMuXG4gICAgICAgICAgICAgICAgICAgICAgICBkZWNyeXB0ZWRVcmw6IGBkYXRhOiR7bWltZXR5cGV9LGAsXG4gICAgICAgICAgICAgICAgICAgICAgICBkZWNyeXB0ZWRUaHVtYm5haWxVcmw6IHRodW1ibmFpbFVybCB8fCBgZGF0YToke21pbWV0eXBlfSxgLFxuICAgICAgICAgICAgICAgICAgICAgICAgZGVjcnlwdGVkQmxvYjogbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICAgICAgbG9nZ2VyLndhcm4oXCJVbmFibGUgdG8gZGVjcnlwdCBhdHRhY2htZW50OiBcIiwgZXJyKTtcbiAgICAgICAgICAgICAgICAvLyBTZXQgYSBwbGFjZWhvbGRlciBpbWFnZSB3aGVuIHdlIGNhbid0IGRlY3J5cHQgdGhlIGltYWdlLlxuICAgICAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgICAgICBlcnJvcjogZXJyLFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHVibGljIGNvbXBvbmVudFdpbGxVbm1vdW50KCkge1xuICAgICAgICBTZXR0aW5nc1N0b3JlLnVud2F0Y2hTZXR0aW5nKHRoaXMuc2l6ZVdhdGNoZXIpO1xuICAgIH1cblxuICAgIHByaXZhdGUgdmlkZW9PblBsYXkgPSBhc3luYyAoKSA9PiB7XG4gICAgICAgIGlmICh0aGlzLmhhc0NvbnRlbnRVcmwoKSB8fCB0aGlzLnN0YXRlLmZldGNoaW5nRGF0YSB8fCB0aGlzLnN0YXRlLmVycm9yKSB7XG4gICAgICAgICAgICAvLyBXZSBoYXZlIHRoZSBmaWxlLCB3ZSBhcmUgZmV0Y2hpbmcgdGhlIGZpbGUsIG9yIHRoZXJlIGlzIGFuIGVycm9yLlxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgLy8gVG8gc3RvcCBzdWJzZXF1ZW50IGRvd25sb2FkIGF0dGVtcHRzXG4gICAgICAgICAgICBmZXRjaGluZ0RhdGE6IHRydWUsXG4gICAgICAgIH0pO1xuICAgICAgICBpZiAoIXRoaXMucHJvcHMubWVkaWFFdmVudEhlbHBlci5tZWRpYS5pc0VuY3J5cHRlZCkge1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICAgICAgZXJyb3I6IFwiTm8gZmlsZSBnaXZlbiBpbiBjb250ZW50XCIsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIGRlY3J5cHRlZFVybDogYXdhaXQgdGhpcy5wcm9wcy5tZWRpYUV2ZW50SGVscGVyLnNvdXJjZVVybC52YWx1ZSxcbiAgICAgICAgICAgIGRlY3J5cHRlZEJsb2I6IGF3YWl0IHRoaXMucHJvcHMubWVkaWFFdmVudEhlbHBlci5zb3VyY2VCbG9iLnZhbHVlLFxuICAgICAgICAgICAgZmV0Y2hpbmdEYXRhOiBmYWxzZSxcbiAgICAgICAgfSwgKCkgPT4ge1xuICAgICAgICAgICAgaWYgKCF0aGlzLnZpZGVvUmVmLmN1cnJlbnQpIHJldHVybjtcbiAgICAgICAgICAgIHRoaXMudmlkZW9SZWYuY3VycmVudC5wbGF5KCk7XG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLnByb3BzLm9uSGVpZ2h0Q2hhbmdlZCgpO1xuICAgIH07XG5cbiAgICBwcm90ZWN0ZWQgZ2V0IHNob3dGaWxlQm9keSgpOiBib29sZWFuIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuY29udGV4dC50aW1lbGluZVJlbmRlcmluZ1R5cGUgIT09IFRpbWVsaW5lUmVuZGVyaW5nVHlwZS5Sb29tICYmXG4gICAgICAgICAgICB0aGlzLmNvbnRleHQudGltZWxpbmVSZW5kZXJpbmdUeXBlICE9PSBUaW1lbGluZVJlbmRlcmluZ1R5cGUuUGlubmVkICYmXG4gICAgICAgICAgICB0aGlzLmNvbnRleHQudGltZWxpbmVSZW5kZXJpbmdUeXBlICE9PSBUaW1lbGluZVJlbmRlcmluZ1R5cGUuU2VhcmNoO1xuICAgIH1cblxuICAgIHByaXZhdGUgZ2V0RmlsZUJvZHkgPSAoKSA9PiB7XG4gICAgICAgIGlmICh0aGlzLnByb3BzLmZvckV4cG9ydCkgcmV0dXJuIG51bGw7XG4gICAgICAgIHJldHVybiB0aGlzLnNob3dGaWxlQm9keSAmJiA8TUZpbGVCb2R5IHsuLi50aGlzLnByb3BzfSBzaG93R2VuZXJpY1BsYWNlaG9sZGVyPXtmYWxzZX0gLz47XG4gICAgfTtcblxuICAgIHJlbmRlcigpIHtcbiAgICAgICAgY29uc3QgY29udGVudCA9IHRoaXMucHJvcHMubXhFdmVudC5nZXRDb250ZW50KCk7XG4gICAgICAgIGNvbnN0IGF1dG9wbGF5ID0gU2V0dGluZ3NTdG9yZS5nZXRWYWx1ZShcImF1dG9wbGF5VmlkZW9cIik7XG5cbiAgICAgICAgbGV0IGFzcGVjdFJhdGlvO1xuICAgICAgICBpZiAoY29udGVudC5pbmZvPy53ICYmIGNvbnRlbnQuaW5mbz8uaCkge1xuICAgICAgICAgICAgYXNwZWN0UmF0aW8gPSBgJHtjb250ZW50LmluZm8ud30vJHtjb250ZW50LmluZm8uaH1gO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHsgdzogbWF4V2lkdGgsIGg6IG1heEhlaWdodCB9ID0gc3VnZ2VzdGVkVmlkZW9TaXplKFxuICAgICAgICAgICAgU2V0dGluZ3NTdG9yZS5nZXRWYWx1ZShcIkltYWdlcy5zaXplXCIpIGFzIEltYWdlU2l6ZSxcbiAgICAgICAgICAgIHsgdzogY29udGVudC5pbmZvPy53LCBoOiBjb250ZW50LmluZm8/LmggfSxcbiAgICAgICAgKTtcblxuICAgICAgICAvLyBIQUNLOiBUaGlzIGRpdiBmaWxscyBvdXQgc3BhY2Ugd2hpbGUgdGhlIHZpZGVvIGxvYWRzLCB0byBwcmV2ZW50IHNjcm9sbCBqdW1wc1xuICAgICAgICBjb25zdCBzcGFjZUZpbGxlciA9IDxkaXYgc3R5bGU9e3sgd2lkdGg6IG1heFdpZHRoLCBoZWlnaHQ6IG1heEhlaWdodCB9fSAvPjtcblxuICAgICAgICBpZiAodGhpcy5zdGF0ZS5lcnJvciAhPT0gbnVsbCkge1xuICAgICAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgICAgICA8TWVkaWFQcm9jZXNzaW5nRXJyb3IgY2xhc3NOYW1lPVwibXhfTVZpZGVvQm9keVwiPlxuICAgICAgICAgICAgICAgICAgICB7IF90KFwiRXJyb3IgZGVjcnlwdGluZyB2aWRlb1wiKSB9XG4gICAgICAgICAgICAgICAgPC9NZWRpYVByb2Nlc3NpbmdFcnJvcj5cbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBJbXBvcnRhbnQ6IElmIHdlIGFyZW4ndCBhdXRvcGxheWluZyBhbmQgd2UgaGF2ZW4ndCBkZWNyeXB0ZWQgaXQgeWV0LCBzaG93IGEgdmlkZW8gd2l0aCBhIHBvc3Rlci5cbiAgICAgICAgaWYgKCF0aGlzLnByb3BzLmZvckV4cG9ydCAmJiBjb250ZW50LmZpbGUgIT09IHVuZGVmaW5lZCAmJiB0aGlzLnN0YXRlLmRlY3J5cHRlZFVybCA9PT0gbnVsbCAmJiBhdXRvcGxheSkge1xuICAgICAgICAgICAgLy8gTmVlZCB0byBkZWNyeXB0IHRoZSBhdHRhY2htZW50XG4gICAgICAgICAgICAvLyBUaGUgYXR0YWNobWVudCBpcyBkZWNyeXB0ZWQgaW4gY29tcG9uZW50RGlkTW91bnQuXG4gICAgICAgICAgICAvLyBGb3Igbm93IHNob3cgYSBzcGlubmVyLlxuICAgICAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJteF9NVmlkZW9Cb2R5XCI+XG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfTVZpZGVvQm9keV9jb250YWluZXJcIiBzdHlsZT17eyBtYXhXaWR0aCwgbWF4SGVpZ2h0LCBhc3BlY3RSYXRpbyB9fT5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxJbmxpbmVTcGlubmVyIC8+XG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICB7IHNwYWNlRmlsbGVyIH1cbiAgICAgICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgICApO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgY29udGVudFVybCA9IHRoaXMuZ2V0Q29udGVudFVybCgpO1xuICAgICAgICBjb25zdCB0aHVtYlVybCA9IHRoaXMuZ2V0VGh1bWJVcmwoKTtcbiAgICAgICAgbGV0IHBvc3RlciA9IG51bGw7XG4gICAgICAgIGxldCBwcmVsb2FkID0gXCJtZXRhZGF0YVwiO1xuICAgICAgICBpZiAoY29udGVudC5pbmZvICYmIHRodW1iVXJsKSB7XG4gICAgICAgICAgICBwb3N0ZXIgPSB0aHVtYlVybDtcbiAgICAgICAgICAgIHByZWxvYWQgPSBcIm5vbmVcIjtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGZpbGVCb2R5ID0gdGhpcy5nZXRGaWxlQm9keSgpO1xuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwibXhfTVZpZGVvQm9keVwiPlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfTVZpZGVvQm9keV9jb250YWluZXJcIiBzdHlsZT17eyBtYXhXaWR0aCwgbWF4SGVpZ2h0LCBhc3BlY3RSYXRpbyB9fT5cbiAgICAgICAgICAgICAgICAgICAgPHZpZGVvXG4gICAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJteF9NVmlkZW9Cb2R5XCJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlZj17dGhpcy52aWRlb1JlZn1cbiAgICAgICAgICAgICAgICAgICAgICAgIHNyYz17Y29udGVudFVybH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHRpdGxlPXtjb250ZW50LmJvZHl9XG4gICAgICAgICAgICAgICAgICAgICAgICBjb250cm9sc1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gRGlzYWJsZSBkb3dubG9hZGluZyBhcyBpdCBkb2Vzbid0IHdvcmsgd2l0aCBlMmVlIHZpZGVvLFxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gdXNlcnMgc2hvdWxkIHVzZSB0aGUgZGVkaWNhdGVkIERvd25sb2FkIGJ1dHRvbiBpbiB0aGUgTWVzc2FnZSBBY3Rpb24gQmFyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb250cm9sc0xpc3Q9XCJub2Rvd25sb2FkXCJcbiAgICAgICAgICAgICAgICAgICAgICAgIHByZWxvYWQ9e3ByZWxvYWR9XG4gICAgICAgICAgICAgICAgICAgICAgICBtdXRlZD17YXV0b3BsYXl9XG4gICAgICAgICAgICAgICAgICAgICAgICBhdXRvUGxheT17YXV0b3BsYXl9XG4gICAgICAgICAgICAgICAgICAgICAgICBwb3N0ZXI9e3Bvc3Rlcn1cbiAgICAgICAgICAgICAgICAgICAgICAgIG9uUGxheT17dGhpcy52aWRlb09uUGxheX1cbiAgICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICAgICAgeyBzcGFjZUZpbGxlciB9XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgeyBmaWxlQm9keSB9XG4gICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICk7XG4gICAgfVxufVxuIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7O0FBZ0JBOztBQUNBOztBQUNBOztBQUVBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUdBOztBQUNBOztBQUNBOztBQUNBOzs7Ozs7QUE5QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBNEJlLE1BQU1BLFVBQU4sU0FBeUJDLGNBQUEsQ0FBTUMsYUFBL0IsQ0FBaUU7RUFPNUVDLFdBQVcsQ0FBQ0MsS0FBRCxFQUFRO0lBQ2YsTUFBTUEsS0FBTjtJQURlO0lBQUEsNkRBSEFILGNBQUEsQ0FBTUksU0FBTixF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