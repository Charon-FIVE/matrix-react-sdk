"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Type = exports.PlainPart = exports.PillPart = exports.PartCreator = exports.EmojiPart = exports.CommandPartCreator = void 0;
exports.getAutoCompleteCreator = getAutoCompleteCreator;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _lodash = require("lodash");

var _emojibaseRegex = _interopRequireDefault(require("emojibase-regex"));

var _autocomplete = _interopRequireDefault(require("./autocomplete"));

var _HtmlUtils = require("../HtmlUtils");

var Avatar = _interopRequireWildcard(require("../Avatar"));

var _dispatcher = _interopRequireDefault(require("../dispatcher/dispatcher"));

var _actions = require("../dispatcher/actions");

var _SettingsStore = _interopRequireDefault(require("../settings/SettingsStore"));

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

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
let Type;
exports.Type = Type;

(function (Type) {
  Type["Plain"] = "plain";
  Type["Newline"] = "newline";
  Type["Emoji"] = "emoji";
  Type["Command"] = "command";
  Type["UserPill"] = "user-pill";
  Type["RoomPill"] = "room-pill";
  Type["AtRoomPill"] = "at-room-pill";
  Type["PillCandidate"] = "pill-candidate";
})(Type || (exports.Type = Type = {}));

class BasePart {
  constructor() {
    let text = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "";
    (0, _defineProperty2.default)(this, "_text", void 0);
    this._text = text;
  } // chr can also be a grapheme cluster


  acceptsInsertion(chr, offset, inputType) {
    return true;
  }

  acceptsRemoval(position, chr) {
    return true;
  }

  merge(part) {
    return false;
  }

  split(offset) {
    const splitText = this.text.slice(offset);
    this._text = this.text.slice(0, offset);
    return new PlainPart(splitText);
  } // removes len chars, or returns the plain text this part should be replaced with
  // if the part would become invalid if it removed everything.


  remove(offset, len) {
    // validate
    const strWithRemoval = this.text.slice(0, offset) + this.text.slice(offset + len);

    for (let i = offset; i < len + offset; ++i) {
      const chr = this.text.charAt(i);

      if (!this.acceptsRemoval(i, chr)) {
        return strWithRemoval;
      }
    }

    this._text = strWithRemoval;
  } // append str, returns the remaining string if a character was rejected.


  appendUntilRejected(str, inputType) {
    const offset = this.text.length; // Take a copy as we will be taking chunks off the start of the string as we process them
    // To only need to grapheme split the bits of the string we're working on.

    let buffer = str;

    while (buffer) {
      // We use lodash's grapheme splitter to avoid breaking apart compound emojis
      const [char] = (0, _lodash.split)(buffer, "", 2);

      if (!this.acceptsInsertion(char, offset + str.length - buffer.length, inputType)) {
        break;
      }

      buffer = buffer.slice(char.length);
    }

    this._text += str.slice(0, str.length - buffer.length);
    return buffer || undefined;
  } // inserts str at offset if all the characters in str were accepted, otherwise don't do anything
  // return whether the str was accepted or not.


  validateAndInsert(offset, str, inputType) {
    for (let i = 0; i < str.length; ++i) {
      const chr = str.charAt(i);

      if (!this.acceptsInsertion(chr, offset + i, inputType)) {
        return false;
      }
    }

    const beforeInsert = this._text.slice(0, offset);

    const afterInsert = this._text.slice(offset);

    this._text = beforeInsert + str + afterInsert;
    return true;
  }

  createAutoComplete(updateCallback) {}

  trim(len) {
    const remaining = this._text.slice(len);

    this._text = this._text.slice(0, len);
    return remaining;
  }

  get text() {
    return this._text;
  }

  get canEdit() {
    return true;
  }

  get acceptsCaret() {
    return this.canEdit;
  }

  toString() {
    return `${this.type}(${this.text})`;
  }

  serialize() {
    return {
      type: this.type,
      text: this.text
    };
  }

}

class PlainBasePart extends BasePart {
  acceptsInsertion(chr, offset, inputType) {
    if (chr === "\n" || _emojibaseRegex.default.test(chr)) {
      return false;
    } // when not pasting or dropping text, reject characters that should start a pill candidate


    if (inputType !== "insertFromPaste" && inputType !== "insertFromDrop") {
      if (chr !== "@" && chr !== "#" && chr !== ":" && chr !== "+") {
        return true;
      } // split if we are at the beginning of the part text


      if (offset === 0) {
        return false;
      } // or split if the previous character is a space
      // or if it is a + and this is a :


      return this._text[offset - 1] !== " " && (this._text[offset - 1] !== "+" || chr !== ":");
    }

    return true;
  }

  toDOMNode() {
    return document.createTextNode(this.text);
  }

  merge(part) {
    if (part.type === this.type) {
      this._text = this.text + part.text;
      return true;
    }

    return false;
  }

  updateDOMNode(node) {
    if (node.textContent !== this.text) {
      node.textContent = this.text;
    }
  }

  canUpdateDOMNode(node) {
    return node.nodeType === Node.TEXT_NODE;
  }

} // exported for unit tests, should otherwise only be used through PartCreator


class PlainPart extends PlainBasePart {
  get type() {
    return Type.Plain;
  }

}

exports.PlainPart = PlainPart;

class PillPart extends BasePart {
  constructor(resourceId, label) {
    super(label);
    this.resourceId = resourceId;
    (0, _defineProperty2.default)(this, "onClick", void 0);
  }

  acceptsInsertion(chr) {
    return chr !== " ";
  }

  acceptsRemoval(position, chr) {
    return position !== 0; //if you remove initial # or @, pill should become plain
  }

  toDOMNode() {
    const container = document.createElement("span");
    container.setAttribute("spellcheck", "false");
    container.setAttribute("contentEditable", "false");
    container.onclick = this.onClick;
    container.className = this.className;
    container.appendChild(document.createTextNode(this.text));
    this.setAvatar(container);
    return container;
  }

  updateDOMNode(node) {
    const textNode = node.childNodes[0];

    if (textNode.textContent !== this.text) {
      textNode.textContent = this.text;
    }

    if (node.className !== this.className) {
      node.className = this.className;
    }

    if (node.onclick !== this.onClick) {
      node.onclick = this.onClick;
    }

    this.setAvatar(node);
  }

  canUpdateDOMNode(node) {
    return node.nodeType === Node.ELEMENT_NODE && node.nodeName === "SPAN" && node.childNodes.length === 1 && node.childNodes[0].nodeType === Node.TEXT_NODE;
  } // helper method for subclasses


  setAvatarVars(node, avatarUrl, initialLetter) {
    const avatarBackground = `url('${avatarUrl}')`;
    const avatarLetter = `'${initialLetter}'`; // check if the value is changing,
    // otherwise the avatars flicker on every keystroke while updating.

    if (node.style.getPropertyValue("--avatar-background") !== avatarBackground) {
      node.style.setProperty("--avatar-background", avatarBackground);
    }

    if (node.style.getPropertyValue("--avatar-letter") !== avatarLetter) {
      node.style.setProperty("--avatar-letter", avatarLetter);
    }
  }

  serialize() {
    return {
      type: this.type,
      text: this.text,
      resourceId: this.resourceId
    };
  }

  get canEdit() {
    return false;
  }

}

exports.PillPart = PillPart;

class NewlinePart extends BasePart {
  acceptsInsertion(chr, offset) {
    return offset === 0 && chr === "\n";
  }

  acceptsRemoval(position, chr) {
    return true;
  }

  toDOMNode() {
    return document.createElement("br");
  }

  merge() {
    return false;
  }

  updateDOMNode() {}

  canUpdateDOMNode(node) {
    return node.tagName === "BR";
  }

  get type() {
    return Type.Newline;
  } // this makes the cursor skip this part when it is inserted
  // rather than trying to append to it, which is what we want.
  // As a newline can also be only one character, it makes sense
  // as it can only be one character long. This caused #9741.


  get canEdit() {
    return false;
  }

}

class EmojiPart extends BasePart {
  acceptsInsertion(chr, offset) {
    return _emojibaseRegex.default.test(chr);
  }

  acceptsRemoval(position, chr) {
    return false;
  }

  toDOMNode() {
    const span = document.createElement("span");
    span.className = "mx_Emoji";
    span.setAttribute("title", (0, _HtmlUtils.unicodeToShortcode)(this.text));
    span.appendChild(document.createTextNode(this.text));
    return span;
  }

  updateDOMNode(node) {
    const textNode = node.childNodes[0];

    if (textNode.textContent !== this.text) {
      node.setAttribute("title", (0, _HtmlUtils.unicodeToShortcode)(this.text));
      textNode.textContent = this.text;
    }
  }

  canUpdateDOMNode(node) {
    return node.className === "mx_Emoji";
  }

  get type() {
    return Type.Emoji;
  }

  get canEdit() {
    return false;
  }

  get acceptsCaret() {
    return true;
  }

}

exports.EmojiPart = EmojiPart;

class RoomPillPart extends PillPart {
  constructor(resourceId, label, room) {
    super(resourceId, label);
    this.room = room;
  }

  setAvatar(node) {
    let initialLetter = "";
    let avatarUrl = Avatar.avatarUrlForRoom(this.room, 16, 16, "crop");

    if (!avatarUrl) {
      initialLetter = Avatar.getInitialLetter(this.room ? this.room.name : this.resourceId);
      avatarUrl = Avatar.defaultAvatarUrlForString(this.room ? this.room.roomId : this.resourceId);
    }

    this.setAvatarVars(node, avatarUrl, initialLetter);
  }

  get type() {
    return Type.RoomPill;
  }

  get className() {
    return "mx_Pill " + (this.room.isSpaceRoom() ? "mx_SpacePill" : "mx_RoomPill");
  }

}

class AtRoomPillPart extends RoomPillPart {
  constructor(text, room) {
    super(text, text, room);
  }

  get type() {
    return Type.AtRoomPill;
  }

  serialize() {
    return {
      type: this.type,
      text: this.text
    };
  }

}

class UserPillPart extends PillPart {
  constructor(userId, displayName, member) {
    super(userId, displayName);
    this.member = member;
    (0, _defineProperty2.default)(this, "onClick", () => {
      _dispatcher.default.dispatch({
        action: _actions.Action.ViewUser,
        member: this.member
      });
    });
  }

  get type() {
    return Type.UserPill;
  }

