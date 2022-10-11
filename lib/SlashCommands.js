"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Commands = exports.CommandMap = exports.CommandCategories = exports.Command = void 0;
exports.getCommand = getCommand;
exports.parseCommandString = parseCommandString;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var React = _interopRequireWildcard(require("react"));

var _eventTimeline = require("matrix-js-sdk/src/models/event-timeline");

var _event = require("matrix-js-sdk/src/@types/event");

var ContentHelpers = _interopRequireWildcard(require("matrix-js-sdk/src/content-helpers"));

var _parse = require("parse5");

var _logger = require("matrix-js-sdk/src/logger");

var _MatrixClientPeg = require("./MatrixClientPeg");

var _dispatcher = _interopRequireDefault(require("./dispatcher/dispatcher"));

var _languageHandler = require("./languageHandler");

var _Modal = _interopRequireDefault(require("./Modal"));

var _MultiInviter = _interopRequireDefault(require("./utils/MultiInviter"));

var _HtmlUtils = require("./HtmlUtils");

var _QuestionDialog = _interopRequireDefault(require("./components/views/dialogs/QuestionDialog"));

var _WidgetUtils = _interopRequireDefault(require("./utils/WidgetUtils"));

var _colour = require("./utils/colour");

var _UserAddress = require("./UserAddress");

var _UrlUtils = require("./utils/UrlUtils");

var _IdentityServerUtils = require("./utils/IdentityServerUtils");

var _Permalinks = require("./utils/permalinks/Permalinks");

var _WidgetType = require("./widgets/WidgetType");

var _Jitsi = require("./widgets/Jitsi");

var _BugReportDialog = _interopRequireDefault(require("./components/views/dialogs/BugReportDialog"));

var _createRoom = require("./createRoom");

var _actions = require("./dispatcher/actions");

var _membership = require("./utils/membership");

var _SdkConfig = _interopRequireDefault(require("./SdkConfig"));

var _SettingsStore = _interopRequireDefault(require("./settings/SettingsStore"));

var _UIFeature = require("./settings/UIFeature");

var _effects = require("./effects");

var _LegacyCallHandler = _interopRequireDefault(require("./LegacyCallHandler"));

var _Rooms = require("./Rooms");

var _RoomUpgrade = require("./utils/RoomUpgrade");

var _UploadConfirmDialog = _interopRequireDefault(require("./components/views/dialogs/UploadConfirmDialog"));

var _DevtoolsDialog = _interopRequireDefault(require("./components/views/dialogs/DevtoolsDialog"));

var _RoomUpgradeWarningDialog = _interopRequireDefault(require("./components/views/dialogs/RoomUpgradeWarningDialog"));

var _InfoDialog = _interopRequireDefault(require("./components/views/dialogs/InfoDialog"));

var _SlashCommandHelpDialog = _interopRequireDefault(require("./components/views/dialogs/SlashCommandHelpDialog"));

var _UIComponents = require("./customisations/helpers/UIComponents");

var _RoomContext = require("./contexts/RoomContext");

var _RoomViewStore = require("./stores/RoomViewStore");

var _PosthogAnalytics = require("./PosthogAnalytics");

var _VoipUserMapper = _interopRequireDefault(require("./VoipUserMapper"));

var _serialize = require("./editor/serialize");

var _leaveBehaviour = require("./utils/leave-behaviour");

var _isLocalRoom = require("./utils/localRoom/isLocalRoom");

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { (0, _defineProperty2.default)(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }

const singleMxcUpload = async () => {
  return new Promise(resolve => {
    const fileSelector = document.createElement('input');
    fileSelector.setAttribute('type', 'file');

    fileSelector.onchange = ev => {
      const file = ev.target.files[0];

      _Modal.default.createDialog(_UploadConfirmDialog.default, {
        file,
        onFinished: shouldContinue => {
          resolve(shouldContinue ? _MatrixClientPeg.MatrixClientPeg.get().uploadContent(file) : null);
        }
      });
    };

    fileSelector.click();
  });
};

const CommandCategories = {
  "messages": (0, _languageHandler._td)("Messages"),
  "actions": (0, _languageHandler._td)("Actions"),
  "admin": (0, _languageHandler._td)("Admin"),
  "advanced": (0, _languageHandler._td)("Advanced"),
  "effects": (0, _languageHandler._td)("Effects"),
  "other": (0, _languageHandler._td)("Other")
};
exports.CommandCategories = CommandCategories;

class Command {
  constructor(opts) {
    (0, _defineProperty2.default)(this, "command", void 0);
    (0, _defineProperty2.default)(this, "aliases", void 0);
    (0, _defineProperty2.default)(this, "args", void 0);
    (0, _defineProperty2.default)(this, "description", void 0);
    (0, _defineProperty2.default)(this, "runFn", void 0);
    (0, _defineProperty2.default)(this, "category", void 0);
    (0, _defineProperty2.default)(this, "hideCompletionAfterSpace", void 0);
    (0, _defineProperty2.default)(this, "renderingTypes", void 0);
    (0, _defineProperty2.default)(this, "analyticsName", void 0);
    (0, _defineProperty2.default)(this, "_isEnabled", void 0);
    this.command = opts.command;
    this.aliases = opts.aliases || [];
    this.args = opts.args || "";
    this.description = opts.description;
    this.runFn = opts.runFn;
    this.category = opts.category || CommandCategories.other;
    this.hideCompletionAfterSpace = opts.hideCompletionAfterSpace || false;
    this._isEnabled = opts.isEnabled;
    this.renderingTypes = opts.renderingTypes;
    this.analyticsName = opts.analyticsName;
  }

  getCommand() {
    return `/${this.command}`;
  }

  getCommandWithArgs() {
    return this.getCommand() + " " + this.args;
  }

  run(roomId, threadId, args) {
    // if it has no runFn then its an ignored/nop command (autocomplete only) e.g `/me`
    if (!this.runFn) {
      return reject((0, _languageHandler.newTranslatableError)("Command error: Unable to handle slash command."));
    }

    const renderingType = threadId ? _RoomContext.TimelineRenderingType.Thread : _RoomContext.TimelineRenderingType.Room;

    if (this.renderingTypes && !this.renderingTypes?.includes(renderingType)) {
      return reject((0, _languageHandler.newTranslatableError)("Command error: Unable to find rendering type (%(renderingType)s)", {
        renderingType
      }));
    }

    if (this.analyticsName) {
      _PosthogAnalytics.PosthogAnalytics.instance.trackEvent({
        eventName: "SlashCommand",
        command: this.analyticsName
      });
    }

    return this.runFn.bind(this)(roomId, args);
  }

  getUsage() {
    return (0, _languageHandler._t)('Usage') + ': ' + this.getCommandWithArgs();
  }

  isEnabled() {
    return this._isEnabled ? this._isEnabled() : true;
  }

}

exports.Command = Command;

function reject(error) {
  return {
    error
  };
}

function success(promise) {
  return {
    promise
  };
}

function successSync(value) {
  return success(Promise.resolve(value));
}

const isCurrentLocalRoom = () => {
  const cli = _MatrixClientPeg.MatrixClientPeg.get();

  const room = cli.getRoom(_RoomViewStore.RoomViewStore.instance.getRoomId());
  return (0, _isLocalRoom.isLocalRoom)(room);
};
/* Disable the "unexpected this" error for these commands - all of the run
 * functions are called with `this` bound to the Command instance.
 */


const Commands = [new Command({
  command: 'spoiler',
  args: '<message>',
  description: (0, _languageHandler._td)('Sends the given message as a spoiler'),
  runFn: function (roomId, message) {
    return successSync(ContentHelpers.makeHtmlMessage(message, `<span data-mx-spoiler>${message}</span>`));
  },
  category: CommandCategories.messages
}), new Command({
  command: 'shrug',
  args: '<message>',
  description: (0, _languageHandler._td)('Prepends ¯\\_(ツ)_/¯ to a plain-text message'),
  runFn: function (roomId, args) {
    let message = '¯\\_(ツ)_/¯';

    if (args) {
      message = message + ' ' + args;
    }

    return successSync(ContentHelpers.makeTextMessage(message));
  },
  category: CommandCategories.messages
}), new Command({
  command: 'tableflip',
  args: '<message>',
  description: (0, _languageHandler._td)('Prepends (╯°□°）╯︵ ┻━┻ to a plain-text message'),
  runFn: function (roomId, args) {
    let message = '(╯°□°）╯︵ ┻━┻';

    if (args) {
      message = message + ' ' + args;
    }

    return successSync(ContentHelpers.makeTextMessage(message));
  },
  category: CommandCategories.messages
}), new Command({
  command: 'unflip',
  args: '<message>',
  description: (0, _languageHandler._td)('Prepends ┬──┬ ノ( ゜-゜ノ) to a plain-text message'),
  runFn: function (roomId, args) {
    let message = '┬──┬ ノ( ゜-゜ノ)';

    if (args) {
      message = message + ' ' + args;
    }

    return successSync(ContentHelpers.makeTextMessage(message));
  },
  category: CommandCategories.messages
}), new Command({
  command: 'lenny',
  args: '<message>',
  description: (0, _languageHandler._td)('Prepends ( ͡° ͜ʖ ͡°) to a plain-text message'),
  runFn: function (roomId, args) {
    let message = '( ͡° ͜ʖ ͡°)';

    if (args) {
      message = message + ' ' + args;
    }

    return successSync(ContentHelpers.makeTextMessage(message));
  },
  category: CommandCategories.messages
}), new Command({
  command: 'plain',
  args: '<message>',
  description: (0, _languageHandler._td)('Sends a message as plain text, without interpreting it as markdown'),
  runFn: function (roomId, messages) {
    return successSync(ContentHelpers.makeTextMessage(messages));
  },
  category: CommandCategories.messages
}), new Command({
  command: 'html',
  args: '<message>',
  description: (0, _languageHandler._td)('Sends a message as html, without interpreting it as markdown'),
  runFn: function (roomId, messages) {
    return successSync(ContentHelpers.makeHtmlMessage(messages, messages));
  },
  category: CommandCategories.messages
}), new Command({
  command: 'upgraderoom',
  args: '<new_version>',
  description: (0, _languageHandler._td)('Upgrades a room to a new version'),
  isEnabled: () => !isCurrentLocalRoom(),
  runFn: function (roomId, args) {
    if (args) {
      const cli = _MatrixClientPeg.MatrixClientPeg.get();

      const room = cli.getRoom(roomId);

      if (!room.currentState.mayClientSendStateEvent("m.room.tombstone", cli)) {
        return reject((0, _languageHandler.newTranslatableError)("You do not have the required permissions to use this command."));
      }

      const {
        finished
      } = _Modal.default.createDialog(_RoomUpgradeWarningDialog.default, {
        roomId: roomId,
        targetVersion: args
      },
      /*className=*/
      null,
      /*isPriority=*/
      false,
      /*isStatic=*/
      true);

      return success(finished.then(async _ref => {
        let [resp] = _ref;
        if (!resp?.continue) return;
        await (0, _RoomUpgrade.upgradeRoom)(room, args, resp.invite);
      }));
    }

    return reject(this.getUsage());
  },
  category: CommandCategories.admin,
  renderingTypes: [_RoomContext.TimelineRenderingType.Room]
}), new Command({
  command: 'jumptodate',
  args: '<YYYY-MM-DD>',
  description: (0, _languageHandler._td)('Jump to the given date in the timeline'),
  isEnabled: () => _SettingsStore.default.getValue("feature_jump_to_date"),
  runFn: function (roomId, args) {
    if (args) {
      return success((async () => {
        const unixTimestamp = Date.parse(args);

        if (!unixTimestamp) {
          throw (0, _languageHandler.newTranslatableError)('We were unable to understand the given date (%(inputDate)s). ' + 'Try using the format YYYY-MM-DD.', {
            inputDate: args
          });
        }

        const cli = _MatrixClientPeg.MatrixClientPeg.get();

        const {
          event_id: eventId,
          origin_server_ts: originServerTs
        } = await cli.timestampToEvent(roomId, unixTimestamp, _eventTimeline.Direction.Forward);

        _logger.logger.log(`/timestamp_to_event: found ${eventId} (${originServerTs}) for timestamp=${unixTimestamp}`);

        _dispatcher.default.dispatch({
          action: _actions.Action.ViewRoom,
          event_id: eventId,
          highlighted: true,
          room_id: roomId,
          metricsTrigger: "SlashCommand",
          metricsViaKeyboard: true
        });
      })());
    }

    return reject(this.getUsage());
  },
  category: CommandCategories.actions
}), new Command({
  command: 'nick',
  args: '<display_name>',
  description: (0, _languageHandler._td)('Changes your display nickname'),
  runFn: function (roomId, args) {
    if (args) {
      return success(_MatrixClientPeg.MatrixClientPeg.get().setDisplayName(args));
    }

    return reject(this.getUsage());
  },
  category: CommandCategories.actions,
  renderingTypes: [_RoomContext.TimelineRenderingType.Room]
}), new Command({
  command: 'myroomnick',
  aliases: ['roomnick'],
  args: '<display_name>',
  description: (0, _languageHandler._td)('Changes your display nickname in the current room only'),
  isEnabled: () => !isCurrentLocalRoom(),
  runFn: function (roomId, args) {
    if (args) {
      const cli = _MatrixClientPeg.MatrixClientPeg.get();

      const ev = cli.getRoom(roomId).currentState.getStateEvents('m.room.member', cli.getUserId());

      const content = _objectSpread(_objectSpread({}, ev ? ev.getContent() : {
        membership: 'join'
      }), {}, {
        displayname: args
      });

      return success(cli.sendStateEvent(roomId, 'm.room.member', content, cli.getUserId()));
    }

    return reject(this.getUsage());
  },
  category: CommandCategories.actions,
  renderingTypes: [_RoomContext.TimelineRenderingType.Room]
}), new Command({
  command: 'roomavatar',
  args: '[<mxc_url>]',
  description: (0, _languageHandler._td)('Changes the avatar of the current room'),
  isEnabled: () => !isCurrentLocalRoom(),
  runFn: function (roomId, args) {
    let promise = Promise.resolve(args);

    if (!args) {
      promise = singleMxcUpload();
    }

    return success(promise.then(url => {
      if (!url) return;
      return _MatrixClientPeg.MatrixClientPeg.get().sendStateEvent(roomId, 'm.room.avatar', {
        url
      }, '');
    }));
  },
  category: CommandCategories.actions,
  renderingTypes: [_RoomContext.TimelineRenderingType.Room]
}), new Command({
  command: 'myroomavatar',
  args: '[<mxc_url>]',
  description: (0, _languageHandler._td)('Changes your avatar in this current room only'),
  isEnabled: () => !isCurrentLocalRoom(),
  runFn: function (roomId, args) {
    const cli = _MatrixClientPeg.MatrixClientPeg.get();

    const room = cli.getRoom(roomId);
    const userId = cli.getUserId();
    let promise = Promise.resolve(args);

    if (!args) {
      promise = singleMxcUpload();
    }

    return success(promise.then(url => {
      if (!url) return;
      const ev = room.currentState.getStateEvents('m.room.member', userId);

      const content = _objectSpread(_objectSpread({}, ev ? ev.getContent() : {
        membership: 'join'
      }), {}, {
        avatar_url: url
      });

      return cli.sendStateEvent(roomId, 'm.room.member', content, userId);
    }));
  },
  category: CommandCategories.actions,
  renderingTypes: [_RoomContext.TimelineRenderingType.Room]
}), new Command({
  command: 'myavatar',
  args: '[<mxc_url>]',
  description: (0, _languageHandler._td)('Changes your avatar in all rooms'),
  runFn: function (roomId, args) {
    let promise = Promise.resolve(args);

    if (!args) {
      promise = singleMxcUpload();
    }

    return success(promise.then(url => {
      if (!url) return;
      return _MatrixClientPeg.MatrixClientPeg.get().setAvatarUrl(url);
    }));
  },
  category: CommandCategories.actions,
  renderingTypes: [_RoomContext.TimelineRenderingType.Room]
}), new Command({
  command: 'topic',
  args: '[<topic>]',
  description: (0, _languageHandler._td)('Gets or sets the room topic'),
  isEnabled: () => !isCurrentLocalRoom(),
  runFn: function (roomId, args) {
    const cli = _MatrixClientPeg.MatrixClientPeg.get();

    if (args) {
      const html = (0, _serialize.htmlSerializeFromMdIfNeeded)(args, {
        forceHTML: false
      });
      return success(cli.setRoomTopic(roomId, args, html));
    }

    const room = cli.getRoom(roomId);

    if (!room) {
      return reject((0, _languageHandler.newTranslatableError)("Failed to get room topic: Unable to find room (%(roomId)s", {
        roomId
      }));
    }

    const content = room.currentState.getStateEvents('m.room.topic', '')?.getContent();
    const topic = !!content ? ContentHelpers.parseTopicContent(content) : {
      text: (0, _languageHandler._t)('This room has no topic.')
    };

    const ref = e => e && (0, _HtmlUtils.linkifyElement)(e);

    const body = (0, _HtmlUtils.topicToHtml)(topic.text, topic.html, ref, true);

    _Modal.default.createDialog(_InfoDialog.default, {
      title: room.name,
      description: /*#__PURE__*/React.createElement("div", {
        ref: ref
      }, body),
      hasCloseButton: true,
      className: "markdown-body"
    });

    return success();
  },
  category: CommandCategories.admin,
  renderingTypes: [_RoomContext.TimelineRenderingType.Room]
}), new Command({
  command: 'roomname',
  args: '<name>',
  description: (0, _languageHandler._td)('Sets the room name'),
  isEnabled: () => !isCurrentLocalRoom(),
  runFn: function (roomId, args) {
    if (args) {
      return success(_MatrixClientPeg.MatrixClientPeg.get().setRoomName(roomId, args));
    }

    return reject(this.getUsage());
  },
  category: CommandCategories.admin,
  renderingTypes: [_RoomContext.TimelineRenderingType.Room]
}), new Command({
  command: 'invite',
  args: '<user-id> [<reason>]',
  description: (0, _languageHandler._td)('Invites user with given id to current room'),
  analyticsName: "Invite",
  isEnabled: () => !isCurrentLocalRoom() && (0, _UIComponents.shouldShowComponent)(_UIFeature.UIComponent.InviteUsers),
  runFn: function (roomId, args) {
    if (args) {
      const [address, reason] = args.split(/\s+(.+)/);

      if (address) {
        // We use a MultiInviter to re-use the invite logic, even though
        // we're only inviting one user.
        // If we need an identity server but don't have one, things
        // get a bit more complex here, but we try to show something
        // meaningful.
        let prom = Promise.resolve();

        if ((0, _UserAddress.getAddressType)(address) === _UserAddress.AddressType.Email && !_MatrixClientPeg.MatrixClientPeg.get().getIdentityServerUrl()) {
          const defaultIdentityServerUrl = (0, _IdentityServerUtils.getDefaultIdentityServerUrl)();

          if (defaultIdentityServerUrl) {
            const {
              finished
            } = _Modal.default.createDialog(_QuestionDialog.default, {
              title: (0, _languageHandler._t)("Use an identity server"),
              description: /*#__PURE__*/React.createElement("p", null, (0, _languageHandler._t)("Use an identity server to invite by email. " + "Click continue to use the default identity server " + "(%(defaultIdentityServerName)s) or manage in Settings.", {
                defaultIdentityServerName: (0, _UrlUtils.abbreviateUrl)(defaultIdentityServerUrl)
              })),
              button: (0, _languageHandler._t)("Continue")
            });

            prom = finished.then(_ref2 => {
              let [useDefault] = _ref2;

              if (useDefault) {
                (0, _IdentityServerUtils.setToDefaultIdentityServer)();
                return;
              }

              throw (0, _languageHandler.newTranslatableError)("Use an identity server to invite by email. Manage in Settings.");
            });
          } else {
            return reject((0, _languageHandler.newTranslatableError)("Use an identity server to invite by email. Manage in Settings."));
          }
        }

        const inviter = new _MultiInviter.default(roomId);
        return success(prom.then(() => {
          return inviter.invite([address], reason, true);
        }).then(() => {
          if (inviter.getCompletionState(address) !== "invited") {
            throw new Error(inviter.getErrorText(address));
          }
        }));
      }
    }

    return reject(this.getUsage());
  },
  category: CommandCategories.actions,
  renderingTypes: [_RoomContext.TimelineRenderingType.Room]
}), new Command({
  command: 'join',
  aliases: ['j', 'goto'],
  args: '<room-address>',
  description: (0, _languageHandler._td)('Joins room with given address'),
  runFn: function (roomId, args) {
    if (args) {
      // Note: we support 2 versions of this command. The first is
      // the public-facing one for most users and the other is a
      // power-user edition where someone may join via permalink or
      // room ID with optional servers. Practically, this results
      // in the following variations:
      //   /join #example:example.org
      //   /join !example:example.org
      //   /join !example:example.org altserver.com elsewhere.ca
      //   /join https://matrix.to/#/!example:example.org?via=altserver.com
      // The command also supports event permalinks transparently:
      //   /join https://matrix.to/#/!example:example.org/$something:example.org
      //   /join https://matrix.to/#/!example:example.org/$something:example.org?via=altserver.com
      const params = args.split(' ');
      if (params.length < 1) return reject(this.getUsage());
      let isPermalink = false;

      if (params[0].startsWith("http:") || params[0].startsWith("https:")) {
        // It's at least a URL - try and pull out a hostname to check against the
        // permalink handler
        const parsedUrl = new URL(params[0]);
        const hostname = parsedUrl.host || parsedUrl.hostname; // takes first non-falsey value
        // if we're using a Element permalink handler, this will catch it before we get much further.
        // see below where we make assumptions about parsing the URL.

        if ((0, _Permalinks.isPermalinkHost)(hostname)) {
          isPermalink = true;
        }
      }

      if (params[0][0] === '#') {
        let roomAlias = params[0];

        if (!roomAlias.includes(':')) {
          roomAlias += ':' + _MatrixClientPeg.MatrixClientPeg.get().getDomain();
        }

        _dispatcher.default.dispatch({
          action: _actions.Action.ViewRoom,
          room_alias: roomAlias,
          auto_join: true,
          metricsTrigger: "SlashCommand",
          metricsViaKeyboard: true
        });

        return success();
      } else if (params[0][0] === '!') {
        const [roomId, ...viaServers] = params;

        _dispatcher.default.dispatch({
          action: _actions.Action.ViewRoom,
          room_id: roomId,
          via_servers: viaServers,
          // for the rejoin button
          auto_join: true,
          metricsTrigger: "SlashCommand",
          metricsViaKeyboard: true
        });

        return success();
      } else if (isPermalink) {
        const permalinkParts = (0, _Permalinks.parsePermalink)(params[0]); // This check technically isn't needed because we already did our
        // safety checks up above. However, for good measure, let's be sure.

        if (!permalinkParts) {
          return reject(this.getUsage());
        } // If for some reason someone wanted to join a user, we should
        // stop them now.


        if (!permalinkParts.roomIdOrAlias) {
          return reject(this.getUsage());
        }

        const entity = permalinkParts.roomIdOrAlias;
        const viaServers = permalinkParts.viaServers;
        const eventId = permalinkParts.eventId;
        const dispatch = {
          action: _actions.Action.ViewRoom,
          auto_join: true,
          metricsTrigger: "SlashCommand",
          metricsViaKeyboard: true
        };
        if (entity[0] === '!') dispatch["room_id"] = entity;else dispatch["room_alias"] = entity;

        if (eventId) {
          dispatch["event_id"] = eventId;
          dispatch["highlighted"] = true;
        }

        if (viaServers) {
          // For the join
          dispatch["opts"] = {
            // These are passed down to the js-sdk's /join call
            viaServers: viaServers
          }; // For if the join fails (rejoin button)

          dispatch['via_servers'] = viaServers;
        }

        _dispatcher.default.dispatch(dispatch);

        return success();
      }
    }

    return reject(this.getUsage());
  },
  category: CommandCategories.actions,
  renderingTypes: [_RoomContext.TimelineRenderingType.Room]
}), new Command({
  command: 'part',
  args: '[<room-address>]',
  description: (0, _languageHandler._td)('Leave room'),
  analyticsName: "Part",
  isEnabled: () => !isCurrentLocalRoom(),
  runFn: function (roomId, args) {
    const cli = _MatrixClientPeg.MatrixClientPeg.get();

    let targetRoomId;

    if (args) {
      const matches = args.match(/^(\S+)$/);

      if (matches) {
        let roomAlias = matches[1];
        if (roomAlias[0] !== '#') return reject(this.getUsage());

        if (!roomAlias.includes(':')) {
          roomAlias += ':' + cli.getDomain();
        } // Try to find a room with this alias


        const rooms = cli.getRooms();

        for (let i = 0; i < rooms.length; i++) {
          const aliasEvents = rooms[i].currentState.getStateEvents('m.room.aliases');

          for (let j = 0; j < aliasEvents.length; j++) {
            const aliases = aliasEvents[j].getContent().aliases || [];

            for (let k = 0; k < aliases.length; k++) {
              if (aliases[k] === roomAlias) {
                targetRoomId = rooms[i].roomId;
                break;
              }
            }

            if (targetRoomId) break;
          }

          if (targetRoomId) break;
        }

        if (!targetRoomId) {
          return reject((0, _languageHandler.newTranslatableError)('Unrecognised room address: %(roomAlias)s', {
            roomAlias
          }));
        }
      }
    }

    if (!targetRoomId) targetRoomId = roomId;
    return success((0, _leaveBehaviour.leaveRoomBehaviour)(targetRoomId));
  },
  category: CommandCategories.actions,
  renderingTypes: [_RoomContext.TimelineRenderingType.Room]
}), new Command({
  command: 'remove',
  aliases: ["kick"],
  args: '<user-id> [reason]',
  description: (0, _languageHandler._td)('Removes user with given id from this room'),
  isEnabled: () => !isCurrentLocalRoom(),
  runFn: function (roomId, args) {
    if (args) {
      const matches = args.match(/^(\S+?)( +(.*))?$/);

      if (matches) {
        return success(_MatrixClientPeg.MatrixClientPeg.get().kick(roomId, matches[1], matches[3]));
      }
    }

    return reject(this.getUsage());
  },
  category: CommandCategories.admin,
  renderingTypes: [_RoomContext.TimelineRenderingType.Room]
}), new Command({
  command: 'ban',
  args: '<user-id> [reason]',
  description: (0, _languageHandler._td)('Bans user with given id'),
  isEnabled: () => !isCurrentLocalRoom(),
  runFn: function (roomId, args) {
    if (args) {
      const matches = args.match(/^(\S+?)( +(.*))?$/);

      if (matches) {
        return success(_MatrixClientPeg.MatrixClientPeg.get().ban(roomId, matches[1], matches[3]));
      }
    }

    return reject(this.getUsage());
  },
  category: CommandCategories.admin,
  renderingTypes: [_RoomContext.TimelineRenderingType.Room]
}), new Command({
  command: 'unban',
  args: '<user-id>',
  description: (0, _languageHandler._td)('Unbans user with given ID'),
  isEnabled: () => !isCurrentLocalRoom(),
  runFn: function (roomId, args) {
    if (args) {
      const matches = args.match(/^(\S+)$/);

      if (matches) {
        // Reset the user membership to "leave" to unban him
        return success(_MatrixClientPeg.MatrixClientPeg.get().unban(roomId, matches[1]));
      }
    }

    return reject(this.getUsage());
  },
  category: CommandCategories.admin,
  renderingTypes: [_RoomContext.TimelineRenderingType.Room]
}), new Command({
  command: 'ignore',
  args: '<user-id>',
  description: (0, _languageHandler._td)('Ignores a user, hiding their messages from you'),
  runFn: function (roomId, args) {
    if (args) {
      const cli = _MatrixClientPeg.MatrixClientPeg.get();

      const matches = args.match(/^(@[^:]+:\S+)$/);

      if (matches) {
        const userId = matches[1];
        const ignoredUsers = cli.getIgnoredUsers();
        ignoredUsers.push(userId); // de-duped internally in the js-sdk

        return success(cli.setIgnoredUsers(ignoredUsers).then(() => {
          _Modal.default.createDialog(_InfoDialog.default, {
            title: (0, _languageHandler._t)('Ignored user'),
            description: /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("p", null, (0, _languageHandler._t)('You are now ignoring %(userId)s', {
              userId
            })))
          });
        }));
      }
    }

    return reject(this.getUsage());
  },
  category: CommandCategories.actions
}), new Command({
  command: 'unignore',
  args: '<user-id>',
  description: (0, _languageHandler._td)('Stops ignoring a user, showing their messages going forward'),
  runFn: function (roomId, args) {
    if (args) {
      const cli = _MatrixClientPeg.MatrixClientPeg.get();

      const matches = args.match(/(^@[^:]+:\S+$)/);

      if (matches) {
        const userId = matches[1];
        const ignoredUsers = cli.getIgnoredUsers();
        const index = ignoredUsers.indexOf(userId);
        if (index !== -1) ignoredUsers.splice(index, 1);
        return success(cli.setIgnoredUsers(ignoredUsers).then(() => {
          _Modal.default.createDialog(_InfoDialog.default, {
            title: (0, _languageHandler._t)('Unignored user'),
            description: /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("p", null, (0, _languageHandler._t)('You are no longer ignoring %(userId)s', {
              userId
            })))
          });
        }));
      }
    }

    return reject(this.getUsage());
  },
  category: CommandCategories.actions
}), new Command({
  command: 'op',
  args: '<user-id> [<power-level>]',
  description: (0, _languageHandler._td)('Define the power level of a user'),

  isEnabled() {
    const cli = _MatrixClientPeg.MatrixClientPeg.get();

    const room = cli.getRoom(_RoomViewStore.RoomViewStore.instance.getRoomId());
    return room?.currentState.maySendStateEvent(_event.EventType.RoomPowerLevels, cli.getUserId()) && !(0, _isLocalRoom.isLocalRoom)(room);
  },

  runFn: function (roomId, args) {
    if (args) {
      const matches = args.match(/^(\S+?)( +(-?\d+))?$/);
      let powerLevel = 50; // default power level for op

      if (matches) {
        const userId = matches[1];

        if (matches.length === 4 && undefined !== matches[3]) {
          powerLevel = parseInt(matches[3], 10);
        }

        if (!isNaN(powerLevel)) {
          const cli = _MatrixClientPeg.MatrixClientPeg.get();

          const room = cli.getRoom(roomId);

          if (!room) {
            return reject((0, _languageHandler.newTranslatableError)("Command failed: Unable to find room (%(roomId)s", {
              roomId
            }));
          }

          const member = room.getMember(userId);

          if (!member || (0, _membership.getEffectiveMembership)(member.membership) === _membership.EffectiveMembership.Leave) {
            return reject((0, _languageHandler.newTranslatableError)("Could not find user in room"));
          }

          const powerLevelEvent = room.currentState.getStateEvents('m.room.power_levels', '');
          return success(cli.setPowerLevel(roomId, userId, powerLevel, powerLevelEvent));
        }
      }
    }

    return reject(this.getUsage());
  },
  category: CommandCategories.admin,
  renderingTypes: [_RoomContext.TimelineRenderingType.Room]
}), new Command({
  command: 'deop',
  args: '<user-id>',
  description: (0, _languageHandler._td)('Deops user with given id'),

  isEnabled() {
    const cli = _MatrixClientPeg.MatrixClientPeg.get();

    const room = cli.getRoom(_RoomViewStore.RoomViewStore.instance.getRoomId());
    return room?.currentState.maySendStateEvent(_event.EventType.RoomPowerLevels, cli.getUserId()) && !(0, _isLocalRoom.isLocalRoom)(room);
  },

  runFn: function (roomId, args) {
    if (args) {
      const matches = args.match(/^(\S+)$/);

      if (matches) {
        const cli = _MatrixClientPeg.MatrixClientPeg.get();

        const room = cli.getRoom(roomId);

        if (!room) {
          return reject((0, _languageHandler.newTranslatableError)("Command failed: Unable to find room (%(roomId)s", {
            roomId
          }));
        }

        const powerLevelEvent = room.currentState.getStateEvents('m.room.power_levels', '');

        if (!powerLevelEvent.getContent().users[args]) {
          return reject((0, _languageHandler.newTranslatableError)("Could not find user in room"));
        }

        return success(cli.setPowerLevel(roomId, args, undefined, powerLevelEvent));
      }
    }

    return reject(this.getUsage());
  },
  category: CommandCategories.admin,
  renderingTypes: [_RoomContext.TimelineRenderingType.Room]
}), new Command({
  command: 'devtools',
  description: (0, _languageHandler._td)('Opens the Developer Tools dialog'),
  runFn: function (roomId) {
    _Modal.default.createDialog(_DevtoolsDialog.default, {
      roomId
    }, "mx_DevtoolsDialog_wrapper");

    return success();
  },
  category: CommandCategories.advanced
}), new Command({
  command: 'addwidget',
  args: '<url | embed code | Jitsi url>',
  description: (0, _languageHandler._td)('Adds a custom widget by URL to the room'),
  isEnabled: () => _SettingsStore.default.getValue(_UIFeature.UIFeature.Widgets) && (0, _UIComponents.shouldShowComponent)(_UIFeature.UIComponent.AddIntegrations) && !isCurrentLocalRoom(),
  runFn: function (roomId, widgetUrl) {
    if (!widgetUrl) {
      return reject((0, _languageHandler.newTranslatableError)("Please supply a widget URL or embed code"));
    } // Try and parse out a widget URL from iframes


    if (widgetUrl.toLowerCase().startsWith("<iframe ")) {
      // We use parse5, which doesn't render/create a DOM node. It instead runs
      // some superfast regex over the text so we don't have to.
      const embed = (0, _parse.parseFragment)(widgetUrl);

      if (embed && embed.childNodes && embed.childNodes.length === 1) {
        const iframe = embed.childNodes[0];

        if (iframe.tagName.toLowerCase() === 'iframe' && iframe.attrs) {
          const srcAttr = iframe.attrs.find(a => a.name === 'src');

          _logger.logger.log("Pulling URL out of iframe (embed code)");

          widgetUrl = srcAttr.value;
        }
      }
    }

    if (!widgetUrl.startsWith("https://") && !widgetUrl.startsWith("http://")) {
      return reject((0, _languageHandler.newTranslatableError)("Please supply a https:// or http:// widget URL"));
    }

    if (_WidgetUtils.default.canUserModifyWidgets(roomId)) {
      const userId = _MatrixClientPeg.MatrixClientPeg.get().getUserId();

      const nowMs = new Date().getTime();
      const widgetId = encodeURIComponent(`${roomId}_${userId}_${nowMs}`);
      let type = _WidgetType.WidgetType.CUSTOM;
      let name = "Custom";
      let data = {}; // Make the widget a Jitsi widget if it looks like a Jitsi widget

      const jitsiData = _Jitsi.Jitsi.getInstance().parsePreferredConferenceUrl(widgetUrl);

      if (jitsiData) {
        _logger.logger.log("Making /addwidget widget a Jitsi conference");

        type = _WidgetType.WidgetType.JITSI;
        name = "Jitsi";
        data = jitsiData;
        widgetUrl = _WidgetUtils.default.getLocalJitsiWrapperUrl();
      }

      return success(_WidgetUtils.default.setRoomWidget(roomId, widgetId, type, widgetUrl, name, data));
    } else {
      return reject((0, _languageHandler.newTranslatableError)("You cannot modify widgets in this room."));
    }
  },
  category: CommandCategories.admin,
  renderingTypes: [_RoomContext.TimelineRenderingType.Room]
}), new Command({
  command: 'verify',
  args: '<user-id> <device-id> <device-signing-key>',
  description: (0, _languageHandler._td)('Verifies a user, session, and pubkey tuple'),
  runFn: function (roomId, args) {
    if (args) {
      const matches = args.match(/^(\S+) +(\S+) +(\S+)$/);

      if (matches) {
        const cli = _MatrixClientPeg.MatrixClientPeg.get();

        const userId = matches[1];
        const deviceId = matches[2];
        const fingerprint = matches[3];
        return success((async () => {
          const device = cli.getStoredDevice(userId, deviceId);

          if (!device) {
            throw (0, _languageHandler.newTranslatableError)('Unknown (user, session) pair: (%(userId)s, %(deviceId)s)', {
              userId,
              deviceId
            });
          }

          const deviceTrust = await cli.checkDeviceTrust(userId, deviceId);

          if (deviceTrust.isVerified()) {
            if (device.getFingerprint() === fingerprint) {
              throw (0, _languageHandler.newTranslatableError)('Session already verified!');
            } else {
              throw (0, _languageHandler.newTranslatableError)('WARNING: Session already verified, but keys do NOT MATCH!');
            }
          }

          if (device.getFingerprint() !== fingerprint) {
            const fprint = device.getFingerprint();
            throw (0, _languageHandler.newTranslatableError)('WARNING: KEY VERIFICATION FAILED! The signing key for %(userId)s and session' + ' %(deviceId)s is "%(fprint)s" which does not match the provided key ' + '"%(fingerprint)s". This could mean your communications are being intercepted!', {
              fprint,
              userId,
              deviceId,
              fingerprint
            });
          }

          await cli.setDeviceVerified(userId, deviceId, true); // Tell the user we verified everything

          _Modal.default.createDialog(_InfoDialog.default, {
            title: (0, _languageHandler._t)('Verified key'),
            description: /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("p", null, (0, _languageHandler._t)('The signing key you provided matches the signing key you received ' + 'from %(userId)s\'s session %(deviceId)s. Session marked as verified.', {
              userId,
              deviceId
            })))
          });
        })());
      }
    }

    return reject(this.getUsage());
  },
  category: CommandCategories.advanced,
  renderingTypes: [_RoomContext.TimelineRenderingType.Room]
}), new Command({
  command: 'discardsession',
  description: (0, _languageHandler._td)('Forces the current outbound group session in an encrypted room to be discarded'),
  isEnabled: () => !isCurrentLocalRoom(),
  runFn: function (roomId) {
    try {
      _MatrixClientPeg.MatrixClientPeg.get().forceDiscardSession(roomId);
    } catch (e) {
      return reject(e.message);
    }

    return success();
  },
  category: CommandCategories.advanced,
  renderingTypes: [_RoomContext.TimelineRenderingType.Room]
}), new Command({
  command: 'remakeolm',
  description: (0, _languageHandler._td)('Developer command: Discards the current outbound group session and sets up new Olm sessions'),
  isEnabled: () => {
    return _SettingsStore.default.getValue("developerMode") && !isCurrentLocalRoom();
  },
  runFn: roomId => {
    try {
      const room = _MatrixClientPeg.MatrixClientPeg.get().getRoom(roomId);

      _MatrixClientPeg.MatrixClientPeg.get().forceDiscardSession(roomId); // noinspection JSIgnoredPromiseFromCall


      _MatrixClientPeg.MatrixClientPeg.get().crypto.ensureOlmSessionsForUsers(room.getMembers().map(m => m.userId), true);
    } catch (e) {
      return reject(e.message);
    }

    return success();
  },
  category: CommandCategories.advanced,
  renderingTypes: [_RoomContext.TimelineRenderingType.Room]
}), new Command({
  command: "rainbow",
  description: (0, _languageHandler._td)("Sends the given message coloured as a rainbow"),
  args: '<message>',
  runFn: function (roomId, args) {
    if (!args) return reject(this.getUserId());
    return successSync(ContentHelpers.makeHtmlMessage(args, (0, _colour.textToHtmlRainbow)(args)));
  },
  category: CommandCategories.messages
}), new Command({
  command: "rainbowme",
  description: (0, _languageHandler._td)("Sends the given emote coloured as a rainbow"),
  args: '<message>',
  runFn: function (roomId, args) {
    if (!args) return reject(this.getUserId());
    return successSync(ContentHelpers.makeHtmlEmote(args, (0, _colour.textToHtmlRainbow)(args)));
  },
  category: CommandCategories.messages
}), new Command({
  command: "help",
  description: (0, _languageHandler._td)("Displays list of commands with usages and descriptions"),
  runFn: function () {
    _Modal.default.createDialog(_SlashCommandHelpDialog.default);

    return success();
  },
  category: CommandCategories.advanced
}), new Command({
  command: "whois",
  description: (0, _languageHandler._td)("Displays information about a user"),
  args: "<user-id>",
  isEnabled: () => !isCurrentLocalRoom(),
  runFn: function (roomId, userId) {
    if (!userId || !userId.startsWith("@") || !userId.includes(":")) {
      return reject(this.getUsage());
    }

    const member = _MatrixClientPeg.MatrixClientPeg.get().getRoom(roomId).getMember(userId);

    _dispatcher.default.dispatch({
      action: _actions.Action.ViewUser,
      // XXX: We should be using a real member object and not assuming what the receiver wants.
      member: member || {
        userId
      }
    });

    return success();
  },
  category: CommandCategories.advanced
}), new Command({
  command: "rageshake",
  aliases: ["bugreport"],
  description: (0, _languageHandler._td)("Send a bug report with logs"),
  isEnabled: () => !!_SdkConfig.default.get().bug_report_endpoint_url,
  args: "<description>",
  runFn: function (roomId, args) {
    return success(_Modal.default.createDialog(_BugReportDialog.default, {
      initialText: args
    }).finished);
  },
  category: CommandCategories.advanced
}), new Command({
  command: "tovirtual",
  description: (0, _languageHandler._td)("Switches to this room's virtual room, if it has one"),
  category: CommandCategories.advanced,

  isEnabled() {
    return _LegacyCallHandler.default.instance.getSupportsVirtualRooms() && !isCurrentLocalRoom();
  },

  runFn: roomId => {
    return success((async () => {
      const room = await _VoipUserMapper.default.sharedInstance().getVirtualRoomForRoom(roomId);
      if (!room) throw (0, _languageHandler.newTranslatableError)("No virtual room for this room");

      _dispatcher.default.dispatch({
        action: _actions.Action.ViewRoom,
        room_id: room.roomId,
        metricsTrigger: "SlashCommand",
        metricsViaKeyboard: true
      });
    })());
  }
}), new Command({
  command: "query",
  description: (0, _languageHandler._td)("Opens chat with the given user"),
  args: "<user-id>",
  runFn: function (roomId, userId) {
    // easter-egg for now: look up phone numbers through the thirdparty API
    // (very dumb phone number detection...)
    const isPhoneNumber = userId && /^\+?[0123456789]+$/.test(userId);

    if (!userId || (!userId.startsWith("@") || !userId.includes(":")) && !isPhoneNumber) {
      return reject(this.getUsage());
    }

    return success((async () => {
      if (isPhoneNumber) {
        const results = await _LegacyCallHandler.default.instance.pstnLookup(this.state.value);

        if (!results || results.length === 0 || !results[0].userid) {
          throw (0, _languageHandler.newTranslatableError)("Unable to find Matrix ID for phone number");
        }

        userId = results[0].userid;
      }

      const roomId = await (0, _createRoom.ensureDMExists)(_MatrixClientPeg.MatrixClientPeg.get(), userId);

      _dispatcher.default.dispatch({
        action: _actions.Action.ViewRoom,
        room_id: roomId,
        metricsTrigger: "SlashCommand",
        metricsViaKeyboard: true
      });
    })());
  },
  category: CommandCategories.actions
}), new Command({
  command: "msg",
  description: (0, _languageHandler._td)("Sends a message to the given user"),
  args: "<user-id> [<message>]",
  runFn: function (roomId, args) {
    if (args) {
      // matches the first whitespace delimited group and then the rest of the string
      const matches = args.match(/^(\S+?)(?: +(.*))?$/s);

      if (matches) {
        const [userId, msg] = matches.slice(1);

        if (userId && userId.startsWith("@") && userId.includes(":")) {
          return success((async () => {
            const cli = _MatrixClientPeg.MatrixClientPeg.get();

            const roomId = await (0, _createRoom.ensureDMExists)(cli, userId);

            _dispatcher.default.dispatch({
              action: _actions.Action.ViewRoom,
              room_id: roomId,
              metricsTrigger: "SlashCommand",
              metricsViaKeyboard: true
            });

            if (msg) {
              cli.sendTextMessage(roomId, msg);
            }
          })());
        }
      }
    }

    return reject(this.getUsage());
  },
  category: CommandCategories.actions
}), new Command({
  command: "holdcall",
  description: (0, _languageHandler._td)("Places the call in the current room on hold"),
  category: CommandCategories.other,
  isEnabled: () => !isCurrentLocalRoom(),
  runFn: function (roomId, args) {
    const call = _LegacyCallHandler.default.instance.getCallForRoom(roomId);

    if (!call) {
      return reject((0, _languageHandler.newTranslatableError)("No active call in this room"));
    }

    call.setRemoteOnHold(true);
    return success();
  },
  renderingTypes: [_RoomContext.TimelineRenderingType.Room]
}), new Command({
  command: "unholdcall",
  description: (0, _languageHandler._td)("Takes the call in the current room off hold"),
  category: CommandCategories.other,
  isEnabled: () => !isCurrentLocalRoom(),
  runFn: function (roomId, args) {
    const call = _LegacyCallHandler.default.instance.getCallForRoom(roomId);

    if (!call) {
      return reject((0, _languageHandler.newTranslatableError)("No active call in this room"));
    }

    call.setRemoteOnHold(false);
    return success();
  },
  renderingTypes: [_RoomContext.TimelineRenderingType.Room]
}), new Command({
  command: "converttodm",
  description: (0, _languageHandler._td)("Converts the room to a DM"),
  category: CommandCategories.other,
  isEnabled: () => !isCurrentLocalRoom(),
  runFn: function (roomId, args) {
    const room = _MatrixClientPeg.MatrixClientPeg.get().getRoom(roomId);

    return success((0, _Rooms.guessAndSetDMRoom)(room, true));
  },
  renderingTypes: [_RoomContext.TimelineRenderingType.Room]
}), new Command({
  command: "converttoroom",
  description: (0, _languageHandler._td)("Converts the DM to a room"),
  category: CommandCategories.other,
  isEnabled: () => !isCurrentLocalRoom(),
  runFn: function (roomId, args) {
    const room = _MatrixClientPeg.MatrixClientPeg.get().getRoom(roomId);

    return success((0, _Rooms.guessAndSetDMRoom)(room, false));
  },
  renderingTypes: [_RoomContext.TimelineRenderingType.Room]
}), // Command definitions for autocompletion ONLY:
// /me is special because its not handled by SlashCommands.js and is instead done inside the Composer classes
new Command({
  command: "me",
  args: '<message>',
  description: (0, _languageHandler._td)('Displays action'),
  category: CommandCategories.messages,
  hideCompletionAfterSpace: true
}), ..._effects.CHAT_EFFECTS.map(effect => {
  return new Command({
    command: effect.command,
    description: effect.description(),
    args: '<message>',
    runFn: function (roomId, args) {
      let content;

      if (!args) {
        content = ContentHelpers.makeEmoteMessage(effect.fallbackMessage());
      } else {
        content = {
          msgtype: effect.msgType,
          body: args
        };
      }

      _dispatcher.default.dispatch({
        action: `effects.${effect.command}`
      });

      return successSync(content);
    },
    category: CommandCategories.effects,
    renderingTypes: [_RoomContext.TimelineRenderingType.Room]
  });
})]; // build a map from names and aliases to the Command objects.

