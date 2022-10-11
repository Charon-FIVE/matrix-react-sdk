"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.createSpace = exports.SpaceFeedbackPrompt = exports.SpaceCreateForm = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireWildcard(require("react"));

var _classnames = _interopRequireDefault(require("classnames"));

var _event = require("matrix-js-sdk/src/@types/event");

var _partials = require("matrix-js-sdk/src/@types/partials");

var _logger = require("matrix-js-sdk/src/logger");

var _languageHandler = require("../../../languageHandler");

var _AccessibleTooltipButton = _interopRequireDefault(require("../elements/AccessibleTooltipButton"));

var _ContextMenu = _interopRequireWildcard(require("../../structures/ContextMenu"));

var _createRoom = _interopRequireDefault(require("../../../createRoom"));

var _MatrixClientContext = _interopRequireDefault(require("../../../contexts/MatrixClientContext"));

var _SpaceBasicSettings = require("./SpaceBasicSettings");

var _AccessibleButton = _interopRequireDefault(require("../elements/AccessibleButton"));

var _Field = _interopRequireDefault(require("../elements/Field"));

var _Validation = _interopRequireDefault(require("../elements/Validation"));

var _RoomAliasField = _interopRequireDefault(require("../elements/RoomAliasField"));

var _SdkConfig = _interopRequireDefault(require("../../../SdkConfig"));

var _Modal = _interopRequireDefault(require("../../../Modal"));

var _GenericFeatureFeedbackDialog = _interopRequireDefault(require("../dialogs/GenericFeatureFeedbackDialog"));

var _SettingsStore = _interopRequireDefault(require("../../../settings/SettingsStore"));

var _KeyBindingsManager = require("../../../KeyBindingsManager");

var _KeyboardShortcuts = require("../../../accessibility/KeyboardShortcuts");

var _MatrixClientPeg = require("../../../MatrixClientPeg");

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { (0, _defineProperty2.default)(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }

const createSpace = async function (name, isPublic, alias, topic, avatar) {
  let createOpts = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : {};
  let otherOpts = arguments.length > 6 && arguments[6] !== undefined ? arguments[6] : {};
  return (0, _createRoom.default)(_objectSpread({
    createOpts: _objectSpread({
      name,
      preset: isPublic ? _partials.Preset.PublicChat : _partials.Preset.PrivateChat,
      visibility: isPublic && (await _MatrixClientPeg.MatrixClientPeg.get().doesServerSupportUnstableFeature("org.matrix.msc3827.stable")) ? _partials.Visibility.Public : _partials.Visibility.Private,
      power_level_content_override: {
        // Only allow Admins to write to the timeline to prevent hidden sync spam
        events_default: 100,
        invite: isPublic ? 0 : 50
      },
      room_alias_name: isPublic && alias ? alias.substring(1, alias.indexOf(":")) : undefined,
      topic
    }, createOpts),
    avatar,
    roomType: _event.RoomType.Space,
    historyVisibility: isPublic ? _partials.HistoryVisibility.WorldReadable : _partials.HistoryVisibility.Invited,
    spinner: false,
    encryption: false,
    andView: true,
    inlineErrors: true
  }, otherOpts));
};

exports.createSpace = createSpace;

const SpaceCreateMenuType = _ref => {
  let {
    title,
    description,
    className,
    onClick
  } = _ref;
  return /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
    className: (0, _classnames.default)("mx_SpaceCreateMenuType", className),
    onClick: onClick
  }, /*#__PURE__*/_react.default.createElement("h3", null, title), /*#__PURE__*/_react.default.createElement("span", null, description));
};

const spaceNameValidator = (0, _Validation.default)({
  rules: [{
    key: "required",
    test: async _ref2 => {
      let {
        value
      } = _ref2;
      return !!value;
    },
    invalid: () => (0, _languageHandler._t)("Please enter a name for the space")
  }]
});

const nameToLocalpart = name => {
  return name.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9_-]+/gi, "");
}; // XXX: Temporary for the Spaces release only


const SpaceFeedbackPrompt = _ref3 => {
  let {
    onClick
  } = _ref3;
  if (!_SdkConfig.default.get().bug_report_endpoint_url) return null;
  return /*#__PURE__*/_react.default.createElement("div", {
    className: "mx_SpaceFeedbackPrompt"
  }, /*#__PURE__*/_react.default.createElement("span", {
    className: "mx_SpaceFeedbackPrompt_text"
  }, (0, _languageHandler._t)("Spaces are a new feature.")), /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
    kind: "link_inline",
    onClick: () => {
      if (onClick) onClick();

      _Modal.default.createDialog(_GenericFeatureFeedbackDialog.default, {
        title: (0, _languageHandler._t)("Spaces feedback"),
        subheading: (0, _languageHandler._t)("Thank you for trying Spaces. " + "Your feedback will help inform the next versions."),
        rageshakeLabel: "spaces-feedback",
        rageshakeData: Object.fromEntries(["Spaces.allRoomsInHome", "Spaces.enabledMetaSpaces"].map(k => [k, _SettingsStore.default.getValue(k)]))
      });
    }
  }, (0, _languageHandler._t)("Give feedback.")));
};

exports.SpaceFeedbackPrompt = SpaceFeedbackPrompt;

const SpaceCreateForm = _ref4 => {
  let {
    busy,
    onSubmit,
    avatarUrl,
    setAvatar,
    name,
    setName,
    nameFieldRef,
    alias,
    aliasFieldRef,
    setAlias,
    showAliasField,
    topic,
    setTopic,
    children
  } = _ref4;
  const cli = (0, _react.useContext)(_MatrixClientContext.default);
  const domain = cli.getDomain();

  const onKeyDown = ev => {
    const action = (0, _KeyBindingsManager.getKeyBindingsManager)().getAccessibilityAction(ev);

    switch (action) {
      case _KeyboardShortcuts.KeyBindingAction.Enter:
        onSubmit(ev);
        break;
    }
  };

  return /*#__PURE__*/_react.default.createElement("form", {
    className: "mx_SpaceBasicSettings",
    onSubmit: onSubmit
  }, /*#__PURE__*/_react.default.createElement(_SpaceBasicSettings.SpaceAvatar, {
    avatarUrl: avatarUrl,
    setAvatar: setAvatar,
    avatarDisabled: busy
  }), /*#__PURE__*/_react.default.createElement(_Field.default, {
    name: "spaceName",
    label: (0, _languageHandler._t)("Name"),
    autoFocus: true,
    value: name,
    onChange: ev => {
      const newName = ev.target.value;

      if (!alias || alias === `#${nameToLocalpart(name)}:${domain}`) {
        setAlias(`#${nameToLocalpart(newName)}:${domain}`);
        aliasFieldRef.current?.validate({
          allowEmpty: true
        });
      }

      setName(newName);
    },
    onKeyDown: onKeyDown,
    ref: nameFieldRef,
    onValidate: spaceNameValidator,
    disabled: busy,
    autoComplete: "off"
  }), showAliasField ? /*#__PURE__*/_react.default.createElement(_RoomAliasField.default, {
    ref: aliasFieldRef,
    onChange: setAlias,
    domain: domain,
    value: alias,
    placeholder: name ? nameToLocalpart(name) : (0, _languageHandler._t)("e.g. my-space"),
    label: (0, _languageHandler._t)("Address"),
    disabled: busy,
    onKeyDown: onKeyDown
  }) : null, /*#__PURE__*/_react.default.createElement(_Field.default, {
    name: "spaceTopic",
    element: "textarea",
    label: (0, _languageHandler._t)("Description"),
    value: topic,
    onChange: ev => setTopic(ev.target.value),
    rows: 3,
    disabled: busy
  }), children);
};