  get className() {
    return "mx_UserPill mx_Pill";
  }

  setAvatar(node) {
    if (!this.member) {
      return;
    }

    const name = this.member.name || this.member.userId;
    const defaultAvatarUrl = Avatar.defaultAvatarUrlForString(this.member.userId);
    const avatarUrl = Avatar.avatarUrlForMember(this.member, 16, 16, "crop");
    let initialLetter = "";

    if (avatarUrl === defaultAvatarUrl) {
      initialLetter = Avatar.getInitialLetter(name);
    }

    this.setAvatarVars(node, avatarUrl, initialLetter);
  }

}

class PillCandidatePart extends PlainBasePart {
  constructor(text, autoCompleteCreator) {
    super(text);
    this.autoCompleteCreator = autoCompleteCreator;
  }

  createAutoComplete(updateCallback) {
    return this.autoCompleteCreator.create(updateCallback);
  }

  acceptsInsertion(chr, offset, inputType) {
    if (offset === 0) {
      return true;
    } else {
      return super.acceptsInsertion(chr, offset, inputType);
    }
  }

  merge() {
    return false;
  }

  acceptsRemoval(position, chr) {
    return true;
  }

  get type() {
    return Type.PillCandidate;
  }

}

function getAutoCompleteCreator(getAutocompleterComponent, updateQuery) {
  return partCreator => {
    return updateCallback => {
      return new _autocomplete.default(updateCallback, getAutocompleterComponent, updateQuery, partCreator);
    };
  };
}

class PartCreator {
  constructor(room, client) {
    let autoCompleteCreator = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
    this.room = room;
    this.client = client;
    (0, _defineProperty2.default)(this, "autoCompleteCreator", void 0);
    // pre-create the creator as an object even without callback so it can already be passed
    // to PillCandidatePart (e.g. while deserializing) and set later on
    this.autoCompleteCreator = {
      create: autoCompleteCreator?.(this)
    };
  }

  setAutoCompleteCreator(autoCompleteCreator) {
    this.autoCompleteCreator.create = autoCompleteCreator(this);
  }

  createPartForInput(input, partIndex, inputType) {
    switch (input[0]) {
      case "#":
      case "@":
      case ":":
      case "+":
        return this.pillCandidate("");

      case "\n":
        return new NewlinePart();

      default:
        // We use lodash's grapheme splitter to avoid breaking apart compound emojis
        if (_emojibaseRegex.default.test((0, _lodash.split)(input, "", 2)[0])) {
          return new EmojiPart();
        }

        return new PlainPart();
    }
  }

  createDefaultPart(text) {
    return this.plain(text);
  }

  deserializePart(part) {
    switch (part.type) {
      case Type.Plain:
        return this.plain(part.text);

      case Type.Newline:
        return this.newline();

      case Type.Emoji:
        return this.emoji(part.text);

      case Type.AtRoomPill:
        return this.atRoomPill(part.text);

      case Type.PillCandidate:
        return this.pillCandidate(part.text);

      case Type.RoomPill:
        return this.roomPill(part.resourceId);

      case Type.UserPill:
        return this.userPill(part.text, part.resourceId);
    }
  }

  plain(text) {
    return new PlainPart(text);
  }

  newline() {
    return new NewlinePart("\n");
  }

  emoji(text) {
    return new EmojiPart(text);
  }

  pillCandidate(text) {
    return new PillCandidatePart(text, this.autoCompleteCreator);
  }

  roomPill(alias, roomId) {
    let room;

    if (roomId || alias[0] !== "#") {
      room = this.client.getRoom(roomId || alias);
    } else {
      room = this.client.getRooms().find(r => {
        return r.getCanonicalAlias() === alias || r.getAltAliases().includes(alias);
      });
    }

    return new RoomPillPart(alias, room ? room.name : alias, room);
  }

  atRoomPill(text) {
    return new AtRoomPillPart(text, this.room);
  }

  userPill(displayName, userId) {
    const member = this.room.getMember(userId);
    return new UserPillPart(userId, displayName, member);
  }

  plainWithEmoji(text) {
    const parts = [];
    let plainText = ""; // We use lodash's grapheme splitter to avoid breaking apart compound emojis

    for (const char of (0, _lodash.split)(text, "")) {
      if (_emojibaseRegex.default.test(char)) {
        if (plainText) {
          parts.push(this.plain(plainText));
          plainText = "";
        }

        parts.push(this.emoji(char));
      } else {
        plainText += char;
      }
    }

    if (plainText) {
      parts.push(this.plain(plainText));
    }

    return parts;
  }

  createMentionParts(insertTrailingCharacter, displayName, userId) {
    const pill = this.userPill(displayName, userId);

    if (!_SettingsStore.default.getValue("MessageComposerInput.insertTrailingColon")) {
      insertTrailingCharacter = false;
    }

    const postfix = this.plain(insertTrailingCharacter ? ": " : " ");
    return [pill, postfix];
  }

} // part creator that support auto complete for /commands,
// used in SendMessageComposer


exports.PartCreator = PartCreator;

class CommandPartCreator extends PartCreator {
  createPartForInput(text, partIndex) {
    // at beginning and starts with /? create
    if (partIndex === 0 && text[0] === "/") {
      // text will be inserted by model, so pass empty string
      return this.command("");
    } else {
      return super.createPartForInput(text, partIndex);
    }
  }

  command(text) {
    return new CommandPart(text, this.autoCompleteCreator);
  }

  deserializePart(part) {
    if (part.type === Type.Command) {
      return this.command(part.text);
    } else {
      return super.deserializePart(part);
    }
  }

}

exports.CommandPartCreator = CommandPartCreator;

