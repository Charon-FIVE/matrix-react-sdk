"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.presentableTextForFile = presentableTextForFile;

var _filesize = _interopRequireDefault(require("filesize"));

var _languageHandler = require("../languageHandler");

/*
Copyright 2015 - 2021 The Matrix.org Foundation C.I.C.
Copyright 2021 Šimon Brandner <simon.bra.ag@gmail.com>

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

/**
 * Extracts a human readable label for the file attachment to use as
 * link text.
 *
 * @param {IMediaEventContent} content The "content" key of the matrix event.
 * @param {string} fallbackText The fallback text
 * @param {boolean} withSize Whether to include size information. Default true.
 * @param {boolean} shortened Ensure the extension of the file name is visible. Default false.
 * @return {string} the human readable link text for the attachment.
 */
function presentableTextForFile(content) {
  let fallbackText = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : (0, _languageHandler._t)("Attachment");
  let withSize = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;
  let shortened = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;
  let text = fallbackText;

  if (content.body?.length > 0) {
    // The content body should be the name of the file including a
    // file extension.
    text = content.body;
  } // We shorten to 15 characters somewhat arbitrarily, and assume most files
  // will have a 3 character (plus full stop) extension. The goal is to knock
  // the label down to 15-25 characters, not perfect accuracy.


  if (shortened && text.length > 19) {
    const parts = text.split('.');
    let fileName = parts.slice(0, parts.length - 1).join('.').substring(0, 15);
    const extension = parts[parts.length - 1]; // Trim off any full stops from the file name to avoid a case where we
    // add an ellipsis that looks really funky.

    fileName = fileName.replace(/\.*$/g, '');
    text = `${fileName}...${extension}`;
  }

  if (content.info?.size && withSize) {
    // If we know the size of the file then add it as human readable
    // string to the end of the link text so that the user knows how
    // big a file they are downloading.
    // The content.info also contains a MIME-type but we don't display
    // it since it is "ugly", users generally aren't aware what it
    // means and the type of the attachment can usually be inferred
    // from the file extension.
    text += ' (' + (0, _filesize.default)(content.info.size) + ')';
  }

  return text;
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJwcmVzZW50YWJsZVRleHRGb3JGaWxlIiwiY29udGVudCIsImZhbGxiYWNrVGV4dCIsIl90Iiwid2l0aFNpemUiLCJzaG9ydGVuZWQiLCJ0ZXh0IiwiYm9keSIsImxlbmd0aCIsInBhcnRzIiwic3BsaXQiLCJmaWxlTmFtZSIsInNsaWNlIiwiam9pbiIsInN1YnN0cmluZyIsImV4dGVuc2lvbiIsInJlcGxhY2UiLCJpbmZvIiwic2l6ZSIsImZpbGVzaXplIl0sInNvdXJjZXMiOlsiLi4vLi4vc3JjL3V0aWxzL0ZpbGVVdGlscy50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMTUgLSAyMDIxIFRoZSBNYXRyaXgub3JnIEZvdW5kYXRpb24gQy5JLkMuXG5Db3B5cmlnaHQgMjAyMSDFoGltb24gQnJhbmRuZXIgPHNpbW9uLmJyYS5hZ0BnbWFpbC5jb20+XG5cbkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG55b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cblxuaW1wb3J0IGZpbGVzaXplIGZyb20gJ2ZpbGVzaXplJztcblxuaW1wb3J0IHsgSU1lZGlhRXZlbnRDb250ZW50IH0gZnJvbSAnLi4vY3VzdG9taXNhdGlvbnMvbW9kZWxzL0lNZWRpYUV2ZW50Q29udGVudCc7XG5pbXBvcnQgeyBfdCB9IGZyb20gJy4uL2xhbmd1YWdlSGFuZGxlcic7XG5cbi8qKlxuICogRXh0cmFjdHMgYSBodW1hbiByZWFkYWJsZSBsYWJlbCBmb3IgdGhlIGZpbGUgYXR0YWNobWVudCB0byB1c2UgYXNcbiAqIGxpbmsgdGV4dC5cbiAqXG4gKiBAcGFyYW0ge0lNZWRpYUV2ZW50Q29udGVudH0gY29udGVudCBUaGUgXCJjb250ZW50XCIga2V5IG9mIHRoZSBtYXRyaXggZXZlbnQuXG4gKiBAcGFyYW0ge3N0cmluZ30gZmFsbGJhY2tUZXh0IFRoZSBmYWxsYmFjayB0ZXh0XG4gKiBAcGFyYW0ge2Jvb2xlYW59IHdpdGhTaXplIFdoZXRoZXIgdG8gaW5jbHVkZSBzaXplIGluZm9ybWF0aW9uLiBEZWZhdWx0IHRydWUuXG4gKiBAcGFyYW0ge2Jvb2xlYW59IHNob3J0ZW5lZCBFbnN1cmUgdGhlIGV4dGVuc2lvbiBvZiB0aGUgZmlsZSBuYW1lIGlzIHZpc2libGUuIERlZmF1bHQgZmFsc2UuXG4gKiBAcmV0dXJuIHtzdHJpbmd9IHRoZSBodW1hbiByZWFkYWJsZSBsaW5rIHRleHQgZm9yIHRoZSBhdHRhY2htZW50LlxuICovXG5leHBvcnQgZnVuY3Rpb24gcHJlc2VudGFibGVUZXh0Rm9yRmlsZShcbiAgICBjb250ZW50OiBJTWVkaWFFdmVudENvbnRlbnQsXG4gICAgZmFsbGJhY2tUZXh0ID0gX3QoXCJBdHRhY2htZW50XCIpLFxuICAgIHdpdGhTaXplID0gdHJ1ZSxcbiAgICBzaG9ydGVuZWQgPSBmYWxzZSxcbik6IHN0cmluZyB7XG4gICAgbGV0IHRleHQgPSBmYWxsYmFja1RleHQ7XG4gICAgaWYgKGNvbnRlbnQuYm9keT8ubGVuZ3RoID4gMCkge1xuICAgICAgICAvLyBUaGUgY29udGVudCBib2R5IHNob3VsZCBiZSB0aGUgbmFtZSBvZiB0aGUgZmlsZSBpbmNsdWRpbmcgYVxuICAgICAgICAvLyBmaWxlIGV4dGVuc2lvbi5cbiAgICAgICAgdGV4dCA9IGNvbnRlbnQuYm9keTtcbiAgICB9XG5cbiAgICAvLyBXZSBzaG9ydGVuIHRvIDE1IGNoYXJhY3RlcnMgc29tZXdoYXQgYXJiaXRyYXJpbHksIGFuZCBhc3N1bWUgbW9zdCBmaWxlc1xuICAgIC8vIHdpbGwgaGF2ZSBhIDMgY2hhcmFjdGVyIChwbHVzIGZ1bGwgc3RvcCkgZXh0ZW5zaW9uLiBUaGUgZ29hbCBpcyB0byBrbm9ja1xuICAgIC8vIHRoZSBsYWJlbCBkb3duIHRvIDE1LTI1IGNoYXJhY3RlcnMsIG5vdCBwZXJmZWN0IGFjY3VyYWN5LlxuICAgIGlmIChzaG9ydGVuZWQgJiYgdGV4dC5sZW5ndGggPiAxOSkge1xuICAgICAgICBjb25zdCBwYXJ0cyA9IHRleHQuc3BsaXQoJy4nKTtcbiAgICAgICAgbGV0IGZpbGVOYW1lID0gcGFydHMuc2xpY2UoMCwgcGFydHMubGVuZ3RoIC0gMSkuam9pbignLicpLnN1YnN0cmluZygwLCAxNSk7XG4gICAgICAgIGNvbnN0IGV4dGVuc2lvbiA9IHBhcnRzW3BhcnRzLmxlbmd0aCAtIDFdO1xuXG4gICAgICAgIC8vIFRyaW0gb2ZmIGFueSBmdWxsIHN0b3BzIGZyb20gdGhlIGZpbGUgbmFtZSB0byBhdm9pZCBhIGNhc2Ugd2hlcmUgd2VcbiAgICAgICAgLy8gYWRkIGFuIGVsbGlwc2lzIHRoYXQgbG9va3MgcmVhbGx5IGZ1bmt5LlxuICAgICAgICBmaWxlTmFtZSA9IGZpbGVOYW1lLnJlcGxhY2UoL1xcLiokL2csICcnKTtcblxuICAgICAgICB0ZXh0ID0gYCR7ZmlsZU5hbWV9Li4uJHtleHRlbnNpb259YDtcbiAgICB9XG5cbiAgICBpZiAoY29udGVudC5pbmZvPy5zaXplICYmIHdpdGhTaXplKSB7XG4gICAgICAgIC8vIElmIHdlIGtub3cgdGhlIHNpemUgb2YgdGhlIGZpbGUgdGhlbiBhZGQgaXQgYXMgaHVtYW4gcmVhZGFibGVcbiAgICAgICAgLy8gc3RyaW5nIHRvIHRoZSBlbmQgb2YgdGhlIGxpbmsgdGV4dCBzbyB0aGF0IHRoZSB1c2VyIGtub3dzIGhvd1xuICAgICAgICAvLyBiaWcgYSBmaWxlIHRoZXkgYXJlIGRvd25sb2FkaW5nLlxuICAgICAgICAvLyBUaGUgY29udGVudC5pbmZvIGFsc28gY29udGFpbnMgYSBNSU1FLXR5cGUgYnV0IHdlIGRvbid0IGRpc3BsYXlcbiAgICAgICAgLy8gaXQgc2luY2UgaXQgaXMgXCJ1Z2x5XCIsIHVzZXJzIGdlbmVyYWxseSBhcmVuJ3QgYXdhcmUgd2hhdCBpdFxuICAgICAgICAvLyBtZWFucyBhbmQgdGhlIHR5cGUgb2YgdGhlIGF0dGFjaG1lbnQgY2FuIHVzdWFsbHkgYmUgaW5mZXJyZWRcbiAgICAgICAgLy8gZnJvbSB0aGUgZmlsZSBleHRlbnNpb24uXG4gICAgICAgIHRleHQgKz0gJyAoJyArIGZpbGVzaXplKGNvbnRlbnQuaW5mby5zaXplKSArICcpJztcbiAgICB9XG4gICAgcmV0dXJuIHRleHQ7XG59XG4iXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztBQWlCQTs7QUFHQTs7QUFwQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBT0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDTyxTQUFTQSxzQkFBVCxDQUNIQyxPQURHLEVBS0c7RUFBQSxJQUhOQyxZQUdNLHVFQUhTLElBQUFDLG1CQUFBLEVBQUcsWUFBSCxDQUdUO0VBQUEsSUFGTkMsUUFFTSx1RUFGSyxJQUVMO0VBQUEsSUFETkMsU0FDTSx1RUFETSxLQUNOO0VBQ04sSUFBSUMsSUFBSSxHQUFHSixZQUFYOztFQUNBLElBQUlELE9BQU8sQ0FBQ00sSUFBUixFQUFjQyxNQUFkLEdBQXVCLENBQTNCLEVBQThCO0lBQzFCO0lBQ0E7SUFDQUYsSUFBSSxHQUFHTCxPQUFPLENBQUNNLElBQWY7RUFDSCxDQU5LLENBUU47RUFDQTtFQUNBOzs7RUFDQSxJQUFJRixTQUFTLElBQUlDLElBQUksQ0FBQ0UsTUFBTCxHQUFjLEVBQS9CLEVBQW1DO0lBQy9CLE1BQU1DLEtBQUssR0FBR0gsSUFBSSxDQUFDSSxLQUFMLENBQVcsR0FBWCxDQUFkO0lBQ0EsSUFBSUMsUUFBUSxHQUFHRixLQUFLLENBQUNHLEtBQU4sQ0FBWSxDQUFaLEVBQWVILEtBQUssQ0FBQ0QsTUFBTixHQUFlLENBQTlCLEVBQWlDSyxJQUFqQyxDQUFzQyxHQUF0QyxFQUEyQ0MsU0FBM0MsQ0FBcUQsQ0FBckQsRUFBd0QsRUFBeEQsQ0FBZjtJQUNBLE1BQU1DLFNBQVMsR0FBR04sS0FBSyxDQUFDQSxLQUFLLENBQUNELE1BQU4sR0FBZSxDQUFoQixDQUF2QixDQUgrQixDQUsvQjtJQUNBOztJQUNBRyxRQUFRLEdBQUdBLFFBQVEsQ0FBQ0ssT0FBVCxDQUFpQixPQUFqQixFQUEwQixFQUExQixDQUFYO0lBRUFWLElBQUksR0FBSSxHQUFFSyxRQUFTLE1BQUtJLFNBQVUsRUFBbEM7RUFDSDs7RUFFRCxJQUFJZCxPQUFPLENBQUNnQixJQUFSLEVBQWNDLElBQWQsSUFBc0JkLFFBQTFCLEVBQW9DO0lBQ2hDO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0FFLElBQUksSUFBSSxPQUFPLElBQUFhLGlCQUFBLEVBQVNsQixPQUFPLENBQUNnQixJQUFSLENBQWFDLElBQXRCLENBQVAsR0FBcUMsR0FBN0M7RUFDSDs7RUFDRCxPQUFPWixJQUFQO0FBQ0gifQ==