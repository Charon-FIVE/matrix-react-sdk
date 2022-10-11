"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _diff = require("./diff");

var _position = _interopRequireDefault(require("./position"));

var _range = _interopRequireDefault(require("./range"));

/*
Copyright 2019 New Vector Ltd
Copyright 2019 The Matrix.org Foundation C.I.C.

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
class EditorModel {
  constructor(parts, partCreator) {
    let updateCallback = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
    this.updateCallback = updateCallback;
    (0, _defineProperty2.default)(this, "_parts", void 0);
    (0, _defineProperty2.default)(this, "_partCreator", void 0);
    (0, _defineProperty2.default)(this, "activePartIdx", null);
    (0, _defineProperty2.default)(this, "_autoComplete", null);
    (0, _defineProperty2.default)(this, "autoCompletePartIdx", null);
    (0, _defineProperty2.default)(this, "autoCompletePartCount", 0);
    (0, _defineProperty2.default)(this, "transformCallback", null);
    (0, _defineProperty2.default)(this, "onAutoComplete", _ref => {
      let {
        replaceParts,
        close
      } = _ref;
      let pos;

      if (replaceParts) {
        this._parts.splice(this.autoCompletePartIdx, this.autoCompletePartCount, ...replaceParts);

        this.autoCompletePartCount = replaceParts.length;
        const lastPart = replaceParts[replaceParts.length - 1];
        const lastPartIndex = this.autoCompletePartIdx + replaceParts.length - 1;
        pos = new _position.default(lastPartIndex, lastPart.text.length);
      }

      if (close) {
        this._autoComplete = null;
        this.autoCompletePartIdx = null;
        this.autoCompletePartCount = 0;
      } // rerender even if editor contents didn't change
      // to make sure the MessageEditor checks
      // model.autoComplete being empty and closes it


      this.updateCallback(pos);
    });
    this._parts = parts;
    this._partCreator = partCreator;
    this.transformCallback = null;
  }
  /**
   * Set a callback for the transformation step.
   * While processing an update, right before calling the update callback,
   * a transform callback can be called, which serves to do modifications
   * on the model that can span multiple parts. Also see `startRange()`.
   * @param {TransformCallback} transformCallback
   */


  setTransformCallback(transformCallback) {
    this.transformCallback = transformCallback;
  }
  /**
   * Set a callback for rerendering the model after it has been updated.
   * @param {ModelCallback} updateCallback
   */


  setUpdateCallback(updateCallback) {
    this.updateCallback = updateCallback;
  }

  get partCreator() {
    return this._partCreator;
  }

  get isEmpty() {
    return this._parts.reduce((len, part) => len + part.text.length, 0) === 0;
  }

  clone() {
    const clonedParts = this.parts.map(p => this.partCreator.deserializePart(p.serialize()));
    return new EditorModel(clonedParts, this._partCreator, this.updateCallback);
  }

  insertPart(index, part) {
    this._parts.splice(index, 0, part);

    if (this.activePartIdx >= index) {
      ++this.activePartIdx;
    }

    if (this.autoCompletePartIdx >= index) {
      ++this.autoCompletePartIdx;
    }
  }

  removePart(index) {
    this._parts.splice(index, 1);

    if (index === this.activePartIdx) {
      this.activePartIdx = null;
    } else if (this.activePartIdx > index) {
      --this.activePartIdx;
    }

    if (index === this.autoCompletePartIdx) {
      this.autoCompletePartIdx = null;
    } else if (this.autoCompletePartIdx > index) {
      --this.autoCompletePartIdx;
    }
  }

  replacePart(index, part) {
    this._parts.splice(index, 1, part);
  }

  get parts() {
    return this._parts;
  }

  get autoComplete() {
    if (this.activePartIdx === this.autoCompletePartIdx) {
      return this._autoComplete;
    }

    return null;
  }

  getPositionAtEnd() {
    if (this._parts.length) {
      const index = this._parts.length - 1;
      const part = this._parts[index];
      return new _position.default(index, part.text.length);
    } else {
      // part index -1, as there are no parts to point at
      return new _position.default(-1, 0);
    }
  }

  serializeParts() {
    return this._parts.map(p => p.serialize());
  }

  diff(newValue, inputType, caret) {
    const previousValue = this.parts.reduce((text, p) => text + p.text, ""); // can't use caret position with drag and drop

    if (inputType === "deleteByDrag") {
      return (0, _diff.diffDeletion)(previousValue, newValue);
    } else {
      return (0, _diff.diffAtCaret)(previousValue, newValue, caret.offset);
    }
  }

  reset(serializedParts, caret, inputType) {
    this._parts = serializedParts.map(p => this._partCreator.deserializePart(p));

    if (!caret) {
      caret = this.getPositionAtEnd();
    } // close auto complete if open
    // this would happen when clearing the composer after sending
    // a message with the autocomplete still open


    if (this._autoComplete) {
      this._autoComplete = null;
      this.autoCompletePartIdx = null;
    }

    this.updateCallback(caret, inputType);
  }
  /**
   * Inserts the given parts at the given position.
   * Should be run inside a `model.transform()` callback.
   * @param {Part[]} parts the parts to replace the range with
   * @param {DocumentPosition} position the position to start inserting at
   * @return {Number} the amount of characters added
   */


  insert(parts, position) {
    const insertIndex = this.splitAt(position);
    let newTextLength = 0;

    for (let i = 0; i < parts.length; ++i) {
      const part = parts[i];
      newTextLength += part.text.length;
      this.insertPart(insertIndex + i, part);
    }

    return newTextLength;
  }

  update(newValue, inputType, caret) {
    const diff = this.diff(newValue, inputType, caret);
    const position = this.positionForOffset(diff.at, caret.atNodeEnd);
    let removedOffsetDecrease = 0;

    if (diff.removed) {
      removedOffsetDecrease = this.removeText(position, diff.removed.length);
    }

    let addedLen = 0;

    if (diff.added) {
      addedLen = this.addText(position, diff.added, inputType);
    }

    this.mergeAdjacentParts();
    const caretOffset = diff.at - removedOffsetDecrease + addedLen;
    let newPosition = this.positionForOffset(caretOffset, true);
    const canOpenAutoComplete = inputType !== "insertFromPaste" && inputType !== "insertFromDrop";
    const acPromise = this.setActivePart(newPosition, canOpenAutoComplete);

    if (this.transformCallback) {
      const transformAddedLen = this.getTransformAddedLen(newPosition, inputType, diff);
      newPosition = this.positionForOffset(caretOffset + transformAddedLen, true);
    }

    this.updateCallback(newPosition, inputType, diff);
    return acPromise;
  }

  getTransformAddedLen(newPosition, inputType, diff) {
    const result = this.transformCallback(newPosition, inputType, diff);
    return Number.isFinite(result) ? result : 0;
  }

  setActivePart(pos, canOpenAutoComplete) {
    const {
      index
    } = pos;
    const part = this._parts[index];

    if (part) {
      if (index !== this.activePartIdx) {
        this.activePartIdx = index;

        if (canOpenAutoComplete && this.activePartIdx !== this.autoCompletePartIdx) {
          // else try to create one
          const ac = part.createAutoComplete(this.onAutoComplete);

          if (ac) {
            // make sure that react picks up the difference between both acs
            this._autoComplete = ac;
            this.autoCompletePartIdx = index;
            this.autoCompletePartCount = 1;
          }
        }
      } // not autoComplete, only there if active part is autocomplete part


      if (this.autoComplete) {
        return this.autoComplete.onPartUpdate(part, pos);
      }
    } else {
      this.activePartIdx = null;
      this._autoComplete = null;
      this.autoCompletePartIdx = null;
      this.autoCompletePartCount = 0;
    }

    return Promise.resolve();
  }

  mergeAdjacentParts() {
    let prevPart;

    for (let i = 0; i < this._parts.length; ++i) {
      let part = this._parts[i];
      const isEmpty = !part.text.length;
      const isMerged = !isEmpty && prevPart && prevPart.merge(part);

      if (isEmpty || isMerged) {
        // remove empty or merged part
        part = prevPart;
        this.removePart(i); //repeat this index, as it's removed now

        --i;
      }

      prevPart = part;
    }
  }
  /**
   * removes `len` amount of characters at `pos`.
   * @param {Object} pos
   * @param {Number} len
   * @return {Number} how many characters before pos were also removed,
   * usually because of non-editable parts that can only be removed in their entirety.
   */


  removeText(pos, len) {
    let {
      index,
      offset
    } = pos;
    let removedOffsetDecrease = 0;

    while (len > 0) {
      // part might be undefined here
      let part = this._parts[index];
      const amount = Math.min(len, part.text.length - offset); // don't allow 0 amount deletions

      if (amount) {
        if (part.canEdit) {
          const replaceWith = part.remove(offset, amount);

          if (typeof replaceWith === "string") {
            this.replacePart(index, this._partCreator.createDefaultPart(replaceWith));
          }

          part = this._parts[index]; // remove empty part

          if (!part.text.length) {
            this.removePart(index);
          } else {
            index += 1;
          }
        } else {
          removedOffsetDecrease += offset;
          this.removePart(index);
        }
      } else {
        index += 1;
      }

      len -= amount;
      offset = 0;
    }

    return removedOffsetDecrease;
  } // return part index where insertion will insert between at offset


  splitAt(pos) {
    if (pos.index === -1) {
      return 0;
    }

    if (pos.offset === 0) {
      return pos.index;
    }

    const part = this._parts[pos.index];

    if (pos.offset >= part.text.length) {
      return pos.index + 1;
    }

    const secondPart = part.split(pos.offset);
    this.insertPart(pos.index + 1, secondPart);
    return pos.index + 1;
  }
  /**
   * inserts `str` into the model at `pos`.
   * @param {Object} pos
   * @param {string} str
   * @param {string} inputType the source of the input, see html InputEvent.inputType
   * @return {Number} how far from position (in characters) the insertion ended.
   * This can be more than the length of `str` when crossing non-editable parts, which are skipped.
   */


  addText(pos, str, inputType) {
    let {
      index
    } = pos;
    const {
      offset
    } = pos;
    let addLen = str.length;
    const part = this._parts[index];

    if (part) {
      if (part.canEdit) {
        if (part.validateAndInsert(offset, str, inputType)) {
          str = null;
        } else {
          const splitPart = part.split(offset);
          index += 1;
          this.insertPart(index, splitPart);
        }
      } else if (offset !== 0) {
        // not-editable part, caret is not at start,
        // so insert str after this part
        addLen += part.text.length - offset;
        index += 1;
      }
    } else if (index < 0) {
      // if position was not found (index: -1, as happens for empty editor)
      // reset it to insert as first part
      index = 0;
    }

    while (str) {
      const newPart = this._partCreator.createPartForInput(str, index, inputType);

      const oldStr = str;
      str = newPart.appendUntilRejected(str, inputType);

      if (str === oldStr) {
        // nothing changed, break out of this infinite loop and log an error
        console.error(`Failed to update model for input (str ${str}) (type ${inputType})`);
        break;
      }

      this.insertPart(index, newPart);
      index += 1;
    }

    return addLen;
  }

  positionForOffset(totalOffset) {
    let atPartEnd = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
    let currentOffset = 0;

    const index = this._parts.findIndex(part => {
      const partLen = part.text.length;

      if (atPartEnd && currentOffset + partLen >= totalOffset || !atPartEnd && currentOffset + partLen > totalOffset) {
        return true;
      }

      currentOffset += partLen;
      return false;
    });

    if (index === -1) {
      return this.getPositionAtEnd();
    } else {
      return new _position.default(index, totalOffset - currentOffset);
    }
  }
  /**
   * Starts a range, which can span across multiple parts, to find and replace text.
   * @param {DocumentPosition} positionA a boundary of the range
   * @param {DocumentPosition?} positionB the other boundary of the range, optional
   * @return {Range}
   */


  startRange(positionA) {
    let positionB = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : positionA;
    return new _range.default(this, positionA, positionB);
  }

  replaceRange(startPosition, endPosition, parts) {
    // convert end position to offset, so it is independent of how the document is split into parts
    // which we'll change when splitting up at the start position
    const endOffset = endPosition.asOffset(this);
    const newStartPartIndex = this.splitAt(startPosition); // convert it back to position once split at start

    endPosition = endOffset.asPosition(this);
    const newEndPartIndex = this.splitAt(endPosition);

    for (let i = newEndPartIndex - 1; i >= newStartPartIndex; --i) {
      this.removePart(i);
    }

    let insertIdx = newStartPartIndex;

    for (const part of parts) {
      this.insertPart(insertIdx, part);
      insertIdx += 1;
    }

    this.mergeAdjacentParts();
  }
  /**
   * Performs a transformation not part of an update cycle.
   * Modifying the model should only happen inside a transform call if not part of an update call.
   * @param {ManualTransformCallback} callback to run the transformations in
   * @return {Promise} a promise when auto-complete (if applicable) is done updating
   */


  transform(callback) {
    const pos = callback();
    let acPromise = null;

    if (!(pos instanceof _range.default)) {
      acPromise = this.setActivePart(pos, true);
    } else {
      acPromise = Promise.resolve();
    }

    this.updateCallback(pos);
    return acPromise;
  }

}