class CommandPart extends PillCandidatePart {
  get type() {
    return Type.Command;
  }

}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJUeXBlIiwiQmFzZVBhcnQiLCJjb25zdHJ1Y3RvciIsInRleHQiLCJfdGV4dCIsImFjY2VwdHNJbnNlcnRpb24iLCJjaHIiLCJvZmZzZXQiLCJpbnB1dFR5cGUiLCJhY2NlcHRzUmVtb3ZhbCIsInBvc2l0aW9uIiwibWVyZ2UiLCJwYXJ0Iiwic3BsaXQiLCJzcGxpdFRleHQiLCJzbGljZSIsIlBsYWluUGFydCIsInJlbW92ZSIsImxlbiIsInN0cldpdGhSZW1vdmFsIiwiaSIsImNoYXJBdCIsImFwcGVuZFVudGlsUmVqZWN0ZWQiLCJzdHIiLCJsZW5ndGgiLCJidWZmZXIiLCJjaGFyIiwidW5kZWZpbmVkIiwidmFsaWRhdGVBbmRJbnNlcnQiLCJiZWZvcmVJbnNlcnQiLCJhZnRlckluc2VydCIsImNyZWF0ZUF1dG9Db21wbGV0ZSIsInVwZGF0ZUNhbGxiYWNrIiwidHJpbSIsInJlbWFpbmluZyIsImNhbkVkaXQiLCJhY2NlcHRzQ2FyZXQiLCJ0b1N0cmluZyIsInR5cGUiLCJzZXJpYWxpemUiLCJQbGFpbkJhc2VQYXJ0IiwiRU1PSklCQVNFX1JFR0VYIiwidGVzdCIsInRvRE9NTm9kZSIsImRvY3VtZW50IiwiY3JlYXRlVGV4dE5vZGUiLCJ1cGRhdGVET01Ob2RlIiwibm9kZSIsInRleHRDb250ZW50IiwiY2FuVXBkYXRlRE9NTm9kZSIsIm5vZGVUeXBlIiwiTm9kZSIsIlRFWFRfTk9ERSIsIlBsYWluIiwiUGlsbFBhcnQiLCJyZXNvdXJjZUlkIiwibGFiZWwiLCJjb250YWluZXIiLCJjcmVhdGVFbGVtZW50Iiwic2V0QXR0cmlidXRlIiwib25jbGljayIsIm9uQ2xpY2siLCJjbGFzc05hbWUiLCJhcHBlbmRDaGlsZCIsInNldEF2YXRhciIsInRleHROb2RlIiwiY2hpbGROb2RlcyIsIkVMRU1FTlRfTk9ERSIsIm5vZGVOYW1lIiwic2V0QXZhdGFyVmFycyIsImF2YXRhclVybCIsImluaXRpYWxMZXR0ZXIiLCJhdmF0YXJCYWNrZ3JvdW5kIiwiYXZhdGFyTGV0dGVyIiwic3R5bGUiLCJnZXRQcm9wZXJ0eVZhbHVlIiwic2V0UHJvcGVydHkiLCJOZXdsaW5lUGFydCIsInRhZ05hbWUiLCJOZXdsaW5lIiwiRW1vamlQYXJ0Iiwic3BhbiIsInVuaWNvZGVUb1Nob3J0Y29kZSIsIkVtb2ppIiwiUm9vbVBpbGxQYXJ0Iiwicm9vbSIsIkF2YXRhciIsImF2YXRhclVybEZvclJvb20iLCJnZXRJbml0aWFsTGV0dGVyIiwibmFtZSIsImRlZmF1bHRBdmF0YXJVcmxGb3JTdHJpbmciLCJyb29tSWQiLCJSb29tUGlsbCIsImlzU3BhY2VSb29tIiwiQXRSb29tUGlsbFBhcnQiLCJBdFJvb21QaWxsIiwiVXNlclBpbGxQYXJ0IiwidXNlcklkIiwiZGlzcGxheU5hbWUiLCJtZW1iZXIiLCJkZWZhdWx0RGlzcGF0Y2hlciIsImRpc3BhdGNoIiwiYWN0aW9uIiwiQWN0aW9uIiwiVmlld1VzZXIiLCJVc2VyUGlsbCIsImRlZmF1bHRBdmF0YXJVcmwiLCJhdmF0YXJVcmxGb3JNZW1iZXIiLCJQaWxsQ2FuZGlkYXRlUGFydCIsImF1dG9Db21wbGV0ZUNyZWF0b3IiLCJjcmVhdGUiLCJQaWxsQ2FuZGlkYXRlIiwiZ2V0QXV0b0NvbXBsZXRlQ3JlYXRvciIsImdldEF1dG9jb21wbGV0ZXJDb21wb25lbnQiLCJ1cGRhdGVRdWVyeSIsInBhcnRDcmVhdG9yIiwiQXV0b2NvbXBsZXRlV3JhcHBlck1vZGVsIiwiUGFydENyZWF0b3IiLCJjbGllbnQiLCJzZXRBdXRvQ29tcGxldGVDcmVhdG9yIiwiY3JlYXRlUGFydEZvcklucHV0IiwiaW5wdXQiLCJwYXJ0SW5kZXgiLCJwaWxsQ2FuZGlkYXRlIiwiY3JlYXRlRGVmYXVsdFBhcnQiLCJwbGFpbiIsImRlc2VyaWFsaXplUGFydCIsIm5ld2xpbmUiLCJlbW9qaSIsImF0Um9vbVBpbGwiLCJyb29tUGlsbCIsInVzZXJQaWxsIiwiYWxpYXMiLCJnZXRSb29tIiwiZ2V0Um9vbXMiLCJmaW5kIiwiciIsImdldENhbm9uaWNhbEFsaWFzIiwiZ2V0QWx0QWxpYXNlcyIsImluY2x1ZGVzIiwiZ2V0TWVtYmVyIiwicGxhaW5XaXRoRW1vamkiLCJwYXJ0cyIsInBsYWluVGV4dCIsInB1c2giLCJjcmVhdGVNZW50aW9uUGFydHMiLCJpbnNlcnRUcmFpbGluZ0NoYXJhY3RlciIsInBpbGwiLCJTZXR0aW5nc1N0b3JlIiwiZ2V0VmFsdWUiLCJwb3N0Zml4IiwiQ29tbWFuZFBhcnRDcmVhdG9yIiwiY29tbWFuZCIsIkNvbW1hbmRQYXJ0IiwiQ29tbWFuZCJdLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9lZGl0b3IvcGFydHMudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAyMDE5IE5ldyBWZWN0b3IgTHRkXG5Db3B5cmlnaHQgMjAxOSBUaGUgTWF0cml4Lm9yZyBGb3VuZGF0aW9uIEMuSS5DLlxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbmltcG9ydCB7IHNwbGl0IH0gZnJvbSBcImxvZGFzaFwiO1xuaW1wb3J0IEVNT0pJQkFTRV9SRUdFWCBmcm9tIFwiZW1vamliYXNlLXJlZ2V4XCI7XG5pbXBvcnQgeyBNYXRyaXhDbGllbnQgfSBmcm9tIFwibWF0cml4LWpzLXNkay9zcmMvY2xpZW50XCI7XG5pbXBvcnQgeyBSb29tTWVtYmVyIH0gZnJvbSBcIm1hdHJpeC1qcy1zZGsvc3JjL21vZGVscy9yb29tLW1lbWJlclwiO1xuaW1wb3J0IHsgUm9vbSB9IGZyb20gXCJtYXRyaXgtanMtc2RrL3NyYy9tb2RlbHMvcm9vbVwiO1xuXG5pbXBvcnQgQXV0b2NvbXBsZXRlV3JhcHBlck1vZGVsLCB7XG4gICAgR2V0QXV0b2NvbXBsZXRlckNvbXBvbmVudCxcbiAgICBVcGRhdGVDYWxsYmFjayxcbiAgICBVcGRhdGVRdWVyeSxcbn0gZnJvbSBcIi4vYXV0b2NvbXBsZXRlXCI7XG5pbXBvcnQgeyB1bmljb2RlVG9TaG9ydGNvZGUgfSBmcm9tIFwiLi4vSHRtbFV0aWxzXCI7XG5pbXBvcnQgKiBhcyBBdmF0YXIgZnJvbSBcIi4uL0F2YXRhclwiO1xuaW1wb3J0IGRlZmF1bHREaXNwYXRjaGVyIGZyb20gXCIuLi9kaXNwYXRjaGVyL2Rpc3BhdGNoZXJcIjtcbmltcG9ydCB7IEFjdGlvbiB9IGZyb20gXCIuLi9kaXNwYXRjaGVyL2FjdGlvbnNcIjtcbmltcG9ydCBTZXR0aW5nc1N0b3JlIGZyb20gXCIuLi9zZXR0aW5ncy9TZXR0aW5nc1N0b3JlXCI7XG5cbmludGVyZmFjZSBJU2VyaWFsaXplZFBhcnQge1xuICAgIHR5cGU6IFR5cGUuUGxhaW4gfCBUeXBlLk5ld2xpbmUgfCBUeXBlLkVtb2ppIHwgVHlwZS5Db21tYW5kIHwgVHlwZS5QaWxsQ2FuZGlkYXRlO1xuICAgIHRleHQ6IHN0cmluZztcbn1cblxuaW50ZXJmYWNlIElTZXJpYWxpemVkUGlsbFBhcnQge1xuICAgIHR5cGU6IFR5cGUuQXRSb29tUGlsbCB8IFR5cGUuUm9vbVBpbGwgfCBUeXBlLlVzZXJQaWxsO1xuICAgIHRleHQ6IHN0cmluZztcbiAgICByZXNvdXJjZUlkPzogc3RyaW5nO1xufVxuXG5leHBvcnQgdHlwZSBTZXJpYWxpemVkUGFydCA9IElTZXJpYWxpemVkUGFydCB8IElTZXJpYWxpemVkUGlsbFBhcnQ7XG5cbmV4cG9ydCBlbnVtIFR5cGUge1xuICAgIFBsYWluID0gXCJwbGFpblwiLFxuICAgIE5ld2xpbmUgPSBcIm5ld2xpbmVcIixcbiAgICBFbW9qaSA9IFwiZW1vamlcIixcbiAgICBDb21tYW5kID0gXCJjb21tYW5kXCIsXG4gICAgVXNlclBpbGwgPSBcInVzZXItcGlsbFwiLFxuICAgIFJvb21QaWxsID0gXCJyb29tLXBpbGxcIixcbiAgICBBdFJvb21QaWxsID0gXCJhdC1yb29tLXBpbGxcIixcbiAgICBQaWxsQ2FuZGlkYXRlID0gXCJwaWxsLWNhbmRpZGF0ZVwiLFxufVxuXG5pbnRlcmZhY2UgSUJhc2VQYXJ0IHtcbiAgICB0ZXh0OiBzdHJpbmc7XG4gICAgdHlwZTogVHlwZS5QbGFpbiB8IFR5cGUuTmV3bGluZSB8IFR5cGUuRW1vamk7XG4gICAgY2FuRWRpdDogYm9vbGVhbjtcbiAgICBhY2NlcHRzQ2FyZXQ6IGJvb2xlYW47XG5cbiAgICBjcmVhdGVBdXRvQ29tcGxldGUodXBkYXRlQ2FsbGJhY2s6IFVwZGF0ZUNhbGxiYWNrKTogdm9pZDtcblxuICAgIHNlcmlhbGl6ZSgpOiBTZXJpYWxpemVkUGFydDtcbiAgICByZW1vdmUob2Zmc2V0OiBudW1iZXIsIGxlbjogbnVtYmVyKTogc3RyaW5nIHwgdW5kZWZpbmVkO1xuICAgIHNwbGl0KG9mZnNldDogbnVtYmVyKTogSUJhc2VQYXJ0O1xuICAgIHZhbGlkYXRlQW5kSW5zZXJ0KG9mZnNldDogbnVtYmVyLCBzdHI6IHN0cmluZywgaW5wdXRUeXBlOiBzdHJpbmcpOiBib29sZWFuO1xuICAgIGFwcGVuZFVudGlsUmVqZWN0ZWQoc3RyOiBzdHJpbmcsIGlucHV0VHlwZTogc3RyaW5nKTogc3RyaW5nIHwgdW5kZWZpbmVkO1xuICAgIHVwZGF0ZURPTU5vZGUobm9kZTogTm9kZSk6IHZvaWQ7XG4gICAgY2FuVXBkYXRlRE9NTm9kZShub2RlOiBOb2RlKTogYm9vbGVhbjtcbiAgICB0b0RPTU5vZGUoKTogTm9kZTtcbn1cblxuaW50ZXJmYWNlIElQaWxsQ2FuZGlkYXRlUGFydCBleHRlbmRzIE9taXQ8SUJhc2VQYXJ0LCBcInR5cGVcIiB8IFwiY3JlYXRlQXV0b0NvbXBsZXRlXCI+IHtcbiAgICB0eXBlOiBUeXBlLlBpbGxDYW5kaWRhdGUgfCBUeXBlLkNvbW1hbmQ7XG4gICAgY3JlYXRlQXV0b0NvbXBsZXRlKHVwZGF0ZUNhbGxiYWNrOiBVcGRhdGVDYWxsYmFjayk6IEF1dG9jb21wbGV0ZVdyYXBwZXJNb2RlbDtcbn1cblxuaW50ZXJmYWNlIElQaWxsUGFydCBleHRlbmRzIE9taXQ8SUJhc2VQYXJ0LCBcInR5cGVcIiB8IFwicmVzb3VyY2VJZFwiPiB7XG4gICAgdHlwZTogVHlwZS5BdFJvb21QaWxsIHwgVHlwZS5Sb29tUGlsbCB8IFR5cGUuVXNlclBpbGw7XG4gICAgcmVzb3VyY2VJZDogc3RyaW5nO1xufVxuXG5leHBvcnQgdHlwZSBQYXJ0ID0gSUJhc2VQYXJ0IHwgSVBpbGxDYW5kaWRhdGVQYXJ0IHwgSVBpbGxQYXJ0O1xuXG5hYnN0cmFjdCBjbGFzcyBCYXNlUGFydCB7XG4gICAgcHJvdGVjdGVkIF90ZXh0OiBzdHJpbmc7XG5cbiAgICBjb25zdHJ1Y3Rvcih0ZXh0ID0gXCJcIikge1xuICAgICAgICB0aGlzLl90ZXh0ID0gdGV4dDtcbiAgICB9XG5cbiAgICAvLyBjaHIgY2FuIGFsc28gYmUgYSBncmFwaGVtZSBjbHVzdGVyXG4gICAgcHJvdGVjdGVkIGFjY2VwdHNJbnNlcnRpb24oY2hyOiBzdHJpbmcsIG9mZnNldDogbnVtYmVyLCBpbnB1dFR5cGU6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICBwcm90ZWN0ZWQgYWNjZXB0c1JlbW92YWwocG9zaXRpb246IG51bWJlciwgY2hyOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgcHVibGljIG1lcmdlKHBhcnQ6IFBhcnQpOiBib29sZWFuIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIHB1YmxpYyBzcGxpdChvZmZzZXQ6IG51bWJlcik6IElCYXNlUGFydCB7XG4gICAgICAgIGNvbnN0IHNwbGl0VGV4dCA9IHRoaXMudGV4dC5zbGljZShvZmZzZXQpO1xuICAgICAgICB0aGlzLl90ZXh0ID0gdGhpcy50ZXh0LnNsaWNlKDAsIG9mZnNldCk7XG4gICAgICAgIHJldHVybiBuZXcgUGxhaW5QYXJ0KHNwbGl0VGV4dCk7XG4gICAgfVxuXG4gICAgLy8gcmVtb3ZlcyBsZW4gY2hhcnMsIG9yIHJldHVybnMgdGhlIHBsYWluIHRleHQgdGhpcyBwYXJ0IHNob3VsZCBiZSByZXBsYWNlZCB3aXRoXG4gICAgLy8gaWYgdGhlIHBhcnQgd291bGQgYmVjb21lIGludmFsaWQgaWYgaXQgcmVtb3ZlZCBldmVyeXRoaW5nLlxuICAgIHB1YmxpYyByZW1vdmUob2Zmc2V0OiBudW1iZXIsIGxlbjogbnVtYmVyKTogc3RyaW5nIHwgdW5kZWZpbmVkIHtcbiAgICAgICAgLy8gdmFsaWRhdGVcbiAgICAgICAgY29uc3Qgc3RyV2l0aFJlbW92YWwgPSB0aGlzLnRleHQuc2xpY2UoMCwgb2Zmc2V0KSArIHRoaXMudGV4dC5zbGljZShvZmZzZXQgKyBsZW4pO1xuICAgICAgICBmb3IgKGxldCBpID0gb2Zmc2V0OyBpIDwgKGxlbiArIG9mZnNldCk7ICsraSkge1xuICAgICAgICAgICAgY29uc3QgY2hyID0gdGhpcy50ZXh0LmNoYXJBdChpKTtcbiAgICAgICAgICAgIGlmICghdGhpcy5hY2NlcHRzUmVtb3ZhbChpLCBjaHIpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHN0cldpdGhSZW1vdmFsO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHRoaXMuX3RleHQgPSBzdHJXaXRoUmVtb3ZhbDtcbiAgICB9XG5cbiAgICAvLyBhcHBlbmQgc3RyLCByZXR1cm5zIHRoZSByZW1haW5pbmcgc3RyaW5nIGlmIGEgY2hhcmFjdGVyIHdhcyByZWplY3RlZC5cbiAgICBwdWJsaWMgYXBwZW5kVW50aWxSZWplY3RlZChzdHI6IHN0cmluZywgaW5wdXRUeXBlOiBzdHJpbmcpOiBzdHJpbmcgfCB1bmRlZmluZWQge1xuICAgICAgICBjb25zdCBvZmZzZXQgPSB0aGlzLnRleHQubGVuZ3RoO1xuICAgICAgICAvLyBUYWtlIGEgY29weSBhcyB3ZSB3aWxsIGJlIHRha2luZyBjaHVua3Mgb2ZmIHRoZSBzdGFydCBvZiB0aGUgc3RyaW5nIGFzIHdlIHByb2Nlc3MgdGhlbVxuICAgICAgICAvLyBUbyBvbmx5IG5lZWQgdG8gZ3JhcGhlbWUgc3BsaXQgdGhlIGJpdHMgb2YgdGhlIHN0cmluZyB3ZSdyZSB3b3JraW5nIG9uLlxuICAgICAgICBsZXQgYnVmZmVyID0gc3RyO1xuICAgICAgICB3aGlsZSAoYnVmZmVyKSB7XG4gICAgICAgICAgICAvLyBXZSB1c2UgbG9kYXNoJ3MgZ3JhcGhlbWUgc3BsaXR0ZXIgdG8gYXZvaWQgYnJlYWtpbmcgYXBhcnQgY29tcG91bmQgZW1vamlzXG4gICAgICAgICAgICBjb25zdCBbY2hhcl0gPSBzcGxpdChidWZmZXIsIFwiXCIsIDIpO1xuICAgICAgICAgICAgaWYgKCF0aGlzLmFjY2VwdHNJbnNlcnRpb24oY2hhciwgb2Zmc2V0ICsgc3RyLmxlbmd0aCAtIGJ1ZmZlci5sZW5ndGgsIGlucHV0VHlwZSkpIHtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGJ1ZmZlciA9IGJ1ZmZlci5zbGljZShjaGFyLmxlbmd0aCk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLl90ZXh0ICs9IHN0ci5zbGljZSgwLCBzdHIubGVuZ3RoIC0gYnVmZmVyLmxlbmd0aCk7XG4gICAgICAgIHJldHVybiBidWZmZXIgfHwgdW5kZWZpbmVkO1xuICAgIH1cblxuICAgIC8vIGluc2VydHMgc3RyIGF0IG9mZnNldCBpZiBhbGwgdGhlIGNoYXJhY3RlcnMgaW4gc3RyIHdlcmUgYWNjZXB0ZWQsIG90aGVyd2lzZSBkb24ndCBkbyBhbnl0aGluZ1xuICAgIC8vIHJldHVybiB3aGV0aGVyIHRoZSBzdHIgd2FzIGFjY2VwdGVkIG9yIG5vdC5cbiAgICBwdWJsaWMgdmFsaWRhdGVBbmRJbnNlcnQob2Zmc2V0OiBudW1iZXIsIHN0cjogc3RyaW5nLCBpbnB1dFR5cGU6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHN0ci5sZW5ndGg7ICsraSkge1xuICAgICAgICAgICAgY29uc3QgY2hyID0gc3RyLmNoYXJBdChpKTtcbiAgICAgICAgICAgIGlmICghdGhpcy5hY2NlcHRzSW5zZXJ0aW9uKGNociwgb2Zmc2V0ICsgaSwgaW5wdXRUeXBlKSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBjb25zdCBiZWZvcmVJbnNlcnQgPSB0aGlzLl90ZXh0LnNsaWNlKDAsIG9mZnNldCk7XG4gICAgICAgIGNvbnN0IGFmdGVySW5zZXJ0ID0gdGhpcy5fdGV4dC5zbGljZShvZmZzZXQpO1xuICAgICAgICB0aGlzLl90ZXh0ID0gYmVmb3JlSW5zZXJ0ICsgc3RyICsgYWZ0ZXJJbnNlcnQ7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIHB1YmxpYyBjcmVhdGVBdXRvQ29tcGxldGUodXBkYXRlQ2FsbGJhY2s6IFVwZGF0ZUNhbGxiYWNrKTogdm9pZCB7fVxuXG4gICAgcHJvdGVjdGVkIHRyaW0obGVuOiBudW1iZXIpOiBzdHJpbmcge1xuICAgICAgICBjb25zdCByZW1haW5pbmcgPSB0aGlzLl90ZXh0LnNsaWNlKGxlbik7XG4gICAgICAgIHRoaXMuX3RleHQgPSB0aGlzLl90ZXh0LnNsaWNlKDAsIGxlbik7XG4gICAgICAgIHJldHVybiByZW1haW5pbmc7XG4gICAgfVxuXG4gICAgcHVibGljIGdldCB0ZXh0KCk6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiB0aGlzLl90ZXh0O1xuICAgIH1cblxuICAgIHB1YmxpYyBhYnN0cmFjdCBnZXQgdHlwZSgpOiBUeXBlO1xuXG4gICAgcHVibGljIGdldCBjYW5FZGl0KCk6IGJvb2xlYW4ge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICBwdWJsaWMgZ2V0IGFjY2VwdHNDYXJldCgpOiBib29sZWFuIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuY2FuRWRpdDtcbiAgICB9XG5cbiAgICBwdWJsaWMgdG9TdHJpbmcoKTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIGAke3RoaXMudHlwZX0oJHt0aGlzLnRleHR9KWA7XG4gICAgfVxuXG4gICAgcHVibGljIHNlcmlhbGl6ZSgpOiBTZXJpYWxpemVkUGFydCB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICB0eXBlOiB0aGlzLnR5cGUgYXMgSVNlcmlhbGl6ZWRQYXJ0W1widHlwZVwiXSxcbiAgICAgICAgICAgIHRleHQ6IHRoaXMudGV4dCxcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBwdWJsaWMgYWJzdHJhY3QgdXBkYXRlRE9NTm9kZShub2RlOiBOb2RlKTogdm9pZDtcbiAgICBwdWJsaWMgYWJzdHJhY3QgY2FuVXBkYXRlRE9NTm9kZShub2RlOiBOb2RlKTogYm9vbGVhbjtcbiAgICBwdWJsaWMgYWJzdHJhY3QgdG9ET01Ob2RlKCk6IE5vZGU7XG59XG5cbmFic3RyYWN0IGNsYXNzIFBsYWluQmFzZVBhcnQgZXh0ZW5kcyBCYXNlUGFydCB7XG4gICAgcHJvdGVjdGVkIGFjY2VwdHNJbnNlcnRpb24oY2hyOiBzdHJpbmcsIG9mZnNldDogbnVtYmVyLCBpbnB1dFR5cGU6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgICAgICBpZiAoY2hyID09PSBcIlxcblwiIHx8IEVNT0pJQkFTRV9SRUdFWC50ZXN0KGNocikpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICAvLyB3aGVuIG5vdCBwYXN0aW5nIG9yIGRyb3BwaW5nIHRleHQsIHJlamVjdCBjaGFyYWN0ZXJzIHRoYXQgc2hvdWxkIHN0YXJ0IGEgcGlsbCBjYW5kaWRhdGVcbiAgICAgICAgaWYgKGlucHV0VHlwZSAhPT0gXCJpbnNlcnRGcm9tUGFzdGVcIiAmJiBpbnB1dFR5cGUgIT09IFwiaW5zZXJ0RnJvbURyb3BcIikge1xuICAgICAgICAgICAgaWYgKGNociAhPT0gXCJAXCIgJiYgY2hyICE9PSBcIiNcIiAmJiBjaHIgIT09IFwiOlwiICYmIGNociAhPT0gXCIrXCIpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gc3BsaXQgaWYgd2UgYXJlIGF0IHRoZSBiZWdpbm5pbmcgb2YgdGhlIHBhcnQgdGV4dFxuICAgICAgICAgICAgaWYgKG9mZnNldCA9PT0gMCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gb3Igc3BsaXQgaWYgdGhlIHByZXZpb3VzIGNoYXJhY3RlciBpcyBhIHNwYWNlXG4gICAgICAgICAgICAvLyBvciBpZiBpdCBpcyBhICsgYW5kIHRoaXMgaXMgYSA6XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fdGV4dFtvZmZzZXQgLSAxXSAhPT0gXCIgXCIgJiZcbiAgICAgICAgICAgICAgICAodGhpcy5fdGV4dFtvZmZzZXQgLSAxXSAhPT0gXCIrXCIgfHwgY2hyICE9PSBcIjpcIik7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgcHVibGljIHRvRE9NTm9kZSgpOiBOb2RlIHtcbiAgICAgICAgcmV0dXJuIGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKHRoaXMudGV4dCk7XG4gICAgfVxuXG4gICAgcHVibGljIG1lcmdlKHBhcnQpOiBib29sZWFuIHtcbiAgICAgICAgaWYgKHBhcnQudHlwZSA9PT0gdGhpcy50eXBlKSB7XG4gICAgICAgICAgICB0aGlzLl90ZXh0ID0gdGhpcy50ZXh0ICsgcGFydC50ZXh0O1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIHB1YmxpYyB1cGRhdGVET01Ob2RlKG5vZGU6IE5vZGUpOiB2b2lkIHtcbiAgICAgICAgaWYgKG5vZGUudGV4dENvbnRlbnQgIT09IHRoaXMudGV4dCkge1xuICAgICAgICAgICAgbm9kZS50ZXh0Q29udGVudCA9IHRoaXMudGV4dDtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHB1YmxpYyBjYW5VcGRhdGVET01Ob2RlKG5vZGU6IE5vZGUpOiBib29sZWFuIHtcbiAgICAgICAgcmV0dXJuIG5vZGUubm9kZVR5cGUgPT09IE5vZGUuVEVYVF9OT0RFO1xuICAgIH1cbn1cblxuLy8gZXhwb3J0ZWQgZm9yIHVuaXQgdGVzdHMsIHNob3VsZCBvdGhlcndpc2Ugb25seSBiZSB1c2VkIHRocm91Z2ggUGFydENyZWF0b3JcbmV4cG9ydCBjbGFzcyBQbGFpblBhcnQgZXh0ZW5kcyBQbGFpbkJhc2VQYXJ0IGltcGxlbWVudHMgSUJhc2VQYXJ0IHtcbiAgICBwdWJsaWMgZ2V0IHR5cGUoKTogSUJhc2VQYXJ0W1widHlwZVwiXSB7XG4gICAgICAgIHJldHVybiBUeXBlLlBsYWluO1xuICAgIH1cbn1cblxuZXhwb3J0IGFic3RyYWN0IGNsYXNzIFBpbGxQYXJ0IGV4dGVuZHMgQmFzZVBhcnQgaW1wbGVtZW50cyBJUGlsbFBhcnQge1xuICAgIGNvbnN0cnVjdG9yKHB1YmxpYyByZXNvdXJjZUlkOiBzdHJpbmcsIGxhYmVsKSB7XG4gICAgICAgIHN1cGVyKGxhYmVsKTtcbiAgICB9XG5cbiAgICBwcm90ZWN0ZWQgYWNjZXB0c0luc2VydGlvbihjaHI6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgICAgICByZXR1cm4gY2hyICE9PSBcIiBcIjtcbiAgICB9XG5cbiAgICBwcm90ZWN0ZWQgYWNjZXB0c1JlbW92YWwocG9zaXRpb246IG51bWJlciwgY2hyOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICAgICAgcmV0dXJuIHBvc2l0aW9uICE9PSAwOyAgLy9pZiB5b3UgcmVtb3ZlIGluaXRpYWwgIyBvciBALCBwaWxsIHNob3VsZCBiZWNvbWUgcGxhaW5cbiAgICB9XG5cbiAgICBwdWJsaWMgdG9ET01Ob2RlKCk6IE5vZGUge1xuICAgICAgICBjb25zdCBjb250YWluZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwic3BhblwiKTtcbiAgICAgICAgY29udGFpbmVyLnNldEF0dHJpYnV0ZShcInNwZWxsY2hlY2tcIiwgXCJmYWxzZVwiKTtcbiAgICAgICAgY29udGFpbmVyLnNldEF0dHJpYnV0ZShcImNvbnRlbnRFZGl0YWJsZVwiLCBcImZhbHNlXCIpO1xuICAgICAgICBjb250YWluZXIub25jbGljayA9IHRoaXMub25DbGljaztcbiAgICAgICAgY29udGFpbmVyLmNsYXNzTmFtZSA9IHRoaXMuY2xhc3NOYW1lO1xuICAgICAgICBjb250YWluZXIuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUodGhpcy50ZXh0KSk7XG4gICAgICAgIHRoaXMuc2V0QXZhdGFyKGNvbnRhaW5lcik7XG4gICAgICAgIHJldHVybiBjb250YWluZXI7XG4gICAgfVxuXG4gICAgcHVibGljIHVwZGF0ZURPTU5vZGUobm9kZTogSFRNTEVsZW1lbnQpOiB2b2lkIHtcbiAgICAgICAgY29uc3QgdGV4dE5vZGUgPSBub2RlLmNoaWxkTm9kZXNbMF07XG4gICAgICAgIGlmICh0ZXh0Tm9kZS50ZXh0Q29udGVudCAhPT0gdGhpcy50ZXh0KSB7XG4gICAgICAgICAgICB0ZXh0Tm9kZS50ZXh0Q29udGVudCA9IHRoaXMudGV4dDtcbiAgICAgICAgfVxuICAgICAgICBpZiAobm9kZS5jbGFzc05hbWUgIT09IHRoaXMuY2xhc3NOYW1lKSB7XG4gICAgICAgICAgICBub2RlLmNsYXNzTmFtZSA9IHRoaXMuY2xhc3NOYW1lO1xuICAgICAgICB9XG4gICAgICAgIGlmIChub2RlLm9uY2xpY2sgIT09IHRoaXMub25DbGljaykge1xuICAgICAgICAgICAgbm9kZS5vbmNsaWNrID0gdGhpcy5vbkNsaWNrO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuc2V0QXZhdGFyKG5vZGUpO1xuICAgIH1cblxuICAgIHB1YmxpYyBjYW5VcGRhdGVET01Ob2RlKG5vZGU6IEhUTUxFbGVtZW50KTogYm9vbGVhbiB7XG4gICAgICAgIHJldHVybiBub2RlLm5vZGVUeXBlID09PSBOb2RlLkVMRU1FTlRfTk9ERSAmJlxuICAgICAgICAgICAgICAgbm9kZS5ub2RlTmFtZSA9PT0gXCJTUEFOXCIgJiZcbiAgICAgICAgICAgICAgIG5vZGUuY2hpbGROb2Rlcy5sZW5ndGggPT09IDEgJiZcbiAgICAgICAgICAgICAgIG5vZGUuY2hpbGROb2Rlc1swXS5ub2RlVHlwZSA9PT0gTm9kZS5URVhUX05PREU7XG4gICAgfVxuXG4gICAgLy8gaGVscGVyIG1ldGhvZCBmb3Igc3ViY2xhc3Nlc1xuICAgIHByb3RlY3RlZCBzZXRBdmF0YXJWYXJzKG5vZGU6IEhUTUxFbGVtZW50LCBhdmF0YXJVcmw6IHN0cmluZywgaW5pdGlhbExldHRlcjogc3RyaW5nKTogdm9pZCB7XG4gICAgICAgIGNvbnN0IGF2YXRhckJhY2tncm91bmQgPSBgdXJsKCcke2F2YXRhclVybH0nKWA7XG4gICAgICAgIGNvbnN0IGF2YXRhckxldHRlciA9IGAnJHtpbml0aWFsTGV0dGVyfSdgO1xuICAgICAgICAvLyBjaGVjayBpZiB0aGUgdmFsdWUgaXMgY2hhbmdpbmcsXG4gICAgICAgIC8vIG90aGVyd2lzZSB0aGUgYXZhdGFycyBmbGlja2VyIG9uIGV2ZXJ5IGtleXN0cm9rZSB3aGlsZSB1cGRhdGluZy5cbiAgICAgICAgaWYgKG5vZGUuc3R5bGUuZ2V0UHJvcGVydHlWYWx1ZShcIi0tYXZhdGFyLWJhY2tncm91bmRcIikgIT09IGF2YXRhckJhY2tncm91bmQpIHtcbiAgICAgICAgICAgIG5vZGUuc3R5bGUuc2V0UHJvcGVydHkoXCItLWF2YXRhci1iYWNrZ3JvdW5kXCIsIGF2YXRhckJhY2tncm91bmQpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChub2RlLnN0eWxlLmdldFByb3BlcnR5VmFsdWUoXCItLWF2YXRhci1sZXR0ZXJcIikgIT09IGF2YXRhckxldHRlcikge1xuICAgICAgICAgICAgbm9kZS5zdHlsZS5zZXRQcm9wZXJ0eShcIi0tYXZhdGFyLWxldHRlclwiLCBhdmF0YXJMZXR0ZXIpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHVibGljIHNlcmlhbGl6ZSgpOiBJU2VyaWFsaXplZFBpbGxQYXJ0IHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHR5cGU6IHRoaXMudHlwZSxcbiAgICAgICAgICAgIHRleHQ6IHRoaXMudGV4dCxcbiAgICAgICAgICAgIHJlc291cmNlSWQ6IHRoaXMucmVzb3VyY2VJZCxcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBwdWJsaWMgZ2V0IGNhbkVkaXQoKTogYm9vbGVhbiB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBwdWJsaWMgYWJzdHJhY3QgZ2V0IHR5cGUoKTogSVBpbGxQYXJ0W1widHlwZVwiXTtcblxuICAgIHByb3RlY3RlZCBhYnN0cmFjdCBnZXQgY2xhc3NOYW1lKCk6IHN0cmluZztcblxuICAgIHByb3RlY3RlZCBvbkNsaWNrPzogKCkgPT4gdm9pZDtcblxuICAgIHByb3RlY3RlZCBhYnN0cmFjdCBzZXRBdmF0YXIobm9kZTogSFRNTEVsZW1lbnQpOiB2b2lkO1xufVxuXG5jbGFzcyBOZXdsaW5lUGFydCBleHRlbmRzIEJhc2VQYXJ0IGltcGxlbWVudHMgSUJhc2VQYXJ0IHtcbiAgICBwcm90ZWN0ZWQgYWNjZXB0c0luc2VydGlvbihjaHI6IHN0cmluZywgb2Zmc2V0OiBudW1iZXIpOiBib29sZWFuIHtcbiAgICAgICAgcmV0dXJuIG9mZnNldCA9PT0gMCAmJiBjaHIgPT09IFwiXFxuXCI7XG4gICAgfVxuXG4gICAgcHJvdGVjdGVkIGFjY2VwdHNSZW1vdmFsKHBvc2l0aW9uOiBudW1iZXIsIGNocjogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIHB1YmxpYyB0b0RPTU5vZGUoKTogTm9kZSB7XG4gICAgICAgIHJldHVybiBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiYnJcIik7XG4gICAgfVxuXG4gICAgcHVibGljIG1lcmdlKCk6IGJvb2xlYW4ge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgcHVibGljIHVwZGF0ZURPTU5vZGUoKTogdm9pZCB7fVxuXG4gICAgcHVibGljIGNhblVwZGF0ZURPTU5vZGUobm9kZTogSFRNTEVsZW1lbnQpOiBib29sZWFuIHtcbiAgICAgICAgcmV0dXJuIG5vZGUudGFnTmFtZSA9PT0gXCJCUlwiO1xuICAgIH1cblxuICAgIHB1YmxpYyBnZXQgdHlwZSgpOiBJQmFzZVBhcnRbXCJ0eXBlXCJdIHtcbiAgICAgICAgcmV0dXJuIFR5cGUuTmV3bGluZTtcbiAgICB9XG5cbiAgICAvLyB0aGlzIG1ha2VzIHRoZSBjdXJzb3Igc2tpcCB0aGlzIHBhcnQgd2hlbiBpdCBpcyBpbnNlcnRlZFxuICAgIC8vIHJhdGhlciB0aGFuIHRyeWluZyB0byBhcHBlbmQgdG8gaXQsIHdoaWNoIGlzIHdoYXQgd2Ugd2FudC5cbiAgICAvLyBBcyBhIG5ld2xpbmUgY2FuIGFsc28gYmUgb25seSBvbmUgY2hhcmFjdGVyLCBpdCBtYWtlcyBzZW5zZVxuICAgIC8vIGFzIGl0IGNhbiBvbmx5IGJlIG9uZSBjaGFyYWN0ZXIgbG9uZy4gVGhpcyBjYXVzZWQgIzk3NDEuXG4gICAgcHVibGljIGdldCBjYW5FZGl0KCk6IGJvb2xlYW4ge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxufVxuXG5leHBvcnQgY2xhc3MgRW1vamlQYXJ0IGV4dGVuZHMgQmFzZVBhcnQgaW1wbGVtZW50cyBJQmFzZVBhcnQge1xuICAgIHByb3RlY3RlZCBhY2NlcHRzSW5zZXJ0aW9uKGNocjogc3RyaW5nLCBvZmZzZXQ6IG51bWJlcik6IGJvb2xlYW4ge1xuICAgICAgICByZXR1cm4gRU1PSklCQVNFX1JFR0VYLnRlc3QoY2hyKTtcbiAgICB9XG5cbiAgICBwcm90ZWN0ZWQgYWNjZXB0c1JlbW92YWwocG9zaXRpb246IG51bWJlciwgY2hyOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIHB1YmxpYyB0b0RPTU5vZGUoKTogTm9kZSB7XG4gICAgICAgIGNvbnN0IHNwYW4gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwic3BhblwiKTtcbiAgICAgICAgc3Bhbi5jbGFzc05hbWUgPSBcIm14X0Vtb2ppXCI7XG4gICAgICAgIHNwYW4uc2V0QXR0cmlidXRlKFwidGl0bGVcIiwgdW5pY29kZVRvU2hvcnRjb2RlKHRoaXMudGV4dCkpO1xuICAgICAgICBzcGFuLmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKHRoaXMudGV4dCkpO1xuICAgICAgICByZXR1cm4gc3BhbjtcbiAgICB9XG5cbiAgICBwdWJsaWMgdXBkYXRlRE9NTm9kZShub2RlOiBIVE1MRWxlbWVudCk6IHZvaWQge1xuICAgICAgICBjb25zdCB0ZXh0Tm9kZSA9IG5vZGUuY2hpbGROb2Rlc1swXTtcbiAgICAgICAgaWYgKHRleHROb2RlLnRleHRDb250ZW50ICE9PSB0aGlzLnRleHQpIHtcbiAgICAgICAgICAgIG5vZGUuc2V0QXR0cmlidXRlKFwidGl0bGVcIiwgdW5pY29kZVRvU2hvcnRjb2RlKHRoaXMudGV4dCkpO1xuICAgICAgICAgICAgdGV4dE5vZGUudGV4dENvbnRlbnQgPSB0aGlzLnRleHQ7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwdWJsaWMgY2FuVXBkYXRlRE9NTm9kZShub2RlOiBIVE1MRWxlbWVudCk6IGJvb2xlYW4ge1xuICAgICAgICByZXR1cm4gbm9kZS5jbGFzc05hbWUgPT09IFwibXhfRW1vamlcIjtcbiAgICB9XG5cbiAgICBwdWJsaWMgZ2V0IHR5cGUoKTogSUJhc2VQYXJ0W1widHlwZVwiXSB7XG4gICAgICAgIHJldHVybiBUeXBlLkVtb2ppO1xuICAgIH1cblxuICAgIHB1YmxpYyBnZXQgY2FuRWRpdCgpOiBib29sZWFuIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIHB1YmxpYyBnZXQgYWNjZXB0c0NhcmV0KCk6IGJvb2xlYW4ge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG59XG5cbmNsYXNzIFJvb21QaWxsUGFydCBleHRlbmRzIFBpbGxQYXJ0IHtcbiAgICBjb25zdHJ1Y3RvcihyZXNvdXJjZUlkOiBzdHJpbmcsIGxhYmVsOiBzdHJpbmcsIHByaXZhdGUgcm9vbTogUm9vbSkge1xuICAgICAgICBzdXBlcihyZXNvdXJjZUlkLCBsYWJlbCk7XG4gICAgfVxuXG4gICAgcHJvdGVjdGVkIHNldEF2YXRhcihub2RlOiBIVE1MRWxlbWVudCk6IHZvaWQge1xuICAgICAgICBsZXQgaW5pdGlhbExldHRlciA9IFwiXCI7XG4gICAgICAgIGxldCBhdmF0YXJVcmwgPSBBdmF0YXIuYXZhdGFyVXJsRm9yUm9vbSh0aGlzLnJvb20sIDE2LCAxNiwgXCJjcm9wXCIpO1xuICAgICAgICBpZiAoIWF2YXRhclVybCkge1xuICAgICAgICAgICAgaW5pdGlhbExldHRlciA9IEF2YXRhci5nZXRJbml0aWFsTGV0dGVyKHRoaXMucm9vbSA/IHRoaXMucm9vbS5uYW1lIDogdGhpcy5yZXNvdXJjZUlkKTtcbiAgICAgICAgICAgIGF2YXRhclVybCA9IEF2YXRhci5kZWZhdWx0QXZhdGFyVXJsRm9yU3RyaW5nKHRoaXMucm9vbSA/IHRoaXMucm9vbS5yb29tSWQgOiB0aGlzLnJlc291cmNlSWQpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuc2V0QXZhdGFyVmFycyhub2RlLCBhdmF0YXJVcmwsIGluaXRpYWxMZXR0ZXIpO1xuICAgIH1cblxuICAgIHB1YmxpYyBnZXQgdHlwZSgpOiBJUGlsbFBhcnRbXCJ0eXBlXCJdIHtcbiAgICAgICAgcmV0dXJuIFR5cGUuUm9vbVBpbGw7XG4gICAgfVxuXG4gICAgcHJvdGVjdGVkIGdldCBjbGFzc05hbWUoKSB7XG4gICAgICAgIHJldHVybiBcIm14X1BpbGwgXCIgKyAodGhpcy5yb29tLmlzU3BhY2VSb29tKCkgPyBcIm14X1NwYWNlUGlsbFwiIDogXCJteF9Sb29tUGlsbFwiKTtcbiAgICB9XG59XG5cbmNsYXNzIEF0Um9vbVBpbGxQYXJ0IGV4dGVuZHMgUm9vbVBpbGxQYXJ0IHtcbiAgICBjb25zdHJ1Y3Rvcih0ZXh0OiBzdHJpbmcsIHJvb206IFJvb20pIHtcbiAgICAgICAgc3VwZXIodGV4dCwgdGV4dCwgcm9vbSk7XG4gICAgfVxuXG4gICAgcHVibGljIGdldCB0eXBlKCk6IElQaWxsUGFydFtcInR5cGVcIl0ge1xuICAgICAgICByZXR1cm4gVHlwZS5BdFJvb21QaWxsO1xuICAgIH1cblxuICAgIHB1YmxpYyBzZXJpYWxpemUoKTogSVNlcmlhbGl6ZWRQaWxsUGFydCB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICB0eXBlOiB0aGlzLnR5cGUsXG4gICAgICAgICAgICB0ZXh0OiB0aGlzLnRleHQsXG4gICAgICAgIH07XG4gICAgfVxufVxuXG5jbGFzcyBVc2VyUGlsbFBhcnQgZXh0ZW5kcyBQaWxsUGFydCB7XG4gICAgY29uc3RydWN0b3IodXNlcklkLCBkaXNwbGF5TmFtZSwgcHJpdmF0ZSBtZW1iZXI6IFJvb21NZW1iZXIpIHtcbiAgICAgICAgc3VwZXIodXNlcklkLCBkaXNwbGF5TmFtZSk7XG4gICAgfVxuXG4gICAgcHVibGljIGdldCB0eXBlKCk6IElQaWxsUGFydFtcInR5cGVcIl0ge1xuICAgICAgICByZXR1cm4gVHlwZS5Vc2VyUGlsbDtcbiAgICB9XG5cbiAgICBwcm90ZWN0ZWQgZ2V0IGNsYXNzTmFtZSgpIHtcbiAgICAgICAgcmV0dXJuIFwibXhfVXNlclBpbGwgbXhfUGlsbFwiO1xuICAgIH1cblxuICAgIHByb3RlY3RlZCBzZXRBdmF0YXIobm9kZTogSFRNTEVsZW1lbnQpOiB2b2lkIHtcbiAgICAgICAgaWYgKCF0aGlzLm1lbWJlcikge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IG5hbWUgPSB0aGlzLm1lbWJlci5uYW1lIHx8IHRoaXMubWVtYmVyLnVzZXJJZDtcbiAgICAgICAgY29uc3QgZGVmYXVsdEF2YXRhclVybCA9IEF2YXRhci5kZWZhdWx0QXZhdGFyVXJsRm9yU3RyaW5nKHRoaXMubWVtYmVyLnVzZXJJZCk7XG4gICAgICAgIGNvbnN0IGF2YXRhclVybCA9IEF2YXRhci5hdmF0YXJVcmxGb3JNZW1iZXIodGhpcy5tZW1iZXIsIDE2LCAxNiwgXCJjcm9wXCIpO1xuICAgICAgICBsZXQgaW5pdGlhbExldHRlciA9IFwiXCI7XG4gICAgICAgIGlmIChhdmF0YXJVcmwgPT09IGRlZmF1bHRBdmF0YXJVcmwpIHtcbiAgICAgICAgICAgIGluaXRpYWxMZXR0ZXIgPSBBdmF0YXIuZ2V0SW5pdGlhbExldHRlcihuYW1lKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnNldEF2YXRhclZhcnMobm9kZSwgYXZhdGFyVXJsLCBpbml0aWFsTGV0dGVyKTtcbiAgICB9XG5cbiAgICBwcm90ZWN0ZWQgb25DbGljayA9ICgpOiB2b2lkID0+IHtcbiAgICAgICAgZGVmYXVsdERpc3BhdGNoZXIuZGlzcGF0Y2goe1xuICAgICAgICAgICAgYWN0aW9uOiBBY3Rpb24uVmlld1VzZXIsXG4gICAgICAgICAgICBtZW1iZXI6IHRoaXMubWVtYmVyLFxuICAgICAgICB9KTtcbiAgICB9O1xufVxuXG5jbGFzcyBQaWxsQ2FuZGlkYXRlUGFydCBleHRlbmRzIFBsYWluQmFzZVBhcnQgaW1wbGVtZW50cyBJUGlsbENhbmRpZGF0ZVBhcnQge1xuICAgIGNvbnN0cnVjdG9yKHRleHQ6IHN0cmluZywgcHJpdmF0ZSBhdXRvQ29tcGxldGVDcmVhdG9yOiBJQXV0b2NvbXBsZXRlQ3JlYXRvcikge1xuICAgICAgICBzdXBlcih0ZXh0KTtcbiAgICB9XG5cbiAgICBwdWJsaWMgY3JlYXRlQXV0b0NvbXBsZXRlKHVwZGF0ZUNhbGxiYWNrOiBVcGRhdGVDYWxsYmFjayk6IEF1dG9jb21wbGV0ZVdyYXBwZXJNb2RlbCB7XG4gICAgICAgIHJldHVybiB0aGlzLmF1dG9Db21wbGV0ZUNyZWF0b3IuY3JlYXRlKHVwZGF0ZUNhbGxiYWNrKTtcbiAgICB9XG5cbiAgICBwcm90ZWN0ZWQgYWNjZXB0c0luc2VydGlvbihjaHI6IHN0cmluZywgb2Zmc2V0OiBudW1iZXIsIGlucHV0VHlwZTogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgICAgIGlmIChvZmZzZXQgPT09IDApIHtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIHN1cGVyLmFjY2VwdHNJbnNlcnRpb24oY2hyLCBvZmZzZXQsIGlucHV0VHlwZSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwdWJsaWMgbWVyZ2UoKTogYm9vbGVhbiB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBwcm90ZWN0ZWQgYWNjZXB0c1JlbW92YWwocG9zaXRpb246IG51bWJlciwgY2hyOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgZ2V0IHR5cGUoKTogSVBpbGxDYW5kaWRhdGVQYXJ0W1widHlwZVwiXSB7XG4gICAgICAgIHJldHVybiBUeXBlLlBpbGxDYW5kaWRhdGU7XG4gICAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0QXV0b0NvbXBsZXRlQ3JlYXRvcihnZXRBdXRvY29tcGxldGVyQ29tcG9uZW50OiBHZXRBdXRvY29tcGxldGVyQ29tcG9uZW50LCB1cGRhdGVRdWVyeTogVXBkYXRlUXVlcnkpIHtcbiAgICByZXR1cm4gKHBhcnRDcmVhdG9yOiBQYXJ0Q3JlYXRvcikgPT4ge1xuICAgICAgICByZXR1cm4gKHVwZGF0ZUNhbGxiYWNrOiBVcGRhdGVDYWxsYmFjaykgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIG5ldyBBdXRvY29tcGxldGVXcmFwcGVyTW9kZWwoXG4gICAgICAgICAgICAgICAgdXBkYXRlQ2FsbGJhY2ssXG4gICAgICAgICAgICAgICAgZ2V0QXV0b2NvbXBsZXRlckNvbXBvbmVudCxcbiAgICAgICAgICAgICAgICB1cGRhdGVRdWVyeSxcbiAgICAgICAgICAgICAgICBwYXJ0Q3JlYXRvcixcbiAgICAgICAgICAgICk7XG4gICAgICAgIH07XG4gICAgfTtcbn1cblxudHlwZSBBdXRvQ29tcGxldGVDcmVhdG9yID0gUmV0dXJuVHlwZTx0eXBlb2YgZ2V0QXV0b0NvbXBsZXRlQ3JlYXRvcj47XG5cbmludGVyZmFjZSBJQXV0b2NvbXBsZXRlQ3JlYXRvciB7XG4gICAgY3JlYXRlKHVwZGF0ZUNhbGxiYWNrOiBVcGRhdGVDYWxsYmFjayk6IEF1dG9jb21wbGV0ZVdyYXBwZXJNb2RlbDtcbn1cblxuZXhwb3J0IGNsYXNzIFBhcnRDcmVhdG9yIHtcbiAgICBwcm90ZWN0ZWQgcmVhZG9ubHkgYXV0b0NvbXBsZXRlQ3JlYXRvcjogSUF1dG9jb21wbGV0ZUNyZWF0b3I7XG5cbiAgICBjb25zdHJ1Y3RvcihcbiAgICAgICAgcHJpdmF0ZSByZWFkb25seSByb29tOiBSb29tLFxuICAgICAgICBwcml2YXRlIHJlYWRvbmx5IGNsaWVudDogTWF0cml4Q2xpZW50LFxuICAgICAgICBhdXRvQ29tcGxldGVDcmVhdG9yOiBBdXRvQ29tcGxldGVDcmVhdG9yID0gbnVsbCxcbiAgICApIHtcbiAgICAgICAgLy8gcHJlLWNyZWF0ZSB0aGUgY3JlYXRvciBhcyBhbiBvYmplY3QgZXZlbiB3aXRob3V0IGNhbGxiYWNrIHNvIGl0IGNhbiBhbHJlYWR5IGJlIHBhc3NlZFxuICAgICAgICAvLyB0byBQaWxsQ2FuZGlkYXRlUGFydCAoZS5nLiB3aGlsZSBkZXNlcmlhbGl6aW5nKSBhbmQgc2V0IGxhdGVyIG9uXG4gICAgICAgIHRoaXMuYXV0b0NvbXBsZXRlQ3JlYXRvciA9IHsgY3JlYXRlOiBhdXRvQ29tcGxldGVDcmVhdG9yPy4odGhpcykgfTtcbiAgICB9XG5cbiAgICBwdWJsaWMgc2V0QXV0b0NvbXBsZXRlQ3JlYXRvcihhdXRvQ29tcGxldGVDcmVhdG9yOiBBdXRvQ29tcGxldGVDcmVhdG9yKTogdm9pZCB7XG4gICAgICAgIHRoaXMuYXV0b0NvbXBsZXRlQ3JlYXRvci5jcmVhdGUgPSBhdXRvQ29tcGxldGVDcmVhdG9yKHRoaXMpO1xuICAgIH1cblxuICAgIHB1YmxpYyBjcmVhdGVQYXJ0Rm9ySW5wdXQoaW5wdXQ6IHN0cmluZywgcGFydEluZGV4OiBudW1iZXIsIGlucHV0VHlwZT86IHN0cmluZyk6IFBhcnQge1xuICAgICAgICBzd2l0Y2ggKGlucHV0WzBdKSB7XG4gICAgICAgICAgICBjYXNlIFwiI1wiOlxuICAgICAgICAgICAgY2FzZSBcIkBcIjpcbiAgICAgICAgICAgIGNhc2UgXCI6XCI6XG4gICAgICAgICAgICBjYXNlIFwiK1wiOlxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLnBpbGxDYW5kaWRhdGUoXCJcIik7XG4gICAgICAgICAgICBjYXNlIFwiXFxuXCI6XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBOZXdsaW5lUGFydCgpO1xuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICAvLyBXZSB1c2UgbG9kYXNoJ3MgZ3JhcGhlbWUgc3BsaXR0ZXIgdG8gYXZvaWQgYnJlYWtpbmcgYXBhcnQgY29tcG91bmQgZW1vamlzXG4gICAgICAgICAgICAgICAgaWYgKEVNT0pJQkFTRV9SRUdFWC50ZXN0KHNwbGl0KGlucHV0LCBcIlwiLCAyKVswXSkpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBFbW9qaVBhcnQoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBQbGFpblBhcnQoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHB1YmxpYyBjcmVhdGVEZWZhdWx0UGFydCh0ZXh0OiBzdHJpbmcpOiBQYXJ0IHtcbiAgICAgICAgcmV0dXJuIHRoaXMucGxhaW4odGV4dCk7XG4gICAgfVxuXG4gICAgcHVibGljIGRlc2VyaWFsaXplUGFydChwYXJ0OiBTZXJpYWxpemVkUGFydCk6IFBhcnQge1xuICAgICAgICBzd2l0Y2ggKHBhcnQudHlwZSkge1xuICAgICAgICAgICAgY2FzZSBUeXBlLlBsYWluOlxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLnBsYWluKHBhcnQudGV4dCk7XG4gICAgICAgICAgICBjYXNlIFR5cGUuTmV3bGluZTpcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5uZXdsaW5lKCk7XG4gICAgICAgICAgICBjYXNlIFR5cGUuRW1vamk6XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuZW1vamkocGFydC50ZXh0KTtcbiAgICAgICAgICAgIGNhc2UgVHlwZS5BdFJvb21QaWxsOlxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmF0Um9vbVBpbGwocGFydC50ZXh0KTtcbiAgICAgICAgICAgIGNhc2UgVHlwZS5QaWxsQ2FuZGlkYXRlOlxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLnBpbGxDYW5kaWRhdGUocGFydC50ZXh0KTtcbiAgICAgICAgICAgIGNhc2UgVHlwZS5Sb29tUGlsbDpcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5yb29tUGlsbChwYXJ0LnJlc291cmNlSWQpO1xuICAgICAgICAgICAgY2FzZSBUeXBlLlVzZXJQaWxsOlxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLnVzZXJQaWxsKHBhcnQudGV4dCwgcGFydC5yZXNvdXJjZUlkKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHB1YmxpYyBwbGFpbih0ZXh0OiBzdHJpbmcpOiBQbGFpblBhcnQge1xuICAgICAgICByZXR1cm4gbmV3IFBsYWluUGFydCh0ZXh0KTtcbiAgICB9XG5cbiAgICBwdWJsaWMgbmV3bGluZSgpOiBOZXdsaW5lUGFydCB7XG4gICAgICAgIHJldHVybiBuZXcgTmV3bGluZVBhcnQoXCJcXG5cIik7XG4gICAgfVxuXG4gICAgcHVibGljIGVtb2ppKHRleHQ6IHN0cmluZyk6IEVtb2ppUGFydCB7XG4gICAgICAgIHJldHVybiBuZXcgRW1vamlQYXJ0KHRleHQpO1xuICAgIH1cblxuICAgIHB1YmxpYyBwaWxsQ2FuZGlkYXRlKHRleHQ6IHN0cmluZyk6IFBpbGxDYW5kaWRhdGVQYXJ0IHtcbiAgICAgICAgcmV0dXJuIG5ldyBQaWxsQ2FuZGlkYXRlUGFydCh0ZXh0LCB0aGlzLmF1dG9Db21wbGV0ZUNyZWF0b3IpO1xuICAgIH1cblxuICAgIHB1YmxpYyByb29tUGlsbChhbGlhczogc3RyaW5nLCByb29tSWQ/OiBzdHJpbmcpOiBSb29tUGlsbFBhcnQge1xuICAgICAgICBsZXQgcm9vbTtcbiAgICAgICAgaWYgKHJvb21JZCB8fCBhbGlhc1swXSAhPT0gXCIjXCIpIHtcbiAgICAgICAgICAgIHJvb20gPSB0aGlzLmNsaWVudC5nZXRSb29tKHJvb21JZCB8fCBhbGlhcyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByb29tID0gdGhpcy5jbGllbnQuZ2V0Um9vbXMoKS5maW5kKChyKSA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHIuZ2V0Q2Fub25pY2FsQWxpYXMoKSA9PT0gYWxpYXMgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgci5nZXRBbHRBbGlhc2VzKCkuaW5jbHVkZXMoYWxpYXMpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG5ldyBSb29tUGlsbFBhcnQoYWxpYXMsIHJvb20gPyByb29tLm5hbWUgOiBhbGlhcywgcm9vbSk7XG4gICAgfVxuXG4gICAgcHVibGljIGF0Um9vbVBpbGwodGV4dDogc3RyaW5nKTogQXRSb29tUGlsbFBhcnQge1xuICAgICAgICByZXR1cm4gbmV3IEF0Um9vbVBpbGxQYXJ0KHRleHQsIHRoaXMucm9vbSk7XG4gICAgfVxuXG4gICAgcHVibGljIHVzZXJQaWxsKGRpc3BsYXlOYW1lOiBzdHJpbmcsIHVzZXJJZDogc3RyaW5nKTogVXNlclBpbGxQYXJ0IHtcbiAgICAgICAgY29uc3QgbWVtYmVyID0gdGhpcy5yb29tLmdldE1lbWJlcih1c2VySWQpO1xuICAgICAgICByZXR1cm4gbmV3IFVzZXJQaWxsUGFydCh1c2VySWQsIGRpc3BsYXlOYW1lLCBtZW1iZXIpO1xuICAgIH1cblxuICAgIHB1YmxpYyBwbGFpbldpdGhFbW9qaSh0ZXh0OiBzdHJpbmcpOiAoUGxhaW5QYXJ0IHwgRW1vamlQYXJ0KVtdIHtcbiAgICAgICAgY29uc3QgcGFydHMgPSBbXTtcbiAgICAgICAgbGV0IHBsYWluVGV4dCA9IFwiXCI7XG5cbiAgICAgICAgLy8gV2UgdXNlIGxvZGFzaCdzIGdyYXBoZW1lIHNwbGl0dGVyIHRvIGF2b2lkIGJyZWFraW5nIGFwYXJ0IGNvbXBvdW5kIGVtb2ppc1xuICAgICAgICBmb3IgKGNvbnN0IGNoYXIgb2Ygc3BsaXQodGV4dCwgXCJcIikpIHtcbiAgICAgICAgICAgIGlmIChFTU9KSUJBU0VfUkVHRVgudGVzdChjaGFyKSkge1xuICAgICAgICAgICAgICAgIGlmIChwbGFpblRleHQpIHtcbiAgICAgICAgICAgICAgICAgICAgcGFydHMucHVzaCh0aGlzLnBsYWluKHBsYWluVGV4dCkpO1xuICAgICAgICAgICAgICAgICAgICBwbGFpblRleHQgPSBcIlwiO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBwYXJ0cy5wdXNoKHRoaXMuZW1vamkoY2hhcikpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBwbGFpblRleHQgKz0gY2hhcjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAocGxhaW5UZXh0KSB7XG4gICAgICAgICAgICBwYXJ0cy5wdXNoKHRoaXMucGxhaW4ocGxhaW5UZXh0KSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHBhcnRzO1xuICAgIH1cblxuICAgIHB1YmxpYyBjcmVhdGVNZW50aW9uUGFydHMoXG4gICAgICAgIGluc2VydFRyYWlsaW5nQ2hhcmFjdGVyOiBib29sZWFuLFxuICAgICAgICBkaXNwbGF5TmFtZTogc3RyaW5nLFxuICAgICAgICB1c2VySWQ6IHN0cmluZyxcbiAgICApOiBbVXNlclBpbGxQYXJ0LCBQbGFpblBhcnRdIHtcbiAgICAgICAgY29uc3QgcGlsbCA9IHRoaXMudXNlclBpbGwoZGlzcGxheU5hbWUsIHVzZXJJZCk7XG4gICAgICAgIGlmICghU2V0dGluZ3NTdG9yZS5nZXRWYWx1ZShcIk1lc3NhZ2VDb21wb3NlcklucHV0Lmluc2VydFRyYWlsaW5nQ29sb25cIikpIHtcbiAgICAgICAgICAgIGluc2VydFRyYWlsaW5nQ2hhcmFjdGVyID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgcG9zdGZpeCA9IHRoaXMucGxhaW4oaW5zZXJ0VHJhaWxpbmdDaGFyYWN0ZXIgPyBcIjogXCIgOiBcIiBcIik7XG4gICAgICAgIHJldHVybiBbcGlsbCwgcG9zdGZpeF07XG4gICAgfVxufVxuXG4vLyBwYXJ0IGNyZWF0b3IgdGhhdCBzdXBwb3J0IGF1dG8gY29tcGxldGUgZm9yIC9jb21tYW5kcyxcbi8vIHVzZWQgaW4gU2VuZE1lc3NhZ2VDb21wb3NlclxuZXhwb3J0IGNsYXNzIENvbW1hbmRQYXJ0Q3JlYXRvciBleHRlbmRzIFBhcnRDcmVhdG9yIHtcbiAgICBwdWJsaWMgY3JlYXRlUGFydEZvcklucHV0KHRleHQ6IHN0cmluZywgcGFydEluZGV4OiBudW1iZXIpOiBQYXJ0IHtcbiAgICAgICAgLy8gYXQgYmVnaW5uaW5nIGFuZCBzdGFydHMgd2l0aCAvPyBjcmVhdGVcbiAgICAgICAgaWYgKHBhcnRJbmRleCA9PT0gMCAmJiB0ZXh0WzBdID09PSBcIi9cIikge1xuICAgICAgICAgICAgLy8gdGV4dCB3aWxsIGJlIGluc2VydGVkIGJ5IG1vZGVsLCBzbyBwYXNzIGVtcHR5IHN0cmluZ1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuY29tbWFuZChcIlwiKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBzdXBlci5jcmVhdGVQYXJ0Rm9ySW5wdXQodGV4dCwgcGFydEluZGV4KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHB1YmxpYyBjb21tYW5kKHRleHQ6IHN0cmluZyk6IENvbW1hbmRQYXJ0IHtcbiAgICAgICAgcmV0dXJuIG5ldyBDb21tYW5kUGFydCh0ZXh0LCB0aGlzLmF1dG9Db21wbGV0ZUNyZWF0b3IpO1xuICAgIH1cblxuICAgIHB1YmxpYyBkZXNlcmlhbGl6ZVBhcnQocGFydDogU2VyaWFsaXplZFBhcnQpOiBQYXJ0IHtcbiAgICAgICAgaWYgKHBhcnQudHlwZSA9PT0gVHlwZS5Db21tYW5kKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5jb21tYW5kKHBhcnQudGV4dCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gc3VwZXIuZGVzZXJpYWxpemVQYXJ0KHBhcnQpO1xuICAgICAgICB9XG4gICAgfVxufVxuXG5jbGFzcyBDb21tYW5kUGFydCBleHRlbmRzIFBpbGxDYW5kaWRhdGVQYXJ0IHtcbiAgICBwdWJsaWMgZ2V0IHR5cGUoKTogSVBpbGxDYW5kaWRhdGVQYXJ0W1widHlwZVwiXSB7XG4gICAgICAgIHJldHVybiBUeXBlLkNvbW1hbmQ7XG4gICAgfVxufVxuIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFpQkE7O0FBQ0E7O0FBS0E7O0FBS0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7Ozs7OztBQWhDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtJ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