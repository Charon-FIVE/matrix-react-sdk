"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.UploadCanceledError = void 0;
exports.uploadFile = uploadFile;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _event = require("matrix-js-sdk/src/@types/event");

var _matrixEncryptAttachment = _interopRequireDefault(require("matrix-encrypt-attachment"));

var _pngChunksExtract = _interopRequireDefault(require("png-chunks-extract"));

var _logger = require("matrix-js-sdk/src/logger");

var _thread = require("matrix-js-sdk/src/models/thread");

var _dispatcher = _interopRequireDefault(require("./dispatcher/dispatcher"));

var _languageHandler = require("./languageHandler");

var _Modal = _interopRequireDefault(require("./Modal"));

var _Spinner = _interopRequireDefault(require("./components/views/elements/Spinner"));

var _actions = require("./dispatcher/actions");

var _SettingsStore = _interopRequireDefault(require("./settings/SettingsStore"));

var _sendTimePerformanceMetrics = require("./sendTimePerformanceMetrics");

var _RoomContext = require("./contexts/RoomContext");

var _RoomViewStore = require("./stores/RoomViewStore");

var _Reply = require("./utils/Reply");

var _ErrorDialog = _interopRequireDefault(require("./components/views/dialogs/ErrorDialog"));

var _UploadFailureDialog = _interopRequireDefault(require("./components/views/dialogs/UploadFailureDialog"));

var _UploadConfirmDialog = _interopRequireDefault(require("./components/views/dialogs/UploadConfirmDialog"));

var _imageMedia = require("./utils/image-media");

var _SendMessageComposer = require("./components/views/rooms/SendMessageComposer");

var _localRoom = require("./utils/local-room");

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { (0, _defineProperty2.default)(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }

// scraped out of a macOS hidpi (5660ppm) screenshot png
//                  5669 px (x-axis)      , 5669 px (y-axis)      , per metre
const PHYS_HIDPI = [0x00, 0x00, 0x16, 0x25, 0x00, 0x00, 0x16, 0x25, 0x01];

class UploadCanceledError extends Error {}

exports.UploadCanceledError = UploadCanceledError;

/**
 * Load a file into a newly created image element.
 *
 * @param {File} imageFile The file to load in an image element.
 * @return {Promise} A promise that resolves with the html image element.
 */
async function loadImageElement(imageFile) {
  // Load the file into an html element
  const img = document.createElement("img");
  const objectUrl = URL.createObjectURL(imageFile);
  const imgPromise = new Promise((resolve, reject) => {
    img.onload = function () {
      URL.revokeObjectURL(objectUrl);
      resolve(img);
    };

    img.onerror = function (e) {
      reject(e);
    };
  });
  img.src = objectUrl; // check for hi-dpi PNGs and fudge display resolution as needed.
  // this is mainly needed for macOS screencaps

  let parsePromise;

  if (imageFile.type === "image/png") {
    // in practice macOS happens to order the chunks so they fall in
    // the first 0x1000 bytes (thanks to a massive ICC header).
    // Thus we could slice the file down to only sniff the first 0x1000
    // bytes (but this makes extractPngChunks choke on the corrupt file)
    const headers = imageFile; //.slice(0, 0x1000);

    parsePromise = readFileAsArrayBuffer(headers).then(arrayBuffer => {
      const buffer = new Uint8Array(arrayBuffer);
      const chunks = (0, _pngChunksExtract.default)(buffer);

      for (const chunk of chunks) {
        if (chunk.name === 'pHYs') {
          if (chunk.data.byteLength !== PHYS_HIDPI.length) return;
          return chunk.data.every((val, i) => val === PHYS_HIDPI[i]);
        }
      }

      return false;
    });
  }

  const [hidpi] = await Promise.all([parsePromise, imgPromise]);
  const width = hidpi ? img.width >> 1 : img.width;
  const height = hidpi ? img.height >> 1 : img.height;
  return {
    width,
    height,
    img
  };
} // Minimum size for image files before we generate a thumbnail for them.


const IMAGE_SIZE_THRESHOLD_THUMBNAIL = 1 << 15; // 32KB
// Minimum size improvement for image thumbnails, if both are not met then don't bother uploading thumbnail.

const IMAGE_THUMBNAIL_MIN_REDUCTION_SIZE = 1 << 16; // 1MB

const IMAGE_THUMBNAIL_MIN_REDUCTION_PERCENT = 0.1; // 10%
// We don't apply these thresholds to video thumbnails as a poster image is always useful
// and videos tend to be much larger.
// Image mime types for which to always include a thumbnail for even if it is larger than the input for wider support.

const ALWAYS_INCLUDE_THUMBNAIL = ["image/avif", "image/webp"];
/**
 * Read the metadata for an image file and create and upload a thumbnail of the image.
 *
 * @param {MatrixClient} matrixClient A matrixClient to upload the thumbnail with.
 * @param {String} roomId The ID of the room the image will be uploaded in.
 * @param {File} imageFile The image to read and thumbnail.
 * @return {Promise} A promise that resolves with the attachment info.
 */

async function infoForImageFile(matrixClient, roomId, imageFile) {
  let thumbnailType = "image/png";

  if (imageFile.type === "image/jpeg") {
    thumbnailType = "image/jpeg";
  }

  const imageElement = await loadImageElement(imageFile);
  const result = await (0, _imageMedia.createThumbnail)(imageElement.img, imageElement.width, imageElement.height, thumbnailType);
  const imageInfo = result.info; // For lesser supported image types, always include the thumbnail even if it is larger

  if (!ALWAYS_INCLUDE_THUMBNAIL.includes(imageFile.type)) {
    // we do all sizing checks here because we still rely on thumbnail generation for making a blurhash from.
    const sizeDifference = imageFile.size - imageInfo.thumbnail_info.size;

    if ( // image is small enough already
    imageFile.size <= IMAGE_SIZE_THRESHOLD_THUMBNAIL || // thumbnail is not sufficiently smaller than original
    sizeDifference <= IMAGE_THUMBNAIL_MIN_REDUCTION_SIZE && sizeDifference <= imageFile.size * IMAGE_THUMBNAIL_MIN_REDUCTION_PERCENT) {
      delete imageInfo["thumbnail_info"];
      return imageInfo;
    }
  }

  const uploadResult = await uploadFile(matrixClient, roomId, result.thumbnail);
  imageInfo["thumbnail_url"] = uploadResult.url;
  imageInfo["thumbnail_file"] = uploadResult.file;
  return imageInfo;
}
/**
 * Load a file into a newly created video element and pull some strings
 * in an attempt to guarantee the first frame will be showing.
 *
 * @param {File} videoFile The file to load in an video element.
 * @return {Promise} A promise that resolves with the video image element.
 */


function loadVideoElement(videoFile) {
  return new Promise((resolve, reject) => {
    // Load the file into an html element
    const video = document.createElement("video");
    video.preload = "metadata";
    video.playsInline = true;
    video.muted = true;
    const reader = new FileReader();

    reader.onload = function (ev) {
      // Wait until we have enough data to thumbnail the first frame.
      video.onloadeddata = async function () {
        resolve(video);
        video.pause();
      };

      video.onerror = function (e) {
        reject(e);
      };

      let dataUrl = ev.target.result; // Chrome chokes on quicktime but likes mp4, and `file.type` is
      // read only, so do this horrible hack to unbreak quicktime

      if (dataUrl.startsWith("data:video/quicktime;")) {
        dataUrl = dataUrl.replace("data:video/quicktime;", "data:video/mp4;");
      }

      video.src = dataUrl;
      video.load();
      video.play();
    };

    reader.onerror = function (e) {
      reject(e);
    };

    reader.readAsDataURL(videoFile);
  });
}
/**
 * Read the metadata for a video file and create and upload a thumbnail of the video.
 *
 * @param {MatrixClient} matrixClient A matrixClient to upload the thumbnail with.
 * @param {String} roomId The ID of the room the video will be uploaded to.
 * @param {File} videoFile The video to read and thumbnail.
 * @return {Promise} A promise that resolves with the attachment info.
 */


function infoForVideoFile(matrixClient, roomId, videoFile) {
  const thumbnailType = "image/jpeg";
  let videoInfo;
  return loadVideoElement(videoFile).then(video => {
    return (0, _imageMedia.createThumbnail)(video, video.videoWidth, video.videoHeight, thumbnailType);
  }).then(result => {
    videoInfo = result.info;
    return uploadFile(matrixClient, roomId, result.thumbnail);
  }).then(result => {
    videoInfo.thumbnail_url = result.url;
    videoInfo.thumbnail_file = result.file;
    return videoInfo;
  });
}
/**
 * Read the file as an ArrayBuffer.
 * @param {File} file The file to read
 * @return {Promise} A promise that resolves with an ArrayBuffer when the file
 *   is read.
 */


function readFileAsArrayBuffer(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = function (e) {
      resolve(e.target.result);
    };

    reader.onerror = function (e) {
      reject(e);
    };

    reader.readAsArrayBuffer(file);
  });
}
/**
 * Upload the file to the content repository.
 * If the room is encrypted then encrypt the file before uploading.
 *
 * @param {MatrixClient} matrixClient The matrix client to upload the file with.
 * @param {String} roomId The ID of the room being uploaded to.
 * @param {File} file The file to upload.
 * @param {Function?} progressHandler optional callback to be called when a chunk of
 *    data is uploaded.
 * @return {Promise} A promise that resolves with an object.
 *  If the file is unencrypted then the object will have a "url" key.
 *  If the file is encrypted then the object will have a "file" key.
 */


function uploadFile(matrixClient, roomId, file, progressHandler) {
  let canceled = false;

  if (matrixClient.isRoomEncrypted(roomId)) {
    // If the room is encrypted then encrypt the file before uploading it.
    // First read the file into memory.
    let uploadPromise;
    const prom = readFileAsArrayBuffer(file).then(function (data) {
      if (canceled) throw new UploadCanceledError(); // Then encrypt the file.

      return _matrixEncryptAttachment.default.encryptAttachment(data);
    }).then(function (encryptResult) {
      if (canceled) throw new UploadCanceledError(); // Pass the encrypted data as a Blob to the uploader.

      const blob = new Blob([encryptResult.data]);
      uploadPromise = matrixClient.uploadContent(blob, {
        progressHandler,
        includeFilename: false
      });
      return uploadPromise.then(url => {
        if (canceled) throw new UploadCanceledError(); // If the attachment is encrypted then bundle the URL along
        // with the information needed to decrypt the attachment and
        // add it under a file key.

        return {
          file: _objectSpread(_objectSpread({}, encryptResult.info), {}, {
            url
          })
        };
      });
    });

    prom.abort = () => {
      canceled = true;
      if (uploadPromise) matrixClient.cancelUpload(uploadPromise);
    };

    return prom;
  } else {
    const basePromise = matrixClient.uploadContent(file, {
      progressHandler
    });
    const promise1 = basePromise.then(function (url) {
      if (canceled) throw new UploadCanceledError(); // If the attachment isn't encrypted then include the URL directly.

      return {
        url
      };
    });

    promise1.abort = () => {
      canceled = true;
      matrixClient.cancelUpload(basePromise);
    };

    return promise1;
  }
}

class ContentMessages {
  constructor() {
    (0, _defineProperty2.default)(this, "inprogress", []);
    (0, _defineProperty2.default)(this, "mediaConfig", null);
  }

  sendStickerContentToRoom(url, roomId, threadId, info, text, matrixClient) {
    return (0, _localRoom.doMaybeLocalRoomAction)(roomId, actualRoomId => matrixClient.sendStickerMessage(actualRoomId, threadId, url, info, text), matrixClient).catch(e => {
      _logger.logger.warn(`Failed to send content with URL ${url} to room ${roomId}`, e);

      throw e;
    });
  }

  getUploadLimit() {
    if (this.mediaConfig !== null && this.mediaConfig["m.upload.size"] !== undefined) {
      return this.mediaConfig["m.upload.size"];
    } else {
      return null;
    }
  }