exports.SpaceCreateForm = SpaceCreateForm;

const SpaceCreateMenu = _ref5 => {
  let {
    onFinished
  } = _ref5;
  const [visibility, setVisibility] = (0, _react.useState)(null);
  const [busy, setBusy] = (0, _react.useState)(false);
  const [name, setName] = (0, _react.useState)("");
  const spaceNameField = (0, _react.useRef)();
  const [alias, setAlias] = (0, _react.useState)("");
  const spaceAliasField = (0, _react.useRef)();
  const [avatar, setAvatar] = (0, _react.useState)(null);
  const [topic, setTopic] = (0, _react.useState)("");

  const onSpaceCreateClick = async e => {
    e.preventDefault();
    if (busy) return;
    setBusy(true); // require & validate the space name field

    if (!(await spaceNameField.current.validate({
      allowEmpty: false
    }))) {
      spaceNameField.current.focus();
      spaceNameField.current.validate({
        allowEmpty: false,
        focused: true
      });
      setBusy(false);
      return;
    }

    if (visibility === _partials.Visibility.Public && !(await spaceAliasField.current.validate({
      allowEmpty: false
    }))) {
      spaceAliasField.current.focus();
      spaceAliasField.current.validate({
        allowEmpty: false,
        focused: true
      });
      setBusy(false);
      return;
    }

    try {
      await createSpace(name, visibility === _partials.Visibility.Public, alias, topic, avatar);
      onFinished();
    } catch (e) {
      _logger.logger.error(e);
    }
  };

  let body;

  if (visibility === null) {
    body = /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, /*#__PURE__*/_react.default.createElement("h2", null, (0, _languageHandler._t)("Create a space")), /*#__PURE__*/_react.default.createElement("p", null, (0, _languageHandler._t)("Spaces are a new way to group rooms and people. What kind of Space do you want to create? " + "You can change this later.")), /*#__PURE__*/_react.default.createElement(SpaceCreateMenuType, {
      title: (0, _languageHandler._t)("Public"),
      description: (0, _languageHandler._t)("Open space for anyone, best for communities"),
      className: "mx_SpaceCreateMenuType_public",
      onClick: () => setVisibility(_partials.Visibility.Public)
    }), /*#__PURE__*/_react.default.createElement(SpaceCreateMenuType, {
      title: (0, _languageHandler._t)("Private"),
      description: (0, _languageHandler._t)("Invite only, best for yourself or teams"),
      className: "mx_SpaceCreateMenuType_private",
      onClick: () => setVisibility(_partials.Visibility.Private)
    }), /*#__PURE__*/_react.default.createElement("p", null, (0, _languageHandler._t)("To join a space you'll need an invite.")), /*#__PURE__*/_react.default.createElement(SpaceFeedbackPrompt, {
      onClick: onFinished
    }));
  } else {
    body = /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, /*#__PURE__*/_react.default.createElement(_AccessibleTooltipButton.default, {
      className: "mx_SpaceCreateMenu_back",
      onClick: () => setVisibility(null),
      title: (0, _languageHandler._t)("Go back")
    }), /*#__PURE__*/_react.default.createElement("h2", null, visibility === _partials.Visibility.Public ? (0, _languageHandler._t)("Your public space") : (0, _languageHandler._t)("Your private space")), /*#__PURE__*/_react.default.createElement("p", null, (0, _languageHandler._t)("Add some details to help people recognise it."), " ", (0, _languageHandler._t)("You can change these anytime.")), /*#__PURE__*/_react.default.createElement(SpaceCreateForm, {
      busy: busy,
      onSubmit: onSpaceCreateClick,
      setAvatar: setAvatar,
      name: name,
      setName: setName,
      nameFieldRef: spaceNameField,
      topic: topic,
      setTopic: setTopic,
      alias: alias,
      setAlias: setAlias,
      showAliasField: visibility === _partials.Visibility.Public,
      aliasFieldRef: spaceAliasField
    }), /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
      kind: "primary",
      onClick: onSpaceCreateClick,
      disabled: busy
    }, busy ? (0, _languageHandler._t)("Creating...") : (0, _languageHandler._t)("Create")));
  }

  return /*#__PURE__*/_react.default.createElement(_ContextMenu.default, {
    left: 72,
    top: 62,
    chevronOffset: 0,
    chevronFace: _ContextMenu.ChevronFace.None,
    onFinished: onFinished,
    wrapperClassName: "mx_SpaceCreateMenu_wrapper",
    managed: false,
    focusLock: true
  }, body);
};

