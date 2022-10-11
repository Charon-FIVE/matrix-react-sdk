"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireWildcard(require("react"));

var _htmlEntities = require("html-entities");

var _HtmlUtils = require("../../../HtmlUtils");

var _SettingsStore = _interopRequireDefault(require("../../../settings/SettingsStore"));

var _Modal = _interopRequireDefault(require("../../../Modal"));

var ImageUtils = _interopRequireWildcard(require("../../../ImageUtils"));

var _Media = require("../../../customisations/Media");

var _ImageView = _interopRequireDefault(require("../elements/ImageView"));

var _LinkWithTooltip = _interopRequireDefault(require("../elements/LinkWithTooltip"));

var _PlatformPeg = _interopRequireDefault(require("../../../PlatformPeg"));

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

/*
Copyright 2016 - 2021 The Matrix.org Foundation C.I.C.

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
class LinkPreviewWidget extends _react.default.Component {
  constructor() {
    super(...arguments);
    (0, _defineProperty2.default)(this, "description", /*#__PURE__*/(0, _react.createRef)());
    (0, _defineProperty2.default)(this, "image", /*#__PURE__*/(0, _react.createRef)());
    (0, _defineProperty2.default)(this, "onImageClick", ev => {
      const p = this.props.preview;
      if (ev.button != 0 || ev.metaKey) return;
      ev.preventDefault();
      let src = p["og:image"];

      if (src && src.startsWith("mxc://")) {
        src = (0, _Media.mediaFromMxc)(src).srcHttp;
      }

      const params = {
        src: src,
        width: p["og:image:width"],
        height: p["og:image:height"],
        name: p["og:title"] || p["og:description"] || this.props.link,
        fileSize: p["matrix:image:size"],
        link: this.props.link
      };

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
    });
  }

  componentDidMount() {
    if (this.description.current) {
      (0, _HtmlUtils.linkifyElement)(this.description.current);
    }
  }

  componentDidUpdate() {
    if (this.description.current) {
      (0, _HtmlUtils.linkifyElement)(this.description.current);
    }
  }

  render() {
    const p = this.props.preview;

    if (!p || Object.keys(p).length === 0) {
      return /*#__PURE__*/_react.default.createElement("div", null);
    } // FIXME: do we want to factor out all image displaying between this and MImageBody - especially for lightboxing?


    let image = p["og:image"];

    if (!_SettingsStore.default.getValue("showImages")) {
      image = null; // Don't render a button to show the image, just hide it outright
    }

    const imageMaxWidth = 100;
    const imageMaxHeight = 100;

    if (image && image.startsWith("mxc://")) {
      // We deliberately don't want a square here, so use the source HTTP thumbnail function
      image = (0, _Media.mediaFromMxc)(image).getThumbnailOfSourceHttp(imageMaxWidth, imageMaxHeight, 'scale');
    }

    let thumbHeight = imageMaxHeight;

    if (p["og:image:width"] && p["og:image:height"]) {
      thumbHeight = ImageUtils.thumbHeight(p["og:image:width"], p["og:image:height"], imageMaxWidth, imageMaxHeight);
    }

    let img;

    if (image) {
      img = /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_LinkPreviewWidget_image",
        style: {
          height: thumbHeight
        }
      }, /*#__PURE__*/_react.default.createElement("img", {
        ref: this.image,
        style: {
          maxWidth: imageMaxWidth,
          maxHeight: imageMaxHeight
        },
        src: image,
        onClick: this.onImageClick,
        alt: ""
      }));
    } // The description includes &-encoded HTML entities, we decode those as React treats the thing as an
    // opaque string. This does not allow any HTML to be injected into the DOM.


    const description = _htmlEntities.AllHtmlEntities.decode(p["og:description"] || "");

    const title = p["og:title"]?.trim() ?? "";

    const anchor = /*#__PURE__*/_react.default.createElement("a", {
      href: this.props.link,
      target: "_blank",
      rel: "noreferrer noopener"
    }, title);

    const needsTooltip = _PlatformPeg.default.get()?.needsUrlTooltips() && this.props.link !== title;
    return /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_LinkPreviewWidget"
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_LinkPreviewWidget_wrapImageCaption"
    }, img, /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_LinkPreviewWidget_caption"
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_LinkPreviewWidget_title"
    }, needsTooltip ? /*#__PURE__*/_react.default.createElement(_LinkWithTooltip.default, {
      tooltip: new URL(this.props.link, window.location.href).toString()
    }, anchor) : anchor, p["og:site_name"] && /*#__PURE__*/_react.default.createElement("span", {
      className: "mx_LinkPreviewWidget_siteName"
    }, " - " + p["og:site_name"])), /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_LinkPreviewWidget_description",
      ref: this.description
    }, description))), this.props.children);
  }

}