  async sendContentListToRoom(files, roomId, relation, matrixClient) {
    let context = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : _RoomContext.TimelineRenderingType.Room;

    if (matrixClient.isGuest()) {
      _dispatcher.default.dispatch({
        action: 'require_registration'
      });

      return;
    }

    const replyToEvent = _RoomViewStore.RoomViewStore.instance.getQuotingEvent();

    if (!this.mediaConfig) {
      // hot-path optimization to not flash a spinner if we don't need to
      const modal = _Modal.default.createDialog(_Spinner.default, null, 'mx_Dialog_spinner');

      await this.ensureMediaConfigFetched(matrixClient);
      modal.close();
    }

    const tooBigFiles = [];
    const okFiles = [];

    for (const file of files) {
      if (this.isFileSizeAcceptable(file)) {
        okFiles.push(file);
      } else {
        tooBigFiles.push(file);
      }
    }

    if (tooBigFiles.length > 0) {
      const {
        finished
      } = _Modal.default.createDialog(_UploadFailureDialog.default, {
        badFiles: tooBigFiles,
        totalFiles: files.length,
        contentMessages: this
      });

      const [shouldContinue] = await finished;
      if (!shouldContinue) return;
    }

    let uploadAll = false; // Promise to complete before sending next file into room, used for synchronisation of file-sending
    // to match the order the files were specified in

    let promBefore = Promise.resolve();

    for (let i = 0; i < okFiles.length; ++i) {
      const file = okFiles[i];
      const loopPromiseBefore = promBefore;

      if (!uploadAll) {
        const {
          finished
        } = _Modal.default.createDialog(_UploadConfirmDialog.default, {
          file,
          currentIndex: i,
          totalFiles: okFiles.length
        });

        const [shouldContinue, shouldUploadAll] = await finished;
        if (!shouldContinue) break;

        if (shouldUploadAll) {
          uploadAll = true;
        }
      }

      promBefore = (0, _localRoom.doMaybeLocalRoomAction)(roomId, actualRoomId => this.sendContentToRoom(file, actualRoomId, relation, matrixClient, replyToEvent, loopPromiseBefore));
    }

    if (replyToEvent) {
      // Clear event being replied to
      _dispatcher.default.dispatch({
        action: "reply_to_event",
        event: null,
        context
      });
    } // Focus the correct composer


    _dispatcher.default.dispatch({
      action: _actions.Action.FocusSendMessageComposer,
      context
    });
  }

  getCurrentUploads(relation) {
    return this.inprogress.filter(upload => {
      const noRelation = !relation && !upload.relation;
      const matchingRelation = relation && upload.relation && relation.rel_type === upload.relation.rel_type && relation.event_id === upload.relation.event_id;
      return (noRelation || matchingRelation) && !upload.canceled;
    });
  }

  cancelUpload(promise, matrixClient) {
    const upload = this.inprogress.find(item => item.promise === promise);

    if (upload) {
      upload.canceled = true;
      matrixClient.cancelUpload(upload.promise);

      _dispatcher.default.dispatch({
        action: _actions.Action.UploadCanceled,
        upload
      });
    }
  }

  sendContentToRoom(file, roomId, relation, matrixClient, replyToEvent, promBefore) {
    const content = {
      body: file.name || 'Attachment',
      info: {
        size: file.size
      },
      msgtype: _event.MsgType.File // set more specifically later

    };
    (0, _SendMessageComposer.attachRelation)(content, relation);

    if (replyToEvent) {
      (0, _Reply.addReplyToMessageContent)(content, replyToEvent, {
        includeLegacyFallback: false
      });
    }

    if (_SettingsStore.default.getValue("Performance.addSendMessageTimingMetadata")) {
      (0, _sendTimePerformanceMetrics.decorateStartSendingTime)(content);
    } // if we have a mime type for the file, add it to the message metadata


    if (file.type) {
      content.info.mimetype = file.type;
    }

    const prom = new Promise(resolve => {
      if (file.type.indexOf('image/') === 0) {
        content.msgtype = _event.MsgType.Image;
        infoForImageFile(matrixClient, roomId, file).then(imageInfo => {
          Object.assign(content.info, imageInfo);
          resolve();
        }, e => {
          // Failed to thumbnail, fall back to uploading an m.file
          _logger.logger.error(e);

          content.msgtype = _event.MsgType.File;
          resolve();
        });
      } else if (file.type.indexOf('audio/') === 0) {
        content.msgtype = _event.MsgType.Audio;
        resolve();
      } else if (file.type.indexOf('video/') === 0) {
        content.msgtype = _event.MsgType.Video;
        infoForVideoFile(matrixClient, roomId, file).then(videoInfo => {
          Object.assign(content.info, videoInfo);
          resolve();
        }, e => {
          // Failed to thumbnail, fall back to uploading an m.file
          _logger.logger.error(e);

          content.msgtype = _event.MsgType.File;
          resolve();
        });
      } else {
        content.msgtype = _event.MsgType.File;
        resolve();
      }
    }); // create temporary abort handler for before the actual upload gets passed off to js-sdk

    prom.abort = () => {
      upload.canceled = true;
    };

    const upload = {
      fileName: file.name || 'Attachment',
      roomId,
      relation,
      total: file.size,
      loaded: 0,
      promise: prom
    };
    this.inprogress.push(upload);

    _dispatcher.default.dispatch({
      action: _actions.Action.UploadStarted,
      upload
    });

    function onProgress(ev) {
      upload.total = ev.total;
      upload.loaded = ev.loaded;

      _dispatcher.default.dispatch({
        action: _actions.Action.UploadProgress,
        upload
      });
    }

    let error;
    return prom.then(() => {
      if (upload.canceled) throw new UploadCanceledError(); // XXX: upload.promise must be the promise that
      // is returned by uploadFile as it has an abort()
      // method hacked onto it.

      upload.promise = uploadFile(matrixClient, roomId, file, onProgress);
      return upload.promise.then(function (result) {
        content.file = result.file;
        content.url = result.url;
      });
    }).then(() => {
      // Await previous message being sent into the room
      return promBefore;
    }).then(function () {
      if (upload.canceled) throw new UploadCanceledError();
      const threadId = relation?.rel_type === _thread.THREAD_RELATION_TYPE.name ? relation.event_id : null;
      const prom = matrixClient.sendMessage(roomId, threadId, content);

      if (_SettingsStore.default.getValue("Performance.addSendMessageTimingMetadata")) {
        prom.then(resp => {
          (0, _sendTimePerformanceMetrics.sendRoundTripMetric)(matrixClient, roomId, resp.event_id);
        });
      }

      return prom;
    }, function (err) {
      error = err;

      if (!upload.canceled) {
        let desc = (0, _languageHandler._t)("The file '%(fileName)s' failed to upload.", {
          fileName: upload.fileName
        });

        if (err.httpStatus === 413) {
          desc = (0, _languageHandler._t)("The file '%(fileName)s' exceeds this homeserver's size limit for uploads", {
            fileName: upload.fileName
          });
        }

        _Modal.default.createDialog(_ErrorDialog.default, {
          title: (0, _languageHandler._t)('Upload Failed'),
          description: desc
        });
      }
    }).finally(() => {
      for (let i = 0; i < this.inprogress.length; ++i) {
        if (this.inprogress[i].promise === upload.promise) {
          this.inprogress.splice(i, 1);
          break;
        }
      }

      if (error) {
        // 413: File was too big or upset the server in some way:
        // clear the media size limit so we fetch it again next time
        // we try to upload
        if (error?.httpStatus === 413) {
          this.mediaConfig = null;
        }

        _dispatcher.default.dispatch({
          action: _actions.Action.UploadFailed,
          upload,
          error
        });
      } else {
        _dispatcher.default.dispatch({
          action: _actions.Action.UploadFinished,
          upload
        });

        _dispatcher.default.dispatch({
          action: 'message_sent'
        });
      }
    });
  }

  isFileSizeAcceptable(file) {
    if (this.mediaConfig !== null && this.mediaConfig["m.upload.size"] !== undefined && file.size > this.mediaConfig["m.upload.size"]) {
      return false;
    }

    return true;
  }

  ensureMediaConfigFetched(matrixClient) {
    if (this.mediaConfig !== null) return;

    _logger.logger.log("[Media Config] Fetching");

    return matrixClient.getMediaConfig().then(config => {
      _logger.logger.log("[Media Config] Fetched config:", config);

      return config;
    }).catch(() => {
      // Media repo can't or won't report limits, so provide an empty object (no limits).
      _logger.logger.log("[Media Config] Could not fetch config, so not limiting uploads.");

      return {};
    }).then(config => {
      this.mediaConfig = config;
    });
  }

  static sharedInstance() {
    if (window.mxContentMessages === undefined) {
      window.mxContentMessages = new ContentMessages();
    }

    return window.mxContentMessages;
  }

}