var _default = SpaceCreateMenu;
exports.default = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJjcmVhdGVTcGFjZSIsIm5hbWUiLCJpc1B1YmxpYyIsImFsaWFzIiwidG9waWMiLCJhdmF0YXIiLCJjcmVhdGVPcHRzIiwib3RoZXJPcHRzIiwiY3JlYXRlUm9vbSIsInByZXNldCIsIlByZXNldCIsIlB1YmxpY0NoYXQiLCJQcml2YXRlQ2hhdCIsInZpc2liaWxpdHkiLCJNYXRyaXhDbGllbnRQZWciLCJnZXQiLCJkb2VzU2VydmVyU3VwcG9ydFVuc3RhYmxlRmVhdHVyZSIsIlZpc2liaWxpdHkiLCJQdWJsaWMiLCJQcml2YXRlIiwicG93ZXJfbGV2ZWxfY29udGVudF9vdmVycmlkZSIsImV2ZW50c19kZWZhdWx0IiwiaW52aXRlIiwicm9vbV9hbGlhc19uYW1lIiwic3Vic3RyaW5nIiwiaW5kZXhPZiIsInVuZGVmaW5lZCIsInJvb21UeXBlIiwiUm9vbVR5cGUiLCJTcGFjZSIsImhpc3RvcnlWaXNpYmlsaXR5IiwiSGlzdG9yeVZpc2liaWxpdHkiLCJXb3JsZFJlYWRhYmxlIiwiSW52aXRlZCIsInNwaW5uZXIiLCJlbmNyeXB0aW9uIiwiYW5kVmlldyIsImlubGluZUVycm9ycyIsIlNwYWNlQ3JlYXRlTWVudVR5cGUiLCJ0aXRsZSIsImRlc2NyaXB0aW9uIiwiY2xhc3NOYW1lIiwib25DbGljayIsImNsYXNzTmFtZXMiLCJzcGFjZU5hbWVWYWxpZGF0b3IiLCJ3aXRoVmFsaWRhdGlvbiIsInJ1bGVzIiwia2V5IiwidGVzdCIsInZhbHVlIiwiaW52YWxpZCIsIl90IiwibmFtZVRvTG9jYWxwYXJ0IiwidHJpbSIsInRvTG93ZXJDYXNlIiwicmVwbGFjZSIsIlNwYWNlRmVlZGJhY2tQcm9tcHQiLCJTZGtDb25maWciLCJidWdfcmVwb3J0X2VuZHBvaW50X3VybCIsIk1vZGFsIiwiY3JlYXRlRGlhbG9nIiwiR2VuZXJpY0ZlYXR1cmVGZWVkYmFja0RpYWxvZyIsInN1YmhlYWRpbmciLCJyYWdlc2hha2VMYWJlbCIsInJhZ2VzaGFrZURhdGEiLCJPYmplY3QiLCJmcm9tRW50cmllcyIsIm1hcCIsImsiLCJTZXR0aW5nc1N0b3JlIiwiZ2V0VmFsdWUiLCJTcGFjZUNyZWF0ZUZvcm0iLCJidXN5Iiwib25TdWJtaXQiLCJhdmF0YXJVcmwiLCJzZXRBdmF0YXIiLCJzZXROYW1lIiwibmFtZUZpZWxkUmVmIiwiYWxpYXNGaWVsZFJlZiIsInNldEFsaWFzIiwic2hvd0FsaWFzRmllbGQiLCJzZXRUb3BpYyIsImNoaWxkcmVuIiwiY2xpIiwidXNlQ29udGV4dCIsIk1hdHJpeENsaWVudENvbnRleHQiLCJkb21haW4iLCJnZXREb21haW4iLCJvbktleURvd24iLCJldiIsImFjdGlvbiIsImdldEtleUJpbmRpbmdzTWFuYWdlciIsImdldEFjY2Vzc2liaWxpdHlBY3Rpb24iLCJLZXlCaW5kaW5nQWN0aW9uIiwiRW50ZXIiLCJuZXdOYW1lIiwidGFyZ2V0IiwiY3VycmVudCIsInZhbGlkYXRlIiwiYWxsb3dFbXB0eSIsIlNwYWNlQ3JlYXRlTWVudSIsIm9uRmluaXNoZWQiLCJzZXRWaXNpYmlsaXR5IiwidXNlU3RhdGUiLCJzZXRCdXN5Iiwic3BhY2VOYW1lRmllbGQiLCJ1c2VSZWYiLCJzcGFjZUFsaWFzRmllbGQiLCJvblNwYWNlQ3JlYXRlQ2xpY2siLCJlIiwicHJldmVudERlZmF1bHQiLCJmb2N1cyIsImZvY3VzZWQiLCJsb2dnZXIiLCJlcnJvciIsImJvZHkiLCJDaGV2cm9uRmFjZSIsIk5vbmUiXSwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvY29tcG9uZW50cy92aWV3cy9zcGFjZXMvU3BhY2VDcmVhdGVNZW51LnRzeCJdLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMjEgVGhlIE1hdHJpeC5vcmcgRm91bmRhdGlvbiBDLkkuQy5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQgUmVhY3QsIHsgQ29tcG9uZW50UHJvcHMsIFJlZk9iamVjdCwgU3ludGhldGljRXZlbnQsIEtleWJvYXJkRXZlbnQsIHVzZUNvbnRleHQsIHVzZVJlZiwgdXNlU3RhdGUgfSBmcm9tIFwicmVhY3RcIjtcbmltcG9ydCBjbGFzc05hbWVzIGZyb20gXCJjbGFzc25hbWVzXCI7XG5pbXBvcnQgeyBSb29tVHlwZSB9IGZyb20gXCJtYXRyaXgtanMtc2RrL3NyYy9AdHlwZXMvZXZlbnRcIjtcbmltcG9ydCB7IElDcmVhdGVSb29tT3B0cyB9IGZyb20gXCJtYXRyaXgtanMtc2RrL3NyYy9AdHlwZXMvcmVxdWVzdHNcIjtcbmltcG9ydCB7IEhpc3RvcnlWaXNpYmlsaXR5LCBQcmVzZXQsIFZpc2liaWxpdHkgfSBmcm9tIFwibWF0cml4LWpzLXNkay9zcmMvQHR5cGVzL3BhcnRpYWxzXCI7XG5pbXBvcnQgeyBsb2dnZXIgfSBmcm9tIFwibWF0cml4LWpzLXNkay9zcmMvbG9nZ2VyXCI7XG5cbmltcG9ydCB7IF90IH0gZnJvbSBcIi4uLy4uLy4uL2xhbmd1YWdlSGFuZGxlclwiO1xuaW1wb3J0IEFjY2Vzc2libGVUb29sdGlwQnV0dG9uIGZyb20gXCIuLi9lbGVtZW50cy9BY2Nlc3NpYmxlVG9vbHRpcEJ1dHRvblwiO1xuaW1wb3J0IENvbnRleHRNZW51LCB7IENoZXZyb25GYWNlIH0gZnJvbSBcIi4uLy4uL3N0cnVjdHVyZXMvQ29udGV4dE1lbnVcIjtcbmltcG9ydCBjcmVhdGVSb29tLCB7IElPcHRzIGFzIElDcmVhdGVPcHRzIH0gZnJvbSBcIi4uLy4uLy4uL2NyZWF0ZVJvb21cIjtcbmltcG9ydCBNYXRyaXhDbGllbnRDb250ZXh0IGZyb20gXCIuLi8uLi8uLi9jb250ZXh0cy9NYXRyaXhDbGllbnRDb250ZXh0XCI7XG5pbXBvcnQgU3BhY2VCYXNpY1NldHRpbmdzLCB7IFNwYWNlQXZhdGFyIH0gZnJvbSBcIi4vU3BhY2VCYXNpY1NldHRpbmdzXCI7XG5pbXBvcnQgQWNjZXNzaWJsZUJ1dHRvbiBmcm9tIFwiLi4vZWxlbWVudHMvQWNjZXNzaWJsZUJ1dHRvblwiO1xuaW1wb3J0IEZpZWxkIGZyb20gXCIuLi9lbGVtZW50cy9GaWVsZFwiO1xuaW1wb3J0IHdpdGhWYWxpZGF0aW9uIGZyb20gXCIuLi9lbGVtZW50cy9WYWxpZGF0aW9uXCI7XG5pbXBvcnQgUm9vbUFsaWFzRmllbGQgZnJvbSBcIi4uL2VsZW1lbnRzL1Jvb21BbGlhc0ZpZWxkXCI7XG5pbXBvcnQgU2RrQ29uZmlnIGZyb20gXCIuLi8uLi8uLi9TZGtDb25maWdcIjtcbmltcG9ydCBNb2RhbCBmcm9tIFwiLi4vLi4vLi4vTW9kYWxcIjtcbmltcG9ydCBHZW5lcmljRmVhdHVyZUZlZWRiYWNrRGlhbG9nIGZyb20gXCIuLi9kaWFsb2dzL0dlbmVyaWNGZWF0dXJlRmVlZGJhY2tEaWFsb2dcIjtcbmltcG9ydCBTZXR0aW5nc1N0b3JlIGZyb20gXCIuLi8uLi8uLi9zZXR0aW5ncy9TZXR0aW5nc1N0b3JlXCI7XG5pbXBvcnQgeyBnZXRLZXlCaW5kaW5nc01hbmFnZXIgfSBmcm9tIFwiLi4vLi4vLi4vS2V5QmluZGluZ3NNYW5hZ2VyXCI7XG5pbXBvcnQgeyBLZXlCaW5kaW5nQWN0aW9uIH0gZnJvbSBcIi4uLy4uLy4uL2FjY2Vzc2liaWxpdHkvS2V5Ym9hcmRTaG9ydGN1dHNcIjtcbmltcG9ydCB7IE1hdHJpeENsaWVudFBlZyB9IGZyb20gXCIuLi8uLi8uLi9NYXRyaXhDbGllbnRQZWdcIjtcblxuZXhwb3J0IGNvbnN0IGNyZWF0ZVNwYWNlID0gYXN5bmMgKFxuICAgIG5hbWU6IHN0cmluZyxcbiAgICBpc1B1YmxpYzogYm9vbGVhbixcbiAgICBhbGlhcz86IHN0cmluZyxcbiAgICB0b3BpYz86IHN0cmluZyxcbiAgICBhdmF0YXI/OiBzdHJpbmcgfCBGaWxlLFxuICAgIGNyZWF0ZU9wdHM6IFBhcnRpYWw8SUNyZWF0ZVJvb21PcHRzPiA9IHt9LFxuICAgIG90aGVyT3B0czogUGFydGlhbDxPbWl0PElDcmVhdGVPcHRzLCBcImNyZWF0ZU9wdHNcIj4+ID0ge30sXG4pID0+IHtcbiAgICByZXR1cm4gY3JlYXRlUm9vbSh7XG4gICAgICAgIGNyZWF0ZU9wdHM6IHtcbiAgICAgICAgICAgIG5hbWUsXG4gICAgICAgICAgICBwcmVzZXQ6IGlzUHVibGljID8gUHJlc2V0LlB1YmxpY0NoYXQgOiBQcmVzZXQuUHJpdmF0ZUNoYXQsXG4gICAgICAgICAgICB2aXNpYmlsaXR5OiAoXG4gICAgICAgICAgICAgICAgaXNQdWJsaWMgJiYgYXdhaXQgTWF0cml4Q2xpZW50UGVnLmdldCgpLmRvZXNTZXJ2ZXJTdXBwb3J0VW5zdGFibGVGZWF0dXJlKFwib3JnLm1hdHJpeC5tc2MzODI3LnN0YWJsZVwiKVxuICAgICAgICAgICAgKSA/IFZpc2liaWxpdHkuUHVibGljIDogVmlzaWJpbGl0eS5Qcml2YXRlLFxuICAgICAgICAgICAgcG93ZXJfbGV2ZWxfY29udGVudF9vdmVycmlkZToge1xuICAgICAgICAgICAgICAgIC8vIE9ubHkgYWxsb3cgQWRtaW5zIHRvIHdyaXRlIHRvIHRoZSB0aW1lbGluZSB0byBwcmV2ZW50IGhpZGRlbiBzeW5jIHNwYW1cbiAgICAgICAgICAgICAgICBldmVudHNfZGVmYXVsdDogMTAwLFxuICAgICAgICAgICAgICAgIGludml0ZTogaXNQdWJsaWMgPyAwIDogNTAsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgcm9vbV9hbGlhc19uYW1lOiBpc1B1YmxpYyAmJiBhbGlhcyA/IGFsaWFzLnN1YnN0cmluZygxLCBhbGlhcy5pbmRleE9mKFwiOlwiKSkgOiB1bmRlZmluZWQsXG4gICAgICAgICAgICB0b3BpYyxcbiAgICAgICAgICAgIC4uLmNyZWF0ZU9wdHMsXG4gICAgICAgIH0sXG4gICAgICAgIGF2YXRhcixcbiAgICAgICAgcm9vbVR5cGU6IFJvb21UeXBlLlNwYWNlLFxuICAgICAgICBoaXN0b3J5VmlzaWJpbGl0eTogaXNQdWJsaWMgPyBIaXN0b3J5VmlzaWJpbGl0eS5Xb3JsZFJlYWRhYmxlIDogSGlzdG9yeVZpc2liaWxpdHkuSW52aXRlZCxcbiAgICAgICAgc3Bpbm5lcjogZmFsc2UsXG4gICAgICAgIGVuY3J5cHRpb246IGZhbHNlLFxuICAgICAgICBhbmRWaWV3OiB0cnVlLFxuICAgICAgICBpbmxpbmVFcnJvcnM6IHRydWUsXG4gICAgICAgIC4uLm90aGVyT3B0cyxcbiAgICB9KTtcbn07XG5cbmNvbnN0IFNwYWNlQ3JlYXRlTWVudVR5cGUgPSAoeyB0aXRsZSwgZGVzY3JpcHRpb24sIGNsYXNzTmFtZSwgb25DbGljayB9KSA9PiB7XG4gICAgcmV0dXJuIChcbiAgICAgICAgPEFjY2Vzc2libGVCdXR0b24gY2xhc3NOYW1lPXtjbGFzc05hbWVzKFwibXhfU3BhY2VDcmVhdGVNZW51VHlwZVwiLCBjbGFzc05hbWUpfSBvbkNsaWNrPXtvbkNsaWNrfT5cbiAgICAgICAgICAgIDxoMz57IHRpdGxlIH08L2gzPlxuICAgICAgICAgICAgPHNwYW4+eyBkZXNjcmlwdGlvbiB9PC9zcGFuPlxuICAgICAgICA8L0FjY2Vzc2libGVCdXR0b24+XG4gICAgKTtcbn07XG5cbmNvbnN0IHNwYWNlTmFtZVZhbGlkYXRvciA9IHdpdGhWYWxpZGF0aW9uKHtcbiAgICBydWxlczogW1xuICAgICAgICB7XG4gICAgICAgICAgICBrZXk6IFwicmVxdWlyZWRcIixcbiAgICAgICAgICAgIHRlc3Q6IGFzeW5jICh7IHZhbHVlIH0pID0+ICEhdmFsdWUsXG4gICAgICAgICAgICBpbnZhbGlkOiAoKSA9PiBfdChcIlBsZWFzZSBlbnRlciBhIG5hbWUgZm9yIHRoZSBzcGFjZVwiKSxcbiAgICAgICAgfSxcbiAgICBdLFxufSk7XG5cbmNvbnN0IG5hbWVUb0xvY2FscGFydCA9IChuYW1lOiBzdHJpbmcpOiBzdHJpbmcgPT4ge1xuICAgIHJldHVybiBuYW1lLnRyaW0oKS50b0xvd2VyQ2FzZSgpLnJlcGxhY2UoL1xccysvZywgXCItXCIpLnJlcGxhY2UoL1teYS16MC05Xy1dKy9naSwgXCJcIik7XG59O1xuXG4vLyBYWFg6IFRlbXBvcmFyeSBmb3IgdGhlIFNwYWNlcyByZWxlYXNlIG9ubHlcbmV4cG9ydCBjb25zdCBTcGFjZUZlZWRiYWNrUHJvbXB0ID0gKHsgb25DbGljayB9OiB7IG9uQ2xpY2s/OiAoKSA9PiB2b2lkIH0pID0+IHtcbiAgICBpZiAoIVNka0NvbmZpZy5nZXQoKS5idWdfcmVwb3J0X2VuZHBvaW50X3VybCkgcmV0dXJuIG51bGw7XG5cbiAgICByZXR1cm4gPGRpdiBjbGFzc05hbWU9XCJteF9TcGFjZUZlZWRiYWNrUHJvbXB0XCI+XG4gICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIm14X1NwYWNlRmVlZGJhY2tQcm9tcHRfdGV4dFwiPnsgX3QoXCJTcGFjZXMgYXJlIGEgbmV3IGZlYXR1cmUuXCIpIH08L3NwYW4+XG4gICAgICAgIDxBY2Nlc3NpYmxlQnV0dG9uXG4gICAgICAgICAgICBraW5kPVwibGlua19pbmxpbmVcIlxuICAgICAgICAgICAgb25DbGljaz17KCkgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChvbkNsaWNrKSBvbkNsaWNrKCk7XG4gICAgICAgICAgICAgICAgTW9kYWwuY3JlYXRlRGlhbG9nKEdlbmVyaWNGZWF0dXJlRmVlZGJhY2tEaWFsb2csIHtcbiAgICAgICAgICAgICAgICAgICAgdGl0bGU6IF90KFwiU3BhY2VzIGZlZWRiYWNrXCIpLFxuICAgICAgICAgICAgICAgICAgICBzdWJoZWFkaW5nOiBfdChcIlRoYW5rIHlvdSBmb3IgdHJ5aW5nIFNwYWNlcy4gXCIgK1xuICAgICAgICAgICAgICAgICAgICAgICAgXCJZb3VyIGZlZWRiYWNrIHdpbGwgaGVscCBpbmZvcm0gdGhlIG5leHQgdmVyc2lvbnMuXCIpLFxuICAgICAgICAgICAgICAgICAgICByYWdlc2hha2VMYWJlbDogXCJzcGFjZXMtZmVlZGJhY2tcIixcbiAgICAgICAgICAgICAgICAgICAgcmFnZXNoYWtlRGF0YTogT2JqZWN0LmZyb21FbnRyaWVzKFtcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiU3BhY2VzLmFsbFJvb21zSW5Ib21lXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICBcIlNwYWNlcy5lbmFibGVkTWV0YVNwYWNlc1wiLFxuICAgICAgICAgICAgICAgICAgICBdLm1hcChrID0+IFtrLCBTZXR0aW5nc1N0b3JlLmdldFZhbHVlKGspXSkpLFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfX1cbiAgICAgICAgPlxuICAgICAgICAgICAgeyBfdChcIkdpdmUgZmVlZGJhY2suXCIpIH1cbiAgICAgICAgPC9BY2Nlc3NpYmxlQnV0dG9uPlxuICAgIDwvZGl2Pjtcbn07XG5cbnR5cGUgQlByb3BzID0gT21pdDxDb21wb25lbnRQcm9wczx0eXBlb2YgU3BhY2VCYXNpY1NldHRpbmdzPiwgXCJuYW1lRGlzYWJsZWRcIiB8IFwidG9waWNEaXNhYmxlZFwiIHwgXCJhdmF0YXJEaXNhYmxlZFwiPjtcbmludGVyZmFjZSBJU3BhY2VDcmVhdGVGb3JtUHJvcHMgZXh0ZW5kcyBCUHJvcHMge1xuICAgIGJ1c3k6IGJvb2xlYW47XG4gICAgYWxpYXM6IHN0cmluZztcbiAgICBuYW1lRmllbGRSZWY6IFJlZk9iamVjdDxGaWVsZD47XG4gICAgYWxpYXNGaWVsZFJlZjogUmVmT2JqZWN0PFJvb21BbGlhc0ZpZWxkPjtcbiAgICBzaG93QWxpYXNGaWVsZD86IGJvb2xlYW47XG4gICAgb25TdWJtaXQoZTogU3ludGhldGljRXZlbnQpOiB2b2lkO1xuICAgIHNldEFsaWFzKGFsaWFzOiBzdHJpbmcpOiB2b2lkO1xufVxuXG5leHBvcnQgY29uc3QgU3BhY2VDcmVhdGVGb3JtOiBSZWFjdC5GQzxJU3BhY2VDcmVhdGVGb3JtUHJvcHM+ID0gKHtcbiAgICBidXN5LFxuICAgIG9uU3VibWl0LFxuICAgIGF2YXRhclVybCxcbiAgICBzZXRBdmF0YXIsXG4gICAgbmFtZSxcbiAgICBzZXROYW1lLFxuICAgIG5hbWVGaWVsZFJlZixcbiAgICBhbGlhcyxcbiAgICBhbGlhc0ZpZWxkUmVmLFxuICAgIHNldEFsaWFzLFxuICAgIHNob3dBbGlhc0ZpZWxkLFxuICAgIHRvcGljLFxuICAgIHNldFRvcGljLFxuICAgIGNoaWxkcmVuLFxufSkgPT4ge1xuICAgIGNvbnN0IGNsaSA9IHVzZUNvbnRleHQoTWF0cml4Q2xpZW50Q29udGV4dCk7XG4gICAgY29uc3QgZG9tYWluID0gY2xpLmdldERvbWFpbigpO1xuXG4gICAgY29uc3Qgb25LZXlEb3duID0gKGV2OiBLZXlib2FyZEV2ZW50KSA9PiB7XG4gICAgICAgIGNvbnN0IGFjdGlvbiA9IGdldEtleUJpbmRpbmdzTWFuYWdlcigpLmdldEFjY2Vzc2liaWxpdHlBY3Rpb24oZXYpO1xuICAgICAgICBzd2l0Y2ggKGFjdGlvbikge1xuICAgICAgICAgICAgY2FzZSBLZXlCaW5kaW5nQWN0aW9uLkVudGVyOlxuICAgICAgICAgICAgICAgIG9uU3VibWl0KGV2KTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICByZXR1cm4gPGZvcm0gY2xhc3NOYW1lPVwibXhfU3BhY2VCYXNpY1NldHRpbmdzXCIgb25TdWJtaXQ9e29uU3VibWl0fT5cbiAgICAgICAgPFNwYWNlQXZhdGFyIGF2YXRhclVybD17YXZhdGFyVXJsfSBzZXRBdmF0YXI9e3NldEF2YXRhcn0gYXZhdGFyRGlzYWJsZWQ9e2J1c3l9IC8+XG5cbiAgICAgICAgPEZpZWxkXG4gICAgICAgICAgICBuYW1lPVwic3BhY2VOYW1lXCJcbiAgICAgICAgICAgIGxhYmVsPXtfdChcIk5hbWVcIil9XG4gICAgICAgICAgICBhdXRvRm9jdXM9e3RydWV9XG4gICAgICAgICAgICB2YWx1ZT17bmFtZX1cbiAgICAgICAgICAgIG9uQ2hhbmdlPXtldiA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgbmV3TmFtZSA9IGV2LnRhcmdldC52YWx1ZTtcbiAgICAgICAgICAgICAgICBpZiAoIWFsaWFzIHx8IGFsaWFzID09PSBgIyR7bmFtZVRvTG9jYWxwYXJ0KG5hbWUpfToke2RvbWFpbn1gKSB7XG4gICAgICAgICAgICAgICAgICAgIHNldEFsaWFzKGAjJHtuYW1lVG9Mb2NhbHBhcnQobmV3TmFtZSl9OiR7ZG9tYWlufWApO1xuICAgICAgICAgICAgICAgICAgICBhbGlhc0ZpZWxkUmVmLmN1cnJlbnQ/LnZhbGlkYXRlKHsgYWxsb3dFbXB0eTogdHJ1ZSB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgc2V0TmFtZShuZXdOYW1lKTtcbiAgICAgICAgICAgIH19XG4gICAgICAgICAgICBvbktleURvd249e29uS2V5RG93bn1cbiAgICAgICAgICAgIHJlZj17bmFtZUZpZWxkUmVmfVxuICAgICAgICAgICAgb25WYWxpZGF0ZT17c3BhY2VOYW1lVmFsaWRhdG9yfVxuICAgICAgICAgICAgZGlzYWJsZWQ9e2J1c3l9XG4gICAgICAgICAgICBhdXRvQ29tcGxldGU9XCJvZmZcIlxuICAgICAgICAvPlxuXG4gICAgICAgIHsgc2hvd0FsaWFzRmllbGRcbiAgICAgICAgICAgID8gPFJvb21BbGlhc0ZpZWxkXG4gICAgICAgICAgICAgICAgcmVmPXthbGlhc0ZpZWxkUmVmfVxuICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXtzZXRBbGlhc31cbiAgICAgICAgICAgICAgICBkb21haW49e2RvbWFpbn1cbiAgICAgICAgICAgICAgICB2YWx1ZT17YWxpYXN9XG4gICAgICAgICAgICAgICAgcGxhY2Vob2xkZXI9e25hbWUgPyBuYW1lVG9Mb2NhbHBhcnQobmFtZSkgOiBfdChcImUuZy4gbXktc3BhY2VcIil9XG4gICAgICAgICAgICAgICAgbGFiZWw9e190KFwiQWRkcmVzc1wiKX1cbiAgICAgICAgICAgICAgICBkaXNhYmxlZD17YnVzeX1cbiAgICAgICAgICAgICAgICBvbktleURvd249e29uS2V5RG93bn1cbiAgICAgICAgICAgIC8+XG4gICAgICAgICAgICA6IG51bGxcbiAgICAgICAgfVxuXG4gICAgICAgIDxGaWVsZFxuICAgICAgICAgICAgbmFtZT1cInNwYWNlVG9waWNcIlxuICAgICAgICAgICAgZWxlbWVudD1cInRleHRhcmVhXCJcbiAgICAgICAgICAgIGxhYmVsPXtfdChcIkRlc2NyaXB0aW9uXCIpfVxuICAgICAgICAgICAgdmFsdWU9e3RvcGljfVxuICAgICAgICAgICAgb25DaGFuZ2U9e2V2ID0+IHNldFRvcGljKGV2LnRhcmdldC52YWx1ZSl9XG4gICAgICAgICAgICByb3dzPXszfVxuICAgICAgICAgICAgZGlzYWJsZWQ9e2J1c3l9XG4gICAgICAgIC8+XG5cbiAgICAgICAgeyBjaGlsZHJlbiB9XG4gICAgPC9mb3JtPjtcbn07XG5cbmNvbnN0IFNwYWNlQ3JlYXRlTWVudSA9ICh7IG9uRmluaXNoZWQgfSkgPT4ge1xuICAgIGNvbnN0IFt2aXNpYmlsaXR5LCBzZXRWaXNpYmlsaXR5XSA9IHVzZVN0YXRlPFZpc2liaWxpdHk+KG51bGwpO1xuICAgIGNvbnN0IFtidXN5LCBzZXRCdXN5XSA9IHVzZVN0YXRlPGJvb2xlYW4+KGZhbHNlKTtcblxuICAgIGNvbnN0IFtuYW1lLCBzZXROYW1lXSA9IHVzZVN0YXRlKFwiXCIpO1xuICAgIGNvbnN0IHNwYWNlTmFtZUZpZWxkID0gdXNlUmVmPEZpZWxkPigpO1xuICAgIGNvbnN0IFthbGlhcywgc2V0QWxpYXNdID0gdXNlU3RhdGUoXCJcIik7XG4gICAgY29uc3Qgc3BhY2VBbGlhc0ZpZWxkID0gdXNlUmVmPFJvb21BbGlhc0ZpZWxkPigpO1xuICAgIGNvbnN0IFthdmF0YXIsIHNldEF2YXRhcl0gPSB1c2VTdGF0ZTxGaWxlPihudWxsKTtcbiAgICBjb25zdCBbdG9waWMsIHNldFRvcGljXSA9IHVzZVN0YXRlPHN0cmluZz4oXCJcIik7XG5cbiAgICBjb25zdCBvblNwYWNlQ3JlYXRlQ2xpY2sgPSBhc3luYyAoZSkgPT4ge1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIGlmIChidXN5KSByZXR1cm47XG5cbiAgICAgICAgc2V0QnVzeSh0cnVlKTtcbiAgICAgICAgLy8gcmVxdWlyZSAmIHZhbGlkYXRlIHRoZSBzcGFjZSBuYW1lIGZpZWxkXG4gICAgICAgIGlmICghKGF3YWl0IHNwYWNlTmFtZUZpZWxkLmN1cnJlbnQudmFsaWRhdGUoeyBhbGxvd0VtcHR5OiBmYWxzZSB9KSkpIHtcbiAgICAgICAgICAgIHNwYWNlTmFtZUZpZWxkLmN1cnJlbnQuZm9jdXMoKTtcbiAgICAgICAgICAgIHNwYWNlTmFtZUZpZWxkLmN1cnJlbnQudmFsaWRhdGUoeyBhbGxvd0VtcHR5OiBmYWxzZSwgZm9jdXNlZDogdHJ1ZSB9KTtcbiAgICAgICAgICAgIHNldEJ1c3koZmFsc2UpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHZpc2liaWxpdHkgPT09IFZpc2liaWxpdHkuUHVibGljICYmICEoYXdhaXQgc3BhY2VBbGlhc0ZpZWxkLmN1cnJlbnQudmFsaWRhdGUoeyBhbGxvd0VtcHR5OiBmYWxzZSB9KSkpIHtcbiAgICAgICAgICAgIHNwYWNlQWxpYXNGaWVsZC5jdXJyZW50LmZvY3VzKCk7XG4gICAgICAgICAgICBzcGFjZUFsaWFzRmllbGQuY3VycmVudC52YWxpZGF0ZSh7IGFsbG93RW1wdHk6IGZhbHNlLCBmb2N1c2VkOiB0cnVlIH0pO1xuICAgICAgICAgICAgc2V0QnVzeShmYWxzZSk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgYXdhaXQgY3JlYXRlU3BhY2UoXG4gICAgICAgICAgICAgICAgbmFtZSxcbiAgICAgICAgICAgICAgICB2aXNpYmlsaXR5ID09PSBWaXNpYmlsaXR5LlB1YmxpYyxcbiAgICAgICAgICAgICAgICBhbGlhcyxcbiAgICAgICAgICAgICAgICB0b3BpYyxcbiAgICAgICAgICAgICAgICBhdmF0YXIsXG4gICAgICAgICAgICApO1xuXG4gICAgICAgICAgICBvbkZpbmlzaGVkKCk7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIGxvZ2dlci5lcnJvcihlKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBsZXQgYm9keTtcbiAgICBpZiAodmlzaWJpbGl0eSA9PT0gbnVsbCkge1xuICAgICAgICBib2R5ID0gPFJlYWN0LkZyYWdtZW50PlxuICAgICAgICAgICAgPGgyPnsgX3QoXCJDcmVhdGUgYSBzcGFjZVwiKSB9PC9oMj5cbiAgICAgICAgICAgIDxwPlxuICAgICAgICAgICAgICAgIHsgX3QoXCJTcGFjZXMgYXJlIGEgbmV3IHdheSB0byBncm91cCByb29tcyBhbmQgcGVvcGxlLiBXaGF0IGtpbmQgb2YgU3BhY2UgZG8geW91IHdhbnQgdG8gY3JlYXRlPyBcIiArXG4gICAgICAgICAgICAgICAgICBcIllvdSBjYW4gY2hhbmdlIHRoaXMgbGF0ZXIuXCIpIH1cbiAgICAgICAgICAgIDwvcD5cblxuICAgICAgICAgICAgPFNwYWNlQ3JlYXRlTWVudVR5cGVcbiAgICAgICAgICAgICAgICB0aXRsZT17X3QoXCJQdWJsaWNcIil9XG4gICAgICAgICAgICAgICAgZGVzY3JpcHRpb249e190KFwiT3BlbiBzcGFjZSBmb3IgYW55b25lLCBiZXN0IGZvciBjb21tdW5pdGllc1wiKX1cbiAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJteF9TcGFjZUNyZWF0ZU1lbnVUeXBlX3B1YmxpY1wiXG4gICAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4gc2V0VmlzaWJpbGl0eShWaXNpYmlsaXR5LlB1YmxpYyl9XG4gICAgICAgICAgICAvPlxuICAgICAgICAgICAgPFNwYWNlQ3JlYXRlTWVudVR5cGVcbiAgICAgICAgICAgICAgICB0aXRsZT17X3QoXCJQcml2YXRlXCIpfVxuICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uPXtfdChcIkludml0ZSBvbmx5LCBiZXN0IGZvciB5b3Vyc2VsZiBvciB0ZWFtc1wiKX1cbiAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJteF9TcGFjZUNyZWF0ZU1lbnVUeXBlX3ByaXZhdGVcIlxuICAgICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHNldFZpc2liaWxpdHkoVmlzaWJpbGl0eS5Qcml2YXRlKX1cbiAgICAgICAgICAgIC8+XG5cbiAgICAgICAgICAgIDxwPlxuICAgICAgICAgICAgICAgIHsgX3QoXCJUbyBqb2luIGEgc3BhY2UgeW91J2xsIG5lZWQgYW4gaW52aXRlLlwiKSB9XG4gICAgICAgICAgICA8L3A+XG5cbiAgICAgICAgICAgIDxTcGFjZUZlZWRiYWNrUHJvbXB0IG9uQ2xpY2s9e29uRmluaXNoZWR9IC8+XG4gICAgICAgIDwvUmVhY3QuRnJhZ21lbnQ+O1xuICAgIH0gZWxzZSB7XG4gICAgICAgIGJvZHkgPSA8UmVhY3QuRnJhZ21lbnQ+XG4gICAgICAgICAgICA8QWNjZXNzaWJsZVRvb2x0aXBCdXR0b25cbiAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJteF9TcGFjZUNyZWF0ZU1lbnVfYmFja1wiXG4gICAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4gc2V0VmlzaWJpbGl0eShudWxsKX1cbiAgICAgICAgICAgICAgICB0aXRsZT17X3QoXCJHbyBiYWNrXCIpfVxuICAgICAgICAgICAgLz5cblxuICAgICAgICAgICAgPGgyPlxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgdmlzaWJpbGl0eSA9PT0gVmlzaWJpbGl0eS5QdWJsaWMgPyBfdChcIllvdXIgcHVibGljIHNwYWNlXCIpIDogX3QoXCJZb3VyIHByaXZhdGUgc3BhY2VcIilcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICA8L2gyPlxuICAgICAgICAgICAgPHA+XG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBfdChcIkFkZCBzb21lIGRldGFpbHMgdG8gaGVscCBwZW9wbGUgcmVjb2duaXNlIGl0LlwiKVxuICAgICAgICAgICAgICAgIH0ge1xuICAgICAgICAgICAgICAgICAgICBfdChcIllvdSBjYW4gY2hhbmdlIHRoZXNlIGFueXRpbWUuXCIpXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgPC9wPlxuXG4gICAgICAgICAgICA8U3BhY2VDcmVhdGVGb3JtXG4gICAgICAgICAgICAgICAgYnVzeT17YnVzeX1cbiAgICAgICAgICAgICAgICBvblN1Ym1pdD17b25TcGFjZUNyZWF0ZUNsaWNrfVxuICAgICAgICAgICAgICAgIHNldEF2YXRhcj17c2V0QXZhdGFyfVxuICAgICAgICAgICAgICAgIG5hbWU9e25hbWV9XG4gICAgICAgICAgICAgICAgc2V0TmFtZT17c2V0TmFtZX1cbiAgICAgICAgICAgICAgICBuYW1lRmllbGRSZWY9e3NwYWNlTmFtZUZpZWxkfVxuICAgICAgICAgICAgICAgIHRvcGljPXt0b3BpY31cbiAgICAgICAgICAgICAgICBzZXRUb3BpYz17c2V0VG9waWN9XG4gICAgICAgICAgICAgICAgYWxpYXM9e2FsaWFzfVxuICAgICAgICAgICAgICAgIHNldEFsaWFzPXtzZXRBbGlhc31cbiAgICAgICAgICAgICAgICBzaG93QWxpYXNGaWVsZD17dmlzaWJpbGl0eSA9PT0gVmlzaWJpbGl0eS5QdWJsaWN9XG4gICAgICAgICAgICAgICAgYWxpYXNGaWVsZFJlZj17c3BhY2VBbGlhc0ZpZWxkfVxuICAgICAgICAgICAgLz5cblxuICAgICAgICAgICAgPEFjY2Vzc2libGVCdXR0b24ga2luZD1cInByaW1hcnlcIiBvbkNsaWNrPXtvblNwYWNlQ3JlYXRlQ2xpY2t9IGRpc2FibGVkPXtidXN5fT5cbiAgICAgICAgICAgICAgICB7IGJ1c3kgPyBfdChcIkNyZWF0aW5nLi4uXCIpIDogX3QoXCJDcmVhdGVcIikgfVxuICAgICAgICAgICAgPC9BY2Nlc3NpYmxlQnV0dG9uPlxuICAgICAgICA8L1JlYWN0LkZyYWdtZW50PjtcbiAgICB9XG5cbiAgICByZXR1cm4gPENvbnRleHRNZW51XG4gICAgICAgIGxlZnQ9ezcyfVxuICAgICAgICB0b3A9ezYyfVxuICAgICAgICBjaGV2cm9uT2Zmc2V0PXswfVxuICAgICAgICBjaGV2cm9uRmFjZT17Q2hldnJvbkZhY2UuTm9uZX1cbiAgICAgICAgb25GaW5pc2hlZD17b25GaW5pc2hlZH1cbiAgICAgICAgd3JhcHBlckNsYXNzTmFtZT1cIm14X1NwYWNlQ3JlYXRlTWVudV93cmFwcGVyXCJcbiAgICAgICAgbWFuYWdlZD17ZmFsc2V9XG4gICAgICAgIGZvY3VzTG9jaz17dHJ1ZX1cbiAgICA+XG4gICAgICAgIHsgYm9keSB9XG4gICAgPC9Db250ZXh0TWVudT47XG59O1xuXG5leHBvcnQgZGVmYXVsdCBTcGFjZUNyZWF0ZU1lbnU7XG4iXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBZ0JBOztBQUNBOztBQUNBOztBQUVBOztBQUNBOztBQUVBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOzs7Ozs7Ozs7O0FBRU8sTUFBTUEsV0FBVyxHQUFHLGdCQUN2QkMsSUFEdUIsRUFFdkJDLFFBRnVCLEVBR3ZCQyxLQUh1QixFQUl2QkMsS0FKdUIsRUFLdkJDLE1BTHVCLEVBUXRC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