exports.Commands = Commands;
const CommandMap = new Map();
exports.CommandMap = CommandMap;
Commands.forEach(cmd => {
  CommandMap.set(cmd.command, cmd);
  cmd.aliases.forEach(alias => {
    CommandMap.set(alias, cmd);
  });
});

function parseCommandString(input) {
  // trim any trailing whitespace, as it can confuse the parser for
  // IRC-style commands
  input = input.replace(/\s+$/, '');
  if (input[0] !== '/') return {}; // not a command

  const bits = input.match(/^(\S+?)(?:[ \n]+((.|\n)*))?$/);
  let cmd;
  let args;

  if (bits) {
    cmd = bits[1].substring(1).toLowerCase();
    args = bits[2];
  } else {
    cmd = input;
  }

  return {
    cmd,
    args
  };
}

/**
 * Process the given text for /commands and returns a parsed command that can be used for running the operation.
 * @param {string} input The raw text input by the user.
 * @return {ICmd} The parsed command object.
 * Returns an empty object if the input didn't match a command.
 */
function getCommand(input) {
  const {
    cmd,
    args
  } = parseCommandString(input);

  if (CommandMap.has(cmd) && CommandMap.get(cmd).isEnabled()) {
    return {
      cmd: CommandMap.get(cmd),
      args
    };
  }

  return {};
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJzaW5nbGVNeGNVcGxvYWQiLCJQcm9taXNlIiwicmVzb2x2ZSIsImZpbGVTZWxlY3RvciIsImRvY3VtZW50IiwiY3JlYXRlRWxlbWVudCIsInNldEF0dHJpYnV0ZSIsIm9uY2hhbmdlIiwiZXYiLCJmaWxlIiwidGFyZ2V0IiwiZmlsZXMiLCJNb2RhbCIsImNyZWF0ZURpYWxvZyIsIlVwbG9hZENvbmZpcm1EaWFsb2ciLCJvbkZpbmlzaGVkIiwic2hvdWxkQ29udGludWUiLCJNYXRyaXhDbGllbnRQZWciLCJnZXQiLCJ1cGxvYWRDb250ZW50IiwiY2xpY2siLCJDb21tYW5kQ2F0ZWdvcmllcyIsIl90ZCIsIkNvbW1hbmQiLCJjb25zdHJ1Y3RvciIsIm9wdHMiLCJjb21tYW5kIiwiYWxpYXNlcyIsImFyZ3MiLCJkZXNjcmlwdGlvbiIsInJ1bkZuIiwiY2F0ZWdvcnkiLCJvdGhlciIsImhpZGVDb21wbGV0aW9uQWZ0ZXJTcGFjZSIsIl9pc0VuYWJsZWQiLCJpc0VuYWJsZWQiLCJyZW5kZXJpbmdUeXBlcyIsImFuYWx5dGljc05hbWUiLCJnZXRDb21tYW5kIiwiZ2V0Q29tbWFuZFdpdGhBcmdzIiwicnVuIiwicm9vbUlkIiwidGhyZWFkSWQiLCJyZWplY3QiLCJuZXdUcmFuc2xhdGFibGVFcnJvciIsInJlbmRlcmluZ1R5cGUiLCJUaW1lbGluZVJlbmRlcmluZ1R5cGUiLCJUaHJlYWQiLCJSb29tIiwiaW5jbHVkZXMiLCJQb3N0aG9nQW5hbHl0aWNzIiwiaW5zdGFuY2UiLCJ0cmFja0V2ZW50IiwiZXZlbnROYW1lIiwiYmluZCIsImdldFVzYWdlIiwiX3QiLCJlcnJvciIsInN1Y2Nlc3MiLCJwcm9taXNlIiwic3VjY2Vzc1N5bmMiLCJ2YWx1ZSIsImlzQ3VycmVudExvY2FsUm9vbSIsImNsaSIsInJvb20iLCJnZXRSb29tIiwiUm9vbVZpZXdTdG9yZSIsImdldFJvb21JZCIsImlzTG9jYWxSb29tIiwiQ29tbWFuZHMiLCJtZXNzYWdlIiwiQ29udGVudEhlbHBlcnMiLCJtYWtlSHRtbE1lc3NhZ2UiLCJtZXNzYWdlcyIsIm1ha2VUZXh0TWVzc2FnZSIsImN1cnJlbnRTdGF0ZSIsIm1heUNsaWVudFNlbmRTdGF0ZUV2ZW50IiwiZmluaXNoZWQiLCJSb29tVXBncmFkZVdhcm5pbmdEaWFsb2ciLCJ0YXJnZXRWZXJzaW9uIiwidGhlbiIsInJlc3AiLCJjb250aW51ZSIsInVwZ3JhZGVSb29tIiwiaW52aXRlIiwiYWRtaW4iLCJTZXR0aW5nc1N0b3JlIiwiZ2V0VmFsdWUiLCJ1bml4VGltZXN0YW1wIiwiRGF0ZSIsInBhcnNlIiwiaW5wdXREYXRlIiwiZXZlbnRfaWQiLCJldmVudElkIiwib3JpZ2luX3NlcnZlcl90cyIsIm9yaWdpblNlcnZlclRzIiwidGltZXN0YW1wVG9FdmVudCIsIkRpcmVjdGlvbiIsIkZvcndhcmQiLCJsb2dnZXIiLCJsb2ciLCJkaXMiLCJkaXNwYXRjaCIsImFjdGlvbiIsIkFjdGlvbiIsIlZpZXdSb29tIiwiaGlnaGxpZ2h0ZWQiLCJyb29tX2lkIiwibWV0cmljc1RyaWdnZXIiLCJtZXRyaWNzVmlhS2V5Ym9hcmQiLCJhY3Rpb25zIiwic2V0RGlzcGxheU5hbWUiLCJnZXRTdGF0ZUV2ZW50cyIsImdldFVzZXJJZCIsImNvbnRlbnQiLCJnZXRDb250ZW50IiwibWVtYmVyc2hpcCIsImRpc3BsYXluYW1lIiwic2VuZFN0YXRlRXZlbnQiLCJ1cmwiLCJ1c2VySWQiLCJhdmF0YXJfdXJsIiwic2V0QXZhdGFyVXJsIiwiaHRtbCIsImh0bWxTZXJpYWxpemVGcm9tTWRJZk5lZWRlZCIsImZvcmNlSFRNTCIsInNldFJvb21Ub3BpYyIsInRvcGljIiwicGFyc2VUb3BpY0NvbnRlbnQiLCJ0ZXh0IiwicmVmIiwiZSIsImxpbmtpZnlFbGVtZW50IiwiYm9keSIsInRvcGljVG9IdG1sIiwiSW5mb0RpYWxvZyIsInRpdGxlIiwibmFtZSIsImhhc0Nsb3NlQnV0dG9uIiwiY2xhc3NOYW1lIiwic2V0Um9vbU5hbWUiLCJzaG91bGRTaG93Q29tcG9uZW50IiwiVUlDb21wb25lbnQiLCJJbnZpdGVVc2VycyIsImFkZHJlc3MiLCJyZWFzb24iLCJzcGxpdCIsInByb20iLCJnZXRBZGRyZXNzVHlwZSIsIkFkZHJlc3NUeXBlIiwiRW1haWwiLCJnZXRJZGVudGl0eVNlcnZlclVybCIsImRlZmF1bHRJZGVudGl0eVNlcnZlclVybCIsImdldERlZmF1bHRJZGVudGl0eVNlcnZlclVybCIsIlF1ZXN0aW9uRGlhbG9nIiwiZGVmYXVsdElkZW50aXR5U2VydmVyTmFtZSIsImFiYnJldmlhdGVVcmwiLCJidXR0b24iLCJ1c2VEZWZhdWx0Iiwic2V0VG9EZWZhdWx0SWRlbnRpdHlTZXJ2ZXIiLCJpbnZpdGVyIiwiTXVsdGlJbnZpdGVyIiwiZ2V0Q29tcGxldGlvblN0YXRlIiwiRXJyb3IiLCJnZXRFcnJvclRleHQiLCJwYXJhbXMiLCJsZW5ndGgiLCJpc1Blcm1hbGluayIsInN0YXJ0c1dpdGgiLCJwYXJzZWRVcmwiLCJVUkwiLCJob3N0bmFtZSIsImhvc3QiLCJpc1Blcm1hbGlua0hvc3QiLCJyb29tQWxpYXMiLCJnZXREb21haW4iLCJyb29tX2FsaWFzIiwiYXV0b19qb2luIiwidmlhU2VydmVycyIsInZpYV9zZXJ2ZXJzIiwicGVybWFsaW5rUGFydHMiLCJwYXJzZVBlcm1hbGluayIsInJvb21JZE9yQWxpYXMiLCJlbnRpdHkiLCJ0YXJnZXRSb29tSWQiLCJtYXRjaGVzIiwibWF0Y2giLCJyb29tcyIsImdldFJvb21zIiwiaSIsImFsaWFzRXZlbnRzIiwiaiIsImsiLCJsZWF2ZVJvb21CZWhhdmlvdXIiLCJraWNrIiwiYmFuIiwidW5iYW4iLCJpZ25vcmVkVXNlcnMiLCJnZXRJZ25vcmVkVXNlcnMiLCJwdXNoIiwic2V0SWdub3JlZFVzZXJzIiwiaW5kZXgiLCJpbmRleE9mIiwic3BsaWNlIiwibWF5U2VuZFN0YXRlRXZlbnQiLCJFdmVudFR5cGUiLCJSb29tUG93ZXJMZXZlbHMiLCJwb3dlckxldmVsIiwidW5kZWZpbmVkIiwicGFyc2VJbnQiLCJpc05hTiIsIm1lbWJlciIsImdldE1lbWJlciIsImdldEVmZmVjdGl2ZU1lbWJlcnNoaXAiLCJFZmZlY3RpdmVNZW1iZXJzaGlwIiwiTGVhdmUiLCJwb3dlckxldmVsRXZlbnQiLCJzZXRQb3dlckxldmVsIiwidXNlcnMiLCJEZXZ0b29sc0RpYWxvZyIsImFkdmFuY2VkIiwiVUlGZWF0dXJlIiwiV2lkZ2V0cyIsIkFkZEludGVncmF0aW9ucyIsIndpZGdldFVybCIsInRvTG93ZXJDYXNlIiwiZW1iZWQiLCJwYXJzZUh0bWwiLCJjaGlsZE5vZGVzIiwiaWZyYW1lIiwidGFnTmFtZSIsImF0dHJzIiwic3JjQXR0ciIsImZpbmQiLCJhIiwiV2lkZ2V0VXRpbHMiLCJjYW5Vc2VyTW9kaWZ5V2lkZ2V0cyIsIm5vd01zIiwiZ2V0VGltZSIsIndpZGdldElkIiwiZW5jb2RlVVJJQ29tcG9uZW50IiwidHlwZSIsIldpZGdldFR5cGUiLCJDVVNUT00iLCJkYXRhIiwiaml0c2lEYXRhIiwiSml0c2kiLCJnZXRJbnN0YW5jZSIsInBhcnNlUHJlZmVycmVkQ29uZmVyZW5jZVVybCIsIkpJVFNJIiwiZ2V0TG9jYWxKaXRzaVdyYXBwZXJVcmwiLCJzZXRSb29tV2lkZ2V0IiwiZGV2aWNlSWQiLCJmaW5nZXJwcmludCIsImRldmljZSIsImdldFN0b3JlZERldmljZSIsImRldmljZVRydXN0IiwiY2hlY2tEZXZpY2VUcnVzdCIsImlzVmVyaWZpZWQiLCJnZXRGaW5nZXJwcmludCIsImZwcmludCIsInNldERldmljZVZlcmlmaWVkIiwiZm9yY2VEaXNjYXJkU2Vzc2lvbiIsImNyeXB0byIsImVuc3VyZU9sbVNlc3Npb25zRm9yVXNlcnMiLCJnZXRNZW1iZXJzIiwibWFwIiwibSIsInRleHRUb0h0bWxSYWluYm93IiwibWFrZUh0bWxFbW90ZSIsIlNsYXNoQ29tbWFuZEhlbHBEaWFsb2ciLCJWaWV3VXNlciIsIlNka0NvbmZpZyIsImJ1Z19yZXBvcnRfZW5kcG9pbnRfdXJsIiwiQnVnUmVwb3J0RGlhbG9nIiwiaW5pdGlhbFRleHQiLCJMZWdhY3lDYWxsSGFuZGxlciIsImdldFN1cHBvcnRzVmlydHVhbFJvb21zIiwiVm9pcFVzZXJNYXBwZXIiLCJzaGFyZWRJbnN0YW5jZSIsImdldFZpcnR1YWxSb29tRm9yUm9vbSIsImlzUGhvbmVOdW1iZXIiLCJ0ZXN0IiwicmVzdWx0cyIsInBzdG5Mb29rdXAiLCJzdGF0ZSIsInVzZXJpZCIsImVuc3VyZURNRXhpc3RzIiwibXNnIiwic2xpY2UiLCJzZW5kVGV4dE1lc3NhZ2UiLCJjYWxsIiwiZ2V0Q2FsbEZvclJvb20iLCJzZXRSZW1vdGVPbkhvbGQiLCJndWVzc0FuZFNldERNUm9vbSIsIkNIQVRfRUZGRUNUUyIsImVmZmVjdCIsIm1ha2VFbW90ZU1lc3NhZ2UiLCJmYWxsYmFja01lc3NhZ2UiLCJtc2d0eXBlIiwibXNnVHlwZSIsImVmZmVjdHMiLCJDb21tYW5kTWFwIiwiTWFwIiwiZm9yRWFjaCIsImNtZCIsInNldCIsImFsaWFzIiwicGFyc2VDb21tYW5kU3RyaW5nIiwiaW5wdXQiLCJyZXBsYWNlIiwiYml0cyIsInN1YnN0cmluZyIsImhhcyJdLCJzb3VyY2VzIjpbIi4uL3NyYy9TbGFzaENvbW1hbmRzLnRzeCJdLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMTUsIDIwMTYgT3Blbk1hcmtldCBMdGRcbkNvcHlyaWdodCAyMDE4IE5ldyBWZWN0b3IgTHRkXG5Db3B5cmlnaHQgMjAxOSBNaWNoYWVsIFRlbGF0eW5za2kgPDd0M2NoZ3V5QGdtYWlsLmNvbT5cbkNvcHlyaWdodCAyMDIwIFRoZSBNYXRyaXgub3JnIEZvdW5kYXRpb24gQy5JLkMuXG5cbkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG55b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cblxuaW1wb3J0ICogYXMgUmVhY3QgZnJvbSAncmVhY3QnO1xuaW1wb3J0IHsgVXNlciB9IGZyb20gXCJtYXRyaXgtanMtc2RrL3NyYy9tb2RlbHMvdXNlclwiO1xuaW1wb3J0IHsgRGlyZWN0aW9uIH0gZnJvbSAnbWF0cml4LWpzLXNkay9zcmMvbW9kZWxzL2V2ZW50LXRpbWVsaW5lJztcbmltcG9ydCB7IEV2ZW50VHlwZSB9IGZyb20gXCJtYXRyaXgtanMtc2RrL3NyYy9AdHlwZXMvZXZlbnRcIjtcbmltcG9ydCAqIGFzIENvbnRlbnRIZWxwZXJzIGZyb20gJ21hdHJpeC1qcy1zZGsvc3JjL2NvbnRlbnQtaGVscGVycyc7XG5pbXBvcnQgeyBFbGVtZW50IGFzIENoaWxkRWxlbWVudCwgcGFyc2VGcmFnbWVudCBhcyBwYXJzZUh0bWwgfSBmcm9tIFwicGFyc2U1XCI7XG5pbXBvcnQgeyBsb2dnZXIgfSBmcm9tIFwibWF0cml4LWpzLXNkay9zcmMvbG9nZ2VyXCI7XG5pbXBvcnQgeyBJQ29udGVudCB9IGZyb20gJ21hdHJpeC1qcy1zZGsvc3JjL21vZGVscy9ldmVudCc7XG5pbXBvcnQgeyBNUm9vbVRvcGljRXZlbnRDb250ZW50IH0gZnJvbSAnbWF0cml4LWpzLXNkay9zcmMvQHR5cGVzL3RvcGljJztcbmltcG9ydCB7IFNsYXNoQ29tbWFuZCBhcyBTbGFzaENvbW1hbmRFdmVudCB9IGZyb20gXCJAbWF0cml4LW9yZy9hbmFseXRpY3MtZXZlbnRzL3R5cGVzL3R5cGVzY3JpcHQvU2xhc2hDb21tYW5kXCI7XG5cbmltcG9ydCB7IE1hdHJpeENsaWVudFBlZyB9IGZyb20gJy4vTWF0cml4Q2xpZW50UGVnJztcbmltcG9ydCBkaXMgZnJvbSAnLi9kaXNwYXRjaGVyL2Rpc3BhdGNoZXInO1xuaW1wb3J0IHsgX3QsIF90ZCwgSVRyYW5zbGF0YWJsZUVycm9yLCBuZXdUcmFuc2xhdGFibGVFcnJvciB9IGZyb20gJy4vbGFuZ3VhZ2VIYW5kbGVyJztcbmltcG9ydCBNb2RhbCBmcm9tICcuL01vZGFsJztcbmltcG9ydCBNdWx0aUludml0ZXIgZnJvbSAnLi91dGlscy9NdWx0aUludml0ZXInO1xuaW1wb3J0IHsgbGlua2lmeUVsZW1lbnQsIHRvcGljVG9IdG1sIH0gZnJvbSAnLi9IdG1sVXRpbHMnO1xuaW1wb3J0IFF1ZXN0aW9uRGlhbG9nIGZyb20gXCIuL2NvbXBvbmVudHMvdmlld3MvZGlhbG9ncy9RdWVzdGlvbkRpYWxvZ1wiO1xuaW1wb3J0IFdpZGdldFV0aWxzIGZyb20gXCIuL3V0aWxzL1dpZGdldFV0aWxzXCI7XG5pbXBvcnQgeyB0ZXh0VG9IdG1sUmFpbmJvdyB9IGZyb20gXCIuL3V0aWxzL2NvbG91clwiO1xuaW1wb3J0IHsgQWRkcmVzc1R5cGUsIGdldEFkZHJlc3NUeXBlIH0gZnJvbSAnLi9Vc2VyQWRkcmVzcyc7XG5pbXBvcnQgeyBhYmJyZXZpYXRlVXJsIH0gZnJvbSAnLi91dGlscy9VcmxVdGlscyc7XG5pbXBvcnQgeyBnZXREZWZhdWx0SWRlbnRpdHlTZXJ2ZXJVcmwsIHNldFRvRGVmYXVsdElkZW50aXR5U2VydmVyIH0gZnJvbSAnLi91dGlscy9JZGVudGl0eVNlcnZlclV0aWxzJztcbmltcG9ydCB7IGlzUGVybWFsaW5rSG9zdCwgcGFyc2VQZXJtYWxpbmsgfSBmcm9tIFwiLi91dGlscy9wZXJtYWxpbmtzL1Blcm1hbGlua3NcIjtcbmltcG9ydCB7IFdpZGdldFR5cGUgfSBmcm9tIFwiLi93aWRnZXRzL1dpZGdldFR5cGVcIjtcbmltcG9ydCB7IEppdHNpIH0gZnJvbSBcIi4vd2lkZ2V0cy9KaXRzaVwiO1xuaW1wb3J0IEJ1Z1JlcG9ydERpYWxvZyBmcm9tIFwiLi9jb21wb25lbnRzL3ZpZXdzL2RpYWxvZ3MvQnVnUmVwb3J0RGlhbG9nXCI7XG5pbXBvcnQgeyBlbnN1cmVETUV4aXN0cyB9IGZyb20gXCIuL2NyZWF0ZVJvb21cIjtcbmltcG9ydCB7IFZpZXdVc2VyUGF5bG9hZCB9IGZyb20gXCIuL2Rpc3BhdGNoZXIvcGF5bG9hZHMvVmlld1VzZXJQYXlsb2FkXCI7XG5pbXBvcnQgeyBBY3Rpb24gfSBmcm9tIFwiLi9kaXNwYXRjaGVyL2FjdGlvbnNcIjtcbmltcG9ydCB7IEVmZmVjdGl2ZU1lbWJlcnNoaXAsIGdldEVmZmVjdGl2ZU1lbWJlcnNoaXAgfSBmcm9tIFwiLi91dGlscy9tZW1iZXJzaGlwXCI7XG5pbXBvcnQgU2RrQ29uZmlnIGZyb20gXCIuL1Nka0NvbmZpZ1wiO1xuaW1wb3J0IFNldHRpbmdzU3RvcmUgZnJvbSBcIi4vc2V0dGluZ3MvU2V0dGluZ3NTdG9yZVwiO1xuaW1wb3J0IHsgVUlDb21wb25lbnQsIFVJRmVhdHVyZSB9IGZyb20gXCIuL3NldHRpbmdzL1VJRmVhdHVyZVwiO1xuaW1wb3J0IHsgQ0hBVF9FRkZFQ1RTIH0gZnJvbSBcIi4vZWZmZWN0c1wiO1xuaW1wb3J0IExlZ2FjeUNhbGxIYW5kbGVyIGZyb20gXCIuL0xlZ2FjeUNhbGxIYW5kbGVyXCI7XG5pbXBvcnQgeyBndWVzc0FuZFNldERNUm9vbSB9IGZyb20gXCIuL1Jvb21zXCI7XG5pbXBvcnQgeyB1cGdyYWRlUm9vbSB9IGZyb20gJy4vdXRpbHMvUm9vbVVwZ3JhZGUnO1xuaW1wb3J0IFVwbG9hZENvbmZpcm1EaWFsb2cgZnJvbSAnLi9jb21wb25lbnRzL3ZpZXdzL2RpYWxvZ3MvVXBsb2FkQ29uZmlybURpYWxvZyc7XG5pbXBvcnQgRGV2dG9vbHNEaWFsb2cgZnJvbSAnLi9jb21wb25lbnRzL3ZpZXdzL2RpYWxvZ3MvRGV2dG9vbHNEaWFsb2cnO1xuaW1wb3J0IFJvb21VcGdyYWRlV2FybmluZ0RpYWxvZyBmcm9tIFwiLi9jb21wb25lbnRzL3ZpZXdzL2RpYWxvZ3MvUm9vbVVwZ3JhZGVXYXJuaW5nRGlhbG9nXCI7XG5pbXBvcnQgSW5mb0RpYWxvZyBmcm9tIFwiLi9jb21wb25lbnRzL3ZpZXdzL2RpYWxvZ3MvSW5mb0RpYWxvZ1wiO1xuaW1wb3J0IFNsYXNoQ29tbWFuZEhlbHBEaWFsb2cgZnJvbSBcIi4vY29tcG9uZW50cy92aWV3cy9kaWFsb2dzL1NsYXNoQ29tbWFuZEhlbHBEaWFsb2dcIjtcbmltcG9ydCB7IHNob3VsZFNob3dDb21wb25lbnQgfSBmcm9tIFwiLi9jdXN0b21pc2F0aW9ucy9oZWxwZXJzL1VJQ29tcG9uZW50c1wiO1xuaW1wb3J0IHsgVGltZWxpbmVSZW5kZXJpbmdUeXBlIH0gZnJvbSAnLi9jb250ZXh0cy9Sb29tQ29udGV4dCc7XG5pbXBvcnQgeyBSb29tVmlld1N0b3JlIH0gZnJvbSBcIi4vc3RvcmVzL1Jvb21WaWV3U3RvcmVcIjtcbmltcG9ydCB7IFhPUiB9IGZyb20gXCIuL0B0eXBlcy9jb21tb25cIjtcbmltcG9ydCB7IFBvc3Rob2dBbmFseXRpY3MgfSBmcm9tIFwiLi9Qb3N0aG9nQW5hbHl0aWNzXCI7XG5pbXBvcnQgeyBWaWV3Um9vbVBheWxvYWQgfSBmcm9tIFwiLi9kaXNwYXRjaGVyL3BheWxvYWRzL1ZpZXdSb29tUGF5bG9hZFwiO1xuaW1wb3J0IFZvaXBVc2VyTWFwcGVyIGZyb20gJy4vVm9pcFVzZXJNYXBwZXInO1xuaW1wb3J0IHsgaHRtbFNlcmlhbGl6ZUZyb21NZElmTmVlZGVkIH0gZnJvbSAnLi9lZGl0b3Ivc2VyaWFsaXplJztcbmltcG9ydCB7IGxlYXZlUm9vbUJlaGF2aW91ciB9IGZyb20gXCIuL3V0aWxzL2xlYXZlLWJlaGF2aW91clwiO1xuaW1wb3J0IHsgaXNMb2NhbFJvb20gfSBmcm9tICcuL3V0aWxzL2xvY2FsUm9vbS9pc0xvY2FsUm9vbSc7XG5cbi8vIFhYWDogd29ya2Fyb3VuZCBmb3IgaHR0cHM6Ly9naXRodWIuY29tL21pY3Jvc29mdC9UeXBlU2NyaXB0L2lzc3Vlcy8zMTgxNlxuaW50ZXJmYWNlIEhUTUxJbnB1dEV2ZW50IGV4dGVuZHMgRXZlbnQge1xuICAgIHRhcmdldDogSFRNTElucHV0RWxlbWVudCAmIEV2ZW50VGFyZ2V0O1xufVxuXG5jb25zdCBzaW5nbGVNeGNVcGxvYWQgPSBhc3luYyAoKTogUHJvbWlzZTxhbnk+ID0+IHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcbiAgICAgICAgY29uc3QgZmlsZVNlbGVjdG9yID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaW5wdXQnKTtcbiAgICAgICAgZmlsZVNlbGVjdG9yLnNldEF0dHJpYnV0ZSgndHlwZScsICdmaWxlJyk7XG4gICAgICAgIGZpbGVTZWxlY3Rvci5vbmNoYW5nZSA9IChldjogSFRNTElucHV0RXZlbnQpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGZpbGUgPSBldi50YXJnZXQuZmlsZXNbMF07XG5cbiAgICAgICAgICAgIE1vZGFsLmNyZWF0ZURpYWxvZyhVcGxvYWRDb25maXJtRGlhbG9nLCB7XG4gICAgICAgICAgICAgICAgZmlsZSxcbiAgICAgICAgICAgICAgICBvbkZpbmlzaGVkOiAoc2hvdWxkQ29udGludWUpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShzaG91bGRDb250aW51ZSA/IE1hdHJpeENsaWVudFBlZy5nZXQoKS51cGxvYWRDb250ZW50KGZpbGUpIDogbnVsbCk7XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9O1xuXG4gICAgICAgIGZpbGVTZWxlY3Rvci5jbGljaygpO1xuICAgIH0pO1xufTtcblxuZXhwb3J0IGNvbnN0IENvbW1hbmRDYXRlZ29yaWVzID0ge1xuICAgIFwibWVzc2FnZXNcIjogX3RkKFwiTWVzc2FnZXNcIiksXG4gICAgXCJhY3Rpb25zXCI6IF90ZChcIkFjdGlvbnNcIiksXG4gICAgXCJhZG1pblwiOiBfdGQoXCJBZG1pblwiKSxcbiAgICBcImFkdmFuY2VkXCI6IF90ZChcIkFkdmFuY2VkXCIpLFxuICAgIFwiZWZmZWN0c1wiOiBfdGQoXCJFZmZlY3RzXCIpLFxuICAgIFwib3RoZXJcIjogX3RkKFwiT3RoZXJcIiksXG59O1xuXG5leHBvcnQgdHlwZSBSdW5SZXN1bHQgPSBYT1I8eyBlcnJvcjogRXJyb3IgfCBJVHJhbnNsYXRhYmxlRXJyb3IgfSwgeyBwcm9taXNlOiBQcm9taXNlPElDb250ZW50IHwgdW5kZWZpbmVkPiB9PjtcblxudHlwZSBSdW5GbiA9ICgocm9vbUlkOiBzdHJpbmcsIGFyZ3M6IHN0cmluZywgY21kOiBzdHJpbmcpID0+IFJ1blJlc3VsdCk7XG5cbmludGVyZmFjZSBJQ29tbWFuZE9wdHMge1xuICAgIGNvbW1hbmQ6IHN0cmluZztcbiAgICBhbGlhc2VzPzogc3RyaW5nW107XG4gICAgYXJncz86IHN0cmluZztcbiAgICBkZXNjcmlwdGlvbjogc3RyaW5nO1xuICAgIGFuYWx5dGljc05hbWU/OiBTbGFzaENvbW1hbmRFdmVudFtcImNvbW1hbmRcIl07XG4gICAgcnVuRm4/OiBSdW5GbjtcbiAgICBjYXRlZ29yeTogc3RyaW5nO1xuICAgIGhpZGVDb21wbGV0aW9uQWZ0ZXJTcGFjZT86IGJvb2xlYW47XG4gICAgaXNFbmFibGVkPygpOiBib29sZWFuO1xuICAgIHJlbmRlcmluZ1R5cGVzPzogVGltZWxpbmVSZW5kZXJpbmdUeXBlW107XG59XG5cbmV4cG9ydCBjbGFzcyBDb21tYW5kIHtcbiAgICBwdWJsaWMgcmVhZG9ubHkgY29tbWFuZDogc3RyaW5nO1xuICAgIHB1YmxpYyByZWFkb25seSBhbGlhc2VzOiBzdHJpbmdbXTtcbiAgICBwdWJsaWMgcmVhZG9ubHkgYXJnczogdW5kZWZpbmVkIHwgc3RyaW5nO1xuICAgIHB1YmxpYyByZWFkb25seSBkZXNjcmlwdGlvbjogc3RyaW5nO1xuICAgIHB1YmxpYyByZWFkb25seSBydW5GbjogdW5kZWZpbmVkIHwgUnVuRm47XG4gICAgcHVibGljIHJlYWRvbmx5IGNhdGVnb3J5OiBzdHJpbmc7XG4gICAgcHVibGljIHJlYWRvbmx5IGhpZGVDb21wbGV0aW9uQWZ0ZXJTcGFjZTogYm9vbGVhbjtcbiAgICBwdWJsaWMgcmVhZG9ubHkgcmVuZGVyaW5nVHlwZXM/OiBUaW1lbGluZVJlbmRlcmluZ1R5cGVbXTtcbiAgICBwdWJsaWMgcmVhZG9ubHkgYW5hbHl0aWNzTmFtZT86IFNsYXNoQ29tbWFuZEV2ZW50W1wiY29tbWFuZFwiXTtcbiAgICBwcml2YXRlIHJlYWRvbmx5IF9pc0VuYWJsZWQ/OiAoKSA9PiBib29sZWFuO1xuXG4gICAgY29uc3RydWN0b3Iob3B0czogSUNvbW1hbmRPcHRzKSB7XG4gICAgICAgIHRoaXMuY29tbWFuZCA9IG9wdHMuY29tbWFuZDtcbiAgICAgICAgdGhpcy5hbGlhc2VzID0gb3B0cy5hbGlhc2VzIHx8IFtdO1xuICAgICAgICB0aGlzLmFyZ3MgPSBvcHRzLmFyZ3MgfHwgXCJcIjtcbiAgICAgICAgdGhpcy5kZXNjcmlwdGlvbiA9IG9wdHMuZGVzY3JpcHRpb247XG4gICAgICAgIHRoaXMucnVuRm4gPSBvcHRzLnJ1bkZuO1xuICAgICAgICB0aGlzLmNhdGVnb3J5ID0gb3B0cy5jYXRlZ29yeSB8fCBDb21tYW5kQ2F0ZWdvcmllcy5vdGhlcjtcbiAgICAgICAgdGhpcy5oaWRlQ29tcGxldGlvbkFmdGVyU3BhY2UgPSBvcHRzLmhpZGVDb21wbGV0aW9uQWZ0ZXJTcGFjZSB8fCBmYWxzZTtcbiAgICAgICAgdGhpcy5faXNFbmFibGVkID0gb3B0cy5pc0VuYWJsZWQ7XG4gICAgICAgIHRoaXMucmVuZGVyaW5nVHlwZXMgPSBvcHRzLnJlbmRlcmluZ1R5cGVzO1xuICAgICAgICB0aGlzLmFuYWx5dGljc05hbWUgPSBvcHRzLmFuYWx5dGljc05hbWU7XG4gICAgfVxuXG4gICAgcHVibGljIGdldENvbW1hbmQoKSB7XG4gICAgICAgIHJldHVybiBgLyR7dGhpcy5jb21tYW5kfWA7XG4gICAgfVxuXG4gICAgcHVibGljIGdldENvbW1hbmRXaXRoQXJncygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0Q29tbWFuZCgpICsgXCIgXCIgKyB0aGlzLmFyZ3M7XG4gICAgfVxuXG4gICAgcHVibGljIHJ1bihyb29tSWQ6IHN0cmluZywgdGhyZWFkSWQ6IHN0cmluZywgYXJnczogc3RyaW5nKTogUnVuUmVzdWx0IHtcbiAgICAgICAgLy8gaWYgaXQgaGFzIG5vIHJ1bkZuIHRoZW4gaXRzIGFuIGlnbm9yZWQvbm9wIGNvbW1hbmQgKGF1dG9jb21wbGV0ZSBvbmx5KSBlLmcgYC9tZWBcbiAgICAgICAgaWYgKCF0aGlzLnJ1bkZuKSB7XG4gICAgICAgICAgICByZXR1cm4gcmVqZWN0KFxuICAgICAgICAgICAgICAgIG5ld1RyYW5zbGF0YWJsZUVycm9yKFxuICAgICAgICAgICAgICAgICAgICBcIkNvbW1hbmQgZXJyb3I6IFVuYWJsZSB0byBoYW5kbGUgc2xhc2ggY29tbWFuZC5cIixcbiAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHJlbmRlcmluZ1R5cGUgPSB0aHJlYWRJZFxuICAgICAgICAgICAgPyBUaW1lbGluZVJlbmRlcmluZ1R5cGUuVGhyZWFkXG4gICAgICAgICAgICA6IFRpbWVsaW5lUmVuZGVyaW5nVHlwZS5Sb29tO1xuICAgICAgICBpZiAodGhpcy5yZW5kZXJpbmdUeXBlcyAmJiAhdGhpcy5yZW5kZXJpbmdUeXBlcz8uaW5jbHVkZXMocmVuZGVyaW5nVHlwZSkpIHtcbiAgICAgICAgICAgIHJldHVybiByZWplY3QoXG4gICAgICAgICAgICAgICAgbmV3VHJhbnNsYXRhYmxlRXJyb3IoXG4gICAgICAgICAgICAgICAgICAgIFwiQ29tbWFuZCBlcnJvcjogVW5hYmxlIHRvIGZpbmQgcmVuZGVyaW5nIHR5cGUgKCUocmVuZGVyaW5nVHlwZSlzKVwiLFxuICAgICAgICAgICAgICAgICAgICB7IHJlbmRlcmluZ1R5cGUgfSxcbiAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLmFuYWx5dGljc05hbWUpIHtcbiAgICAgICAgICAgIFBvc3Rob2dBbmFseXRpY3MuaW5zdGFuY2UudHJhY2tFdmVudDxTbGFzaENvbW1hbmRFdmVudD4oe1xuICAgICAgICAgICAgICAgIGV2ZW50TmFtZTogXCJTbGFzaENvbW1hbmRcIixcbiAgICAgICAgICAgICAgICBjb21tYW5kOiB0aGlzLmFuYWx5dGljc05hbWUsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB0aGlzLnJ1bkZuLmJpbmQodGhpcykocm9vbUlkLCBhcmdzKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgZ2V0VXNhZ2UoKSB7XG4gICAgICAgIHJldHVybiBfdCgnVXNhZ2UnKSArICc6ICcgKyB0aGlzLmdldENvbW1hbmRXaXRoQXJncygpO1xuICAgIH1cblxuICAgIHB1YmxpYyBpc0VuYWJsZWQoKTogYm9vbGVhbiB7XG4gICAgICAgIHJldHVybiB0aGlzLl9pc0VuYWJsZWQgPyB0aGlzLl9pc0VuYWJsZWQoKSA6IHRydWU7XG4gICAgfVxufVxuXG5mdW5jdGlvbiByZWplY3QoZXJyb3IpIHtcbiAgICByZXR1cm4geyBlcnJvciB9O1xufVxuXG5mdW5jdGlvbiBzdWNjZXNzKHByb21pc2U/OiBQcm9taXNlPGFueT4pIHtcbiAgICByZXR1cm4geyBwcm9taXNlIH07XG59XG5cbmZ1bmN0aW9uIHN1Y2Nlc3NTeW5jKHZhbHVlOiBhbnkpIHtcbiAgICByZXR1cm4gc3VjY2VzcyhQcm9taXNlLnJlc29sdmUodmFsdWUpKTtcbn1cblxuY29uc3QgaXNDdXJyZW50TG9jYWxSb29tID0gKCk6IGJvb2xlYW4gPT4ge1xuICAgIGNvbnN0IGNsaSA9IE1hdHJpeENsaWVudFBlZy5nZXQoKTtcbiAgICBjb25zdCByb29tID0gY2xpLmdldFJvb20oUm9vbVZpZXdTdG9yZS5pbnN0YW5jZS5nZXRSb29tSWQoKSk7XG4gICAgcmV0dXJuIGlzTG9jYWxSb29tKHJvb20pO1xufTtcblxuLyogRGlzYWJsZSB0aGUgXCJ1bmV4cGVjdGVkIHRoaXNcIiBlcnJvciBmb3IgdGhlc2UgY29tbWFuZHMgLSBhbGwgb2YgdGhlIHJ1blxuICogZnVuY3Rpb25zIGFyZSBjYWxsZWQgd2l0aCBgdGhpc2AgYm91bmQgdG8gdGhlIENvbW1hbmQgaW5zdGFuY2UuXG4gKi9cblxuZXhwb3J0IGNvbnN0IENvbW1hbmRzID0gW1xuICAgIG5ldyBDb21tYW5kKHtcbiAgICAgICAgY29tbWFuZDogJ3Nwb2lsZXInLFxuICAgICAgICBhcmdzOiAnPG1lc3NhZ2U+JyxcbiAgICAgICAgZGVzY3JpcHRpb246IF90ZCgnU2VuZHMgdGhlIGdpdmVuIG1lc3NhZ2UgYXMgYSBzcG9pbGVyJyksXG4gICAgICAgIHJ1bkZuOiBmdW5jdGlvbihyb29tSWQsIG1lc3NhZ2UpIHtcbiAgICAgICAgICAgIHJldHVybiBzdWNjZXNzU3luYyhDb250ZW50SGVscGVycy5tYWtlSHRtbE1lc3NhZ2UoXG4gICAgICAgICAgICAgICAgbWVzc2FnZSxcbiAgICAgICAgICAgICAgICBgPHNwYW4gZGF0YS1teC1zcG9pbGVyPiR7bWVzc2FnZX08L3NwYW4+YCxcbiAgICAgICAgICAgICkpO1xuICAgICAgICB9LFxuICAgICAgICBjYXRlZ29yeTogQ29tbWFuZENhdGVnb3JpZXMubWVzc2FnZXMsXG4gICAgfSksXG4gICAgbmV3IENvbW1hbmQoe1xuICAgICAgICBjb21tYW5kOiAnc2hydWcnLFxuICAgICAgICBhcmdzOiAnPG1lc3NhZ2U+JyxcbiAgICAgICAgZGVzY3JpcHRpb246IF90ZCgnUHJlcGVuZHMgwq9cXFxcXyjjg4QpXy/CryB0byBhIHBsYWluLXRleHQgbWVzc2FnZScpLFxuICAgICAgICBydW5GbjogZnVuY3Rpb24ocm9vbUlkLCBhcmdzKSB7XG4gICAgICAgICAgICBsZXQgbWVzc2FnZSA9ICfCr1xcXFxfKOODhClfL8KvJztcbiAgICAgICAgICAgIGlmIChhcmdzKSB7XG4gICAgICAgICAgICAgICAgbWVzc2FnZSA9IG1lc3NhZ2UgKyAnICcgKyBhcmdzO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHN1Y2Nlc3NTeW5jKENvbnRlbnRIZWxwZXJzLm1ha2VUZXh0TWVzc2FnZShtZXNzYWdlKSk7XG4gICAgICAgIH0sXG4gICAgICAgIGNhdGVnb3J5OiBDb21tYW5kQ2F0ZWdvcmllcy5tZXNzYWdlcyxcbiAgICB9KSxcbiAgICBuZXcgQ29tbWFuZCh7XG4gICAgICAgIGNvbW1hbmQ6ICd0YWJsZWZsaXAnLFxuICAgICAgICBhcmdzOiAnPG1lc3NhZ2U+JyxcbiAgICAgICAgZGVzY3JpcHRpb246IF90ZCgnUHJlcGVuZHMgKOKVr8Kw4pahwrDvvInila/vuLUg4pS74pSB4pS7IHRvIGEgcGxhaW4tdGV4dCBtZXNzYWdlJyksXG4gICAgICAgIHJ1bkZuOiBmdW5jdGlvbihyb29tSWQsIGFyZ3MpIHtcbiAgICAgICAgICAgIGxldCBtZXNzYWdlID0gJyjila/CsOKWocKw77yJ4pWv77i1IOKUu+KUgeKUuyc7XG4gICAgICAgICAgICBpZiAoYXJncykge1xuICAgICAgICAgICAgICAgIG1lc3NhZ2UgPSBtZXNzYWdlICsgJyAnICsgYXJncztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBzdWNjZXNzU3luYyhDb250ZW50SGVscGVycy5tYWtlVGV4dE1lc3NhZ2UobWVzc2FnZSkpO1xuICAgICAgICB9LFxuICAgICAgICBjYXRlZ29yeTogQ29tbWFuZENhdGVnb3JpZXMubWVzc2FnZXMsXG4gICAgfSksXG4gICAgbmV3IENvbW1hbmQoe1xuICAgICAgICBjb21tYW5kOiAndW5mbGlwJyxcbiAgICAgICAgYXJnczogJzxtZXNzYWdlPicsXG4gICAgICAgIGRlc2NyaXB0aW9uOiBfdGQoJ1ByZXBlbmRzIOKUrOKUgOKUgOKUrCDjg44oIOOCnC3jgpzjg44pIHRvIGEgcGxhaW4tdGV4dCBtZXNzYWdlJyksXG4gICAgICAgIHJ1bkZuOiBmdW5jdGlvbihyb29tSWQsIGFyZ3MpIHtcbiAgICAgICAgICAgIGxldCBtZXNzYWdlID0gJ+KUrOKUgOKUgOKUrCDjg44oIOOCnC3jgpzjg44pJztcbiAgICAgICAgICAgIGlmIChhcmdzKSB7XG4gICAgICAgICAgICAgICAgbWVzc2FnZSA9IG1lc3NhZ2UgKyAnICcgKyBhcmdzO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHN1Y2Nlc3NTeW5jKENvbnRlbnRIZWxwZXJzLm1ha2VUZXh0TWVzc2FnZShtZXNzYWdlKSk7XG4gICAgICAgIH0sXG4gICAgICAgIGNhdGVnb3J5OiBDb21tYW5kQ2F0ZWdvcmllcy5tZXNzYWdlcyxcbiAgICB9KSxcbiAgICBuZXcgQ29tbWFuZCh7XG4gICAgICAgIGNvbW1hbmQ6ICdsZW5ueScsXG4gICAgICAgIGFyZ3M6ICc8bWVzc2FnZT4nLFxuICAgICAgICBkZXNjcmlwdGlvbjogX3RkKCdQcmVwZW5kcyAoIM2hwrAgzZzKliDNocKwKSB0byBhIHBsYWluLXRleHQgbWVzc2FnZScpLFxuICAgICAgICBydW5GbjogZnVuY3Rpb24ocm9vbUlkLCBhcmdzKSB7XG4gICAgICAgICAgICBsZXQgbWVzc2FnZSA9ICcoIM2hwrAgzZzKliDNocKwKSc7XG4gICAgICAgICAgICBpZiAoYXJncykge1xuICAgICAgICAgICAgICAgIG1lc3NhZ2UgPSBtZXNzYWdlICsgJyAnICsgYXJncztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBzdWNjZXNzU3luYyhDb250ZW50SGVscGVycy5tYWtlVGV4dE1lc3NhZ2UobWVzc2FnZSkpO1xuICAgICAgICB9LFxuICAgICAgICBjYXRlZ29yeTogQ29tbWFuZENhdGVnb3JpZXMubWVzc2FnZXMsXG4gICAgfSksXG4gICAgbmV3IENvbW1hbmQoe1xuICAgICAgICBjb21tYW5kOiAncGxhaW4nLFxuICAgICAgICBhcmdzOiAnPG1lc3NhZ2U+JyxcbiAgICAgICAgZGVzY3JpcHRpb246IF90ZCgnU2VuZHMgYSBtZXNzYWdlIGFzIHBsYWluIHRleHQsIHdpdGhvdXQgaW50ZXJwcmV0aW5nIGl0IGFzIG1hcmtkb3duJyksXG4gICAgICAgIHJ1bkZuOiBmdW5jdGlvbihyb29tSWQsIG1lc3NhZ2VzKSB7XG4gICAgICAgICAgICByZXR1cm4gc3VjY2Vzc1N5bmMoQ29udGVudEhlbHBlcnMubWFrZVRleHRNZXNzYWdlKG1lc3NhZ2VzKSk7XG4gICAgICAgIH0sXG4gICAgICAgIGNhdGVnb3J5OiBDb21tYW5kQ2F0ZWdvcmllcy5tZXNzYWdlcyxcbiAgICB9KSxcbiAgICBuZXcgQ29tbWFuZCh7XG4gICAgICAgIGNvbW1hbmQ6ICdodG1sJyxcbiAgICAgICAgYXJnczogJzxtZXNzYWdlPicsXG4gICAgICAgIGRlc2NyaXB0aW9uOiBfdGQoJ1NlbmRzIGEgbWVzc2FnZSBhcyBodG1sLCB3aXRob3V0IGludGVycHJldGluZyBpdCBhcyBtYXJrZG93bicpLFxuICAgICAgICBydW5GbjogZnVuY3Rpb24ocm9vbUlkLCBtZXNzYWdlcykge1xuICAgICAgICAgICAgcmV0dXJuIHN1Y2Nlc3NTeW5jKENvbnRlbnRIZWxwZXJzLm1ha2VIdG1sTWVzc2FnZShtZXNzYWdlcywgbWVzc2FnZXMpKTtcbiAgICAgICAgfSxcbiAgICAgICAgY2F0ZWdvcnk6IENvbW1hbmRDYXRlZ29yaWVzLm1lc3NhZ2VzLFxuICAgIH0pLFxuICAgIG5ldyBDb21tYW5kKHtcbiAgICAgICAgY29tbWFuZDogJ3VwZ3JhZGVyb29tJyxcbiAgICAgICAgYXJnczogJzxuZXdfdmVyc2lvbj4nLFxuICAgICAgICBkZXNjcmlwdGlvbjogX3RkKCdVcGdyYWRlcyBhIHJvb20gdG8gYSBuZXcgdmVyc2lvbicpLFxuICAgICAgICBpc0VuYWJsZWQ6ICgpID0+ICFpc0N1cnJlbnRMb2NhbFJvb20oKSxcbiAgICAgICAgcnVuRm46IGZ1bmN0aW9uKHJvb21JZCwgYXJncykge1xuICAgICAgICAgICAgaWYgKGFyZ3MpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBjbGkgPSBNYXRyaXhDbGllbnRQZWcuZ2V0KCk7XG4gICAgICAgICAgICAgICAgY29uc3Qgcm9vbSA9IGNsaS5nZXRSb29tKHJvb21JZCk7XG4gICAgICAgICAgICAgICAgaWYgKCFyb29tLmN1cnJlbnRTdGF0ZS5tYXlDbGllbnRTZW5kU3RhdGVFdmVudChcIm0ucm9vbS50b21ic3RvbmVcIiwgY2xpKSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcmVqZWN0KFxuICAgICAgICAgICAgICAgICAgICAgICAgbmV3VHJhbnNsYXRhYmxlRXJyb3IoXCJZb3UgZG8gbm90IGhhdmUgdGhlIHJlcXVpcmVkIHBlcm1pc3Npb25zIHRvIHVzZSB0aGlzIGNvbW1hbmQuXCIpLFxuICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGNvbnN0IHsgZmluaXNoZWQgfSA9IE1vZGFsLmNyZWF0ZURpYWxvZyhcbiAgICAgICAgICAgICAgICAgICAgUm9vbVVwZ3JhZGVXYXJuaW5nRGlhbG9nLCB7IHJvb21JZDogcm9vbUlkLCB0YXJnZXRWZXJzaW9uOiBhcmdzIH0sIC8qY2xhc3NOYW1lPSovbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgLyppc1ByaW9yaXR5PSovZmFsc2UsIC8qaXNTdGF0aWM9Ki90cnVlKTtcblxuICAgICAgICAgICAgICAgIHJldHVybiBzdWNjZXNzKGZpbmlzaGVkLnRoZW4oYXN5bmMgKFtyZXNwXSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZiAoIXJlc3A/LmNvbnRpbnVlKSByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgIGF3YWl0IHVwZ3JhZGVSb29tKHJvb20sIGFyZ3MsIHJlc3AuaW52aXRlKTtcbiAgICAgICAgICAgICAgICB9KSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcmVqZWN0KHRoaXMuZ2V0VXNhZ2UoKSk7XG4gICAgICAgIH0sXG4gICAgICAgIGNhdGVnb3J5OiBDb21tYW5kQ2F0ZWdvcmllcy5hZG1pbixcbiAgICAgICAgcmVuZGVyaW5nVHlwZXM6IFtUaW1lbGluZVJlbmRlcmluZ1R5cGUuUm9vbV0sXG4gICAgfSksXG4gICAgbmV3IENvbW1hbmQoe1xuICAgICAgICBjb21tYW5kOiAnanVtcHRvZGF0ZScsXG4gICAgICAgIGFyZ3M6ICc8WVlZWS1NTS1ERD4nLFxuICAgICAgICBkZXNjcmlwdGlvbjogX3RkKCdKdW1wIHRvIHRoZSBnaXZlbiBkYXRlIGluIHRoZSB0aW1lbGluZScpLFxuICAgICAgICBpc0VuYWJsZWQ6ICgpID0+IFNldHRpbmdzU3RvcmUuZ2V0VmFsdWUoXCJmZWF0dXJlX2p1bXBfdG9fZGF0ZVwiKSxcbiAgICAgICAgcnVuRm46IGZ1bmN0aW9uKHJvb21JZCwgYXJncykge1xuICAgICAgICAgICAgaWYgKGFyZ3MpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gc3VjY2VzcygoYXN5bmMgKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCB1bml4VGltZXN0YW1wID0gRGF0ZS5wYXJzZShhcmdzKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCF1bml4VGltZXN0YW1wKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXdUcmFuc2xhdGFibGVFcnJvcihcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnV2Ugd2VyZSB1bmFibGUgdG8gdW5kZXJzdGFuZCB0aGUgZ2l2ZW4gZGF0ZSAoJShpbnB1dERhdGUpcykuICcgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnVHJ5IHVzaW5nIHRoZSBmb3JtYXQgWVlZWS1NTS1ERC4nLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsgaW5wdXREYXRlOiBhcmdzIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgY29uc3QgY2xpID0gTWF0cml4Q2xpZW50UGVnLmdldCgpO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCB7IGV2ZW50X2lkOiBldmVudElkLCBvcmlnaW5fc2VydmVyX3RzOiBvcmlnaW5TZXJ2ZXJUcyB9ID0gYXdhaXQgY2xpLnRpbWVzdGFtcFRvRXZlbnQoXG4gICAgICAgICAgICAgICAgICAgICAgICByb29tSWQsXG4gICAgICAgICAgICAgICAgICAgICAgICB1bml4VGltZXN0YW1wLFxuICAgICAgICAgICAgICAgICAgICAgICAgRGlyZWN0aW9uLkZvcndhcmQsXG4gICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICAgIGxvZ2dlci5sb2coXG4gICAgICAgICAgICAgICAgICAgICAgICBgL3RpbWVzdGFtcF90b19ldmVudDogZm91bmQgJHtldmVudElkfSAoJHtvcmlnaW5TZXJ2ZXJUc30pIGZvciB0aW1lc3RhbXA9JHt1bml4VGltZXN0YW1wfWAsXG4gICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICAgIGRpcy5kaXNwYXRjaDxWaWV3Um9vbVBheWxvYWQ+KHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFjdGlvbjogQWN0aW9uLlZpZXdSb29tLFxuICAgICAgICAgICAgICAgICAgICAgICAgZXZlbnRfaWQ6IGV2ZW50SWQsXG4gICAgICAgICAgICAgICAgICAgICAgICBoaWdobGlnaHRlZDogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHJvb21faWQ6IHJvb21JZCxcbiAgICAgICAgICAgICAgICAgICAgICAgIG1ldHJpY3NUcmlnZ2VyOiBcIlNsYXNoQ29tbWFuZFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgbWV0cmljc1ZpYUtleWJvYXJkOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9KSgpKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIHJlamVjdCh0aGlzLmdldFVzYWdlKCkpO1xuICAgICAgICB9LFxuICAgICAgICBjYXRlZ29yeTogQ29tbWFuZENhdGVnb3JpZXMuYWN0aW9ucyxcbiAgICB9KSxcbiAgICBuZXcgQ29tbWFuZCh7XG4gICAgICAgIGNvbW1hbmQ6ICduaWNrJyxcbiAgICAgICAgYXJnczogJzxkaXNwbGF5X25hbWU+JyxcbiAgICAgICAgZGVzY3JpcHRpb246IF90ZCgnQ2hhbmdlcyB5b3VyIGRpc3BsYXkgbmlja25hbWUnKSxcbiAgICAgICAgcnVuRm46IGZ1bmN0aW9uKHJvb21JZCwgYXJncykge1xuICAgICAgICAgICAgaWYgKGFyZ3MpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gc3VjY2VzcyhNYXRyaXhDbGllbnRQZWcuZ2V0KCkuc2V0RGlzcGxheU5hbWUoYXJncykpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHJlamVjdCh0aGlzLmdldFVzYWdlKCkpO1xuICAgICAgICB9LFxuICAgICAgICBjYXRlZ29yeTogQ29tbWFuZENhdGVnb3JpZXMuYWN0aW9ucyxcbiAgICAgICAgcmVuZGVyaW5nVHlwZXM6IFtUaW1lbGluZVJlbmRlcmluZ1R5cGUuUm9vbV0sXG4gICAgfSksXG4gICAgbmV3IENvbW1hbmQoe1xuICAgICAgICBjb21tYW5kOiAnbXlyb29tbmljaycsXG4gICAgICAgIGFsaWFzZXM6IFsncm9vbW5pY2snXSxcbiAgICAgICAgYXJnczogJzxkaXNwbGF5X25hbWU+JyxcbiAgICAgICAgZGVzY3JpcHRpb246IF90ZCgnQ2hhbmdlcyB5b3VyIGRpc3BsYXkgbmlja25hbWUgaW4gdGhlIGN1cnJlbnQgcm9vbSBvbmx5JyksXG4gICAgICAgIGlzRW5hYmxlZDogKCkgPT4gIWlzQ3VycmVudExvY2FsUm9vbSgpLFxuICAgICAgICBydW5GbjogZnVuY3Rpb24ocm9vbUlkLCBhcmdzKSB7XG4gICAgICAgICAgICBpZiAoYXJncykge1xuICAgICAgICAgICAgICAgIGNvbnN0IGNsaSA9IE1hdHJpeENsaWVudFBlZy5nZXQoKTtcbiAgICAgICAgICAgICAgICBjb25zdCBldiA9IGNsaS5nZXRSb29tKHJvb21JZCkuY3VycmVudFN0YXRlLmdldFN0YXRlRXZlbnRzKCdtLnJvb20ubWVtYmVyJywgY2xpLmdldFVzZXJJZCgpKTtcbiAgICAgICAgICAgICAgICBjb25zdCBjb250ZW50ID0ge1xuICAgICAgICAgICAgICAgICAgICAuLi4oZXYgPyBldi5nZXRDb250ZW50KCkgOiB7IG1lbWJlcnNoaXA6ICdqb2luJyB9KSxcbiAgICAgICAgICAgICAgICAgICAgZGlzcGxheW5hbWU6IGFyZ3MsXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICByZXR1cm4gc3VjY2VzcyhjbGkuc2VuZFN0YXRlRXZlbnQocm9vbUlkLCAnbS5yb29tLm1lbWJlcicsIGNvbnRlbnQsIGNsaS5nZXRVc2VySWQoKSkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHJlamVjdCh0aGlzLmdldFVzYWdlKCkpO1xuICAgICAgICB9LFxuICAgICAgICBjYXRlZ29yeTogQ29tbWFuZENhdGVnb3JpZXMuYWN0aW9ucyxcbiAgICAgICAgcmVuZGVyaW5nVHlwZXM6IFtUaW1lbGluZVJlbmRlcmluZ1R5cGUuUm9vbV0sXG4gICAgfSksXG4gICAgbmV3IENvbW1hbmQoe1xuICAgICAgICBjb21tYW5kOiAncm9vbWF2YXRhcicsXG4gICAgICAgIGFyZ3M6ICdbPG14Y191cmw+XScsXG4gICAgICAgIGRlc2NyaXB0aW9uOiBfdGQoJ0NoYW5nZXMgdGhlIGF2YXRhciBvZiB0aGUgY3VycmVudCByb29tJyksXG4gICAgICAgIGlzRW5hYmxlZDogKCkgPT4gIWlzQ3VycmVudExvY2FsUm9vbSgpLFxuICAgICAgICBydW5GbjogZnVuY3Rpb24ocm9vbUlkLCBhcmdzKSB7XG4gICAgICAgICAgICBsZXQgcHJvbWlzZSA9IFByb21pc2UucmVzb2x2ZShhcmdzKTtcbiAgICAgICAgICAgIGlmICghYXJncykge1xuICAgICAgICAgICAgICAgIHByb21pc2UgPSBzaW5nbGVNeGNVcGxvYWQoKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIHN1Y2Nlc3MocHJvbWlzZS50aGVuKCh1cmwpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoIXVybCkgcmV0dXJuO1xuICAgICAgICAgICAgICAgIHJldHVybiBNYXRyaXhDbGllbnRQZWcuZ2V0KCkuc2VuZFN0YXRlRXZlbnQocm9vbUlkLCAnbS5yb29tLmF2YXRhcicsIHsgdXJsIH0sICcnKTtcbiAgICAgICAgICAgIH0pKTtcbiAgICAgICAgfSxcbiAgICAgICAgY2F0ZWdvcnk6IENvbW1hbmRDYXRlZ29yaWVzLmFjdGlvbnMsXG4gICAgICAgIHJlbmRlcmluZ1R5cGVzOiBbVGltZWxpbmVSZW5kZXJpbmdUeXBlLlJvb21dLFxuICAgIH0pLFxuICAgIG5ldyBDb21tYW5kKHtcbiAgICAgICAgY29tbWFuZDogJ215cm9vbWF2YXRhcicsXG4gICAgICAgIGFyZ3M6ICdbPG14Y191cmw+XScsXG4gICAgICAgIGRlc2NyaXB0aW9uOiBfdGQoJ0NoYW5nZXMgeW91ciBhdmF0YXIgaW4gdGhpcyBjdXJyZW50IHJvb20gb25seScpLFxuICAgICAgICBpc0VuYWJsZWQ6ICgpID0+ICFpc0N1cnJlbnRMb2NhbFJvb20oKSxcbiAgICAgICAgcnVuRm46IGZ1bmN0aW9uKHJvb21JZCwgYXJncykge1xuICAgICAgICAgICAgY29uc3QgY2xpID0gTWF0cml4Q2xpZW50UGVnLmdldCgpO1xuICAgICAgICAgICAgY29uc3Qgcm9vbSA9IGNsaS5nZXRSb29tKHJvb21JZCk7XG4gICAgICAgICAgICBjb25zdCB1c2VySWQgPSBjbGkuZ2V0VXNlcklkKCk7XG5cbiAgICAgICAgICAgIGxldCBwcm9taXNlID0gUHJvbWlzZS5yZXNvbHZlKGFyZ3MpO1xuICAgICAgICAgICAgaWYgKCFhcmdzKSB7XG4gICAgICAgICAgICAgICAgcHJvbWlzZSA9IHNpbmdsZU14Y1VwbG9hZCgpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gc3VjY2Vzcyhwcm9taXNlLnRoZW4oKHVybCkgPT4ge1xuICAgICAgICAgICAgICAgIGlmICghdXJsKSByZXR1cm47XG4gICAgICAgICAgICAgICAgY29uc3QgZXYgPSByb29tLmN1cnJlbnRTdGF0ZS5nZXRTdGF0ZUV2ZW50cygnbS5yb29tLm1lbWJlcicsIHVzZXJJZCk7XG4gICAgICAgICAgICAgICAgY29uc3QgY29udGVudCA9IHtcbiAgICAgICAgICAgICAgICAgICAgLi4uKGV2ID8gZXYuZ2V0Q29udGVudCgpIDogeyBtZW1iZXJzaGlwOiAnam9pbicgfSksXG4gICAgICAgICAgICAgICAgICAgIGF2YXRhcl91cmw6IHVybCxcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIHJldHVybiBjbGkuc2VuZFN0YXRlRXZlbnQocm9vbUlkLCAnbS5yb29tLm1lbWJlcicsIGNvbnRlbnQsIHVzZXJJZCk7XG4gICAgICAgICAgICB9KSk7XG4gICAgICAgIH0sXG4gICAgICAgIGNhdGVnb3J5OiBDb21tYW5kQ2F0ZWdvcmllcy5hY3Rpb25zLFxuICAgICAgICByZW5kZXJpbmdUeXBlczogW1RpbWVsaW5lUmVuZGVyaW5nVHlwZS5Sb29tXSxcbiAgICB9KSxcbiAgICBuZXcgQ29tbWFuZCh7XG4gICAgICAgIGNvbW1hbmQ6ICdteWF2YXRhcicsXG4gICAgICAgIGFyZ3M6ICdbPG14Y191cmw+XScsXG4gICAgICAgIGRlc2NyaXB0aW9uOiBfdGQoJ0NoYW5nZXMgeW91ciBhdmF0YXIgaW4gYWxsIHJvb21zJyksXG4gICAgICAgIHJ1bkZuOiBmdW5jdGlvbihyb29tSWQsIGFyZ3MpIHtcbiAgICAgICAgICAgIGxldCBwcm9taXNlID0gUHJvbWlzZS5yZXNvbHZlKGFyZ3MpO1xuICAgICAgICAgICAgaWYgKCFhcmdzKSB7XG4gICAgICAgICAgICAgICAgcHJvbWlzZSA9IHNpbmdsZU14Y1VwbG9hZCgpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gc3VjY2Vzcyhwcm9taXNlLnRoZW4oKHVybCkgPT4ge1xuICAgICAgICAgICAgICAgIGlmICghdXJsKSByZXR1cm47XG4gICAgICAgICAgICAgICAgcmV0dXJuIE1hdHJpeENsaWVudFBlZy5nZXQoKS5zZXRBdmF0YXJVcmwodXJsKTtcbiAgICAgICAgICAgIH0pKTtcbiAgICAgICAgfSxcbiAgICAgICAgY2F0ZWdvcnk6IENvbW1hbmRDYXRlZ29yaWVzLmFjdGlvbnMsXG4gICAgICAgIHJlbmRlcmluZ1R5cGVzOiBbVGltZWxpbmVSZW5kZXJpbmdUeXBlLlJvb21dLFxuICAgIH0pLFxuICAgIG5ldyBDb21tYW5kKHtcbiAgICAgICAgY29tbWFuZDogJ3RvcGljJyxcbiAgICAgICAgYXJnczogJ1s8dG9waWM+XScsXG4gICAgICAgIGRlc2NyaXB0aW9uOiBfdGQoJ0dldHMgb3Igc2V0cyB0aGUgcm9vbSB0b3BpYycpLFxuICAgICAgICBpc0VuYWJsZWQ6ICgpID0+ICFpc0N1cnJlbnRMb2NhbFJvb20oKSxcbiAgICAgICAgcnVuRm46IGZ1bmN0aW9uKHJvb21JZCwgYXJncykge1xuICAgICAgICAgICAgY29uc3QgY2xpID0gTWF0cml4Q2xpZW50UGVnLmdldCgpO1xuICAgICAgICAgICAgaWYgKGFyZ3MpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBodG1sID0gaHRtbFNlcmlhbGl6ZUZyb21NZElmTmVlZGVkKGFyZ3MsIHsgZm9yY2VIVE1MOiBmYWxzZSB9KTtcbiAgICAgICAgICAgICAgICByZXR1cm4gc3VjY2VzcyhjbGkuc2V0Um9vbVRvcGljKHJvb21JZCwgYXJncywgaHRtbCkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3Qgcm9vbSA9IGNsaS5nZXRSb29tKHJvb21JZCk7XG4gICAgICAgICAgICBpZiAoIXJvb20pIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVqZWN0KFxuICAgICAgICAgICAgICAgICAgICBuZXdUcmFuc2xhdGFibGVFcnJvcihcIkZhaWxlZCB0byBnZXQgcm9vbSB0b3BpYzogVW5hYmxlIHRvIGZpbmQgcm9vbSAoJShyb29tSWQpc1wiLCB7IHJvb21JZCB9KSxcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjb25zdCBjb250ZW50OiBNUm9vbVRvcGljRXZlbnRDb250ZW50ID0gcm9vbS5jdXJyZW50U3RhdGUuZ2V0U3RhdGVFdmVudHMoJ20ucm9vbS50b3BpYycsICcnKT8uZ2V0Q29udGVudCgpO1xuICAgICAgICAgICAgY29uc3QgdG9waWMgPSAhIWNvbnRlbnRcbiAgICAgICAgICAgICAgICA/IENvbnRlbnRIZWxwZXJzLnBhcnNlVG9waWNDb250ZW50KGNvbnRlbnQpXG4gICAgICAgICAgICAgICAgOiB7IHRleHQ6IF90KCdUaGlzIHJvb20gaGFzIG5vIHRvcGljLicpIH07XG5cbiAgICAgICAgICAgIGNvbnN0IHJlZiA9IGUgPT4gZSAmJiBsaW5raWZ5RWxlbWVudChlKTtcbiAgICAgICAgICAgIGNvbnN0IGJvZHkgPSB0b3BpY1RvSHRtbCh0b3BpYy50ZXh0LCB0b3BpYy5odG1sLCByZWYsIHRydWUpO1xuXG4gICAgICAgICAgICBNb2RhbC5jcmVhdGVEaWFsb2coSW5mb0RpYWxvZywge1xuICAgICAgICAgICAgICAgIHRpdGxlOiByb29tLm5hbWUsXG4gICAgICAgICAgICAgICAgZGVzY3JpcHRpb246IDxkaXYgcmVmPXtyZWZ9PnsgYm9keSB9PC9kaXY+LFxuICAgICAgICAgICAgICAgIGhhc0Nsb3NlQnV0dG9uOiB0cnVlLFxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZTogXCJtYXJrZG93bi1ib2R5XCIsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJldHVybiBzdWNjZXNzKCk7XG4gICAgICAgIH0sXG4gICAgICAgIGNhdGVnb3J5OiBDb21tYW5kQ2F0ZWdvcmllcy5hZG1pbixcbiAgICAgICAgcmVuZGVyaW5nVHlwZXM6IFtUaW1lbGluZVJlbmRlcmluZ1R5cGUuUm9vbV0sXG4gICAgfSksXG4gICAgbmV3IENvbW1hbmQoe1xuICAgICAgICBjb21tYW5kOiAncm9vbW5hbWUnLFxuICAgICAgICBhcmdzOiAnPG5hbWU+JyxcbiAgICAgICAgZGVzY3JpcHRpb246IF90ZCgnU2V0cyB0aGUgcm9vbSBuYW1lJyksXG4gICAgICAgIGlzRW5hYmxlZDogKCkgPT4gIWlzQ3VycmVudExvY2FsUm9vbSgpLFxuICAgICAgICBydW5GbjogZnVuY3Rpb24ocm9vbUlkLCBhcmdzKSB7XG4gICAgICAgICAgICBpZiAoYXJncykge1xuICAgICAgICAgICAgICAgIHJldHVybiBzdWNjZXNzKE1hdHJpeENsaWVudFBlZy5nZXQoKS5zZXRSb29tTmFtZShyb29tSWQsIGFyZ3MpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiByZWplY3QodGhpcy5nZXRVc2FnZSgpKTtcbiAgICAgICAgfSxcbiAgICAgICAgY2F0ZWdvcnk6IENvbW1hbmRDYXRlZ29yaWVzLmFkbWluLFxuICAgICAgICByZW5kZXJpbmdUeXBlczogW1RpbWVsaW5lUmVuZGVyaW5nVHlwZS5Sb29tXSxcbiAgICB9KSxcbiAgICBuZXcgQ29tbWFuZCh7XG4gICAgICAgIGNvbW1hbmQ6ICdpbnZpdGUnLFxuICAgICAgICBhcmdzOiAnPHVzZXItaWQ+IFs8cmVhc29uPl0nLFxuICAgICAgICBkZXNjcmlwdGlvbjogX3RkKCdJbnZpdGVzIHVzZXIgd2l0aCBnaXZlbiBpZCB0byBjdXJyZW50IHJvb20nKSxcbiAgICAgICAgYW5hbHl0aWNzTmFtZTogXCJJbnZpdGVcIixcbiAgICAgICAgaXNFbmFibGVkOiAoKSA9PiAhaXNDdXJyZW50TG9jYWxSb29tKCkgJiYgc2hvdWxkU2hvd0NvbXBvbmVudChVSUNvbXBvbmVudC5JbnZpdGVVc2VycyksXG4gICAgICAgIHJ1bkZuOiBmdW5jdGlvbihyb29tSWQsIGFyZ3MpIHtcbiAgICAgICAgICAgIGlmIChhcmdzKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgW2FkZHJlc3MsIHJlYXNvbl0gPSBhcmdzLnNwbGl0KC9cXHMrKC4rKS8pO1xuICAgICAgICAgICAgICAgIGlmIChhZGRyZXNzKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIFdlIHVzZSBhIE11bHRpSW52aXRlciB0byByZS11c2UgdGhlIGludml0ZSBsb2dpYywgZXZlbiB0aG91Z2hcbiAgICAgICAgICAgICAgICAgICAgLy8gd2UncmUgb25seSBpbnZpdGluZyBvbmUgdXNlci5cbiAgICAgICAgICAgICAgICAgICAgLy8gSWYgd2UgbmVlZCBhbiBpZGVudGl0eSBzZXJ2ZXIgYnV0IGRvbid0IGhhdmUgb25lLCB0aGluZ3NcbiAgICAgICAgICAgICAgICAgICAgLy8gZ2V0IGEgYml0IG1vcmUgY29tcGxleCBoZXJlLCBidXQgd2UgdHJ5IHRvIHNob3cgc29tZXRoaW5nXG4gICAgICAgICAgICAgICAgICAgIC8vIG1lYW5pbmdmdWwuXG4gICAgICAgICAgICAgICAgICAgIGxldCBwcm9tID0gUHJvbWlzZS5yZXNvbHZlKCk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChcbiAgICAgICAgICAgICAgICAgICAgICAgIGdldEFkZHJlc3NUeXBlKGFkZHJlc3MpID09PSBBZGRyZXNzVHlwZS5FbWFpbCAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgIU1hdHJpeENsaWVudFBlZy5nZXQoKS5nZXRJZGVudGl0eVNlcnZlclVybCgpXG4gICAgICAgICAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgZGVmYXVsdElkZW50aXR5U2VydmVyVXJsID0gZ2V0RGVmYXVsdElkZW50aXR5U2VydmVyVXJsKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoZGVmYXVsdElkZW50aXR5U2VydmVyVXJsKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgeyBmaW5pc2hlZCB9ID0gTW9kYWwuY3JlYXRlRGlhbG9nPFtib29sZWFuXT4oUXVlc3Rpb25EaWFsb2csIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGl0bGU6IF90KFwiVXNlIGFuIGlkZW50aXR5IHNlcnZlclwiKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246IDxwPnsgX3QoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIlVzZSBhbiBpZGVudGl0eSBzZXJ2ZXIgdG8gaW52aXRlIGJ5IGVtYWlsLiBcIiArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIkNsaWNrIGNvbnRpbnVlIHRvIHVzZSB0aGUgZGVmYXVsdCBpZGVudGl0eSBzZXJ2ZXIgXCIgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCIoJShkZWZhdWx0SWRlbnRpdHlTZXJ2ZXJOYW1lKXMpIG9yIG1hbmFnZSBpbiBTZXR0aW5ncy5cIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWZhdWx0SWRlbnRpdHlTZXJ2ZXJOYW1lOiBhYmJyZXZpYXRlVXJsKGRlZmF1bHRJZGVudGl0eVNlcnZlclVybCksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApIH08L3A+LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBidXR0b246IF90KFwiQ29udGludWVcIiksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcm9tID0gZmluaXNoZWQudGhlbigoW3VzZURlZmF1bHRdKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICh1c2VEZWZhdWx0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZXRUb0RlZmF1bHRJZGVudGl0eVNlcnZlcigpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IG5ld1RyYW5zbGF0YWJsZUVycm9yKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJVc2UgYW4gaWRlbnRpdHkgc2VydmVyIHRvIGludml0ZSBieSBlbWFpbC4gTWFuYWdlIGluIFNldHRpbmdzLlwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gcmVqZWN0KFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXdUcmFuc2xhdGFibGVFcnJvcihcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiVXNlIGFuIGlkZW50aXR5IHNlcnZlciB0byBpbnZpdGUgYnkgZW1haWwuIE1hbmFnZSBpbiBTZXR0aW5ncy5cIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGludml0ZXIgPSBuZXcgTXVsdGlJbnZpdGVyKHJvb21JZCk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBzdWNjZXNzKHByb20udGhlbigoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gaW52aXRlci5pbnZpdGUoW2FkZHJlc3NdLCByZWFzb24sIHRydWUpO1xuICAgICAgICAgICAgICAgICAgICB9KS50aGVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChpbnZpdGVyLmdldENvbXBsZXRpb25TdGF0ZShhZGRyZXNzKSAhPT0gXCJpbnZpdGVkXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoaW52aXRlci5nZXRFcnJvclRleHQoYWRkcmVzcykpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHJlamVjdCh0aGlzLmdldFVzYWdlKCkpO1xuICAgICAgICB9LFxuICAgICAgICBjYXRlZ29yeTogQ29tbWFuZENhdGVnb3JpZXMuYWN0aW9ucyxcbiAgICAgICAgcmVuZGVyaW5nVHlwZXM6IFtUaW1lbGluZVJlbmRlcmluZ1R5cGUuUm9vbV0sXG4gICAgfSksXG4gICAgbmV3IENvbW1hbmQoe1xuICAgICAgICBjb21tYW5kOiAnam9pbicsXG4gICAgICAgIGFsaWFzZXM6IFsnaicsICdnb3RvJ10sXG4gICAgICAgIGFyZ3M6ICc8cm9vbS1hZGRyZXNzPicsXG4gICAgICAgIGRlc2NyaXB0aW9uOiBfdGQoJ0pvaW5zIHJvb20gd2l0aCBnaXZlbiBhZGRyZXNzJyksXG4gICAgICAgIHJ1bkZuOiBmdW5jdGlvbihyb29tSWQsIGFyZ3MpIHtcbiAgICAgICAgICAgIGlmIChhcmdzKSB7XG4gICAgICAgICAgICAgICAgLy8gTm90ZTogd2Ugc3VwcG9ydCAyIHZlcnNpb25zIG9mIHRoaXMgY29tbWFuZC4gVGhlIGZpcnN0IGlzXG4gICAgICAgICAgICAgICAgLy8gdGhlIHB1YmxpYy1mYWNpbmcgb25lIGZvciBtb3N0IHVzZXJzIGFuZCB0aGUgb3RoZXIgaXMgYVxuICAgICAgICAgICAgICAgIC8vIHBvd2VyLXVzZXIgZWRpdGlvbiB3aGVyZSBzb21lb25lIG1heSBqb2luIHZpYSBwZXJtYWxpbmsgb3JcbiAgICAgICAgICAgICAgICAvLyByb29tIElEIHdpdGggb3B0aW9uYWwgc2VydmVycy4gUHJhY3RpY2FsbHksIHRoaXMgcmVzdWx0c1xuICAgICAgICAgICAgICAgIC8vIGluIHRoZSBmb2xsb3dpbmcgdmFyaWF0aW9uczpcbiAgICAgICAgICAgICAgICAvLyAgIC9qb2luICNleGFtcGxlOmV4YW1wbGUub3JnXG4gICAgICAgICAgICAgICAgLy8gICAvam9pbiAhZXhhbXBsZTpleGFtcGxlLm9yZ1xuICAgICAgICAgICAgICAgIC8vICAgL2pvaW4gIWV4YW1wbGU6ZXhhbXBsZS5vcmcgYWx0c2VydmVyLmNvbSBlbHNld2hlcmUuY2FcbiAgICAgICAgICAgICAgICAvLyAgIC9qb2luIGh0dHBzOi8vbWF0cml4LnRvLyMvIWV4YW1wbGU6ZXhhbXBsZS5vcmc/dmlhPWFsdHNlcnZlci5jb21cbiAgICAgICAgICAgICAgICAvLyBUaGUgY29tbWFuZCBhbHNvIHN1cHBvcnRzIGV2ZW50IHBlcm1hbGlua3MgdHJhbnNwYXJlbnRseTpcbiAgICAgICAgICAgICAgICAvLyAgIC9qb2luIGh0dHBzOi8vbWF0cml4LnRvLyMvIWV4YW1wbGU6ZXhhbXBsZS5vcmcvJHNvbWV0aGluZzpleGFtcGxlLm9yZ1xuICAgICAgICAgICAgICAgIC8vICAgL2pvaW4gaHR0cHM6Ly9tYXRyaXgudG8vIy8hZXhhbXBsZTpleGFtcGxlLm9yZy8kc29tZXRoaW5nOmV4YW1wbGUub3JnP3ZpYT1hbHRzZXJ2ZXIuY29tXG4gICAgICAgICAgICAgICAgY29uc3QgcGFyYW1zID0gYXJncy5zcGxpdCgnICcpO1xuICAgICAgICAgICAgICAgIGlmIChwYXJhbXMubGVuZ3RoIDwgMSkgcmV0dXJuIHJlamVjdCh0aGlzLmdldFVzYWdlKCkpO1xuXG4gICAgICAgICAgICAgICAgbGV0IGlzUGVybWFsaW5rID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgaWYgKHBhcmFtc1swXS5zdGFydHNXaXRoKFwiaHR0cDpcIikgfHwgcGFyYW1zWzBdLnN0YXJ0c1dpdGgoXCJodHRwczpcIikpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gSXQncyBhdCBsZWFzdCBhIFVSTCAtIHRyeSBhbmQgcHVsbCBvdXQgYSBob3N0bmFtZSB0byBjaGVjayBhZ2FpbnN0IHRoZVxuICAgICAgICAgICAgICAgICAgICAvLyBwZXJtYWxpbmsgaGFuZGxlclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBwYXJzZWRVcmwgPSBuZXcgVVJMKHBhcmFtc1swXSk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGhvc3RuYW1lID0gcGFyc2VkVXJsLmhvc3QgfHwgcGFyc2VkVXJsLmhvc3RuYW1lOyAvLyB0YWtlcyBmaXJzdCBub24tZmFsc2V5IHZhbHVlXG5cbiAgICAgICAgICAgICAgICAgICAgLy8gaWYgd2UncmUgdXNpbmcgYSBFbGVtZW50IHBlcm1hbGluayBoYW5kbGVyLCB0aGlzIHdpbGwgY2F0Y2ggaXQgYmVmb3JlIHdlIGdldCBtdWNoIGZ1cnRoZXIuXG4gICAgICAgICAgICAgICAgICAgIC8vIHNlZSBiZWxvdyB3aGVyZSB3ZSBtYWtlIGFzc3VtcHRpb25zIGFib3V0IHBhcnNpbmcgdGhlIFVSTC5cbiAgICAgICAgICAgICAgICAgICAgaWYgKGlzUGVybWFsaW5rSG9zdChob3N0bmFtZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlzUGVybWFsaW5rID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAocGFyYW1zWzBdWzBdID09PSAnIycpIHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IHJvb21BbGlhcyA9IHBhcmFtc1swXTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFyb29tQWxpYXMuaW5jbHVkZXMoJzonKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcm9vbUFsaWFzICs9ICc6JyArIE1hdHJpeENsaWVudFBlZy5nZXQoKS5nZXREb21haW4oKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIGRpcy5kaXNwYXRjaDxWaWV3Um9vbVBheWxvYWQ+KHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFjdGlvbjogQWN0aW9uLlZpZXdSb29tLFxuICAgICAgICAgICAgICAgICAgICAgICAgcm9vbV9hbGlhczogcm9vbUFsaWFzLFxuICAgICAgICAgICAgICAgICAgICAgICAgYXV0b19qb2luOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgbWV0cmljc1RyaWdnZXI6IFwiU2xhc2hDb21tYW5kXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICBtZXRyaWNzVmlhS2V5Ym9hcmQ6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gc3VjY2VzcygpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAocGFyYW1zWzBdWzBdID09PSAnIScpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgW3Jvb21JZCwgLi4udmlhU2VydmVyc10gPSBwYXJhbXM7XG5cbiAgICAgICAgICAgICAgICAgICAgZGlzLmRpc3BhdGNoPFZpZXdSb29tUGF5bG9hZD4oe1xuICAgICAgICAgICAgICAgICAgICAgICAgYWN0aW9uOiBBY3Rpb24uVmlld1Jvb20sXG4gICAgICAgICAgICAgICAgICAgICAgICByb29tX2lkOiByb29tSWQsXG4gICAgICAgICAgICAgICAgICAgICAgICB2aWFfc2VydmVyczogdmlhU2VydmVycywgLy8gZm9yIHRoZSByZWpvaW4gYnV0dG9uXG4gICAgICAgICAgICAgICAgICAgICAgICBhdXRvX2pvaW46IHRydWUsXG4gICAgICAgICAgICAgICAgICAgICAgICBtZXRyaWNzVHJpZ2dlcjogXCJTbGFzaENvbW1hbmRcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIG1ldHJpY3NWaWFLZXlib2FyZDogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBzdWNjZXNzKCk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChpc1Blcm1hbGluaykge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBwZXJtYWxpbmtQYXJ0cyA9IHBhcnNlUGVybWFsaW5rKHBhcmFtc1swXSk7XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gVGhpcyBjaGVjayB0ZWNobmljYWxseSBpc24ndCBuZWVkZWQgYmVjYXVzZSB3ZSBhbHJlYWR5IGRpZCBvdXJcbiAgICAgICAgICAgICAgICAgICAgLy8gc2FmZXR5IGNoZWNrcyB1cCBhYm92ZS4gSG93ZXZlciwgZm9yIGdvb2QgbWVhc3VyZSwgbGV0J3MgYmUgc3VyZS5cbiAgICAgICAgICAgICAgICAgICAgaWYgKCFwZXJtYWxpbmtQYXJ0cykge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlamVjdCh0aGlzLmdldFVzYWdlKCkpO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gSWYgZm9yIHNvbWUgcmVhc29uIHNvbWVvbmUgd2FudGVkIHRvIGpvaW4gYSB1c2VyLCB3ZSBzaG91bGRcbiAgICAgICAgICAgICAgICAgICAgLy8gc3RvcCB0aGVtIG5vdy5cbiAgICAgICAgICAgICAgICAgICAgaWYgKCFwZXJtYWxpbmtQYXJ0cy5yb29tSWRPckFsaWFzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gcmVqZWN0KHRoaXMuZ2V0VXNhZ2UoKSk7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICBjb25zdCBlbnRpdHkgPSBwZXJtYWxpbmtQYXJ0cy5yb29tSWRPckFsaWFzO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCB2aWFTZXJ2ZXJzID0gcGVybWFsaW5rUGFydHMudmlhU2VydmVycztcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZXZlbnRJZCA9IHBlcm1hbGlua1BhcnRzLmV2ZW50SWQ7XG5cbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZGlzcGF0Y2g6IFZpZXdSb29tUGF5bG9hZCA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFjdGlvbjogQWN0aW9uLlZpZXdSb29tLFxuICAgICAgICAgICAgICAgICAgICAgICAgYXV0b19qb2luOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgbWV0cmljc1RyaWdnZXI6IFwiU2xhc2hDb21tYW5kXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICBtZXRyaWNzVmlhS2V5Ym9hcmQ6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKGVudGl0eVswXSA9PT0gJyEnKSBkaXNwYXRjaFtcInJvb21faWRcIl0gPSBlbnRpdHk7XG4gICAgICAgICAgICAgICAgICAgIGVsc2UgZGlzcGF0Y2hbXCJyb29tX2FsaWFzXCJdID0gZW50aXR5O1xuXG4gICAgICAgICAgICAgICAgICAgIGlmIChldmVudElkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkaXNwYXRjaFtcImV2ZW50X2lkXCJdID0gZXZlbnRJZDtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRpc3BhdGNoW1wiaGlnaGxpZ2h0ZWRcIl0gPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKHZpYVNlcnZlcnMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIEZvciB0aGUgam9pblxuICAgICAgICAgICAgICAgICAgICAgICAgZGlzcGF0Y2hbXCJvcHRzXCJdID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFRoZXNlIGFyZSBwYXNzZWQgZG93biB0byB0aGUganMtc2RrJ3MgL2pvaW4gY2FsbFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZpYVNlcnZlcnM6IHZpYVNlcnZlcnMsXG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBGb3IgaWYgdGhlIGpvaW4gZmFpbHMgKHJlam9pbiBidXR0b24pXG4gICAgICAgICAgICAgICAgICAgICAgICBkaXNwYXRjaFsndmlhX3NlcnZlcnMnXSA9IHZpYVNlcnZlcnM7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICBkaXMuZGlzcGF0Y2goZGlzcGF0Y2gpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gc3VjY2VzcygpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiByZWplY3QodGhpcy5nZXRVc2FnZSgpKTtcbiAgICAgICAgfSxcbiAgICAgICAgY2F0ZWdvcnk6IENvbW1hbmRDYXRlZ29yaWVzLmFjdGlvbnMsXG4gICAgICAgIHJlbmRlcmluZ1R5cGVzOiBbVGltZWxpbmVSZW5kZXJpbmdUeXBlLlJvb21dLFxuICAgIH0pLFxuICAgIG5ldyBDb21tYW5kKHtcbiAgICAgICAgY29tbWFuZDogJ3BhcnQnLFxuICAgICAgICBhcmdzOiAnWzxyb29tLWFkZHJlc3M+XScsXG4gICAgICAgIGRlc2NyaXB0aW9uOiBfdGQoJ0xlYXZlIHJvb20nKSxcbiAgICAgICAgYW5hbHl0aWNzTmFtZTogXCJQYXJ0XCIsXG4gICAgICAgIGlzRW5hYmxlZDogKCkgPT4gIWlzQ3VycmVudExvY2FsUm9vbSgpLFxuICAgICAgICBydW5GbjogZnVuY3Rpb24ocm9vbUlkLCBhcmdzKSB7XG4gICAgICAgICAgICBjb25zdCBjbGkgPSBNYXRyaXhDbGllbnRQZWcuZ2V0KCk7XG5cbiAgICAgICAgICAgIGxldCB0YXJnZXRSb29tSWQ7XG4gICAgICAgICAgICBpZiAoYXJncykge1xuICAgICAgICAgICAgICAgIGNvbnN0IG1hdGNoZXMgPSBhcmdzLm1hdGNoKC9eKFxcUyspJC8pO1xuICAgICAgICAgICAgICAgIGlmIChtYXRjaGVzKSB7XG4gICAgICAgICAgICAgICAgICAgIGxldCByb29tQWxpYXMgPSBtYXRjaGVzWzFdO1xuICAgICAgICAgICAgICAgICAgICBpZiAocm9vbUFsaWFzWzBdICE9PSAnIycpIHJldHVybiByZWplY3QodGhpcy5nZXRVc2FnZSgpKTtcblxuICAgICAgICAgICAgICAgICAgICBpZiAoIXJvb21BbGlhcy5pbmNsdWRlcygnOicpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByb29tQWxpYXMgKz0gJzonICsgY2xpLmdldERvbWFpbigpO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gVHJ5IHRvIGZpbmQgYSByb29tIHdpdGggdGhpcyBhbGlhc1xuICAgICAgICAgICAgICAgICAgICBjb25zdCByb29tcyA9IGNsaS5nZXRSb29tcygpO1xuICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHJvb21zLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBhbGlhc0V2ZW50cyA9IHJvb21zW2ldLmN1cnJlbnRTdGF0ZS5nZXRTdGF0ZUV2ZW50cygnbS5yb29tLmFsaWFzZXMnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciAobGV0IGogPSAwOyBqIDwgYWxpYXNFdmVudHMubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBhbGlhc2VzID0gYWxpYXNFdmVudHNbal0uZ2V0Q29udGVudCgpLmFsaWFzZXMgfHwgW107XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgayA9IDA7IGsgPCBhbGlhc2VzLmxlbmd0aDsgaysrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChhbGlhc2VzW2tdID09PSByb29tQWxpYXMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRhcmdldFJvb21JZCA9IHJvb21zW2ldLnJvb21JZDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0YXJnZXRSb29tSWQpIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRhcmdldFJvb21JZCkgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKCF0YXJnZXRSb29tSWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiByZWplY3QoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3VHJhbnNsYXRhYmxlRXJyb3IoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdVbnJlY29nbmlzZWQgcm9vbSBhZGRyZXNzOiAlKHJvb21BbGlhcylzJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeyByb29tQWxpYXMgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKCF0YXJnZXRSb29tSWQpIHRhcmdldFJvb21JZCA9IHJvb21JZDtcbiAgICAgICAgICAgIHJldHVybiBzdWNjZXNzKGxlYXZlUm9vbUJlaGF2aW91cih0YXJnZXRSb29tSWQpKTtcbiAgICAgICAgfSxcbiAgICAgICAgY2F0ZWdvcnk6IENvbW1hbmRDYXRlZ29yaWVzLmFjdGlvbnMsXG4gICAgICAgIHJlbmRlcmluZ1R5cGVzOiBbVGltZWxpbmVSZW5kZXJpbmdUeXBlLlJvb21dLFxuICAgIH0pLFxuICAgIG5ldyBDb21tYW5kKHtcbiAgICAgICAgY29tbWFuZDogJ3JlbW92ZScsXG4gICAgICAgIGFsaWFzZXM6IFtcImtpY2tcIl0sXG4gICAgICAgIGFyZ3M6ICc8dXNlci1pZD4gW3JlYXNvbl0nLFxuICAgICAgICBkZXNjcmlwdGlvbjogX3RkKCdSZW1vdmVzIHVzZXIgd2l0aCBnaXZlbiBpZCBmcm9tIHRoaXMgcm9vbScpLFxuICAgICAgICBpc0VuYWJsZWQ6ICgpID0+ICFpc0N1cnJlbnRMb2NhbFJvb20oKSxcbiAgICAgICAgcnVuRm46IGZ1bmN0aW9uKHJvb21JZCwgYXJncykge1xuICAgICAgICAgICAgaWYgKGFyZ3MpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBtYXRjaGVzID0gYXJncy5tYXRjaCgvXihcXFMrPykoICsoLiopKT8kLyk7XG4gICAgICAgICAgICAgICAgaWYgKG1hdGNoZXMpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHN1Y2Nlc3MoTWF0cml4Q2xpZW50UGVnLmdldCgpLmtpY2socm9vbUlkLCBtYXRjaGVzWzFdLCBtYXRjaGVzWzNdKSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHJlamVjdCh0aGlzLmdldFVzYWdlKCkpO1xuICAgICAgICB9LFxuICAgICAgICBjYXRlZ29yeTogQ29tbWFuZENhdGVnb3JpZXMuYWRtaW4sXG4gICAgICAgIHJlbmRlcmluZ1R5cGVzOiBbVGltZWxpbmVSZW5kZXJpbmdUeXBlLlJvb21dLFxuICAgIH0pLFxuICAgIG5ldyBDb21tYW5kKHtcbiAgICAgICAgY29tbWFuZDogJ2JhbicsXG4gICAgICAgIGFyZ3M6ICc8dXNlci1pZD4gW3JlYXNvbl0nLFxuICAgICAgICBkZXNjcmlwdGlvbjogX3RkKCdCYW5zIHVzZXIgd2l0aCBnaXZlbiBpZCcpLFxuICAgICAgICBpc0VuYWJsZWQ6ICgpID0+ICFpc0N1cnJlbnRMb2NhbFJvb20oKSxcbiAgICAgICAgcnVuRm46IGZ1bmN0aW9uKHJvb21JZCwgYXJncykge1xuICAgICAgICAgICAgaWYgKGFyZ3MpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBtYXRjaGVzID0gYXJncy5tYXRjaCgvXihcXFMrPykoICsoLiopKT8kLyk7XG4gICAgICAgICAgICAgICAgaWYgKG1hdGNoZXMpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHN1Y2Nlc3MoTWF0cml4Q2xpZW50UGVnLmdldCgpLmJhbihyb29tSWQsIG1hdGNoZXNbMV0sIG1hdGNoZXNbM10pKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcmVqZWN0KHRoaXMuZ2V0VXNhZ2UoKSk7XG4gICAgICAgIH0sXG4gICAgICAgIGNhdGVnb3J5OiBDb21tYW5kQ2F0ZWdvcmllcy5hZG1pbixcbiAgICAgICAgcmVuZGVyaW5nVHlwZXM6IFtUaW1lbGluZVJlbmRlcmluZ1R5cGUuUm9vbV0sXG4gICAgfSksXG4gICAgbmV3IENvbW1hbmQoe1xuICAgICAgICBjb21tYW5kOiAndW5iYW4nLFxuICAgICAgICBhcmdzOiAnPHVzZXItaWQ+JyxcbiAgICAgICAgZGVzY3JpcHRpb246IF90ZCgnVW5iYW5zIHVzZXIgd2l0aCBnaXZlbiBJRCcpLFxuICAgICAgICBpc0VuYWJsZWQ6ICgpID0+ICFpc0N1cnJlbnRMb2NhbFJvb20oKSxcbiAgICAgICAgcnVuRm46IGZ1bmN0aW9uKHJvb21JZCwgYXJncykge1xuICAgICAgICAgICAgaWYgKGFyZ3MpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBtYXRjaGVzID0gYXJncy5tYXRjaCgvXihcXFMrKSQvKTtcbiAgICAgICAgICAgICAgICBpZiAobWF0Y2hlcykge1xuICAgICAgICAgICAgICAgICAgICAvLyBSZXNldCB0aGUgdXNlciBtZW1iZXJzaGlwIHRvIFwibGVhdmVcIiB0byB1bmJhbiBoaW1cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHN1Y2Nlc3MoTWF0cml4Q2xpZW50UGVnLmdldCgpLnVuYmFuKHJvb21JZCwgbWF0Y2hlc1sxXSkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiByZWplY3QodGhpcy5nZXRVc2FnZSgpKTtcbiAgICAgICAgfSxcbiAgICAgICAgY2F0ZWdvcnk6IENvbW1hbmRDYXRlZ29yaWVzLmFkbWluLFxuICAgICAgICByZW5kZXJpbmdUeXBlczogW1RpbWVsaW5lUmVuZGVyaW5nVHlwZS5Sb29tXSxcbiAgICB9KSxcbiAgICBuZXcgQ29tbWFuZCh7XG4gICAgICAgIGNvbW1hbmQ6ICdpZ25vcmUnLFxuICAgICAgICBhcmdzOiAnPHVzZXItaWQ+JyxcbiAgICAgICAgZGVzY3JpcHRpb246IF90ZCgnSWdub3JlcyBhIHVzZXIsIGhpZGluZyB0aGVpciBtZXNzYWdlcyBmcm9tIHlvdScpLFxuICAgICAgICBydW5GbjogZnVuY3Rpb24ocm9vbUlkLCBhcmdzKSB7XG4gICAgICAgICAgICBpZiAoYXJncykge1xuICAgICAgICAgICAgICAgIGNvbnN0IGNsaSA9IE1hdHJpeENsaWVudFBlZy5nZXQoKTtcblxuICAgICAgICAgICAgICAgIGNvbnN0IG1hdGNoZXMgPSBhcmdzLm1hdGNoKC9eKEBbXjpdKzpcXFMrKSQvKTtcbiAgICAgICAgICAgICAgICBpZiAobWF0Y2hlcykge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCB1c2VySWQgPSBtYXRjaGVzWzFdO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBpZ25vcmVkVXNlcnMgPSBjbGkuZ2V0SWdub3JlZFVzZXJzKCk7XG4gICAgICAgICAgICAgICAgICAgIGlnbm9yZWRVc2Vycy5wdXNoKHVzZXJJZCk7IC8vIGRlLWR1cGVkIGludGVybmFsbHkgaW4gdGhlIGpzLXNka1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gc3VjY2VzcyhcbiAgICAgICAgICAgICAgICAgICAgICAgIGNsaS5zZXRJZ25vcmVkVXNlcnMoaWdub3JlZFVzZXJzKS50aGVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBNb2RhbC5jcmVhdGVEaWFsb2coSW5mb0RpYWxvZywge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aXRsZTogX3QoJ0lnbm9yZWQgdXNlcicpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogPGRpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxwPnsgX3QoJ1lvdSBhcmUgbm93IGlnbm9yaW5nICUodXNlcklkKXMnLCB7IHVzZXJJZCB9KSB9PC9wPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj4sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcmVqZWN0KHRoaXMuZ2V0VXNhZ2UoKSk7XG4gICAgICAgIH0sXG4gICAgICAgIGNhdGVnb3J5OiBDb21tYW5kQ2F0ZWdvcmllcy5hY3Rpb25zLFxuICAgIH0pLFxuICAgIG5ldyBDb21tYW5kKHtcbiAgICAgICAgY29tbWFuZDogJ3VuaWdub3JlJyxcbiAgICAgICAgYXJnczogJzx1c2VyLWlkPicsXG4gICAgICAgIGRlc2NyaXB0aW9uOiBfdGQoJ1N0b3BzIGlnbm9yaW5nIGEgdXNlciwgc2hvd2luZyB0aGVpciBtZXNzYWdlcyBnb2luZyBmb3J3YXJkJyksXG4gICAgICAgIHJ1bkZuOiBmdW5jdGlvbihyb29tSWQsIGFyZ3MpIHtcbiAgICAgICAgICAgIGlmIChhcmdzKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgY2xpID0gTWF0cml4Q2xpZW50UGVnLmdldCgpO1xuXG4gICAgICAgICAgICAgICAgY29uc3QgbWF0Y2hlcyA9IGFyZ3MubWF0Y2goLyheQFteOl0rOlxcUyskKS8pO1xuICAgICAgICAgICAgICAgIGlmIChtYXRjaGVzKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHVzZXJJZCA9IG1hdGNoZXNbMV07XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGlnbm9yZWRVc2VycyA9IGNsaS5nZXRJZ25vcmVkVXNlcnMoKTtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgaW5kZXggPSBpZ25vcmVkVXNlcnMuaW5kZXhPZih1c2VySWQpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoaW5kZXggIT09IC0xKSBpZ25vcmVkVXNlcnMuc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHN1Y2Nlc3MoXG4gICAgICAgICAgICAgICAgICAgICAgICBjbGkuc2V0SWdub3JlZFVzZXJzKGlnbm9yZWRVc2VycykudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgTW9kYWwuY3JlYXRlRGlhbG9nKEluZm9EaWFsb2csIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGl0bGU6IF90KCdVbmlnbm9yZWQgdXNlcicpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogPGRpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxwPnsgX3QoJ1lvdSBhcmUgbm8gbG9uZ2VyIGlnbm9yaW5nICUodXNlcklkKXMnLCB7IHVzZXJJZCB9KSB9PC9wPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj4sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcmVqZWN0KHRoaXMuZ2V0VXNhZ2UoKSk7XG4gICAgICAgIH0sXG4gICAgICAgIGNhdGVnb3J5OiBDb21tYW5kQ2F0ZWdvcmllcy5hY3Rpb25zLFxuICAgIH0pLFxuICAgIG5ldyBDb21tYW5kKHtcbiAgICAgICAgY29tbWFuZDogJ29wJyxcbiAgICAgICAgYXJnczogJzx1c2VyLWlkPiBbPHBvd2VyLWxldmVsPl0nLFxuICAgICAgICBkZXNjcmlwdGlvbjogX3RkKCdEZWZpbmUgdGhlIHBvd2VyIGxldmVsIG9mIGEgdXNlcicpLFxuICAgICAgICBpc0VuYWJsZWQoKTogYm9vbGVhbiB7XG4gICAgICAgICAgICBjb25zdCBjbGkgPSBNYXRyaXhDbGllbnRQZWcuZ2V0KCk7XG4gICAgICAgICAgICBjb25zdCByb29tID0gY2xpLmdldFJvb20oUm9vbVZpZXdTdG9yZS5pbnN0YW5jZS5nZXRSb29tSWQoKSk7XG4gICAgICAgICAgICByZXR1cm4gcm9vbT8uY3VycmVudFN0YXRlLm1heVNlbmRTdGF0ZUV2ZW50KEV2ZW50VHlwZS5Sb29tUG93ZXJMZXZlbHMsIGNsaS5nZXRVc2VySWQoKSlcbiAgICAgICAgICAgICAgICAmJiAhaXNMb2NhbFJvb20ocm9vbSk7XG4gICAgICAgIH0sXG4gICAgICAgIHJ1bkZuOiBmdW5jdGlvbihyb29tSWQsIGFyZ3MpIHtcbiAgICAgICAgICAgIGlmIChhcmdzKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgbWF0Y2hlcyA9IGFyZ3MubWF0Y2goL14oXFxTKz8pKCArKC0/XFxkKykpPyQvKTtcbiAgICAgICAgICAgICAgICBsZXQgcG93ZXJMZXZlbCA9IDUwOyAvLyBkZWZhdWx0IHBvd2VyIGxldmVsIGZvciBvcFxuICAgICAgICAgICAgICAgIGlmIChtYXRjaGVzKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHVzZXJJZCA9IG1hdGNoZXNbMV07XG4gICAgICAgICAgICAgICAgICAgIGlmIChtYXRjaGVzLmxlbmd0aCA9PT0gNCAmJiB1bmRlZmluZWQgIT09IG1hdGNoZXNbM10pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHBvd2VyTGV2ZWwgPSBwYXJzZUludChtYXRjaGVzWzNdLCAxMCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKCFpc05hTihwb3dlckxldmVsKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgY2xpID0gTWF0cml4Q2xpZW50UGVnLmdldCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3Qgcm9vbSA9IGNsaS5nZXRSb29tKHJvb21JZCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIXJvb20pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gcmVqZWN0KFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXdUcmFuc2xhdGFibGVFcnJvcihcIkNvbW1hbmQgZmFpbGVkOiBVbmFibGUgdG8gZmluZCByb29tICglKHJvb21JZClzXCIsIHsgcm9vbUlkIH0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBtZW1iZXIgPSByb29tLmdldE1lbWJlcih1c2VySWQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFtZW1iZXIgfHwgZ2V0RWZmZWN0aXZlTWVtYmVyc2hpcChtZW1iZXIubWVtYmVyc2hpcCkgPT09IEVmZmVjdGl2ZU1lbWJlcnNoaXAuTGVhdmUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gcmVqZWN0KG5ld1RyYW5zbGF0YWJsZUVycm9yKFwiQ291bGQgbm90IGZpbmQgdXNlciBpbiByb29tXCIpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHBvd2VyTGV2ZWxFdmVudCA9IHJvb20uY3VycmVudFN0YXRlLmdldFN0YXRlRXZlbnRzKCdtLnJvb20ucG93ZXJfbGV2ZWxzJywgJycpO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHN1Y2Nlc3MoY2xpLnNldFBvd2VyTGV2ZWwocm9vbUlkLCB1c2VySWQsIHBvd2VyTGV2ZWwsIHBvd2VyTGV2ZWxFdmVudCkpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHJlamVjdCh0aGlzLmdldFVzYWdlKCkpO1xuICAgICAgICB9LFxuICAgICAgICBjYXRlZ29yeTogQ29tbWFuZENhdGVnb3JpZXMuYWRtaW4sXG4gICAgICAgIHJlbmRlcmluZ1R5cGVzOiBbVGltZWxpbmVSZW5kZXJpbmdUeXBlLlJvb21dLFxuICAgIH0pLFxuICAgIG5ldyBDb21tYW5kKHtcbiAgICAgICAgY29tbWFuZDogJ2Rlb3AnLFxuICAgICAgICBhcmdzOiAnPHVzZXItaWQ+JyxcbiAgICAgICAgZGVzY3JpcHRpb246IF90ZCgnRGVvcHMgdXNlciB3aXRoIGdpdmVuIGlkJyksXG4gICAgICAgIGlzRW5hYmxlZCgpOiBib29sZWFuIHtcbiAgICAgICAgICAgIGNvbnN0IGNsaSA9IE1hdHJpeENsaWVudFBlZy5nZXQoKTtcbiAgICAgICAgICAgIGNvbnN0IHJvb20gPSBjbGkuZ2V0Um9vbShSb29tVmlld1N0b3JlLmluc3RhbmNlLmdldFJvb21JZCgpKTtcbiAgICAgICAgICAgIHJldHVybiByb29tPy5jdXJyZW50U3RhdGUubWF5U2VuZFN0YXRlRXZlbnQoRXZlbnRUeXBlLlJvb21Qb3dlckxldmVscywgY2xpLmdldFVzZXJJZCgpKVxuICAgICAgICAgICAgICAgICYmICFpc0xvY2FsUm9vbShyb29tKTtcbiAgICAgICAgfSxcbiAgICAgICAgcnVuRm46IGZ1bmN0aW9uKHJvb21JZCwgYXJncykge1xuICAgICAgICAgICAgaWYgKGFyZ3MpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBtYXRjaGVzID0gYXJncy5tYXRjaCgvXihcXFMrKSQvKTtcbiAgICAgICAgICAgICAgICBpZiAobWF0Y2hlcykge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBjbGkgPSBNYXRyaXhDbGllbnRQZWcuZ2V0KCk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHJvb20gPSBjbGkuZ2V0Um9vbShyb29tSWQpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoIXJvb20pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiByZWplY3QoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3VHJhbnNsYXRhYmxlRXJyb3IoXCJDb21tYW5kIGZhaWxlZDogVW5hYmxlIHRvIGZpbmQgcm9vbSAoJShyb29tSWQpc1wiLCB7IHJvb21JZCB9KSxcbiAgICAgICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICBjb25zdCBwb3dlckxldmVsRXZlbnQgPSByb29tLmN1cnJlbnRTdGF0ZS5nZXRTdGF0ZUV2ZW50cygnbS5yb29tLnBvd2VyX2xldmVscycsICcnKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFwb3dlckxldmVsRXZlbnQuZ2V0Q29udGVudCgpLnVzZXJzW2FyZ3NdKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gcmVqZWN0KG5ld1RyYW5zbGF0YWJsZUVycm9yKFwiQ291bGQgbm90IGZpbmQgdXNlciBpbiByb29tXCIpKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gc3VjY2VzcyhjbGkuc2V0UG93ZXJMZXZlbChyb29tSWQsIGFyZ3MsIHVuZGVmaW5lZCwgcG93ZXJMZXZlbEV2ZW50KSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHJlamVjdCh0aGlzLmdldFVzYWdlKCkpO1xuICAgICAgICB9LFxuICAgICAgICBjYXRlZ29yeTogQ29tbWFuZENhdGVnb3JpZXMuYWRtaW4sXG4gICAgICAgIHJlbmRlcmluZ1R5cGVzOiBbVGltZWxpbmVSZW5kZXJpbmdUeXBlLlJvb21dLFxuICAgIH0pLFxuICAgIG5ldyBDb21tYW5kKHtcbiAgICAgICAgY29tbWFuZDogJ2RldnRvb2xzJyxcbiAgICAgICAgZGVzY3JpcHRpb246IF90ZCgnT3BlbnMgdGhlIERldmVsb3BlciBUb29scyBkaWFsb2cnKSxcbiAgICAgICAgcnVuRm46IGZ1bmN0aW9uKHJvb21JZCkge1xuICAgICAgICAgICAgTW9kYWwuY3JlYXRlRGlhbG9nKERldnRvb2xzRGlhbG9nLCB7IHJvb21JZCB9LCBcIm14X0RldnRvb2xzRGlhbG9nX3dyYXBwZXJcIik7XG4gICAgICAgICAgICByZXR1cm4gc3VjY2VzcygpO1xuICAgICAgICB9LFxuICAgICAgICBjYXRlZ29yeTogQ29tbWFuZENhdGVnb3JpZXMuYWR2YW5jZWQsXG4gICAgfSksXG4gICAgbmV3IENvbW1hbmQoe1xuICAgICAgICBjb21tYW5kOiAnYWRkd2lkZ2V0JyxcbiAgICAgICAgYXJnczogJzx1cmwgfCBlbWJlZCBjb2RlIHwgSml0c2kgdXJsPicsXG4gICAgICAgIGRlc2NyaXB0aW9uOiBfdGQoJ0FkZHMgYSBjdXN0b20gd2lkZ2V0IGJ5IFVSTCB0byB0aGUgcm9vbScpLFxuICAgICAgICBpc0VuYWJsZWQ6ICgpID0+IFNldHRpbmdzU3RvcmUuZ2V0VmFsdWUoVUlGZWF0dXJlLldpZGdldHMpXG4gICAgICAgICAgICAmJiBzaG91bGRTaG93Q29tcG9uZW50KFVJQ29tcG9uZW50LkFkZEludGVncmF0aW9ucylcbiAgICAgICAgICAgICYmICFpc0N1cnJlbnRMb2NhbFJvb20oKSxcbiAgICAgICAgcnVuRm46IGZ1bmN0aW9uKHJvb21JZCwgd2lkZ2V0VXJsKSB7XG4gICAgICAgICAgICBpZiAoIXdpZGdldFVybCkge1xuICAgICAgICAgICAgICAgIHJldHVybiByZWplY3QobmV3VHJhbnNsYXRhYmxlRXJyb3IoXCJQbGVhc2Ugc3VwcGx5IGEgd2lkZ2V0IFVSTCBvciBlbWJlZCBjb2RlXCIpKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gVHJ5IGFuZCBwYXJzZSBvdXQgYSB3aWRnZXQgVVJMIGZyb20gaWZyYW1lc1xuICAgICAgICAgICAgaWYgKHdpZGdldFVybC50b0xvd2VyQ2FzZSgpLnN0YXJ0c1dpdGgoXCI8aWZyYW1lIFwiKSkge1xuICAgICAgICAgICAgICAgIC8vIFdlIHVzZSBwYXJzZTUsIHdoaWNoIGRvZXNuJ3QgcmVuZGVyL2NyZWF0ZSBhIERPTSBub2RlLiBJdCBpbnN0ZWFkIHJ1bnNcbiAgICAgICAgICAgICAgICAvLyBzb21lIHN1cGVyZmFzdCByZWdleCBvdmVyIHRoZSB0ZXh0IHNvIHdlIGRvbid0IGhhdmUgdG8uXG4gICAgICAgICAgICAgICAgY29uc3QgZW1iZWQgPSBwYXJzZUh0bWwod2lkZ2V0VXJsKTtcbiAgICAgICAgICAgICAgICBpZiAoZW1iZWQgJiYgZW1iZWQuY2hpbGROb2RlcyAmJiBlbWJlZC5jaGlsZE5vZGVzLmxlbmd0aCA9PT0gMSkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBpZnJhbWUgPSBlbWJlZC5jaGlsZE5vZGVzWzBdIGFzIENoaWxkRWxlbWVudDtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGlmcmFtZS50YWdOYW1lLnRvTG93ZXJDYXNlKCkgPT09ICdpZnJhbWUnICYmIGlmcmFtZS5hdHRycykge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3Qgc3JjQXR0ciA9IGlmcmFtZS5hdHRycy5maW5kKGEgPT4gYS5uYW1lID09PSAnc3JjJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBsb2dnZXIubG9nKFwiUHVsbGluZyBVUkwgb3V0IG9mIGlmcmFtZSAoZW1iZWQgY29kZSlcIik7XG4gICAgICAgICAgICAgICAgICAgICAgICB3aWRnZXRVcmwgPSBzcmNBdHRyLnZhbHVlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoIXdpZGdldFVybC5zdGFydHNXaXRoKFwiaHR0cHM6Ly9cIikgJiYgIXdpZGdldFVybC5zdGFydHNXaXRoKFwiaHR0cDovL1wiKSkge1xuICAgICAgICAgICAgICAgIHJldHVybiByZWplY3QobmV3VHJhbnNsYXRhYmxlRXJyb3IoXCJQbGVhc2Ugc3VwcGx5IGEgaHR0cHM6Ly8gb3IgaHR0cDovLyB3aWRnZXQgVVJMXCIpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChXaWRnZXRVdGlscy5jYW5Vc2VyTW9kaWZ5V2lkZ2V0cyhyb29tSWQpKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgdXNlcklkID0gTWF0cml4Q2xpZW50UGVnLmdldCgpLmdldFVzZXJJZCgpO1xuICAgICAgICAgICAgICAgIGNvbnN0IG5vd01zID0gKG5ldyBEYXRlKCkpLmdldFRpbWUoKTtcbiAgICAgICAgICAgICAgICBjb25zdCB3aWRnZXRJZCA9IGVuY29kZVVSSUNvbXBvbmVudChgJHtyb29tSWR9XyR7dXNlcklkfV8ke25vd01zfWApO1xuICAgICAgICAgICAgICAgIGxldCB0eXBlID0gV2lkZ2V0VHlwZS5DVVNUT007XG4gICAgICAgICAgICAgICAgbGV0IG5hbWUgPSBcIkN1c3RvbVwiO1xuICAgICAgICAgICAgICAgIGxldCBkYXRhID0ge307XG5cbiAgICAgICAgICAgICAgICAvLyBNYWtlIHRoZSB3aWRnZXQgYSBKaXRzaSB3aWRnZXQgaWYgaXQgbG9va3MgbGlrZSBhIEppdHNpIHdpZGdldFxuICAgICAgICAgICAgICAgIGNvbnN0IGppdHNpRGF0YSA9IEppdHNpLmdldEluc3RhbmNlKCkucGFyc2VQcmVmZXJyZWRDb25mZXJlbmNlVXJsKHdpZGdldFVybCk7XG4gICAgICAgICAgICAgICAgaWYgKGppdHNpRGF0YSkge1xuICAgICAgICAgICAgICAgICAgICBsb2dnZXIubG9nKFwiTWFraW5nIC9hZGR3aWRnZXQgd2lkZ2V0IGEgSml0c2kgY29uZmVyZW5jZVwiKTtcbiAgICAgICAgICAgICAgICAgICAgdHlwZSA9IFdpZGdldFR5cGUuSklUU0k7XG4gICAgICAgICAgICAgICAgICAgIG5hbWUgPSBcIkppdHNpXCI7XG4gICAgICAgICAgICAgICAgICAgIGRhdGEgPSBqaXRzaURhdGE7XG4gICAgICAgICAgICAgICAgICAgIHdpZGdldFVybCA9IFdpZGdldFV0aWxzLmdldExvY2FsSml0c2lXcmFwcGVyVXJsKCk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgcmV0dXJuIHN1Y2Nlc3MoV2lkZ2V0VXRpbHMuc2V0Um9vbVdpZGdldChyb29tSWQsIHdpZGdldElkLCB0eXBlLCB3aWRnZXRVcmwsIG5hbWUsIGRhdGEpKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlamVjdChuZXdUcmFuc2xhdGFibGVFcnJvcihcIllvdSBjYW5ub3QgbW9kaWZ5IHdpZGdldHMgaW4gdGhpcyByb29tLlwiKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIGNhdGVnb3J5OiBDb21tYW5kQ2F0ZWdvcmllcy5hZG1pbixcbiAgICAgICAgcmVuZGVyaW5nVHlwZXM6IFtUaW1lbGluZVJlbmRlcmluZ1R5cGUuUm9vbV0sXG4gICAgfSksXG4gICAgbmV3IENvbW1hbmQoe1xuICAgICAgICBjb21tYW5kOiAndmVyaWZ5JyxcbiAgICAgICAgYXJnczogJzx1c2VyLWlkPiA8ZGV2aWNlLWlkPiA8ZGV2aWNlLXNpZ25pbmcta2V5PicsXG4gICAgICAgIGRlc2NyaXB0aW9uOiBfdGQoJ1ZlcmlmaWVzIGEgdXNlciwgc2Vzc2lvbiwgYW5kIHB1YmtleSB0dXBsZScpLFxuICAgICAgICBydW5GbjogZnVuY3Rpb24ocm9vbUlkLCBhcmdzKSB7XG4gICAgICAgICAgICBpZiAoYXJncykge1xuICAgICAgICAgICAgICAgIGNvbnN0IG1hdGNoZXMgPSBhcmdzLm1hdGNoKC9eKFxcUyspICsoXFxTKykgKyhcXFMrKSQvKTtcbiAgICAgICAgICAgICAgICBpZiAobWF0Y2hlcykge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBjbGkgPSBNYXRyaXhDbGllbnRQZWcuZ2V0KCk7XG5cbiAgICAgICAgICAgICAgICAgICAgY29uc3QgdXNlcklkID0gbWF0Y2hlc1sxXTtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZGV2aWNlSWQgPSBtYXRjaGVzWzJdO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBmaW5nZXJwcmludCA9IG1hdGNoZXNbM107XG5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHN1Y2Nlc3MoKGFzeW5jICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGRldmljZSA9IGNsaS5nZXRTdG9yZWREZXZpY2UodXNlcklkLCBkZXZpY2VJZCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIWRldmljZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IG5ld1RyYW5zbGF0YWJsZUVycm9yKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnVW5rbm93biAodXNlciwgc2Vzc2lvbikgcGFpcjogKCUodXNlcklkKXMsICUoZGV2aWNlSWQpcyknLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IHVzZXJJZCwgZGV2aWNlSWQgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgZGV2aWNlVHJ1c3QgPSBhd2FpdCBjbGkuY2hlY2tEZXZpY2VUcnVzdCh1c2VySWQsIGRldmljZUlkKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGRldmljZVRydXN0LmlzVmVyaWZpZWQoKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChkZXZpY2UuZ2V0RmluZ2VycHJpbnQoKSA9PT0gZmluZ2VycHJpbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3VHJhbnNsYXRhYmxlRXJyb3IoJ1Nlc3Npb24gYWxyZWFkeSB2ZXJpZmllZCEnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXdUcmFuc2xhdGFibGVFcnJvcignV0FSTklORzogU2Vzc2lvbiBhbHJlYWR5IHZlcmlmaWVkLCBidXQga2V5cyBkbyBOT1QgTUFUQ0ghJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoZGV2aWNlLmdldEZpbmdlcnByaW50KCkgIT09IGZpbmdlcnByaW50KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgZnByaW50ID0gZGV2aWNlLmdldEZpbmdlcnByaW50KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3VHJhbnNsYXRhYmxlRXJyb3IoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdXQVJOSU5HOiBLRVkgVkVSSUZJQ0FUSU9OIEZBSUxFRCEgVGhlIHNpZ25pbmcga2V5IGZvciAlKHVzZXJJZClzIGFuZCBzZXNzaW9uJyArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnICUoZGV2aWNlSWQpcyBpcyBcIiUoZnByaW50KXNcIiB3aGljaCBkb2VzIG5vdCBtYXRjaCB0aGUgcHJvdmlkZWQga2V5ICcgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ1wiJShmaW5nZXJwcmludClzXCIuIFRoaXMgY291bGQgbWVhbiB5b3VyIGNvbW11bmljYXRpb25zIGFyZSBiZWluZyBpbnRlcmNlcHRlZCEnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmcHJpbnQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB1c2VySWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZXZpY2VJZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpbmdlcnByaW50LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGF3YWl0IGNsaS5zZXREZXZpY2VWZXJpZmllZCh1c2VySWQsIGRldmljZUlkLCB0cnVlKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gVGVsbCB0aGUgdXNlciB3ZSB2ZXJpZmllZCBldmVyeXRoaW5nXG4gICAgICAgICAgICAgICAgICAgICAgICBNb2RhbC5jcmVhdGVEaWFsb2coSW5mb0RpYWxvZywge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRpdGxlOiBfdCgnVmVyaWZpZWQga2V5JyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246IDxkaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxwPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF90KCdUaGUgc2lnbmluZyBrZXkgeW91IHByb3ZpZGVkIG1hdGNoZXMgdGhlIHNpZ25pbmcga2V5IHlvdSByZWNlaXZlZCAnICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2Zyb20gJSh1c2VySWQpc1xcJ3Mgc2Vzc2lvbiAlKGRldmljZUlkKXMuIFNlc3Npb24gbWFya2VkIGFzIHZlcmlmaWVkLicsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeyB1c2VySWQsIGRldmljZUlkIH0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvcD5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj4sXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgfSkoKSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHJlamVjdCh0aGlzLmdldFVzYWdlKCkpO1xuICAgICAgICB9LFxuICAgICAgICBjYXRlZ29yeTogQ29tbWFuZENhdGVnb3JpZXMuYWR2YW5jZWQsXG4gICAgICAgIHJlbmRlcmluZ1R5cGVzOiBbVGltZWxpbmVSZW5kZXJpbmdUeXBlLlJvb21dLFxuICAgIH0pLFxuICAgIG5ldyBDb21tYW5kKHtcbiAgICAgICAgY29tbWFuZDogJ2Rpc2NhcmRzZXNzaW9uJyxcbiAgICAgICAgZGVzY3JpcHRpb246IF90ZCgnRm9yY2VzIHRoZSBjdXJyZW50IG91dGJvdW5kIGdyb3VwIHNlc3Npb24gaW4gYW4gZW5jcnlwdGVkIHJvb20gdG8gYmUgZGlzY2FyZGVkJyksXG4gICAgICAgIGlzRW5hYmxlZDogKCkgPT4gIWlzQ3VycmVudExvY2FsUm9vbSgpLFxuICAgICAgICBydW5GbjogZnVuY3Rpb24ocm9vbUlkKSB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIE1hdHJpeENsaWVudFBlZy5nZXQoKS5mb3JjZURpc2NhcmRTZXNzaW9uKHJvb21JZCk7XG4gICAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlamVjdChlLm1lc3NhZ2UpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHN1Y2Nlc3MoKTtcbiAgICAgICAgfSxcbiAgICAgICAgY2F0ZWdvcnk6IENvbW1hbmRDYXRlZ29yaWVzLmFkdmFuY2VkLFxuICAgICAgICByZW5kZXJpbmdUeXBlczogW1RpbWVsaW5lUmVuZGVyaW5nVHlwZS5Sb29tXSxcbiAgICB9KSxcbiAgICBuZXcgQ29tbWFuZCh7XG4gICAgICAgIGNvbW1hbmQ6ICdyZW1ha2VvbG0nLFxuICAgICAgICBkZXNjcmlwdGlvbjogX3RkKCdEZXZlbG9wZXIgY29tbWFuZDogRGlzY2FyZHMgdGhlIGN1cnJlbnQgb3V0Ym91bmQgZ3JvdXAgc2Vzc2lvbiBhbmQgc2V0cyB1cCBuZXcgT2xtIHNlc3Npb25zJyksXG4gICAgICAgIGlzRW5hYmxlZDogKCkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIFNldHRpbmdzU3RvcmUuZ2V0VmFsdWUoXCJkZXZlbG9wZXJNb2RlXCIpICYmICFpc0N1cnJlbnRMb2NhbFJvb20oKTtcbiAgICAgICAgfSxcbiAgICAgICAgcnVuRm46IChyb29tSWQpID0+IHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgY29uc3Qgcm9vbSA9IE1hdHJpeENsaWVudFBlZy5nZXQoKS5nZXRSb29tKHJvb21JZCk7XG5cbiAgICAgICAgICAgICAgICBNYXRyaXhDbGllbnRQZWcuZ2V0KCkuZm9yY2VEaXNjYXJkU2Vzc2lvbihyb29tSWQpO1xuXG4gICAgICAgICAgICAgICAgLy8gbm9pbnNwZWN0aW9uIEpTSWdub3JlZFByb21pc2VGcm9tQ2FsbFxuICAgICAgICAgICAgICAgIE1hdHJpeENsaWVudFBlZy5nZXQoKS5jcnlwdG8uZW5zdXJlT2xtU2Vzc2lvbnNGb3JVc2Vycyhyb29tLmdldE1lbWJlcnMoKS5tYXAobSA9PiBtLnVzZXJJZCksIHRydWUpO1xuICAgICAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiByZWplY3QoZS5tZXNzYWdlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBzdWNjZXNzKCk7XG4gICAgICAgIH0sXG4gICAgICAgIGNhdGVnb3J5OiBDb21tYW5kQ2F0ZWdvcmllcy5hZHZhbmNlZCxcbiAgICAgICAgcmVuZGVyaW5nVHlwZXM6IFtUaW1lbGluZVJlbmRlcmluZ1R5cGUuUm9vbV0sXG4gICAgfSksXG4gICAgbmV3IENvbW1hbmQoe1xuICAgICAgICBjb21tYW5kOiBcInJhaW5ib3dcIixcbiAgICAgICAgZGVzY3JpcHRpb246IF90ZChcIlNlbmRzIHRoZSBnaXZlbiBtZXNzYWdlIGNvbG91cmVkIGFzIGEgcmFpbmJvd1wiKSxcbiAgICAgICAgYXJnczogJzxtZXNzYWdlPicsXG4gICAgICAgIHJ1bkZuOiBmdW5jdGlvbihyb29tSWQsIGFyZ3MpIHtcbiAgICAgICAgICAgIGlmICghYXJncykgcmV0dXJuIHJlamVjdCh0aGlzLmdldFVzZXJJZCgpKTtcbiAgICAgICAgICAgIHJldHVybiBzdWNjZXNzU3luYyhDb250ZW50SGVscGVycy5tYWtlSHRtbE1lc3NhZ2UoYXJncywgdGV4dFRvSHRtbFJhaW5ib3coYXJncykpKTtcbiAgICAgICAgfSxcbiAgICAgICAgY2F0ZWdvcnk6IENvbW1hbmRDYXRlZ29yaWVzLm1lc3NhZ2VzLFxuICAgIH0pLFxuICAgIG5ldyBDb21tYW5kKHtcbiAgICAgICAgY29tbWFuZDogXCJyYWluYm93bWVcIixcbiAgICAgICAgZGVzY3JpcHRpb246IF90ZChcIlNlbmRzIHRoZSBnaXZlbiBlbW90ZSBjb2xvdXJlZCBhcyBhIHJhaW5ib3dcIiksXG4gICAgICAgIGFyZ3M6ICc8bWVzc2FnZT4nLFxuICAgICAgICBydW5GbjogZnVuY3Rpb24ocm9vbUlkLCBhcmdzKSB7XG4gICAgICAgICAgICBpZiAoIWFyZ3MpIHJldHVybiByZWplY3QodGhpcy5nZXRVc2VySWQoKSk7XG4gICAgICAgICAgICByZXR1cm4gc3VjY2Vzc1N5bmMoQ29udGVudEhlbHBlcnMubWFrZUh0bWxFbW90ZShhcmdzLCB0ZXh0VG9IdG1sUmFpbmJvdyhhcmdzKSkpO1xuICAgICAgICB9LFxuICAgICAgICBjYXRlZ29yeTogQ29tbWFuZENhdGVnb3JpZXMubWVzc2FnZXMsXG4gICAgfSksXG4gICAgbmV3IENvbW1hbmQoe1xuICAgICAgICBjb21tYW5kOiBcImhlbHBcIixcbiAgICAgICAgZGVzY3JpcHRpb246IF90ZChcIkRpc3BsYXlzIGxpc3Qgb2YgY29tbWFuZHMgd2l0aCB1c2FnZXMgYW5kIGRlc2NyaXB0aW9uc1wiKSxcbiAgICAgICAgcnVuRm46IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgTW9kYWwuY3JlYXRlRGlhbG9nKFNsYXNoQ29tbWFuZEhlbHBEaWFsb2cpO1xuICAgICAgICAgICAgcmV0dXJuIHN1Y2Nlc3MoKTtcbiAgICAgICAgfSxcbiAgICAgICAgY2F0ZWdvcnk6IENvbW1hbmRDYXRlZ29yaWVzLmFkdmFuY2VkLFxuICAgIH0pLFxuICAgIG5ldyBDb21tYW5kKHtcbiAgICAgICAgY29tbWFuZDogXCJ3aG9pc1wiLFxuICAgICAgICBkZXNjcmlwdGlvbjogX3RkKFwiRGlzcGxheXMgaW5mb3JtYXRpb24gYWJvdXQgYSB1c2VyXCIpLFxuICAgICAgICBhcmdzOiBcIjx1c2VyLWlkPlwiLFxuICAgICAgICBpc0VuYWJsZWQ6ICgpID0+ICFpc0N1cnJlbnRMb2NhbFJvb20oKSxcbiAgICAgICAgcnVuRm46IGZ1bmN0aW9uKHJvb21JZCwgdXNlcklkKSB7XG4gICAgICAgICAgICBpZiAoIXVzZXJJZCB8fCAhdXNlcklkLnN0YXJ0c1dpdGgoXCJAXCIpIHx8ICF1c2VySWQuaW5jbHVkZXMoXCI6XCIpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlamVjdCh0aGlzLmdldFVzYWdlKCkpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjb25zdCBtZW1iZXIgPSBNYXRyaXhDbGllbnRQZWcuZ2V0KCkuZ2V0Um9vbShyb29tSWQpLmdldE1lbWJlcih1c2VySWQpO1xuICAgICAgICAgICAgZGlzLmRpc3BhdGNoPFZpZXdVc2VyUGF5bG9hZD4oe1xuICAgICAgICAgICAgICAgIGFjdGlvbjogQWN0aW9uLlZpZXdVc2VyLFxuICAgICAgICAgICAgICAgIC8vIFhYWDogV2Ugc2hvdWxkIGJlIHVzaW5nIGEgcmVhbCBtZW1iZXIgb2JqZWN0IGFuZCBub3QgYXNzdW1pbmcgd2hhdCB0aGUgcmVjZWl2ZXIgd2FudHMuXG4gICAgICAgICAgICAgICAgbWVtYmVyOiBtZW1iZXIgfHwgeyB1c2VySWQgfSBhcyBVc2VyLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICByZXR1cm4gc3VjY2VzcygpO1xuICAgICAgICB9LFxuICAgICAgICBjYXRlZ29yeTogQ29tbWFuZENhdGVnb3JpZXMuYWR2YW5jZWQsXG4gICAgfSksXG4gICAgbmV3IENvbW1hbmQoe1xuICAgICAgICBjb21tYW5kOiBcInJhZ2VzaGFrZVwiLFxuICAgICAgICBhbGlhc2VzOiBbXCJidWdyZXBvcnRcIl0sXG4gICAgICAgIGRlc2NyaXB0aW9uOiBfdGQoXCJTZW5kIGEgYnVnIHJlcG9ydCB3aXRoIGxvZ3NcIiksXG4gICAgICAgIGlzRW5hYmxlZDogKCkgPT4gISFTZGtDb25maWcuZ2V0KCkuYnVnX3JlcG9ydF9lbmRwb2ludF91cmwsXG4gICAgICAgIGFyZ3M6IFwiPGRlc2NyaXB0aW9uPlwiLFxuICAgICAgICBydW5GbjogZnVuY3Rpb24ocm9vbUlkLCBhcmdzKSB7XG4gICAgICAgICAgICByZXR1cm4gc3VjY2VzcyhcbiAgICAgICAgICAgICAgICBNb2RhbC5jcmVhdGVEaWFsb2coQnVnUmVwb3J0RGlhbG9nLCB7XG4gICAgICAgICAgICAgICAgICAgIGluaXRpYWxUZXh0OiBhcmdzLFxuICAgICAgICAgICAgICAgIH0pLmZpbmlzaGVkLFxuICAgICAgICAgICAgKTtcbiAgICAgICAgfSxcbiAgICAgICAgY2F0ZWdvcnk6IENvbW1hbmRDYXRlZ29yaWVzLmFkdmFuY2VkLFxuICAgIH0pLFxuICAgIG5ldyBDb21tYW5kKHtcbiAgICAgICAgY29tbWFuZDogXCJ0b3ZpcnR1YWxcIixcbiAgICAgICAgZGVzY3JpcHRpb246IF90ZChcIlN3aXRjaGVzIHRvIHRoaXMgcm9vbSdzIHZpcnR1YWwgcm9vbSwgaWYgaXQgaGFzIG9uZVwiKSxcbiAgICAgICAgY2F0ZWdvcnk6IENvbW1hbmRDYXRlZ29yaWVzLmFkdmFuY2VkLFxuICAgICAgICBpc0VuYWJsZWQoKTogYm9vbGVhbiB7XG4gICAgICAgICAgICByZXR1cm4gTGVnYWN5Q2FsbEhhbmRsZXIuaW5zdGFuY2UuZ2V0U3VwcG9ydHNWaXJ0dWFsUm9vbXMoKSAmJiAhaXNDdXJyZW50TG9jYWxSb29tKCk7XG4gICAgICAgIH0sXG4gICAgICAgIHJ1bkZuOiAocm9vbUlkKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gc3VjY2VzcygoYXN5bmMgKCkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IHJvb20gPSBhd2FpdCBWb2lwVXNlck1hcHBlci5zaGFyZWRJbnN0YW5jZSgpLmdldFZpcnR1YWxSb29tRm9yUm9vbShyb29tSWQpO1xuICAgICAgICAgICAgICAgIGlmICghcm9vbSkgdGhyb3cgbmV3VHJhbnNsYXRhYmxlRXJyb3IoXCJObyB2aXJ0dWFsIHJvb20gZm9yIHRoaXMgcm9vbVwiKTtcbiAgICAgICAgICAgICAgICBkaXMuZGlzcGF0Y2g8Vmlld1Jvb21QYXlsb2FkPih7XG4gICAgICAgICAgICAgICAgICAgIGFjdGlvbjogQWN0aW9uLlZpZXdSb29tLFxuICAgICAgICAgICAgICAgICAgICByb29tX2lkOiByb29tLnJvb21JZCxcbiAgICAgICAgICAgICAgICAgICAgbWV0cmljc1RyaWdnZXI6IFwiU2xhc2hDb21tYW5kXCIsXG4gICAgICAgICAgICAgICAgICAgIG1ldHJpY3NWaWFLZXlib2FyZDogdHJ1ZSxcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pKCkpO1xuICAgICAgICB9LFxuICAgIH0pLFxuICAgIG5ldyBDb21tYW5kKHtcbiAgICAgICAgY29tbWFuZDogXCJxdWVyeVwiLFxuICAgICAgICBkZXNjcmlwdGlvbjogX3RkKFwiT3BlbnMgY2hhdCB3aXRoIHRoZSBnaXZlbiB1c2VyXCIpLFxuICAgICAgICBhcmdzOiBcIjx1c2VyLWlkPlwiLFxuICAgICAgICBydW5GbjogZnVuY3Rpb24ocm9vbUlkLCB1c2VySWQpIHtcbiAgICAgICAgICAgIC8vIGVhc3Rlci1lZ2cgZm9yIG5vdzogbG9vayB1cCBwaG9uZSBudW1iZXJzIHRocm91Z2ggdGhlIHRoaXJkcGFydHkgQVBJXG4gICAgICAgICAgICAvLyAodmVyeSBkdW1iIHBob25lIG51bWJlciBkZXRlY3Rpb24uLi4pXG4gICAgICAgICAgICBjb25zdCBpc1Bob25lTnVtYmVyID0gdXNlcklkICYmIC9eXFwrP1swMTIzNDU2Nzg5XSskLy50ZXN0KHVzZXJJZCk7XG4gICAgICAgICAgICBpZiAoIXVzZXJJZCB8fCAoIXVzZXJJZC5zdGFydHNXaXRoKFwiQFwiKSB8fCAhdXNlcklkLmluY2x1ZGVzKFwiOlwiKSkgJiYgIWlzUGhvbmVOdW1iZXIpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVqZWN0KHRoaXMuZ2V0VXNhZ2UoKSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBzdWNjZXNzKChhc3luYyAoKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKGlzUGhvbmVOdW1iZXIpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgcmVzdWx0cyA9IGF3YWl0IExlZ2FjeUNhbGxIYW5kbGVyLmluc3RhbmNlLnBzdG5Mb29rdXAodGhpcy5zdGF0ZS52YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgIGlmICghcmVzdWx0cyB8fCByZXN1bHRzLmxlbmd0aCA9PT0gMCB8fCAhcmVzdWx0c1swXS51c2VyaWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IG5ld1RyYW5zbGF0YWJsZUVycm9yKFwiVW5hYmxlIHRvIGZpbmQgTWF0cml4IElEIGZvciBwaG9uZSBudW1iZXJcIik7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgdXNlcklkID0gcmVzdWx0c1swXS51c2VyaWQ7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgY29uc3Qgcm9vbUlkID0gYXdhaXQgZW5zdXJlRE1FeGlzdHMoTWF0cml4Q2xpZW50UGVnLmdldCgpLCB1c2VySWQpO1xuXG4gICAgICAgICAgICAgICAgZGlzLmRpc3BhdGNoPFZpZXdSb29tUGF5bG9hZD4oe1xuICAgICAgICAgICAgICAgICAgICBhY3Rpb246IEFjdGlvbi5WaWV3Um9vbSxcbiAgICAgICAgICAgICAgICAgICAgcm9vbV9pZDogcm9vbUlkLFxuICAgICAgICAgICAgICAgICAgICBtZXRyaWNzVHJpZ2dlcjogXCJTbGFzaENvbW1hbmRcIixcbiAgICAgICAgICAgICAgICAgICAgbWV0cmljc1ZpYUtleWJvYXJkOiB0cnVlLFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSkoKSk7XG4gICAgICAgIH0sXG4gICAgICAgIGNhdGVnb3J5OiBDb21tYW5kQ2F0ZWdvcmllcy5hY3Rpb25zLFxuICAgIH0pLFxuICAgIG5ldyBDb21tYW5kKHtcbiAgICAgICAgY29tbWFuZDogXCJtc2dcIixcbiAgICAgICAgZGVzY3JpcHRpb246IF90ZChcIlNlbmRzIGEgbWVzc2FnZSB0byB0aGUgZ2l2ZW4gdXNlclwiKSxcbiAgICAgICAgYXJnczogXCI8dXNlci1pZD4gWzxtZXNzYWdlPl1cIixcbiAgICAgICAgcnVuRm46IGZ1bmN0aW9uKHJvb21JZCwgYXJncykge1xuICAgICAgICAgICAgaWYgKGFyZ3MpIHtcbiAgICAgICAgICAgICAgICAvLyBtYXRjaGVzIHRoZSBmaXJzdCB3aGl0ZXNwYWNlIGRlbGltaXRlZCBncm91cCBhbmQgdGhlbiB0aGUgcmVzdCBvZiB0aGUgc3RyaW5nXG4gICAgICAgICAgICAgICAgY29uc3QgbWF0Y2hlcyA9IGFyZ3MubWF0Y2goL14oXFxTKz8pKD86ICsoLiopKT8kL3MpO1xuICAgICAgICAgICAgICAgIGlmIChtYXRjaGVzKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IFt1c2VySWQsIG1zZ10gPSBtYXRjaGVzLnNsaWNlKDEpO1xuICAgICAgICAgICAgICAgICAgICBpZiAodXNlcklkICYmIHVzZXJJZC5zdGFydHNXaXRoKFwiQFwiKSAmJiB1c2VySWQuaW5jbHVkZXMoXCI6XCIpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gc3VjY2VzcygoYXN5bmMgKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGNsaSA9IE1hdHJpeENsaWVudFBlZy5nZXQoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCByb29tSWQgPSBhd2FpdCBlbnN1cmVETUV4aXN0cyhjbGksIHVzZXJJZCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGlzLmRpc3BhdGNoPFZpZXdSb29tUGF5bG9hZD4oe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhY3Rpb246IEFjdGlvbi5WaWV3Um9vbSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcm9vbV9pZDogcm9vbUlkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtZXRyaWNzVHJpZ2dlcjogXCJTbGFzaENvbW1hbmRcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbWV0cmljc1ZpYUtleWJvYXJkOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChtc2cpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xpLnNlbmRUZXh0TWVzc2FnZShyb29tSWQsIG1zZyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfSkoKSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiByZWplY3QodGhpcy5nZXRVc2FnZSgpKTtcbiAgICAgICAgfSxcbiAgICAgICAgY2F0ZWdvcnk6IENvbW1hbmRDYXRlZ29yaWVzLmFjdGlvbnMsXG4gICAgfSksXG4gICAgbmV3IENvbW1hbmQoe1xuICAgICAgICBjb21tYW5kOiBcImhvbGRjYWxsXCIsXG4gICAgICAgIGRlc2NyaXB0aW9uOiBfdGQoXCJQbGFjZXMgdGhlIGNhbGwgaW4gdGhlIGN1cnJlbnQgcm9vbSBvbiBob2xkXCIpLFxuICAgICAgICBjYXRlZ29yeTogQ29tbWFuZENhdGVnb3JpZXMub3RoZXIsXG4gICAgICAgIGlzRW5hYmxlZDogKCkgPT4gIWlzQ3VycmVudExvY2FsUm9vbSgpLFxuICAgICAgICBydW5GbjogZnVuY3Rpb24ocm9vbUlkLCBhcmdzKSB7XG4gICAgICAgICAgICBjb25zdCBjYWxsID0gTGVnYWN5Q2FsbEhhbmRsZXIuaW5zdGFuY2UuZ2V0Q2FsbEZvclJvb20ocm9vbUlkKTtcbiAgICAgICAgICAgIGlmICghY2FsbCkge1xuICAgICAgICAgICAgICAgIHJldHVybiByZWplY3QobmV3VHJhbnNsYXRhYmxlRXJyb3IoXCJObyBhY3RpdmUgY2FsbCBpbiB0aGlzIHJvb21cIikpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2FsbC5zZXRSZW1vdGVPbkhvbGQodHJ1ZSk7XG4gICAgICAgICAgICByZXR1cm4gc3VjY2VzcygpO1xuICAgICAgICB9LFxuICAgICAgICByZW5kZXJpbmdUeXBlczogW1RpbWVsaW5lUmVuZGVyaW5nVHlwZS5Sb29tXSxcbiAgICB9KSxcbiAgICBuZXcgQ29tbWFuZCh7XG4gICAgICAgIGNvbW1hbmQ6IFwidW5ob2xkY2FsbFwiLFxuICAgICAgICBkZXNjcmlwdGlvbjogX3RkKFwiVGFrZXMgdGhlIGNhbGwgaW4gdGhlIGN1cnJlbnQgcm9vbSBvZmYgaG9sZFwiKSxcbiAgICAgICAgY2F0ZWdvcnk6IENvbW1hbmRDYXRlZ29yaWVzLm90aGVyLFxuICAgICAgICBpc0VuYWJsZWQ6ICgpID0+ICFpc0N1cnJlbnRMb2NhbFJvb20oKSxcbiAgICAgICAgcnVuRm46IGZ1bmN0aW9uKHJvb21JZCwgYXJncykge1xuICAgICAgICAgICAgY29uc3QgY2FsbCA9IExlZ2FjeUNhbGxIYW5kbGVyLmluc3RhbmNlLmdldENhbGxGb3JSb29tKHJvb21JZCk7XG4gICAgICAgICAgICBpZiAoIWNhbGwpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVqZWN0KG5ld1RyYW5zbGF0YWJsZUVycm9yKFwiTm8gYWN0aXZlIGNhbGwgaW4gdGhpcyByb29tXCIpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhbGwuc2V0UmVtb3RlT25Ib2xkKGZhbHNlKTtcbiAgICAgICAgICAgIHJldHVybiBzdWNjZXNzKCk7XG4gICAgICAgIH0sXG4gICAgICAgIHJlbmRlcmluZ1R5cGVzOiBbVGltZWxpbmVSZW5kZXJpbmdUeXBlLlJvb21dLFxuICAgIH0pLFxuICAgIG5ldyBDb21tYW5kKHtcbiAgICAgICAgY29tbWFuZDogXCJjb252ZXJ0dG9kbVwiLFxuICAgICAgICBkZXNjcmlwdGlvbjogX3RkKFwiQ29udmVydHMgdGhlIHJvb20gdG8gYSBETVwiKSxcbiAgICAgICAgY2F0ZWdvcnk6IENvbW1hbmRDYXRlZ29yaWVzLm90aGVyLFxuICAgICAgICBpc0VuYWJsZWQ6ICgpID0+ICFpc0N1cnJlbnRMb2NhbFJvb20oKSxcbiAgICAgICAgcnVuRm46IGZ1bmN0aW9uKHJvb21JZCwgYXJncykge1xuICAgICAgICAgICAgY29uc3Qgcm9vbSA9IE1hdHJpeENsaWVudFBlZy5nZXQoKS5nZXRSb29tKHJvb21JZCk7XG4gICAgICAgICAgICByZXR1cm4gc3VjY2VzcyhndWVzc0FuZFNldERNUm9vbShyb29tLCB0cnVlKSk7XG4gICAgICAgIH0sXG4gICAgICAgIHJlbmRlcmluZ1R5cGVzOiBbVGltZWxpbmVSZW5kZXJpbmdUeXBlLlJvb21dLFxuICAgIH0pLFxuICAgIG5ldyBDb21tYW5kKHtcbiAgICAgICAgY29tbWFuZDogXCJjb252ZXJ0dG9yb29tXCIsXG4gICAgICAgIGRlc2NyaXB0aW9uOiBfdGQoXCJDb252ZXJ0cyB0aGUgRE0gdG8gYSByb29tXCIpLFxuICAgICAgICBjYXRlZ29yeTogQ29tbWFuZENhdGVnb3JpZXMub3RoZXIsXG4gICAgICAgIGlzRW5hYmxlZDogKCkgPT4gIWlzQ3VycmVudExvY2FsUm9vbSgpLFxuICAgICAgICBydW5GbjogZnVuY3Rpb24ocm9vbUlkLCBhcmdzKSB7XG4gICAgICAgICAgICBjb25zdCByb29tID0gTWF0cml4Q2xpZW50UGVnLmdldCgpLmdldFJvb20ocm9vbUlkKTtcbiAgICAgICAgICAgIHJldHVybiBzdWNjZXNzKGd1ZXNzQW5kU2V0RE1Sb29tKHJvb20sIGZhbHNlKSk7XG4gICAgICAgIH0sXG4gICAgICAgIHJlbmRlcmluZ1R5cGVzOiBbVGltZWxpbmVSZW5kZXJpbmdUeXBlLlJvb21dLFxuICAgIH0pLFxuXG4gICAgLy8gQ29tbWFuZCBkZWZpbml0aW9ucyBmb3IgYXV0b2NvbXBsZXRpb24gT05MWTpcbiAgICAvLyAvbWUgaXMgc3BlY2lhbCBiZWNhdXNlIGl0cyBub3QgaGFuZGxlZCBieSBTbGFzaENvbW1hbmRzLmpzIGFuZCBpcyBpbnN0ZWFkIGRvbmUgaW5zaWRlIHRoZSBDb21wb3NlciBjbGFzc2VzXG4gICAgbmV3IENvbW1hbmQoe1xuICAgICAgICBjb21tYW5kOiBcIm1lXCIsXG4gICAgICAgIGFyZ3M6ICc8bWVzc2FnZT4nLFxuICAgICAgICBkZXNjcmlwdGlvbjogX3RkKCdEaXNwbGF5cyBhY3Rpb24nKSxcbiAgICAgICAgY2F0ZWdvcnk6IENvbW1hbmRDYXRlZ29yaWVzLm1lc3NhZ2VzLFxuICAgICAgICBoaWRlQ29tcGxldGlvbkFmdGVyU3BhY2U6IHRydWUsXG4gICAgfSksXG5cbiAgICAuLi5DSEFUX0VGRkVDVFMubWFwKChlZmZlY3QpID0+IHtcbiAgICAgICAgcmV0dXJuIG5ldyBDb21tYW5kKHtcbiAgICAgICAgICAgIGNvbW1hbmQ6IGVmZmVjdC5jb21tYW5kLFxuICAgICAgICAgICAgZGVzY3JpcHRpb246IGVmZmVjdC5kZXNjcmlwdGlvbigpLFxuICAgICAgICAgICAgYXJnczogJzxtZXNzYWdlPicsXG4gICAgICAgICAgICBydW5GbjogZnVuY3Rpb24ocm9vbUlkLCBhcmdzKSB7XG4gICAgICAgICAgICAgICAgbGV0IGNvbnRlbnQ6IElDb250ZW50O1xuICAgICAgICAgICAgICAgIGlmICghYXJncykge1xuICAgICAgICAgICAgICAgICAgICBjb250ZW50ID0gQ29udGVudEhlbHBlcnMubWFrZUVtb3RlTWVzc2FnZShlZmZlY3QuZmFsbGJhY2tNZXNzYWdlKCkpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRlbnQgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBtc2d0eXBlOiBlZmZlY3QubXNnVHlwZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGJvZHk6IGFyZ3MsXG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGRpcy5kaXNwYXRjaCh7IGFjdGlvbjogYGVmZmVjdHMuJHtlZmZlY3QuY29tbWFuZH1gIH0pO1xuICAgICAgICAgICAgICAgIHJldHVybiBzdWNjZXNzU3luYyhjb250ZW50KTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBjYXRlZ29yeTogQ29tbWFuZENhdGVnb3JpZXMuZWZmZWN0cyxcbiAgICAgICAgICAgIHJlbmRlcmluZ1R5cGVzOiBbVGltZWxpbmVSZW5kZXJpbmdUeXBlLlJvb21dLFxuICAgICAgICB9KTtcbiAgICB9KSxcbl07XG5cbi8vIGJ1aWxkIGEgbWFwIGZyb20gbmFtZXMgYW5kIGFsaWFzZXMgdG8gdGhlIENvbW1hbmQgb2JqZWN0cy5cbmV4cG9ydCBjb25zdCBDb21tYW5kTWFwID0gbmV3IE1hcDxzdHJpbmcsIENvbW1hbmQ+KCk7XG5Db21tYW5kcy5mb3JFYWNoKGNtZCA9PiB7XG4gICAgQ29tbWFuZE1hcC5zZXQoY21kLmNvbW1hbmQsIGNtZCk7XG4gICAgY21kLmFsaWFzZXMuZm9yRWFjaChhbGlhcyA9PiB7XG4gICAgICAgIENvbW1hbmRNYXAuc2V0KGFsaWFzLCBjbWQpO1xuICAgIH0pO1xufSk7XG5cbmV4cG9ydCBmdW5jdGlvbiBwYXJzZUNvbW1hbmRTdHJpbmcoaW5wdXQ6IHN0cmluZyk6IHsgY21kPzogc3RyaW5nLCBhcmdzPzogc3RyaW5nIH0ge1xuICAgIC8vIHRyaW0gYW55IHRyYWlsaW5nIHdoaXRlc3BhY2UsIGFzIGl0IGNhbiBjb25mdXNlIHRoZSBwYXJzZXIgZm9yXG4gICAgLy8gSVJDLXN0eWxlIGNvbW1hbmRzXG4gICAgaW5wdXQgPSBpbnB1dC5yZXBsYWNlKC9cXHMrJC8sICcnKTtcbiAgICBpZiAoaW5wdXRbMF0gIT09ICcvJykgcmV0dXJuIHt9OyAvLyBub3QgYSBjb21tYW5kXG5cbiAgICBjb25zdCBiaXRzID0gaW5wdXQubWF0Y2goL14oXFxTKz8pKD86WyBcXG5dKygoLnxcXG4pKikpPyQvKTtcbiAgICBsZXQgY21kOiBzdHJpbmc7XG4gICAgbGV0IGFyZ3M6IHN0cmluZztcbiAgICBpZiAoYml0cykge1xuICAgICAgICBjbWQgPSBiaXRzWzFdLnN1YnN0cmluZygxKS50b0xvd2VyQ2FzZSgpO1xuICAgICAgICBhcmdzID0gYml0c1syXTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBjbWQgPSBpbnB1dDtcbiAgICB9XG5cbiAgICByZXR1cm4geyBjbWQsIGFyZ3MgfTtcbn1cblxuaW50ZXJmYWNlIElDbWQge1xuICAgIGNtZD86IENvbW1hbmQ7XG4gICAgYXJncz86IHN0cmluZztcbn1cblxuLyoqXG4gKiBQcm9jZXNzIHRoZSBnaXZlbiB0ZXh0IGZvciAvY29tbWFuZHMgYW5kIHJldHVybnMgYSBwYXJzZWQgY29tbWFuZCB0aGF0IGNhbiBiZSB1c2VkIGZvciBydW5uaW5nIHRoZSBvcGVyYXRpb24uXG4gKiBAcGFyYW0ge3N0cmluZ30gaW5wdXQgVGhlIHJhdyB0ZXh0IGlucHV0IGJ5IHRoZSB1c2VyLlxuICogQHJldHVybiB7SUNtZH0gVGhlIHBhcnNlZCBjb21tYW5kIG9iamVjdC5cbiAqIFJldHVybnMgYW4gZW1wdHkgb2JqZWN0IGlmIHRoZSBpbnB1dCBkaWRuJ3QgbWF0Y2ggYSBjb21tYW5kLlxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0Q29tbWFuZChpbnB1dDogc3RyaW5nKTogSUNtZCB7XG4gICAgY29uc3QgeyBjbWQsIGFyZ3MgfSA9IHBhcnNlQ29tbWFuZFN0cmluZyhpbnB1dCk7XG5cbiAgICBpZiAoQ29tbWFuZE1hcC5oYXMoY21kKSAmJiBDb21tYW5kTWFwLmdldChjbWQpLmlzRW5hYmxlZCgpKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBjbWQ6IENvbW1hbmRNYXAuZ2V0KGNtZCksXG4gICAgICAgICAgICBhcmdzLFxuICAgICAgICB9O1xuICAgIH1cbiAgICByZXR1cm4ge307XG59XG4iXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7QUFtQkE7O0FBRUE7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBS0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBRUE7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBRUE7O0FBRUE7O0FBQ0E7O0FBQ0E7O0FBQ0E7Ozs7Ozs7Ozs7QUFPQSxNQUFNQSxlQUFlLEdBQUcsWUFBMEI7RUFDOUMsT0FBTyxJQUFJQyxPQUFKLENBQWFDLE9BQUQsSUFBYTtJQUM1QixNQUFN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