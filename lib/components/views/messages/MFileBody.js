"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DOWNLOAD_ICON_URL = void 0;
exports.computedStyle = computedStyle;
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireWildcard(require("react"));

var _filesize = _interopRequireDefault(require("filesize"));

var _logger = require("matrix-js-sdk/src/logger");

var _languageHandler = require("../../../languageHandler");

var _Modal = _interopRequireDefault(require("../../../Modal"));

var _AccessibleButton = _interopRequireDefault(require("../elements/AccessibleButton"));

var _Media = require("../../../customisations/Media");

var _ErrorDialog = _interopRequireDefault(require("../dialogs/ErrorDialog"));

var _FileUtils = require("../../../utils/FileUtils");

var _FileDownloader = require("../../../utils/FileDownloader");

var _TextWithTooltip = _interopRequireDefault(require("../elements/TextWithTooltip"));

var _RoomContext = _interopRequireWildcard(require("../../../contexts/RoomContext"));

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
let DOWNLOAD_ICON_URL; // cached copy of the download.svg asset for the sandboxed iframe later on

exports.DOWNLOAD_ICON_URL = DOWNLOAD_ICON_URL;

async function cacheDownloadIcon() {
  if (DOWNLOAD_ICON_URL) return; // cached already
  // eslint-disable-next-line @typescript-eslint/no-var-requires

  const svg = await fetch(require('../../../../res/img/download.svg').default).then(r => r.text());
  exports.DOWNLOAD_ICON_URL = DOWNLOAD_ICON_URL = "data:image/svg+xml;base64," + window.btoa(svg);
} // Cache the asset immediately
// noinspection JSIgnoredPromiseFromCall


cacheDownloadIcon(); // User supplied content can contain scripts, we have to be careful that
// we don't accidentally run those script within the same origin as the
// client. Otherwise those scripts written by remote users can read
// the access token and end-to-end keys that are in local storage.
//
// For attachments downloaded directly from the homeserver we can use
// Content-Security-Policy headers to disable script execution.
//
// But attachments with end-to-end encryption are more difficult to handle.
// We need to decrypt the attachment on the client and then display it.
// To display the attachment we need to turn the decrypted bytes into a URL.
//
// There are two ways to turn bytes into URLs, data URL and blob URLs.
// Data URLs aren't suitable for downloading a file because Chrome has a
// 2MB limit on the size of URLs that can be viewed in the browser or
// downloaded. This limit does not seem to apply when the url is used as
// the source attribute of an image tag.
//
// Blob URLs are generated using window.URL.createObjectURL and unfortunately
// for our purposes they inherit the origin of the page that created them.
// This means that any scripts that run when the URL is viewed will be able
// to access local storage.
//
// The easiest solution is to host the code that generates the blob URL on
// a different domain to the client.
// Another possibility is to generate the blob URL within a sandboxed iframe.
// The downside of using a second domain is that it complicates hosting,
// the downside of using a sandboxed iframe is that the browers are overly
// restrictive in what you are allowed to do with the generated URL.

/**
 * Get the current CSS style for a DOMElement.
 * @param {HTMLElement} element The element to get the current style of.
 * @return {string} The CSS style encoded as a string.
 */

function computedStyle(element) {
  if (!element) {
    return "";
  }

  const style = window.getComputedStyle(element, null);
  let cssText = style.cssText; // noinspection EqualityComparisonWithCoercionJS

  if (cssText == "") {
    // Firefox doesn't implement ".cssText" for computed styles.
    // https://bugzilla.mozilla.org/show_bug.cgi?id=137687
    for (let i = 0; i < style.length; i++) {
      cssText += style[i] + ":";
      cssText += style.getPropertyValue(style[i]) + ";";
    }
  }

  return cssText;
}

class MFileBody extends _react.default.Component {
  constructor(props) {
    super(props);
    (0, _defineProperty2.default)(this, "context", void 0);
    (0, _defineProperty2.default)(this, "iframe", /*#__PURE__*/(0, _react.createRef)());
    (0, _defineProperty2.default)(this, "dummyLink", /*#__PURE__*/(0, _react.createRef)());
    (0, _defineProperty2.default)(this, "userDidClick", false);
    (0, _defineProperty2.default)(this, "fileDownloader", new _FileDownloader.FileDownloader(() => this.iframe.current));
    (0, _defineProperty2.default)(this, "decryptFile", async () => {
      if (this.state.decryptedBlob) {
        return;
      }

      try {
        this.userDidClick = true;
        this.setState({
          decryptedBlob: await this.props.mediaEventHelper.sourceBlob.value
        });
      } catch (err) {
        _logger.logger.warn("Unable to decrypt attachment: ", err);

        _Modal.default.createDialog(_ErrorDialog.default, {
          title: (0, _languageHandler._t)("Error"),
          description: (0, _languageHandler._t)("Error decrypting attachment")
        });
      }
    });
    (0, _defineProperty2.default)(this, "onPlaceholderClick", async () => {
      const mediaHelper = this.props.mediaEventHelper;

      if (mediaHelper?.media.isEncrypted) {
        await this.decryptFile();
        this.downloadFile(this.fileName, this.linkText);
      } else {
        // As a button we're missing the `download` attribute for styling reasons, so
        // download with the file downloader.
        this.fileDownloader.download({
          blob: await mediaHelper.sourceBlob.value,
          name: this.fileName
        });
      }
    });
    this.state = {};
  }

  getContentUrl() {
    if (this.props.forExport) return null;
    const media = (0, _Media.mediaFromContent)(this.props.mxEvent.getContent());
    return media.srcHttp;
  }

  get content() {
    return this.props.mxEvent.getContent();
  }

  get fileName() {
    return this.content.body && this.content.body.length > 0 ? this.content.body : (0, _languageHandler._t)("Attachment");
  }

  get linkText() {
    return (0, _FileUtils.presentableTextForFile)(this.content);
  }

