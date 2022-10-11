"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireWildcard(require("react"));

var _reactDom = _interopRequireDefault(require("react-dom"));

var _highlight = _interopRequireDefault(require("highlight.js"));

var _event = require("matrix-js-sdk/src/@types/event");

var _matrixEventsSdk = require("matrix-events-sdk");

var HtmlUtils = _interopRequireWildcard(require("../../../HtmlUtils"));

var _DateUtils = require("../../../DateUtils");

var _Modal = _interopRequireDefault(require("../../../Modal"));

var _dispatcher = _interopRequireDefault(require("../../../dispatcher/dispatcher"));

var _languageHandler = require("../../../languageHandler");

var ContextMenu = _interopRequireWildcard(require("../../structures/ContextMenu"));

var _SettingsStore = _interopRequireDefault(require("../../../settings/SettingsStore"));

var _pillify = require("../../../utils/pillify");

var _tooltipify = require("../../../utils/tooltipify");

var _IntegrationManagers = require("../../../integrations/IntegrationManagers");

var _Permalinks = require("../../../utils/permalinks/Permalinks");

var _strings = require("../../../utils/strings");

var _AccessibleTooltipButton = _interopRequireDefault(require("../elements/AccessibleTooltipButton"));

var _UIStore = _interopRequireDefault(require("../../../stores/UIStore"));

var _actions = require("../../../dispatcher/actions");

var _GenericTextContextMenu = _interopRequireDefault(require("../context_menus/GenericTextContextMenu"));

var _Spoiler = _interopRequireDefault(require("../elements/Spoiler"));

var _QuestionDialog = _interopRequireDefault(require("../dialogs/QuestionDialog"));

var _MessageEditHistoryDialog = _interopRequireDefault(require("../dialogs/MessageEditHistoryDialog"));

var _EditMessageComposer = _interopRequireDefault(require("../rooms/EditMessageComposer"));

var _LinkPreviewGroup = _interopRequireDefault(require("../rooms/LinkPreviewGroup"));

var _RoomContext = _interopRequireDefault(require("../../../contexts/RoomContext"));

var _AccessibleButton = _interopRequireDefault(require("../elements/AccessibleButton"));

var _linkifyMatrix = require("../../../linkify-matrix");

var _Reply = require("../../../utils/Reply");

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { (0, _defineProperty2.default)(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }

const MAX_HIGHLIGHT_LENGTH = 4096;

class TextualBody extends _react.default.Component {
  constructor(props) {
    super(props);
    (0, _defineProperty2.default)(this, "contentRef", /*#__PURE__*/(0, _react.createRef)());
    (0, _defineProperty2.default)(this, "unmounted", false);
    (0, _defineProperty2.default)(this, "pills", []);
    (0, _defineProperty2.default)(this, "tooltips", []);
    (0, _defineProperty2.default)(this, "context", void 0);
    (0, _defineProperty2.default)(this, "onCancelClick", () => {
      this.setState({
        widgetHidden: true
      }); // FIXME: persist this somewhere smarter than local storage

      if (global.localStorage) {
        global.localStorage.setItem("hide_preview_" + this.props.mxEvent.getId(), "1");
      }

      this.forceUpdate();
    });
    (0, _defineProperty2.default)(this, "onEmoteSenderClick", () => {
      const mxEvent = this.props.mxEvent;

      _dispatcher.default.dispatch({
        action: _actions.Action.ComposerInsert,
        userId: mxEvent.getSender(),
        timelineRenderingType: this.context.timelineRenderingType
      });
    });
    (0, _defineProperty2.default)(this, "onBodyLinkClick", e => {
      let target = e.target; // links processed by linkifyjs have their own handler so don't handle those here

      if (target.classList.contains(_linkifyMatrix.options.className)) return;

      if (target.nodeName !== "A") {
        // Jump to parent as the `<a>` may contain children, e.g. an anchor wrapping an inline code section
        target = target.closest("a");
      }

      if (!target) return;
      const localHref = (0, _Permalinks.tryTransformPermalinkToLocalHref)(target.href);

      if (localHref !== target.href) {
        // it could be converted to a localHref -> therefore handle locally
        e.preventDefault();
        window.location.hash = localHref;
      }
    });
    (0, _defineProperty2.default)(this, "getEventTileOps", () => ({
      isWidgetHidden: () => {
        return this.state.widgetHidden;
      },
      unhideWidget: () => {
        this.setState({
          widgetHidden: false
        });

        if (global.localStorage) {
          global.localStorage.removeItem("hide_preview_" + this.props.mxEvent.getId());
        }
      }
    }));
    (0, _defineProperty2.default)(this, "onStarterLinkClick", (starterLink, ev) => {
      ev.preventDefault(); // We need to add on our scalar token to the starter link, but we may not have one!
      // In addition, we can't fetch one on click and then go to it immediately as that
      // is then treated as a popup!
      // We can get around this by fetching one now and showing a "confirmation dialog" (hurr hurr)
      // which requires the user to click through and THEN we can open the link in a new tab because
      // the window.open command occurs in the same stack frame as the onClick callback.

      const managers = _IntegrationManagers.IntegrationManagers.sharedInstance();

      if (!managers.hasManager()) {
        managers.openNoManagerDialog();
        return;
      } // Go fetch a scalar token


      const integrationManager = managers.getPrimaryManager();
      const scalarClient = integrationManager.getScalarClient();
      scalarClient.connect().then(() => {
        const completeUrl = scalarClient.getStarterLink(starterLink);
        const integrationsUrl = integrationManager.uiUrl;

        _Modal.default.createDialog(_QuestionDialog.default, {
          title: (0, _languageHandler._t)("Add an Integration"),
          description: /*#__PURE__*/_react.default.createElement("div", null, (0, _languageHandler._t)("You are about to be taken to a third-party site so you can " + "authenticate your account for use with %(integrationsUrl)s. " + "Do you wish to continue?", {
            integrationsUrl: integrationsUrl
          })),
          button: (0, _languageHandler._t)("Continue"),

          onFinished(confirmed) {
            if (!confirmed) {
              return;
            }

            const width = window.screen.width > 1024 ? 1024 : window.screen.width;
            const height = window.screen.height > 800 ? 800 : window.screen.height;
            const left = (window.screen.width - width) / 2;
            const top = (window.screen.height - height) / 2;
            const features = `height=${height}, width=${width}, top=${top}, left=${left},`;
            const wnd = window.open(completeUrl, '_blank', features);
            wnd.opener = null;
          }

        });
      });
    });
    (0, _defineProperty2.default)(this, "openHistoryDialog", async () => {
      _Modal.default.createDialog(_MessageEditHistoryDialog.default, {
        mxEvent: this.props.mxEvent
      });
    });
    this.state = {
      links: [],
      widgetHidden: false
    };
  }

  componentDidMount() {
    if (!this.props.editState) {
      this.applyFormatting();
    }
  }

  applyFormatting() {
    const showLineNumbers = _SettingsStore.default.getValue("showCodeLineNumbers");

    this.activateSpoilers([this.contentRef.current]); // pillifyLinks BEFORE linkifyElement because plain room/user URLs in the composer
    // are still sent as plaintext URLs. If these are ever pillified in the composer,
    // we should be pillify them here by doing the linkifying BEFORE the pillifying.

    (0, _pillify.pillifyLinks)([this.contentRef.current], this.props.mxEvent, this.pills);
    HtmlUtils.linkifyElement(this.contentRef.current);
    this.calculateUrlPreview(); // tooltipifyLinks AFTER calculateUrlPreview because the DOM inside the tooltip
    // container is empty before the internal component has mounted so calculateUrlPreview
    // won't find any anchors

    (0, _tooltipify.tooltipifyLinks)([this.contentRef.current], this.pills, this.tooltips);

    if (this.props.mxEvent.getContent().format === "org.matrix.custom.html") {
      // Handle expansion and add buttons
      const pres = _reactDom.default.findDOMNode(this).getElementsByTagName("pre");

      if (pres.length > 0) {
        for (let i = 0; i < pres.length; i++) {
          // If there already is a div wrapping the codeblock we want to skip this.
          // This happens after the codeblock was edited.
          if (pres[i].parentElement.className == "mx_EventTile_pre_container") continue; // Add code element if it's missing since we depend on it

          if (pres[i].getElementsByTagName("code").length == 0) {
            this.addCodeElement(pres[i]);
          } // Wrap a div around <pre> so that the copy button can be correctly positioned
          // when the <pre> overflows and is scrolled horizontally.


          const div = this.wrapInDiv(pres[i]);
          this.handleCodeBlockExpansion(pres[i]);
          this.addCodeExpansionButton(div, pres[i]);
          this.addCodeCopyButton(div);

          if (showLineNumbers) {
            this.addLineNumbers(pres[i]);
          }
        }
      } // Highlight code


      const codes = _reactDom.default.findDOMNode(this).getElementsByTagName("code");

      if (codes.length > 0) {
        // Do this asynchronously: parsing code takes time and we don't
        // need to block the DOM update on it.
        setTimeout(() => {
          if (this.unmounted) return;

          for (let i = 0; i < codes.length; i++) {
            this.highlightCode(codes[i]);
          }
        }, 10);
      }
    }
  }

  addCodeElement(pre) {
    const code = document.createElement("code");
    code.append(...pre.childNodes);
    pre.appendChild(code);
  }

  addCodeExpansionButton(div, pre) {
    // Calculate how many percent does the pre element take up.
    // If it's less than 30% we don't add the expansion button.
    // We also round the number as it sometimes can be 29.99...
    const percentageOfViewport = Math.round(pre.offsetHeight / _UIStore.default.instance.windowHeight * 100); // TODO: additionally show the button if it's an expanded quoted message

    if (percentageOfViewport < 30) return;
    const button = document.createElement("span");
    button.className = "mx_EventTile_button ";

    if (pre.className == "mx_EventTile_collapsedCodeBlock") {
      button.className += "mx_EventTile_expandButton";
    } else {
      button.className += "mx_EventTile_collapseButton";
    }

    button.onclick = async () => {
      button.className = "mx_EventTile_button ";

      if (pre.className == "mx_EventTile_collapsedCodeBlock") {
        pre.className = "";
        button.className += "mx_EventTile_collapseButton";
      } else {
        pre.className = "mx_EventTile_collapsedCodeBlock";
        button.className += "mx_EventTile_expandButton";
      } // By expanding/collapsing we changed
      // the height, therefore we call this


      this.props.onHeightChanged();
    };

    div.appendChild(button);
  }

  addCodeCopyButton(div) {
    const button = document.createElement("span");
    button.className = "mx_EventTile_button mx_EventTile_copyButton "; // Check if expansion button exists. If so we put the copy button to the bottom

    const expansionButtonExists = div.getElementsByClassName("mx_EventTile_button");
    if (expansionButtonExists.length > 0) button.className += "mx_EventTile_buttonBottom";

    button.onclick = async () => {
      const copyCode = button.parentElement.getElementsByTagName("code")[0];
      const successful = await (0, _strings.copyPlaintext)(copyCode.textContent);
      const buttonRect = button.getBoundingClientRect();
      const {
        close
      } = ContextMenu.createMenu(_GenericTextContextMenu.default, _objectSpread(_objectSpread({}, (0, ContextMenu.toRightOf)(buttonRect, 0)), {}, {
        chevronFace: ContextMenu.ChevronFace.None,
        message: successful ? (0, _languageHandler._t)('Copied!') : (0, _languageHandler._t)('Failed to copy')
      }));
      button.onmouseleave = close;
    };

    div.appendChild(button);
  }

  wrapInDiv(pre) {
    const div = document.createElement("div");
    div.className = "mx_EventTile_pre_container"; // Insert containing div in place of <pre> block

    pre.parentNode.replaceChild(div, pre); // Append <pre> block and copy button to container

    div.appendChild(pre);
    return div;
  }

  handleCodeBlockExpansion(pre) {
    if (!_SettingsStore.default.getValue("expandCodeByDefault")) {
      pre.className = "mx_EventTile_collapsedCodeBlock";
    }
  }

  addLineNumbers(pre) {
    // Calculate number of lines in pre
    const number = pre.innerHTML.replace(/\n(<\/code>)?$/, "").split(/\n/).length;
    const lineNumbers = document.createElement('span');
    lineNumbers.className = 'mx_EventTile_lineNumbers'; // Iterate through lines starting with 1 (number of the first line is 1)

    for (let i = 1; i <= number; i++) {
      const s = document.createElement('span');
      s.textContent = i.toString();
      lineNumbers.appendChild(s);
    }

    pre.prepend(lineNumbers);
    pre.append(document.createElement('span'));
  }

  highlightCode(code) {
    if (code.textContent.length > MAX_HIGHLIGHT_LENGTH) {
      console.log("Code block is bigger than highlight limit (" + code.textContent.length + " > " + MAX_HIGHLIGHT_LENGTH + "): not highlighting");
      return;
    }

    let advertisedLang;

    for (const cl of code.className.split(/\s+/)) {
      if (cl.startsWith('language-')) {
        const maybeLang = cl.split('-', 2)[1];

        if (_highlight.default.getLanguage(maybeLang)) {
          advertisedLang = maybeLang;
          break;
        }
      }
    }

    if (advertisedLang) {
      // If the code says what language it is, highlight it in that language
      // We don't use highlightElement here because we can't force language detection
      // off. It should use the one we've found in the CSS class but we'd rather pass
      // it in explicitly to make sure.
      code.innerHTML = _highlight.default.highlight(advertisedLang, code.textContent).value;
    } else if (_SettingsStore.default.getValue("enableSyntaxHighlightLanguageDetection") && code.parentElement instanceof HTMLPreElement) {
      // User has language detection enabled and the code is within a pre
      // we only auto-highlight if the code block is in a pre), so highlight
      // the block with auto-highlighting enabled.
      // We pass highlightjs the text to highlight rather than letting it
      // work on the DOM with highlightElement because that also adds CSS
      // classes to the pre/code element that we don't want (the CSS
      // conflicts with our own).
      code.innerHTML = _highlight.default.highlightAuto(code.textContent).value;
    }
  }

  componentDidUpdate(prevProps) {
    if (!this.props.editState) {
      const stoppedEditing = prevProps.editState && !this.props.editState;
      const messageWasEdited = prevProps.replacingEventId !== this.props.replacingEventId;

      if (messageWasEdited || stoppedEditing) {
        this.applyFormatting();
      }
    }
  }

  componentWillUnmount() {
    this.unmounted = true;
    (0, _pillify.unmountPills)(this.pills);
    (0, _tooltipify.unmountTooltips)(this.tooltips);
  }

  shouldComponentUpdate(nextProps, nextState) {
    //console.info("shouldComponentUpdate: ShowUrlPreview for %s is %s", this.props.mxEvent.getId(), this.props.showUrlPreview);
    // exploit that events are immutable :)
    return nextProps.mxEvent.getId() !== this.props.mxEvent.getId() || nextProps.highlights !== this.props.highlights || nextProps.replacingEventId !== this.props.replacingEventId || nextProps.highlightLink !== this.props.highlightLink || nextProps.showUrlPreview !== this.props.showUrlPreview || nextProps.editState !== this.props.editState || nextState.links !== this.state.links || nextState.widgetHidden !== this.state.widgetHidden || nextProps.isSeeingThroughMessageHiddenForModeration !== this.props.isSeeingThroughMessageHiddenForModeration;
  }

  calculateUrlPreview() {
    //console.info("calculateUrlPreview: ShowUrlPreview for %s is %s", this.props.mxEvent.getId(), this.props.showUrlPreview);
    if (this.props.showUrlPreview) {
      // pass only the first child which is the event tile otherwise this recurses on edited events
      let links = this.findLinks([this.contentRef.current]);

      if (links.length) {
        // de-duplicate the links using a set here maintains the order
        links = Array.from(new Set(links));
        this.setState({
          links
        }); // lazy-load the hidden state of the preview widget from localstorage

        if (window.localStorage) {
          const hidden = !!window.localStorage.getItem("hide_preview_" + this.props.mxEvent.getId());
          this.setState({
            widgetHidden: hidden
          });
        }
      } else if (this.state.links.length) {
        this.setState({
          links: []
        });
      }
    }
  }

  activateSpoilers(nodes) {
    let node = nodes[0];

    while (node) {
      if (node.tagName === "SPAN" && typeof node.getAttribute("data-mx-spoiler") === "string") {
        const spoilerContainer = document.createElement('span');
        const reason = node.getAttribute("data-mx-spoiler");
        node.removeAttribute("data-mx-spoiler"); // we don't want to recurse

        const spoiler = /*#__PURE__*/_react.default.createElement(_Spoiler.default, {
          reason: reason,
          contentHtml: node.outerHTML
        });

        _reactDom.default.render(spoiler, spoilerContainer);

        node.parentNode.replaceChild(spoilerContainer, node);
        node = spoilerContainer;
      }

      if (node.childNodes && node.childNodes.length) {
        this.activateSpoilers(node.childNodes);
      }

      node = node.nextSibling;
    }
  }

  findLinks(nodes) {
    let links = [];

    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];

      if (node.tagName === "A" && node.getAttribute("href")) {
        if (this.isLinkPreviewable(node)) {
          links.push(node.getAttribute("href"));
        }
      } else if (node.tagName === "PRE" || node.tagName === "CODE" || node.tagName === "BLOCKQUOTE") {
        continue;
      } else if (node.children && node.children.length) {
        links = links.concat(this.findLinks(node.children));
      }
    }

    return links;
  }

  isLinkPreviewable(node) {
    // don't try to preview relative links
    if (!node.getAttribute("href").startsWith("http://") && !node.getAttribute("href").startsWith("https://")) {
      return false;
    } // as a random heuristic to avoid highlighting things like "foo.pl"
    // we require the linked text to either include a / (either from http://
    // or from a full foo.bar/baz style schemeless URL) - or be a markdown-style
    // link, in which case we check the target text differs from the link value.
    // TODO: make this configurable?


    if (node.textContent.indexOf("/") > -1) {
      return true;
    } else {
      const url = node.getAttribute("href");
      const host = url.match(/^https?:\/\/(.*?)(\/|$)/)[1]; // never preview permalinks (if anything we should give a smart
      // preview of the room/user they point to: nobody needs to be reminded
      // what the matrix.to site looks like).

      if ((0, _Permalinks.isPermalinkHost)(host)) return false;

      if (node.textContent.toLowerCase().trim().startsWith(host.toLowerCase())) {
        // it's a "foo.pl" style link
        return false;
      } else {
        // it's a [foo bar](http://foo.com) style link
        return true;
      }
    }
  }

  renderEditedMarker() {
    const date = this.props.mxEvent.replacingEventDate();
    const dateString = date && (0, _DateUtils.formatDate)(date);

    const tooltip = /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_Tooltip_title"
    }, (0, _languageHandler._t)("Edited at %(date)s", {
      date: dateString
    })), /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_Tooltip_sub"
    }, (0, _languageHandler._t)("Click to view edits")));

    return /*#__PURE__*/_react.default.createElement(_AccessibleTooltipButton.default, {
      className: "mx_EventTile_edited",
      onClick: this.openHistoryDialog,
      title: (0, _languageHandler._t)("Edited at %(date)s. Click to view edits.", {
        date: dateString
      }),
      tooltip: tooltip
    }, /*#__PURE__*/_react.default.createElement("span", null, `(${(0, _languageHandler._t)("edited")})`));
  }
  /**
   * Render a marker informing the user that, while they can see the message,
   * it is hidden for other users.
   */


  renderPendingModerationMarker() {
    let text;
    const visibility = this.props.mxEvent.messageVisibility();

    switch (visibility.visible) {
      case true:
        throw new Error("renderPendingModerationMarker should only be applied to hidden messages");

      case false:
        if (visibility.reason) {
          text = (0, _languageHandler._t)("Message pending moderation: %(reason)s", {
            reason: visibility.reason
          });
        } else {
          text = (0, _languageHandler._t)("Message pending moderation");
        }

        break;
    }

    return /*#__PURE__*/_react.default.createElement("span", {
      className: "mx_EventTile_pendingModeration"
    }, `(${text})`);
  }

  render() {
    if (this.props.editState) {
      return /*#__PURE__*/_react.default.createElement(_EditMessageComposer.default, {
        editState: this.props.editState,
        className: "mx_EventTile_content"
      });
    }

    const mxEvent = this.props.mxEvent;
    const content = mxEvent.getContent();
    let isNotice = false;
    let isEmote = false; // only strip reply if this is the original replying event, edits thereafter do not have the fallback

    const stripReply = !mxEvent.replacingEvent() && !!(0, _Reply.getParentEventId)(mxEvent);
    let body;

    if (_SettingsStore.default.isEnabled("feature_extensible_events")) {
      const extev = this.props.mxEvent.unstableExtensibleEvent;

      if (extev?.isEquivalentTo(_matrixEventsSdk.M_MESSAGE)) {
        isEmote = (0, _matrixEventsSdk.isEventLike)(extev.wireFormat, _matrixEventsSdk.LegacyMsgType.Emote);
        isNotice = (0, _matrixEventsSdk.isEventLike)(extev.wireFormat, _matrixEventsSdk.LegacyMsgType.Notice);
        body = HtmlUtils.bodyToHtml({
          body: extev.text,
          format: extev.html ? "org.matrix.custom.html" : undefined,
          formatted_body: extev.html,
          msgtype: _event.MsgType.Text
        }, this.props.highlights, {
          disableBigEmoji: isEmote || !_SettingsStore.default.getValue('TextualBody.enableBigEmoji'),
          // Part of Replies fallback support
          stripReplyFallback: stripReply,
          ref: this.contentRef,
          returnString: false
        });
      }
    }

    if (!body) {
      isEmote = content.msgtype === _event.MsgType.Emote;
      isNotice = content.msgtype === _event.MsgType.Notice;
      body = HtmlUtils.bodyToHtml(content, this.props.highlights, {
        disableBigEmoji: isEmote || !_SettingsStore.default.getValue('TextualBody.enableBigEmoji'),
        // Part of Replies fallback support
        stripReplyFallback: stripReply,
        ref: this.contentRef,
        returnString: false
      });
    }

    if (this.props.replacingEventId) {
      body = /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, body, this.renderEditedMarker());
    }

    if (this.props.isSeeingThroughMessageHiddenForModeration) {
      body = /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, body, this.renderPendingModerationMarker());
    }

    if (this.props.highlightLink) {
      body = /*#__PURE__*/_react.default.createElement("a", {
        href: this.props.highlightLink
      }, body);
    } else if (content.data && typeof content.data["org.matrix.neb.starter_link"] === "string") {
      body = /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
        kind: "link_inline",
        onClick: this.onStarterLinkClick.bind(this, content.data["org.matrix.neb.starter_link"])
      }, body);
    }

    let widgets;

    if (this.state.links.length && !this.state.widgetHidden && this.props.showUrlPreview) {
      widgets = /*#__PURE__*/_react.default.createElement(_LinkPreviewGroup.default, {
        links: this.state.links,
        mxEvent: this.props.mxEvent,
        onCancelClick: this.onCancelClick,
        onHeightChanged: this.props.onHeightChanged
      });
    }

    if (isEmote) {
      return /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_MEmoteBody mx_EventTile_content",
        onClick: this.onBodyLinkClick
      }, "*\xA0", /*#__PURE__*/_react.default.createElement("span", {
        className: "mx_MEmoteBody_sender",
        onClick: this.onEmoteSenderClick
      }, mxEvent.sender ? mxEvent.sender.name : mxEvent.getSender()), "\xA0", body, widgets);
    }

    if (isNotice) {
      return /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_MNoticeBody mx_EventTile_content",
        onClick: this.onBodyLinkClick
      }, body, widgets);
    }

    return /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_MTextBody mx_EventTile_content",
      onClick: this.onBodyLinkClick
    }, body, widgets);
  }

}