exports.default = EditorModel;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJFZGl0b3JNb2RlbCIsImNvbnN0cnVjdG9yIiwicGFydHMiLCJwYXJ0Q3JlYXRvciIsInVwZGF0ZUNhbGxiYWNrIiwicmVwbGFjZVBhcnRzIiwiY2xvc2UiLCJwb3MiLCJfcGFydHMiLCJzcGxpY2UiLCJhdXRvQ29tcGxldGVQYXJ0SWR4IiwiYXV0b0NvbXBsZXRlUGFydENvdW50IiwibGVuZ3RoIiwibGFzdFBhcnQiLCJsYXN0UGFydEluZGV4IiwiRG9jdW1lbnRQb3NpdGlvbiIsInRleHQiLCJfYXV0b0NvbXBsZXRlIiwiX3BhcnRDcmVhdG9yIiwidHJhbnNmb3JtQ2FsbGJhY2siLCJzZXRUcmFuc2Zvcm1DYWxsYmFjayIsInNldFVwZGF0ZUNhbGxiYWNrIiwiaXNFbXB0eSIsInJlZHVjZSIsImxlbiIsInBhcnQiLCJjbG9uZSIsImNsb25lZFBhcnRzIiwibWFwIiwicCIsImRlc2VyaWFsaXplUGFydCIsInNlcmlhbGl6ZSIsImluc2VydFBhcnQiLCJpbmRleCIsImFjdGl2ZVBhcnRJZHgiLCJyZW1vdmVQYXJ0IiwicmVwbGFjZVBhcnQiLCJhdXRvQ29tcGxldGUiLCJnZXRQb3NpdGlvbkF0RW5kIiwic2VyaWFsaXplUGFydHMiLCJkaWZmIiwibmV3VmFsdWUiLCJpbnB1dFR5cGUiLCJjYXJldCIsInByZXZpb3VzVmFsdWUiLCJkaWZmRGVsZXRpb24iLCJkaWZmQXRDYXJldCIsIm9mZnNldCIsInJlc2V0Iiwic2VyaWFsaXplZFBhcnRzIiwiaW5zZXJ0IiwicG9zaXRpb24iLCJpbnNlcnRJbmRleCIsInNwbGl0QXQiLCJuZXdUZXh0TGVuZ3RoIiwiaSIsInVwZGF0ZSIsInBvc2l0aW9uRm9yT2Zmc2V0IiwiYXQiLCJhdE5vZGVFbmQiLCJyZW1vdmVkT2Zmc2V0RGVjcmVhc2UiLCJyZW1vdmVkIiwicmVtb3ZlVGV4dCIsImFkZGVkTGVuIiwiYWRkZWQiLCJhZGRUZXh0IiwibWVyZ2VBZGphY2VudFBhcnRzIiwiY2FyZXRPZmZzZXQiLCJuZXdQb3NpdGlvbiIsImNhbk9wZW5BdXRvQ29tcGxldGUiLCJhY1Byb21pc2UiLCJzZXRBY3RpdmVQYXJ0IiwidHJhbnNmb3JtQWRkZWRMZW4iLCJnZXRUcmFuc2Zvcm1BZGRlZExlbiIsInJlc3VsdCIsIk51bWJlciIsImlzRmluaXRlIiwiYWMiLCJjcmVhdGVBdXRvQ29tcGxldGUiLCJvbkF1dG9Db21wbGV0ZSIsIm9uUGFydFVwZGF0ZSIsIlByb21pc2UiLCJyZXNvbHZlIiwicHJldlBhcnQiLCJpc01lcmdlZCIsIm1lcmdlIiwiYW1vdW50IiwiTWF0aCIsIm1pbiIsImNhbkVkaXQiLCJyZXBsYWNlV2l0aCIsInJlbW92ZSIsImNyZWF0ZURlZmF1bHRQYXJ0Iiwic2Vjb25kUGFydCIsInNwbGl0Iiwic3RyIiwiYWRkTGVuIiwidmFsaWRhdGVBbmRJbnNlcnQiLCJzcGxpdFBhcnQiLCJuZXdQYXJ0IiwiY3JlYXRlUGFydEZvcklucHV0Iiwib2xkU3RyIiwiYXBwZW5kVW50aWxSZWplY3RlZCIsImNvbnNvbGUiLCJlcnJvciIsInRvdGFsT2Zmc2V0IiwiYXRQYXJ0RW5kIiwiY3VycmVudE9mZnNldCIsImZpbmRJbmRleCIsInBhcnRMZW4iLCJzdGFydFJhbmdlIiwicG9zaXRpb25BIiwicG9zaXRpb25CIiwiUmFuZ2UiLCJyZXBsYWNlUmFuZ2UiLCJzdGFydFBvc2l0aW9uIiwiZW5kUG9zaXRpb24iLCJlbmRPZmZzZXQiLCJhc09mZnNldCIsIm5ld1N0YXJ0UGFydEluZGV4IiwiYXNQb3NpdGlvbiIsIm5ld0VuZFBhcnRJbmRleCIsImluc2VydElkeCIsInRyYW5zZm9ybSIsImNhbGxiYWNrIl0sInNvdXJjZXMiOlsiLi4vLi4vc3JjL2VkaXRvci9tb2RlbC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMTkgTmV3IFZlY3RvciBMdGRcbkNvcHlyaWdodCAyMDE5IFRoZSBNYXRyaXgub3JnIEZvdW5kYXRpb24gQy5JLkMuXG5cbkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG55b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cblxuaW1wb3J0IHsgZGlmZkF0Q2FyZXQsIGRpZmZEZWxldGlvbiwgSURpZmYgfSBmcm9tIFwiLi9kaWZmXCI7XG5pbXBvcnQgRG9jdW1lbnRQb3NpdGlvbiwgeyBJUG9zaXRpb24gfSBmcm9tIFwiLi9wb3NpdGlvblwiO1xuaW1wb3J0IFJhbmdlIGZyb20gXCIuL3JhbmdlXCI7XG5pbXBvcnQgeyBTZXJpYWxpemVkUGFydCwgUGFydCwgUGFydENyZWF0b3IgfSBmcm9tIFwiLi9wYXJ0c1wiO1xuaW1wb3J0IEF1dG9jb21wbGV0ZVdyYXBwZXJNb2RlbCwgeyBJQ2FsbGJhY2sgfSBmcm9tIFwiLi9hdXRvY29tcGxldGVcIjtcbmltcG9ydCBEb2N1bWVudE9mZnNldCBmcm9tIFwiLi9vZmZzZXRcIjtcbmltcG9ydCB7IENhcmV0IH0gZnJvbSBcIi4vY2FyZXRcIjtcblxuLyoqXG4gKiBAY2FsbGJhY2sgTW9kZWxDYWxsYmFja1xuICogQHBhcmFtIHtEb2N1bWVudFBvc2l0aW9uP30gY2FyZXRQb3NpdGlvbiB0aGUgcG9zaXRpb24gd2hlcmUgdGhlIGNhcmV0IHNob3VsZCBiZSBwb3NpdGlvblxuICogQHBhcmFtIHtzdHJpbmc/fSBpbnB1dFR5cGUgdGhlIGlucHV0VHlwZSBvZiB0aGUgRE9NIGlucHV0IGV2ZW50XG4gKiBAcGFyYW0ge29iamVjdD99IGRpZmYgYW4gb2JqZWN0IHdpdGggYHJlbW92ZWRgIGFuZCBgYWRkZWRgIHN0cmluZ3NcbiAqL1xuXG4vKipcbiAqIEBjYWxsYmFjayBUcmFuc2Zvcm1DYWxsYmFja1xuICogQHBhcmFtIHtEb2N1bWVudFBvc2l0aW9uP30gY2FyZXRQb3NpdGlvbiB0aGUgcG9zaXRpb24gd2hlcmUgdGhlIGNhcmV0IHNob3VsZCBiZSBwb3NpdGlvblxuICogQHBhcmFtIHtzdHJpbmc/fSBpbnB1dFR5cGUgdGhlIGlucHV0VHlwZSBvZiB0aGUgRE9NIGlucHV0IGV2ZW50XG4gKiBAcGFyYW0ge29iamVjdD99IGRpZmYgYW4gb2JqZWN0IHdpdGggYHJlbW92ZWRgIGFuZCBgYWRkZWRgIHN0cmluZ3NcbiAqIEByZXR1cm4ge051bWJlcj99IGFkZGVkTGVuIGhvdyBtYW55IGNoYXJhY3RlcnMgd2VyZSBhZGRlZC9yZW1vdmVkICgtKSBiZWZvcmUgdGhlIGNhcmV0IGR1cmluZyB0aGUgdHJhbnNmb3JtYXRpb24gc3RlcC5cbiAqICAgIFRoaXMgaXMgdXNlZCB0byBhZGp1c3QgdGhlIGNhcmV0IHBvc2l0aW9uLlxuICovXG5cbi8qKlxuICogQGNhbGxiYWNrIE1hbnVhbFRyYW5zZm9ybUNhbGxiYWNrXG4gKiBAcmV0dXJuIHRoZSBjYXJldCBwb3NpdGlvblxuICovXG5cbnR5cGUgVHJhbnNmb3JtQ2FsbGJhY2sgPSAoY2FyZXRQb3NpdGlvbjogRG9jdW1lbnRQb3NpdGlvbiwgaW5wdXRUeXBlOiBzdHJpbmcsIGRpZmY6IElEaWZmKSA9PiBudW1iZXIgfCB2b2lkO1xudHlwZSBVcGRhdGVDYWxsYmFjayA9IChjYXJldDogQ2FyZXQsIGlucHV0VHlwZT86IHN0cmluZywgZGlmZj86IElEaWZmKSA9PiB2b2lkO1xudHlwZSBNYW51YWxUcmFuc2Zvcm1DYWxsYmFjayA9ICgpID0+IENhcmV0O1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBFZGl0b3JNb2RlbCB7XG4gICAgcHJpdmF0ZSBfcGFydHM6IFBhcnRbXTtcbiAgICBwcml2YXRlIHJlYWRvbmx5IF9wYXJ0Q3JlYXRvcjogUGFydENyZWF0b3I7XG4gICAgcHJpdmF0ZSBhY3RpdmVQYXJ0SWR4OiBudW1iZXIgPSBudWxsO1xuICAgIHByaXZhdGUgX2F1dG9Db21wbGV0ZTogQXV0b2NvbXBsZXRlV3JhcHBlck1vZGVsID0gbnVsbDtcbiAgICBwcml2YXRlIGF1dG9Db21wbGV0ZVBhcnRJZHg6IG51bWJlciA9IG51bGw7XG4gICAgcHJpdmF0ZSBhdXRvQ29tcGxldGVQYXJ0Q291bnQgPSAwO1xuICAgIHByaXZhdGUgdHJhbnNmb3JtQ2FsbGJhY2s6IFRyYW5zZm9ybUNhbGxiYWNrID0gbnVsbDtcblxuICAgIGNvbnN0cnVjdG9yKHBhcnRzOiBQYXJ0W10sIHBhcnRDcmVhdG9yOiBQYXJ0Q3JlYXRvciwgcHJpdmF0ZSB1cGRhdGVDYWxsYmFjazogVXBkYXRlQ2FsbGJhY2sgPSBudWxsKSB7XG4gICAgICAgIHRoaXMuX3BhcnRzID0gcGFydHM7XG4gICAgICAgIHRoaXMuX3BhcnRDcmVhdG9yID0gcGFydENyZWF0b3I7XG4gICAgICAgIHRoaXMudHJhbnNmb3JtQ2FsbGJhY2sgPSBudWxsO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFNldCBhIGNhbGxiYWNrIGZvciB0aGUgdHJhbnNmb3JtYXRpb24gc3RlcC5cbiAgICAgKiBXaGlsZSBwcm9jZXNzaW5nIGFuIHVwZGF0ZSwgcmlnaHQgYmVmb3JlIGNhbGxpbmcgdGhlIHVwZGF0ZSBjYWxsYmFjayxcbiAgICAgKiBhIHRyYW5zZm9ybSBjYWxsYmFjayBjYW4gYmUgY2FsbGVkLCB3aGljaCBzZXJ2ZXMgdG8gZG8gbW9kaWZpY2F0aW9uc1xuICAgICAqIG9uIHRoZSBtb2RlbCB0aGF0IGNhbiBzcGFuIG11bHRpcGxlIHBhcnRzLiBBbHNvIHNlZSBgc3RhcnRSYW5nZSgpYC5cbiAgICAgKiBAcGFyYW0ge1RyYW5zZm9ybUNhbGxiYWNrfSB0cmFuc2Zvcm1DYWxsYmFja1xuICAgICAqL1xuICAgIHB1YmxpYyBzZXRUcmFuc2Zvcm1DYWxsYmFjayh0cmFuc2Zvcm1DYWxsYmFjazogVHJhbnNmb3JtQ2FsbGJhY2spOiB2b2lkIHtcbiAgICAgICAgdGhpcy50cmFuc2Zvcm1DYWxsYmFjayA9IHRyYW5zZm9ybUNhbGxiYWNrO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFNldCBhIGNhbGxiYWNrIGZvciByZXJlbmRlcmluZyB0aGUgbW9kZWwgYWZ0ZXIgaXQgaGFzIGJlZW4gdXBkYXRlZC5cbiAgICAgKiBAcGFyYW0ge01vZGVsQ2FsbGJhY2t9IHVwZGF0ZUNhbGxiYWNrXG4gICAgICovXG4gICAgcHVibGljIHNldFVwZGF0ZUNhbGxiYWNrKHVwZGF0ZUNhbGxiYWNrOiBVcGRhdGVDYWxsYmFjayk6IHZvaWQge1xuICAgICAgICB0aGlzLnVwZGF0ZUNhbGxiYWNrID0gdXBkYXRlQ2FsbGJhY2s7XG4gICAgfVxuXG4gICAgcHVibGljIGdldCBwYXJ0Q3JlYXRvcigpOiBQYXJ0Q3JlYXRvciB7XG4gICAgICAgIHJldHVybiB0aGlzLl9wYXJ0Q3JlYXRvcjtcbiAgICB9XG5cbiAgICBwdWJsaWMgZ2V0IGlzRW1wdHkoKTogYm9vbGVhbiB7XG4gICAgICAgIHJldHVybiB0aGlzLl9wYXJ0cy5yZWR1Y2UoKGxlbiwgcGFydCkgPT4gbGVuICsgcGFydC50ZXh0Lmxlbmd0aCwgMCkgPT09IDA7XG4gICAgfVxuXG4gICAgcHVibGljIGNsb25lKCk6IEVkaXRvck1vZGVsIHtcbiAgICAgICAgY29uc3QgY2xvbmVkUGFydHMgPSB0aGlzLnBhcnRzLm1hcChwID0+IHRoaXMucGFydENyZWF0b3IuZGVzZXJpYWxpemVQYXJ0KHAuc2VyaWFsaXplKCkpKTtcbiAgICAgICAgcmV0dXJuIG5ldyBFZGl0b3JNb2RlbChjbG9uZWRQYXJ0cywgdGhpcy5fcGFydENyZWF0b3IsIHRoaXMudXBkYXRlQ2FsbGJhY2spO1xuICAgIH1cblxuICAgIHByaXZhdGUgaW5zZXJ0UGFydChpbmRleDogbnVtYmVyLCBwYXJ0OiBQYXJ0KTogdm9pZCB7XG4gICAgICAgIHRoaXMuX3BhcnRzLnNwbGljZShpbmRleCwgMCwgcGFydCk7XG4gICAgICAgIGlmICh0aGlzLmFjdGl2ZVBhcnRJZHggPj0gaW5kZXgpIHtcbiAgICAgICAgICAgICsrdGhpcy5hY3RpdmVQYXJ0SWR4O1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLmF1dG9Db21wbGV0ZVBhcnRJZHggPj0gaW5kZXgpIHtcbiAgICAgICAgICAgICsrdGhpcy5hdXRvQ29tcGxldGVQYXJ0SWR4O1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSByZW1vdmVQYXJ0KGluZGV4OiBudW1iZXIpOiB2b2lkIHtcbiAgICAgICAgdGhpcy5fcGFydHMuc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgICAgaWYgKGluZGV4ID09PSB0aGlzLmFjdGl2ZVBhcnRJZHgpIHtcbiAgICAgICAgICAgIHRoaXMuYWN0aXZlUGFydElkeCA9IG51bGw7XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5hY3RpdmVQYXJ0SWR4ID4gaW5kZXgpIHtcbiAgICAgICAgICAgIC0tdGhpcy5hY3RpdmVQYXJ0SWR4O1xuICAgICAgICB9XG4gICAgICAgIGlmIChpbmRleCA9PT0gdGhpcy5hdXRvQ29tcGxldGVQYXJ0SWR4KSB7XG4gICAgICAgICAgICB0aGlzLmF1dG9Db21wbGV0ZVBhcnRJZHggPSBudWxsO1xuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuYXV0b0NvbXBsZXRlUGFydElkeCA+IGluZGV4KSB7XG4gICAgICAgICAgICAtLXRoaXMuYXV0b0NvbXBsZXRlUGFydElkeDtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgcmVwbGFjZVBhcnQoaW5kZXg6IG51bWJlciwgcGFydDogUGFydCk6IHZvaWQge1xuICAgICAgICB0aGlzLl9wYXJ0cy5zcGxpY2UoaW5kZXgsIDEsIHBhcnQpO1xuICAgIH1cblxuICAgIHB1YmxpYyBnZXQgcGFydHMoKTogUGFydFtdIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3BhcnRzO1xuICAgIH1cblxuICAgIHB1YmxpYyBnZXQgYXV0b0NvbXBsZXRlKCk6IEF1dG9jb21wbGV0ZVdyYXBwZXJNb2RlbCB7XG4gICAgICAgIGlmICh0aGlzLmFjdGl2ZVBhcnRJZHggPT09IHRoaXMuYXV0b0NvbXBsZXRlUGFydElkeCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2F1dG9Db21wbGV0ZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICBwdWJsaWMgZ2V0UG9zaXRpb25BdEVuZCgpOiBEb2N1bWVudFBvc2l0aW9uIHtcbiAgICAgICAgaWYgKHRoaXMuX3BhcnRzLmxlbmd0aCkge1xuICAgICAgICAgICAgY29uc3QgaW5kZXggPSB0aGlzLl9wYXJ0cy5sZW5ndGggLSAxO1xuICAgICAgICAgICAgY29uc3QgcGFydCA9IHRoaXMuX3BhcnRzW2luZGV4XTtcbiAgICAgICAgICAgIHJldHVybiBuZXcgRG9jdW1lbnRQb3NpdGlvbihpbmRleCwgcGFydC50ZXh0Lmxlbmd0aCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBwYXJ0IGluZGV4IC0xLCBhcyB0aGVyZSBhcmUgbm8gcGFydHMgdG8gcG9pbnQgYXRcbiAgICAgICAgICAgIHJldHVybiBuZXcgRG9jdW1lbnRQb3NpdGlvbigtMSwgMCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwdWJsaWMgc2VyaWFsaXplUGFydHMoKTogU2VyaWFsaXplZFBhcnRbXSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9wYXJ0cy5tYXAocCA9PiBwLnNlcmlhbGl6ZSgpKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGRpZmYobmV3VmFsdWU6IHN0cmluZywgaW5wdXRUeXBlOiBzdHJpbmcsIGNhcmV0OiBEb2N1bWVudE9mZnNldCk6IElEaWZmIHtcbiAgICAgICAgY29uc3QgcHJldmlvdXNWYWx1ZSA9IHRoaXMucGFydHMucmVkdWNlKCh0ZXh0LCBwKSA9PiB0ZXh0ICsgcC50ZXh0LCBcIlwiKTtcbiAgICAgICAgLy8gY2FuJ3QgdXNlIGNhcmV0IHBvc2l0aW9uIHdpdGggZHJhZyBhbmQgZHJvcFxuICAgICAgICBpZiAoaW5wdXRUeXBlID09PSBcImRlbGV0ZUJ5RHJhZ1wiKSB7XG4gICAgICAgICAgICByZXR1cm4gZGlmZkRlbGV0aW9uKHByZXZpb3VzVmFsdWUsIG5ld1ZhbHVlKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBkaWZmQXRDYXJldChwcmV2aW91c1ZhbHVlLCBuZXdWYWx1ZSwgY2FyZXQub2Zmc2V0KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHB1YmxpYyByZXNldChzZXJpYWxpemVkUGFydHM6IFNlcmlhbGl6ZWRQYXJ0W10sIGNhcmV0PzogQ2FyZXQsIGlucHV0VHlwZT86IHN0cmluZyk6IHZvaWQge1xuICAgICAgICB0aGlzLl9wYXJ0cyA9IHNlcmlhbGl6ZWRQYXJ0cy5tYXAocCA9PiB0aGlzLl9wYXJ0Q3JlYXRvci5kZXNlcmlhbGl6ZVBhcnQocCkpO1xuICAgICAgICBpZiAoIWNhcmV0KSB7XG4gICAgICAgICAgICBjYXJldCA9IHRoaXMuZ2V0UG9zaXRpb25BdEVuZCgpO1xuICAgICAgICB9XG4gICAgICAgIC8vIGNsb3NlIGF1dG8gY29tcGxldGUgaWYgb3BlblxuICAgICAgICAvLyB0aGlzIHdvdWxkIGhhcHBlbiB3aGVuIGNsZWFyaW5nIHRoZSBjb21wb3NlciBhZnRlciBzZW5kaW5nXG4gICAgICAgIC8vIGEgbWVzc2FnZSB3aXRoIHRoZSBhdXRvY29tcGxldGUgc3RpbGwgb3BlblxuICAgICAgICBpZiAodGhpcy5fYXV0b0NvbXBsZXRlKSB7XG4gICAgICAgICAgICB0aGlzLl9hdXRvQ29tcGxldGUgPSBudWxsO1xuICAgICAgICAgICAgdGhpcy5hdXRvQ29tcGxldGVQYXJ0SWR4ID0gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnVwZGF0ZUNhbGxiYWNrKGNhcmV0LCBpbnB1dFR5cGUpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEluc2VydHMgdGhlIGdpdmVuIHBhcnRzIGF0IHRoZSBnaXZlbiBwb3NpdGlvbi5cbiAgICAgKiBTaG91bGQgYmUgcnVuIGluc2lkZSBhIGBtb2RlbC50cmFuc2Zvcm0oKWAgY2FsbGJhY2suXG4gICAgICogQHBhcmFtIHtQYXJ0W119IHBhcnRzIHRoZSBwYXJ0cyB0byByZXBsYWNlIHRoZSByYW5nZSB3aXRoXG4gICAgICogQHBhcmFtIHtEb2N1bWVudFBvc2l0aW9ufSBwb3NpdGlvbiB0aGUgcG9zaXRpb24gdG8gc3RhcnQgaW5zZXJ0aW5nIGF0XG4gICAgICogQHJldHVybiB7TnVtYmVyfSB0aGUgYW1vdW50IG9mIGNoYXJhY3RlcnMgYWRkZWRcbiAgICAgKi9cbiAgICBwdWJsaWMgaW5zZXJ0KHBhcnRzOiBQYXJ0W10sIHBvc2l0aW9uOiBJUG9zaXRpb24pOiBudW1iZXIge1xuICAgICAgICBjb25zdCBpbnNlcnRJbmRleCA9IHRoaXMuc3BsaXRBdChwb3NpdGlvbik7XG4gICAgICAgIGxldCBuZXdUZXh0TGVuZ3RoID0gMDtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBwYXJ0cy5sZW5ndGg7ICsraSkge1xuICAgICAgICAgICAgY29uc3QgcGFydCA9IHBhcnRzW2ldO1xuICAgICAgICAgICAgbmV3VGV4dExlbmd0aCArPSBwYXJ0LnRleHQubGVuZ3RoO1xuICAgICAgICAgICAgdGhpcy5pbnNlcnRQYXJ0KGluc2VydEluZGV4ICsgaSwgcGFydCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG5ld1RleHRMZW5ndGg7XG4gICAgfVxuXG4gICAgcHVibGljIHVwZGF0ZShuZXdWYWx1ZTogc3RyaW5nLCBpbnB1dFR5cGU6IHN0cmluZywgY2FyZXQ6IERvY3VtZW50T2Zmc2V0KTogUHJvbWlzZTx2b2lkPiB7XG4gICAgICAgIGNvbnN0IGRpZmYgPSB0aGlzLmRpZmYobmV3VmFsdWUsIGlucHV0VHlwZSwgY2FyZXQpO1xuICAgICAgICBjb25zdCBwb3NpdGlvbiA9IHRoaXMucG9zaXRpb25Gb3JPZmZzZXQoZGlmZi5hdCwgY2FyZXQuYXROb2RlRW5kKTtcbiAgICAgICAgbGV0IHJlbW92ZWRPZmZzZXREZWNyZWFzZSA9IDA7XG4gICAgICAgIGlmIChkaWZmLnJlbW92ZWQpIHtcbiAgICAgICAgICAgIHJlbW92ZWRPZmZzZXREZWNyZWFzZSA9IHRoaXMucmVtb3ZlVGV4dChwb3NpdGlvbiwgZGlmZi5yZW1vdmVkLmxlbmd0aCk7XG4gICAgICAgIH1cbiAgICAgICAgbGV0IGFkZGVkTGVuID0gMDtcbiAgICAgICAgaWYgKGRpZmYuYWRkZWQpIHtcbiAgICAgICAgICAgIGFkZGVkTGVuID0gdGhpcy5hZGRUZXh0KHBvc2l0aW9uLCBkaWZmLmFkZGVkLCBpbnB1dFR5cGUpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMubWVyZ2VBZGphY2VudFBhcnRzKCk7XG4gICAgICAgIGNvbnN0IGNhcmV0T2Zmc2V0ID0gZGlmZi5hdCAtIHJlbW92ZWRPZmZzZXREZWNyZWFzZSArIGFkZGVkTGVuO1xuICAgICAgICBsZXQgbmV3UG9zaXRpb24gPSB0aGlzLnBvc2l0aW9uRm9yT2Zmc2V0KGNhcmV0T2Zmc2V0LCB0cnVlKTtcbiAgICAgICAgY29uc3QgY2FuT3BlbkF1dG9Db21wbGV0ZSA9IGlucHV0VHlwZSAhPT0gXCJpbnNlcnRGcm9tUGFzdGVcIiAmJiBpbnB1dFR5cGUgIT09IFwiaW5zZXJ0RnJvbURyb3BcIjtcbiAgICAgICAgY29uc3QgYWNQcm9taXNlID0gdGhpcy5zZXRBY3RpdmVQYXJ0KG5ld1Bvc2l0aW9uLCBjYW5PcGVuQXV0b0NvbXBsZXRlKTtcbiAgICAgICAgaWYgKHRoaXMudHJhbnNmb3JtQ2FsbGJhY2spIHtcbiAgICAgICAgICAgIGNvbnN0IHRyYW5zZm9ybUFkZGVkTGVuID0gdGhpcy5nZXRUcmFuc2Zvcm1BZGRlZExlbihuZXdQb3NpdGlvbiwgaW5wdXRUeXBlLCBkaWZmKTtcbiAgICAgICAgICAgIG5ld1Bvc2l0aW9uID0gdGhpcy5wb3NpdGlvbkZvck9mZnNldChjYXJldE9mZnNldCArIHRyYW5zZm9ybUFkZGVkTGVuLCB0cnVlKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnVwZGF0ZUNhbGxiYWNrKG5ld1Bvc2l0aW9uLCBpbnB1dFR5cGUsIGRpZmYpO1xuICAgICAgICByZXR1cm4gYWNQcm9taXNlO1xuICAgIH1cblxuICAgIHByaXZhdGUgZ2V0VHJhbnNmb3JtQWRkZWRMZW4obmV3UG9zaXRpb246IERvY3VtZW50UG9zaXRpb24sIGlucHV0VHlwZTogc3RyaW5nLCBkaWZmOiBJRGlmZik6IG51bWJlciB7XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IHRoaXMudHJhbnNmb3JtQ2FsbGJhY2sobmV3UG9zaXRpb24sIGlucHV0VHlwZSwgZGlmZik7XG4gICAgICAgIHJldHVybiBOdW1iZXIuaXNGaW5pdGUocmVzdWx0KSA/IHJlc3VsdCBhcyBudW1iZXIgOiAwO1xuICAgIH1cblxuICAgIHByaXZhdGUgc2V0QWN0aXZlUGFydChwb3M6IERvY3VtZW50UG9zaXRpb24sIGNhbk9wZW5BdXRvQ29tcGxldGU6IGJvb2xlYW4pOiBQcm9taXNlPHZvaWQ+IHtcbiAgICAgICAgY29uc3QgeyBpbmRleCB9ID0gcG9zO1xuICAgICAgICBjb25zdCBwYXJ0ID0gdGhpcy5fcGFydHNbaW5kZXhdO1xuICAgICAgICBpZiAocGFydCkge1xuICAgICAgICAgICAgaWYgKGluZGV4ICE9PSB0aGlzLmFjdGl2ZVBhcnRJZHgpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmFjdGl2ZVBhcnRJZHggPSBpbmRleDtcbiAgICAgICAgICAgICAgICBpZiAoY2FuT3BlbkF1dG9Db21wbGV0ZSAmJiB0aGlzLmFjdGl2ZVBhcnRJZHggIT09IHRoaXMuYXV0b0NvbXBsZXRlUGFydElkeCkge1xuICAgICAgICAgICAgICAgICAgICAvLyBlbHNlIHRyeSB0byBjcmVhdGUgb25lXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGFjID0gcGFydC5jcmVhdGVBdXRvQ29tcGxldGUodGhpcy5vbkF1dG9Db21wbGV0ZSk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChhYykge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gbWFrZSBzdXJlIHRoYXQgcmVhY3QgcGlja3MgdXAgdGhlIGRpZmZlcmVuY2UgYmV0d2VlbiBib3RoIGFjc1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fYXV0b0NvbXBsZXRlID0gYWM7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmF1dG9Db21wbGV0ZVBhcnRJZHggPSBpbmRleDtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuYXV0b0NvbXBsZXRlUGFydENvdW50ID0gMTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIG5vdCBhdXRvQ29tcGxldGUsIG9ubHkgdGhlcmUgaWYgYWN0aXZlIHBhcnQgaXMgYXV0b2NvbXBsZXRlIHBhcnRcbiAgICAgICAgICAgIGlmICh0aGlzLmF1dG9Db21wbGV0ZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmF1dG9Db21wbGV0ZS5vblBhcnRVcGRhdGUocGFydCwgcG9zKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuYWN0aXZlUGFydElkeCA9IG51bGw7XG4gICAgICAgICAgICB0aGlzLl9hdXRvQ29tcGxldGUgPSBudWxsO1xuICAgICAgICAgICAgdGhpcy5hdXRvQ29tcGxldGVQYXJ0SWR4ID0gbnVsbDtcbiAgICAgICAgICAgIHRoaXMuYXV0b0NvbXBsZXRlUGFydENvdW50ID0gMDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBvbkF1dG9Db21wbGV0ZSA9ICh7IHJlcGxhY2VQYXJ0cywgY2xvc2UgfTogSUNhbGxiYWNrKTogdm9pZCA9PiB7XG4gICAgICAgIGxldCBwb3M7XG4gICAgICAgIGlmIChyZXBsYWNlUGFydHMpIHtcbiAgICAgICAgICAgIHRoaXMuX3BhcnRzLnNwbGljZSh0aGlzLmF1dG9Db21wbGV0ZVBhcnRJZHgsIHRoaXMuYXV0b0NvbXBsZXRlUGFydENvdW50LCAuLi5yZXBsYWNlUGFydHMpO1xuICAgICAgICAgICAgdGhpcy5hdXRvQ29tcGxldGVQYXJ0Q291bnQgPSByZXBsYWNlUGFydHMubGVuZ3RoO1xuICAgICAgICAgICAgY29uc3QgbGFzdFBhcnQgPSByZXBsYWNlUGFydHNbcmVwbGFjZVBhcnRzLmxlbmd0aCAtIDFdO1xuICAgICAgICAgICAgY29uc3QgbGFzdFBhcnRJbmRleCA9IHRoaXMuYXV0b0NvbXBsZXRlUGFydElkeCArIHJlcGxhY2VQYXJ0cy5sZW5ndGggLSAxO1xuICAgICAgICAgICAgcG9zID0gbmV3IERvY3VtZW50UG9zaXRpb24obGFzdFBhcnRJbmRleCwgbGFzdFBhcnQudGV4dC5sZW5ndGgpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChjbG9zZSkge1xuICAgICAgICAgICAgdGhpcy5fYXV0b0NvbXBsZXRlID0gbnVsbDtcbiAgICAgICAgICAgIHRoaXMuYXV0b0NvbXBsZXRlUGFydElkeCA9IG51bGw7XG4gICAgICAgICAgICB0aGlzLmF1dG9Db21wbGV0ZVBhcnRDb3VudCA9IDA7XG4gICAgICAgIH1cbiAgICAgICAgLy8gcmVyZW5kZXIgZXZlbiBpZiBlZGl0b3IgY29udGVudHMgZGlkbid0IGNoYW5nZVxuICAgICAgICAvLyB0byBtYWtlIHN1cmUgdGhlIE1lc3NhZ2VFZGl0b3IgY2hlY2tzXG4gICAgICAgIC8vIG1vZGVsLmF1dG9Db21wbGV0ZSBiZWluZyBlbXB0eSBhbmQgY2xvc2VzIGl0XG4gICAgICAgIHRoaXMudXBkYXRlQ2FsbGJhY2socG9zKTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBtZXJnZUFkamFjZW50UGFydHMoKTogdm9pZCB7XG4gICAgICAgIGxldCBwcmV2UGFydDtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLl9wYXJ0cy5sZW5ndGg7ICsraSkge1xuICAgICAgICAgICAgbGV0IHBhcnQgPSB0aGlzLl9wYXJ0c1tpXTtcbiAgICAgICAgICAgIGNvbnN0IGlzRW1wdHkgPSAhcGFydC50ZXh0Lmxlbmd0aDtcbiAgICAgICAgICAgIGNvbnN0IGlzTWVyZ2VkID0gIWlzRW1wdHkgJiYgcHJldlBhcnQgJiYgcHJldlBhcnQubWVyZ2UocGFydCk7XG4gICAgICAgICAgICBpZiAoaXNFbXB0eSB8fCBpc01lcmdlZCkge1xuICAgICAgICAgICAgICAgIC8vIHJlbW92ZSBlbXB0eSBvciBtZXJnZWQgcGFydFxuICAgICAgICAgICAgICAgIHBhcnQgPSBwcmV2UGFydDtcbiAgICAgICAgICAgICAgICB0aGlzLnJlbW92ZVBhcnQoaSk7XG4gICAgICAgICAgICAgICAgLy9yZXBlYXQgdGhpcyBpbmRleCwgYXMgaXQncyByZW1vdmVkIG5vd1xuICAgICAgICAgICAgICAgIC0taTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHByZXZQYXJ0ID0gcGFydDtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIHJlbW92ZXMgYGxlbmAgYW1vdW50IG9mIGNoYXJhY3RlcnMgYXQgYHBvc2AuXG4gICAgICogQHBhcmFtIHtPYmplY3R9IHBvc1xuICAgICAqIEBwYXJhbSB7TnVtYmVyfSBsZW5cbiAgICAgKiBAcmV0dXJuIHtOdW1iZXJ9IGhvdyBtYW55IGNoYXJhY3RlcnMgYmVmb3JlIHBvcyB3ZXJlIGFsc28gcmVtb3ZlZCxcbiAgICAgKiB1c3VhbGx5IGJlY2F1c2Ugb2Ygbm9uLWVkaXRhYmxlIHBhcnRzIHRoYXQgY2FuIG9ubHkgYmUgcmVtb3ZlZCBpbiB0aGVpciBlbnRpcmV0eS5cbiAgICAgKi9cbiAgICBwdWJsaWMgcmVtb3ZlVGV4dChwb3M6IElQb3NpdGlvbiwgbGVuOiBudW1iZXIpOiBudW1iZXIge1xuICAgICAgICBsZXQgeyBpbmRleCwgb2Zmc2V0IH0gPSBwb3M7XG4gICAgICAgIGxldCByZW1vdmVkT2Zmc2V0RGVjcmVhc2UgPSAwO1xuICAgICAgICB3aGlsZSAobGVuID4gMCkge1xuICAgICAgICAgICAgLy8gcGFydCBtaWdodCBiZSB1bmRlZmluZWQgaGVyZVxuICAgICAgICAgICAgbGV0IHBhcnQgPSB0aGlzLl9wYXJ0c1tpbmRleF07XG4gICAgICAgICAgICBjb25zdCBhbW91bnQgPSBNYXRoLm1pbihsZW4sIHBhcnQudGV4dC5sZW5ndGggLSBvZmZzZXQpO1xuICAgICAgICAgICAgLy8gZG9uJ3QgYWxsb3cgMCBhbW91bnQgZGVsZXRpb25zXG4gICAgICAgICAgICBpZiAoYW1vdW50KSB7XG4gICAgICAgICAgICAgICAgaWYgKHBhcnQuY2FuRWRpdCkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCByZXBsYWNlV2l0aCA9IHBhcnQucmVtb3ZlKG9mZnNldCwgYW1vdW50KTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHR5cGVvZiByZXBsYWNlV2l0aCA9PT0gXCJzdHJpbmdcIikge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5yZXBsYWNlUGFydChpbmRleCwgdGhpcy5fcGFydENyZWF0b3IuY3JlYXRlRGVmYXVsdFBhcnQocmVwbGFjZVdpdGgpKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBwYXJ0ID0gdGhpcy5fcGFydHNbaW5kZXhdO1xuICAgICAgICAgICAgICAgICAgICAvLyByZW1vdmUgZW1wdHkgcGFydFxuICAgICAgICAgICAgICAgICAgICBpZiAoIXBhcnQudGV4dC5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucmVtb3ZlUGFydChpbmRleCk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpbmRleCArPSAxO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcmVtb3ZlZE9mZnNldERlY3JlYXNlICs9IG9mZnNldDtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5yZW1vdmVQYXJ0KGluZGV4KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGluZGV4ICs9IDE7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBsZW4gLT0gYW1vdW50O1xuICAgICAgICAgICAgb2Zmc2V0ID0gMDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVtb3ZlZE9mZnNldERlY3JlYXNlO1xuICAgIH1cblxuICAgIC8vIHJldHVybiBwYXJ0IGluZGV4IHdoZXJlIGluc2VydGlvbiB3aWxsIGluc2VydCBiZXR3ZWVuIGF0IG9mZnNldFxuICAgIHByaXZhdGUgc3BsaXRBdChwb3M6IElQb3NpdGlvbik6IG51bWJlciB7XG4gICAgICAgIGlmIChwb3MuaW5kZXggPT09IC0xKSB7XG4gICAgICAgICAgICByZXR1cm4gMDtcbiAgICAgICAgfVxuICAgICAgICBpZiAocG9zLm9mZnNldCA9PT0gMCkge1xuICAgICAgICAgICAgcmV0dXJuIHBvcy5pbmRleDtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBwYXJ0ID0gdGhpcy5fcGFydHNbcG9zLmluZGV4XTtcbiAgICAgICAgaWYgKHBvcy5vZmZzZXQgPj0gcGFydC50ZXh0Lmxlbmd0aCkge1xuICAgICAgICAgICAgcmV0dXJuIHBvcy5pbmRleCArIDE7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBzZWNvbmRQYXJ0ID0gcGFydC5zcGxpdChwb3Mub2Zmc2V0KTtcbiAgICAgICAgdGhpcy5pbnNlcnRQYXJ0KHBvcy5pbmRleCArIDEsIHNlY29uZFBhcnQpO1xuICAgICAgICByZXR1cm4gcG9zLmluZGV4ICsgMTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBpbnNlcnRzIGBzdHJgIGludG8gdGhlIG1vZGVsIGF0IGBwb3NgLlxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBwb3NcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gc3RyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGlucHV0VHlwZSB0aGUgc291cmNlIG9mIHRoZSBpbnB1dCwgc2VlIGh0bWwgSW5wdXRFdmVudC5pbnB1dFR5cGVcbiAgICAgKiBAcmV0dXJuIHtOdW1iZXJ9IGhvdyBmYXIgZnJvbSBwb3NpdGlvbiAoaW4gY2hhcmFjdGVycykgdGhlIGluc2VydGlvbiBlbmRlZC5cbiAgICAgKiBUaGlzIGNhbiBiZSBtb3JlIHRoYW4gdGhlIGxlbmd0aCBvZiBgc3RyYCB3aGVuIGNyb3NzaW5nIG5vbi1lZGl0YWJsZSBwYXJ0cywgd2hpY2ggYXJlIHNraXBwZWQuXG4gICAgICovXG4gICAgcHJpdmF0ZSBhZGRUZXh0KHBvczogSVBvc2l0aW9uLCBzdHI6IHN0cmluZywgaW5wdXRUeXBlOiBzdHJpbmcpOiBudW1iZXIge1xuICAgICAgICBsZXQgeyBpbmRleCB9ID0gcG9zO1xuICAgICAgICBjb25zdCB7IG9mZnNldCB9ID0gcG9zO1xuICAgICAgICBsZXQgYWRkTGVuID0gc3RyLmxlbmd0aDtcbiAgICAgICAgY29uc3QgcGFydCA9IHRoaXMuX3BhcnRzW2luZGV4XTtcbiAgICAgICAgaWYgKHBhcnQpIHtcbiAgICAgICAgICAgIGlmIChwYXJ0LmNhbkVkaXQpIHtcbiAgICAgICAgICAgICAgICBpZiAocGFydC52YWxpZGF0ZUFuZEluc2VydChvZmZzZXQsIHN0ciwgaW5wdXRUeXBlKSkge1xuICAgICAgICAgICAgICAgICAgICBzdHIgPSBudWxsO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHNwbGl0UGFydCA9IHBhcnQuc3BsaXQob2Zmc2V0KTtcbiAgICAgICAgICAgICAgICAgICAgaW5kZXggKz0gMTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5pbnNlcnRQYXJ0KGluZGV4LCBzcGxpdFBhcnQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSBpZiAob2Zmc2V0ICE9PSAwKSB7XG4gICAgICAgICAgICAgICAgLy8gbm90LWVkaXRhYmxlIHBhcnQsIGNhcmV0IGlzIG5vdCBhdCBzdGFydCxcbiAgICAgICAgICAgICAgICAvLyBzbyBpbnNlcnQgc3RyIGFmdGVyIHRoaXMgcGFydFxuICAgICAgICAgICAgICAgIGFkZExlbiArPSBwYXJ0LnRleHQubGVuZ3RoIC0gb2Zmc2V0O1xuICAgICAgICAgICAgICAgIGluZGV4ICs9IDE7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAoaW5kZXggPCAwKSB7XG4gICAgICAgICAgICAvLyBpZiBwb3NpdGlvbiB3YXMgbm90IGZvdW5kIChpbmRleDogLTEsIGFzIGhhcHBlbnMgZm9yIGVtcHR5IGVkaXRvcilcbiAgICAgICAgICAgIC8vIHJlc2V0IGl0IHRvIGluc2VydCBhcyBmaXJzdCBwYXJ0XG4gICAgICAgICAgICBpbmRleCA9IDA7XG4gICAgICAgIH1cbiAgICAgICAgd2hpbGUgKHN0cikge1xuICAgICAgICAgICAgY29uc3QgbmV3UGFydCA9IHRoaXMuX3BhcnRDcmVhdG9yLmNyZWF0ZVBhcnRGb3JJbnB1dChzdHIsIGluZGV4LCBpbnB1dFR5cGUpO1xuICAgICAgICAgICAgY29uc3Qgb2xkU3RyID0gc3RyO1xuICAgICAgICAgICAgc3RyID0gbmV3UGFydC5hcHBlbmRVbnRpbFJlamVjdGVkKHN0ciwgaW5wdXRUeXBlKTtcbiAgICAgICAgICAgIGlmIChzdHIgPT09IG9sZFN0cikge1xuICAgICAgICAgICAgICAgIC8vIG5vdGhpbmcgY2hhbmdlZCwgYnJlYWsgb3V0IG9mIHRoaXMgaW5maW5pdGUgbG9vcCBhbmQgbG9nIGFuIGVycm9yXG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihgRmFpbGVkIHRvIHVwZGF0ZSBtb2RlbCBmb3IgaW5wdXQgKHN0ciAke3N0cn0pICh0eXBlICR7aW5wdXRUeXBlfSlgKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuaW5zZXJ0UGFydChpbmRleCwgbmV3UGFydCk7XG4gICAgICAgICAgICBpbmRleCArPSAxO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBhZGRMZW47XG4gICAgfVxuXG4gICAgcHVibGljIHBvc2l0aW9uRm9yT2Zmc2V0KHRvdGFsT2Zmc2V0OiBudW1iZXIsIGF0UGFydEVuZCA9IGZhbHNlKTogRG9jdW1lbnRQb3NpdGlvbiB7XG4gICAgICAgIGxldCBjdXJyZW50T2Zmc2V0ID0gMDtcbiAgICAgICAgY29uc3QgaW5kZXggPSB0aGlzLl9wYXJ0cy5maW5kSW5kZXgocGFydCA9PiB7XG4gICAgICAgICAgICBjb25zdCBwYXJ0TGVuID0gcGFydC50ZXh0Lmxlbmd0aDtcbiAgICAgICAgICAgIGlmIChcbiAgICAgICAgICAgICAgICAoYXRQYXJ0RW5kICYmIChjdXJyZW50T2Zmc2V0ICsgcGFydExlbikgPj0gdG90YWxPZmZzZXQpIHx8XG4gICAgICAgICAgICAgICAgKCFhdFBhcnRFbmQgJiYgKGN1cnJlbnRPZmZzZXQgKyBwYXJ0TGVuKSA+IHRvdGFsT2Zmc2V0KVxuICAgICAgICAgICAgKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjdXJyZW50T2Zmc2V0ICs9IHBhcnRMZW47XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH0pO1xuICAgICAgICBpZiAoaW5kZXggPT09IC0xKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5nZXRQb3NpdGlvbkF0RW5kKCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gbmV3IERvY3VtZW50UG9zaXRpb24oaW5kZXgsIHRvdGFsT2Zmc2V0IC0gY3VycmVudE9mZnNldCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBTdGFydHMgYSByYW5nZSwgd2hpY2ggY2FuIHNwYW4gYWNyb3NzIG11bHRpcGxlIHBhcnRzLCB0byBmaW5kIGFuZCByZXBsYWNlIHRleHQuXG4gICAgICogQHBhcmFtIHtEb2N1bWVudFBvc2l0aW9ufSBwb3NpdGlvbkEgYSBib3VuZGFyeSBvZiB0aGUgcmFuZ2VcbiAgICAgKiBAcGFyYW0ge0RvY3VtZW50UG9zaXRpb24/fSBwb3NpdGlvbkIgdGhlIG90aGVyIGJvdW5kYXJ5IG9mIHRoZSByYW5nZSwgb3B0aW9uYWxcbiAgICAgKiBAcmV0dXJuIHtSYW5nZX1cbiAgICAgKi9cbiAgICBwdWJsaWMgc3RhcnRSYW5nZShwb3NpdGlvbkE6IERvY3VtZW50UG9zaXRpb24sIHBvc2l0aW9uQiA9IHBvc2l0aW9uQSk6IFJhbmdlIHtcbiAgICAgICAgcmV0dXJuIG5ldyBSYW5nZSh0aGlzLCBwb3NpdGlvbkEsIHBvc2l0aW9uQik7XG4gICAgfVxuXG4gICAgcHVibGljIHJlcGxhY2VSYW5nZShzdGFydFBvc2l0aW9uOiBEb2N1bWVudFBvc2l0aW9uLCBlbmRQb3NpdGlvbjogRG9jdW1lbnRQb3NpdGlvbiwgcGFydHM6IFBhcnRbXSk6IHZvaWQge1xuICAgICAgICAvLyBjb252ZXJ0IGVuZCBwb3NpdGlvbiB0byBvZmZzZXQsIHNvIGl0IGlzIGluZGVwZW5kZW50IG9mIGhvdyB0aGUgZG9jdW1lbnQgaXMgc3BsaXQgaW50byBwYXJ0c1xuICAgICAgICAvLyB3aGljaCB3ZSdsbCBjaGFuZ2Ugd2hlbiBzcGxpdHRpbmcgdXAgYXQgdGhlIHN0YXJ0IHBvc2l0aW9uXG4gICAgICAgIGNvbnN0IGVuZE9mZnNldCA9IGVuZFBvc2l0aW9uLmFzT2Zmc2V0KHRoaXMpO1xuICAgICAgICBjb25zdCBuZXdTdGFydFBhcnRJbmRleCA9IHRoaXMuc3BsaXRBdChzdGFydFBvc2l0aW9uKTtcbiAgICAgICAgLy8gY29udmVydCBpdCBiYWNrIHRvIHBvc2l0aW9uIG9uY2Ugc3BsaXQgYXQgc3RhcnRcbiAgICAgICAgZW5kUG9zaXRpb24gPSBlbmRPZmZzZXQuYXNQb3NpdGlvbih0aGlzKTtcbiAgICAgICAgY29uc3QgbmV3RW5kUGFydEluZGV4ID0gdGhpcy5zcGxpdEF0KGVuZFBvc2l0aW9uKTtcbiAgICAgICAgZm9yIChsZXQgaSA9IG5ld0VuZFBhcnRJbmRleCAtIDE7IGkgPj0gbmV3U3RhcnRQYXJ0SW5kZXg7IC0taSkge1xuICAgICAgICAgICAgdGhpcy5yZW1vdmVQYXJ0KGkpO1xuICAgICAgICB9XG4gICAgICAgIGxldCBpbnNlcnRJZHggPSBuZXdTdGFydFBhcnRJbmRleDtcbiAgICAgICAgZm9yIChjb25zdCBwYXJ0IG9mIHBhcnRzKSB7XG4gICAgICAgICAgICB0aGlzLmluc2VydFBhcnQoaW5zZXJ0SWR4LCBwYXJ0KTtcbiAgICAgICAgICAgIGluc2VydElkeCArPSAxO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMubWVyZ2VBZGphY2VudFBhcnRzKCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUGVyZm9ybXMgYSB0cmFuc2Zvcm1hdGlvbiBub3QgcGFydCBvZiBhbiB1cGRhdGUgY3ljbGUuXG4gICAgICogTW9kaWZ5aW5nIHRoZSBtb2RlbCBzaG91bGQgb25seSBoYXBwZW4gaW5zaWRlIGEgdHJhbnNmb3JtIGNhbGwgaWYgbm90IHBhcnQgb2YgYW4gdXBkYXRlIGNhbGwuXG4gICAgICogQHBhcmFtIHtNYW51YWxUcmFuc2Zvcm1DYWxsYmFja30gY2FsbGJhY2sgdG8gcnVuIHRoZSB0cmFuc2Zvcm1hdGlvbnMgaW5cbiAgICAgKiBAcmV0dXJuIHtQcm9taXNlfSBhIHByb21pc2Ugd2hlbiBhdXRvLWNvbXBsZXRlIChpZiBhcHBsaWNhYmxlKSBpcyBkb25lIHVwZGF0aW5nXG4gICAgICovXG4gICAgcHVibGljIHRyYW5zZm9ybShjYWxsYmFjazogTWFudWFsVHJhbnNmb3JtQ2FsbGJhY2spOiBQcm9taXNlPHZvaWQ+IHtcbiAgICAgICAgY29uc3QgcG9zID0gY2FsbGJhY2soKTtcbiAgICAgICAgbGV0IGFjUHJvbWlzZTogUHJvbWlzZTx2b2lkPiA9IG51bGw7XG4gICAgICAgIGlmICghKHBvcyBpbnN0YW5jZW9mIFJhbmdlKSkge1xuICAgICAgICAgICAgYWNQcm9taXNlID0gdGhpcy5zZXRBY3RpdmVQYXJ0KHBvcywgdHJ1ZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBhY1Byb21pc2UgPSBQcm9taXNlLnJlc29sdmUoKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnVwZGF0ZUNhbGxiYWNrKHBvcyk7XG4gICAgICAgIHJldHVybiBhY1Byb21pc2U7XG4gICAgfVxufVxuIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQWlCQTs7QUFDQTs7QUFDQTs7QUFuQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFtQ2UsTUFBTUEsV0FBTixDQUFrQjtFQVM3QkMsV0FBVyxDQUFDQyxLQUFELEVBQWdCQyxXQUFoQixFQUF5RjtJQUFBLElBQXZDQyxjQUF1Qyx1RUFBTixJQUFNO0lBQUEsS0FBdkNBLGNBQXVDLEdBQXZDQSxjQUF1QztJQUFBO0lBQUE7SUFBQSxxREFOcEUsSUFNb0U7SUFBQSxxREFMbEQsSUFLa0Q7SUFBQSwyREFKOUQsSUFJOEQ7SUFBQSw2REFIcEUsQ0FHb0U7SUFBQSx5REFGckQsSUFFcUQ7SUFBQSxzREFrTTNFLFFBQThDO01BQUEsSUFBN0M7UUFBRUMsWUFBRjtRQUFnQkM7TUFBaEIsQ0FBNkM7TUFDbkUsSUFBSUMsR0FBSjs7TUFDQSxJQUFJRixZQUFKLEVBQWtCO1FBQ2QsS0FBS0csTUFBTCxDQUFZQyxNQUFa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