  downloadFile(fileName, text) {
    this.fileDownloader.download({
      blob: this.state.decryptedBlob,
      name: fileName,
      autoDownload: this.userDidClick,
      opts: {
        imgSrc: DOWNLOAD_ICON_URL,
        imgStyle: null,
        style: computedStyle(this.dummyLink.current),
        textContent: (0, _languageHandler._t)("Download %(text)s", {
          text
        })
      }
    });
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.props.onHeightChanged && !prevState.decryptedBlob && this.state.decryptedBlob) {
      this.props.onHeightChanged();
    }
  }

  render() {
    const isEncrypted = this.props.mediaEventHelper?.media.isEncrypted;
    const contentUrl = this.getContentUrl();
    const fileSize = this.content.info ? this.content.info.size : null;
    const fileType = this.content.info ? this.content.info.mimetype : "application/octet-stream";
    let placeholder = null;

    if (this.props.showGenericPlaceholder) {
      placeholder = /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
        className: "mx_MediaBody mx_MFileBody_info",
        onClick: this.onPlaceholderClick
      }, /*#__PURE__*/_react.default.createElement("span", {
        className: "mx_MFileBody_info_icon"
      }), /*#__PURE__*/_react.default.createElement(_TextWithTooltip.default, {
        tooltip: (0, _FileUtils.presentableTextForFile)(this.content, (0, _languageHandler._t)("Attachment"), true)
      }, /*#__PURE__*/_react.default.createElement("span", {
        className: "mx_MFileBody_info_filename"
      }, (0, _FileUtils.presentableTextForFile)(this.content, (0, _languageHandler._t)("Attachment"), true, true))));
    }

    if (this.props.forExport) {
      const content = this.props.mxEvent.getContent(); // During export, the content url will point to the MSC, which will later point to a local url

      return /*#__PURE__*/_react.default.createElement("span", {
        className: "mx_MFileBody"
      }, /*#__PURE__*/_react.default.createElement("a", {
        href: content.file?.url || content.url
      }, placeholder));
    }

    let showDownloadLink = !this.props.showGenericPlaceholder || this.context.timelineRenderingType !== _RoomContext.TimelineRenderingType.Room && this.context.timelineRenderingType !== _RoomContext.TimelineRenderingType.Search && this.context.timelineRenderingType !== _RoomContext.TimelineRenderingType.Pinned;

    if (this.context.timelineRenderingType === _RoomContext.TimelineRenderingType.Thread) {
      showDownloadLink = false;
    }

    if (isEncrypted) {
      if (!this.state.decryptedBlob) {
        // Need to decrypt the attachment
        // Wait for the user to click on the link before downloading
        // and decrypting the attachment.
        // This button should actually Download because usercontent/ will try to click itself
        // but it is not guaranteed between various browsers' settings.
        return /*#__PURE__*/_react.default.createElement("span", {
          className: "mx_MFileBody"
        }, placeholder, showDownloadLink && /*#__PURE__*/_react.default.createElement("div", {
          className: "mx_MFileBody_download"
        }, /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
          onClick: this.decryptFile
        }, (0, _languageHandler._t)("Decrypt %(text)s", {
          text: this.linkText
        }))));
      }

      const url = "usercontent/"; // XXX: this path should probably be passed from the skin
      // If the attachment is encrypted then put the link inside an iframe.

      return /*#__PURE__*/_react.default.createElement("span", {
        className: "mx_MFileBody"
      }, placeholder, showDownloadLink && /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_MFileBody_download"
      }, /*#__PURE__*/_react.default.createElement("div", {
        "aria-hidden": true,
        style: {
          display: "none"
        }
      }, /*#__PURE__*/_react.default.createElement("a", {
        ref: this.dummyLink
      })), /*#__PURE__*/_react.default.createElement("iframe", {
        "aria-hidden": true,
        title: (0, _FileUtils.presentableTextForFile)(this.content, (0, _languageHandler._t)("Attachment"), true, true),
        src: url,
        onLoad: () => this.downloadFile(this.fileName, this.linkText),
        ref: this.iframe,
        sandbox: "allow-scripts allow-downloads allow-downloads-without-user-activation"
      })));
    } else if (contentUrl) {
      const downloadProps = {
        target: "_blank",
        rel: "noreferrer noopener",
        // We set the href regardless of whether or not we intercept the download
        // because we don't really want to convert the file to a blob eagerly, and
        // still want "open in new tab" and "save link as" to work.
        href: contentUrl
      }; // Blobs can only have up to 500mb, so if the file reports as being too large then
      // we won't try and convert it. Likewise, if the file size is unknown then we'll assume
      // it is too big. There is the risk of the reported file size and the actual file size
      // being different, however the user shouldn't normally run into this problem.

      const fileTooBig = typeof fileSize === 'number' ? fileSize > 524288000 : true;

      if (["application/pdf"].includes(fileType) && !fileTooBig) {
        // We want to force a download on this type, so use an onClick handler.
        downloadProps["onClick"] = e => {
          _logger.logger.log(`Downloading ${fileType} as blob (unencrypted)`); // Avoid letting the <a> do its thing


          e.preventDefault();
          e.stopPropagation(); // Start a fetch for the download
          // Based upon https://stackoverflow.com/a/49500465

          this.props.mediaEventHelper.sourceBlob.value.then(blob => {
            const blobUrl = URL.createObjectURL(blob); // We have to create an anchor to download the file

            const tempAnchor = document.createElement('a');
            tempAnchor.download = this.fileName;
            tempAnchor.href = blobUrl;
            document.body.appendChild(tempAnchor); // for firefox: https://stackoverflow.com/a/32226068

            tempAnchor.click();
            tempAnchor.remove();
          });
        };
      } else {
        // Else we are hoping the browser will do the right thing
        downloadProps["download"] = this.fileName;
      }

      return /*#__PURE__*/_react.default.createElement("span", {
        className: "mx_MFileBody"
      }, placeholder, showDownloadLink && /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_MFileBody_download"
      }, /*#__PURE__*/_react.default.createElement("a", downloadProps, /*#__PURE__*/_react.default.createElement("span", {
        className: "mx_MFileBody_download_icon"
      }), (0, _languageHandler._t)("Download %(text)s", {
        text: this.linkText
      })), this.context.timelineRenderingType === _RoomContext.TimelineRenderingType.File && /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_MImageBody_size"
      }, this.content.info?.size ? (0, _filesize.default)(this.content.info.size) : "")));
    } else {
      const extra = this.linkText ? ': ' + this.linkText : '';
      return /*#__PURE__*/_react.default.createElement("span", {
        className: "mx_MFileBody"
      }, placeholder, (0, _languageHandler._t)("Invalid file%(extra)s", {
        extra: extra
      }));
    }
  }

}