exports.default = TextualBody;
(0, _defineProperty2.default)(TextualBody, "contextType", _RoomContext.default);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJNQVhfSElHSExJR0hUX0xFTkdUSCIsIlRleHR1YWxCb2R5IiwiUmVhY3QiLCJDb21wb25lbnQiLCJjb25zdHJ1Y3RvciIsInByb3BzIiwiY3JlYXRlUmVmIiwic2V0U3RhdGUiLCJ3aWRnZXRIaWRkZW4iLCJnbG9iYWwiLCJsb2NhbFN0b3JhZ2UiLCJzZXRJdGVtIiwibXhFdmVudCIsImdldElkIiwiZm9yY2VVcGRhdGUiLCJkaXMiLCJkaXNwYXRjaCIsImFjdGlvbiIsIkFjdGlvbiIsIkNvbXBvc2VySW5zZXJ0IiwidXNlcklkIiwiZ2V0U2VuZGVyIiwidGltZWxpbmVSZW5kZXJpbmdUeXBlIiwiY29udGV4dCIsImUiLCJ0YXJnZXQiLCJjbGFzc0xpc3QiLCJjb250YWlucyIsImxpbmtpZnlPcHRzIiwiY2xhc3NOYW1lIiwibm9kZU5hbWUiLCJjbG9zZXN0IiwibG9jYWxIcmVmIiwidHJ5VHJhbnNmb3JtUGVybWFsaW5rVG9Mb2NhbEhyZWYiLCJocmVmIiwicHJldmVudERlZmF1bHQiLCJ3aW5kb3ciLCJsb2NhdGlvbiIsImhhc2giLCJpc1dpZGdldEhpZGRlbiIsInN0YXRlIiwidW5oaWRlV2lkZ2V0IiwicmVtb3ZlSXRlbSIsInN0YXJ0ZXJMaW5rIiwiZXYiLCJtYW5hZ2VycyIsIkludGVncmF0aW9uTWFuYWdlcnMiLCJzaGFyZWRJbnN0YW5jZSIsImhhc01hbmFnZXIiLCJvcGVuTm9NYW5hZ2VyRGlhbG9nIiwiaW50ZWdyYXRpb25NYW5hZ2VyIiwiZ2V0UHJpbWFyeU1hbmFnZXIiLCJzY2FsYXJDbGllbnQiLCJnZXRTY2FsYXJDbGllbnQiLCJjb25uZWN0IiwidGhlbiIsImNvbXBsZXRlVXJsIiwiZ2V0U3RhcnRlckxpbmsiLCJpbnRlZ3JhdGlvbnNVcmwiLCJ1aVVybCIsIk1vZGFsIiwiY3JlYXRlRGlhbG9nIiwiUXVlc3Rpb25EaWFsb2ciLCJ0aXRsZSIsIl90IiwiZGVzY3JpcHRpb24iLCJidXR0b24iLCJvbkZpbmlzaGVkIiwiY29uZmlybWVkIiwid2lkdGgiLCJzY3JlZW4iLCJoZWlnaHQiLCJsZWZ0IiwidG9wIiwiZmVhdHVyZXMiLCJ3bmQiLCJvcGVuIiwib3BlbmVyIiwiTWVzc2FnZUVkaXRIaXN0b3J5RGlhbG9nIiwibGlua3MiLCJjb21wb25lbnREaWRNb3VudCIsImVkaXRTdGF0ZSIsImFwcGx5Rm9ybWF0dGluZyIsInNob3dMaW5lTnVtYmVycyIsIlNldHRpbmdzU3RvcmUiLCJnZXRWYWx1ZSIsImFjdGl2YXRlU3BvaWxlcnMiLCJjb250ZW50UmVmIiwiY3VycmVudCIsInBpbGxpZnlMaW5rcyIsInBpbGxzIiwiSHRtbFV0aWxzIiwibGlua2lmeUVsZW1lbnQiLCJjYWxjdWxhdGVVcmxQcmV2aWV3IiwidG9vbHRpcGlmeUxpbmtzIiwidG9vbHRpcHMiLCJnZXRDb250ZW50IiwiZm9ybWF0IiwicHJlcyIsIlJlYWN0RE9NIiwiZmluZERPTU5vZGUiLCJnZXRFbGVtZW50c0J5VGFnTmFtZSIsImxlbmd0aCIsImkiLCJwYXJlbnRFbGVtZW50IiwiYWRkQ29kZUVsZW1lbnQiLCJkaXYiLCJ3cmFwSW5EaXYiLCJoYW5kbGVDb2RlQmxvY2tFeHBhbnNpb24iLCJhZGRDb2RlRXhwYW5zaW9uQnV0dG9uIiwiYWRkQ29kZUNvcHlCdXR0b24iLCJhZGRMaW5lTnVtYmVycyIsImNvZGVzIiwic2V0VGltZW91dCIsInVubW91bnRlZCIsImhpZ2hsaWdodENvZGUiLCJwcmUiLCJjb2RlIiwiZG9jdW1lbnQiLCJjcmVhdGVFbGVtZW50IiwiYXBwZW5kIiwiY2hpbGROb2RlcyIsImFwcGVuZENoaWxkIiwicGVyY2VudGFnZU9mVmlld3BvcnQiLCJNYXRoIiwicm91bmQiLCJvZmZzZXRIZWlnaHQiLCJVSVN0b3JlIiwiaW5zdGFuY2UiLCJ3aW5kb3dIZWlnaHQiLCJvbmNsaWNrIiwib25IZWlnaHRDaGFuZ2VkIiwiZXhwYW5zaW9uQnV0dG9uRXhpc3RzIiwiZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSIsImNvcHlDb2RlIiwic3VjY2Vzc2Z1bCIsImNvcHlQbGFpbnRleHQiLCJ0ZXh0Q29udGVudCIsImJ1dHRvblJlY3QiLCJnZXRCb3VuZGluZ0NsaWVudFJlY3QiLCJjbG9zZSIsIkNvbnRleHRNZW51IiwiY3JlYXRlTWVudSIsIkdlbmVyaWNUZXh0Q29udGV4dE1lbnUiLCJ0b1JpZ2h0T2YiLCJjaGV2cm9uRmFjZSIsIkNoZXZyb25GYWNlIiwiTm9uZSIsIm1lc3NhZ2UiLCJvbm1vdXNlbGVhdmUiLCJwYXJlbnROb2RlIiwicmVwbGFjZUNoaWxkIiwibnVtYmVyIiwiaW5uZXJIVE1MIiwicmVwbGFjZSIsInNwbGl0IiwibGluZU51bWJlcnMiLCJzIiwidG9TdHJpbmciLCJwcmVwZW5kIiwiY29uc29sZSIsImxvZyIsImFkdmVydGlzZWRMYW5nIiwiY2wiLCJzdGFydHNXaXRoIiwibWF5YmVMYW5nIiwiaGlnaGxpZ2h0IiwiZ2V0TGFuZ3VhZ2UiLCJ2YWx1ZSIsIkhUTUxQcmVFbGVtZW50IiwiaGlnaGxpZ2h0QXV0byIsImNvbXBvbmVudERpZFVwZGF0ZSIsInByZXZQcm9wcyIsInN0b3BwZWRFZGl0aW5nIiwibWVzc2FnZVdhc0VkaXRlZCIsInJlcGxhY2luZ0V2ZW50SWQiLCJjb21wb25lbnRXaWxsVW5tb3VudCIsInVubW91bnRQaWxscyIsInVubW91bnRUb29sdGlwcyIsInNob3VsZENvbXBvbmVudFVwZGF0ZSIsIm5leHRQcm9wcyIsIm5leHRTdGF0ZSIsImhpZ2hsaWdodHMiLCJoaWdobGlnaHRMaW5rIiwic2hvd1VybFByZXZpZXciLCJpc1NlZWluZ1Rocm91Z2hNZXNzYWdlSGlkZGVuRm9yTW9kZXJhdGlvbiIsImZpbmRMaW5rcyIsIkFycmF5IiwiZnJvbSIsIlNldCIsImhpZGRlbiIsImdldEl0ZW0iLCJub2RlcyIsIm5vZGUiLCJ0YWdOYW1lIiwiZ2V0QXR0cmlidXRlIiwic3BvaWxlckNvbnRhaW5lciIsInJlYXNvbiIsInJlbW92ZUF0dHJpYnV0ZSIsInNwb2lsZXIiLCJvdXRlckhUTUwiLCJyZW5kZXIiLCJuZXh0U2libGluZyIsImlzTGlua1ByZXZpZXdhYmxlIiwicHVzaCIsImNoaWxkcmVuIiwiY29uY2F0IiwiaW5kZXhPZiIsInVybCIsImhvc3QiLCJtYXRjaCIsImlzUGVybWFsaW5rSG9zdCIsInRvTG93ZXJDYXNlIiwidHJpbSIsInJlbmRlckVkaXRlZE1hcmtlciIsImRhdGUiLCJyZXBsYWNpbmdFdmVudERhdGUiLCJkYXRlU3RyaW5nIiwiZm9ybWF0RGF0ZSIsInRvb2x0aXAiLCJvcGVuSGlzdG9yeURpYWxvZyIsInJlbmRlclBlbmRpbmdNb2RlcmF0aW9uTWFya2VyIiwidGV4dCIsInZpc2liaWxpdHkiLCJtZXNzYWdlVmlzaWJpbGl0eSIsInZpc2libGUiLCJFcnJvciIsImNvbnRlbnQiLCJpc05vdGljZSIsImlzRW1vdGUiLCJzdHJpcFJlcGx5IiwicmVwbGFjaW5nRXZlbnQiLCJnZXRQYXJlbnRFdmVudElkIiwiYm9keSIsImlzRW5hYmxlZCIsImV4dGV2IiwidW5zdGFibGVFeHRlbnNpYmxlRXZlbnQiLCJpc0VxdWl2YWxlbnRUbyIsIk1fTUVTU0FHRSIsImlzRXZlbnRMaWtlIiwid2lyZUZvcm1hdCIsIkxlZ2FjeU1zZ1R5cGUiLCJFbW90ZSIsIk5vdGljZSIsImJvZHlUb0h0bWwiLCJodG1sIiwidW5kZWZpbmVkIiwiZm9ybWF0dGVkX2JvZHkiLCJtc2d0eXBlIiwiTXNnVHlwZSIsIlRleHQiLCJkaXNhYmxlQmlnRW1vamkiLCJzdHJpcFJlcGx5RmFsbGJhY2siLCJyZWYiLCJyZXR1cm5TdHJpbmciLCJkYXRhIiwib25TdGFydGVyTGlua0NsaWNrIiwiYmluZCIsIndpZGdldHMiLCJvbkNhbmNlbENsaWNrIiwib25Cb2R5TGlua0NsaWNrIiwib25FbW90ZVNlbmRlckNsaWNrIiwic2VuZGVyIiwibmFtZSIsIlJvb21Db250ZXh0Il0sInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL2NvbXBvbmVudHMvdmlld3MvbWVzc2FnZXMvVGV4dHVhbEJvZHkudHN4Il0sInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgMjAxNSAtIDIwMjEgVGhlIE1hdHJpeC5vcmcgRm91bmRhdGlvbiBDLkkuQy5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQgUmVhY3QsIHsgY3JlYXRlUmVmLCBTeW50aGV0aWNFdmVudCwgTW91c2VFdmVudCwgUmVhY3ROb2RlIH0gZnJvbSAncmVhY3QnO1xuaW1wb3J0IFJlYWN0RE9NIGZyb20gJ3JlYWN0LWRvbSc7XG5pbXBvcnQgaGlnaGxpZ2h0IGZyb20gJ2hpZ2hsaWdodC5qcyc7XG5pbXBvcnQgeyBNc2dUeXBlIH0gZnJvbSBcIm1hdHJpeC1qcy1zZGsvc3JjL0B0eXBlcy9ldmVudFwiO1xuaW1wb3J0IHsgaXNFdmVudExpa2UsIExlZ2FjeU1zZ1R5cGUsIE1fTUVTU0FHRSwgTWVzc2FnZUV2ZW50IH0gZnJvbSBcIm1hdHJpeC1ldmVudHMtc2RrXCI7XG5cbmltcG9ydCAqIGFzIEh0bWxVdGlscyBmcm9tICcuLi8uLi8uLi9IdG1sVXRpbHMnO1xuaW1wb3J0IHsgZm9ybWF0RGF0ZSB9IGZyb20gJy4uLy4uLy4uL0RhdGVVdGlscyc7XG5pbXBvcnQgTW9kYWwgZnJvbSAnLi4vLi4vLi4vTW9kYWwnO1xuaW1wb3J0IGRpcyBmcm9tICcuLi8uLi8uLi9kaXNwYXRjaGVyL2Rpc3BhdGNoZXInO1xuaW1wb3J0IHsgX3QgfSBmcm9tICcuLi8uLi8uLi9sYW5ndWFnZUhhbmRsZXInO1xuaW1wb3J0ICogYXMgQ29udGV4dE1lbnUgZnJvbSAnLi4vLi4vc3RydWN0dXJlcy9Db250ZXh0TWVudSc7XG5pbXBvcnQgeyBDaGV2cm9uRmFjZSwgdG9SaWdodE9mIH0gZnJvbSAnLi4vLi4vc3RydWN0dXJlcy9Db250ZXh0TWVudSc7XG5pbXBvcnQgU2V0dGluZ3NTdG9yZSBmcm9tIFwiLi4vLi4vLi4vc2V0dGluZ3MvU2V0dGluZ3NTdG9yZVwiO1xuaW1wb3J0IHsgcGlsbGlmeUxpbmtzLCB1bm1vdW50UGlsbHMgfSBmcm9tICcuLi8uLi8uLi91dGlscy9waWxsaWZ5JztcbmltcG9ydCB7IHRvb2x0aXBpZnlMaW5rcywgdW5tb3VudFRvb2x0aXBzIH0gZnJvbSAnLi4vLi4vLi4vdXRpbHMvdG9vbHRpcGlmeSc7XG5pbXBvcnQgeyBJbnRlZ3JhdGlvbk1hbmFnZXJzIH0gZnJvbSBcIi4uLy4uLy4uL2ludGVncmF0aW9ucy9JbnRlZ3JhdGlvbk1hbmFnZXJzXCI7XG5pbXBvcnQgeyBpc1Blcm1hbGlua0hvc3QsIHRyeVRyYW5zZm9ybVBlcm1hbGlua1RvTG9jYWxIcmVmIH0gZnJvbSBcIi4uLy4uLy4uL3V0aWxzL3Blcm1hbGlua3MvUGVybWFsaW5rc1wiO1xuaW1wb3J0IHsgY29weVBsYWludGV4dCB9IGZyb20gXCIuLi8uLi8uLi91dGlscy9zdHJpbmdzXCI7XG5pbXBvcnQgQWNjZXNzaWJsZVRvb2x0aXBCdXR0b24gZnJvbSBcIi4uL2VsZW1lbnRzL0FjY2Vzc2libGVUb29sdGlwQnV0dG9uXCI7XG5pbXBvcnQgVUlTdG9yZSBmcm9tIFwiLi4vLi4vLi4vc3RvcmVzL1VJU3RvcmVcIjtcbmltcG9ydCB7IENvbXBvc2VySW5zZXJ0UGF5bG9hZCB9IGZyb20gXCIuLi8uLi8uLi9kaXNwYXRjaGVyL3BheWxvYWRzL0NvbXBvc2VySW5zZXJ0UGF5bG9hZFwiO1xuaW1wb3J0IHsgQWN0aW9uIH0gZnJvbSBcIi4uLy4uLy4uL2Rpc3BhdGNoZXIvYWN0aW9uc1wiO1xuaW1wb3J0IEdlbmVyaWNUZXh0Q29udGV4dE1lbnUgZnJvbSBcIi4uL2NvbnRleHRfbWVudXMvR2VuZXJpY1RleHRDb250ZXh0TWVudVwiO1xuaW1wb3J0IFNwb2lsZXIgZnJvbSBcIi4uL2VsZW1lbnRzL1Nwb2lsZXJcIjtcbmltcG9ydCBRdWVzdGlvbkRpYWxvZyBmcm9tIFwiLi4vZGlhbG9ncy9RdWVzdGlvbkRpYWxvZ1wiO1xuaW1wb3J0IE1lc3NhZ2VFZGl0SGlzdG9yeURpYWxvZyBmcm9tIFwiLi4vZGlhbG9ncy9NZXNzYWdlRWRpdEhpc3RvcnlEaWFsb2dcIjtcbmltcG9ydCBFZGl0TWVzc2FnZUNvbXBvc2VyIGZyb20gJy4uL3Jvb21zL0VkaXRNZXNzYWdlQ29tcG9zZXInO1xuaW1wb3J0IExpbmtQcmV2aWV3R3JvdXAgZnJvbSAnLi4vcm9vbXMvTGlua1ByZXZpZXdHcm91cCc7XG5pbXBvcnQgeyBJQm9keVByb3BzIH0gZnJvbSBcIi4vSUJvZHlQcm9wc1wiO1xuaW1wb3J0IFJvb21Db250ZXh0IGZyb20gXCIuLi8uLi8uLi9jb250ZXh0cy9Sb29tQ29udGV4dFwiO1xuaW1wb3J0IEFjY2Vzc2libGVCdXR0b24gZnJvbSAnLi4vZWxlbWVudHMvQWNjZXNzaWJsZUJ1dHRvbic7XG5pbXBvcnQgeyBvcHRpb25zIGFzIGxpbmtpZnlPcHRzIH0gZnJvbSBcIi4uLy4uLy4uL2xpbmtpZnktbWF0cml4XCI7XG5pbXBvcnQgeyBnZXRQYXJlbnRFdmVudElkIH0gZnJvbSAnLi4vLi4vLi4vdXRpbHMvUmVwbHknO1xuXG5jb25zdCBNQVhfSElHSExJR0hUX0xFTkdUSCA9IDQwOTY7XG5cbmludGVyZmFjZSBJU3RhdGUge1xuICAgIC8vIHRoZSBVUkxzIChpZiBhbnkpIHRvIGJlIHByZXZpZXdlZCB3aXRoIGEgTGlua1ByZXZpZXdXaWRnZXQgaW5zaWRlIHRoaXMgVGV4dHVhbEJvZHkuXG4gICAgbGlua3M6IHN0cmluZ1tdO1xuXG4gICAgLy8gdHJhY2sgd2hldGhlciB0aGUgcHJldmlldyB3aWRnZXQgaXMgaGlkZGVuXG4gICAgd2lkZ2V0SGlkZGVuOiBib29sZWFuO1xufVxuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBUZXh0dWFsQm9keSBleHRlbmRzIFJlYWN0LkNvbXBvbmVudDxJQm9keVByb3BzLCBJU3RhdGU+IHtcbiAgICBwcml2YXRlIHJlYWRvbmx5IGNvbnRlbnRSZWYgPSBjcmVhdGVSZWY8SFRNTFNwYW5FbGVtZW50PigpO1xuXG4gICAgcHJpdmF0ZSB1bm1vdW50ZWQgPSBmYWxzZTtcbiAgICBwcml2YXRlIHBpbGxzOiBFbGVtZW50W10gPSBbXTtcbiAgICBwcml2YXRlIHRvb2x0aXBzOiBFbGVtZW50W10gPSBbXTtcblxuICAgIHN0YXRpYyBjb250ZXh0VHlwZSA9IFJvb21Db250ZXh0O1xuICAgIHB1YmxpYyBjb250ZXh0ITogUmVhY3QuQ29udGV4dFR5cGU8dHlwZW9mIFJvb21Db250ZXh0PjtcblxuICAgIGNvbnN0cnVjdG9yKHByb3BzKSB7XG4gICAgICAgIHN1cGVyKHByb3BzKTtcblxuICAgICAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgICAgICAgbGlua3M6IFtdLFxuICAgICAgICAgICAgd2lkZ2V0SGlkZGVuOiBmYWxzZSxcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBjb21wb25lbnREaWRNb3VudCgpIHtcbiAgICAgICAgaWYgKCF0aGlzLnByb3BzLmVkaXRTdGF0ZSkge1xuICAgICAgICAgICAgdGhpcy5hcHBseUZvcm1hdHRpbmcoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgYXBwbHlGb3JtYXR0aW5nKCk6IHZvaWQge1xuICAgICAgICBjb25zdCBzaG93TGluZU51bWJlcnMgPSBTZXR0aW5nc1N0b3JlLmdldFZhbHVlKFwic2hvd0NvZGVMaW5lTnVtYmVyc1wiKTtcbiAgICAgICAgdGhpcy5hY3RpdmF0ZVNwb2lsZXJzKFt0aGlzLmNvbnRlbnRSZWYuY3VycmVudF0pO1xuXG4gICAgICAgIC8vIHBpbGxpZnlMaW5rcyBCRUZPUkUgbGlua2lmeUVsZW1lbnQgYmVjYXVzZSBwbGFpbiByb29tL3VzZXIgVVJMcyBpbiB0aGUgY29tcG9zZXJcbiAgICAgICAgLy8gYXJlIHN0aWxsIHNlbnQgYXMgcGxhaW50ZXh0IFVSTHMuIElmIHRoZXNlIGFyZSBldmVyIHBpbGxpZmllZCBpbiB0aGUgY29tcG9zZXIsXG4gICAgICAgIC8vIHdlIHNob3VsZCBiZSBwaWxsaWZ5IHRoZW0gaGVyZSBieSBkb2luZyB0aGUgbGlua2lmeWluZyBCRUZPUkUgdGhlIHBpbGxpZnlpbmcuXG4gICAgICAgIHBpbGxpZnlMaW5rcyhbdGhpcy5jb250ZW50UmVmLmN1cnJlbnRdLCB0aGlzLnByb3BzLm14RXZlbnQsIHRoaXMucGlsbHMpO1xuICAgICAgICBIdG1sVXRpbHMubGlua2lmeUVsZW1lbnQodGhpcy5jb250ZW50UmVmLmN1cnJlbnQpO1xuXG4gICAgICAgIHRoaXMuY2FsY3VsYXRlVXJsUHJldmlldygpO1xuXG4gICAgICAgIC8vIHRvb2x0aXBpZnlMaW5rcyBBRlRFUiBjYWxjdWxhdGVVcmxQcmV2aWV3IGJlY2F1c2UgdGhlIERPTSBpbnNpZGUgdGhlIHRvb2x0aXBcbiAgICAgICAgLy8gY29udGFpbmVyIGlzIGVtcHR5IGJlZm9yZSB0aGUgaW50ZXJuYWwgY29tcG9uZW50IGhhcyBtb3VudGVkIHNvIGNhbGN1bGF0ZVVybFByZXZpZXdcbiAgICAgICAgLy8gd29uJ3QgZmluZCBhbnkgYW5jaG9yc1xuICAgICAgICB0b29sdGlwaWZ5TGlua3MoW3RoaXMuY29udGVudFJlZi5jdXJyZW50XSwgdGhpcy5waWxscywgdGhpcy50b29sdGlwcyk7XG5cbiAgICAgICAgaWYgKHRoaXMucHJvcHMubXhFdmVudC5nZXRDb250ZW50KCkuZm9ybWF0ID09PSBcIm9yZy5tYXRyaXguY3VzdG9tLmh0bWxcIikge1xuICAgICAgICAgICAgLy8gSGFuZGxlIGV4cGFuc2lvbiBhbmQgYWRkIGJ1dHRvbnNcbiAgICAgICAgICAgIGNvbnN0IHByZXMgPSAoUmVhY3RET00uZmluZERPTU5vZGUodGhpcykgYXMgRWxlbWVudCkuZ2V0RWxlbWVudHNCeVRhZ05hbWUoXCJwcmVcIik7XG4gICAgICAgICAgICBpZiAocHJlcy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBwcmVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIElmIHRoZXJlIGFscmVhZHkgaXMgYSBkaXYgd3JhcHBpbmcgdGhlIGNvZGVibG9jayB3ZSB3YW50IHRvIHNraXAgdGhpcy5cbiAgICAgICAgICAgICAgICAgICAgLy8gVGhpcyBoYXBwZW5zIGFmdGVyIHRoZSBjb2RlYmxvY2sgd2FzIGVkaXRlZC5cbiAgICAgICAgICAgICAgICAgICAgaWYgKHByZXNbaV0ucGFyZW50RWxlbWVudC5jbGFzc05hbWUgPT0gXCJteF9FdmVudFRpbGVfcHJlX2NvbnRhaW5lclwiKSBjb250aW51ZTtcbiAgICAgICAgICAgICAgICAgICAgLy8gQWRkIGNvZGUgZWxlbWVudCBpZiBpdCdzIG1pc3Npbmcgc2luY2Ugd2UgZGVwZW5kIG9uIGl0XG4gICAgICAgICAgICAgICAgICAgIGlmIChwcmVzW2ldLmdldEVsZW1lbnRzQnlUYWdOYW1lKFwiY29kZVwiKS5sZW5ndGggPT0gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5hZGRDb2RlRWxlbWVudChwcmVzW2ldKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAvLyBXcmFwIGEgZGl2IGFyb3VuZCA8cHJlPiBzbyB0aGF0IHRoZSBjb3B5IGJ1dHRvbiBjYW4gYmUgY29ycmVjdGx5IHBvc2l0aW9uZWRcbiAgICAgICAgICAgICAgICAgICAgLy8gd2hlbiB0aGUgPHByZT4gb3ZlcmZsb3dzIGFuZCBpcyBzY3JvbGxlZCBob3Jpem9udGFsbHkuXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGRpdiA9IHRoaXMud3JhcEluRGl2KHByZXNbaV0pO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmhhbmRsZUNvZGVCbG9ja0V4cGFuc2lvbihwcmVzW2ldKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5hZGRDb2RlRXhwYW5zaW9uQnV0dG9uKGRpdiwgcHJlc1tpXSk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuYWRkQ29kZUNvcHlCdXR0b24oZGl2KTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHNob3dMaW5lTnVtYmVycykge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5hZGRMaW5lTnVtYmVycyhwcmVzW2ldKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIEhpZ2hsaWdodCBjb2RlXG4gICAgICAgICAgICBjb25zdCBjb2RlcyA9IChSZWFjdERPTS5maW5kRE9NTm9kZSh0aGlzKSBhcyBFbGVtZW50KS5nZXRFbGVtZW50c0J5VGFnTmFtZShcImNvZGVcIik7XG4gICAgICAgICAgICBpZiAoY29kZXMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgIC8vIERvIHRoaXMgYXN5bmNocm9ub3VzbHk6IHBhcnNpbmcgY29kZSB0YWtlcyB0aW1lIGFuZCB3ZSBkb24ndFxuICAgICAgICAgICAgICAgIC8vIG5lZWQgdG8gYmxvY2sgdGhlIERPTSB1cGRhdGUgb24gaXQuXG4gICAgICAgICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLnVubW91bnRlZCkgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGNvZGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmhpZ2hsaWdodENvZGUoY29kZXNbaV0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSwgMTApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBhZGRDb2RlRWxlbWVudChwcmU6IEhUTUxQcmVFbGVtZW50KTogdm9pZCB7XG4gICAgICAgIGNvbnN0IGNvZGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiY29kZVwiKTtcbiAgICAgICAgY29kZS5hcHBlbmQoLi4ucHJlLmNoaWxkTm9kZXMpO1xuICAgICAgICBwcmUuYXBwZW5kQ2hpbGQoY29kZSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBhZGRDb2RlRXhwYW5zaW9uQnV0dG9uKGRpdjogSFRNTERpdkVsZW1lbnQsIHByZTogSFRNTFByZUVsZW1lbnQpOiB2b2lkIHtcbiAgICAgICAgLy8gQ2FsY3VsYXRlIGhvdyBtYW55IHBlcmNlbnQgZG9lcyB0aGUgcHJlIGVsZW1lbnQgdGFrZSB1cC5cbiAgICAgICAgLy8gSWYgaXQncyBsZXNzIHRoYW4gMzAlIHdlIGRvbid0IGFkZCB0aGUgZXhwYW5zaW9uIGJ1dHRvbi5cbiAgICAgICAgLy8gV2UgYWxzbyByb3VuZCB0aGUgbnVtYmVyIGFzIGl0IHNvbWV0aW1lcyBjYW4gYmUgMjkuOTkuLi5cbiAgICAgICAgY29uc3QgcGVyY2VudGFnZU9mVmlld3BvcnQgPSBNYXRoLnJvdW5kKHByZS5vZmZzZXRIZWlnaHQgLyBVSVN0b3JlLmluc3RhbmNlLndpbmRvd0hlaWdodCAqIDEwMCk7XG4gICAgICAgIC8vIFRPRE86IGFkZGl0aW9uYWxseSBzaG93IHRoZSBidXR0b24gaWYgaXQncyBhbiBleHBhbmRlZCBxdW90ZWQgbWVzc2FnZVxuICAgICAgICBpZiAocGVyY2VudGFnZU9mVmlld3BvcnQgPCAzMCkgcmV0dXJuO1xuXG4gICAgICAgIGNvbnN0IGJ1dHRvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJzcGFuXCIpO1xuICAgICAgICBidXR0b24uY2xhc3NOYW1lID0gXCJteF9FdmVudFRpbGVfYnV0dG9uIFwiO1xuICAgICAgICBpZiAocHJlLmNsYXNzTmFtZSA9PSBcIm14X0V2ZW50VGlsZV9jb2xsYXBzZWRDb2RlQmxvY2tcIikge1xuICAgICAgICAgICAgYnV0dG9uLmNsYXNzTmFtZSArPSBcIm14X0V2ZW50VGlsZV9leHBhbmRCdXR0b25cIjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGJ1dHRvbi5jbGFzc05hbWUgKz0gXCJteF9FdmVudFRpbGVfY29sbGFwc2VCdXR0b25cIjtcbiAgICAgICAgfVxuXG4gICAgICAgIGJ1dHRvbi5vbmNsaWNrID0gYXN5bmMgKCkgPT4ge1xuICAgICAgICAgICAgYnV0dG9uLmNsYXNzTmFtZSA9IFwibXhfRXZlbnRUaWxlX2J1dHRvbiBcIjtcbiAgICAgICAgICAgIGlmIChwcmUuY2xhc3NOYW1lID09IFwibXhfRXZlbnRUaWxlX2NvbGxhcHNlZENvZGVCbG9ja1wiKSB7XG4gICAgICAgICAgICAgICAgcHJlLmNsYXNzTmFtZSA9IFwiXCI7XG4gICAgICAgICAgICAgICAgYnV0dG9uLmNsYXNzTmFtZSArPSBcIm14X0V2ZW50VGlsZV9jb2xsYXBzZUJ1dHRvblwiO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBwcmUuY2xhc3NOYW1lID0gXCJteF9FdmVudFRpbGVfY29sbGFwc2VkQ29kZUJsb2NrXCI7XG4gICAgICAgICAgICAgICAgYnV0dG9uLmNsYXNzTmFtZSArPSBcIm14X0V2ZW50VGlsZV9leHBhbmRCdXR0b25cIjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gQnkgZXhwYW5kaW5nL2NvbGxhcHNpbmcgd2UgY2hhbmdlZFxuICAgICAgICAgICAgLy8gdGhlIGhlaWdodCwgdGhlcmVmb3JlIHdlIGNhbGwgdGhpc1xuICAgICAgICAgICAgdGhpcy5wcm9wcy5vbkhlaWdodENoYW5nZWQoKTtcbiAgICAgICAgfTtcblxuICAgICAgICBkaXYuYXBwZW5kQ2hpbGQoYnV0dG9uKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGFkZENvZGVDb3B5QnV0dG9uKGRpdjogSFRNTERpdkVsZW1lbnQpOiB2b2lkIHtcbiAgICAgICAgY29uc3QgYnV0dG9uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInNwYW5cIik7XG4gICAgICAgIGJ1dHRvbi5jbGFzc05hbWUgPSBcIm14X0V2ZW50VGlsZV9idXR0b24gbXhfRXZlbnRUaWxlX2NvcHlCdXR0b24gXCI7XG5cbiAgICAgICAgLy8gQ2hlY2sgaWYgZXhwYW5zaW9uIGJ1dHRvbiBleGlzdHMuIElmIHNvIHdlIHB1dCB0aGUgY29weSBidXR0b24gdG8gdGhlIGJvdHRvbVxuICAgICAgICBjb25zdCBleHBhbnNpb25CdXR0b25FeGlzdHMgPSBkaXYuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZShcIm14X0V2ZW50VGlsZV9idXR0b25cIik7XG4gICAgICAgIGlmIChleHBhbnNpb25CdXR0b25FeGlzdHMubGVuZ3RoID4gMCkgYnV0dG9uLmNsYXNzTmFtZSArPSBcIm14X0V2ZW50VGlsZV9idXR0b25Cb3R0b21cIjtcblxuICAgICAgICBidXR0b24ub25jbGljayA9IGFzeW5jICgpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGNvcHlDb2RlID0gYnV0dG9uLnBhcmVudEVsZW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoXCJjb2RlXCIpWzBdO1xuICAgICAgICAgICAgY29uc3Qgc3VjY2Vzc2Z1bCA9IGF3YWl0IGNvcHlQbGFpbnRleHQoY29weUNvZGUudGV4dENvbnRlbnQpO1xuXG4gICAgICAgICAgICBjb25zdCBidXR0b25SZWN0ID0gYnV0dG9uLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgICAgICAgICAgY29uc3QgeyBjbG9zZSB9ID0gQ29udGV4dE1lbnUuY3JlYXRlTWVudShHZW5lcmljVGV4dENvbnRleHRNZW51LCB7XG4gICAgICAgICAgICAgICAgLi4udG9SaWdodE9mKGJ1dHRvblJlY3QsIDApLFxuICAgICAgICAgICAgICAgIGNoZXZyb25GYWNlOiBDaGV2cm9uRmFjZS5Ob25lLFxuICAgICAgICAgICAgICAgIG1lc3NhZ2U6IHN1Y2Nlc3NmdWwgPyBfdCgnQ29waWVkIScpIDogX3QoJ0ZhaWxlZCB0byBjb3B5JyksXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGJ1dHRvbi5vbm1vdXNlbGVhdmUgPSBjbG9zZTtcbiAgICAgICAgfTtcblxuICAgICAgICBkaXYuYXBwZW5kQ2hpbGQoYnV0dG9uKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIHdyYXBJbkRpdihwcmU6IEhUTUxQcmVFbGVtZW50KTogSFRNTERpdkVsZW1lbnQge1xuICAgICAgICBjb25zdCBkaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgICAgICBkaXYuY2xhc3NOYW1lID0gXCJteF9FdmVudFRpbGVfcHJlX2NvbnRhaW5lclwiO1xuXG4gICAgICAgIC8vIEluc2VydCBjb250YWluaW5nIGRpdiBpbiBwbGFjZSBvZiA8cHJlPiBibG9ja1xuICAgICAgICBwcmUucGFyZW50Tm9kZS5yZXBsYWNlQ2hpbGQoZGl2LCBwcmUpO1xuICAgICAgICAvLyBBcHBlbmQgPHByZT4gYmxvY2sgYW5kIGNvcHkgYnV0dG9uIHRvIGNvbnRhaW5lclxuICAgICAgICBkaXYuYXBwZW5kQ2hpbGQocHJlKTtcblxuICAgICAgICByZXR1cm4gZGl2O1xuICAgIH1cblxuICAgIHByaXZhdGUgaGFuZGxlQ29kZUJsb2NrRXhwYW5zaW9uKHByZTogSFRNTFByZUVsZW1lbnQpOiB2b2lkIHtcbiAgICAgICAgaWYgKCFTZXR0aW5nc1N0b3JlLmdldFZhbHVlKFwiZXhwYW5kQ29kZUJ5RGVmYXVsdFwiKSkge1xuICAgICAgICAgICAgcHJlLmNsYXNzTmFtZSA9IFwibXhfRXZlbnRUaWxlX2NvbGxhcHNlZENvZGVCbG9ja1wiO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBhZGRMaW5lTnVtYmVycyhwcmU6IEhUTUxQcmVFbGVtZW50KTogdm9pZCB7XG4gICAgICAgIC8vIENhbGN1bGF0ZSBudW1iZXIgb2YgbGluZXMgaW4gcHJlXG4gICAgICAgIGNvbnN0IG51bWJlciA9IHByZS5pbm5lckhUTUwucmVwbGFjZSgvXFxuKDxcXC9jb2RlPik/JC8sIFwiXCIpLnNwbGl0KC9cXG4vKS5sZW5ndGg7XG4gICAgICAgIGNvbnN0IGxpbmVOdW1iZXJzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3BhbicpO1xuICAgICAgICBsaW5lTnVtYmVycy5jbGFzc05hbWUgPSAnbXhfRXZlbnRUaWxlX2xpbmVOdW1iZXJzJztcbiAgICAgICAgLy8gSXRlcmF0ZSB0aHJvdWdoIGxpbmVzIHN0YXJ0aW5nIHdpdGggMSAobnVtYmVyIG9mIHRoZSBmaXJzdCBsaW5lIGlzIDEpXG4gICAgICAgIGZvciAobGV0IGkgPSAxOyBpIDw9IG51bWJlcjsgaSsrKSB7XG4gICAgICAgICAgICBjb25zdCBzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3BhbicpO1xuICAgICAgICAgICAgcy50ZXh0Q29udGVudCA9IGkudG9TdHJpbmcoKTtcbiAgICAgICAgICAgIGxpbmVOdW1iZXJzLmFwcGVuZENoaWxkKHMpO1xuICAgICAgICB9XG4gICAgICAgIHByZS5wcmVwZW5kKGxpbmVOdW1iZXJzKTtcbiAgICAgICAgcHJlLmFwcGVuZChkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzcGFuJykpO1xuICAgIH1cblxuICAgIHByaXZhdGUgaGlnaGxpZ2h0Q29kZShjb2RlOiBIVE1MRWxlbWVudCk6IHZvaWQge1xuICAgICAgICBpZiAoY29kZS50ZXh0Q29udGVudC5sZW5ndGggPiBNQVhfSElHSExJR0hUX0xFTkdUSCkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coXG4gICAgICAgICAgICAgICAgXCJDb2RlIGJsb2NrIGlzIGJpZ2dlciB0aGFuIGhpZ2hsaWdodCBsaW1pdCAoXCIgK1xuICAgICAgICAgICAgICAgIGNvZGUudGV4dENvbnRlbnQubGVuZ3RoICsgXCIgPiBcIiArIE1BWF9ISUdITElHSFRfTEVOR1RIICtcbiAgICAgICAgICAgICAgICBcIik6IG5vdCBoaWdobGlnaHRpbmdcIixcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgYWR2ZXJ0aXNlZExhbmc7XG4gICAgICAgIGZvciAoY29uc3QgY2wgb2YgY29kZS5jbGFzc05hbWUuc3BsaXQoL1xccysvKSkge1xuICAgICAgICAgICAgaWYgKGNsLnN0YXJ0c1dpdGgoJ2xhbmd1YWdlLScpKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgbWF5YmVMYW5nID0gY2wuc3BsaXQoJy0nLCAyKVsxXTtcbiAgICAgICAgICAgICAgICBpZiAoaGlnaGxpZ2h0LmdldExhbmd1YWdlKG1heWJlTGFuZykpIHtcbiAgICAgICAgICAgICAgICAgICAgYWR2ZXJ0aXNlZExhbmcgPSBtYXliZUxhbmc7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChhZHZlcnRpc2VkTGFuZykge1xuICAgICAgICAgICAgLy8gSWYgdGhlIGNvZGUgc2F5cyB3aGF0IGxhbmd1YWdlIGl0IGlzLCBoaWdobGlnaHQgaXQgaW4gdGhhdCBsYW5ndWFnZVxuICAgICAgICAgICAgLy8gV2UgZG9uJ3QgdXNlIGhpZ2hsaWdodEVsZW1lbnQgaGVyZSBiZWNhdXNlIHdlIGNhbid0IGZvcmNlIGxhbmd1YWdlIGRldGVjdGlvblxuICAgICAgICAgICAgLy8gb2ZmLiBJdCBzaG91bGQgdXNlIHRoZSBvbmUgd2UndmUgZm91bmQgaW4gdGhlIENTUyBjbGFzcyBidXQgd2UnZCByYXRoZXIgcGFzc1xuICAgICAgICAgICAgLy8gaXQgaW4gZXhwbGljaXRseSB0byBtYWtlIHN1cmUuXG4gICAgICAgICAgICBjb2RlLmlubmVySFRNTCA9IGhpZ2hsaWdodC5oaWdobGlnaHQoYWR2ZXJ0aXNlZExhbmcsIGNvZGUudGV4dENvbnRlbnQpLnZhbHVlO1xuICAgICAgICB9IGVsc2UgaWYgKFxuICAgICAgICAgICAgU2V0dGluZ3NTdG9yZS5nZXRWYWx1ZShcImVuYWJsZVN5bnRheEhpZ2hsaWdodExhbmd1YWdlRGV0ZWN0aW9uXCIpICYmXG4gICAgICAgICAgICBjb2RlLnBhcmVudEVsZW1lbnQgaW5zdGFuY2VvZiBIVE1MUHJlRWxlbWVudFxuICAgICAgICApIHtcbiAgICAgICAgICAgIC8vIFVzZXIgaGFzIGxhbmd1YWdlIGRldGVjdGlvbiBlbmFibGVkIGFuZCB0aGUgY29kZSBpcyB3aXRoaW4gYSBwcmVcbiAgICAgICAgICAgIC8vIHdlIG9ubHkgYXV0by1oaWdobGlnaHQgaWYgdGhlIGNvZGUgYmxvY2sgaXMgaW4gYSBwcmUpLCBzbyBoaWdobGlnaHRcbiAgICAgICAgICAgIC8vIHRoZSBibG9jayB3aXRoIGF1dG8taGlnaGxpZ2h0aW5nIGVuYWJsZWQuXG4gICAgICAgICAgICAvLyBXZSBwYXNzIGhpZ2hsaWdodGpzIHRoZSB0ZXh0IHRvIGhpZ2hsaWdodCByYXRoZXIgdGhhbiBsZXR0aW5nIGl0XG4gICAgICAgICAgICAvLyB3b3JrIG9uIHRoZSBET00gd2l0aCBoaWdobGlnaHRFbGVtZW50IGJlY2F1c2UgdGhhdCBhbHNvIGFkZHMgQ1NTXG4gICAgICAgICAgICAvLyBjbGFzc2VzIHRvIHRoZSBwcmUvY29kZSBlbGVtZW50IHRoYXQgd2UgZG9uJ3Qgd2FudCAodGhlIENTU1xuICAgICAgICAgICAgLy8gY29uZmxpY3RzIHdpdGggb3VyIG93bikuXG4gICAgICAgICAgICBjb2RlLmlubmVySFRNTCA9IGhpZ2hsaWdodC5oaWdobGlnaHRBdXRvKGNvZGUudGV4dENvbnRlbnQpLnZhbHVlO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgY29tcG9uZW50RGlkVXBkYXRlKHByZXZQcm9wcykge1xuICAgICAgICBpZiAoIXRoaXMucHJvcHMuZWRpdFN0YXRlKSB7XG4gICAgICAgICAgICBjb25zdCBzdG9wcGVkRWRpdGluZyA9IHByZXZQcm9wcy5lZGl0U3RhdGUgJiYgIXRoaXMucHJvcHMuZWRpdFN0YXRlO1xuICAgICAgICAgICAgY29uc3QgbWVzc2FnZVdhc0VkaXRlZCA9IHByZXZQcm9wcy5yZXBsYWNpbmdFdmVudElkICE9PSB0aGlzLnByb3BzLnJlcGxhY2luZ0V2ZW50SWQ7XG4gICAgICAgICAgICBpZiAobWVzc2FnZVdhc0VkaXRlZCB8fCBzdG9wcGVkRWRpdGluZykge1xuICAgICAgICAgICAgICAgIHRoaXMuYXBwbHlGb3JtYXR0aW5nKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBjb21wb25lbnRXaWxsVW5tb3VudCgpIHtcbiAgICAgICAgdGhpcy51bm1vdW50ZWQgPSB0cnVlO1xuICAgICAgICB1bm1vdW50UGlsbHModGhpcy5waWxscyk7XG4gICAgICAgIHVubW91bnRUb29sdGlwcyh0aGlzLnRvb2x0aXBzKTtcbiAgICB9XG5cbiAgICBzaG91bGRDb21wb25lbnRVcGRhdGUobmV4dFByb3BzLCBuZXh0U3RhdGUpIHtcbiAgICAgICAgLy9jb25zb2xlLmluZm8oXCJzaG91bGRDb21wb25lbnRVcGRhdGU6IFNob3dVcmxQcmV2aWV3IGZvciAlcyBpcyAlc1wiLCB0aGlzLnByb3BzLm14RXZlbnQuZ2V0SWQoKSwgdGhpcy5wcm9wcy5zaG93VXJsUHJldmlldyk7XG5cbiAgICAgICAgLy8gZXhwbG9pdCB0aGF0IGV2ZW50cyBhcmUgaW1tdXRhYmxlIDopXG4gICAgICAgIHJldHVybiAobmV4dFByb3BzLm14RXZlbnQuZ2V0SWQoKSAhPT0gdGhpcy5wcm9wcy5teEV2ZW50LmdldElkKCkgfHxcbiAgICAgICAgICAgICAgICBuZXh0UHJvcHMuaGlnaGxpZ2h0cyAhPT0gdGhpcy5wcm9wcy5oaWdobGlnaHRzIHx8XG4gICAgICAgICAgICAgICAgbmV4dFByb3BzLnJlcGxhY2luZ0V2ZW50SWQgIT09IHRoaXMucHJvcHMucmVwbGFjaW5nRXZlbnRJZCB8fFxuICAgICAgICAgICAgICAgIG5leHRQcm9wcy5oaWdobGlnaHRMaW5rICE9PSB0aGlzLnByb3BzLmhpZ2hsaWdodExpbmsgfHxcbiAgICAgICAgICAgICAgICBuZXh0UHJvcHMuc2hvd1VybFByZXZpZXcgIT09IHRoaXMucHJvcHMuc2hvd1VybFByZXZpZXcgfHxcbiAgICAgICAgICAgICAgICBuZXh0UHJvcHMuZWRpdFN0YXRlICE9PSB0aGlzLnByb3BzLmVkaXRTdGF0ZSB8fFxuICAgICAgICAgICAgICAgIG5leHRTdGF0ZS5saW5rcyAhPT0gdGhpcy5zdGF0ZS5saW5rcyB8fFxuICAgICAgICAgICAgICAgIG5leHRTdGF0ZS53aWRnZXRIaWRkZW4gIT09IHRoaXMuc3RhdGUud2lkZ2V0SGlkZGVuIHx8XG4gICAgICAgICAgICAgICAgbmV4dFByb3BzLmlzU2VlaW5nVGhyb3VnaE1lc3NhZ2VIaWRkZW5Gb3JNb2RlcmF0aW9uXG4gICAgICAgICAgICAgICAgICAgICE9PSB0aGlzLnByb3BzLmlzU2VlaW5nVGhyb3VnaE1lc3NhZ2VIaWRkZW5Gb3JNb2RlcmF0aW9uKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGNhbGN1bGF0ZVVybFByZXZpZXcoKTogdm9pZCB7XG4gICAgICAgIC8vY29uc29sZS5pbmZvKFwiY2FsY3VsYXRlVXJsUHJldmlldzogU2hvd1VybFByZXZpZXcgZm9yICVzIGlzICVzXCIsIHRoaXMucHJvcHMubXhFdmVudC5nZXRJZCgpLCB0aGlzLnByb3BzLnNob3dVcmxQcmV2aWV3KTtcblxuICAgICAgICBpZiAodGhpcy5wcm9wcy5zaG93VXJsUHJldmlldykge1xuICAgICAgICAgICAgLy8gcGFzcyBvbmx5IHRoZSBmaXJzdCBjaGlsZCB3aGljaCBpcyB0aGUgZXZlbnQgdGlsZSBvdGhlcndpc2UgdGhpcyByZWN1cnNlcyBvbiBlZGl0ZWQgZXZlbnRzXG4gICAgICAgICAgICBsZXQgbGlua3MgPSB0aGlzLmZpbmRMaW5rcyhbdGhpcy5jb250ZW50UmVmLmN1cnJlbnRdKTtcbiAgICAgICAgICAgIGlmIChsaW5rcy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAvLyBkZS1kdXBsaWNhdGUgdGhlIGxpbmtzIHVzaW5nIGEgc2V0IGhlcmUgbWFpbnRhaW5zIHRoZSBvcmRlclxuICAgICAgICAgICAgICAgIGxpbmtzID0gQXJyYXkuZnJvbShuZXcgU2V0KGxpbmtzKSk7XG4gICAgICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IGxpbmtzIH0pO1xuXG4gICAgICAgICAgICAgICAgLy8gbGF6eS1sb2FkIHRoZSBoaWRkZW4gc3RhdGUgb2YgdGhlIHByZXZpZXcgd2lkZ2V0IGZyb20gbG9jYWxzdG9yYWdlXG4gICAgICAgICAgICAgICAgaWYgKHdpbmRvdy5sb2NhbFN0b3JhZ2UpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgaGlkZGVuID0gISF3aW5kb3cubG9jYWxTdG9yYWdlLmdldEl0ZW0oXCJoaWRlX3ByZXZpZXdfXCIgKyB0aGlzLnByb3BzLm14RXZlbnQuZ2V0SWQoKSk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoeyB3aWRnZXRIaWRkZW46IGhpZGRlbiB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMuc3RhdGUubGlua3MubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IGxpbmtzOiBbXSB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgYWN0aXZhdGVTcG9pbGVycyhub2RlczogQXJyYXlMaWtlPEVsZW1lbnQ+KTogdm9pZCB7XG4gICAgICAgIGxldCBub2RlID0gbm9kZXNbMF07XG4gICAgICAgIHdoaWxlIChub2RlKSB7XG4gICAgICAgICAgICBpZiAobm9kZS50YWdOYW1lID09PSBcIlNQQU5cIiAmJiB0eXBlb2Ygbm9kZS5nZXRBdHRyaWJ1dGUoXCJkYXRhLW14LXNwb2lsZXJcIikgPT09IFwic3RyaW5nXCIpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBzcG9pbGVyQ29udGFpbmVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3BhbicpO1xuXG4gICAgICAgICAgICAgICAgY29uc3QgcmVhc29uID0gbm9kZS5nZXRBdHRyaWJ1dGUoXCJkYXRhLW14LXNwb2lsZXJcIik7XG4gICAgICAgICAgICAgICAgbm9kZS5yZW1vdmVBdHRyaWJ1dGUoXCJkYXRhLW14LXNwb2lsZXJcIik7IC8vIHdlIGRvbid0IHdhbnQgdG8gcmVjdXJzZVxuICAgICAgICAgICAgICAgIGNvbnN0IHNwb2lsZXIgPSA8U3BvaWxlciByZWFzb249e3JlYXNvbn0gY29udGVudEh0bWw9e25vZGUub3V0ZXJIVE1MfSAvPjtcblxuICAgICAgICAgICAgICAgIFJlYWN0RE9NLnJlbmRlcihzcG9pbGVyLCBzcG9pbGVyQ29udGFpbmVyKTtcbiAgICAgICAgICAgICAgICBub2RlLnBhcmVudE5vZGUucmVwbGFjZUNoaWxkKHNwb2lsZXJDb250YWluZXIsIG5vZGUpO1xuXG4gICAgICAgICAgICAgICAgbm9kZSA9IHNwb2lsZXJDb250YWluZXI7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChub2RlLmNoaWxkTm9kZXMgJiYgbm9kZS5jaGlsZE5vZGVzLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIHRoaXMuYWN0aXZhdGVTcG9pbGVycyhub2RlLmNoaWxkTm9kZXMgYXMgTm9kZUxpc3RPZjxFbGVtZW50Pik7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIG5vZGUgPSBub2RlLm5leHRTaWJsaW5nIGFzIEVsZW1lbnQ7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIGZpbmRMaW5rcyhub2RlczogQXJyYXlMaWtlPEVsZW1lbnQ+KTogc3RyaW5nW10ge1xuICAgICAgICBsZXQgbGlua3M6IHN0cmluZ1tdID0gW107XG5cbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBub2Rlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgY29uc3Qgbm9kZSA9IG5vZGVzW2ldO1xuICAgICAgICAgICAgaWYgKG5vZGUudGFnTmFtZSA9PT0gXCJBXCIgJiYgbm9kZS5nZXRBdHRyaWJ1dGUoXCJocmVmXCIpKSB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuaXNMaW5rUHJldmlld2FibGUobm9kZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgbGlua3MucHVzaChub2RlLmdldEF0dHJpYnV0ZShcImhyZWZcIikpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSBpZiAobm9kZS50YWdOYW1lID09PSBcIlBSRVwiIHx8IG5vZGUudGFnTmFtZSA9PT0gXCJDT0RFXCIgfHxcbiAgICAgICAgICAgICAgICAgICAgbm9kZS50YWdOYW1lID09PSBcIkJMT0NLUVVPVEVcIikge1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChub2RlLmNoaWxkcmVuICYmIG5vZGUuY2hpbGRyZW4ubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgbGlua3MgPSBsaW5rcy5jb25jYXQodGhpcy5maW5kTGlua3Mobm9kZS5jaGlsZHJlbikpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBsaW5rcztcbiAgICB9XG5cbiAgICBwcml2YXRlIGlzTGlua1ByZXZpZXdhYmxlKG5vZGU6IEVsZW1lbnQpOiBib29sZWFuIHtcbiAgICAgICAgLy8gZG9uJ3QgdHJ5IHRvIHByZXZpZXcgcmVsYXRpdmUgbGlua3NcbiAgICAgICAgaWYgKCFub2RlLmdldEF0dHJpYnV0ZShcImhyZWZcIikuc3RhcnRzV2l0aChcImh0dHA6Ly9cIikgJiZcbiAgICAgICAgICAgICFub2RlLmdldEF0dHJpYnV0ZShcImhyZWZcIikuc3RhcnRzV2l0aChcImh0dHBzOi8vXCIpKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBhcyBhIHJhbmRvbSBoZXVyaXN0aWMgdG8gYXZvaWQgaGlnaGxpZ2h0aW5nIHRoaW5ncyBsaWtlIFwiZm9vLnBsXCJcbiAgICAgICAgLy8gd2UgcmVxdWlyZSB0aGUgbGlua2VkIHRleHQgdG8gZWl0aGVyIGluY2x1ZGUgYSAvIChlaXRoZXIgZnJvbSBodHRwOi8vXG4gICAgICAgIC8vIG9yIGZyb20gYSBmdWxsIGZvby5iYXIvYmF6IHN0eWxlIHNjaGVtZWxlc3MgVVJMKSAtIG9yIGJlIGEgbWFya2Rvd24tc3R5bGVcbiAgICAgICAgLy8gbGluaywgaW4gd2hpY2ggY2FzZSB3ZSBjaGVjayB0aGUgdGFyZ2V0IHRleHQgZGlmZmVycyBmcm9tIHRoZSBsaW5rIHZhbHVlLlxuICAgICAgICAvLyBUT0RPOiBtYWtlIHRoaXMgY29uZmlndXJhYmxlP1xuICAgICAgICBpZiAobm9kZS50ZXh0Q29udGVudC5pbmRleE9mKFwiL1wiKSA+IC0xKSB7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnN0IHVybCA9IG5vZGUuZ2V0QXR0cmlidXRlKFwiaHJlZlwiKTtcbiAgICAgICAgICAgIGNvbnN0IGhvc3QgPSB1cmwubWF0Y2goL15odHRwcz86XFwvXFwvKC4qPykoXFwvfCQpLylbMV07XG5cbiAgICAgICAgICAgIC8vIG5ldmVyIHByZXZpZXcgcGVybWFsaW5rcyAoaWYgYW55dGhpbmcgd2Ugc2hvdWxkIGdpdmUgYSBzbWFydFxuICAgICAgICAgICAgLy8gcHJldmlldyBvZiB0aGUgcm9vbS91c2VyIHRoZXkgcG9pbnQgdG86IG5vYm9keSBuZWVkcyB0byBiZSByZW1pbmRlZFxuICAgICAgICAgICAgLy8gd2hhdCB0aGUgbWF0cml4LnRvIHNpdGUgbG9va3MgbGlrZSkuXG4gICAgICAgICAgICBpZiAoaXNQZXJtYWxpbmtIb3N0KGhvc3QpKSByZXR1cm4gZmFsc2U7XG5cbiAgICAgICAgICAgIGlmIChub2RlLnRleHRDb250ZW50LnRvTG93ZXJDYXNlKCkudHJpbSgpLnN0YXJ0c1dpdGgoaG9zdC50b0xvd2VyQ2FzZSgpKSkge1xuICAgICAgICAgICAgICAgIC8vIGl0J3MgYSBcImZvby5wbFwiIHN0eWxlIGxpbmtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIC8vIGl0J3MgYSBbZm9vIGJhcl0oaHR0cDovL2Zvby5jb20pIHN0eWxlIGxpbmtcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgb25DYW5jZWxDbGljayA9ICgpOiB2b2lkID0+IHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IHdpZGdldEhpZGRlbjogdHJ1ZSB9KTtcbiAgICAgICAgLy8gRklYTUU6IHBlcnNpc3QgdGhpcyBzb21ld2hlcmUgc21hcnRlciB0aGFuIGxvY2FsIHN0b3JhZ2VcbiAgICAgICAgaWYgKGdsb2JhbC5sb2NhbFN0b3JhZ2UpIHtcbiAgICAgICAgICAgIGdsb2JhbC5sb2NhbFN0b3JhZ2Uuc2V0SXRlbShcImhpZGVfcHJldmlld19cIiArIHRoaXMucHJvcHMubXhFdmVudC5nZXRJZCgpLCBcIjFcIik7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5mb3JjZVVwZGF0ZSgpO1xuICAgIH07XG5cbiAgICBwcml2YXRlIG9uRW1vdGVTZW5kZXJDbGljayA9ICgpOiB2b2lkID0+IHtcbiAgICAgICAgY29uc3QgbXhFdmVudCA9IHRoaXMucHJvcHMubXhFdmVudDtcbiAgICAgICAgZGlzLmRpc3BhdGNoPENvbXBvc2VySW5zZXJ0UGF5bG9hZD4oe1xuICAgICAgICAgICAgYWN0aW9uOiBBY3Rpb24uQ29tcG9zZXJJbnNlcnQsXG4gICAgICAgICAgICB1c2VySWQ6IG14RXZlbnQuZ2V0U2VuZGVyKCksXG4gICAgICAgICAgICB0aW1lbGluZVJlbmRlcmluZ1R5cGU6IHRoaXMuY29udGV4dC50aW1lbGluZVJlbmRlcmluZ1R5cGUsXG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBUaGlzIGFjdHMgYXMgYSBmYWxsYmFjayBpbi1hcHAgbmF2aWdhdGlvbiBoYW5kbGVyIGZvciBhbnkgYm9keSBsaW5rcyB0aGF0XG4gICAgICogd2VyZSBpZ25vcmVkIGFzIHBhcnQgb2YgbGlua2lmaWNhdGlvbiBiZWNhdXNlIHRoZXkgd2VyZSBhbHJlYWR5IGxpbmtzXG4gICAgICogdG8gc3RhcnQgd2l0aCAoZS5nLiBwaWxscywgbGlua3MgaW4gdGhlIGNvbnRlbnQpLlxuICAgICAqL1xuICAgIHByaXZhdGUgb25Cb2R5TGlua0NsaWNrID0gKGU6IE1vdXNlRXZlbnQpOiB2b2lkID0+IHtcbiAgICAgICAgbGV0IHRhcmdldCA9IGUudGFyZ2V0IGFzIEhUTUxMaW5rRWxlbWVudDtcbiAgICAgICAgLy8gbGlua3MgcHJvY2Vzc2VkIGJ5IGxpbmtpZnlqcyBoYXZlIHRoZWlyIG93biBoYW5kbGVyIHNvIGRvbid0IGhhbmRsZSB0aG9zZSBoZXJlXG4gICAgICAgIGlmICh0YXJnZXQuY2xhc3NMaXN0LmNvbnRhaW5zKGxpbmtpZnlPcHRzLmNsYXNzTmFtZSkpIHJldHVybjtcbiAgICAgICAgaWYgKHRhcmdldC5ub2RlTmFtZSAhPT0gXCJBXCIpIHtcbiAgICAgICAgICAgIC8vIEp1bXAgdG8gcGFyZW50IGFzIHRoZSBgPGE+YCBtYXkgY29udGFpbiBjaGlsZHJlbiwgZS5nLiBhbiBhbmNob3Igd3JhcHBpbmcgYW4gaW5saW5lIGNvZGUgc2VjdGlvblxuICAgICAgICAgICAgdGFyZ2V0ID0gdGFyZ2V0LmNsb3Nlc3Q8SFRNTExpbmtFbGVtZW50PihcImFcIik7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCF0YXJnZXQpIHJldHVybjtcblxuICAgICAgICBjb25zdCBsb2NhbEhyZWYgPSB0cnlUcmFuc2Zvcm1QZXJtYWxpbmtUb0xvY2FsSHJlZih0YXJnZXQuaHJlZik7XG4gICAgICAgIGlmIChsb2NhbEhyZWYgIT09IHRhcmdldC5ocmVmKSB7XG4gICAgICAgICAgICAvLyBpdCBjb3VsZCBiZSBjb252ZXJ0ZWQgdG8gYSBsb2NhbEhyZWYgLT4gdGhlcmVmb3JlIGhhbmRsZSBsb2NhbGx5XG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICB3aW5kb3cubG9jYXRpb24uaGFzaCA9IGxvY2FsSHJlZjtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBwdWJsaWMgZ2V0RXZlbnRUaWxlT3BzID0gKCkgPT4gKHtcbiAgICAgICAgaXNXaWRnZXRIaWRkZW46ICgpID0+IHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnN0YXRlLndpZGdldEhpZGRlbjtcbiAgICAgICAgfSxcblxuICAgICAgICB1bmhpZGVXaWRnZXQ6ICgpID0+IHtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoeyB3aWRnZXRIaWRkZW46IGZhbHNlIH0pO1xuICAgICAgICAgICAgaWYgKGdsb2JhbC5sb2NhbFN0b3JhZ2UpIHtcbiAgICAgICAgICAgICAgICBnbG9iYWwubG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0oXCJoaWRlX3ByZXZpZXdfXCIgKyB0aGlzLnByb3BzLm14RXZlbnQuZ2V0SWQoKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgfSk7XG5cbiAgICBwcml2YXRlIG9uU3RhcnRlckxpbmtDbGljayA9IChzdGFydGVyTGluazogc3RyaW5nLCBldjogU3ludGhldGljRXZlbnQpOiB2b2lkID0+IHtcbiAgICAgICAgZXYucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgLy8gV2UgbmVlZCB0byBhZGQgb24gb3VyIHNjYWxhciB0b2tlbiB0byB0aGUgc3RhcnRlciBsaW5rLCBidXQgd2UgbWF5IG5vdCBoYXZlIG9uZSFcbiAgICAgICAgLy8gSW4gYWRkaXRpb24sIHdlIGNhbid0IGZldGNoIG9uZSBvbiBjbGljayBhbmQgdGhlbiBnbyB0byBpdCBpbW1lZGlhdGVseSBhcyB0aGF0XG4gICAgICAgIC8vIGlzIHRoZW4gdHJlYXRlZCBhcyBhIHBvcHVwIVxuICAgICAgICAvLyBXZSBjYW4gZ2V0IGFyb3VuZCB0aGlzIGJ5IGZldGNoaW5nIG9uZSBub3cgYW5kIHNob3dpbmcgYSBcImNvbmZpcm1hdGlvbiBkaWFsb2dcIiAoaHVyciBodXJyKVxuICAgICAgICAvLyB3aGljaCByZXF1aXJlcyB0aGUgdXNlciB0byBjbGljayB0aHJvdWdoIGFuZCBUSEVOIHdlIGNhbiBvcGVuIHRoZSBsaW5rIGluIGEgbmV3IHRhYiBiZWNhdXNlXG4gICAgICAgIC8vIHRoZSB3aW5kb3cub3BlbiBjb21tYW5kIG9jY3VycyBpbiB0aGUgc2FtZSBzdGFjayBmcmFtZSBhcyB0aGUgb25DbGljayBjYWxsYmFjay5cblxuICAgICAgICBjb25zdCBtYW5hZ2VycyA9IEludGVncmF0aW9uTWFuYWdlcnMuc2hhcmVkSW5zdGFuY2UoKTtcbiAgICAgICAgaWYgKCFtYW5hZ2Vycy5oYXNNYW5hZ2VyKCkpIHtcbiAgICAgICAgICAgIG1hbmFnZXJzLm9wZW5Ob01hbmFnZXJEaWFsb2coKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIEdvIGZldGNoIGEgc2NhbGFyIHRva2VuXG4gICAgICAgIGNvbnN0IGludGVncmF0aW9uTWFuYWdlciA9IG1hbmFnZXJzLmdldFByaW1hcnlNYW5hZ2VyKCk7XG4gICAgICAgIGNvbnN0IHNjYWxhckNsaWVudCA9IGludGVncmF0aW9uTWFuYWdlci5nZXRTY2FsYXJDbGllbnQoKTtcbiAgICAgICAgc2NhbGFyQ2xpZW50LmNvbm5lY3QoKS50aGVuKCgpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGNvbXBsZXRlVXJsID0gc2NhbGFyQ2xpZW50LmdldFN0YXJ0ZXJMaW5rKHN0YXJ0ZXJMaW5rKTtcbiAgICAgICAgICAgIGNvbnN0IGludGVncmF0aW9uc1VybCA9IGludGVncmF0aW9uTWFuYWdlci51aVVybDtcbiAgICAgICAgICAgIE1vZGFsLmNyZWF0ZURpYWxvZyhRdWVzdGlvbkRpYWxvZywge1xuICAgICAgICAgICAgICAgIHRpdGxlOiBfdChcIkFkZCBhbiBJbnRlZ3JhdGlvblwiKSxcbiAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjpcbiAgICAgICAgICAgICAgICAgICAgPGRpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgIHsgX3QoXCJZb3UgYXJlIGFib3V0IHRvIGJlIHRha2VuIHRvIGEgdGhpcmQtcGFydHkgc2l0ZSBzbyB5b3UgY2FuIFwiICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImF1dGhlbnRpY2F0ZSB5b3VyIGFjY291bnQgZm9yIHVzZSB3aXRoICUoaW50ZWdyYXRpb25zVXJsKXMuIFwiICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIkRvIHlvdSB3aXNoIHRvIGNvbnRpbnVlP1wiLCB7IGludGVncmF0aW9uc1VybDogaW50ZWdyYXRpb25zVXJsIH0pIH1cbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+LFxuICAgICAgICAgICAgICAgIGJ1dHRvbjogX3QoXCJDb250aW51ZVwiKSxcbiAgICAgICAgICAgICAgICBvbkZpbmlzaGVkKGNvbmZpcm1lZCkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoIWNvbmZpcm1lZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHdpZHRoID0gd2luZG93LnNjcmVlbi53aWR0aCA+IDEwMjQgPyAxMDI0IDogd2luZG93LnNjcmVlbi53aWR0aDtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgaGVpZ2h0ID0gd2luZG93LnNjcmVlbi5oZWlnaHQgPiA4MDAgPyA4MDAgOiB3aW5kb3cuc2NyZWVuLmhlaWdodDtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgbGVmdCA9ICh3aW5kb3cuc2NyZWVuLndpZHRoIC0gd2lkdGgpIC8gMjtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgdG9wID0gKHdpbmRvdy5zY3JlZW4uaGVpZ2h0IC0gaGVpZ2h0KSAvIDI7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGZlYXR1cmVzID0gYGhlaWdodD0ke2hlaWdodH0sIHdpZHRoPSR7d2lkdGh9LCB0b3A9JHt0b3B9LCBsZWZ0PSR7bGVmdH0sYDtcbiAgICAgICAgICAgICAgICAgICAgY29uc3Qgd25kID0gd2luZG93Lm9wZW4oY29tcGxldGVVcmwsICdfYmxhbmsnLCBmZWF0dXJlcyk7XG4gICAgICAgICAgICAgICAgICAgIHduZC5vcGVuZXIgPSBudWxsO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIHByaXZhdGUgb3Blbkhpc3RvcnlEaWFsb2cgPSBhc3luYyAoKTogUHJvbWlzZTx2b2lkPiA9PiB7XG4gICAgICAgIE1vZGFsLmNyZWF0ZURpYWxvZyhNZXNzYWdlRWRpdEhpc3RvcnlEaWFsb2csIHsgbXhFdmVudDogdGhpcy5wcm9wcy5teEV2ZW50IH0pO1xuICAgIH07XG5cbiAgICBwcml2YXRlIHJlbmRlckVkaXRlZE1hcmtlcigpIHtcbiAgICAgICAgY29uc3QgZGF0ZSA9IHRoaXMucHJvcHMubXhFdmVudC5yZXBsYWNpbmdFdmVudERhdGUoKTtcbiAgICAgICAgY29uc3QgZGF0ZVN0cmluZyA9IGRhdGUgJiYgZm9ybWF0RGF0ZShkYXRlKTtcblxuICAgICAgICBjb25zdCB0b29sdGlwID0gPGRpdj5cbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfVG9vbHRpcF90aXRsZVwiPlxuICAgICAgICAgICAgICAgIHsgX3QoXCJFZGl0ZWQgYXQgJShkYXRlKXNcIiwgeyBkYXRlOiBkYXRlU3RyaW5nIH0pIH1cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9Ub29sdGlwX3N1YlwiPlxuICAgICAgICAgICAgICAgIHsgX3QoXCJDbGljayB0byB2aWV3IGVkaXRzXCIpIH1cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L2Rpdj47XG5cbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDxBY2Nlc3NpYmxlVG9vbHRpcEJ1dHRvblxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cIm14X0V2ZW50VGlsZV9lZGl0ZWRcIlxuICAgICAgICAgICAgICAgIG9uQ2xpY2s9e3RoaXMub3Blbkhpc3RvcnlEaWFsb2d9XG4gICAgICAgICAgICAgICAgdGl0bGU9e190KFwiRWRpdGVkIGF0ICUoZGF0ZSlzLiBDbGljayB0byB2aWV3IGVkaXRzLlwiLCB7IGRhdGU6IGRhdGVTdHJpbmcgfSl9XG4gICAgICAgICAgICAgICAgdG9vbHRpcD17dG9vbHRpcH1cbiAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICA8c3Bhbj57IGAoJHtfdChcImVkaXRlZFwiKX0pYCB9PC9zcGFuPlxuICAgICAgICAgICAgPC9BY2Nlc3NpYmxlVG9vbHRpcEJ1dHRvbj5cbiAgICAgICAgKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZW5kZXIgYSBtYXJrZXIgaW5mb3JtaW5nIHRoZSB1c2VyIHRoYXQsIHdoaWxlIHRoZXkgY2FuIHNlZSB0aGUgbWVzc2FnZSxcbiAgICAgKiBpdCBpcyBoaWRkZW4gZm9yIG90aGVyIHVzZXJzLlxuICAgICAqL1xuICAgIHByaXZhdGUgcmVuZGVyUGVuZGluZ01vZGVyYXRpb25NYXJrZXIoKSB7XG4gICAgICAgIGxldCB0ZXh0O1xuICAgICAgICBjb25zdCB2aXNpYmlsaXR5ID0gdGhpcy5wcm9wcy5teEV2ZW50Lm1lc3NhZ2VWaXNpYmlsaXR5KCk7XG4gICAgICAgIHN3aXRjaCAodmlzaWJpbGl0eS52aXNpYmxlKSB7XG4gICAgICAgICAgICBjYXNlIHRydWU6XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwicmVuZGVyUGVuZGluZ01vZGVyYXRpb25NYXJrZXIgc2hvdWxkIG9ubHkgYmUgYXBwbGllZCB0byBoaWRkZW4gbWVzc2FnZXNcIik7XG4gICAgICAgICAgICBjYXNlIGZhbHNlOlxuICAgICAgICAgICAgICAgIGlmICh2aXNpYmlsaXR5LnJlYXNvbikge1xuICAgICAgICAgICAgICAgICAgICB0ZXh0ID0gX3QoXCJNZXNzYWdlIHBlbmRpbmcgbW9kZXJhdGlvbjogJShyZWFzb24pc1wiLCB7IHJlYXNvbjogdmlzaWJpbGl0eS5yZWFzb24gfSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdGV4dCA9IF90KFwiTWVzc2FnZSBwZW5kaW5nIG1vZGVyYXRpb25cIik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJteF9FdmVudFRpbGVfcGVuZGluZ01vZGVyYXRpb25cIj57IGAoJHt0ZXh0fSlgIH08L3NwYW4+XG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgcmVuZGVyKCkge1xuICAgICAgICBpZiAodGhpcy5wcm9wcy5lZGl0U3RhdGUpIHtcbiAgICAgICAgICAgIHJldHVybiA8RWRpdE1lc3NhZ2VDb21wb3NlciBlZGl0U3RhdGU9e3RoaXMucHJvcHMuZWRpdFN0YXRlfSBjbGFzc05hbWU9XCJteF9FdmVudFRpbGVfY29udGVudFwiIC8+O1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IG14RXZlbnQgPSB0aGlzLnByb3BzLm14RXZlbnQ7XG4gICAgICAgIGNvbnN0IGNvbnRlbnQgPSBteEV2ZW50LmdldENvbnRlbnQoKTtcbiAgICAgICAgbGV0IGlzTm90aWNlID0gZmFsc2U7XG4gICAgICAgIGxldCBpc0Vtb3RlID0gZmFsc2U7XG5cbiAgICAgICAgLy8gb25seSBzdHJpcCByZXBseSBpZiB0aGlzIGlzIHRoZSBvcmlnaW5hbCByZXBseWluZyBldmVudCwgZWRpdHMgdGhlcmVhZnRlciBkbyBub3QgaGF2ZSB0aGUgZmFsbGJhY2tcbiAgICAgICAgY29uc3Qgc3RyaXBSZXBseSA9ICFteEV2ZW50LnJlcGxhY2luZ0V2ZW50KCkgJiYgISFnZXRQYXJlbnRFdmVudElkKG14RXZlbnQpO1xuICAgICAgICBsZXQgYm9keTogUmVhY3ROb2RlO1xuICAgICAgICBpZiAoU2V0dGluZ3NTdG9yZS5pc0VuYWJsZWQoXCJmZWF0dXJlX2V4dGVuc2libGVfZXZlbnRzXCIpKSB7XG4gICAgICAgICAgICBjb25zdCBleHRldiA9IHRoaXMucHJvcHMubXhFdmVudC51bnN0YWJsZUV4dGVuc2libGVFdmVudCBhcyBNZXNzYWdlRXZlbnQ7XG4gICAgICAgICAgICBpZiAoZXh0ZXY/LmlzRXF1aXZhbGVudFRvKE1fTUVTU0FHRSkpIHtcbiAgICAgICAgICAgICAgICBpc0Vtb3RlID0gaXNFdmVudExpa2UoZXh0ZXYud2lyZUZvcm1hdCwgTGVnYWN5TXNnVHlwZS5FbW90ZSk7XG4gICAgICAgICAgICAgICAgaXNOb3RpY2UgPSBpc0V2ZW50TGlrZShleHRldi53aXJlRm9ybWF0LCBMZWdhY3lNc2dUeXBlLk5vdGljZSk7XG4gICAgICAgICAgICAgICAgYm9keSA9IEh0bWxVdGlscy5ib2R5VG9IdG1sKHtcbiAgICAgICAgICAgICAgICAgICAgYm9keTogZXh0ZXYudGV4dCxcbiAgICAgICAgICAgICAgICAgICAgZm9ybWF0OiBleHRldi5odG1sID8gXCJvcmcubWF0cml4LmN1c3RvbS5odG1sXCIgOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAgICAgICAgIGZvcm1hdHRlZF9ib2R5OiBleHRldi5odG1sLFxuICAgICAgICAgICAgICAgICAgICBtc2d0eXBlOiBNc2dUeXBlLlRleHQsXG4gICAgICAgICAgICAgICAgfSwgdGhpcy5wcm9wcy5oaWdobGlnaHRzLCB7XG4gICAgICAgICAgICAgICAgICAgIGRpc2FibGVCaWdFbW9qaTogaXNFbW90ZVxuICAgICAgICAgICAgICAgICAgICAgICAgfHwgIVNldHRpbmdzU3RvcmUuZ2V0VmFsdWU8Ym9vbGVhbj4oJ1RleHR1YWxCb2R5LmVuYWJsZUJpZ0Vtb2ppJyksXG4gICAgICAgICAgICAgICAgICAgIC8vIFBhcnQgb2YgUmVwbGllcyBmYWxsYmFjayBzdXBwb3J0XG4gICAgICAgICAgICAgICAgICAgIHN0cmlwUmVwbHlGYWxsYmFjazogc3RyaXBSZXBseSxcbiAgICAgICAgICAgICAgICAgICAgcmVmOiB0aGlzLmNvbnRlbnRSZWYsXG4gICAgICAgICAgICAgICAgICAgIHJldHVyblN0cmluZzogZmFsc2UsXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFib2R5KSB7XG4gICAgICAgICAgICBpc0Vtb3RlID0gY29udGVudC5tc2d0eXBlID09PSBNc2dUeXBlLkVtb3RlO1xuICAgICAgICAgICAgaXNOb3RpY2UgPSBjb250ZW50Lm1zZ3R5cGUgPT09IE1zZ1R5cGUuTm90aWNlO1xuICAgICAgICAgICAgYm9keSA9IEh0bWxVdGlscy5ib2R5VG9IdG1sKGNvbnRlbnQsIHRoaXMucHJvcHMuaGlnaGxpZ2h0cywge1xuICAgICAgICAgICAgICAgIGRpc2FibGVCaWdFbW9qaTogaXNFbW90ZVxuICAgICAgICAgICAgICAgICAgICB8fCAhU2V0dGluZ3NTdG9yZS5nZXRWYWx1ZTxib29sZWFuPignVGV4dHVhbEJvZHkuZW5hYmxlQmlnRW1vamknKSxcbiAgICAgICAgICAgICAgICAvLyBQYXJ0IG9mIFJlcGxpZXMgZmFsbGJhY2sgc3VwcG9ydFxuICAgICAgICAgICAgICAgIHN0cmlwUmVwbHlGYWxsYmFjazogc3RyaXBSZXBseSxcbiAgICAgICAgICAgICAgICByZWY6IHRoaXMuY29udGVudFJlZixcbiAgICAgICAgICAgICAgICByZXR1cm5TdHJpbmc6IGZhbHNlLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMucHJvcHMucmVwbGFjaW5nRXZlbnRJZCkge1xuICAgICAgICAgICAgYm9keSA9IDw+XG4gICAgICAgICAgICAgICAgeyBib2R5IH1cbiAgICAgICAgICAgICAgICB7IHRoaXMucmVuZGVyRWRpdGVkTWFya2VyKCkgfVxuICAgICAgICAgICAgPC8+O1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLnByb3BzLmlzU2VlaW5nVGhyb3VnaE1lc3NhZ2VIaWRkZW5Gb3JNb2RlcmF0aW9uKSB7XG4gICAgICAgICAgICBib2R5ID0gPD5cbiAgICAgICAgICAgICAgICB7IGJvZHkgfVxuICAgICAgICAgICAgICAgIHsgdGhpcy5yZW5kZXJQZW5kaW5nTW9kZXJhdGlvbk1hcmtlcigpIH1cbiAgICAgICAgICAgIDwvPjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLnByb3BzLmhpZ2hsaWdodExpbmspIHtcbiAgICAgICAgICAgIGJvZHkgPSA8YSBocmVmPXt0aGlzLnByb3BzLmhpZ2hsaWdodExpbmt9PnsgYm9keSB9PC9hPjtcbiAgICAgICAgfSBlbHNlIGlmIChjb250ZW50LmRhdGEgJiYgdHlwZW9mIGNvbnRlbnQuZGF0YVtcIm9yZy5tYXRyaXgubmViLnN0YXJ0ZXJfbGlua1wiXSA9PT0gXCJzdHJpbmdcIikge1xuICAgICAgICAgICAgYm9keSA9IChcbiAgICAgICAgICAgICAgICA8QWNjZXNzaWJsZUJ1dHRvblxuICAgICAgICAgICAgICAgICAgICBraW5kPVwibGlua19pbmxpbmVcIlxuICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXt0aGlzLm9uU3RhcnRlckxpbmtDbGljay5iaW5kKHRoaXMsIGNvbnRlbnQuZGF0YVtcIm9yZy5tYXRyaXgubmViLnN0YXJ0ZXJfbGlua1wiXSl9XG4gICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICB7IGJvZHkgfVxuICAgICAgICAgICAgICAgIDwvQWNjZXNzaWJsZUJ1dHRvbj5cbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgd2lkZ2V0cztcbiAgICAgICAgaWYgKHRoaXMuc3RhdGUubGlua3MubGVuZ3RoICYmICF0aGlzLnN0YXRlLndpZGdldEhpZGRlbiAmJiB0aGlzLnByb3BzLnNob3dVcmxQcmV2aWV3KSB7XG4gICAgICAgICAgICB3aWRnZXRzID0gPExpbmtQcmV2aWV3R3JvdXBcbiAgICAgICAgICAgICAgICBsaW5rcz17dGhpcy5zdGF0ZS5saW5rc31cbiAgICAgICAgICAgICAgICBteEV2ZW50PXt0aGlzLnByb3BzLm14RXZlbnR9XG4gICAgICAgICAgICAgICAgb25DYW5jZWxDbGljaz17dGhpcy5vbkNhbmNlbENsaWNrfVxuICAgICAgICAgICAgICAgIG9uSGVpZ2h0Q2hhbmdlZD17dGhpcy5wcm9wcy5vbkhlaWdodENoYW5nZWR9XG4gICAgICAgICAgICAvPjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChpc0Vtb3RlKSB7XG4gICAgICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfTUVtb3RlQm9keSBteF9FdmVudFRpbGVfY29udGVudFwiXG4gICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9e3RoaXMub25Cb2R5TGlua0NsaWNrfVxuICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgKiZuYnNwO1xuICAgICAgICAgICAgICAgICAgICA8c3BhblxuICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwibXhfTUVtb3RlQm9keV9zZW5kZXJcIlxuICAgICAgICAgICAgICAgICAgICAgICAgb25DbGljaz17dGhpcy5vbkVtb3RlU2VuZGVyQ2xpY2t9XG4gICAgICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgICAgIHsgbXhFdmVudC5zZW5kZXIgPyBteEV2ZW50LnNlbmRlci5uYW1lIDogbXhFdmVudC5nZXRTZW5kZXIoKSB9XG4gICAgICAgICAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgJm5ic3A7XG4gICAgICAgICAgICAgICAgICAgIHsgYm9keSB9XG4gICAgICAgICAgICAgICAgICAgIHsgd2lkZ2V0cyB9XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICAgIGlmIChpc05vdGljZSkge1xuICAgICAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X01Ob3RpY2VCb2R5IG14X0V2ZW50VGlsZV9jb250ZW50XCJcbiAgICAgICAgICAgICAgICAgICAgb25DbGljaz17dGhpcy5vbkJvZHlMaW5rQ2xpY2t9XG4gICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICB7IGJvZHkgfVxuICAgICAgICAgICAgICAgICAgICB7IHdpZGdldHMgfVxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9NVGV4dEJvZHkgbXhfRXZlbnRUaWxlX2NvbnRlbnRcIiBvbkNsaWNrPXt0aGlzLm9uQm9keUxpbmtDbGlja30+XG4gICAgICAgICAgICAgICAgeyBib2R5IH1cbiAgICAgICAgICAgICAgICB7IHdpZGdldHMgfVxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICk7XG4gICAgfVxufVxuIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQWdCQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFFQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFFQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFFQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFFQTs7QUFDQTs7QUFDQTs7QUFDQTs7Ozs7Ozs7OztBQUVBLE1BQU1BLG9CQUFvQixHQUFHLElBQTdCOztBQVVlLE1BQU1DLFdBQU4sU0FBMEJDLGNBQUEsQ0FBTUMsU0FBaEMsQ0FBOEQ7RUFVekVDLFdBQVcsQ0FBQ0MsS0FBRCxFQUFRO0lBQ2YsTUFBTUEsS0FBTjtJQURlLCtEQVRXLElBQUFDLGdCQUFBLEdBU1g7SUFBQSxpREFQQyxLQU9EO0lBQUEsNkNBTlEsRUFNUjtJQUFBLGdEQUxXLEVBS1g7SUFBQTtJQUFBLHFEQW1WSyxNQUFZO01BQ2hDLEtBQUtDLFFBQUwsQ0FBYztRQUFFQyxZQUFZLEVBQUU7TUFBaEIsQ0FBZCxFQURnQyxDQUVoQzs7TUFDQSxJQUFJQyxNQUFNLENBQUNDLFlBQVgsRUFBeUI7UUFDckJELE1BQU0sQ0FBQ0MsWUFBUCxDQUFvQkMsT0FBcEIsQ0FBNEIsa0JBQWtCLEtBQUtOLEtBQUwsQ0FBV08sT0FBWCxDQUFtQkMsS0FBbkIsRUFBOUMsRUFBMEUsR0FBMUU7TUFDSDs7TUFDRCxLQUFLQyxXQUFMO0lBQ0gsQ0ExVmtCO0lBQUEsMERBNFZVLE1BQVk7TUFDckMsTUFBTUYsT0FBTyxHQUFHLEtBQUtQLEtBQUwsQ0FBV08sT0FBM0I7O01BQ0FHLG1CQUFBLENBQUlDLFFBQUosQ0FBb0M7UUFDaENDLE1BQU0sRUFBRUMsZUFBQSxDQUFPQyxjQURpQjtRQUVoQ0MsTUFBTSxFQUFFUixPQUFPLENBQUNTLFNBQVIsRUFGd0I7UUFHaENDLHFCQUFxQixFQUFFLEtBQUtDLE9BQUwsQ0FBYUQ7TUFISixDQUFwQztJQUtILENBbldrQjtJQUFBLHVEQTBXUUUsQ0FBRCxJQUF5QjtNQUMvQyxJQUFJQyxNQUFNLEdBQUdELENBQUMsQ0FBQ0MsTUFBZixDQUQrQyxDQUUvQzs7TUFDQSxJQUFJQSxNQUFNLENBQUNDLFNBQVAsQ0FBaUJDLFFBQWpCLENBQTBCQyxzQkFBQSxDQUFZQyxTQUF0QyxDQUFKLEVBQXNEOztNQUN0RCxJQUFJSixNQUFNLENBQUNLLFFBQVAsS0FBb0IsR0FBeEIsRUFBNkI7UUFDekI7UUFDQUwsTUFBTSxHQUFHQSxNQUFNLENBQUNNLE9BQVAsQ0FBZ0MsR0FBaEMsQ0FBVDtNQUNIOztNQUNELElBQUksQ0FBQ04sTUFBTCxFQUFhO01BRWIsTUFBTU8sU0FBUyxHQUFHLElBQUFDLDRDQUFBLEVBQWlDUixNQUFNLENBQUNTLElBQXhDLENBQWxCOztNQUNBLElBQUlGLFNBQVMsS0FBS1AsTUFBTSxDQUFDUyxJQUF6QixFQUErQjtRQUMzQjtRQUNBVixDQUFDLENBQUNXLGNBQUY7UUFDQUMsTUFBTSxDQUFDQyxRQUFQLENBQWdCQyxJQUFoQixHQUF1Qk4sU0FBdkI7TUFDSDtJQUNKLENBMVhrQjtJQUFBLHVEQTRYTSxPQUFPO01BQzVCTyxjQUFjLEVBQUUsTUFBTTtRQUNsQixPQUFPLEtBQUtDLEtBQUwsQ0FBV2hDLFlBQWxCO01BQ0gsQ0FIMkI7TUFLNUJpQyxZQUFZLEVBQUUsTUFBTTtRQUNoQixLQUFLbEMsUUFBTCxDQUFjO1VBQUVDLFlBQVksRUFBRTtRQUFoQixDQUFkOztRQUNBLElBQUlDLE1BQU0sQ0FBQ0MsWUFBWCxFQUF5QjtVQUNyQkQsTUFBTSxDQUFDQyxZQUFQLENBQW9CZ0MsVUFBcEIsQ0FBK0Isa0JBQWtCLEtBQUtyQyxLQUFMLENBQVdPLE9BQVgsQ0FBbUJDLEtBQW5CLEVBQWpEO1FBQ0g7TUFDSjtJQVYyQixDQUFQLENBNVhOO0lBQUEsMERBeVlVLENBQUM4QixXQUFELEVBQXNCQyxFQUF0QixLQUFtRDtNQUM1RUEsRUFBRSxDQUFDVCxjQUFILEdBRDRFLENBRTVFO01BQ0E7TUFDQTtNQUNBO01BQ0E7TUFDQTs7TUFFQSxNQUFNVSxRQUFRLEdBQUdDLHdDQUFBLENBQW9CQyxjQUFwQixFQUFqQjs7TUFDQSxJQUFJLENBQUNGLFFBQVEsQ0FBQ0csVUFBVCxFQUFMLEVBQTRCO1FBQ3hCSCxRQUFRLENBQUNJLG1CQUFUO1FBQ0E7TUFDSCxDQWIyRSxDQWU1RTs7O01BQ0EsTUFBTUMsa0JBQWtCLEdBQUdMLFFBQVEsQ0FBQ00saUJBQVQsRUFBM0I7TUFDQSxNQUFNQyxZQUFZLEdBQUdGLGtCQUFrQixDQUFDRyxlQUFuQixFQUFyQjtNQUNBRCxZQUFZLENBQUNFLE9BQWIsR0FBdUJDLElBQXZCLENBQTRCLE1BQU07UUFDOUIsTUFBTUMsV0FBVyxHQUFHSixZQUFZLENBQUNLLGNBQWIsQ0FBNEJkLFdBQTVCLENBQXBCO1FBQ0EsTUFBTWUsZUFBZSxHQUFHUixrQkFBa0IsQ0FBQ1MsS0FBM0M7O1FBQ0FDLGNBQUEsQ0FBTUMsWUFBTixDQUFtQkMsdUJBQW5CLEVBQW1DO1VBQy9CQyxLQUFLLEVBQUUsSUFBQUMsbUJBQUEsRUFBRyxvQkFBSCxDQUR3QjtVQUUvQkMsV0FBVyxlQUNQLDBDQUNNLElBQUFELG1CQUFBLEVBQUcsZ0VBQ0QsOERBREMsR0FFRCwwQkFGRixFQUU4QjtZQUFFTixlQUFlLEVBQUVBO1VBQW5CLENBRjlCLENBRE4sQ0FIMkI7VUFRL0JRLE1BQU0sRUFBRSxJQUFBRixtQkFBQSxFQUFHLFVBQUgsQ0FSdUI7O1VBUy9CRyxVQUFVLENBQUNDLFNBQUQsRUFBWTtZQUNsQixJQUFJLENBQUNBLFNBQUwsRUFBZ0I7Y0FDWjtZQUNIOztZQUNELE1BQU1DLEtBQUssR0FBR2pDLE1BQU0sQ0FBQ2tDLE1BQVAsQ0FBY0QsS0FBZCxHQUFzQixJQUF0QixHQUE2QixJQUE3QixHQUFvQ2pDLE1BQU0sQ0FBQ2tDLE1BQVAsQ0FBY0QsS0FBaEU7WUFDQSxNQUFNRSxNQUFNLEdBQUduQyxNQUFNLENBQUNrQyxNQUFQLENBQWNDLE1BQWQsR0FBdUIsR0FBdkIsR0FBNkIsR0FBN0IsR0FBbUNuQyxNQUFNLENBQUNrQyxNQUFQLENBQWNDLE1BQWhFO1lBQ0EsTUFBTUMsSUFBSSxHQUFHLENBQUNwQyxNQUFNLENBQUNrQyxNQUFQLENBQWNELEtBQWQsR0FBc0JBLEtBQXZCLElBQWdDLENBQTdDO1lBQ0EsTUFBTUksR0FBRyxHQUFHLENBQUNyQyxNQUFNLENBQUNrQyxNQUFQLENBQWNDLE1BQWQsR0FBdUJBLE1BQXhCLElBQWtDLENBQTlDO1lBQ0EsTUFBTUcsUUFBUSxHQUFJLFVBQVNILE1BQU8sV0FBVUYsS0FBTSxTQUFRSSxHQUFJLFVBQVNELElBQUssR0FBNUU7WUFDQSxNQUFNRyxHQUFHLEdBQUd2QyxNQUFNLENBQUN3QyxJQUFQLENBQVlwQixXQUFaLEVBQXlCLFFBQXpCLEVBQW1Da0IsUUFBbkMsQ0FBWjtZQUNBQyxHQUFHLENBQUNFLE1BQUosR0FBYSxJQUFiO1VBQ0g7O1FBcEI4QixDQUFuQztNQXNCSCxDQXpCRDtJQTBCSCxDQXJia0I7SUFBQSx5REF1YlMsWUFBMkI7TUFDbkRqQixjQUFBLENBQU1DLFlBQU4sQ0FBbUJpQixpQ0FBbkIsRUFBNkM7UUFBRWxFLE9BQU8sRUFBRSxLQUFLUCxLQUFMLENBQVdPO01BQXRCLENBQTdDO0lBQ0gsQ0F6YmtCO0lBR2YsS0FBSzRCLEtBQUwsR0FBYTtNQUNUdUMsS0FBSyxFQUFFLEVBREU7TUFFVHZFLFlBQVksRUFBRTtJQUZMLENBQWI7RUFJSDs7RUFFRHdFLGlCQUFpQixHQUFHO0lBQ2hCLElBQUksQ0FBQyxLQUFLM0UsS0FBTCxDQUFXNEUsU0FBaEIsRUFBMkI7TUFDdkIsS0FBS0MsZUFBTDtJQUNIO0VBQ0o7O0VBRU9BLGVBQWUsR0FBUztJQUM1QixNQUFNQyxlQUFlLEdBQUdDLHNCQUFBLENBQWNDLFFBQWQsQ0FBdUIscUJBQXZCLENBQXhCOztJQUNBLEtBQUtDLGdCQUFMLENBQXNCLENBQUMsS0FBS0MsVUFBTCxDQUFnQkMsT0FBakIsQ0FBdEIsRUFGNEIsQ0FJNUI7SUFDQTtJQUNBOztJQUNBLElBQUFDLHFCQUFBLEVBQWEsQ0FBQyxLQUFLRixVQUFMLENBQWdCQyxPQUFqQixDQUFiLEVBQXdDLEtBQUtuRixLQUFMLENBQVdPLE9BQW5ELEVBQTRELEtBQUs4RSxLQUFqRTtJQUNBQyxTQUFTLENBQUNDLGNBQVYsQ0FBeUIsS0FBS0wsVUFBTCxDQUFnQkMsT0FBekM7SUFFQSxLQUFLSyxtQkFBTCxHQVY0QixDQVk1QjtJQUNBO0lBQ0E7O0lBQ0EsSUFBQUMsMkJBQUEsRUFBZ0IsQ0FBQyxLQUFLUCxVQUFMLENBQWdCQyxPQUFqQixDQUFoQixFQUEyQyxLQUFLRSxLQUFoRCxFQUF1RCxLQUFLSyxRQUE1RDs7SUFFQSxJQUFJLEtBQUsxRixLQUFMLENBQVdPLE9BQVgsQ0FBbUJvRixVQUFuQixHQUFnQ0MsTUFBaEMsS0FBMkMsd0JBQS9DLEVBQXlFO01BQ3JFO01BQ0EsTUFBTUMsSUFBSSxHQUFJQyxpQkFBQSxDQUFTQyxXQUFULENBQXFCLElBQXJCLENBQUQsQ0FBd0NDLG9CQUF4QyxDQUE2RCxLQUE3RCxDQUFiOztNQUNBLElBQUlILElBQUksQ0FBQ0ksTUFBTCxHQUFjLENBQWxCLEVBQXFCO1FBQ2pCLEtBQUssSUFBSUMsQ0FBQyxHQUFHLENBQWIsRUFBZ0JBLENBQUMsR0FBR0wsSUFBSSxDQUFDSSxNQUF6QixFQUFpQ0MsQ0FBQyxFQUFsQyxFQUFzQztVQUNsQztVQUNBO1VBQ0EsSUFBSUwsSUFBSSxDQUFDSyxDQUFELENBQUosQ0FBUUMsYUFBUixDQUFzQjNFLFNBQXRCLElBQW1DLDRCQUF2QyxFQUFxRSxTQUhuQyxDQUlsQzs7VUFDQSxJQUFJcUUsSUFBSSxDQUFDSyxDQUFELENBQUosQ0FBUUYsb0JBQVIsQ0FBNkIsTUFBN0IsRUFBcUNDLE1BQXJDLElBQStDLENBQW5ELEVBQXNEO1lBQ2xELEtBQUtHLGNBQUwsQ0FBb0JQLElBQUksQ0FBQ0ssQ0FBRCxDQUF4QjtVQUNILENBUGlDLENBUWxDO1VBQ0E7OztVQUNBLE1BQU1HLEdBQUcsR0FBRyxLQUFLQyxTQUFMLENBQWVULElBQUksQ0FBQ0ssQ0FBRCxDQUFuQixDQUFaO1VBQ0EsS0FBS0ssd0JBQUwsQ0FBOEJWLElBQUksQ0FBQ0ssQ0FBRCxDQUFsQztVQUNBLEtBQUtNLHNCQUFMLENBQTRCSCxHQUE1QixFQUFpQ1IsSUFBSSxDQUFDSyxDQUFELENBQXJDO1VBQ0EsS0FBS08saUJBQUwsQ0FBdUJKLEdBQXZCOztVQUNBLElBQUl2QixlQUFKLEVBQXFCO1lBQ2pCLEtBQUs0QixjQUFMLENBQW9CYixJQUFJLENBQUNLLENBQUQsQ0FBeEI7VUFDSDtRQUNKO01BQ0osQ0F0Qm9FLENBdUJyRTs7O01BQ0EsTUFBTVMsS0FBSyxHQUFJYixpQkFBQSxDQUFTQyxXQUFULENBQXFCLElBQXJCLENBQUQsQ0FBd0NDLG9CQUF4QyxDQUE2RCxNQUE3RCxDQUFkOztNQUNBLElBQUlXLEtBQUssQ0FBQ1YsTUFBTixHQUFlLENBQW5CLEVBQXNCO1FBQ2xCO1FBQ0E7UUFDQVcsVUFBVSxDQUFDLE1BQU07VUFDYixJQUFJLEtBQUtDLFNBQVQsRUFBb0I7O1VBQ3BCLEtBQUssSUFBSVgsQ0FBQyxHQUFHLENBQWIsRUFBZ0JBLENBQUMsR0FBR1MsS0FBSyxDQUFDVixNQUExQixFQUFrQ0MsQ0FBQyxFQUFuQyxFQUF1QztZQUNuQyxLQUFLWSxhQUFMLENBQW1CSCxLQUFLLENBQUNULENBQUQsQ0FBeEI7VUFDSDtRQUNKLENBTFMsRUFLUCxFQUxPLENBQVY7TUFNSDtJQUNKO0VBQ0o7O0VBRU9FLGNBQWMsQ0FBQ1csR0FBRCxFQUE0QjtJQUM5QyxNQUFNQyxJQUFJLEdBQUdDLFFBQVEsQ0FBQ0MsYUFBVCxDQUF1QixNQUF2QixDQUFiO0lBQ0FGLElBQUksQ0FBQ0csTUFBTCxDQUFZLEdBQUdKLEdBQUcsQ0FBQ0ssVUFBbkI7SUFDQUwsR0FBRyxDQUFDTSxXQUFKLENBQWdCTCxJQUFoQjtFQUNIOztFQUVPUixzQkFBc0IsQ0FBQ0gsR0FBRCxFQUFzQlUsR0FBdEIsRUFBaUQ7SUFDM0U7SUFDQTtJQUNBO0lBQ0EsTUFBTU8sb0JBQW9CLEdBQUdDLElBQUksQ0FBQ0MsS0FBTCxDQUFXVCxHQUFHLENBQUNVLFlBQUosR0FBbUJDLGdCQUFBLENBQVFDLFFBQVIsQ0FBaUJDLFlBQXBDLEdBQW1ELEdBQTlELENBQTdCLENBSjJFLENBSzNFOztJQUNBLElBQUlOLG9CQUFvQixHQUFHLEVBQTNCLEVBQStCO0lBRS9CLE1BQU16RCxNQUFNLEdBQUdvRCxRQUFRLENBQUNDLGFBQVQsQ0FBdUIsTUFBdkIsQ0FBZjtJQUNBckQsTUFBTSxDQUFDckMsU0FBUCxHQUFtQixzQkFBbkI7O0lBQ0EsSUFBSXVGLEdBQUcsQ0FBQ3ZGLFNBQUosSUFBaUIsaUNBQXJCLEVBQXdEO01BQ3BEcUMsTUFBTSxDQUFDckMsU0FBUCxJQUFvQiwyQkFBcEI7SUFDSCxDQUZELE1BRU87TUFDSHFDLE1BQU0sQ0FBQ3JDLFNBQVAsSUFBb0IsNkJBQXBCO0lBQ0g7O0lBRURxQyxNQUFNLENBQUNnRSxPQUFQLEdBQWlCLFlBQVk7TUFDekJoRSxNQUFNLENBQUNyQyxTQUFQLEdBQW1CLHNCQUFuQjs7TUFDQSxJQUFJdUYsR0FBRyxDQUFDdkYsU0FBSixJQUFpQixpQ0FBckIsRUFBd0Q7UUFDcER1RixHQUFHLENBQUN2RixTQUFKLEdBQWdCLEVBQWhCO1FBQ0FxQyxNQUFNLENBQUNyQyxTQUFQLElBQW9CLDZCQUFwQjtNQUNILENBSEQsTUFHTztRQUNIdUYsR0FBRyxDQUFDdkYsU0FBSixHQUFnQixpQ0FBaEI7UUFDQXFDLE1BQU0sQ0FBQ3JDLFNBQVAsSUFBb0IsMkJBQXBCO01BQ0gsQ0FSd0IsQ0FVekI7TUFDQTs7O01BQ0EsS0FBS3hCLEtBQUwsQ0FBVzhILGVBQVg7SUFDSCxDQWJEOztJQWVBekIsR0FBRyxDQUFDZ0IsV0FBSixDQUFnQnhELE1BQWhCO0VBQ0g7O0VBRU80QyxpQkFBaUIsQ0FBQ0osR0FBRCxFQUE0QjtJQUNqRCxNQUFNeEMsTUFBTSxHQUFHb0QsUUFBUSxDQUFDQyxhQUFULENBQXVCLE1BQXZCLENBQWY7SUFDQXJELE1BQU0sQ0FBQ3JDLFNBQVAsR0FBbUIsOENBQW5CLENBRmlELENBSWpEOztJQUNBLE1BQU11RyxxQkFBcUIsR0FBRzFCLEdBQUcsQ0FBQzJCLHNCQUFKLENBQTJCLHFCQUEzQixDQUE5QjtJQUNBLElBQUlELHFCQUFxQixDQUFDOUIsTUFBdEIsR0FBK0IsQ0FBbkMsRUFBc0NwQyxNQUFNLENBQUNyQyxTQUFQLElBQW9CLDJCQUFwQjs7SUFFdENxQyxNQUFNLENBQUNnRSxPQUFQLEdBQWlCLFlBQVk7TUFDekIsTUFBTUksUUFBUSxHQUFHcEUsTUFBTSxDQUFDc0MsYUFBUCxDQUFxQkgsb0JBQXJCLENBQTBDLE1BQTFDLEVBQWtELENBQWxELENBQWpCO01BQ0EsTUFBTWtDLFVBQVUsR0FBRyxNQUFNLElBQUFDLHNCQUFBLEVBQWNGLFFBQVEsQ0FBQ0csV0FBdkIsQ0FBekI7TUFFQSxNQUFNQyxVQUFVLEdBQUd4RSxNQUFNLENBQUN5RSxxQkFBUCxFQUFuQjtNQUNBLE1BQU07UUFBRUM7TUFBRixJQUFZQyxXQUFXLENBQUNDLFVBQVosQ0FBdUJDLCtCQUF2QixrQ0FDWCxJQUFBQyxxQkFBQSxFQUFVTixVQUFWLEVBQXNCLENBQXRCLENBRFc7UUFFZE8sV0FBVyxFQUFFQyx1QkFBQSxDQUFZQyxJQUZYO1FBR2RDLE9BQU8sRUFBRWIsVUFBVSxHQUFHLElBQUF2RSxtQkFBQSxFQUFHLFNBQUgsQ0FBSCxHQUFtQixJQUFBQSxtQkFBQSxFQUFHLGdCQUFIO01BSHhCLEdBQWxCO01BS0FFLE1BQU0sQ0FBQ21GLFlBQVAsR0FBc0JULEtBQXRCO0lBQ0gsQ0FYRDs7SUFhQWxDLEdBQUcsQ0FBQ2dCLFdBQUosQ0FBZ0J4RCxNQUFoQjtFQUNIOztFQUVPeUMsU0FBUyxDQUFDUyxHQUFELEVBQXNDO0lBQ25ELE1BQU1WLEdBQUcsR0FBR1ksUUFBUSxDQUFDQyxhQUFULENBQXVCLEtBQXZCLENBQVo7SUFDQWIsR0FBRyxDQUFDN0UsU0FBSixHQUFnQiw0QkFBaEIsQ0FGbUQsQ0FJbkQ7O0lBQ0F1RixHQUFHLENBQUNrQyxVQUFKLENBQWVDLFlBQWYsQ0FBNEI3QyxHQUE1QixFQUFpQ1UsR0FBakMsRUFMbUQsQ0FNbkQ7O0lBQ0FWLEdBQUcsQ0FBQ2dCLFdBQUosQ0FBZ0JOLEdBQWhCO0lBRUEsT0FBT1YsR0FBUDtFQUNIOztFQUVPRSx3QkFBd0IsQ0FBQ1EsR0FBRCxFQUE0QjtJQUN4RCxJQUFJLENBQUNoQyxzQkFBQSxDQUFjQyxRQUFkLENBQXVCLHFCQUF2QixDQUFMLEVBQW9EO01BQ2hEK0IsR0FBRyxDQUFDdkYsU0FBSixHQUFnQixpQ0FBaEI7SUFDSDtFQUNKOztFQUVPa0YsY0FBYyxDQUFDSyxHQUFELEVBQTRCO0lBQzlDO0lBQ0EsTUFBTW9DLE1BQU0sR0FBR3BDLEdBQUcsQ0FBQ3FDLFNBQUosQ0FBY0MsT0FBZCxDQUFzQixnQkFBdEIsRUFBd0MsRUFBeEMsRUFBNENDLEtBQTVDLENBQWtELElBQWxELEVBQXdEckQsTUFBdkU7SUFDQSxNQUFNc0QsV0FBVyxHQUFHdEMsUUFBUSxDQUFDQyxhQUFULENBQXVCLE1BQXZCLENBQXBCO0lBQ0FxQyxXQUFXLENBQUMvSCxTQUFaLEdBQXdCLDBCQUF4QixDQUo4QyxDQUs5Qzs7SUFDQSxLQUFLLElBQUkwRSxDQUFDLEdBQUcsQ0FBYixFQUFnQkEsQ0FBQyxJQUFJaUQsTUFBckIsRUFBNkJqRCxDQUFDLEVBQTlCLEVBQWtDO01BQzlCLE1BQU1zRCxDQUFDLEdBQUd2QyxRQUFRLENBQUNDLGFBQVQsQ0FBdUIsTUFBdkIsQ0FBVjtNQUNBc0MsQ0FBQyxDQUFDcEIsV0FBRixHQUFnQmxDLENBQUMsQ0FBQ3VELFFBQUYsRUFBaEI7TUFDQUYsV0FBVyxDQUFDbEMsV0FBWixDQUF3Qm1DLENBQXhCO0lBQ0g7O0lBQ0R6QyxHQUFHLENBQUMyQyxPQUFKLENBQVlILFdBQVo7SUFDQXhDLEdBQUcsQ0FBQ0ksTUFBSixDQUFXRixRQUFRLENBQUNDLGFBQVQsQ0FBdUIsTUFBdkIsQ0FBWDtFQUNIOztFQUVPSixhQUFhLENBQUNFLElBQUQsRUFBMEI7SUFDM0MsSUFBSUEsSUFBSSxDQUFDb0IsV0FBTCxDQUFpQm5DLE1BQWpCLEdBQTBCdEcsb0JBQTlCLEVBQW9EO01BQ2hEZ0ssT0FBTyxDQUFDQyxHQUFSLENBQ0ksZ0RBQ0E1QyxJQUFJLENBQUNvQixXQUFMLENBQWlCbkMsTUFEakIsR0FDMEIsS0FEMUIsR0FDa0N0RyxvQkFEbEMsR0FFQSxxQkFISjtNQUtBO0lBQ0g7O0lBRUQsSUFBSWtLLGNBQUo7O0lBQ0EsS0FBSyxNQUFNQyxFQUFYLElBQWlCOUMsSUFBSSxDQUFDeEYsU0FBTCxDQUFlOEgsS0FBZixDQUFxQixLQUFyQixDQUFqQixFQUE4QztNQUMxQyxJQUFJUSxFQUFFLENBQUNDLFVBQUgsQ0FBYyxXQUFkLENBQUosRUFBZ0M7UUFDNUIsTUFBTUMsU0FBUyxHQUFHRixFQUFFLENBQUNSLEtBQUgsQ0FBUyxHQUFULEVBQWMsQ0FBZCxFQUFpQixDQUFqQixDQUFsQjs7UUFDQSxJQUFJVyxrQkFBQSxDQUFVQyxXQUFWLENBQXNCRixTQUF0QixDQUFKLEVBQXNDO1VBQ2xDSCxjQUFjLEdBQUdHLFNBQWpCO1VBQ0E7UUFDSDtNQUNKO0lBQ0o7O0lBRUQsSUFBSUgsY0FBSixFQUFvQjtNQUNoQjtNQUNBO01BQ0E7TUFDQTtNQUNBN0MsSUFBSSxDQUFDb0MsU0FBTCxHQUFpQmEsa0JBQUEsQ0FBVUEsU0FBVixDQUFvQkosY0FBcEIsRUFBb0M3QyxJQUFJLENBQUNvQixXQUF6QyxFQUFzRCtCLEtBQXZFO0lBQ0gsQ0FORCxNQU1PLElBQ0hwRixzQkFBQSxDQUFjQyxRQUFkLENBQXVCLHdDQUF2QixLQUNBZ0MsSUFBSSxDQUFDYixhQUFMLFlBQThCaUUsY0FGM0IsRUFHTDtNQUNFO01BQ0E7TUFDQTtNQUNBO01BQ0E7TUFDQTtNQUNBO01BQ0FwRCxJQUFJLENBQUNvQyxTQUFMLEdBQWlCYSxrQkFBQSxDQUFVSSxhQUFWLENBQXdCckQsSUFBSSxDQUFDb0IsV0FBN0IsRUFBMEMrQixLQUEzRDtJQUNIO0VBQ0o7O0VBRURHLGtCQUFrQixDQUFDQyxTQUFELEVBQVk7SUFDMUIsSUFBSSxDQUFDLEtBQUt2SyxLQUFMLENBQVc0RSxTQUFoQixFQUEyQjtNQUN2QixNQUFNNEYsY0FBYyxHQUFHRCxTQUFTLENBQUMzRixTQUFWLElBQXVCLENBQUMsS0FBSzVFLEtBQUwsQ0FBVzRFLFNBQTFEO01BQ0EsTUFBTTZGLGdCQUFnQixHQUFHRixTQUFTLENBQUNHLGdCQUFWLEtBQStCLEtBQUsxSyxLQUFMLENBQVcwSyxnQkFBbkU7O01BQ0EsSUFBSUQsZ0JBQWdCLElBQUlELGNBQXhCLEVBQXdDO1FBQ3BDLEtBQUszRixlQUFMO01BQ0g7SUFDSjtFQUNKOztFQUVEOEYsb0JBQW9CLEdBQUc7SUFDbkIsS0FBSzlELFNBQUwsR0FBaUIsSUFBakI7SUFDQSxJQUFBK0QscUJBQUEsRUFBYSxLQUFLdkYsS0FBbEI7SUFDQSxJQUFBd0YsMkJBQUEsRUFBZ0IsS0FBS25GLFFBQXJCO0VBQ0g7O0VBRURvRixxQkFBcUIsQ0FBQ0MsU0FBRCxFQUFZQyxTQUFaLEVBQXVCO0lBQ3hDO0lBRUE7SUFDQSxPQUFRRCxTQUFTLENBQUN4SyxPQUFWLENBQWtCQyxLQUFsQixPQUE4QixLQUFLUixLQUFMLENBQVdPLE9BQVgsQ0FBbUJDLEtBQW5CLEVBQTlCLElBQ0F1SyxTQUFTLENBQUNFLFVBQVYsS0FBeUIsS0FBS2pMLEtBQUwsQ0FBV2lMLFVBRHBDLElBRUFGLFNBQVMsQ0FBQ0wsZ0JBQVYsS0FBK0IsS0FBSzFLLEtBQUwsQ0FBVzBLLGdCQUYxQyxJQUdBSyxTQUFTLENBQUNHLGFBQVYsS0FBNEIsS0FBS2xMLEtBQUwsQ0FBV2tMLGFBSHZDLElBSUFILFNBQVMsQ0FBQ0ksY0FBVixLQUE2QixLQUFLbkwsS0FBTCxDQUFXbUwsY0FKeEMsSUFLQUosU0FBUyxDQUFDbkcsU0FBVixLQUF3QixLQUFLNUUsS0FBTCxDQUFXNEUsU0FMbkMsSUFNQW9HLFNBQVMsQ0FBQ3RHLEtBQVYsS0FBb0IsS0FBS3ZDLEtBQUwsQ0FBV3VDLEtBTi9CLElBT0FzRyxTQUFTLENBQUM3SyxZQUFWLEtBQTJCLEtBQUtnQyxLQUFMLENBQVdoQyxZQVB0QyxJQVFBNEssU0FBUyxDQUFDSyx5Q0FBVixLQUNRLEtBQUtwTCxLQUFMLENBQVdvTCx5Q0FUM0I7RUFVSDs7RUFFTzVGLG1CQUFtQixHQUFTO0lBQ2hDO0lBRUEsSUFBSSxLQUFLeEYsS0FBTCxDQUFXbUwsY0FBZixFQUErQjtNQUMzQjtNQUNBLElBQUl6RyxLQUFLLEdBQUcsS0FBSzJHLFNBQUwsQ0FBZSxDQUFDLEtBQUtuRyxVQUFMLENBQWdCQyxPQUFqQixDQUFmLENBQVo7O01BQ0EsSUFBSVQsS0FBSyxDQUFDdUIsTUFBVixFQUFrQjtRQUNkO1FBQ0F2QixLQUFLLEdBQUc0RyxLQUFLLENBQUNDLElBQU4sQ0FBVyxJQUFJQyxHQUFKLENBQVE5RyxLQUFSLENBQVgsQ0FBUjtRQUNBLEtBQUt4RSxRQUFMLENBQWM7VUFBRXdFO1FBQUYsQ0FBZCxFQUhjLENBS2Q7O1FBQ0EsSUFBSTNDLE1BQU0sQ0FBQzFCLFlBQVgsRUFBeUI7VUFDckIsTUFBTW9MLE1BQU0sR0FBRyxDQUFDLENBQUMxSixNQUFNLENBQUMxQixZQUFQLENBQW9CcUwsT0FBcEIsQ0FBNEIsa0JBQWtCLEtBQUsxTCxLQUFMLENBQVdPLE9BQVgsQ0FBbUJDLEtBQW5CLEVBQTlDLENBQWpCO1VBQ0EsS0FBS04sUUFBTCxDQUFjO1lBQUVDLFlBQVksRUFBRXNMO1VBQWhCLENBQWQ7UUFDSDtNQUNKLENBVkQsTUFVTyxJQUFJLEtBQUt0SixLQUFMLENBQVd1QyxLQUFYLENBQWlCdUIsTUFBckIsRUFBNkI7UUFDaEMsS0FBSy9GLFFBQUwsQ0FBYztVQUFFd0UsS0FBSyxFQUFFO1FBQVQsQ0FBZDtNQUNIO0lBQ0o7RUFDSjs7RUFFT08sZ0JBQWdCLENBQUMwRyxLQUFELEVBQWtDO0lBQ3RELElBQUlDLElBQUksR0FBR0QsS0FBSyxDQUFDLENBQUQsQ0FBaEI7O0lBQ0EsT0FBT0MsSUFBUCxFQUFhO01BQ1QsSUFBSUEsSUFBSSxDQUFDQyxPQUFMLEtBQWlCLE1BQWpCLElBQTJCLE9BQU9ELElBQUksQ0FBQ0UsWUFBTCxDQUFrQixpQkFBbEIsQ0FBUCxLQUFnRCxRQUEvRSxFQUF5RjtRQUNyRixNQUFNQyxnQkFBZ0IsR0FBRzlFLFFBQVEsQ0FBQ0MsYUFBVCxDQUF1QixNQUF2QixDQUF6QjtRQUVBLE1BQU04RSxNQUFNLEdBQUdKLElBQUksQ0FBQ0UsWUFBTCxDQUFrQixpQkFBbEIsQ0FBZjtRQUNBRixJQUFJLENBQUNLLGVBQUwsQ0FBcUIsaUJBQXJCLEVBSnFGLENBSTVDOztRQUN6QyxNQUFNQyxPQUFPLGdCQUFHLDZCQUFDLGdCQUFEO1VBQVMsTUFBTSxFQUFFRixNQUFqQjtVQUF5QixXQUFXLEVBQUVKLElBQUksQ0FBQ087UUFBM0MsRUFBaEI7O1FBRUFyRyxpQkFBQSxDQUFTc0csTUFBVCxDQUFnQkYsT0FBaEIsRUFBeUJILGdCQUF6Qjs7UUFDQUgsSUFBSSxDQUFDM0MsVUFBTCxDQUFnQkMsWUFBaEIsQ0FBNkI2QyxnQkFBN0IsRUFBK0NILElBQS9DO1FBRUFBLElBQUksR0FBR0csZ0JBQVA7TUFDSDs7TUFFRCxJQUFJSCxJQUFJLENBQUN4RSxVQUFMLElBQW1Cd0UsSUFBSSxDQUFDeEUsVUFBTCxDQUFnQm5CLE1BQXZDLEVBQStDO1FBQzNDLEtBQUtoQixnQkFBTCxDQUFzQjJHLElBQUksQ0FBQ3hFLFVBQTNCO01BQ0g7O01BRUR3RSxJQUFJLEdBQUdBLElBQUksQ0FBQ1MsV0FBWjtJQUNIO0VBQ0o7O0VBRU9oQixTQUFTLENBQUNNLEtBQUQsRUFBc0M7SUFDbkQsSUFBSWpILEtBQWUsR0FBRyxFQUF0Qjs7SUFFQSxLQUFLLElBQUl3QixDQUFDLEdBQUcsQ0FBYixFQUFnQkEsQ0FBQyxHQUFHeUYsS0FBSyxDQUFDMUYsTUFBMUIsRUFBa0NDLENBQUMsRUFBbkMsRUFBdUM7TUFDbkMsTUFBTTBGLElBQUksR0FBR0QsS0FBSyxDQUFDekYsQ0FBRCxDQUFsQjs7TUFDQSxJQUFJMEYsSUFBSSxDQUFDQyxPQUFMLEtBQWlCLEdBQWpCLElBQXdCRCxJQUFJLENBQUNFLFlBQUwsQ0FBa0IsTUFBbEIsQ0FBNUIsRUFBdUQ7UUFDbkQsSUFBSSxLQUFLUSxpQkFBTCxDQUF1QlYsSUFBdkIsQ0FBSixFQUFrQztVQUM5QmxILEtBQUssQ0FBQzZILElBQU4sQ0FBV1gsSUFBSSxDQUFDRSxZQUFMLENBQWtCLE1BQWxCLENBQVg7UUFDSDtNQUNKLENBSkQsTUFJTyxJQUFJRixJQUFJLENBQUNDLE9BQUwsS0FBaUIsS0FBakIsSUFBMEJELElBQUksQ0FBQ0MsT0FBTCxLQUFpQixNQUEzQyxJQUNIRCxJQUFJLENBQUNDLE9BQUwsS0FBaUIsWUFEbEIsRUFDZ0M7UUFDbkM7TUFDSCxDQUhNLE1BR0EsSUFBSUQsSUFBSSxDQUFDWSxRQUFMLElBQWlCWixJQUFJLENBQUNZLFFBQUwsQ0FBY3ZHLE1BQW5DLEVBQTJDO1FBQzlDdkIsS0FBSyxHQUFHQSxLQUFLLENBQUMrSCxNQUFOLENBQWEsS0FBS3BCLFNBQUwsQ0FBZU8sSUFBSSxDQUFDWSxRQUFwQixDQUFiLENBQVI7TUFDSDtJQUNKOztJQUNELE9BQU85SCxLQUFQO0VBQ0g7O0VBRU80SCxpQkFBaUIsQ0FBQ1YsSUFBRCxFQUF5QjtJQUM5QztJQUNBLElBQUksQ0FBQ0EsSUFBSSxDQUFDRSxZQUFMLENBQWtCLE1BQWxCLEVBQTBCL0IsVUFBMUIsQ0FBcUMsU0FBckMsQ0FBRCxJQUNBLENBQUM2QixJQUFJLENBQUNFLFlBQUwsQ0FBa0IsTUFBbEIsRUFBMEIvQixVQUExQixDQUFxQyxVQUFyQyxDQURMLEVBQ3VEO01BQ25ELE9BQU8sS0FBUDtJQUNILENBTDZDLENBTzlDO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7OztJQUNBLElBQUk2QixJQUFJLENBQUN4RCxXQUFMLENBQWlCc0UsT0FBakIsQ0FBeUIsR0FBekIsSUFBZ0MsQ0FBQyxDQUFyQyxFQUF3QztNQUNwQyxPQUFPLElBQVA7SUFDSCxDQUZELE1BRU87TUFDSCxNQUFNQyxHQUFHLEdBQUdmLElBQUksQ0FBQ0UsWUFBTCxDQUFrQixNQUFsQixDQUFaO01BQ0EsTUFBTWMsSUFBSSxHQUFHRCxHQUFHLENBQUNFLEtBQUosQ0FBVSx5QkFBVixFQUFxQyxDQUFyQyxDQUFiLENBRkcsQ0FJSDtNQUNBO01BQ0E7O01BQ0EsSUFBSSxJQUFBQywyQkFBQSxFQUFnQkYsSUFBaEIsQ0FBSixFQUEyQixPQUFPLEtBQVA7O01BRTNCLElBQUloQixJQUFJLENBQUN4RCxXQUFMLENBQWlCMkUsV0FBakIsR0FBK0JDLElBQS9CLEdBQXNDakQsVUFBdEMsQ0FBaUQ2QyxJQUFJLENBQUNHLFdBQUwsRUFBakQsQ0FBSixFQUEwRTtRQUN0RTtRQUNBLE9BQU8sS0FBUDtNQUNILENBSEQsTUFHTztRQUNIO1FBQ0EsT0FBTyxJQUFQO01BQ0g7SUFDSjtFQUNKOztFQTBHT0Usa0JBQWtCLEdBQUc7SUFDekIsTUFBTUMsSUFBSSxHQUFHLEtBQUtsTixLQUFMLENBQVdPLE9BQVgsQ0FBbUI0TSxrQkFBbkIsRUFBYjtJQUNBLE1BQU1DLFVBQVUsR0FBR0YsSUFBSSxJQUFJLElBQUFHLHFCQUFBLEVBQVdILElBQVgsQ0FBM0I7O0lBRUEsTUFBTUksT0FBTyxnQkFBRyx1REFDWjtNQUFLLFNBQVMsRUFBQztJQUFmLEdBQ00sSUFBQTNKLG1CQUFBLEVBQUcsb0JBQUgsRUFBeUI7TUFBRXVKLElBQUksRUFBRUU7SUFBUixDQUF6QixDQUROLENBRFksZUFJWjtNQUFLLFNBQVMsRUFBQztJQUFmLEdBQ00sSUFBQXpKLG1CQUFBLEVBQUcscUJBQUgsQ0FETixDQUpZLENBQWhCOztJQVNBLG9CQUNJLDZCQUFDLGdDQUFEO01BQ0ksU0FBUyxFQUFDLHFCQURkO01BRUksT0FBTyxFQUFFLEtBQUs0SixpQkFGbEI7TUFHSSxLQUFLLEVBQUUsSUFBQTVKLG1CQUFBLEVBQUcsMENBQUgsRUFBK0M7UUFBRXVKLElBQUksRUFBRUU7TUFBUixDQUEvQyxDQUhYO01BSUksT0FBTyxFQUFFRTtJQUpiLGdCQU1JLDJDQUFTLElBQUcsSUFBQTNKLG1CQUFBLEVBQUcsUUFBSCxDQUFhLEdBQXpCLENBTkosQ0FESjtFQVVIO0VBRUQ7QUFDSjtBQUNBO0FBQ0E7OztFQUNZNkosNkJBQTZCLEdBQUc7SUFDcEMsSUFBSUMsSUFBSjtJQUNBLE1BQU1DLFVBQVUsR0FBRyxLQUFLMU4sS0FBTCxDQUFXTyxPQUFYLENBQW1Cb04saUJBQW5CLEVBQW5COztJQUNBLFFBQVFELFVBQVUsQ0FBQ0UsT0FBbkI7TUFDSSxLQUFLLElBQUw7UUFDSSxNQUFNLElBQUlDLEtBQUosQ0FBVSx5RUFBVixDQUFOOztNQUNKLEtBQUssS0FBTDtRQUNJLElBQUlILFVBQVUsQ0FBQzFCLE1BQWYsRUFBdUI7VUFDbkJ5QixJQUFJLEdBQUcsSUFBQTlKLG1CQUFBLEVBQUcsd0NBQUgsRUFBNkM7WUFBRXFJLE1BQU0sRUFBRTBCLFVBQVUsQ0FBQzFCO1VBQXJCLENBQTdDLENBQVA7UUFDSCxDQUZELE1BRU87VUFDSHlCLElBQUksR0FBRyxJQUFBOUosbUJBQUEsRUFBRyw0QkFBSCxDQUFQO1FBQ0g7O1FBQ0Q7SUFUUjs7SUFXQSxvQkFDSTtNQUFNLFNBQVMsRUFBQztJQUFoQixHQUFvRCxJQUFHOEosSUFBSyxHQUE1RCxDQURKO0VBR0g7O0VBRURyQixNQUFNLEdBQUc7SUFDTCxJQUFJLEtBQUtwTSxLQUFMLENBQVc0RSxTQUFmLEVBQTBCO01BQ3RCLG9CQUFPLDZCQUFDLDRCQUFEO1FBQXFCLFNBQVMsRUFBRSxLQUFLNUUsS0FBTCxDQUFXNEUsU0FBM0M7UUFBc0QsU0FBUyxFQUFDO01BQWhFLEVBQVA7SUFDSDs7SUFDRCxNQUFNckUsT0FBTyxHQUFHLEtBQUtQLEtBQUwsQ0FBV08sT0FBM0I7SUFDQSxNQUFNdU4sT0FBTyxHQUFHdk4sT0FBTyxDQUFDb0YsVUFBUixFQUFoQjtJQUNBLElBQUlvSSxRQUFRLEdBQUcsS0FBZjtJQUNBLElBQUlDLE9BQU8sR0FBRyxLQUFkLENBUEssQ0FTTDs7SUFDQSxNQUFNQyxVQUFVLEdBQUcsQ0FBQzFOLE9BQU8sQ0FBQzJOLGNBQVIsRUFBRCxJQUE2QixDQUFDLENBQUMsSUFBQUMsdUJBQUEsRUFBaUI1TixPQUFqQixDQUFsRDtJQUNBLElBQUk2TixJQUFKOztJQUNBLElBQUlySixzQkFBQSxDQUFjc0osU0FBZCxDQUF3QiwyQkFBeEIsQ0FBSixFQUEwRDtNQUN0RCxNQUFNQyxLQUFLLEdBQUcsS0FBS3RPLEtBQUwsQ0FBV08sT0FBWCxDQUFtQmdPLHVCQUFqQzs7TUFDQSxJQUFJRCxLQUFLLEVBQUVFLGNBQVAsQ0FBc0JDLDBCQUF0QixDQUFKLEVBQXNDO1FBQ2xDVCxPQUFPLEdBQUcsSUFBQVUsNEJBQUEsRUFBWUosS0FBSyxDQUFDSyxVQUFsQixFQUE4QkMsOEJBQUEsQ0FBY0MsS0FBNUMsQ0FBVjtRQUNBZCxRQUFRLEdBQUcsSUFBQVcsNEJBQUEsRUFBWUosS0FBSyxDQUFDSyxVQUFsQixFQUE4QkMsOEJBQUEsQ0FBY0UsTUFBNUMsQ0FBWDtRQUNBVixJQUFJLEdBQUc5SSxTQUFTLENBQUN5SixVQUFWLENBQXFCO1VBQ3hCWCxJQUFJLEVBQUVFLEtBQUssQ0FBQ2IsSUFEWTtVQUV4QjdILE1BQU0sRUFBRTBJLEtBQUssQ0FBQ1UsSUFBTixHQUFhLHdCQUFiLEdBQXdDQyxTQUZ4QjtVQUd4QkMsY0FBYyxFQUFFWixLQUFLLENBQUNVLElBSEU7VUFJeEJHLE9BQU8sRUFBRUMsY0FBQSxDQUFRQztRQUpPLENBQXJCLEVBS0osS0FBS3JQLEtBQUwsQ0FBV2lMLFVBTFAsRUFLbUI7VUFDdEJxRSxlQUFlLEVBQUV0QixPQUFPLElBQ2pCLENBQUNqSixzQkFBQSxDQUFjQyxRQUFkLENBQWdDLDRCQUFoQyxDQUZjO1VBR3RCO1VBQ0F1SyxrQkFBa0IsRUFBRXRCLFVBSkU7VUFLdEJ1QixHQUFHLEVBQUUsS0FBS3RLLFVBTFk7VUFNdEJ1SyxZQUFZLEVBQUU7UUFOUSxDQUxuQixDQUFQO01BYUg7SUFDSjs7SUFDRCxJQUFJLENBQUNyQixJQUFMLEVBQVc7TUFDUEosT0FBTyxHQUFHRixPQUFPLENBQUNxQixPQUFSLEtBQW9CQyxjQUFBLENBQVFQLEtBQXRDO01BQ0FkLFFBQVEsR0FBR0QsT0FBTyxDQUFDcUIsT0FBUixLQUFvQkMsY0FBQSxDQUFRTixNQUF2QztNQUNBVixJQUFJLEdBQUc5SSxTQUFTLENBQUN5SixVQUFWLENBQXFCakIsT0FBckIsRUFBOEIsS0FBSzlOLEtBQUwsQ0FBV2lMLFVBQXpDLEVBQXFEO1FBQ3hEcUUsZUFBZSxFQUFFdEIsT0FBTyxJQUNqQixDQUFDakosc0JBQUEsQ0FBY0MsUUFBZCxDQUFnQyw0QkFBaEMsQ0FGZ0Q7UUFHeEQ7UUFDQXVLLGtCQUFrQixFQUFFdEIsVUFKb0M7UUFLeER1QixHQUFHLEVBQUUsS0FBS3RLLFVBTDhDO1FBTXhEdUssWUFBWSxFQUFFO01BTjBDLENBQXJELENBQVA7SUFRSDs7SUFDRCxJQUFJLEtBQUt6UCxLQUFMLENBQVcwSyxnQkFBZixFQUFpQztNQUM3QjBELElBQUksZ0JBQUcsNERBQ0RBLElBREMsRUFFRCxLQUFLbkIsa0JBQUwsRUFGQyxDQUFQO0lBSUg7O0lBQ0QsSUFBSSxLQUFLak4sS0FBTCxDQUFXb0wseUNBQWYsRUFBMEQ7TUFDdERnRCxJQUFJLGdCQUFHLDREQUNEQSxJQURDLEVBRUQsS0FBS1osNkJBQUwsRUFGQyxDQUFQO0lBSUg7O0lBRUQsSUFBSSxLQUFLeE4sS0FBTCxDQUFXa0wsYUFBZixFQUE4QjtNQUMxQmtELElBQUksZ0JBQUc7UUFBRyxJQUFJLEVBQUUsS0FBS3BPLEtBQUwsQ0FBV2tMO01BQXBCLEdBQXFDa0QsSUFBckMsQ0FBUDtJQUNILENBRkQsTUFFTyxJQUFJTixPQUFPLENBQUM0QixJQUFSLElBQWdCLE9BQU81QixPQUFPLENBQUM0QixJQUFSLENBQWEsNkJBQWIsQ0FBUCxLQUF1RCxRQUEzRSxFQUFxRjtNQUN4RnRCLElBQUksZ0JBQ0EsNkJBQUMseUJBQUQ7UUFDSSxJQUFJLEVBQUMsYUFEVDtRQUVJLE9BQU8sRUFBRSxLQUFLdUIsa0JBQUwsQ0FBd0JDLElBQXhCLENBQTZCLElBQTdCLEVBQW1DOUIsT0FBTyxDQUFDNEIsSUFBUixDQUFhLDZCQUFiLENBQW5DO01BRmIsR0FJTXRCLElBSk4sQ0FESjtJQVFIOztJQUVELElBQUl5QixPQUFKOztJQUNBLElBQUksS0FBSzFOLEtBQUwsQ0FBV3VDLEtBQVgsQ0FBaUJ1QixNQUFqQixJQUEyQixDQUFDLEtBQUs5RCxLQUFMLENBQVdoQyxZQUF2QyxJQUF1RCxLQUFLSCxLQUFMLENBQVdtTCxjQUF0RSxFQUFzRjtNQUNsRjBFLE9BQU8sZ0JBQUcsNkJBQUMseUJBQUQ7UUFDTixLQUFLLEVBQUUsS0FBSzFOLEtBQUwsQ0FBV3VDLEtBRFo7UUFFTixPQUFPLEVBQUUsS0FBSzFFLEtBQUwsQ0FBV08sT0FGZDtRQUdOLGFBQWEsRUFBRSxLQUFLdVAsYUFIZDtRQUlOLGVBQWUsRUFBRSxLQUFLOVAsS0FBTCxDQUFXOEg7TUFKdEIsRUFBVjtJQU1IOztJQUVELElBQUlrRyxPQUFKLEVBQWE7TUFDVCxvQkFDSTtRQUFLLFNBQVMsRUFBQyxvQ0FBZjtRQUNJLE9BQU8sRUFBRSxLQUFLK0I7TUFEbEIseUJBSUk7UUFDSSxTQUFTLEVBQUMsc0JBRGQ7UUFFSSxPQUFPLEVBQUUsS0FBS0M7TUFGbEIsR0FJTXpQLE9BQU8sQ0FBQzBQLE1BQVIsR0FBaUIxUCxPQUFPLENBQUMwUCxNQUFSLENBQWVDLElBQWhDLEdBQXVDM1AsT0FBTyxDQUFDUyxTQUFSLEVBSjdDLENBSkosVUFXTW9OLElBWE4sRUFZTXlCLE9BWk4sQ0FESjtJQWdCSDs7SUFDRCxJQUFJOUIsUUFBSixFQUFjO01BQ1Ysb0JBQ0k7UUFBSyxTQUFTLEVBQUMscUNBQWY7UUFDSSxPQUFPLEVBQUUsS0FBS2dDO01BRGxCLEdBR00zQixJQUhOLEVBSU15QixPQUpOLENBREo7SUFRSDs7SUFDRCxvQkFDSTtNQUFLLFNBQVMsRUFBQyxtQ0FBZjtNQUFtRCxPQUFPLEVBQUUsS0FBS0U7SUFBakUsR0FDTTNCLElBRE4sRUFFTXlCLE9BRk4sQ0FESjtFQU1IOztBQXZtQndFOzs7OEJBQXhEalEsVyxpQkFPSXVRLG9CIn0=