exports.default = LinkPreviewWidget;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJMaW5rUHJldmlld1dpZGdldCIsIlJlYWN0IiwiQ29tcG9uZW50IiwiY3JlYXRlUmVmIiwiZXYiLCJwIiwicHJvcHMiLCJwcmV2aWV3IiwiYnV0dG9uIiwibWV0YUtleSIsInByZXZlbnREZWZhdWx0Iiwic3JjIiwic3RhcnRzV2l0aCIsIm1lZGlhRnJvbU14YyIsInNyY0h0dHAiLCJwYXJhbXMiLCJ3aWR0aCIsImhlaWdodCIsIm5hbWUiLCJsaW5rIiwiZmlsZVNpemUiLCJpbWFnZSIsImN1cnJlbnQiLCJjbGllbnRSZWN0IiwiZ2V0Qm91bmRpbmdDbGllbnRSZWN0IiwidGh1bWJuYWlsSW5mbyIsInBvc2l0aW9uWCIsIngiLCJwb3NpdGlvblkiLCJ5IiwiTW9kYWwiLCJjcmVhdGVEaWFsb2ciLCJJbWFnZVZpZXciLCJjb21wb25lbnREaWRNb3VudCIsImRlc2NyaXB0aW9uIiwibGlua2lmeUVsZW1lbnQiLCJjb21wb25lbnREaWRVcGRhdGUiLCJyZW5kZXIiLCJPYmplY3QiLCJrZXlzIiwibGVuZ3RoIiwiU2V0dGluZ3NTdG9yZSIsImdldFZhbHVlIiwiaW1hZ2VNYXhXaWR0aCIsImltYWdlTWF4SGVpZ2h0IiwiZ2V0VGh1bWJuYWlsT2ZTb3VyY2VIdHRwIiwidGh1bWJIZWlnaHQiLCJJbWFnZVV0aWxzIiwiaW1nIiwibWF4V2lkdGgiLCJtYXhIZWlnaHQiLCJvbkltYWdlQ2xpY2siLCJBbGxIdG1sRW50aXRpZXMiLCJkZWNvZGUiLCJ0aXRsZSIsInRyaW0iLCJhbmNob3IiLCJuZWVkc1Rvb2x0aXAiLCJQbGF0Zm9ybVBlZyIsImdldCIsIm5lZWRzVXJsVG9vbHRpcHMiLCJVUkwiLCJ3aW5kb3ciLCJsb2NhdGlvbiIsImhyZWYiLCJ0b1N0cmluZyIsImNoaWxkcmVuIl0sInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL2NvbXBvbmVudHMvdmlld3Mvcm9vbXMvTGlua1ByZXZpZXdXaWRnZXQudHN4Il0sInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgMjAxNiAtIDIwMjEgVGhlIE1hdHJpeC5vcmcgRm91bmRhdGlvbiBDLkkuQy5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQgUmVhY3QsIHsgQ29tcG9uZW50UHJvcHMsIGNyZWF0ZVJlZiB9IGZyb20gJ3JlYWN0JztcbmltcG9ydCB7IEFsbEh0bWxFbnRpdGllcyB9IGZyb20gJ2h0bWwtZW50aXRpZXMnO1xuaW1wb3J0IHsgTWF0cml4RXZlbnQgfSBmcm9tICdtYXRyaXgtanMtc2RrL3NyYy9tb2RlbHMvZXZlbnQnO1xuaW1wb3J0IHsgSVByZXZpZXdVcmxSZXNwb25zZSB9IGZyb20gJ21hdHJpeC1qcy1zZGsvc3JjL2NsaWVudCc7XG5cbmltcG9ydCB7IGxpbmtpZnlFbGVtZW50IH0gZnJvbSAnLi4vLi4vLi4vSHRtbFV0aWxzJztcbmltcG9ydCBTZXR0aW5nc1N0b3JlIGZyb20gXCIuLi8uLi8uLi9zZXR0aW5ncy9TZXR0aW5nc1N0b3JlXCI7XG5pbXBvcnQgTW9kYWwgZnJvbSBcIi4uLy4uLy4uL01vZGFsXCI7XG5pbXBvcnQgKiBhcyBJbWFnZVV0aWxzIGZyb20gXCIuLi8uLi8uLi9JbWFnZVV0aWxzXCI7XG5pbXBvcnQgeyBtZWRpYUZyb21NeGMgfSBmcm9tIFwiLi4vLi4vLi4vY3VzdG9taXNhdGlvbnMvTWVkaWFcIjtcbmltcG9ydCBJbWFnZVZpZXcgZnJvbSAnLi4vZWxlbWVudHMvSW1hZ2VWaWV3JztcbmltcG9ydCBMaW5rV2l0aFRvb2x0aXAgZnJvbSAnLi4vZWxlbWVudHMvTGlua1dpdGhUb29sdGlwJztcbmltcG9ydCBQbGF0Zm9ybVBlZyBmcm9tICcuLi8uLi8uLi9QbGF0Zm9ybVBlZyc7XG5cbmludGVyZmFjZSBJUHJvcHMge1xuICAgIGxpbms6IHN0cmluZztcbiAgICBwcmV2aWV3OiBJUHJldmlld1VybFJlc3BvbnNlO1xuICAgIG14RXZlbnQ6IE1hdHJpeEV2ZW50OyAvLyB0aGUgRXZlbnQgYXNzb2NpYXRlZCB3aXRoIHRoZSBwcmV2aWV3XG59XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIExpbmtQcmV2aWV3V2lkZ2V0IGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50PElQcm9wcz4ge1xuICAgIHByaXZhdGUgcmVhZG9ubHkgZGVzY3JpcHRpb24gPSBjcmVhdGVSZWY8SFRNTERpdkVsZW1lbnQ+KCk7XG4gICAgcHJpdmF0ZSBpbWFnZSA9IGNyZWF0ZVJlZjxIVE1MSW1hZ2VFbGVtZW50PigpO1xuXG4gICAgY29tcG9uZW50RGlkTW91bnQoKSB7XG4gICAgICAgIGlmICh0aGlzLmRlc2NyaXB0aW9uLmN1cnJlbnQpIHtcbiAgICAgICAgICAgIGxpbmtpZnlFbGVtZW50KHRoaXMuZGVzY3JpcHRpb24uY3VycmVudCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBjb21wb25lbnREaWRVcGRhdGUoKSB7XG4gICAgICAgIGlmICh0aGlzLmRlc2NyaXB0aW9uLmN1cnJlbnQpIHtcbiAgICAgICAgICAgIGxpbmtpZnlFbGVtZW50KHRoaXMuZGVzY3JpcHRpb24uY3VycmVudCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIG9uSW1hZ2VDbGljayA9IGV2ID0+IHtcbiAgICAgICAgY29uc3QgcCA9IHRoaXMucHJvcHMucHJldmlldztcbiAgICAgICAgaWYgKGV2LmJ1dHRvbiAhPSAwIHx8IGV2Lm1ldGFLZXkpIHJldHVybjtcbiAgICAgICAgZXYucHJldmVudERlZmF1bHQoKTtcblxuICAgICAgICBsZXQgc3JjID0gcFtcIm9nOmltYWdlXCJdO1xuICAgICAgICBpZiAoc3JjICYmIHNyYy5zdGFydHNXaXRoKFwibXhjOi8vXCIpKSB7XG4gICAgICAgICAgICBzcmMgPSBtZWRpYUZyb21NeGMoc3JjKS5zcmNIdHRwO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgcGFyYW1zOiBPbWl0PENvbXBvbmVudFByb3BzPHR5cGVvZiBJbWFnZVZpZXc+LCBcIm9uRmluaXNoZWRcIj4gPSB7XG4gICAgICAgICAgICBzcmM6IHNyYyxcbiAgICAgICAgICAgIHdpZHRoOiBwW1wib2c6aW1hZ2U6d2lkdGhcIl0sXG4gICAgICAgICAgICBoZWlnaHQ6IHBbXCJvZzppbWFnZTpoZWlnaHRcIl0sXG4gICAgICAgICAgICBuYW1lOiBwW1wib2c6dGl0bGVcIl0gfHwgcFtcIm9nOmRlc2NyaXB0aW9uXCJdIHx8IHRoaXMucHJvcHMubGluayxcbiAgICAgICAgICAgIGZpbGVTaXplOiBwW1wibWF0cml4OmltYWdlOnNpemVcIl0sXG4gICAgICAgICAgICBsaW5rOiB0aGlzLnByb3BzLmxpbmssXG4gICAgICAgIH07XG5cbiAgICAgICAgaWYgKHRoaXMuaW1hZ2UuY3VycmVudCkge1xuICAgICAgICAgICAgY29uc3QgY2xpZW50UmVjdCA9IHRoaXMuaW1hZ2UuY3VycmVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcblxuICAgICAgICAgICAgcGFyYW1zLnRodW1ibmFpbEluZm8gPSB7XG4gICAgICAgICAgICAgICAgd2lkdGg6IGNsaWVudFJlY3Qud2lkdGgsXG4gICAgICAgICAgICAgICAgaGVpZ2h0OiBjbGllbnRSZWN0LmhlaWdodCxcbiAgICAgICAgICAgICAgICBwb3NpdGlvblg6IGNsaWVudFJlY3QueCxcbiAgICAgICAgICAgICAgICBwb3NpdGlvblk6IGNsaWVudFJlY3QueSxcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cblxuICAgICAgICBNb2RhbC5jcmVhdGVEaWFsb2coSW1hZ2VWaWV3LCBwYXJhbXMsIFwibXhfRGlhbG9nX2xpZ2h0Ym94XCIsIG51bGwsIHRydWUpO1xuICAgIH07XG5cbiAgICByZW5kZXIoKSB7XG4gICAgICAgIGNvbnN0IHAgPSB0aGlzLnByb3BzLnByZXZpZXc7XG4gICAgICAgIGlmICghcCB8fCBPYmplY3Qua2V5cyhwKS5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgIHJldHVybiA8ZGl2IC8+O1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gRklYTUU6IGRvIHdlIHdhbnQgdG8gZmFjdG9yIG91dCBhbGwgaW1hZ2UgZGlzcGxheWluZyBiZXR3ZWVuIHRoaXMgYW5kIE1JbWFnZUJvZHkgLSBlc3BlY2lhbGx5IGZvciBsaWdodGJveGluZz9cbiAgICAgICAgbGV0IGltYWdlID0gcFtcIm9nOmltYWdlXCJdO1xuICAgICAgICBpZiAoIVNldHRpbmdzU3RvcmUuZ2V0VmFsdWUoXCJzaG93SW1hZ2VzXCIpKSB7XG4gICAgICAgICAgICBpbWFnZSA9IG51bGw7IC8vIERvbid0IHJlbmRlciBhIGJ1dHRvbiB0byBzaG93IHRoZSBpbWFnZSwganVzdCBoaWRlIGl0IG91dHJpZ2h0XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgaW1hZ2VNYXhXaWR0aCA9IDEwMDtcbiAgICAgICAgY29uc3QgaW1hZ2VNYXhIZWlnaHQgPSAxMDA7XG4gICAgICAgIGlmIChpbWFnZSAmJiBpbWFnZS5zdGFydHNXaXRoKFwibXhjOi8vXCIpKSB7XG4gICAgICAgICAgICAvLyBXZSBkZWxpYmVyYXRlbHkgZG9uJ3Qgd2FudCBhIHNxdWFyZSBoZXJlLCBzbyB1c2UgdGhlIHNvdXJjZSBIVFRQIHRodW1ibmFpbCBmdW5jdGlvblxuICAgICAgICAgICAgaW1hZ2UgPSBtZWRpYUZyb21NeGMoaW1hZ2UpLmdldFRodW1ibmFpbE9mU291cmNlSHR0cChpbWFnZU1heFdpZHRoLCBpbWFnZU1heEhlaWdodCwgJ3NjYWxlJyk7XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgdGh1bWJIZWlnaHQgPSBpbWFnZU1heEhlaWdodDtcbiAgICAgICAgaWYgKHBbXCJvZzppbWFnZTp3aWR0aFwiXSAmJiBwW1wib2c6aW1hZ2U6aGVpZ2h0XCJdKSB7XG4gICAgICAgICAgICB0aHVtYkhlaWdodCA9IEltYWdlVXRpbHMudGh1bWJIZWlnaHQoXG4gICAgICAgICAgICAgICAgcFtcIm9nOmltYWdlOndpZHRoXCJdLCBwW1wib2c6aW1hZ2U6aGVpZ2h0XCJdLFxuICAgICAgICAgICAgICAgIGltYWdlTWF4V2lkdGgsIGltYWdlTWF4SGVpZ2h0LFxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBpbWc7XG4gICAgICAgIGlmIChpbWFnZSkge1xuICAgICAgICAgICAgaW1nID0gPGRpdiBjbGFzc05hbWU9XCJteF9MaW5rUHJldmlld1dpZGdldF9pbWFnZVwiIHN0eWxlPXt7IGhlaWdodDogdGh1bWJIZWlnaHQgfX0+XG4gICAgICAgICAgICAgICAgPGltZ1xuICAgICAgICAgICAgICAgICAgICByZWY9e3RoaXMuaW1hZ2V9XG4gICAgICAgICAgICAgICAgICAgIHN0eWxlPXt7IG1heFdpZHRoOiBpbWFnZU1heFdpZHRoLCBtYXhIZWlnaHQ6IGltYWdlTWF4SGVpZ2h0IH19XG4gICAgICAgICAgICAgICAgICAgIHNyYz17aW1hZ2V9XG4gICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9e3RoaXMub25JbWFnZUNsaWNrfVxuICAgICAgICAgICAgICAgICAgICBhbHQ9XCJcIlxuICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICA8L2Rpdj47XG4gICAgICAgIH1cblxuICAgICAgICAvLyBUaGUgZGVzY3JpcHRpb24gaW5jbHVkZXMgJi1lbmNvZGVkIEhUTUwgZW50aXRpZXMsIHdlIGRlY29kZSB0aG9zZSBhcyBSZWFjdCB0cmVhdHMgdGhlIHRoaW5nIGFzIGFuXG4gICAgICAgIC8vIG9wYXF1ZSBzdHJpbmcuIFRoaXMgZG9lcyBub3QgYWxsb3cgYW55IEhUTUwgdG8gYmUgaW5qZWN0ZWQgaW50byB0aGUgRE9NLlxuICAgICAgICBjb25zdCBkZXNjcmlwdGlvbiA9IEFsbEh0bWxFbnRpdGllcy5kZWNvZGUocFtcIm9nOmRlc2NyaXB0aW9uXCJdIHx8IFwiXCIpO1xuXG4gICAgICAgIGNvbnN0IHRpdGxlID0gcFtcIm9nOnRpdGxlXCJdPy50cmltKCkgPz8gXCJcIjtcbiAgICAgICAgY29uc3QgYW5jaG9yID0gPGEgaHJlZj17dGhpcy5wcm9wcy5saW5rfSB0YXJnZXQ9XCJfYmxhbmtcIiByZWw9XCJub3JlZmVycmVyIG5vb3BlbmVyXCI+eyB0aXRsZSB9PC9hPjtcbiAgICAgICAgY29uc3QgbmVlZHNUb29sdGlwID0gUGxhdGZvcm1QZWcuZ2V0KCk/Lm5lZWRzVXJsVG9vbHRpcHMoKSAmJiB0aGlzLnByb3BzLmxpbmsgIT09IHRpdGxlO1xuXG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X0xpbmtQcmV2aWV3V2lkZ2V0XCI+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9MaW5rUHJldmlld1dpZGdldF93cmFwSW1hZ2VDYXB0aW9uXCI+XG4gICAgICAgICAgICAgICAgICAgIHsgaW1nIH1cbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9MaW5rUHJldmlld1dpZGdldF9jYXB0aW9uXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X0xpbmtQcmV2aWV3V2lkZ2V0X3RpdGxlXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgeyBuZWVkc1Rvb2x0aXAgPyA8TGlua1dpdGhUb29sdGlwXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRvb2x0aXA9e25ldyBVUkwodGhpcy5wcm9wcy5saW5rLCB3aW5kb3cubG9jYXRpb24uaHJlZikudG9TdHJpbmcoKX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsgYW5jaG9yIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L0xpbmtXaXRoVG9vbHRpcD4gOiBhbmNob3IgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsgcFtcIm9nOnNpdGVfbmFtZVwiXSAmJiA8c3BhbiBjbGFzc05hbWU9XCJteF9MaW5rUHJldmlld1dpZGdldF9zaXRlTmFtZVwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IChcIiAtIFwiICsgcFtcIm9nOnNpdGVfbmFtZVwiXSkgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvc3Bhbj4gfVxuICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X0xpbmtQcmV2aWV3V2lkZ2V0X2Rlc2NyaXB0aW9uXCIgcmVmPXt0aGlzLmRlc2NyaXB0aW9ufT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IGRlc2NyaXB0aW9uIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICB7IHRoaXMucHJvcHMuY2hpbGRyZW4gfVxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICk7XG4gICAgfVxufVxu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