exports.default = MFileBody;
(0, _defineProperty2.default)(MFileBody, "contextType", _RoomContext.default);
(0, _defineProperty2.default)(MFileBody, "defaultProps", {
  showGenericPlaceholder: true
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJET1dOTE9BRF9JQ09OX1VSTCIsImNhY2hlRG93bmxvYWRJY29uIiwic3ZnIiwiZmV0Y2giLCJyZXF1aXJlIiwiZGVmYXVsdCIsInRoZW4iLCJyIiwidGV4dCIsIndpbmRvdyIsImJ0b2EiLCJjb21wdXRlZFN0eWxlIiwiZWxlbWVudCIsInN0eWxlIiwiZ2V0Q29tcHV0ZWRTdHlsZSIsImNzc1RleHQiLCJpIiwibGVuZ3RoIiwiZ2V0UHJvcGVydHlWYWx1ZSIsIk1GaWxlQm9keSIsIlJlYWN0IiwiQ29tcG9uZW50IiwiY29uc3RydWN0b3IiLCJwcm9wcyIsImNyZWF0ZVJlZiIsIkZpbGVEb3dubG9hZGVyIiwiaWZyYW1lIiwiY3VycmVudCIsInN0YXRlIiwiZGVjcnlwdGVkQmxvYiIsInVzZXJEaWRDbGljayIsInNldFN0YXRlIiwibWVkaWFFdmVudEhlbHBlciIsInNvdXJjZUJsb2IiLCJ2YWx1ZSIsImVyciIsImxvZ2dlciIsIndhcm4iLCJNb2RhbCIsImNyZWF0ZURpYWxvZyIsIkVycm9yRGlhbG9nIiwidGl0bGUiLCJfdCIsImRlc2NyaXB0aW9uIiwibWVkaWFIZWxwZXIiLCJtZWRpYSIsImlzRW5jcnlwdGVkIiwiZGVjcnlwdEZpbGUiLCJkb3dubG9hZEZpbGUiLCJmaWxlTmFtZSIsImxpbmtUZXh0IiwiZmlsZURvd25sb2FkZXIiLCJkb3dubG9hZCIsImJsb2IiLCJuYW1lIiwiZ2V0Q29udGVudFVybCIsImZvckV4cG9ydCIsIm1lZGlhRnJvbUNvbnRlbnQiLCJteEV2ZW50IiwiZ2V0Q29udGVudCIsInNyY0h0dHAiLCJjb250ZW50IiwiYm9keSIsInByZXNlbnRhYmxlVGV4dEZvckZpbGUiLCJhdXRvRG93bmxvYWQiLCJvcHRzIiwiaW1nU3JjIiwiaW1nU3R5bGUiLCJkdW1teUxpbmsiLCJ0ZXh0Q29udGVudCIsImNvbXBvbmVudERpZFVwZGF0ZSIsInByZXZQcm9wcyIsInByZXZTdGF0ZSIsIm9uSGVpZ2h0Q2hhbmdlZCIsInJlbmRlciIsImNvbnRlbnRVcmwiLCJmaWxlU2l6ZSIsImluZm8iLCJzaXplIiwiZmlsZVR5cGUiLCJtaW1ldHlwZSIsInBsYWNlaG9sZGVyIiwic2hvd0dlbmVyaWNQbGFjZWhvbGRlciIsIm9uUGxhY2Vob2xkZXJDbGljayIsImZpbGUiLCJ1cmwiLCJzaG93RG93bmxvYWRMaW5rIiwiY29udGV4dCIsInRpbWVsaW5lUmVuZGVyaW5nVHlwZSIsIlRpbWVsaW5lUmVuZGVyaW5nVHlwZSIsIlJvb20iLCJTZWFyY2giLCJQaW5uZWQiLCJUaHJlYWQiLCJkaXNwbGF5IiwiZG93bmxvYWRQcm9wcyIsInRhcmdldCIsInJlbCIsImhyZWYiLCJmaWxlVG9vQmlnIiwiaW5jbHVkZXMiLCJlIiwibG9nIiwicHJldmVudERlZmF1bHQiLCJzdG9wUHJvcGFnYXRpb24iLCJibG9iVXJsIiwiVVJMIiwiY3JlYXRlT2JqZWN0VVJMIiwidGVtcEFuY2hvciIsImRvY3VtZW50IiwiY3JlYXRlRWxlbWVudCIsImFwcGVuZENoaWxkIiwiY2xpY2siLCJyZW1vdmUiLCJGaWxlIiwiZmlsZXNpemUiLCJleHRyYSIsIlJvb21Db250ZXh0Il0sInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL2NvbXBvbmVudHMvdmlld3MvbWVzc2FnZXMvTUZpbGVCb2R5LnRzeCJdLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMTUgLSAyMDIxIFRoZSBNYXRyaXgub3JnIEZvdW5kYXRpb24gQy5JLkMuXG5cbkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG55b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cblxuaW1wb3J0IFJlYWN0LCB7IGNyZWF0ZVJlZiB9IGZyb20gJ3JlYWN0JztcbmltcG9ydCBmaWxlc2l6ZSBmcm9tICdmaWxlc2l6ZSc7XG5pbXBvcnQgeyBsb2dnZXIgfSBmcm9tIFwibWF0cml4LWpzLXNkay9zcmMvbG9nZ2VyXCI7XG5cbmltcG9ydCB7IF90IH0gZnJvbSAnLi4vLi4vLi4vbGFuZ3VhZ2VIYW5kbGVyJztcbmltcG9ydCBNb2RhbCBmcm9tICcuLi8uLi8uLi9Nb2RhbCc7XG5pbXBvcnQgQWNjZXNzaWJsZUJ1dHRvbiBmcm9tIFwiLi4vZWxlbWVudHMvQWNjZXNzaWJsZUJ1dHRvblwiO1xuaW1wb3J0IHsgbWVkaWFGcm9tQ29udGVudCB9IGZyb20gXCIuLi8uLi8uLi9jdXN0b21pc2F0aW9ucy9NZWRpYVwiO1xuaW1wb3J0IEVycm9yRGlhbG9nIGZyb20gXCIuLi9kaWFsb2dzL0Vycm9yRGlhbG9nXCI7XG5pbXBvcnQgeyBwcmVzZW50YWJsZVRleHRGb3JGaWxlIH0gZnJvbSBcIi4uLy4uLy4uL3V0aWxzL0ZpbGVVdGlsc1wiO1xuaW1wb3J0IHsgSU1lZGlhRXZlbnRDb250ZW50IH0gZnJvbSBcIi4uLy4uLy4uL2N1c3RvbWlzYXRpb25zL21vZGVscy9JTWVkaWFFdmVudENvbnRlbnRcIjtcbmltcG9ydCB7IElCb2R5UHJvcHMgfSBmcm9tIFwiLi9JQm9keVByb3BzXCI7XG5pbXBvcnQgeyBGaWxlRG93bmxvYWRlciB9IGZyb20gXCIuLi8uLi8uLi91dGlscy9GaWxlRG93bmxvYWRlclwiO1xuaW1wb3J0IFRleHRXaXRoVG9vbHRpcCBmcm9tIFwiLi4vZWxlbWVudHMvVGV4dFdpdGhUb29sdGlwXCI7XG5pbXBvcnQgUm9vbUNvbnRleHQsIHsgVGltZWxpbmVSZW5kZXJpbmdUeXBlIH0gZnJvbSBcIi4uLy4uLy4uL2NvbnRleHRzL1Jvb21Db250ZXh0XCI7XG5cbmV4cG9ydCBsZXQgRE9XTkxPQURfSUNPTl9VUkw7IC8vIGNhY2hlZCBjb3B5IG9mIHRoZSBkb3dubG9hZC5zdmcgYXNzZXQgZm9yIHRoZSBzYW5kYm94ZWQgaWZyYW1lIGxhdGVyIG9uXG5cbmFzeW5jIGZ1bmN0aW9uIGNhY2hlRG93bmxvYWRJY29uKCkge1xuICAgIGlmIChET1dOTE9BRF9JQ09OX1VSTCkgcmV0dXJuOyAvLyBjYWNoZWQgYWxyZWFkeVxuICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tdmFyLXJlcXVpcmVzXG4gICAgY29uc3Qgc3ZnID0gYXdhaXQgZmV0Y2gocmVxdWlyZSgnLi4vLi4vLi4vLi4vcmVzL2ltZy9kb3dubG9hZC5zdmcnKS5kZWZhdWx0KS50aGVuKHIgPT4gci50ZXh0KCkpO1xuICAgIERPV05MT0FEX0lDT05fVVJMID0gXCJkYXRhOmltYWdlL3N2Zyt4bWw7YmFzZTY0LFwiICsgd2luZG93LmJ0b2Eoc3ZnKTtcbn1cblxuLy8gQ2FjaGUgdGhlIGFzc2V0IGltbWVkaWF0ZWx5XG4vLyBub2luc3BlY3Rpb24gSlNJZ25vcmVkUHJvbWlzZUZyb21DYWxsXG5jYWNoZURvd25sb2FkSWNvbigpO1xuXG4vLyBVc2VyIHN1cHBsaWVkIGNvbnRlbnQgY2FuIGNvbnRhaW4gc2NyaXB0cywgd2UgaGF2ZSB0byBiZSBjYXJlZnVsIHRoYXRcbi8vIHdlIGRvbid0IGFjY2lkZW50YWxseSBydW4gdGhvc2Ugc2NyaXB0IHdpdGhpbiB0aGUgc2FtZSBvcmlnaW4gYXMgdGhlXG4vLyBjbGllbnQuIE90aGVyd2lzZSB0aG9zZSBzY3JpcHRzIHdyaXR0ZW4gYnkgcmVtb3RlIHVzZXJzIGNhbiByZWFkXG4vLyB0aGUgYWNjZXNzIHRva2VuIGFuZCBlbmQtdG8tZW5kIGtleXMgdGhhdCBhcmUgaW4gbG9jYWwgc3RvcmFnZS5cbi8vXG4vLyBGb3IgYXR0YWNobWVudHMgZG93bmxvYWRlZCBkaXJlY3RseSBmcm9tIHRoZSBob21lc2VydmVyIHdlIGNhbiB1c2Vcbi8vIENvbnRlbnQtU2VjdXJpdHktUG9saWN5IGhlYWRlcnMgdG8gZGlzYWJsZSBzY3JpcHQgZXhlY3V0aW9uLlxuLy9cbi8vIEJ1dCBhdHRhY2htZW50cyB3aXRoIGVuZC10by1lbmQgZW5jcnlwdGlvbiBhcmUgbW9yZSBkaWZmaWN1bHQgdG8gaGFuZGxlLlxuLy8gV2UgbmVlZCB0byBkZWNyeXB0IHRoZSBhdHRhY2htZW50IG9uIHRoZSBjbGllbnQgYW5kIHRoZW4gZGlzcGxheSBpdC5cbi8vIFRvIGRpc3BsYXkgdGhlIGF0dGFjaG1lbnQgd2UgbmVlZCB0byB0dXJuIHRoZSBkZWNyeXB0ZWQgYnl0ZXMgaW50byBhIFVSTC5cbi8vXG4vLyBUaGVyZSBhcmUgdHdvIHdheXMgdG8gdHVybiBieXRlcyBpbnRvIFVSTHMsIGRhdGEgVVJMIGFuZCBibG9iIFVSTHMuXG4vLyBEYXRhIFVSTHMgYXJlbid0IHN1aXRhYmxlIGZvciBkb3dubG9hZGluZyBhIGZpbGUgYmVjYXVzZSBDaHJvbWUgaGFzIGFcbi8vIDJNQiBsaW1pdCBvbiB0aGUgc2l6ZSBvZiBVUkxzIHRoYXQgY2FuIGJlIHZpZXdlZCBpbiB0aGUgYnJvd3NlciBvclxuLy8gZG93bmxvYWRlZC4gVGhpcyBsaW1pdCBkb2VzIG5vdCBzZWVtIHRvIGFwcGx5IHdoZW4gdGhlIHVybCBpcyB1c2VkIGFzXG4vLyB0aGUgc291cmNlIGF0dHJpYnV0ZSBvZiBhbiBpbWFnZSB0YWcuXG4vL1xuLy8gQmxvYiBVUkxzIGFyZSBnZW5lcmF0ZWQgdXNpbmcgd2luZG93LlVSTC5jcmVhdGVPYmplY3RVUkwgYW5kIHVuZm9ydHVuYXRlbHlcbi8vIGZvciBvdXIgcHVycG9zZXMgdGhleSBpbmhlcml0IHRoZSBvcmlnaW4gb2YgdGhlIHBhZ2UgdGhhdCBjcmVhdGVkIHRoZW0uXG4vLyBUaGlzIG1lYW5zIHRoYXQgYW55IHNjcmlwdHMgdGhhdCBydW4gd2hlbiB0aGUgVVJMIGlzIHZpZXdlZCB3aWxsIGJlIGFibGVcbi8vIHRvIGFjY2VzcyBsb2NhbCBzdG9yYWdlLlxuLy9cbi8vIFRoZSBlYXNpZXN0IHNvbHV0aW9uIGlzIHRvIGhvc3QgdGhlIGNvZGUgdGhhdCBnZW5lcmF0ZXMgdGhlIGJsb2IgVVJMIG9uXG4vLyBhIGRpZmZlcmVudCBkb21haW4gdG8gdGhlIGNsaWVudC5cbi8vIEFub3RoZXIgcG9zc2liaWxpdHkgaXMgdG8gZ2VuZXJhdGUgdGhlIGJsb2IgVVJMIHdpdGhpbiBhIHNhbmRib3hlZCBpZnJhbWUuXG4vLyBUaGUgZG93bnNpZGUgb2YgdXNpbmcgYSBzZWNvbmQgZG9tYWluIGlzIHRoYXQgaXQgY29tcGxpY2F0ZXMgaG9zdGluZyxcbi8vIHRoZSBkb3duc2lkZSBvZiB1c2luZyBhIHNhbmRib3hlZCBpZnJhbWUgaXMgdGhhdCB0aGUgYnJvd2VycyBhcmUgb3Zlcmx5XG4vLyByZXN0cmljdGl2ZSBpbiB3aGF0IHlvdSBhcmUgYWxsb3dlZCB0byBkbyB3aXRoIHRoZSBnZW5lcmF0ZWQgVVJMLlxuXG4vKipcbiAqIEdldCB0aGUgY3VycmVudCBDU1Mgc3R5bGUgZm9yIGEgRE9NRWxlbWVudC5cbiAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsZW1lbnQgVGhlIGVsZW1lbnQgdG8gZ2V0IHRoZSBjdXJyZW50IHN0eWxlIG9mLlxuICogQHJldHVybiB7c3RyaW5nfSBUaGUgQ1NTIHN0eWxlIGVuY29kZWQgYXMgYSBzdHJpbmcuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjb21wdXRlZFN0eWxlKGVsZW1lbnQ6IEhUTUxFbGVtZW50KSB7XG4gICAgaWYgKCFlbGVtZW50KSB7XG4gICAgICAgIHJldHVybiBcIlwiO1xuICAgIH1cbiAgICBjb25zdCBzdHlsZSA9IHdpbmRvdy5nZXRDb21wdXRlZFN0eWxlKGVsZW1lbnQsIG51bGwpO1xuICAgIGxldCBjc3NUZXh0ID0gc3R5bGUuY3NzVGV4dDtcbiAgICAvLyBub2luc3BlY3Rpb24gRXF1YWxpdHlDb21wYXJpc29uV2l0aENvZXJjaW9uSlNcbiAgICBpZiAoY3NzVGV4dCA9PSBcIlwiKSB7XG4gICAgICAgIC8vIEZpcmVmb3ggZG9lc24ndCBpbXBsZW1lbnQgXCIuY3NzVGV4dFwiIGZvciBjb21wdXRlZCBzdHlsZXMuXG4gICAgICAgIC8vIGh0dHBzOi8vYnVnemlsbGEubW96aWxsYS5vcmcvc2hvd19idWcuY2dpP2lkPTEzNzY4N1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHN0eWxlLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBjc3NUZXh0ICs9IHN0eWxlW2ldICsgXCI6XCI7XG4gICAgICAgICAgICBjc3NUZXh0ICs9IHN0eWxlLmdldFByb3BlcnR5VmFsdWUoc3R5bGVbaV0pICsgXCI7XCI7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGNzc1RleHQ7XG59XG5cbmludGVyZmFjZSBJUHJvcHMgZXh0ZW5kcyBJQm9keVByb3BzIHtcbiAgICAvKiB3aGV0aGVyIG9yIG5vdCB0byBzaG93IHRoZSBkZWZhdWx0IHBsYWNlaG9sZGVyIGZvciB0aGUgZmlsZS4gRGVmYXVsdHMgdG8gdHJ1ZS4gKi9cbiAgICBzaG93R2VuZXJpY1BsYWNlaG9sZGVyOiBib29sZWFuO1xufVxuXG5pbnRlcmZhY2UgSVN0YXRlIHtcbiAgICBkZWNyeXB0ZWRCbG9iPzogQmxvYjtcbn1cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTUZpbGVCb2R5IGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50PElQcm9wcywgSVN0YXRlPiB7XG4gICAgc3RhdGljIGNvbnRleHRUeXBlID0gUm9vbUNvbnRleHQ7XG4gICAgcHVibGljIGNvbnRleHQhOiBSZWFjdC5Db250ZXh0VHlwZTx0eXBlb2YgUm9vbUNvbnRleHQ+O1xuXG4gICAgc3RhdGljIGRlZmF1bHRQcm9wcyA9IHtcbiAgICAgICAgc2hvd0dlbmVyaWNQbGFjZWhvbGRlcjogdHJ1ZSxcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBpZnJhbWU6IFJlYWN0LlJlZk9iamVjdDxIVE1MSUZyYW1lRWxlbWVudD4gPSBjcmVhdGVSZWYoKTtcbiAgICBwcml2YXRlIGR1bW15TGluazogUmVhY3QuUmVmT2JqZWN0PEhUTUxBbmNob3JFbGVtZW50PiA9IGNyZWF0ZVJlZigpO1xuICAgIHByaXZhdGUgdXNlckRpZENsaWNrID0gZmFsc2U7XG4gICAgcHJpdmF0ZSBmaWxlRG93bmxvYWRlcjogRmlsZURvd25sb2FkZXIgPSBuZXcgRmlsZURvd25sb2FkZXIoKCkgPT4gdGhpcy5pZnJhbWUuY3VycmVudCk7XG5cbiAgICBwdWJsaWMgY29uc3RydWN0b3IocHJvcHM6IElQcm9wcykge1xuICAgICAgICBzdXBlcihwcm9wcyk7XG5cbiAgICAgICAgdGhpcy5zdGF0ZSA9IHt9O1xuICAgIH1cblxuICAgIHByaXZhdGUgZ2V0Q29udGVudFVybCgpOiBzdHJpbmcgfCBudWxsIHtcbiAgICAgICAgaWYgKHRoaXMucHJvcHMuZm9yRXhwb3J0KSByZXR1cm4gbnVsbDtcbiAgICAgICAgY29uc3QgbWVkaWEgPSBtZWRpYUZyb21Db250ZW50KHRoaXMucHJvcHMubXhFdmVudC5nZXRDb250ZW50KCkpO1xuICAgICAgICByZXR1cm4gbWVkaWEuc3JjSHR0cDtcbiAgICB9XG4gICAgcHJpdmF0ZSBnZXQgY29udGVudCgpOiBJTWVkaWFFdmVudENvbnRlbnQge1xuICAgICAgICByZXR1cm4gdGhpcy5wcm9wcy5teEV2ZW50LmdldENvbnRlbnQ8SU1lZGlhRXZlbnRDb250ZW50PigpO1xuICAgIH1cblxuICAgIHByaXZhdGUgZ2V0IGZpbGVOYW1lKCk6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiB0aGlzLmNvbnRlbnQuYm9keSAmJiB0aGlzLmNvbnRlbnQuYm9keS5sZW5ndGggPiAwID8gdGhpcy5jb250ZW50LmJvZHkgOiBfdChcIkF0dGFjaG1lbnRcIik7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBnZXQgbGlua1RleHQoKTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIHByZXNlbnRhYmxlVGV4dEZvckZpbGUodGhpcy5jb250ZW50KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGRvd25sb2FkRmlsZShmaWxlTmFtZTogc3RyaW5nLCB0ZXh0OiBzdHJpbmcpIHtcbiAgICAgICAgdGhpcy5maWxlRG93bmxvYWRlci5kb3dubG9hZCh7XG4gICAgICAgICAgICBibG9iOiB0aGlzLnN0YXRlLmRlY3J5cHRlZEJsb2IsXG4gICAgICAgICAgICBuYW1lOiBmaWxlTmFtZSxcbiAgICAgICAgICAgIGF1dG9Eb3dubG9hZDogdGhpcy51c2VyRGlkQ2xpY2ssXG4gICAgICAgICAgICBvcHRzOiB7XG4gICAgICAgICAgICAgICAgaW1nU3JjOiBET1dOTE9BRF9JQ09OX1VSTCxcbiAgICAgICAgICAgICAgICBpbWdTdHlsZTogbnVsbCxcbiAgICAgICAgICAgICAgICBzdHlsZTogY29tcHV0ZWRTdHlsZSh0aGlzLmR1bW15TGluay5jdXJyZW50KSxcbiAgICAgICAgICAgICAgICB0ZXh0Q29udGVudDogX3QoXCJEb3dubG9hZCAlKHRleHQpc1wiLCB7IHRleHQgfSksXG4gICAgICAgICAgICB9LFxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwdWJsaWMgY29tcG9uZW50RGlkVXBkYXRlKHByZXZQcm9wcywgcHJldlN0YXRlKSB7XG4gICAgICAgIGlmICh0aGlzLnByb3BzLm9uSGVpZ2h0Q2hhbmdlZCAmJiAhcHJldlN0YXRlLmRlY3J5cHRlZEJsb2IgJiYgdGhpcy5zdGF0ZS5kZWNyeXB0ZWRCbG9iKSB7XG4gICAgICAgICAgICB0aGlzLnByb3BzLm9uSGVpZ2h0Q2hhbmdlZCgpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBkZWNyeXB0RmlsZSA9IGFzeW5jICgpOiBQcm9taXNlPHZvaWQ+ID0+IHtcbiAgICAgICAgaWYgKHRoaXMuc3RhdGUuZGVjcnlwdGVkQmxvYikge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICB0aGlzLnVzZXJEaWRDbGljayA9IHRydWU7XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgICAgICBkZWNyeXB0ZWRCbG9iOiBhd2FpdCB0aGlzLnByb3BzLm1lZGlhRXZlbnRIZWxwZXIuc291cmNlQmxvYi52YWx1ZSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgIGxvZ2dlci53YXJuKFwiVW5hYmxlIHRvIGRlY3J5cHQgYXR0YWNobWVudDogXCIsIGVycik7XG4gICAgICAgICAgICBNb2RhbC5jcmVhdGVEaWFsb2coRXJyb3JEaWFsb2csIHtcbiAgICAgICAgICAgICAgICB0aXRsZTogX3QoXCJFcnJvclwiKSxcbiAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogX3QoXCJFcnJvciBkZWNyeXB0aW5nIGF0dGFjaG1lbnRcIiksXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBwcml2YXRlIG9uUGxhY2Vob2xkZXJDbGljayA9IGFzeW5jICgpID0+IHtcbiAgICAgICAgY29uc3QgbWVkaWFIZWxwZXIgPSB0aGlzLnByb3BzLm1lZGlhRXZlbnRIZWxwZXI7XG4gICAgICAgIGlmIChtZWRpYUhlbHBlcj8ubWVkaWEuaXNFbmNyeXB0ZWQpIHtcbiAgICAgICAgICAgIGF3YWl0IHRoaXMuZGVjcnlwdEZpbGUoKTtcbiAgICAgICAgICAgIHRoaXMuZG93bmxvYWRGaWxlKHRoaXMuZmlsZU5hbWUsIHRoaXMubGlua1RleHQpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gQXMgYSBidXR0b24gd2UncmUgbWlzc2luZyB0aGUgYGRvd25sb2FkYCBhdHRyaWJ1dGUgZm9yIHN0eWxpbmcgcmVhc29ucywgc29cbiAgICAgICAgICAgIC8vIGRvd25sb2FkIHdpdGggdGhlIGZpbGUgZG93bmxvYWRlci5cbiAgICAgICAgICAgIHRoaXMuZmlsZURvd25sb2FkZXIuZG93bmxvYWQoe1xuICAgICAgICAgICAgICAgIGJsb2I6IGF3YWl0IG1lZGlhSGVscGVyLnNvdXJjZUJsb2IudmFsdWUsXG4gICAgICAgICAgICAgICAgbmFtZTogdGhpcy5maWxlTmFtZSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHB1YmxpYyByZW5kZXIoKSB7XG4gICAgICAgIGNvbnN0IGlzRW5jcnlwdGVkID0gdGhpcy5wcm9wcy5tZWRpYUV2ZW50SGVscGVyPy5tZWRpYS5pc0VuY3J5cHRlZDtcbiAgICAgICAgY29uc3QgY29udGVudFVybCA9IHRoaXMuZ2V0Q29udGVudFVybCgpO1xuICAgICAgICBjb25zdCBmaWxlU2l6ZSA9IHRoaXMuY29udGVudC5pbmZvID8gdGhpcy5jb250ZW50LmluZm8uc2l6ZSA6IG51bGw7XG4gICAgICAgIGNvbnN0IGZpbGVUeXBlID0gdGhpcy5jb250ZW50LmluZm8gPyB0aGlzLmNvbnRlbnQuaW5mby5taW1ldHlwZSA6IFwiYXBwbGljYXRpb24vb2N0ZXQtc3RyZWFtXCI7XG5cbiAgICAgICAgbGV0IHBsYWNlaG9sZGVyOiBSZWFjdC5SZWFjdE5vZGUgPSBudWxsO1xuICAgICAgICBpZiAodGhpcy5wcm9wcy5zaG93R2VuZXJpY1BsYWNlaG9sZGVyKSB7XG4gICAgICAgICAgICBwbGFjZWhvbGRlciA9IChcbiAgICAgICAgICAgICAgICA8QWNjZXNzaWJsZUJ1dHRvbiBjbGFzc05hbWU9XCJteF9NZWRpYUJvZHkgbXhfTUZpbGVCb2R5X2luZm9cIiBvbkNsaWNrPXt0aGlzLm9uUGxhY2Vob2xkZXJDbGlja30+XG4gICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIm14X01GaWxlQm9keV9pbmZvX2ljb25cIiAvPlxuICAgICAgICAgICAgICAgICAgICA8VGV4dFdpdGhUb29sdGlwIHRvb2x0aXA9e3ByZXNlbnRhYmxlVGV4dEZvckZpbGUodGhpcy5jb250ZW50LCBfdChcIkF0dGFjaG1lbnRcIiksIHRydWUpfT5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIm14X01GaWxlQm9keV9pbmZvX2ZpbGVuYW1lXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgeyBwcmVzZW50YWJsZVRleHRGb3JGaWxlKHRoaXMuY29udGVudCwgX3QoXCJBdHRhY2htZW50XCIpLCB0cnVlLCB0cnVlKSB9XG4gICAgICAgICAgICAgICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgIDwvVGV4dFdpdGhUb29sdGlwPlxuICAgICAgICAgICAgICAgIDwvQWNjZXNzaWJsZUJ1dHRvbj5cbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5wcm9wcy5mb3JFeHBvcnQpIHtcbiAgICAgICAgICAgIGNvbnN0IGNvbnRlbnQgPSB0aGlzLnByb3BzLm14RXZlbnQuZ2V0Q29udGVudCgpO1xuICAgICAgICAgICAgLy8gRHVyaW5nIGV4cG9ydCwgdGhlIGNvbnRlbnQgdXJsIHdpbGwgcG9pbnQgdG8gdGhlIE1TQywgd2hpY2ggd2lsbCBsYXRlciBwb2ludCB0byBhIGxvY2FsIHVybFxuICAgICAgICAgICAgcmV0dXJuIDxzcGFuIGNsYXNzTmFtZT1cIm14X01GaWxlQm9keVwiPlxuICAgICAgICAgICAgICAgIDxhIGhyZWY9e2NvbnRlbnQuZmlsZT8udXJsIHx8IGNvbnRlbnQudXJsfT5cbiAgICAgICAgICAgICAgICAgICAgeyBwbGFjZWhvbGRlciB9XG4gICAgICAgICAgICAgICAgPC9hPlxuICAgICAgICAgICAgPC9zcGFuPjtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBzaG93RG93bmxvYWRMaW5rID0gIXRoaXMucHJvcHMuc2hvd0dlbmVyaWNQbGFjZWhvbGRlciB8fCAoXG4gICAgICAgICAgICB0aGlzLmNvbnRleHQudGltZWxpbmVSZW5kZXJpbmdUeXBlICE9PSBUaW1lbGluZVJlbmRlcmluZ1R5cGUuUm9vbSAmJlxuICAgICAgICAgICAgdGhpcy5jb250ZXh0LnRpbWVsaW5lUmVuZGVyaW5nVHlwZSAhPT0gVGltZWxpbmVSZW5kZXJpbmdUeXBlLlNlYXJjaCAmJlxuICAgICAgICAgICAgdGhpcy5jb250ZXh0LnRpbWVsaW5lUmVuZGVyaW5nVHlwZSAhPT0gVGltZWxpbmVSZW5kZXJpbmdUeXBlLlBpbm5lZFxuICAgICAgICApO1xuXG4gICAgICAgIGlmICh0aGlzLmNvbnRleHQudGltZWxpbmVSZW5kZXJpbmdUeXBlID09PSBUaW1lbGluZVJlbmRlcmluZ1R5cGUuVGhyZWFkKSB7XG4gICAgICAgICAgICBzaG93RG93bmxvYWRMaW5rID0gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoaXNFbmNyeXB0ZWQpIHtcbiAgICAgICAgICAgIGlmICghdGhpcy5zdGF0ZS5kZWNyeXB0ZWRCbG9iKSB7XG4gICAgICAgICAgICAgICAgLy8gTmVlZCB0byBkZWNyeXB0IHRoZSBhdHRhY2htZW50XG4gICAgICAgICAgICAgICAgLy8gV2FpdCBmb3IgdGhlIHVzZXIgdG8gY2xpY2sgb24gdGhlIGxpbmsgYmVmb3JlIGRvd25sb2FkaW5nXG4gICAgICAgICAgICAgICAgLy8gYW5kIGRlY3J5cHRpbmcgdGhlIGF0dGFjaG1lbnQuXG5cbiAgICAgICAgICAgICAgICAvLyBUaGlzIGJ1dHRvbiBzaG91bGQgYWN0dWFsbHkgRG93bmxvYWQgYmVjYXVzZSB1c2VyY29udGVudC8gd2lsbCB0cnkgdG8gY2xpY2sgaXRzZWxmXG4gICAgICAgICAgICAgICAgLy8gYnV0IGl0IGlzIG5vdCBndWFyYW50ZWVkIGJldHdlZW4gdmFyaW91cyBicm93c2Vycycgc2V0dGluZ3MuXG4gICAgICAgICAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwibXhfTUZpbGVCb2R5XCI+XG4gICAgICAgICAgICAgICAgICAgICAgICB7IHBsYWNlaG9sZGVyIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHsgc2hvd0Rvd25sb2FkTGluayAmJiA8ZGl2IGNsYXNzTmFtZT1cIm14X01GaWxlQm9keV9kb3dubG9hZFwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxBY2Nlc3NpYmxlQnV0dG9uIG9uQ2xpY2s9e3RoaXMuZGVjcnlwdEZpbGV9PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IF90KFwiRGVjcnlwdCAlKHRleHQpc1wiLCB7IHRleHQ6IHRoaXMubGlua1RleHQgfSkgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvQWNjZXNzaWJsZUJ1dHRvbj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PiB9XG4gICAgICAgICAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjb25zdCB1cmwgPSBcInVzZXJjb250ZW50L1wiOyAvLyBYWFg6IHRoaXMgcGF0aCBzaG91bGQgcHJvYmFibHkgYmUgcGFzc2VkIGZyb20gdGhlIHNraW5cblxuICAgICAgICAgICAgLy8gSWYgdGhlIGF0dGFjaG1lbnQgaXMgZW5jcnlwdGVkIHRoZW4gcHV0IHRoZSBsaW5rIGluc2lkZSBhbiBpZnJhbWUuXG4gICAgICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIm14X01GaWxlQm9keVwiPlxuICAgICAgICAgICAgICAgICAgICB7IHBsYWNlaG9sZGVyIH1cbiAgICAgICAgICAgICAgICAgICAgeyBzaG93RG93bmxvYWRMaW5rICYmIDxkaXYgY2xhc3NOYW1lPVwibXhfTUZpbGVCb2R5X2Rvd25sb2FkXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGFyaWEtaGlkZGVuIHN0eWxlPXt7IGRpc3BsYXk6IFwibm9uZVwiIH19PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsgLypcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICogQWRkIGR1bW15IGNvcHkgb2YgdGhlIFwiYVwiIHRhZ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKiBXZSdsbCB1c2UgaXQgdG8gbGVhcm4gaG93IHRoZSBkb3dubG9hZCBsaW5rXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqIHdvdWxkIGhhdmUgYmVlbiBzdHlsZWQgaWYgaXQgd2FzIHJlbmRlcmVkIGlubGluZS5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICovIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IC8qIHRoaXMgdmlvbGF0ZXMgbXVsdGlwbGUgZXNsaW50IHJ1bGVzXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc28gaWdub3JlIGl0IGNvbXBsZXRlbHkgKi8gfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsgLyogZXNsaW50LWRpc2FibGUtbmV4dC1saW5lICovIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8YSByZWY9e3RoaXMuZHVtbXlMaW5rfSAvPlxuICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICB7IC8qXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgVE9ETzogTW92ZSBpZnJhbWUgKGFuZCBkdW1teSBsaW5rKSBpbnRvIEZpbGVEb3dubG9hZGVyLlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFdlIGN1cnJlbnRseSBoYXZlIGl0IHNldCB1cCB0aGlzIHdheSBiZWNhdXNlIG9mIHN0eWxlcyBhcHBsaWVkIHRvIHRoZSBpZnJhbWVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpdHNlbGYgd2hpY2ggY2Fubm90IGJlIGVhc2lseSBoYW5kbGVkL292ZXJyaWRkZW4gYnkgdGhlIEZpbGVEb3dubG9hZGVyLiBJblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZ1dHVyZSwgdGhlIGRvd25sb2FkIGxpbmsgbWF5IGRpc2FwcGVhciBlbnRpcmVseSBhdCB3aGljaCBwb2ludCBpdCBjb3VsZCBhbHNvXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYmUgc3VpdGFibGUgdG8ganVzdCByZW1vdmUgdGhpcyBiaXQgb2YgY29kZS5cbiAgICAgICAgICAgICAgICAgICAgICAgICAqLyB9XG4gICAgICAgICAgICAgICAgICAgICAgICA8aWZyYW1lXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYXJpYS1oaWRkZW5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aXRsZT17cHJlc2VudGFibGVUZXh0Rm9yRmlsZSh0aGlzLmNvbnRlbnQsIF90KFwiQXR0YWNobWVudFwiKSwgdHJ1ZSwgdHJ1ZSl9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3JjPXt1cmx9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb25Mb2FkPXsoKSA9PiB0aGlzLmRvd25sb2FkRmlsZSh0aGlzLmZpbGVOYW1lLCB0aGlzLmxpbmtUZXh0KX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWY9e3RoaXMuaWZyYW1lfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNhbmRib3g9XCJhbGxvdy1zY3JpcHRzIGFsbG93LWRvd25sb2FkcyBhbGxvdy1kb3dubG9hZHMtd2l0aG91dC11c2VyLWFjdGl2YXRpb25cIiAvPlxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj4gfVxuICAgICAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICAgICk7XG4gICAgICAgIH0gZWxzZSBpZiAoY29udGVudFVybCkge1xuICAgICAgICAgICAgY29uc3QgZG93bmxvYWRQcm9wcyA9IHtcbiAgICAgICAgICAgICAgICB0YXJnZXQ6IFwiX2JsYW5rXCIsXG4gICAgICAgICAgICAgICAgcmVsOiBcIm5vcmVmZXJyZXIgbm9vcGVuZXJcIixcblxuICAgICAgICAgICAgICAgIC8vIFdlIHNldCB0aGUgaHJlZiByZWdhcmRsZXNzIG9mIHdoZXRoZXIgb3Igbm90IHdlIGludGVyY2VwdCB0aGUgZG93bmxvYWRcbiAgICAgICAgICAgICAgICAvLyBiZWNhdXNlIHdlIGRvbid0IHJlYWxseSB3YW50IHRvIGNvbnZlcnQgdGhlIGZpbGUgdG8gYSBibG9iIGVhZ2VybHksIGFuZFxuICAgICAgICAgICAgICAgIC8vIHN0aWxsIHdhbnQgXCJvcGVuIGluIG5ldyB0YWJcIiBhbmQgXCJzYXZlIGxpbmsgYXNcIiB0byB3b3JrLlxuICAgICAgICAgICAgICAgIGhyZWY6IGNvbnRlbnRVcmwsXG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAvLyBCbG9icyBjYW4gb25seSBoYXZlIHVwIHRvIDUwMG1iLCBzbyBpZiB0aGUgZmlsZSByZXBvcnRzIGFzIGJlaW5nIHRvbyBsYXJnZSB0aGVuXG4gICAgICAgICAgICAvLyB3ZSB3b24ndCB0cnkgYW5kIGNvbnZlcnQgaXQuIExpa2V3aXNlLCBpZiB0aGUgZmlsZSBzaXplIGlzIHVua25vd24gdGhlbiB3ZSdsbCBhc3N1bWVcbiAgICAgICAgICAgIC8vIGl0IGlzIHRvbyBiaWcuIFRoZXJlIGlzIHRoZSByaXNrIG9mIHRoZSByZXBvcnRlZCBmaWxlIHNpemUgYW5kIHRoZSBhY3R1YWwgZmlsZSBzaXplXG4gICAgICAgICAgICAvLyBiZWluZyBkaWZmZXJlbnQsIGhvd2V2ZXIgdGhlIHVzZXIgc2hvdWxkbid0IG5vcm1hbGx5IHJ1biBpbnRvIHRoaXMgcHJvYmxlbS5cbiAgICAgICAgICAgIGNvbnN0IGZpbGVUb29CaWcgPSB0eXBlb2YoZmlsZVNpemUpID09PSAnbnVtYmVyJyA/IGZpbGVTaXplID4gNTI0Mjg4MDAwIDogdHJ1ZTtcblxuICAgICAgICAgICAgaWYgKFtcImFwcGxpY2F0aW9uL3BkZlwiXS5pbmNsdWRlcyhmaWxlVHlwZSkgJiYgIWZpbGVUb29CaWcpIHtcbiAgICAgICAgICAgICAgICAvLyBXZSB3YW50IHRvIGZvcmNlIGEgZG93bmxvYWQgb24gdGhpcyB0eXBlLCBzbyB1c2UgYW4gb25DbGljayBoYW5kbGVyLlxuICAgICAgICAgICAgICAgIGRvd25sb2FkUHJvcHNbXCJvbkNsaWNrXCJdID0gKGUpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgbG9nZ2VyLmxvZyhgRG93bmxvYWRpbmcgJHtmaWxlVHlwZX0gYXMgYmxvYiAodW5lbmNyeXB0ZWQpYCk7XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gQXZvaWQgbGV0dGluZyB0aGUgPGE+IGRvIGl0cyB0aGluZ1xuICAgICAgICAgICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICAgICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gU3RhcnQgYSBmZXRjaCBmb3IgdGhlIGRvd25sb2FkXG4gICAgICAgICAgICAgICAgICAgIC8vIEJhc2VkIHVwb24gaHR0cHM6Ly9zdGFja292ZXJmbG93LmNvbS9hLzQ5NTAwNDY1XG4gICAgICAgICAgICAgICAgICAgIHRoaXMucHJvcHMubWVkaWFFdmVudEhlbHBlci5zb3VyY2VCbG9iLnZhbHVlLnRoZW4oKGJsb2IpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGJsb2JVcmwgPSBVUkwuY3JlYXRlT2JqZWN0VVJMKGJsb2IpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBXZSBoYXZlIHRvIGNyZWF0ZSBhbiBhbmNob3IgdG8gZG93bmxvYWQgdGhlIGZpbGVcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHRlbXBBbmNob3IgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdhJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICB0ZW1wQW5jaG9yLmRvd25sb2FkID0gdGhpcy5maWxlTmFtZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRlbXBBbmNob3IuaHJlZiA9IGJsb2JVcmw7XG4gICAgICAgICAgICAgICAgICAgICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKHRlbXBBbmNob3IpOyAvLyBmb3IgZmlyZWZveDogaHR0cHM6Ly9zdGFja292ZXJmbG93LmNvbS9hLzMyMjI2MDY4XG4gICAgICAgICAgICAgICAgICAgICAgICB0ZW1wQW5jaG9yLmNsaWNrKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB0ZW1wQW5jaG9yLnJlbW92ZSgpO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAvLyBFbHNlIHdlIGFyZSBob3BpbmcgdGhlIGJyb3dzZXIgd2lsbCBkbyB0aGUgcmlnaHQgdGhpbmdcbiAgICAgICAgICAgICAgICBkb3dubG9hZFByb3BzW1wiZG93bmxvYWRcIl0gPSB0aGlzLmZpbGVOYW1lO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIm14X01GaWxlQm9keVwiPlxuICAgICAgICAgICAgICAgICAgICB7IHBsYWNlaG9sZGVyIH1cbiAgICAgICAgICAgICAgICAgICAgeyBzaG93RG93bmxvYWRMaW5rICYmIDxkaXYgY2xhc3NOYW1lPVwibXhfTUZpbGVCb2R5X2Rvd25sb2FkXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICA8YSB7Li4uZG93bmxvYWRQcm9wc30+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwibXhfTUZpbGVCb2R5X2Rvd25sb2FkX2ljb25cIiAvPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsgX3QoXCJEb3dubG9hZCAlKHRleHQpc1wiLCB7IHRleHQ6IHRoaXMubGlua1RleHQgfSkgfVxuICAgICAgICAgICAgICAgICAgICAgICAgPC9hPlxuICAgICAgICAgICAgICAgICAgICAgICAgeyB0aGlzLmNvbnRleHQudGltZWxpbmVSZW5kZXJpbmdUeXBlID09PSBUaW1lbGluZVJlbmRlcmluZ1R5cGUuRmlsZSAmJiAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9NSW1hZ2VCb2R5X3NpemVcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeyB0aGlzLmNvbnRlbnQuaW5mbz8uc2l6ZSA/IGZpbGVzaXplKHRoaXMuY29udGVudC5pbmZvLnNpemUpIDogXCJcIiB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICApIH1cbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+IH1cbiAgICAgICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgICApO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc3QgZXh0cmEgPSB0aGlzLmxpbmtUZXh0ID8gKCc6ICcgKyB0aGlzLmxpbmtUZXh0KSA6ICcnO1xuICAgICAgICAgICAgcmV0dXJuIDxzcGFuIGNsYXNzTmFtZT1cIm14X01GaWxlQm9keVwiPlxuICAgICAgICAgICAgICAgIHsgcGxhY2Vob2xkZXIgfVxuICAgICAgICAgICAgICAgIHsgX3QoXCJJbnZhbGlkIGZpbGUlKGV4dHJhKXNcIiwgeyBleHRyYTogZXh0cmEgfSkgfVxuICAgICAgICAgICAgPC9zcGFuPjtcbiAgICAgICAgfVxuICAgIH1cbn1cbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7OztBQWdCQTs7QUFDQTs7QUFDQTs7QUFFQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFHQTs7QUFDQTs7QUFDQTs7Ozs7O0FBOUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNB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