exports.default = ContentMessages;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJQSFlTX0hJRFBJIiwiVXBsb2FkQ2FuY2VsZWRFcnJvciIsIkVycm9yIiwibG9hZEltYWdlRWxlbWVudCIsImltYWdlRmlsZSIsImltZyIsImRvY3VtZW50IiwiY3JlYXRlRWxlbWVudCIsIm9iamVjdFVybCIsIlVSTCIsImNyZWF0ZU9iamVjdFVSTCIsImltZ1Byb21pc2UiLCJQcm9taXNlIiwicmVzb2x2ZSIsInJlamVjdCIsIm9ubG9hZCIsInJldm9rZU9iamVjdFVSTCIsIm9uZXJyb3IiLCJlIiwic3JjIiwicGFyc2VQcm9taXNlIiwidHlwZSIsImhlYWRlcnMiLCJyZWFkRmlsZUFzQXJyYXlCdWZmZXIiLCJ0aGVuIiwiYXJyYXlCdWZmZXIiLCJidWZmZXIiLCJVaW50OEFycmF5IiwiY2h1bmtzIiwiZXh0cmFjdFBuZ0NodW5rcyIsImNodW5rIiwibmFtZSIsImRhdGEiLCJieXRlTGVuZ3RoIiwibGVuZ3RoIiwiZXZlcnkiLCJ2YWwiLCJpIiwiaGlkcGkiLCJhbGwiLCJ3aWR0aCIsImhlaWdodCIsIklNQUdFX1NJWkVfVEhSRVNIT0xEX1RIVU1CTkFJTCIsIklNQUdFX1RIVU1CTkFJTF9NSU5fUkVEVUNUSU9OX1NJWkUiLCJJTUFHRV9USFVNQk5BSUxfTUlOX1JFRFVDVElPTl9QRVJDRU5UIiwiQUxXQVlTX0lOQ0xVREVfVEhVTUJOQUlMIiwiaW5mb0ZvckltYWdlRmlsZSIsIm1hdHJpeENsaWVudCIsInJvb21JZCIsInRodW1ibmFpbFR5cGUiLCJpbWFnZUVsZW1lbnQiLCJyZXN1bHQiLCJjcmVhdGVUaHVtYm5haWwiLCJpbWFnZUluZm8iLCJpbmZvIiwiaW5jbHVkZXMiLCJzaXplRGlmZmVyZW5jZSIsInNpemUiLCJ0aHVtYm5haWxfaW5mbyIsInVwbG9hZFJlc3VsdCIsInVwbG9hZEZpbGUiLCJ0aHVtYm5haWwiLCJ1cmwiLCJmaWxlIiwibG9hZFZpZGVvRWxlbWVudCIsInZpZGVvRmlsZSIsInZpZGVvIiwicHJlbG9hZCIsInBsYXlzSW5saW5lIiwibXV0ZWQiLCJyZWFkZXIiLCJGaWxlUmVhZGVyIiwiZXYiLCJvbmxvYWRlZGRhdGEiLCJwYXVzZSIsImRhdGFVcmwiLCJ0YXJnZXQiLCJzdGFydHNXaXRoIiwicmVwbGFjZSIsImxvYWQiLCJwbGF5IiwicmVhZEFzRGF0YVVSTCIsImluZm9Gb3JWaWRlb0ZpbGUiLCJ2aWRlb0luZm8iLCJ2aWRlb1dpZHRoIiwidmlkZW9IZWlnaHQiLCJ0aHVtYm5haWxfdXJsIiwidGh1bWJuYWlsX2ZpbGUiLCJyZWFkQXNBcnJheUJ1ZmZlciIsInByb2dyZXNzSGFuZGxlciIsImNhbmNlbGVkIiwiaXNSb29tRW5jcnlwdGVkIiwidXBsb2FkUHJvbWlzZSIsInByb20iLCJlbmNyeXB0IiwiZW5jcnlwdEF0dGFjaG1lbnQiLCJlbmNyeXB0UmVzdWx0IiwiYmxvYiIsIkJsb2IiLCJ1cGxvYWRDb250ZW50IiwiaW5jbHVkZUZpbGVuYW1lIiwiYWJvcnQiLCJjYW5jZWxVcGxvYWQiLCJiYXNlUHJvbWlzZSIsInByb21pc2UxIiwiQ29udGVudE1lc3NhZ2VzIiwic2VuZFN0aWNrZXJDb250ZW50VG9Sb29tIiwidGhyZWFkSWQiLCJ0ZXh0IiwiZG9NYXliZUxvY2FsUm9vbUFjdGlvbiIsImFjdHVhbFJvb21JZCIsInNlbmRTdGlja2VyTWVzc2FnZSIsImNhdGNoIiwibG9nZ2VyIiwid2FybiIsImdldFVwbG9hZExpbWl0IiwibWVkaWFDb25maWciLCJ1bmRlZmluZWQiLCJzZW5kQ29udGVudExpc3RUb1Jvb20iLCJmaWxlcyIsInJlbGF0aW9uIiwiY29udGV4dCIsIlRpbWVsaW5lUmVuZGVyaW5nVHlwZSIsIlJvb20iLCJpc0d1ZXN0IiwiZGlzIiwiZGlzcGF0Y2giLCJhY3Rpb24iLCJyZXBseVRvRXZlbnQiLCJSb29tVmlld1N0b3JlIiwiaW5zdGFuY2UiLCJnZXRRdW90aW5nRXZlbnQiLCJtb2RhbCIsIk1vZGFsIiwiY3JlYXRlRGlhbG9nIiwiU3Bpbm5lciIsImVuc3VyZU1lZGlhQ29uZmlnRmV0Y2hlZCIsImNsb3NlIiwidG9vQmlnRmlsZXMiLCJva0ZpbGVzIiwiaXNGaWxlU2l6ZUFjY2VwdGFibGUiLCJwdXNoIiwiZmluaXNoZWQiLCJVcGxvYWRGYWlsdXJlRGlhbG9nIiwiYmFkRmlsZXMiLCJ0b3RhbEZpbGVzIiwiY29udGVudE1lc3NhZ2VzIiwic2hvdWxkQ29udGludWUiLCJ1cGxvYWRBbGwiLCJwcm9tQmVmb3JlIiwibG9vcFByb21pc2VCZWZvcmUiLCJVcGxvYWRDb25maXJtRGlhbG9nIiwiY3VycmVudEluZGV4Iiwic2hvdWxkVXBsb2FkQWxsIiwic2VuZENvbnRlbnRUb1Jvb20iLCJldmVudCIsIkFjdGlvbiIsIkZvY3VzU2VuZE1lc3NhZ2VDb21wb3NlciIsImdldEN1cnJlbnRVcGxvYWRzIiwiaW5wcm9ncmVzcyIsImZpbHRlciIsInVwbG9hZCIsIm5vUmVsYXRpb24iLCJtYXRjaGluZ1JlbGF0aW9uIiwicmVsX3R5cGUiLCJldmVudF9pZCIsInByb21pc2UiLCJmaW5kIiwiaXRlbSIsIlVwbG9hZENhbmNlbGVkIiwiY29udGVudCIsImJvZHkiLCJtc2d0eXBlIiwiTXNnVHlwZSIsIkZpbGUiLCJhdHRhY2hSZWxhdGlvbiIsImFkZFJlcGx5VG9NZXNzYWdlQ29udGVudCIsImluY2x1ZGVMZWdhY3lGYWxsYmFjayIsIlNldHRpbmdzU3RvcmUiLCJnZXRWYWx1ZSIsImRlY29yYXRlU3RhcnRTZW5kaW5nVGltZSIsIm1pbWV0eXBlIiwiaW5kZXhPZiIsIkltYWdlIiwiT2JqZWN0IiwiYXNzaWduIiwiZXJyb3IiLCJBdWRpbyIsIlZpZGVvIiwiZmlsZU5hbWUiLCJ0b3RhbCIsImxvYWRlZCIsIlVwbG9hZFN0YXJ0ZWQiLCJvblByb2dyZXNzIiwiVXBsb2FkUHJvZ3Jlc3MiLCJUSFJFQURfUkVMQVRJT05fVFlQRSIsInNlbmRNZXNzYWdlIiwicmVzcCIsInNlbmRSb3VuZFRyaXBNZXRyaWMiLCJlcnIiLCJkZXNjIiwiX3QiLCJodHRwU3RhdHVzIiwiRXJyb3JEaWFsb2ciLCJ0aXRsZSIsImRlc2NyaXB0aW9uIiwiZmluYWxseSIsInNwbGljZSIsIlVwbG9hZEZhaWxlZCIsIlVwbG9hZEZpbmlzaGVkIiwibG9nIiwiZ2V0TWVkaWFDb25maWciLCJjb25maWciLCJzaGFyZWRJbnN0YW5jZSIsIndpbmRvdyIsIm14Q29udGVudE1lc3NhZ2VzIl0sInNvdXJjZXMiOlsiLi4vc3JjL0NvbnRlbnRNZXNzYWdlcy50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMTUsIDIwMTYgT3Blbk1hcmtldCBMdGRcbkNvcHlyaWdodCAyMDE5IE5ldyBWZWN0b3IgTHRkXG5Db3B5cmlnaHQgMjAyMCBUaGUgTWF0cml4Lm9yZyBGb3VuZGF0aW9uIEMuSS5DLlxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbmltcG9ydCB7IE1hdHJpeENsaWVudCB9IGZyb20gXCJtYXRyaXgtanMtc2RrL3NyYy9jbGllbnRcIjtcbmltcG9ydCB7IElVcGxvYWRPcHRzIH0gZnJvbSBcIm1hdHJpeC1qcy1zZGsvc3JjL0B0eXBlcy9yZXF1ZXN0c1wiO1xuaW1wb3J0IHsgTXNnVHlwZSB9IGZyb20gXCJtYXRyaXgtanMtc2RrL3NyYy9AdHlwZXMvZXZlbnRcIjtcbmltcG9ydCBlbmNyeXB0IGZyb20gXCJtYXRyaXgtZW5jcnlwdC1hdHRhY2htZW50XCI7XG5pbXBvcnQgZXh0cmFjdFBuZ0NodW5rcyBmcm9tIFwicG5nLWNodW5rcy1leHRyYWN0XCI7XG5pbXBvcnQgeyBJQWJvcnRhYmxlUHJvbWlzZSwgSUltYWdlSW5mbyB9IGZyb20gXCJtYXRyaXgtanMtc2RrL3NyYy9AdHlwZXMvcGFydGlhbHNcIjtcbmltcG9ydCB7IGxvZ2dlciB9IGZyb20gXCJtYXRyaXgtanMtc2RrL3NyYy9sb2dnZXJcIjtcbmltcG9ydCB7IElFdmVudFJlbGF0aW9uLCBJU2VuZEV2ZW50UmVzcG9uc2UsIE1hdHJpeEVycm9yLCBNYXRyaXhFdmVudCB9IGZyb20gXCJtYXRyaXgtanMtc2RrL3NyYy9tYXRyaXhcIjtcbmltcG9ydCB7IFRIUkVBRF9SRUxBVElPTl9UWVBFIH0gZnJvbSBcIm1hdHJpeC1qcy1zZGsvc3JjL21vZGVscy90aHJlYWRcIjtcblxuaW1wb3J0IHsgSUVuY3J5cHRlZEZpbGUsIElNZWRpYUV2ZW50SW5mbyB9IGZyb20gXCIuL2N1c3RvbWlzYXRpb25zL21vZGVscy9JTWVkaWFFdmVudENvbnRlbnRcIjtcbmltcG9ydCBkaXMgZnJvbSAnLi9kaXNwYXRjaGVyL2Rpc3BhdGNoZXInO1xuaW1wb3J0IHsgX3QgfSBmcm9tICcuL2xhbmd1YWdlSGFuZGxlcic7XG5pbXBvcnQgTW9kYWwgZnJvbSAnLi9Nb2RhbCc7XG5pbXBvcnQgU3Bpbm5lciBmcm9tIFwiLi9jb21wb25lbnRzL3ZpZXdzL2VsZW1lbnRzL1NwaW5uZXJcIjtcbmltcG9ydCB7IEFjdGlvbiB9IGZyb20gXCIuL2Rpc3BhdGNoZXIvYWN0aW9uc1wiO1xuaW1wb3J0IHtcbiAgICBVcGxvYWRDYW5jZWxlZFBheWxvYWQsXG4gICAgVXBsb2FkRXJyb3JQYXlsb2FkLFxuICAgIFVwbG9hZEZpbmlzaGVkUGF5bG9hZCxcbiAgICBVcGxvYWRQcm9ncmVzc1BheWxvYWQsXG4gICAgVXBsb2FkU3RhcnRlZFBheWxvYWQsXG59IGZyb20gXCIuL2Rpc3BhdGNoZXIvcGF5bG9hZHMvVXBsb2FkUGF5bG9hZFwiO1xuaW1wb3J0IHsgSVVwbG9hZCB9IGZyb20gXCIuL21vZGVscy9JVXBsb2FkXCI7XG5pbXBvcnQgU2V0dGluZ3NTdG9yZSBmcm9tIFwiLi9zZXR0aW5ncy9TZXR0aW5nc1N0b3JlXCI7XG5pbXBvcnQgeyBkZWNvcmF0ZVN0YXJ0U2VuZGluZ1RpbWUsIHNlbmRSb3VuZFRyaXBNZXRyaWMgfSBmcm9tIFwiLi9zZW5kVGltZVBlcmZvcm1hbmNlTWV0cmljc1wiO1xuaW1wb3J0IHsgVGltZWxpbmVSZW5kZXJpbmdUeXBlIH0gZnJvbSBcIi4vY29udGV4dHMvUm9vbUNvbnRleHRcIjtcbmltcG9ydCB7IFJvb21WaWV3U3RvcmUgfSBmcm9tIFwiLi9zdG9yZXMvUm9vbVZpZXdTdG9yZVwiO1xuaW1wb3J0IHsgYWRkUmVwbHlUb01lc3NhZ2VDb250ZW50IH0gZnJvbSBcIi4vdXRpbHMvUmVwbHlcIjtcbmltcG9ydCBFcnJvckRpYWxvZyBmcm9tIFwiLi9jb21wb25lbnRzL3ZpZXdzL2RpYWxvZ3MvRXJyb3JEaWFsb2dcIjtcbmltcG9ydCBVcGxvYWRGYWlsdXJlRGlhbG9nIGZyb20gXCIuL2NvbXBvbmVudHMvdmlld3MvZGlhbG9ncy9VcGxvYWRGYWlsdXJlRGlhbG9nXCI7XG5pbXBvcnQgVXBsb2FkQ29uZmlybURpYWxvZyBmcm9tIFwiLi9jb21wb25lbnRzL3ZpZXdzL2RpYWxvZ3MvVXBsb2FkQ29uZmlybURpYWxvZ1wiO1xuaW1wb3J0IHsgY3JlYXRlVGh1bWJuYWlsIH0gZnJvbSBcIi4vdXRpbHMvaW1hZ2UtbWVkaWFcIjtcbmltcG9ydCB7IGF0dGFjaFJlbGF0aW9uIH0gZnJvbSBcIi4vY29tcG9uZW50cy92aWV3cy9yb29tcy9TZW5kTWVzc2FnZUNvbXBvc2VyXCI7XG5pbXBvcnQgeyBkb01heWJlTG9jYWxSb29tQWN0aW9uIH0gZnJvbSBcIi4vdXRpbHMvbG9jYWwtcm9vbVwiO1xuXG4vLyBzY3JhcGVkIG91dCBvZiBhIG1hY09TIGhpZHBpICg1NjYwcHBtKSBzY3JlZW5zaG90IHBuZ1xuLy8gICAgICAgICAgICAgICAgICA1NjY5IHB4ICh4LWF4aXMpICAgICAgLCA1NjY5IHB4ICh5LWF4aXMpICAgICAgLCBwZXIgbWV0cmVcbmNvbnN0IFBIWVNfSElEUEkgPSBbMHgwMCwgMHgwMCwgMHgxNiwgMHgyNSwgMHgwMCwgMHgwMCwgMHgxNiwgMHgyNSwgMHgwMV07XG5cbmV4cG9ydCBjbGFzcyBVcGxvYWRDYW5jZWxlZEVycm9yIGV4dGVuZHMgRXJyb3Ige31cblxuaW50ZXJmYWNlIElNZWRpYUNvbmZpZyB7XG4gICAgXCJtLnVwbG9hZC5zaXplXCI/OiBudW1iZXI7XG59XG5cbmludGVyZmFjZSBJQ29udGVudCB7XG4gICAgYm9keTogc3RyaW5nO1xuICAgIG1zZ3R5cGU6IHN0cmluZztcbiAgICBpbmZvOiBJTWVkaWFFdmVudEluZm87XG4gICAgZmlsZT86IHN0cmluZztcbiAgICB1cmw/OiBzdHJpbmc7XG59XG5cbi8qKlxuICogTG9hZCBhIGZpbGUgaW50byBhIG5ld2x5IGNyZWF0ZWQgaW1hZ2UgZWxlbWVudC5cbiAqXG4gKiBAcGFyYW0ge0ZpbGV9IGltYWdlRmlsZSBUaGUgZmlsZSB0byBsb2FkIGluIGFuIGltYWdlIGVsZW1lbnQuXG4gKiBAcmV0dXJuIHtQcm9taXNlfSBBIHByb21pc2UgdGhhdCByZXNvbHZlcyB3aXRoIHRoZSBodG1sIGltYWdlIGVsZW1lbnQuXG4gKi9cbmFzeW5jIGZ1bmN0aW9uIGxvYWRJbWFnZUVsZW1lbnQoaW1hZ2VGaWxlOiBGaWxlKSB7XG4gICAgLy8gTG9hZCB0aGUgZmlsZSBpbnRvIGFuIGh0bWwgZWxlbWVudFxuICAgIGNvbnN0IGltZyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJpbWdcIik7XG4gICAgY29uc3Qgb2JqZWN0VXJsID0gVVJMLmNyZWF0ZU9iamVjdFVSTChpbWFnZUZpbGUpO1xuICAgIGNvbnN0IGltZ1Byb21pc2UgPSBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgIGltZy5vbmxvYWQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIFVSTC5yZXZva2VPYmplY3RVUkwob2JqZWN0VXJsKTtcbiAgICAgICAgICAgIHJlc29sdmUoaW1nKTtcbiAgICAgICAgfTtcbiAgICAgICAgaW1nLm9uZXJyb3IgPSBmdW5jdGlvbihlKSB7XG4gICAgICAgICAgICByZWplY3QoZSk7XG4gICAgICAgIH07XG4gICAgfSk7XG4gICAgaW1nLnNyYyA9IG9iamVjdFVybDtcblxuICAgIC8vIGNoZWNrIGZvciBoaS1kcGkgUE5HcyBhbmQgZnVkZ2UgZGlzcGxheSByZXNvbHV0aW9uIGFzIG5lZWRlZC5cbiAgICAvLyB0aGlzIGlzIG1haW5seSBuZWVkZWQgZm9yIG1hY09TIHNjcmVlbmNhcHNcbiAgICBsZXQgcGFyc2VQcm9taXNlO1xuICAgIGlmIChpbWFnZUZpbGUudHlwZSA9PT0gXCJpbWFnZS9wbmdcIikge1xuICAgICAgICAvLyBpbiBwcmFjdGljZSBtYWNPUyBoYXBwZW5zIHRvIG9yZGVyIHRoZSBjaHVua3Mgc28gdGhleSBmYWxsIGluXG4gICAgICAgIC8vIHRoZSBmaXJzdCAweDEwMDAgYnl0ZXMgKHRoYW5rcyB0byBhIG1hc3NpdmUgSUNDIGhlYWRlcikuXG4gICAgICAgIC8vIFRodXMgd2UgY291bGQgc2xpY2UgdGhlIGZpbGUgZG93biB0byBvbmx5IHNuaWZmIHRoZSBmaXJzdCAweDEwMDBcbiAgICAgICAgLy8gYnl0ZXMgKGJ1dCB0aGlzIG1ha2VzIGV4dHJhY3RQbmdDaHVua3MgY2hva2Ugb24gdGhlIGNvcnJ1cHQgZmlsZSlcbiAgICAgICAgY29uc3QgaGVhZGVycyA9IGltYWdlRmlsZTsgLy8uc2xpY2UoMCwgMHgxMDAwKTtcbiAgICAgICAgcGFyc2VQcm9taXNlID0gcmVhZEZpbGVBc0FycmF5QnVmZmVyKGhlYWRlcnMpLnRoZW4oYXJyYXlCdWZmZXIgPT4ge1xuICAgICAgICAgICAgY29uc3QgYnVmZmVyID0gbmV3IFVpbnQ4QXJyYXkoYXJyYXlCdWZmZXIpO1xuICAgICAgICAgICAgY29uc3QgY2h1bmtzID0gZXh0cmFjdFBuZ0NodW5rcyhidWZmZXIpO1xuICAgICAgICAgICAgZm9yIChjb25zdCBjaHVuayBvZiBjaHVua3MpIHtcbiAgICAgICAgICAgICAgICBpZiAoY2h1bmsubmFtZSA9PT0gJ3BIWXMnKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChjaHVuay5kYXRhLmJ5dGVMZW5ndGggIT09IFBIWVNfSElEUEkubGVuZ3RoKSByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBjaHVuay5kYXRhLmV2ZXJ5KCh2YWwsIGkpID0+IHZhbCA9PT0gUEhZU19ISURQSVtpXSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBjb25zdCBbaGlkcGldID0gYXdhaXQgUHJvbWlzZS5hbGwoW3BhcnNlUHJvbWlzZSwgaW1nUHJvbWlzZV0pO1xuICAgIGNvbnN0IHdpZHRoID0gaGlkcGkgPyAoaW1nLndpZHRoID4+IDEpIDogaW1nLndpZHRoO1xuICAgIGNvbnN0IGhlaWdodCA9IGhpZHBpID8gKGltZy5oZWlnaHQgPj4gMSkgOiBpbWcuaGVpZ2h0O1xuICAgIHJldHVybiB7IHdpZHRoLCBoZWlnaHQsIGltZyB9O1xufVxuXG4vLyBNaW5pbXVtIHNpemUgZm9yIGltYWdlIGZpbGVzIGJlZm9yZSB3ZSBnZW5lcmF0ZSBhIHRodW1ibmFpbCBmb3IgdGhlbS5cbmNvbnN0IElNQUdFX1NJWkVfVEhSRVNIT0xEX1RIVU1CTkFJTCA9IDEgPDwgMTU7IC8vIDMyS0Jcbi8vIE1pbmltdW0gc2l6ZSBpbXByb3ZlbWVudCBmb3IgaW1hZ2UgdGh1bWJuYWlscywgaWYgYm90aCBhcmUgbm90IG1ldCB0aGVuIGRvbid0IGJvdGhlciB1cGxvYWRpbmcgdGh1bWJuYWlsLlxuY29uc3QgSU1BR0VfVEhVTUJOQUlMX01JTl9SRURVQ1RJT05fU0laRSA9IDEgPDwgMTY7IC8vIDFNQlxuY29uc3QgSU1BR0VfVEhVTUJOQUlMX01JTl9SRURVQ1RJT05fUEVSQ0VOVCA9IDAuMTsgLy8gMTAlXG4vLyBXZSBkb24ndCBhcHBseSB0aGVzZSB0aHJlc2hvbGRzIHRvIHZpZGVvIHRodW1ibmFpbHMgYXMgYSBwb3N0ZXIgaW1hZ2UgaXMgYWx3YXlzIHVzZWZ1bFxuLy8gYW5kIHZpZGVvcyB0ZW5kIHRvIGJlIG11Y2ggbGFyZ2VyLlxuXG4vLyBJbWFnZSBtaW1lIHR5cGVzIGZvciB3aGljaCB0byBhbHdheXMgaW5jbHVkZSBhIHRodW1ibmFpbCBmb3IgZXZlbiBpZiBpdCBpcyBsYXJnZXIgdGhhbiB0aGUgaW5wdXQgZm9yIHdpZGVyIHN1cHBvcnQuXG5jb25zdCBBTFdBWVNfSU5DTFVERV9USFVNQk5BSUwgPSBbXCJpbWFnZS9hdmlmXCIsIFwiaW1hZ2Uvd2VicFwiXTtcblxuLyoqXG4gKiBSZWFkIHRoZSBtZXRhZGF0YSBmb3IgYW4gaW1hZ2UgZmlsZSBhbmQgY3JlYXRlIGFuZCB1cGxvYWQgYSB0aHVtYm5haWwgb2YgdGhlIGltYWdlLlxuICpcbiAqIEBwYXJhbSB7TWF0cml4Q2xpZW50fSBtYXRyaXhDbGllbnQgQSBtYXRyaXhDbGllbnQgdG8gdXBsb2FkIHRoZSB0aHVtYm5haWwgd2l0aC5cbiAqIEBwYXJhbSB7U3RyaW5nfSByb29tSWQgVGhlIElEIG9mIHRoZSByb29tIHRoZSBpbWFnZSB3aWxsIGJlIHVwbG9hZGVkIGluLlxuICogQHBhcmFtIHtGaWxlfSBpbWFnZUZpbGUgVGhlIGltYWdlIHRvIHJlYWQgYW5kIHRodW1ibmFpbC5cbiAqIEByZXR1cm4ge1Byb21pc2V9IEEgcHJvbWlzZSB0aGF0IHJlc29sdmVzIHdpdGggdGhlIGF0dGFjaG1lbnQgaW5mby5cbiAqL1xuYXN5bmMgZnVuY3Rpb24gaW5mb0ZvckltYWdlRmlsZShcbiAgICBtYXRyaXhDbGllbnQ6IE1hdHJpeENsaWVudCxcbiAgICByb29tSWQ6IHN0cmluZyxcbiAgICBpbWFnZUZpbGU6IEZpbGUsXG4pOiBQcm9taXNlPFBhcnRpYWw8SU1lZGlhRXZlbnRJbmZvPj4ge1xuICAgIGxldCB0aHVtYm5haWxUeXBlID0gXCJpbWFnZS9wbmdcIjtcbiAgICBpZiAoaW1hZ2VGaWxlLnR5cGUgPT09IFwiaW1hZ2UvanBlZ1wiKSB7XG4gICAgICAgIHRodW1ibmFpbFR5cGUgPSBcImltYWdlL2pwZWdcIjtcbiAgICB9XG5cbiAgICBjb25zdCBpbWFnZUVsZW1lbnQgPSBhd2FpdCBsb2FkSW1hZ2VFbGVtZW50KGltYWdlRmlsZSk7XG5cbiAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBjcmVhdGVUaHVtYm5haWwoaW1hZ2VFbGVtZW50LmltZywgaW1hZ2VFbGVtZW50LndpZHRoLCBpbWFnZUVsZW1lbnQuaGVpZ2h0LCB0aHVtYm5haWxUeXBlKTtcbiAgICBjb25zdCBpbWFnZUluZm8gPSByZXN1bHQuaW5mbztcblxuICAgIC8vIEZvciBsZXNzZXIgc3VwcG9ydGVkIGltYWdlIHR5cGVzLCBhbHdheXMgaW5jbHVkZSB0aGUgdGh1bWJuYWlsIGV2ZW4gaWYgaXQgaXMgbGFyZ2VyXG4gICAgaWYgKCFBTFdBWVNfSU5DTFVERV9USFVNQk5BSUwuaW5jbHVkZXMoaW1hZ2VGaWxlLnR5cGUpKSB7XG4gICAgICAgIC8vIHdlIGRvIGFsbCBzaXppbmcgY2hlY2tzIGhlcmUgYmVjYXVzZSB3ZSBzdGlsbCByZWx5IG9uIHRodW1ibmFpbCBnZW5lcmF0aW9uIGZvciBtYWtpbmcgYSBibHVyaGFzaCBmcm9tLlxuICAgICAgICBjb25zdCBzaXplRGlmZmVyZW5jZSA9IGltYWdlRmlsZS5zaXplIC0gaW1hZ2VJbmZvLnRodW1ibmFpbF9pbmZvLnNpemU7XG4gICAgICAgIGlmIChcbiAgICAgICAgICAgIC8vIGltYWdlIGlzIHNtYWxsIGVub3VnaCBhbHJlYWR5XG4gICAgICAgICAgICBpbWFnZUZpbGUuc2l6ZSA8PSBJTUFHRV9TSVpFX1RIUkVTSE9MRF9USFVNQk5BSUwgfHxcbiAgICAgICAgICAgIC8vIHRodW1ibmFpbCBpcyBub3Qgc3VmZmljaWVudGx5IHNtYWxsZXIgdGhhbiBvcmlnaW5hbFxuICAgICAgICAgICAgKHNpemVEaWZmZXJlbmNlIDw9IElNQUdFX1RIVU1CTkFJTF9NSU5fUkVEVUNUSU9OX1NJWkUgJiZcbiAgICAgICAgICAgICAgICBzaXplRGlmZmVyZW5jZSA8PSAoaW1hZ2VGaWxlLnNpemUgKiBJTUFHRV9USFVNQk5BSUxfTUlOX1JFRFVDVElPTl9QRVJDRU5UKSlcbiAgICAgICAgKSB7XG4gICAgICAgICAgICBkZWxldGUgaW1hZ2VJbmZvW1widGh1bWJuYWlsX2luZm9cIl07XG4gICAgICAgICAgICByZXR1cm4gaW1hZ2VJbmZvO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgY29uc3QgdXBsb2FkUmVzdWx0ID0gYXdhaXQgdXBsb2FkRmlsZShtYXRyaXhDbGllbnQsIHJvb21JZCwgcmVzdWx0LnRodW1ibmFpbCk7XG5cbiAgICBpbWFnZUluZm9bXCJ0aHVtYm5haWxfdXJsXCJdID0gdXBsb2FkUmVzdWx0LnVybDtcbiAgICBpbWFnZUluZm9bXCJ0aHVtYm5haWxfZmlsZVwiXSA9IHVwbG9hZFJlc3VsdC5maWxlO1xuICAgIHJldHVybiBpbWFnZUluZm87XG59XG5cbi8qKlxuICogTG9hZCBhIGZpbGUgaW50byBhIG5ld2x5IGNyZWF0ZWQgdmlkZW8gZWxlbWVudCBhbmQgcHVsbCBzb21lIHN0cmluZ3NcbiAqIGluIGFuIGF0dGVtcHQgdG8gZ3VhcmFudGVlIHRoZSBmaXJzdCBmcmFtZSB3aWxsIGJlIHNob3dpbmcuXG4gKlxuICogQHBhcmFtIHtGaWxlfSB2aWRlb0ZpbGUgVGhlIGZpbGUgdG8gbG9hZCBpbiBhbiB2aWRlbyBlbGVtZW50LlxuICogQHJldHVybiB7UHJvbWlzZX0gQSBwcm9taXNlIHRoYXQgcmVzb2x2ZXMgd2l0aCB0aGUgdmlkZW8gaW1hZ2UgZWxlbWVudC5cbiAqL1xuZnVuY3Rpb24gbG9hZFZpZGVvRWxlbWVudCh2aWRlb0ZpbGU6IEZpbGUpOiBQcm9taXNlPEhUTUxWaWRlb0VsZW1lbnQ+IHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAvLyBMb2FkIHRoZSBmaWxlIGludG8gYW4gaHRtbCBlbGVtZW50XG4gICAgICAgIGNvbnN0IHZpZGVvID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInZpZGVvXCIpO1xuICAgICAgICB2aWRlby5wcmVsb2FkID0gXCJtZXRhZGF0YVwiO1xuICAgICAgICB2aWRlby5wbGF5c0lubGluZSA9IHRydWU7XG4gICAgICAgIHZpZGVvLm11dGVkID0gdHJ1ZTtcblxuICAgICAgICBjb25zdCByZWFkZXIgPSBuZXcgRmlsZVJlYWRlcigpO1xuXG4gICAgICAgIHJlYWRlci5vbmxvYWQgPSBmdW5jdGlvbihldikge1xuICAgICAgICAgICAgLy8gV2FpdCB1bnRpbCB3ZSBoYXZlIGVub3VnaCBkYXRhIHRvIHRodW1ibmFpbCB0aGUgZmlyc3QgZnJhbWUuXG4gICAgICAgICAgICB2aWRlby5vbmxvYWRlZGRhdGEgPSBhc3luYyBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICByZXNvbHZlKHZpZGVvKTtcbiAgICAgICAgICAgICAgICB2aWRlby5wYXVzZSgpO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHZpZGVvLm9uZXJyb3IgPSBmdW5jdGlvbihlKSB7XG4gICAgICAgICAgICAgICAgcmVqZWN0KGUpO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgbGV0IGRhdGFVcmwgPSBldi50YXJnZXQucmVzdWx0IGFzIHN0cmluZztcbiAgICAgICAgICAgIC8vIENocm9tZSBjaG9rZXMgb24gcXVpY2t0aW1lIGJ1dCBsaWtlcyBtcDQsIGFuZCBgZmlsZS50eXBlYCBpc1xuICAgICAgICAgICAgLy8gcmVhZCBvbmx5LCBzbyBkbyB0aGlzIGhvcnJpYmxlIGhhY2sgdG8gdW5icmVhayBxdWlja3RpbWVcbiAgICAgICAgICAgIGlmIChkYXRhVXJsLnN0YXJ0c1dpdGgoXCJkYXRhOnZpZGVvL3F1aWNrdGltZTtcIikpIHtcbiAgICAgICAgICAgICAgICBkYXRhVXJsID0gZGF0YVVybC5yZXBsYWNlKFwiZGF0YTp2aWRlby9xdWlja3RpbWU7XCIsIFwiZGF0YTp2aWRlby9tcDQ7XCIpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB2aWRlby5zcmMgPSBkYXRhVXJsO1xuICAgICAgICAgICAgdmlkZW8ubG9hZCgpO1xuICAgICAgICAgICAgdmlkZW8ucGxheSgpO1xuICAgICAgICB9O1xuICAgICAgICByZWFkZXIub25lcnJvciA9IGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICAgIHJlamVjdChlKTtcbiAgICAgICAgfTtcbiAgICAgICAgcmVhZGVyLnJlYWRBc0RhdGFVUkwodmlkZW9GaWxlKTtcbiAgICB9KTtcbn1cblxuLyoqXG4gKiBSZWFkIHRoZSBtZXRhZGF0YSBmb3IgYSB2aWRlbyBmaWxlIGFuZCBjcmVhdGUgYW5kIHVwbG9hZCBhIHRodW1ibmFpbCBvZiB0aGUgdmlkZW8uXG4gKlxuICogQHBhcmFtIHtNYXRyaXhDbGllbnR9IG1hdHJpeENsaWVudCBBIG1hdHJpeENsaWVudCB0byB1cGxvYWQgdGhlIHRodW1ibmFpbCB3aXRoLlxuICogQHBhcmFtIHtTdHJpbmd9IHJvb21JZCBUaGUgSUQgb2YgdGhlIHJvb20gdGhlIHZpZGVvIHdpbGwgYmUgdXBsb2FkZWQgdG8uXG4gKiBAcGFyYW0ge0ZpbGV9IHZpZGVvRmlsZSBUaGUgdmlkZW8gdG8gcmVhZCBhbmQgdGh1bWJuYWlsLlxuICogQHJldHVybiB7UHJvbWlzZX0gQSBwcm9taXNlIHRoYXQgcmVzb2x2ZXMgd2l0aCB0aGUgYXR0YWNobWVudCBpbmZvLlxuICovXG5mdW5jdGlvbiBpbmZvRm9yVmlkZW9GaWxlKFxuICAgIG1hdHJpeENsaWVudDogTWF0cml4Q2xpZW50LFxuICAgIHJvb21JZDogc3RyaW5nLFxuICAgIHZpZGVvRmlsZTogRmlsZSxcbik6IFByb21pc2U8UGFydGlhbDxJTWVkaWFFdmVudEluZm8+PiB7XG4gICAgY29uc3QgdGh1bWJuYWlsVHlwZSA9IFwiaW1hZ2UvanBlZ1wiO1xuXG4gICAgbGV0IHZpZGVvSW5mbzogUGFydGlhbDxJTWVkaWFFdmVudEluZm8+O1xuICAgIHJldHVybiBsb2FkVmlkZW9FbGVtZW50KHZpZGVvRmlsZSkudGhlbigodmlkZW8pID0+IHtcbiAgICAgICAgcmV0dXJuIGNyZWF0ZVRodW1ibmFpbCh2aWRlbywgdmlkZW8udmlkZW9XaWR0aCwgdmlkZW8udmlkZW9IZWlnaHQsIHRodW1ibmFpbFR5cGUpO1xuICAgIH0pLnRoZW4oKHJlc3VsdCkgPT4ge1xuICAgICAgICB2aWRlb0luZm8gPSByZXN1bHQuaW5mbztcbiAgICAgICAgcmV0dXJuIHVwbG9hZEZpbGUobWF0cml4Q2xpZW50LCByb29tSWQsIHJlc3VsdC50aHVtYm5haWwpO1xuICAgIH0pLnRoZW4oKHJlc3VsdCkgPT4ge1xuICAgICAgICB2aWRlb0luZm8udGh1bWJuYWlsX3VybCA9IHJlc3VsdC51cmw7XG4gICAgICAgIHZpZGVvSW5mby50aHVtYm5haWxfZmlsZSA9IHJlc3VsdC5maWxlO1xuICAgICAgICByZXR1cm4gdmlkZW9JbmZvO1xuICAgIH0pO1xufVxuXG4vKipcbiAqIFJlYWQgdGhlIGZpbGUgYXMgYW4gQXJyYXlCdWZmZXIuXG4gKiBAcGFyYW0ge0ZpbGV9IGZpbGUgVGhlIGZpbGUgdG8gcmVhZFxuICogQHJldHVybiB7UHJvbWlzZX0gQSBwcm9taXNlIHRoYXQgcmVzb2x2ZXMgd2l0aCBhbiBBcnJheUJ1ZmZlciB3aGVuIHRoZSBmaWxlXG4gKiAgIGlzIHJlYWQuXG4gKi9cbmZ1bmN0aW9uIHJlYWRGaWxlQXNBcnJheUJ1ZmZlcihmaWxlOiBGaWxlIHwgQmxvYik6IFByb21pc2U8QXJyYXlCdWZmZXI+IHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICBjb25zdCByZWFkZXIgPSBuZXcgRmlsZVJlYWRlcigpO1xuICAgICAgICByZWFkZXIub25sb2FkID0gZnVuY3Rpb24oZSkge1xuICAgICAgICAgICAgcmVzb2x2ZShlLnRhcmdldC5yZXN1bHQgYXMgQXJyYXlCdWZmZXIpO1xuICAgICAgICB9O1xuICAgICAgICByZWFkZXIub25lcnJvciA9IGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICAgIHJlamVjdChlKTtcbiAgICAgICAgfTtcbiAgICAgICAgcmVhZGVyLnJlYWRBc0FycmF5QnVmZmVyKGZpbGUpO1xuICAgIH0pO1xufVxuXG4vKipcbiAqIFVwbG9hZCB0aGUgZmlsZSB0byB0aGUgY29udGVudCByZXBvc2l0b3J5LlxuICogSWYgdGhlIHJvb20gaXMgZW5jcnlwdGVkIHRoZW4gZW5jcnlwdCB0aGUgZmlsZSBiZWZvcmUgdXBsb2FkaW5nLlxuICpcbiAqIEBwYXJhbSB7TWF0cml4Q2xpZW50fSBtYXRyaXhDbGllbnQgVGhlIG1hdHJpeCBjbGllbnQgdG8gdXBsb2FkIHRoZSBmaWxlIHdpdGguXG4gKiBAcGFyYW0ge1N0cmluZ30gcm9vbUlkIFRoZSBJRCBvZiB0aGUgcm9vbSBiZWluZyB1cGxvYWRlZCB0by5cbiAqIEBwYXJhbSB7RmlsZX0gZmlsZSBUaGUgZmlsZSB0byB1cGxvYWQuXG4gKiBAcGFyYW0ge0Z1bmN0aW9uP30gcHJvZ3Jlc3NIYW5kbGVyIG9wdGlvbmFsIGNhbGxiYWNrIHRvIGJlIGNhbGxlZCB3aGVuIGEgY2h1bmsgb2ZcbiAqICAgIGRhdGEgaXMgdXBsb2FkZWQuXG4gKiBAcmV0dXJuIHtQcm9taXNlfSBBIHByb21pc2UgdGhhdCByZXNvbHZlcyB3aXRoIGFuIG9iamVjdC5cbiAqICBJZiB0aGUgZmlsZSBpcyB1bmVuY3J5cHRlZCB0aGVuIHRoZSBvYmplY3Qgd2lsbCBoYXZlIGEgXCJ1cmxcIiBrZXkuXG4gKiAgSWYgdGhlIGZpbGUgaXMgZW5jcnlwdGVkIHRoZW4gdGhlIG9iamVjdCB3aWxsIGhhdmUgYSBcImZpbGVcIiBrZXkuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB1cGxvYWRGaWxlKFxuICAgIG1hdHJpeENsaWVudDogTWF0cml4Q2xpZW50LFxuICAgIHJvb21JZDogc3RyaW5nLFxuICAgIGZpbGU6IEZpbGUgfCBCbG9iLFxuICAgIHByb2dyZXNzSGFuZGxlcj86IElVcGxvYWRPcHRzW1wicHJvZ3Jlc3NIYW5kbGVyXCJdLFxuKTogSUFib3J0YWJsZVByb21pc2U8eyB1cmw/OiBzdHJpbmcsIGZpbGU/OiBJRW5jcnlwdGVkRmlsZSB9PiB7XG4gICAgbGV0IGNhbmNlbGVkID0gZmFsc2U7XG4gICAgaWYgKG1hdHJpeENsaWVudC5pc1Jvb21FbmNyeXB0ZWQocm9vbUlkKSkge1xuICAgICAgICAvLyBJZiB0aGUgcm9vbSBpcyBlbmNyeXB0ZWQgdGhlbiBlbmNyeXB0IHRoZSBmaWxlIGJlZm9yZSB1cGxvYWRpbmcgaXQuXG4gICAgICAgIC8vIEZpcnN0IHJlYWQgdGhlIGZpbGUgaW50byBtZW1vcnkuXG4gICAgICAgIGxldCB1cGxvYWRQcm9taXNlOiBJQWJvcnRhYmxlUHJvbWlzZTxzdHJpbmc+O1xuICAgICAgICBjb25zdCBwcm9tID0gcmVhZEZpbGVBc0FycmF5QnVmZmVyKGZpbGUpLnRoZW4oZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICAgICAgaWYgKGNhbmNlbGVkKSB0aHJvdyBuZXcgVXBsb2FkQ2FuY2VsZWRFcnJvcigpO1xuICAgICAgICAgICAgLy8gVGhlbiBlbmNyeXB0IHRoZSBmaWxlLlxuICAgICAgICAgICAgcmV0dXJuIGVuY3J5cHQuZW5jcnlwdEF0dGFjaG1lbnQoZGF0YSk7XG4gICAgICAgIH0pLnRoZW4oZnVuY3Rpb24oZW5jcnlwdFJlc3VsdCkge1xuICAgICAgICAgICAgaWYgKGNhbmNlbGVkKSB0aHJvdyBuZXcgVXBsb2FkQ2FuY2VsZWRFcnJvcigpO1xuXG4gICAgICAgICAgICAvLyBQYXNzIHRoZSBlbmNyeXB0ZWQgZGF0YSBhcyBhIEJsb2IgdG8gdGhlIHVwbG9hZGVyLlxuICAgICAgICAgICAgY29uc3QgYmxvYiA9IG5ldyBCbG9iKFtlbmNyeXB0UmVzdWx0LmRhdGFdKTtcbiAgICAgICAgICAgIHVwbG9hZFByb21pc2UgPSBtYXRyaXhDbGllbnQudXBsb2FkQ29udGVudChibG9iLCB7XG4gICAgICAgICAgICAgICAgcHJvZ3Jlc3NIYW5kbGVyLFxuICAgICAgICAgICAgICAgIGluY2x1ZGVGaWxlbmFtZTogZmFsc2UsXG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgcmV0dXJuIHVwbG9hZFByb21pc2UudGhlbih1cmwgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChjYW5jZWxlZCkgdGhyb3cgbmV3IFVwbG9hZENhbmNlbGVkRXJyb3IoKTtcblxuICAgICAgICAgICAgICAgIC8vIElmIHRoZSBhdHRhY2htZW50IGlzIGVuY3J5cHRlZCB0aGVuIGJ1bmRsZSB0aGUgVVJMIGFsb25nXG4gICAgICAgICAgICAgICAgLy8gd2l0aCB0aGUgaW5mb3JtYXRpb24gbmVlZGVkIHRvIGRlY3J5cHQgdGhlIGF0dGFjaG1lbnQgYW5kXG4gICAgICAgICAgICAgICAgLy8gYWRkIGl0IHVuZGVyIGEgZmlsZSBrZXkuXG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgZmlsZToge1xuICAgICAgICAgICAgICAgICAgICAgICAgLi4uZW5jcnlwdFJlc3VsdC5pbmZvLFxuICAgICAgICAgICAgICAgICAgICAgICAgdXJsLFxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSkgYXMgSUFib3J0YWJsZVByb21pc2U8eyBmaWxlOiBJRW5jcnlwdGVkRmlsZSB9PjtcbiAgICAgICAgcHJvbS5hYm9ydCA9ICgpID0+IHtcbiAgICAgICAgICAgIGNhbmNlbGVkID0gdHJ1ZTtcbiAgICAgICAgICAgIGlmICh1cGxvYWRQcm9taXNlKSBtYXRyaXhDbGllbnQuY2FuY2VsVXBsb2FkKHVwbG9hZFByb21pc2UpO1xuICAgICAgICB9O1xuICAgICAgICByZXR1cm4gcHJvbTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBjb25zdCBiYXNlUHJvbWlzZSA9IG1hdHJpeENsaWVudC51cGxvYWRDb250ZW50KGZpbGUsIHsgcHJvZ3Jlc3NIYW5kbGVyIH0pO1xuICAgICAgICBjb25zdCBwcm9taXNlMSA9IGJhc2VQcm9taXNlLnRoZW4oZnVuY3Rpb24odXJsKSB7XG4gICAgICAgICAgICBpZiAoY2FuY2VsZWQpIHRocm93IG5ldyBVcGxvYWRDYW5jZWxlZEVycm9yKCk7XG4gICAgICAgICAgICAvLyBJZiB0aGUgYXR0YWNobWVudCBpc24ndCBlbmNyeXB0ZWQgdGhlbiBpbmNsdWRlIHRoZSBVUkwgZGlyZWN0bHkuXG4gICAgICAgICAgICByZXR1cm4geyB1cmwgfTtcbiAgICAgICAgfSkgYXMgSUFib3J0YWJsZVByb21pc2U8eyB1cmw6IHN0cmluZyB9PjtcbiAgICAgICAgcHJvbWlzZTEuYWJvcnQgPSAoKSA9PiB7XG4gICAgICAgICAgICBjYW5jZWxlZCA9IHRydWU7XG4gICAgICAgICAgICBtYXRyaXhDbGllbnQuY2FuY2VsVXBsb2FkKGJhc2VQcm9taXNlKTtcbiAgICAgICAgfTtcbiAgICAgICAgcmV0dXJuIHByb21pc2UxO1xuICAgIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQ29udGVudE1lc3NhZ2VzIHtcbiAgICBwcml2YXRlIGlucHJvZ3Jlc3M6IElVcGxvYWRbXSA9IFtdO1xuICAgIHByaXZhdGUgbWVkaWFDb25maWc6IElNZWRpYUNvbmZpZyA9IG51bGw7XG5cbiAgICBwdWJsaWMgc2VuZFN0aWNrZXJDb250ZW50VG9Sb29tKFxuICAgICAgICB1cmw6IHN0cmluZyxcbiAgICAgICAgcm9vbUlkOiBzdHJpbmcsXG4gICAgICAgIHRocmVhZElkOiBzdHJpbmcgfCBudWxsLFxuICAgICAgICBpbmZvOiBJSW1hZ2VJbmZvLFxuICAgICAgICB0ZXh0OiBzdHJpbmcsXG4gICAgICAgIG1hdHJpeENsaWVudDogTWF0cml4Q2xpZW50LFxuICAgICk6IFByb21pc2U8SVNlbmRFdmVudFJlc3BvbnNlPiB7XG4gICAgICAgIHJldHVybiBkb01heWJlTG9jYWxSb29tQWN0aW9uKFxuICAgICAgICAgICAgcm9vbUlkLFxuICAgICAgICAgICAgKGFjdHVhbFJvb21JZDogc3RyaW5nKSA9PiBtYXRyaXhDbGllbnQuc2VuZFN0aWNrZXJNZXNzYWdlKGFjdHVhbFJvb21JZCwgdGhyZWFkSWQsIHVybCwgaW5mbywgdGV4dCksXG4gICAgICAgICAgICBtYXRyaXhDbGllbnQsXG4gICAgICAgICkuY2F0Y2goKGUpID0+IHtcbiAgICAgICAgICAgIGxvZ2dlci53YXJuKGBGYWlsZWQgdG8gc2VuZCBjb250ZW50IHdpdGggVVJMICR7dXJsfSB0byByb29tICR7cm9vbUlkfWAsIGUpO1xuICAgICAgICAgICAgdGhyb3cgZTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHVibGljIGdldFVwbG9hZExpbWl0KCk6IG51bWJlciB8IG51bGwge1xuICAgICAgICBpZiAodGhpcy5tZWRpYUNvbmZpZyAhPT0gbnVsbCAmJiB0aGlzLm1lZGlhQ29uZmlnW1wibS51cGxvYWQuc2l6ZVwiXSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5tZWRpYUNvbmZpZ1tcIm0udXBsb2FkLnNpemVcIl07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHB1YmxpYyBhc3luYyBzZW5kQ29udGVudExpc3RUb1Jvb20oXG4gICAgICAgIGZpbGVzOiBGaWxlW10sXG4gICAgICAgIHJvb21JZDogc3RyaW5nLFxuICAgICAgICByZWxhdGlvbjogSUV2ZW50UmVsYXRpb24gfCB1bmRlZmluZWQsXG4gICAgICAgIG1hdHJpeENsaWVudDogTWF0cml4Q2xpZW50LFxuICAgICAgICBjb250ZXh0ID0gVGltZWxpbmVSZW5kZXJpbmdUeXBlLlJvb20sXG4gICAgKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgICAgIGlmIChtYXRyaXhDbGllbnQuaXNHdWVzdCgpKSB7XG4gICAgICAgICAgICBkaXMuZGlzcGF0Y2goeyBhY3Rpb246ICdyZXF1aXJlX3JlZ2lzdHJhdGlvbicgfSk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCByZXBseVRvRXZlbnQgPSBSb29tVmlld1N0b3JlLmluc3RhbmNlLmdldFF1b3RpbmdFdmVudCgpO1xuICAgICAgICBpZiAoIXRoaXMubWVkaWFDb25maWcpIHsgLy8gaG90LXBhdGggb3B0aW1pemF0aW9uIHRvIG5vdCBmbGFzaCBhIHNwaW5uZXIgaWYgd2UgZG9uJ3QgbmVlZCB0b1xuICAgICAgICAgICAgY29uc3QgbW9kYWwgPSBNb2RhbC5jcmVhdGVEaWFsb2coU3Bpbm5lciwgbnVsbCwgJ214X0RpYWxvZ19zcGlubmVyJyk7XG4gICAgICAgICAgICBhd2FpdCB0aGlzLmVuc3VyZU1lZGlhQ29uZmlnRmV0Y2hlZChtYXRyaXhDbGllbnQpO1xuICAgICAgICAgICAgbW9kYWwuY2xvc2UoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHRvb0JpZ0ZpbGVzID0gW107XG4gICAgICAgIGNvbnN0IG9rRmlsZXMgPSBbXTtcblxuICAgICAgICBmb3IgKGNvbnN0IGZpbGUgb2YgZmlsZXMpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLmlzRmlsZVNpemVBY2NlcHRhYmxlKGZpbGUpKSB7XG4gICAgICAgICAgICAgICAgb2tGaWxlcy5wdXNoKGZpbGUpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0b29CaWdGaWxlcy5wdXNoKGZpbGUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRvb0JpZ0ZpbGVzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIGNvbnN0IHsgZmluaXNoZWQgfSA9IE1vZGFsLmNyZWF0ZURpYWxvZzxbYm9vbGVhbl0+KFVwbG9hZEZhaWx1cmVEaWFsb2csIHtcbiAgICAgICAgICAgICAgICBiYWRGaWxlczogdG9vQmlnRmlsZXMsXG4gICAgICAgICAgICAgICAgdG90YWxGaWxlczogZmlsZXMubGVuZ3RoLFxuICAgICAgICAgICAgICAgIGNvbnRlbnRNZXNzYWdlczogdGhpcyxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgY29uc3QgW3Nob3VsZENvbnRpbnVlXSA9IGF3YWl0IGZpbmlzaGVkO1xuICAgICAgICAgICAgaWYgKCFzaG91bGRDb250aW51ZSkgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IHVwbG9hZEFsbCA9IGZhbHNlO1xuICAgICAgICAvLyBQcm9taXNlIHRvIGNvbXBsZXRlIGJlZm9yZSBzZW5kaW5nIG5leHQgZmlsZSBpbnRvIHJvb20sIHVzZWQgZm9yIHN5bmNocm9uaXNhdGlvbiBvZiBmaWxlLXNlbmRpbmdcbiAgICAgICAgLy8gdG8gbWF0Y2ggdGhlIG9yZGVyIHRoZSBmaWxlcyB3ZXJlIHNwZWNpZmllZCBpblxuICAgICAgICBsZXQgcHJvbUJlZm9yZTogUHJvbWlzZTxhbnk+ID0gUHJvbWlzZS5yZXNvbHZlKCk7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgb2tGaWxlcy5sZW5ndGg7ICsraSkge1xuICAgICAgICAgICAgY29uc3QgZmlsZSA9IG9rRmlsZXNbaV07XG4gICAgICAgICAgICBjb25zdCBsb29wUHJvbWlzZUJlZm9yZSA9IHByb21CZWZvcmU7XG5cbiAgICAgICAgICAgIGlmICghdXBsb2FkQWxsKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgeyBmaW5pc2hlZCB9ID0gTW9kYWwuY3JlYXRlRGlhbG9nPFtib29sZWFuLCBib29sZWFuXT4oVXBsb2FkQ29uZmlybURpYWxvZywge1xuICAgICAgICAgICAgICAgICAgICBmaWxlLFxuICAgICAgICAgICAgICAgICAgICBjdXJyZW50SW5kZXg6IGksXG4gICAgICAgICAgICAgICAgICAgIHRvdGFsRmlsZXM6IG9rRmlsZXMubGVuZ3RoLFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGNvbnN0IFtzaG91bGRDb250aW51ZSwgc2hvdWxkVXBsb2FkQWxsXSA9IGF3YWl0IGZpbmlzaGVkO1xuICAgICAgICAgICAgICAgIGlmICghc2hvdWxkQ29udGludWUpIGJyZWFrO1xuICAgICAgICAgICAgICAgIGlmIChzaG91bGRVcGxvYWRBbGwpIHtcbiAgICAgICAgICAgICAgICAgICAgdXBsb2FkQWxsID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHByb21CZWZvcmUgPSBkb01heWJlTG9jYWxSb29tQWN0aW9uKFxuICAgICAgICAgICAgICAgIHJvb21JZCxcbiAgICAgICAgICAgICAgICAoYWN0dWFsUm9vbUlkKSA9PiB0aGlzLnNlbmRDb250ZW50VG9Sb29tKFxuICAgICAgICAgICAgICAgICAgICBmaWxlLFxuICAgICAgICAgICAgICAgICAgICBhY3R1YWxSb29tSWQsXG4gICAgICAgICAgICAgICAgICAgIHJlbGF0aW9uLFxuICAgICAgICAgICAgICAgICAgICBtYXRyaXhDbGllbnQsXG4gICAgICAgICAgICAgICAgICAgIHJlcGx5VG9FdmVudCxcbiAgICAgICAgICAgICAgICAgICAgbG9vcFByb21pc2VCZWZvcmUsXG4gICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAocmVwbHlUb0V2ZW50KSB7XG4gICAgICAgICAgICAvLyBDbGVhciBldmVudCBiZWluZyByZXBsaWVkIHRvXG4gICAgICAgICAgICBkaXMuZGlzcGF0Y2goe1xuICAgICAgICAgICAgICAgIGFjdGlvbjogXCJyZXBseV90b19ldmVudFwiLFxuICAgICAgICAgICAgICAgIGV2ZW50OiBudWxsLFxuICAgICAgICAgICAgICAgIGNvbnRleHQsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIEZvY3VzIHRoZSBjb3JyZWN0IGNvbXBvc2VyXG4gICAgICAgIGRpcy5kaXNwYXRjaCh7XG4gICAgICAgICAgICBhY3Rpb246IEFjdGlvbi5Gb2N1c1NlbmRNZXNzYWdlQ29tcG9zZXIsXG4gICAgICAgICAgICBjb250ZXh0LFxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwdWJsaWMgZ2V0Q3VycmVudFVwbG9hZHMocmVsYXRpb24/OiBJRXZlbnRSZWxhdGlvbik6IElVcGxvYWRbXSB7XG4gICAgICAgIHJldHVybiB0aGlzLmlucHJvZ3Jlc3MuZmlsdGVyKHVwbG9hZCA9PiB7XG4gICAgICAgICAgICBjb25zdCBub1JlbGF0aW9uID0gIXJlbGF0aW9uICYmICF1cGxvYWQucmVsYXRpb247XG4gICAgICAgICAgICBjb25zdCBtYXRjaGluZ1JlbGF0aW9uID0gcmVsYXRpb24gJiYgdXBsb2FkLnJlbGF0aW9uXG4gICAgICAgICAgICAgICAgJiYgcmVsYXRpb24ucmVsX3R5cGUgPT09IHVwbG9hZC5yZWxhdGlvbi5yZWxfdHlwZVxuICAgICAgICAgICAgICAgICYmIHJlbGF0aW9uLmV2ZW50X2lkID09PSB1cGxvYWQucmVsYXRpb24uZXZlbnRfaWQ7XG5cbiAgICAgICAgICAgIHJldHVybiAobm9SZWxhdGlvbiB8fCBtYXRjaGluZ1JlbGF0aW9uKSAmJiAhdXBsb2FkLmNhbmNlbGVkO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwdWJsaWMgY2FuY2VsVXBsb2FkKHByb21pc2U6IElBYm9ydGFibGVQcm9taXNlPGFueT4sIG1hdHJpeENsaWVudDogTWF0cml4Q2xpZW50KTogdm9pZCB7XG4gICAgICAgIGNvbnN0IHVwbG9hZCA9IHRoaXMuaW5wcm9ncmVzcy5maW5kKGl0ZW0gPT4gaXRlbS5wcm9taXNlID09PSBwcm9taXNlKTtcbiAgICAgICAgaWYgKHVwbG9hZCkge1xuICAgICAgICAgICAgdXBsb2FkLmNhbmNlbGVkID0gdHJ1ZTtcbiAgICAgICAgICAgIG1hdHJpeENsaWVudC5jYW5jZWxVcGxvYWQodXBsb2FkLnByb21pc2UpO1xuICAgICAgICAgICAgZGlzLmRpc3BhdGNoPFVwbG9hZENhbmNlbGVkUGF5bG9hZD4oeyBhY3Rpb246IEFjdGlvbi5VcGxvYWRDYW5jZWxlZCwgdXBsb2FkIH0pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBzZW5kQ29udGVudFRvUm9vbShcbiAgICAgICAgZmlsZTogRmlsZSxcbiAgICAgICAgcm9vbUlkOiBzdHJpbmcsXG4gICAgICAgIHJlbGF0aW9uOiBJRXZlbnRSZWxhdGlvbiB8IHVuZGVmaW5lZCxcbiAgICAgICAgbWF0cml4Q2xpZW50OiBNYXRyaXhDbGllbnQsXG4gICAgICAgIHJlcGx5VG9FdmVudDogTWF0cml4RXZlbnQgfCB1bmRlZmluZWQsXG4gICAgICAgIHByb21CZWZvcmU6IFByb21pc2U8YW55PixcbiAgICApIHtcbiAgICAgICAgY29uc3QgY29udGVudDogT21pdDxJQ29udGVudCwgXCJpbmZvXCI+ICYgeyBpbmZvOiBQYXJ0aWFsPElNZWRpYUV2ZW50SW5mbz4gfSA9IHtcbiAgICAgICAgICAgIGJvZHk6IGZpbGUubmFtZSB8fCAnQXR0YWNobWVudCcsXG4gICAgICAgICAgICBpbmZvOiB7XG4gICAgICAgICAgICAgICAgc2l6ZTogZmlsZS5zaXplLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIG1zZ3R5cGU6IE1zZ1R5cGUuRmlsZSwgLy8gc2V0IG1vcmUgc3BlY2lmaWNhbGx5IGxhdGVyXG4gICAgICAgIH07XG5cbiAgICAgICAgYXR0YWNoUmVsYXRpb24oY29udGVudCwgcmVsYXRpb24pO1xuICAgICAgICBpZiAocmVwbHlUb0V2ZW50KSB7XG4gICAgICAgICAgICBhZGRSZXBseVRvTWVzc2FnZUNvbnRlbnQoY29udGVudCwgcmVwbHlUb0V2ZW50LCB7XG4gICAgICAgICAgICAgICAgaW5jbHVkZUxlZ2FjeUZhbGxiYWNrOiBmYWxzZSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKFNldHRpbmdzU3RvcmUuZ2V0VmFsdWUoXCJQZXJmb3JtYW5jZS5hZGRTZW5kTWVzc2FnZVRpbWluZ01ldGFkYXRhXCIpKSB7XG4gICAgICAgICAgICBkZWNvcmF0ZVN0YXJ0U2VuZGluZ1RpbWUoY29udGVudCk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBpZiB3ZSBoYXZlIGEgbWltZSB0eXBlIGZvciB0aGUgZmlsZSwgYWRkIGl0IHRvIHRoZSBtZXNzYWdlIG1ldGFkYXRhXG4gICAgICAgIGlmIChmaWxlLnR5cGUpIHtcbiAgICAgICAgICAgIGNvbnRlbnQuaW5mby5taW1ldHlwZSA9IGZpbGUudHlwZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHByb20gPSBuZXcgUHJvbWlzZTx2b2lkPigocmVzb2x2ZSkgPT4ge1xuICAgICAgICAgICAgaWYgKGZpbGUudHlwZS5pbmRleE9mKCdpbWFnZS8nKSA9PT0gMCkge1xuICAgICAgICAgICAgICAgIGNvbnRlbnQubXNndHlwZSA9IE1zZ1R5cGUuSW1hZ2U7XG4gICAgICAgICAgICAgICAgaW5mb0ZvckltYWdlRmlsZShtYXRyaXhDbGllbnQsIHJvb21JZCwgZmlsZSkudGhlbigoaW1hZ2VJbmZvKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIE9iamVjdC5hc3NpZ24oY29udGVudC5pbmZvLCBpbWFnZUluZm8pO1xuICAgICAgICAgICAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgICAgICAgICAgfSwgKGUpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgLy8gRmFpbGVkIHRvIHRodW1ibmFpbCwgZmFsbCBiYWNrIHRvIHVwbG9hZGluZyBhbiBtLmZpbGVcbiAgICAgICAgICAgICAgICAgICAgbG9nZ2VyLmVycm9yKGUpO1xuICAgICAgICAgICAgICAgICAgICBjb250ZW50Lm1zZ3R5cGUgPSBNc2dUeXBlLkZpbGU7XG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoZmlsZS50eXBlLmluZGV4T2YoJ2F1ZGlvLycpID09PSAwKSB7XG4gICAgICAgICAgICAgICAgY29udGVudC5tc2d0eXBlID0gTXNnVHlwZS5BdWRpbztcbiAgICAgICAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGZpbGUudHlwZS5pbmRleE9mKCd2aWRlby8nKSA9PT0gMCkge1xuICAgICAgICAgICAgICAgIGNvbnRlbnQubXNndHlwZSA9IE1zZ1R5cGUuVmlkZW87XG4gICAgICAgICAgICAgICAgaW5mb0ZvclZpZGVvRmlsZShtYXRyaXhDbGllbnQsIHJvb21JZCwgZmlsZSkudGhlbigodmlkZW9JbmZvKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIE9iamVjdC5hc3NpZ24oY29udGVudC5pbmZvLCB2aWRlb0luZm8pO1xuICAgICAgICAgICAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgICAgICAgICAgfSwgKGUpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgLy8gRmFpbGVkIHRvIHRodW1ibmFpbCwgZmFsbCBiYWNrIHRvIHVwbG9hZGluZyBhbiBtLmZpbGVcbiAgICAgICAgICAgICAgICAgICAgbG9nZ2VyLmVycm9yKGUpO1xuICAgICAgICAgICAgICAgICAgICBjb250ZW50Lm1zZ3R5cGUgPSBNc2dUeXBlLkZpbGU7XG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgY29udGVudC5tc2d0eXBlID0gTXNnVHlwZS5GaWxlO1xuICAgICAgICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSkgYXMgSUFib3J0YWJsZVByb21pc2U8dm9pZD47XG5cbiAgICAgICAgLy8gY3JlYXRlIHRlbXBvcmFyeSBhYm9ydCBoYW5kbGVyIGZvciBiZWZvcmUgdGhlIGFjdHVhbCB1cGxvYWQgZ2V0cyBwYXNzZWQgb2ZmIHRvIGpzLXNka1xuICAgICAgICBwcm9tLmFib3J0ID0gKCkgPT4ge1xuICAgICAgICAgICAgdXBsb2FkLmNhbmNlbGVkID0gdHJ1ZTtcbiAgICAgICAgfTtcblxuICAgICAgICBjb25zdCB1cGxvYWQ6IElVcGxvYWQgPSB7XG4gICAgICAgICAgICBmaWxlTmFtZTogZmlsZS5uYW1lIHx8ICdBdHRhY2htZW50JyxcbiAgICAgICAgICAgIHJvb21JZCxcbiAgICAgICAgICAgIHJlbGF0aW9uLFxuICAgICAgICAgICAgdG90YWw6IGZpbGUuc2l6ZSxcbiAgICAgICAgICAgIGxvYWRlZDogMCxcbiAgICAgICAgICAgIHByb21pc2U6IHByb20sXG4gICAgICAgIH07XG4gICAgICAgIHRoaXMuaW5wcm9ncmVzcy5wdXNoKHVwbG9hZCk7XG4gICAgICAgIGRpcy5kaXNwYXRjaDxVcGxvYWRTdGFydGVkUGF5bG9hZD4oeyBhY3Rpb246IEFjdGlvbi5VcGxvYWRTdGFydGVkLCB1cGxvYWQgfSk7XG5cbiAgICAgICAgZnVuY3Rpb24gb25Qcm9ncmVzcyhldikge1xuICAgICAgICAgICAgdXBsb2FkLnRvdGFsID0gZXYudG90YWw7XG4gICAgICAgICAgICB1cGxvYWQubG9hZGVkID0gZXYubG9hZGVkO1xuICAgICAgICAgICAgZGlzLmRpc3BhdGNoPFVwbG9hZFByb2dyZXNzUGF5bG9hZD4oeyBhY3Rpb246IEFjdGlvbi5VcGxvYWRQcm9ncmVzcywgdXBsb2FkIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IGVycm9yOiBNYXRyaXhFcnJvcjtcbiAgICAgICAgcmV0dXJuIHByb20udGhlbigoKSA9PiB7XG4gICAgICAgICAgICBpZiAodXBsb2FkLmNhbmNlbGVkKSB0aHJvdyBuZXcgVXBsb2FkQ2FuY2VsZWRFcnJvcigpO1xuICAgICAgICAgICAgLy8gWFhYOiB1cGxvYWQucHJvbWlzZSBtdXN0IGJlIHRoZSBwcm9taXNlIHRoYXRcbiAgICAgICAgICAgIC8vIGlzIHJldHVybmVkIGJ5IHVwbG9hZEZpbGUgYXMgaXQgaGFzIGFuIGFib3J0KClcbiAgICAgICAgICAgIC8vIG1ldGhvZCBoYWNrZWQgb250byBpdC5cbiAgICAgICAgICAgIHVwbG9hZC5wcm9taXNlID0gdXBsb2FkRmlsZShtYXRyaXhDbGllbnQsIHJvb21JZCwgZmlsZSwgb25Qcm9ncmVzcyk7XG4gICAgICAgICAgICByZXR1cm4gdXBsb2FkLnByb21pc2UudGhlbihmdW5jdGlvbihyZXN1bHQpIHtcbiAgICAgICAgICAgICAgICBjb250ZW50LmZpbGUgPSByZXN1bHQuZmlsZTtcbiAgICAgICAgICAgICAgICBjb250ZW50LnVybCA9IHJlc3VsdC51cmw7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSkudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAvLyBBd2FpdCBwcmV2aW91cyBtZXNzYWdlIGJlaW5nIHNlbnQgaW50byB0aGUgcm9vbVxuICAgICAgICAgICAgcmV0dXJuIHByb21CZWZvcmU7XG4gICAgICAgIH0pLnRoZW4oZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBpZiAodXBsb2FkLmNhbmNlbGVkKSB0aHJvdyBuZXcgVXBsb2FkQ2FuY2VsZWRFcnJvcigpO1xuICAgICAgICAgICAgY29uc3QgdGhyZWFkSWQgPSByZWxhdGlvbj8ucmVsX3R5cGUgPT09IFRIUkVBRF9SRUxBVElPTl9UWVBFLm5hbWVcbiAgICAgICAgICAgICAgICA/IHJlbGF0aW9uLmV2ZW50X2lkXG4gICAgICAgICAgICAgICAgOiBudWxsO1xuICAgICAgICAgICAgY29uc3QgcHJvbSA9IG1hdHJpeENsaWVudC5zZW5kTWVzc2FnZShyb29tSWQsIHRocmVhZElkLCBjb250ZW50KTtcbiAgICAgICAgICAgIGlmIChTZXR0aW5nc1N0b3JlLmdldFZhbHVlKFwiUGVyZm9ybWFuY2UuYWRkU2VuZE1lc3NhZ2VUaW1pbmdNZXRhZGF0YVwiKSkge1xuICAgICAgICAgICAgICAgIHByb20udGhlbihyZXNwID0+IHtcbiAgICAgICAgICAgICAgICAgICAgc2VuZFJvdW5kVHJpcE1ldHJpYyhtYXRyaXhDbGllbnQsIHJvb21JZCwgcmVzcC5ldmVudF9pZCk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcHJvbTtcbiAgICAgICAgfSwgZnVuY3Rpb24oZXJyOiBNYXRyaXhFcnJvcikge1xuICAgICAgICAgICAgZXJyb3IgPSBlcnI7XG4gICAgICAgICAgICBpZiAoIXVwbG9hZC5jYW5jZWxlZCkge1xuICAgICAgICAgICAgICAgIGxldCBkZXNjID0gX3QoXCJUaGUgZmlsZSAnJShmaWxlTmFtZSlzJyBmYWlsZWQgdG8gdXBsb2FkLlwiLCB7IGZpbGVOYW1lOiB1cGxvYWQuZmlsZU5hbWUgfSk7XG4gICAgICAgICAgICAgICAgaWYgKGVyci5odHRwU3RhdHVzID09PSA0MTMpIHtcbiAgICAgICAgICAgICAgICAgICAgZGVzYyA9IF90KFxuICAgICAgICAgICAgICAgICAgICAgICAgXCJUaGUgZmlsZSAnJShmaWxlTmFtZSlzJyBleGNlZWRzIHRoaXMgaG9tZXNlcnZlcidzIHNpemUgbGltaXQgZm9yIHVwbG9hZHNcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIHsgZmlsZU5hbWU6IHVwbG9hZC5maWxlTmFtZSB9LFxuICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBNb2RhbC5jcmVhdGVEaWFsb2coRXJyb3JEaWFsb2csIHtcbiAgICAgICAgICAgICAgICAgICAgdGl0bGU6IF90KCdVcGxvYWQgRmFpbGVkJyksXG4gICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBkZXNjLFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KS5maW5hbGx5KCgpID0+IHtcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5pbnByb2dyZXNzLmxlbmd0aDsgKytpKSB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuaW5wcm9ncmVzc1tpXS5wcm9taXNlID09PSB1cGxvYWQucHJvbWlzZSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmlucHJvZ3Jlc3Muc3BsaWNlKGksIDEpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoZXJyb3IpIHtcbiAgICAgICAgICAgICAgICAvLyA0MTM6IEZpbGUgd2FzIHRvbyBiaWcgb3IgdXBzZXQgdGhlIHNlcnZlciBpbiBzb21lIHdheTpcbiAgICAgICAgICAgICAgICAvLyBjbGVhciB0aGUgbWVkaWEgc2l6ZSBsaW1pdCBzbyB3ZSBmZXRjaCBpdCBhZ2FpbiBuZXh0IHRpbWVcbiAgICAgICAgICAgICAgICAvLyB3ZSB0cnkgdG8gdXBsb2FkXG4gICAgICAgICAgICAgICAgaWYgKGVycm9yPy5odHRwU3RhdHVzID09PSA0MTMpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5tZWRpYUNvbmZpZyA9IG51bGw7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGRpcy5kaXNwYXRjaDxVcGxvYWRFcnJvclBheWxvYWQ+KHsgYWN0aW9uOiBBY3Rpb24uVXBsb2FkRmFpbGVkLCB1cGxvYWQsIGVycm9yIH0pO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBkaXMuZGlzcGF0Y2g8VXBsb2FkRmluaXNoZWRQYXlsb2FkPih7IGFjdGlvbjogQWN0aW9uLlVwbG9hZEZpbmlzaGVkLCB1cGxvYWQgfSk7XG4gICAgICAgICAgICAgICAgZGlzLmRpc3BhdGNoKHsgYWN0aW9uOiAnbWVzc2FnZV9zZW50JyB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBpc0ZpbGVTaXplQWNjZXB0YWJsZShmaWxlOiBGaWxlKSB7XG4gICAgICAgIGlmICh0aGlzLm1lZGlhQ29uZmlnICE9PSBudWxsICYmXG4gICAgICAgICAgICB0aGlzLm1lZGlhQ29uZmlnW1wibS51cGxvYWQuc2l6ZVwiXSAhPT0gdW5kZWZpbmVkICYmXG4gICAgICAgICAgICBmaWxlLnNpemUgPiB0aGlzLm1lZGlhQ29uZmlnW1wibS51cGxvYWQuc2l6ZVwiXSkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIHByaXZhdGUgZW5zdXJlTWVkaWFDb25maWdGZXRjaGVkKG1hdHJpeENsaWVudDogTWF0cml4Q2xpZW50KTogUHJvbWlzZTx2b2lkPiB7XG4gICAgICAgIGlmICh0aGlzLm1lZGlhQ29uZmlnICE9PSBudWxsKSByZXR1cm47XG5cbiAgICAgICAgbG9nZ2VyLmxvZyhcIltNZWRpYSBDb25maWddIEZldGNoaW5nXCIpO1xuICAgICAgICByZXR1cm4gbWF0cml4Q2xpZW50LmdldE1lZGlhQ29uZmlnKCkudGhlbigoY29uZmlnKSA9PiB7XG4gICAgICAgICAgICBsb2dnZXIubG9nKFwiW01lZGlhIENvbmZpZ10gRmV0Y2hlZCBjb25maWc6XCIsIGNvbmZpZyk7XG4gICAgICAgICAgICByZXR1cm4gY29uZmlnO1xuICAgICAgICB9KS5jYXRjaCgoKSA9PiB7XG4gICAgICAgICAgICAvLyBNZWRpYSByZXBvIGNhbid0IG9yIHdvbid0IHJlcG9ydCBsaW1pdHMsIHNvIHByb3ZpZGUgYW4gZW1wdHkgb2JqZWN0IChubyBsaW1pdHMpLlxuICAgICAgICAgICAgbG9nZ2VyLmxvZyhcIltNZWRpYSBDb25maWddIENvdWxkIG5vdCBmZXRjaCBjb25maWcsIHNvIG5vdCBsaW1pdGluZyB1cGxvYWRzLlwiKTtcbiAgICAgICAgICAgIHJldHVybiB7fTtcbiAgICAgICAgfSkudGhlbigoY29uZmlnKSA9PiB7XG4gICAgICAgICAgICB0aGlzLm1lZGlhQ29uZmlnID0gY29uZmlnO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBzdGF0aWMgc2hhcmVkSW5zdGFuY2UoKSB7XG4gICAgICAgIGlmICh3aW5kb3cubXhDb250ZW50TWVzc2FnZXMgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgd2luZG93Lm14Q29udGVudE1lc3NhZ2VzID0gbmV3IENvbnRlbnRNZXNzYWdlcygpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB3aW5kb3cubXhDb250ZW50TWVzc2FnZXM7XG4gICAgfVxufVxuIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFvQkE7O0FBQ0E7O0FBQ0E7O0FBRUE7O0FBRUE7O0FBR0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBU0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7Ozs7OztBQUVBO0FBQ0E7QUFDQSxNQUFNQSxVQUFVLEdBQUcsQ0FBQyxJQUFELEVBQU8sSUFBUCxFQUFhLElBQWIsRUFBbUIsSUFBbkIsRUFBeUIsSUFBekIsRUFBK0IsSUFBL0IsRUFBcUMsSUFBckMsRUFBMkMsSUFBM0MsRUFBaUQsSUFBakQsQ0FBbkI7O0FBRU8sTUFBTUMsbUJBQU4sU0FBa0NDLEtBQWxDLENBQXdDOzs7O0FBYy9DO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGVBQWVDLGdCQUFmLENBQWdDQyxTQUFoQyxFQUFpRDtFQUM3QztFQUNBLE1BQU1DLEdBQUcsR0FBR0MsUUFBUSxDQUFDQyxhQUFULENBQXVCLEtBQXZCLENBQVo7RUFDQSxNQUFNQyxTQUFTLEdBQUdDLEdBQUcsQ0FBQ0MsZUFBSixDQUFvQk4sU0FBcEIsQ0FBbEI7RUFDQSxNQUFNTyxVQUFVLEdBQUcsSUFBSUMsT0FBSixDQUFZLENBQUNDLE9BQUQsRUFBVUMsTUFBVixL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