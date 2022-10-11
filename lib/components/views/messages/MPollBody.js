"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.UserVote = void 0;
exports.allVotes = allVotes;
exports.createVoteRelations = createVoteRelations;
exports.default = void 0;
exports.findTopAnswer = findTopAnswer;
exports.isPollEnded = isPollEnded;
exports.launchPollEditor = launchPollEditor;
exports.pollAlreadyHasVotes = pollAlreadyHasVotes;
exports.pollEndTs = pollEndTs;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireDefault(require("react"));

var _classnames = _interopRequireDefault(require("classnames"));

var _event = require("matrix-js-sdk/src/models/event");

var _relations = require("matrix-js-sdk/src/models/relations");

var _matrixEventsSdk = require("matrix-events-sdk");

var _relatedRelations = require("matrix-js-sdk/src/models/related-relations");

var _languageHandler = require("../../../languageHandler");

var _Modal = _interopRequireDefault(require("../../../Modal"));

var _FormattingUtils = require("../../../utils/FormattingUtils");

var _StyledRadioButton = _interopRequireDefault(require("../elements/StyledRadioButton"));

var _MatrixClientContext = _interopRequireDefault(require("../../../contexts/MatrixClientContext"));

var _ErrorDialog = _interopRequireDefault(require("../dialogs/ErrorDialog"));

var _PollCreateDialog = _interopRequireDefault(require("../elements/PollCreateDialog"));

var _MatrixClientPeg = require("../../../MatrixClientPeg");

/*
Copyright 2021 The Matrix.org Foundation C.I.C.

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
function createVoteRelations(getRelationsForEvent, eventId) {
  return new _relatedRelations.RelatedRelations([getRelationsForEvent(eventId, "m.reference", _matrixEventsSdk.M_POLL_RESPONSE.name), getRelationsForEvent(eventId, "m.reference", _matrixEventsSdk.M_POLL_RESPONSE.altName)]);
}

function findTopAnswer(pollEvent, matrixClient, getRelationsForEvent) {
  if (!getRelationsForEvent) {
    return "";
  }

  const poll = pollEvent.unstableExtensibleEvent;

  if (!poll?.isEquivalentTo(_matrixEventsSdk.M_POLL_START)) {
    console.warn("Failed to parse poll to determine top answer - assuming no best answer");
    return "";
  }

  const findAnswerText = answerId => {
    return poll.answers.find(a => a.id === answerId)?.text ?? "";
  };

  const voteRelations = createVoteRelations(getRelationsForEvent, pollEvent.getId());
  const endRelations = new _relatedRelations.RelatedRelations([getRelationsForEvent(pollEvent.getId(), "m.reference", _matrixEventsSdk.M_POLL_END.name), getRelationsForEvent(pollEvent.getId(), "m.reference", _matrixEventsSdk.M_POLL_END.altName)]);
  const userVotes = collectUserVotes(allVotes(pollEvent, matrixClient, voteRelations, endRelations), matrixClient.getUserId(), null);
  const votes = countVotes(userVotes, poll);
  const highestScore = Math.max(...votes.values());
  const bestAnswerIds = [];

  for (const [answerId, score] of votes) {
    if (score == highestScore) {
      bestAnswerIds.push(answerId);
    }
  }

  const bestAnswerTexts = bestAnswerIds.map(findAnswerText);
  return (0, _FormattingUtils.formatCommaSeparatedList)(bestAnswerTexts, 3);
}

function isPollEnded(pollEvent, matrixClient, getRelationsForEvent) {
  if (!getRelationsForEvent) {
    return false;
  }

  const roomCurrentState = matrixClient.getRoom(pollEvent.getRoomId()).currentState;

  function userCanRedact(endEvent) {
    return roomCurrentState.maySendRedactionForEvent(pollEvent, endEvent.getSender());
  }

  const endRelations = new _relatedRelations.RelatedRelations([getRelationsForEvent(pollEvent.getId(), "m.reference", _matrixEventsSdk.M_POLL_END.name), getRelationsForEvent(pollEvent.getId(), "m.reference", _matrixEventsSdk.M_POLL_END.altName)]);

  if (!endRelations) {
    return false;
  }

  const authorisedRelations = endRelations.getRelations().filter(userCanRedact);
  return authorisedRelations.length > 0;
}

function pollAlreadyHasVotes(mxEvent, getRelationsForEvent) {
  if (!getRelationsForEvent) return false;
  const voteRelations = createVoteRelations(getRelationsForEvent, mxEvent.getId());
  return voteRelations.getRelations().length > 0;
}

function launchPollEditor(mxEvent, getRelationsForEvent) {
  if (pollAlreadyHasVotes(mxEvent, getRelationsForEvent)) {
    _Modal.default.createDialog(_ErrorDialog.default, {
      title: (0, _languageHandler._t)("Can't edit poll"),
      description: (0, _languageHandler._t)("Sorry, you can't edit a poll after votes have been cast.")
    });
  } else {
    _Modal.default.createDialog(_PollCreateDialog.default, {
      room: _MatrixClientPeg.MatrixClientPeg.get().getRoom(mxEvent.getRoomId()),
      threadId: mxEvent.getThread()?.id ?? null,
      editingMxEvent: mxEvent
    }, 'mx_CompoundDialog', false, // isPriorityModal
    true // isStaticModal
    );
  }
}

class MPollBody extends _react.default.Component {
  // Events we have already seen
  constructor(props) {
    super(props);
    (0, _defineProperty2.default)(this, "context", void 0);
    (0, _defineProperty2.default)(this, "seenEventIds", []);
    (0, _defineProperty2.default)(this, "voteRelationsReceived", false);
    (0, _defineProperty2.default)(this, "endRelationsReceived", false);
    (0, _defineProperty2.default)(this, "onRelationsCreated", (relationType, eventType) => {
      if (relationType !== "m.reference") {
        return;
      }

      if (_matrixEventsSdk.M_POLL_RESPONSE.matches(eventType)) {
        this.voteRelationsReceived = true;
        const newVoteRelations = this.fetchVoteRelations();
        this.addListeners(newVoteRelations);
        this.removeListeners(this.state.voteRelations);
        this.setState({
          voteRelations: newVoteRelations
        });
      } else if (_matrixEventsSdk.M_POLL_END.matches(eventType)) {
        this.endRelationsReceived = true;
        const newEndRelations = this.fetchEndRelations();
        this.addListeners(newEndRelations);
        this.removeListeners(this.state.endRelations);
        this.setState({
          endRelations: newEndRelations
        });
      }

      if (this.voteRelationsReceived && this.endRelationsReceived) {
        this.props.mxEvent.removeListener(_event.MatrixEventEvent.RelationsCreated, this.onRelationsCreated);
      }
    });
    (0, _defineProperty2.default)(this, "onRelationsChange", () => {
      // We hold Relations in our state, and they changed under us.
      // Check whether we should delete our selection, and then
      // re-render.
      // Note: re-rendering is a side effect of unselectIfNewEventFromMe().
      this.unselectIfNewEventFromMe();
    });
    (0, _defineProperty2.default)(this, "onOptionSelected", e => {
      this.selectOption(e.currentTarget.value);
    });
    this.state = {
      selected: null,
      voteRelations: this.fetchVoteRelations(),
      endRelations: this.fetchEndRelations()
    };
    this.addListeners(this.state.voteRelations, this.state.endRelations);
    this.props.mxEvent.on(_event.MatrixEventEvent.RelationsCreated, this.onRelationsCreated);
  }

  componentWillUnmount() {
    this.props.mxEvent.off(_event.MatrixEventEvent.RelationsCreated, this.onRelationsCreated);
    this.removeListeners(this.state.voteRelations, this.state.endRelations);
  }

  addListeners(voteRelations, endRelations) {
    if (voteRelations) {
      voteRelations.on(_relations.RelationsEvent.Add, this.onRelationsChange);
      voteRelations.on(_relations.RelationsEvent.Remove, this.onRelationsChange);
      voteRelations.on(_relations.RelationsEvent.Redaction, this.onRelationsChange);
    }

    if (endRelations) {
      endRelations.on(_relations.RelationsEvent.Add, this.onRelationsChange);
      endRelations.on(_relations.RelationsEvent.Remove, this.onRelationsChange);
      endRelations.on(_relations.RelationsEvent.Redaction, this.onRelationsChange);
    }
  }

  removeListeners(voteRelations, endRelations) {
    if (voteRelations) {
      voteRelations.off(_relations.RelationsEvent.Add, this.onRelationsChange);
      voteRelations.off(_relations.RelationsEvent.Remove, this.onRelationsChange);
      voteRelations.off(_relations.RelationsEvent.Redaction, this.onRelationsChange);
    }

    if (endRelations) {
      endRelations.off(_relations.RelationsEvent.Add, this.onRelationsChange);
      endRelations.off(_relations.RelationsEvent.Remove, this.onRelationsChange);
      endRelations.off(_relations.RelationsEvent.Redaction, this.onRelationsChange);
    }
  }

  selectOption(answerId) {
    if (this.isEnded()) {
      return;
    }

    const userVotes = this.collectUserVotes();
    const userId = this.context.getUserId();
    const myVote = userVotes.get(userId)?.answers[0];

    if (answerId === myVote) {
      return;
    }

    const response = _matrixEventsSdk.PollResponseEvent.from([answerId], this.props.mxEvent.getId()).serialize();

    this.context.sendEvent(this.props.mxEvent.getRoomId(), response.type, response.content).catch(e => {
      console.error("Failed to submit poll response event:", e);

      _Modal.default.createDialog(_ErrorDialog.default, {
        title: (0, _languageHandler._t)("Vote not registered"),
        description: (0, _languageHandler._t)("Sorry, your vote was not registered. Please try again.")
      });
    });
    this.setState({
      selected: answerId
    });
  }

  fetchVoteRelations() {
    return this.fetchRelations(_matrixEventsSdk.M_POLL_RESPONSE);
  }

  fetchEndRelations() {
    return this.fetchRelations(_matrixEventsSdk.M_POLL_END);
  }

  fetchRelations(eventType) {
    if (this.props.getRelationsForEvent) {
      return new _relatedRelations.RelatedRelations([this.props.getRelationsForEvent(this.props.mxEvent.getId(), "m.reference", eventType.name), this.props.getRelationsForEvent(this.props.mxEvent.getId(), "m.reference", eventType.altName)]);
    } else {
      return null;
    }
  }
  /**
   * @returns userId -> UserVote
   */


  collectUserVotes() {
    return collectUserVotes(allVotes(this.props.mxEvent, this.context, this.state.voteRelations, this.state.endRelations), this.context.getUserId(), this.state.selected);
  }
  /**
   * If we've just received a new event that we hadn't seen
   * before, and that event is me voting (e.g. from a different
   * device) then forget when the local user selected.
   *
   * Either way, calls setState to update our list of events we
   * have already seen.
   */


  unselectIfNewEventFromMe() {
    const newEvents = this.state.voteRelations.getRelations().filter(isPollResponse).filter(mxEvent => !this.seenEventIds.includes(mxEvent.getId()));
    let newSelected = this.state.selected;

    if (newEvents.length > 0) {
      for (const mxEvent of newEvents) {
        if (mxEvent.getSender() === this.context.getUserId()) {
          newSelected = null;
        }
      }
    }

    const newEventIds = newEvents.map(mxEvent => mxEvent.getId());
    this.seenEventIds = this.seenEventIds.concat(newEventIds);
    this.setState({
      selected: newSelected
    });
  }

  totalVotes(collectedVotes) {
    let sum = 0;

    for (const v of collectedVotes.values()) {
      sum += v;
    }

    return sum;
  }

  isEnded() {
    return isPollEnded(this.props.mxEvent, this.context, this.props.getRelationsForEvent);
  }

  render() {
    const poll = this.props.mxEvent.unstableExtensibleEvent;
    if (!poll?.isEquivalentTo(_matrixEventsSdk.M_POLL_START)) return null; // invalid

    const ended = this.isEnded();
    const pollId = this.props.mxEvent.getId();
    const userVotes = this.collectUserVotes();
    const votes = countVotes(userVotes, poll);
    const totalVotes = this.totalVotes(votes);
    const winCount = Math.max(...votes.values());
    const userId = this.context.getUserId();
    const myVote = userVotes.get(userId)?.answers[0];

    const disclosed = _matrixEventsSdk.M_POLL_KIND_DISCLOSED.matches(poll.kind.name); // Disclosed: votes are hidden until I vote or the poll ends
    // Undisclosed: votes are hidden until poll ends


    const showResults = ended || disclosed && myVote !== undefined;
    let totalText;

    if (ended) {
      totalText = (0, _languageHandler._t)("Final result based on %(count)s votes", {
        count: totalVotes
      });
    } else if (!disclosed) {
      totalText = (0, _languageHandler._t)("Results will be visible when the poll is ended");
    } else if (myVote === undefined) {
      if (totalVotes === 0) {
        totalText = (0, _languageHandler._t)("No votes cast");
      } else {
        totalText = (0, _languageHandler._t)("%(count)s votes cast. Vote to see the results", {
          count: totalVotes
        });
      }
    } else {
      totalText = (0, _languageHandler._t)("Based on %(count)s votes", {
        count: totalVotes
      });
    }

    const editedSpan = this.props.mxEvent.replacingEvent() ? /*#__PURE__*/_react.default.createElement("span", {
      className: "mx_MPollBody_edited"
    }, " (", (0, _languageHandler._t)("edited"), ")") : null;
    return /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_MPollBody"
    }, /*#__PURE__*/_react.default.createElement("h2", null, poll.question.text, editedSpan), /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_MPollBody_allOptions"
    }, poll.answers.map(answer => {
      let answerVotes = 0;
      let votesText = "";

      if (showResults) {
        answerVotes = votes.get(answer.id) ?? 0;
        votesText = (0, _languageHandler._t)("%(count)s votes", {
          count: answerVotes
        });
      }

      const checked = !ended && myVote === answer.id || ended && answerVotes === winCount;
      const cls = (0, _classnames.default)({
        "mx_MPollBody_option": true,
        "mx_MPollBody_option_checked": checked,
        "mx_MPollBody_option_ended": ended
      });
      const answerPercent = totalVotes === 0 ? 0 : Math.round(100.0 * answerVotes / totalVotes);
      return /*#__PURE__*/_react.default.createElement("div", {
        key: answer.id,
        className: cls,
        onClick: () => this.selectOption(answer.id)
      }, ended ? /*#__PURE__*/_react.default.createElement(EndedPollOption, {
        answer: answer,
        checked: checked,
        votesText: votesText
      }) : /*#__PURE__*/_react.default.createElement(LivePollOption, {
        pollId: pollId,
        answer: answer,
        checked: checked,
        votesText: votesText,
        onOptionSelected: this.onOptionSelected
      }), /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_MPollBody_popularityBackground"
      }, /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_MPollBody_popularityAmount",
        style: {
          "width": `${answerPercent}%`
        }
      })));
    })), /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_MPollBody_totalVotes"
    }, totalText));
  }

}

exports.default = MPollBody;
(0, _defineProperty2.default)(MPollBody, "contextType", _MatrixClientContext.default);

function EndedPollOption(props) {
  const cls = (0, _classnames.default)({
    "mx_MPollBody_endedOption": true,
    "mx_MPollBody_endedOptionWinner": props.checked
  });
  return /*#__PURE__*/_react.default.createElement("div", {
    className: cls,
    "data-value": props.answer.id
  }, /*#__PURE__*/_react.default.createElement("div", {
    className: "mx_MPollBody_optionDescription"
  }, /*#__PURE__*/_react.default.createElement("div", {
    className: "mx_MPollBody_optionText"
  }, props.answer.text), /*#__PURE__*/_react.default.createElement("div", {
    className: "mx_MPollBody_optionVoteCount"
  }, props.votesText)));
}

function LivePollOption(props) {
  return /*#__PURE__*/_react.default.createElement(_StyledRadioButton.default, {
    className: "mx_MPollBody_live-option",
    name: `poll_answer_select-${props.pollId}`,
    value: props.answer.id,
    checked: props.checked,
    onChange: props.onOptionSelected
  }, /*#__PURE__*/_react.default.createElement("div", {
    className: "mx_MPollBody_optionDescription"
  }, /*#__PURE__*/_react.default.createElement("div", {
    className: "mx_MPollBody_optionText"
  }, props.answer.text), /*#__PURE__*/_react.default.createElement("div", {
    className: "mx_MPollBody_optionVoteCount"
  }, props.votesText)));
}

class UserVote {
  constructor(ts, sender, answers) {
    this.ts = ts;
    this.sender = sender;
    this.answers = answers;
  }

}

exports.UserVote = UserVote;

function userResponseFromPollResponseEvent(event) {
  const response = event.unstableExtensibleEvent;

  if (!response?.isEquivalentTo(_matrixEventsSdk.M_POLL_RESPONSE)) {
    throw new Error("Failed to parse Poll Response Event to determine user response");
  }

  return new UserVote(event.getTs(), event.getSender(), response.answerIds);
}

function allVotes(pollEvent, matrixClient, voteRelations, endRelations) {
  const endTs = pollEndTs(pollEvent, matrixClient, endRelations);

  function isOnOrBeforeEnd(responseEvent) {
    // From MSC3381:
    // "Votes sent on or before the end event's timestamp are valid votes"
    return endTs === null || responseEvent.getTs() <= endTs;
  }

  if (voteRelations) {
    return voteRelations.getRelations().filter(isPollResponse).filter(isOnOrBeforeEnd).map(userResponseFromPollResponseEvent);
  } else {
    return [];
  }
}
/**
 * Returns the earliest timestamp from the supplied list of end_poll events
 * or null if there are no authorised events.
 */


function pollEndTs(pollEvent, matrixClient, endRelations) {
  if (!endRelations) {
    return null;
  }

  const roomCurrentState = matrixClient.getRoom(pollEvent.getRoomId()).currentState;

  function userCanRedact(endEvent) {
    return roomCurrentState.maySendRedactionForEvent(pollEvent, endEvent.getSender());
  }

  const tss = endRelations.getRelations().filter(userCanRedact).map(evt => evt.getTs());

  if (tss.length === 0) {
    return null;
  } else {
    return Math.min(...tss);
  }
}

function isPollResponse(responseEvent) {
  return responseEvent.unstableExtensibleEvent?.isEquivalentTo(_matrixEventsSdk.M_POLL_RESPONSE);
}
/**
 * Figure out the correct vote for each user.
 * @returns a Map of user ID to their vote info
 */


function collectUserVotes(userResponses, userId, selected) {
  const userVotes = new Map();

  for (const response of userResponses) {
    const otherResponse = userVotes.get(response.sender);

    if (!otherResponse || otherResponse.ts < response.ts) {
      userVotes.set(response.sender, response);
    }
  }

  if (selected) {
    userVotes.set(userId, new UserVote(0, userId, [selected]));
  }

  return userVotes;
}

function countVotes(userVotes, pollStart) {
  const collected = new Map();

  for (const response of userVotes.values()) {
    const tempResponse = _matrixEventsSdk.PollResponseEvent.from(response.answers, "$irrelevant");

    tempResponse.validateAgainst(pollStart);

    if (!tempResponse.spoiled) {
      for (const answerId of tempResponse.answerIds) {
        if (collected.has(answerId)) {
          collected.set(answerId, collected.get(answerId) + 1);
        } else {
          collected.set(answerId, 1);
        }
      }
    }
  }

  return collected;
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJjcmVhdGVWb3RlUmVsYXRpb25zIiwiZ2V0UmVsYXRpb25zRm9yRXZlbnQiLCJldmVudElkIiwiUmVsYXRlZFJlbGF0aW9ucyIsIk1fUE9MTF9SRVNQT05TRSIsIm5hbWUiLCJhbHROYW1lIiwiZmluZFRvcEFuc3dlciIsInBvbGxFdmVudCIsIm1hdHJpeENsaWVudCIsInBvbGwiLCJ1bnN0YWJsZUV4dGVuc2libGVFdmVudCIsImlzRXF1aXZhbGVudFRvIiwiTV9QT0xMX1NUQVJUIiwiY29uc29sZSIsIndhcm4iLCJmaW5kQW5zd2VyVGV4dCIsImFuc3dlcklkIiwiYW5zd2VycyIsImZpbmQiLCJhIiwiaWQiLCJ0ZXh0Iiwidm90ZVJlbGF0aW9ucyIsImdldElkIiwiZW5kUmVsYXRpb25zIiwiTV9QT0xMX0VORCIsInVzZXJWb3RlcyIsImNvbGxlY3RVc2VyVm90ZXMiLCJhbGxWb3RlcyIsImdldFVzZXJJZCIsInZvdGVzIiwiY291bnRWb3RlcyIsImhpZ2hlc3RTY29yZSIsIk1hdGgiLCJtYXgiLCJ2YWx1ZXMiLCJiZXN0QW5zd2VySWRzIiwic2NvcmUiLCJwdXNoIiwiYmVzdEFuc3dlclRleHRzIiwibWFwIiwiZm9ybWF0Q29tbWFTZXBhcmF0ZWRMaXN0IiwiaXNQb2xsRW5kZWQiLCJyb29tQ3VycmVudFN0YXRlIiwiZ2V0Um9vbSIsImdldFJvb21JZCIsImN1cnJlbnRTdGF0ZSIsInVzZXJDYW5SZWRhY3QiLCJlbmRFdmVudCIsIm1heVNlbmRSZWRhY3Rpb25Gb3JFdmVudCIsImdldFNlbmRlciIsImF1dGhvcmlzZWRSZWxhdGlvbnMiLCJnZXRSZWxhdGlvbnMiLCJmaWx0ZXIiLCJsZW5ndGgiLCJwb2xsQWxyZWFkeUhhc1ZvdGVzIiwibXhFdmVudCIsImxhdW5jaFBvbGxFZGl0b3IiLCJNb2RhbCIsImNyZWF0ZURpYWxvZyIsIkVycm9yRGlhbG9nIiwidGl0bGUiLCJfdCIsImRlc2NyaXB0aW9uIiwiUG9sbENyZWF0ZURpYWxvZyIsInJvb20iLCJNYXRyaXhDbGllbnRQZWciLCJnZXQiLCJ0aHJlYWRJZCIsImdldFRocmVhZCIsImVkaXRpbmdNeEV2ZW50IiwiTVBvbGxCb2R5IiwiUmVhY3QiLCJDb21wb25lbnQiLCJjb25zdHJ1Y3RvciIsInByb3BzIiwicmVsYXRpb25UeXBlIiwiZXZlbnRUeXBlIiwibWF0Y2hlcyIsInZvdGVSZWxhdGlvbnNSZWNlaXZlZCIsIm5ld1ZvdGVSZWxhdGlvbnMiLCJmZXRjaFZvdGVSZWxhdGlvbnMiLCJhZGRMaXN0ZW5lcnMiLCJyZW1vdmVMaXN0ZW5lcnMiLCJzdGF0ZSIsInNldFN0YXRlIiwiZW5kUmVsYXRpb25zUmVjZWl2ZWQiLCJuZXdFbmRSZWxhdGlvbnMiLCJmZXRjaEVuZFJlbGF0aW9ucyIsInJlbW92ZUxpc3RlbmVyIiwiTWF0cml4RXZlbnRFdmVudCIsIlJlbGF0aW9uc0NyZWF0ZWQiLCJvblJlbGF0aW9uc0NyZWF0ZWQiLCJ1bnNlbGVjdElmTmV3RXZlbnRGcm9tTWUiLCJlIiwic2VsZWN0T3B0aW9uIiwiY3VycmVudFRhcmdldCIsInZhbHVlIiwic2VsZWN0ZWQiLCJvbiIsImNvbXBvbmVudFdpbGxVbm1vdW50Iiwib2ZmIiwiUmVsYXRpb25zRXZlbnQiLCJBZGQiLCJvblJlbGF0aW9uc0NoYW5nZSIsIlJlbW92ZSIsIlJlZGFjdGlvbiIsImlzRW5kZWQiLCJ1c2VySWQiLCJjb250ZXh0IiwibXlWb3RlIiwicmVzcG9uc2UiLCJQb2xsUmVzcG9uc2VFdmVudCIsImZyb20iLCJzZXJpYWxpemUiLCJzZW5kRXZlbnQiLCJ0eXBlIiwiY29udGVudCIsImNhdGNoIiwiZXJyb3IiLCJmZXRjaFJlbGF0aW9ucyIsIm5ld0V2ZW50cyIsImlzUG9sbFJlc3BvbnNlIiwic2VlbkV2ZW50SWRzIiwiaW5jbHVkZXMiLCJuZXdTZWxlY3RlZCIsIm5ld0V2ZW50SWRzIiwiY29uY2F0IiwidG90YWxWb3RlcyIsImNvbGxlY3RlZFZvdGVzIiwic3VtIiwidiIsInJlbmRlciIsImVuZGVkIiwicG9sbElkIiwid2luQ291bnQiLCJkaXNjbG9zZWQiLCJNX1BPTExfS0lORF9ESVNDTE9TRUQiLCJraW5kIiwic2hvd1Jlc3VsdHMiLCJ1bmRlZmluZWQiLCJ0b3RhbFRleHQiLCJjb3VudCIsImVkaXRlZFNwYW4iLCJyZXBsYWNpbmdFdmVudCIsInF1ZXN0aW9uIiwiYW5zd2VyIiwiYW5zd2VyVm90ZXMiLCJ2b3Rlc1RleHQiLCJjaGVja2VkIiwiY2xzIiwiY2xhc3NOYW1lcyIsImFuc3dlclBlcmNlbnQiLCJyb3VuZCIsIm9uT3B0aW9uU2VsZWN0ZWQiLCJNYXRyaXhDbGllbnRDb250ZXh0IiwiRW5kZWRQb2xsT3B0aW9uIiwiTGl2ZVBvbGxPcHRpb24iLCJVc2VyVm90ZSIsInRzIiwic2VuZGVyIiwidXNlclJlc3BvbnNlRnJvbVBvbGxSZXNwb25zZUV2ZW50IiwiZXZlbnQiLCJFcnJvciIsImdldFRzIiwiYW5zd2VySWRzIiwiZW5kVHMiLCJwb2xsRW5kVHMiLCJpc09uT3JCZWZvcmVFbmQiLCJyZXNwb25zZUV2ZW50IiwidHNzIiwiZXZ0IiwibWluIiwidXNlclJlc3BvbnNlcyIsIk1hcCIsIm90aGVyUmVzcG9uc2UiLCJzZXQiLCJwb2xsU3RhcnQiLCJjb2xsZWN0ZWQiLCJ0ZW1wUmVzcG9uc2UiLCJ2YWxpZGF0ZUFnYWluc3QiLCJzcG9pbGVkIiwiaGFzIl0sInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL2NvbXBvbmVudHMvdmlld3MvbWVzc2FnZXMvTVBvbGxCb2R5LnRzeCJdLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMjEgVGhlIE1hdHJpeC5vcmcgRm91bmRhdGlvbiBDLkkuQy5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnO1xuaW1wb3J0IGNsYXNzTmFtZXMgZnJvbSAnY2xhc3NuYW1lcyc7XG5pbXBvcnQgeyBNYXRyaXhFdmVudCwgTWF0cml4RXZlbnRFdmVudCB9IGZyb20gXCJtYXRyaXgtanMtc2RrL3NyYy9tb2RlbHMvZXZlbnRcIjtcbmltcG9ydCB7IFJlbGF0aW9ucywgUmVsYXRpb25zRXZlbnQgfSBmcm9tICdtYXRyaXgtanMtc2RrL3NyYy9tb2RlbHMvcmVsYXRpb25zJztcbmltcG9ydCB7IE1hdHJpeENsaWVudCB9IGZyb20gJ21hdHJpeC1qcy1zZGsvc3JjL21hdHJpeCc7XG5pbXBvcnQge1xuICAgIE1fUE9MTF9FTkQsXG4gICAgTV9QT0xMX0tJTkRfRElTQ0xPU0VELFxuICAgIE1fUE9MTF9SRVNQT05TRSxcbiAgICBNX1BPTExfU1RBUlQsXG4gICAgTmFtZXNwYWNlZFZhbHVlLFxuICAgIFBvbGxBbnN3ZXJTdWJldmVudCxcbiAgICBQb2xsUmVzcG9uc2VFdmVudCxcbiAgICBQb2xsU3RhcnRFdmVudCxcbn0gZnJvbSBcIm1hdHJpeC1ldmVudHMtc2RrXCI7XG5pbXBvcnQgeyBSZWxhdGVkUmVsYXRpb25zIH0gZnJvbSBcIm1hdHJpeC1qcy1zZGsvc3JjL21vZGVscy9yZWxhdGVkLXJlbGF0aW9uc1wiO1xuXG5pbXBvcnQgeyBfdCB9IGZyb20gJy4uLy4uLy4uL2xhbmd1YWdlSGFuZGxlcic7XG5pbXBvcnQgTW9kYWwgZnJvbSAnLi4vLi4vLi4vTW9kYWwnO1xuaW1wb3J0IHsgSUJvZHlQcm9wcyB9IGZyb20gXCIuL0lCb2R5UHJvcHNcIjtcbmltcG9ydCB7IGZvcm1hdENvbW1hU2VwYXJhdGVkTGlzdCB9IGZyb20gJy4uLy4uLy4uL3V0aWxzL0Zvcm1hdHRpbmdVdGlscyc7XG5pbXBvcnQgU3R5bGVkUmFkaW9CdXR0b24gZnJvbSAnLi4vZWxlbWVudHMvU3R5bGVkUmFkaW9CdXR0b24nO1xuaW1wb3J0IE1hdHJpeENsaWVudENvbnRleHQgZnJvbSBcIi4uLy4uLy4uL2NvbnRleHRzL01hdHJpeENsaWVudENvbnRleHRcIjtcbmltcG9ydCBFcnJvckRpYWxvZyBmcm9tICcuLi9kaWFsb2dzL0Vycm9yRGlhbG9nJztcbmltcG9ydCB7IEdldFJlbGF0aW9uc0ZvckV2ZW50IH0gZnJvbSBcIi4uL3Jvb21zL0V2ZW50VGlsZVwiO1xuaW1wb3J0IFBvbGxDcmVhdGVEaWFsb2cgZnJvbSBcIi4uL2VsZW1lbnRzL1BvbGxDcmVhdGVEaWFsb2dcIjtcbmltcG9ydCB7IE1hdHJpeENsaWVudFBlZyB9IGZyb20gXCIuLi8uLi8uLi9NYXRyaXhDbGllbnRQZWdcIjtcblxuaW50ZXJmYWNlIElTdGF0ZSB7XG4gICAgc2VsZWN0ZWQ/OiBzdHJpbmc7IC8vIFdoaWNoIG9wdGlvbiB3YXMgY2xpY2tlZCBieSB0aGUgbG9jYWwgdXNlclxuICAgIHZvdGVSZWxhdGlvbnM6IFJlbGF0ZWRSZWxhdGlvbnM7IC8vIFZvdGluZyAocmVzcG9uc2UpIGV2ZW50c1xuICAgIGVuZFJlbGF0aW9uczogUmVsYXRlZFJlbGF0aW9uczsgLy8gUG9sbCBlbmQgZXZlbnRzXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVWb3RlUmVsYXRpb25zKFxuICAgIGdldFJlbGF0aW9uc0ZvckV2ZW50OiAoXG4gICAgICAgIGV2ZW50SWQ6IHN0cmluZyxcbiAgICAgICAgcmVsYXRpb25UeXBlOiBzdHJpbmcsXG4gICAgICAgIGV2ZW50VHlwZTogc3RyaW5nXG4gICAgKSA9PiBSZWxhdGlvbnMsXG4gICAgZXZlbnRJZDogc3RyaW5nLFxuKSB7XG4gICAgcmV0dXJuIG5ldyBSZWxhdGVkUmVsYXRpb25zKFtcbiAgICAgICAgZ2V0UmVsYXRpb25zRm9yRXZlbnQoXG4gICAgICAgICAgICBldmVudElkLFxuICAgICAgICAgICAgXCJtLnJlZmVyZW5jZVwiLFxuICAgICAgICAgICAgTV9QT0xMX1JFU1BPTlNFLm5hbWUsXG4gICAgICAgICksXG4gICAgICAgIGdldFJlbGF0aW9uc0ZvckV2ZW50KFxuICAgICAgICAgICAgZXZlbnRJZCxcbiAgICAgICAgICAgIFwibS5yZWZlcmVuY2VcIixcbiAgICAgICAgICAgIE1fUE9MTF9SRVNQT05TRS5hbHROYW1lLFxuICAgICAgICApLFxuICAgIF0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZmluZFRvcEFuc3dlcihcbiAgICBwb2xsRXZlbnQ6IE1hdHJpeEV2ZW50LFxuICAgIG1hdHJpeENsaWVudDogTWF0cml4Q2xpZW50LFxuICAgIGdldFJlbGF0aW9uc0ZvckV2ZW50PzogKFxuICAgICAgICBldmVudElkOiBzdHJpbmcsXG4gICAgICAgIHJlbGF0aW9uVHlwZTogc3RyaW5nLFxuICAgICAgICBldmVudFR5cGU6IHN0cmluZ1xuICAgICkgPT4gUmVsYXRpb25zLFxuKTogc3RyaW5nIHtcbiAgICBpZiAoIWdldFJlbGF0aW9uc0ZvckV2ZW50KSB7XG4gICAgICAgIHJldHVybiBcIlwiO1xuICAgIH1cblxuICAgIGNvbnN0IHBvbGwgPSBwb2xsRXZlbnQudW5zdGFibGVFeHRlbnNpYmxlRXZlbnQgYXMgUG9sbFN0YXJ0RXZlbnQ7XG4gICAgaWYgKCFwb2xsPy5pc0VxdWl2YWxlbnRUbyhNX1BPTExfU1RBUlQpKSB7XG4gICAgICAgIGNvbnNvbGUud2FybihcIkZhaWxlZCB0byBwYXJzZSBwb2xsIHRvIGRldGVybWluZSB0b3AgYW5zd2VyIC0gYXNzdW1pbmcgbm8gYmVzdCBhbnN3ZXJcIik7XG4gICAgICAgIHJldHVybiBcIlwiO1xuICAgIH1cblxuICAgIGNvbnN0IGZpbmRBbnN3ZXJUZXh0ID0gKGFuc3dlcklkOiBzdHJpbmcpID0+IHtcbiAgICAgICAgcmV0dXJuIHBvbGwuYW5zd2Vycy5maW5kKGEgPT4gYS5pZCA9PT0gYW5zd2VySWQpPy50ZXh0ID8/IFwiXCI7XG4gICAgfTtcblxuICAgIGNvbnN0IHZvdGVSZWxhdGlvbnMgPSBjcmVhdGVWb3RlUmVsYXRpb25zKGdldFJlbGF0aW9uc0ZvckV2ZW50LCBwb2xsRXZlbnQuZ2V0SWQoKSk7XG5cbiAgICBjb25zdCBlbmRSZWxhdGlvbnMgPSBuZXcgUmVsYXRlZFJlbGF0aW9ucyhbXG4gICAgICAgIGdldFJlbGF0aW9uc0ZvckV2ZW50KFxuICAgICAgICAgICAgcG9sbEV2ZW50LmdldElkKCksXG4gICAgICAgICAgICBcIm0ucmVmZXJlbmNlXCIsXG4gICAgICAgICAgICBNX1BPTExfRU5ELm5hbWUsXG4gICAgICAgICksXG4gICAgICAgIGdldFJlbGF0aW9uc0ZvckV2ZW50KFxuICAgICAgICAgICAgcG9sbEV2ZW50LmdldElkKCksXG4gICAgICAgICAgICBcIm0ucmVmZXJlbmNlXCIsXG4gICAgICAgICAgICBNX1BPTExfRU5ELmFsdE5hbWUsXG4gICAgICAgICksXG4gICAgXSk7XG5cbiAgICBjb25zdCB1c2VyVm90ZXM6IE1hcDxzdHJpbmcsIFVzZXJWb3RlPiA9IGNvbGxlY3RVc2VyVm90ZXMoXG4gICAgICAgIGFsbFZvdGVzKHBvbGxFdmVudCwgbWF0cml4Q2xpZW50LCB2b3RlUmVsYXRpb25zLCBlbmRSZWxhdGlvbnMpLFxuICAgICAgICBtYXRyaXhDbGllbnQuZ2V0VXNlcklkKCksXG4gICAgICAgIG51bGwsXG4gICAgKTtcblxuICAgIGNvbnN0IHZvdGVzOiBNYXA8c3RyaW5nLCBudW1iZXI+ID0gY291bnRWb3Rlcyh1c2VyVm90ZXMsIHBvbGwpO1xuICAgIGNvbnN0IGhpZ2hlc3RTY29yZTogbnVtYmVyID0gTWF0aC5tYXgoLi4udm90ZXMudmFsdWVzKCkpO1xuXG4gICAgY29uc3QgYmVzdEFuc3dlcklkczogc3RyaW5nW10gPSBbXTtcbiAgICBmb3IgKGNvbnN0IFthbnN3ZXJJZCwgc2NvcmVdIG9mIHZvdGVzKSB7XG4gICAgICAgIGlmIChzY29yZSA9PSBoaWdoZXN0U2NvcmUpIHtcbiAgICAgICAgICAgIGJlc3RBbnN3ZXJJZHMucHVzaChhbnN3ZXJJZCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBjb25zdCBiZXN0QW5zd2VyVGV4dHMgPSBiZXN0QW5zd2VySWRzLm1hcChmaW5kQW5zd2VyVGV4dCk7XG5cbiAgICByZXR1cm4gZm9ybWF0Q29tbWFTZXBhcmF0ZWRMaXN0KGJlc3RBbnN3ZXJUZXh0cywgMyk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc1BvbGxFbmRlZChcbiAgICBwb2xsRXZlbnQ6IE1hdHJpeEV2ZW50LFxuICAgIG1hdHJpeENsaWVudDogTWF0cml4Q2xpZW50LFxuICAgIGdldFJlbGF0aW9uc0ZvckV2ZW50PzogKFxuICAgICAgICBldmVudElkOiBzdHJpbmcsXG4gICAgICAgIHJlbGF0aW9uVHlwZTogc3RyaW5nLFxuICAgICAgICBldmVudFR5cGU6IHN0cmluZ1xuICAgICkgPT4gUmVsYXRpb25zLFxuKTogYm9vbGVhbiB7XG4gICAgaWYgKCFnZXRSZWxhdGlvbnNGb3JFdmVudCkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgY29uc3Qgcm9vbUN1cnJlbnRTdGF0ZSA9IG1hdHJpeENsaWVudC5nZXRSb29tKHBvbGxFdmVudC5nZXRSb29tSWQoKSkuY3VycmVudFN0YXRlO1xuICAgIGZ1bmN0aW9uIHVzZXJDYW5SZWRhY3QoZW5kRXZlbnQ6IE1hdHJpeEV2ZW50KSB7XG4gICAgICAgIHJldHVybiByb29tQ3VycmVudFN0YXRlLm1heVNlbmRSZWRhY3Rpb25Gb3JFdmVudChcbiAgICAgICAgICAgIHBvbGxFdmVudCxcbiAgICAgICAgICAgIGVuZEV2ZW50LmdldFNlbmRlcigpLFxuICAgICAgICApO1xuICAgIH1cblxuICAgIGNvbnN0IGVuZFJlbGF0aW9ucyA9IG5ldyBSZWxhdGVkUmVsYXRpb25zKFtcbiAgICAgICAgZ2V0UmVsYXRpb25zRm9yRXZlbnQoXG4gICAgICAgICAgICBwb2xsRXZlbnQuZ2V0SWQoKSxcbiAgICAgICAgICAgIFwibS5yZWZlcmVuY2VcIixcbiAgICAgICAgICAgIE1fUE9MTF9FTkQubmFtZSxcbiAgICAgICAgKSxcbiAgICAgICAgZ2V0UmVsYXRpb25zRm9yRXZlbnQoXG4gICAgICAgICAgICBwb2xsRXZlbnQuZ2V0SWQoKSxcbiAgICAgICAgICAgIFwibS5yZWZlcmVuY2VcIixcbiAgICAgICAgICAgIE1fUE9MTF9FTkQuYWx0TmFtZSxcbiAgICAgICAgKSxcbiAgICBdKTtcblxuICAgIGlmICghZW5kUmVsYXRpb25zKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBjb25zdCBhdXRob3Jpc2VkUmVsYXRpb25zID0gZW5kUmVsYXRpb25zLmdldFJlbGF0aW9ucygpLmZpbHRlcih1c2VyQ2FuUmVkYWN0KTtcblxuICAgIHJldHVybiBhdXRob3Jpc2VkUmVsYXRpb25zLmxlbmd0aCA+IDA7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwb2xsQWxyZWFkeUhhc1ZvdGVzKG14RXZlbnQ6IE1hdHJpeEV2ZW50LCBnZXRSZWxhdGlvbnNGb3JFdmVudD86IEdldFJlbGF0aW9uc0ZvckV2ZW50KTogYm9vbGVhbiB7XG4gICAgaWYgKCFnZXRSZWxhdGlvbnNGb3JFdmVudCkgcmV0dXJuIGZhbHNlO1xuXG4gICAgY29uc3Qgdm90ZVJlbGF0aW9ucyA9IGNyZWF0ZVZvdGVSZWxhdGlvbnMoZ2V0UmVsYXRpb25zRm9yRXZlbnQsIG14RXZlbnQuZ2V0SWQoKSk7XG4gICAgcmV0dXJuIHZvdGVSZWxhdGlvbnMuZ2V0UmVsYXRpb25zKCkubGVuZ3RoID4gMDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGxhdW5jaFBvbGxFZGl0b3IobXhFdmVudDogTWF0cml4RXZlbnQsIGdldFJlbGF0aW9uc0ZvckV2ZW50PzogR2V0UmVsYXRpb25zRm9yRXZlbnQpOiB2b2lkIHtcbiAgICBpZiAocG9sbEFscmVhZHlIYXNWb3RlcyhteEV2ZW50LCBnZXRSZWxhdGlvbnNGb3JFdmVudCkpIHtcbiAgICAgICAgTW9kYWwuY3JlYXRlRGlhbG9nKFxuICAgICAgICAgICAgRXJyb3JEaWFsb2csXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgdGl0bGU6IF90KFwiQ2FuJ3QgZWRpdCBwb2xsXCIpLFxuICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBfdChcbiAgICAgICAgICAgICAgICAgICAgXCJTb3JyeSwgeW91IGNhbid0IGVkaXQgYSBwb2xsIGFmdGVyIHZvdGVzIGhhdmUgYmVlbiBjYXN0LlwiLFxuICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICB9LFxuICAgICAgICApO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIE1vZGFsLmNyZWF0ZURpYWxvZyhcbiAgICAgICAgICAgIFBvbGxDcmVhdGVEaWFsb2csXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgcm9vbTogTWF0cml4Q2xpZW50UGVnLmdldCgpLmdldFJvb20obXhFdmVudC5nZXRSb29tSWQoKSksXG4gICAgICAgICAgICAgICAgdGhyZWFkSWQ6IG14RXZlbnQuZ2V0VGhyZWFkKCk/LmlkID8/IG51bGwsXG4gICAgICAgICAgICAgICAgZWRpdGluZ014RXZlbnQ6IG14RXZlbnQsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgJ214X0NvbXBvdW5kRGlhbG9nJyxcbiAgICAgICAgICAgIGZhbHNlLCAvLyBpc1ByaW9yaXR5TW9kYWxcbiAgICAgICAgICAgIHRydWUsICAvLyBpc1N0YXRpY01vZGFsXG4gICAgICAgICk7XG4gICAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBNUG9sbEJvZHkgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQ8SUJvZHlQcm9wcywgSVN0YXRlPiB7XG4gICAgcHVibGljIHN0YXRpYyBjb250ZXh0VHlwZSA9IE1hdHJpeENsaWVudENvbnRleHQ7XG4gICAgcHVibGljIGNvbnRleHQhOiBSZWFjdC5Db250ZXh0VHlwZTx0eXBlb2YgTWF0cml4Q2xpZW50Q29udGV4dD47XG4gICAgcHJpdmF0ZSBzZWVuRXZlbnRJZHM6IHN0cmluZ1tdID0gW107IC8vIEV2ZW50cyB3ZSBoYXZlIGFscmVhZHkgc2VlblxuICAgIHByaXZhdGUgdm90ZVJlbGF0aW9uc1JlY2VpdmVkID0gZmFsc2U7XG4gICAgcHJpdmF0ZSBlbmRSZWxhdGlvbnNSZWNlaXZlZCA9IGZhbHNlO1xuXG4gICAgY29uc3RydWN0b3IocHJvcHM6IElCb2R5UHJvcHMpIHtcbiAgICAgICAgc3VwZXIocHJvcHMpO1xuXG4gICAgICAgIHRoaXMuc3RhdGUgPSB7XG4gICAgICAgICAgICBzZWxlY3RlZDogbnVsbCxcbiAgICAgICAgICAgIHZvdGVSZWxhdGlvbnM6IHRoaXMuZmV0Y2hWb3RlUmVsYXRpb25zKCksXG4gICAgICAgICAgICBlbmRSZWxhdGlvbnM6IHRoaXMuZmV0Y2hFbmRSZWxhdGlvbnMoKSxcbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLmFkZExpc3RlbmVycyh0aGlzLnN0YXRlLnZvdGVSZWxhdGlvbnMsIHRoaXMuc3RhdGUuZW5kUmVsYXRpb25zKTtcbiAgICAgICAgdGhpcy5wcm9wcy5teEV2ZW50Lm9uKE1hdHJpeEV2ZW50RXZlbnQuUmVsYXRpb25zQ3JlYXRlZCwgdGhpcy5vblJlbGF0aW9uc0NyZWF0ZWQpO1xuICAgIH1cblxuICAgIGNvbXBvbmVudFdpbGxVbm1vdW50KCkge1xuICAgICAgICB0aGlzLnByb3BzLm14RXZlbnQub2ZmKE1hdHJpeEV2ZW50RXZlbnQuUmVsYXRpb25zQ3JlYXRlZCwgdGhpcy5vblJlbGF0aW9uc0NyZWF0ZWQpO1xuICAgICAgICB0aGlzLnJlbW92ZUxpc3RlbmVycyh0aGlzLnN0YXRlLnZvdGVSZWxhdGlvbnMsIHRoaXMuc3RhdGUuZW5kUmVsYXRpb25zKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGFkZExpc3RlbmVycyh2b3RlUmVsYXRpb25zPzogUmVsYXRlZFJlbGF0aW9ucywgZW5kUmVsYXRpb25zPzogUmVsYXRlZFJlbGF0aW9ucykge1xuICAgICAgICBpZiAodm90ZVJlbGF0aW9ucykge1xuICAgICAgICAgICAgdm90ZVJlbGF0aW9ucy5vbihSZWxhdGlvbnNFdmVudC5BZGQsIHRoaXMub25SZWxhdGlvbnNDaGFuZ2UpO1xuICAgICAgICAgICAgdm90ZVJlbGF0aW9ucy5vbihSZWxhdGlvbnNFdmVudC5SZW1vdmUsIHRoaXMub25SZWxhdGlvbnNDaGFuZ2UpO1xuICAgICAgICAgICAgdm90ZVJlbGF0aW9ucy5vbihSZWxhdGlvbnNFdmVudC5SZWRhY3Rpb24sIHRoaXMub25SZWxhdGlvbnNDaGFuZ2UpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChlbmRSZWxhdGlvbnMpIHtcbiAgICAgICAgICAgIGVuZFJlbGF0aW9ucy5vbihSZWxhdGlvbnNFdmVudC5BZGQsIHRoaXMub25SZWxhdGlvbnNDaGFuZ2UpO1xuICAgICAgICAgICAgZW5kUmVsYXRpb25zLm9uKFJlbGF0aW9uc0V2ZW50LlJlbW92ZSwgdGhpcy5vblJlbGF0aW9uc0NoYW5nZSk7XG4gICAgICAgICAgICBlbmRSZWxhdGlvbnMub24oUmVsYXRpb25zRXZlbnQuUmVkYWN0aW9uLCB0aGlzLm9uUmVsYXRpb25zQ2hhbmdlKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgcmVtb3ZlTGlzdGVuZXJzKHZvdGVSZWxhdGlvbnM/OiBSZWxhdGVkUmVsYXRpb25zLCBlbmRSZWxhdGlvbnM/OiBSZWxhdGVkUmVsYXRpb25zKSB7XG4gICAgICAgIGlmICh2b3RlUmVsYXRpb25zKSB7XG4gICAgICAgICAgICB2b3RlUmVsYXRpb25zLm9mZihSZWxhdGlvbnNFdmVudC5BZGQsIHRoaXMub25SZWxhdGlvbnNDaGFuZ2UpO1xuICAgICAgICAgICAgdm90ZVJlbGF0aW9ucy5vZmYoUmVsYXRpb25zRXZlbnQuUmVtb3ZlLCB0aGlzLm9uUmVsYXRpb25zQ2hhbmdlKTtcbiAgICAgICAgICAgIHZvdGVSZWxhdGlvbnMub2ZmKFJlbGF0aW9uc0V2ZW50LlJlZGFjdGlvbiwgdGhpcy5vblJlbGF0aW9uc0NoYW5nZSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGVuZFJlbGF0aW9ucykge1xuICAgICAgICAgICAgZW5kUmVsYXRpb25zLm9mZihSZWxhdGlvbnNFdmVudC5BZGQsIHRoaXMub25SZWxhdGlvbnNDaGFuZ2UpO1xuICAgICAgICAgICAgZW5kUmVsYXRpb25zLm9mZihSZWxhdGlvbnNFdmVudC5SZW1vdmUsIHRoaXMub25SZWxhdGlvbnNDaGFuZ2UpO1xuICAgICAgICAgICAgZW5kUmVsYXRpb25zLm9mZihSZWxhdGlvbnNFdmVudC5SZWRhY3Rpb24sIHRoaXMub25SZWxhdGlvbnNDaGFuZ2UpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBvblJlbGF0aW9uc0NyZWF0ZWQgPSAocmVsYXRpb25UeXBlOiBzdHJpbmcsIGV2ZW50VHlwZTogc3RyaW5nKSA9PiB7XG4gICAgICAgIGlmIChyZWxhdGlvblR5cGUgIT09IFwibS5yZWZlcmVuY2VcIikge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKE1fUE9MTF9SRVNQT05TRS5tYXRjaGVzKGV2ZW50VHlwZSkpIHtcbiAgICAgICAgICAgIHRoaXMudm90ZVJlbGF0aW9uc1JlY2VpdmVkID0gdHJ1ZTtcbiAgICAgICAgICAgIGNvbnN0IG5ld1ZvdGVSZWxhdGlvbnMgPSB0aGlzLmZldGNoVm90ZVJlbGF0aW9ucygpO1xuICAgICAgICAgICAgdGhpcy5hZGRMaXN0ZW5lcnMobmV3Vm90ZVJlbGF0aW9ucyk7XG4gICAgICAgICAgICB0aGlzLnJlbW92ZUxpc3RlbmVycyh0aGlzLnN0YXRlLnZvdGVSZWxhdGlvbnMpO1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IHZvdGVSZWxhdGlvbnM6IG5ld1ZvdGVSZWxhdGlvbnMgfSk7XG4gICAgICAgIH0gZWxzZSBpZiAoTV9QT0xMX0VORC5tYXRjaGVzKGV2ZW50VHlwZSkpIHtcbiAgICAgICAgICAgIHRoaXMuZW5kUmVsYXRpb25zUmVjZWl2ZWQgPSB0cnVlO1xuICAgICAgICAgICAgY29uc3QgbmV3RW5kUmVsYXRpb25zID0gdGhpcy5mZXRjaEVuZFJlbGF0aW9ucygpO1xuICAgICAgICAgICAgdGhpcy5hZGRMaXN0ZW5lcnMobmV3RW5kUmVsYXRpb25zKTtcbiAgICAgICAgICAgIHRoaXMucmVtb3ZlTGlzdGVuZXJzKHRoaXMuc3RhdGUuZW5kUmVsYXRpb25zKTtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoeyBlbmRSZWxhdGlvbnM6IG5ld0VuZFJlbGF0aW9ucyB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLnZvdGVSZWxhdGlvbnNSZWNlaXZlZCAmJiB0aGlzLmVuZFJlbGF0aW9uc1JlY2VpdmVkKSB7XG4gICAgICAgICAgICB0aGlzLnByb3BzLm14RXZlbnQucmVtb3ZlTGlzdGVuZXIoTWF0cml4RXZlbnRFdmVudC5SZWxhdGlvbnNDcmVhdGVkLCB0aGlzLm9uUmVsYXRpb25zQ3JlYXRlZCk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvblJlbGF0aW9uc0NoYW5nZSA9ICgpID0+IHtcbiAgICAgICAgLy8gV2UgaG9sZCBSZWxhdGlvbnMgaW4gb3VyIHN0YXRlLCBhbmQgdGhleSBjaGFuZ2VkIHVuZGVyIHVzLlxuICAgICAgICAvLyBDaGVjayB3aGV0aGVyIHdlIHNob3VsZCBkZWxldGUgb3VyIHNlbGVjdGlvbiwgYW5kIHRoZW5cbiAgICAgICAgLy8gcmUtcmVuZGVyLlxuICAgICAgICAvLyBOb3RlOiByZS1yZW5kZXJpbmcgaXMgYSBzaWRlIGVmZmVjdCBvZiB1bnNlbGVjdElmTmV3RXZlbnRGcm9tTWUoKS5cbiAgICAgICAgdGhpcy51bnNlbGVjdElmTmV3RXZlbnRGcm9tTWUoKTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBzZWxlY3RPcHRpb24oYW5zd2VySWQ6IHN0cmluZykge1xuICAgICAgICBpZiAodGhpcy5pc0VuZGVkKCkpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCB1c2VyVm90ZXMgPSB0aGlzLmNvbGxlY3RVc2VyVm90ZXMoKTtcbiAgICAgICAgY29uc3QgdXNlcklkID0gdGhpcy5jb250ZXh0LmdldFVzZXJJZCgpO1xuICAgICAgICBjb25zdCBteVZvdGUgPSB1c2VyVm90ZXMuZ2V0KHVzZXJJZCk/LmFuc3dlcnNbMF07XG4gICAgICAgIGlmIChhbnN3ZXJJZCA9PT0gbXlWb3RlKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCByZXNwb25zZSA9IFBvbGxSZXNwb25zZUV2ZW50LmZyb20oW2Fuc3dlcklkXSwgdGhpcy5wcm9wcy5teEV2ZW50LmdldElkKCkpLnNlcmlhbGl6ZSgpO1xuXG4gICAgICAgIHRoaXMuY29udGV4dC5zZW5kRXZlbnQoXG4gICAgICAgICAgICB0aGlzLnByb3BzLm14RXZlbnQuZ2V0Um9vbUlkKCksXG4gICAgICAgICAgICByZXNwb25zZS50eXBlLFxuICAgICAgICAgICAgcmVzcG9uc2UuY29udGVudCxcbiAgICAgICAgKS5jYXRjaCgoZTogYW55KSA9PiB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKFwiRmFpbGVkIHRvIHN1Ym1pdCBwb2xsIHJlc3BvbnNlIGV2ZW50OlwiLCBlKTtcblxuICAgICAgICAgICAgTW9kYWwuY3JlYXRlRGlhbG9nKFxuICAgICAgICAgICAgICAgIEVycm9yRGlhbG9nLFxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgdGl0bGU6IF90KFwiVm90ZSBub3QgcmVnaXN0ZXJlZFwiKSxcbiAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246IF90KFxuICAgICAgICAgICAgICAgICAgICAgICAgXCJTb3JyeSwgeW91ciB2b3RlIHdhcyBub3QgcmVnaXN0ZXJlZC4gUGxlYXNlIHRyeSBhZ2Fpbi5cIiksXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHRoaXMuc2V0U3RhdGUoeyBzZWxlY3RlZDogYW5zd2VySWQgfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBvbk9wdGlvblNlbGVjdGVkID0gKGU6IFJlYWN0LkZvcm1FdmVudDxIVE1MSW5wdXRFbGVtZW50Pik6IHZvaWQgPT4ge1xuICAgICAgICB0aGlzLnNlbGVjdE9wdGlvbihlLmN1cnJlbnRUYXJnZXQudmFsdWUpO1xuICAgIH07XG5cbiAgICBwcml2YXRlIGZldGNoVm90ZVJlbGF0aW9ucygpOiBSZWxhdGVkUmVsYXRpb25zIHwgbnVsbCB7XG4gICAgICAgIHJldHVybiB0aGlzLmZldGNoUmVsYXRpb25zKE1fUE9MTF9SRVNQT05TRSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBmZXRjaEVuZFJlbGF0aW9ucygpOiBSZWxhdGVkUmVsYXRpb25zIHwgbnVsbCB7XG4gICAgICAgIHJldHVybiB0aGlzLmZldGNoUmVsYXRpb25zKE1fUE9MTF9FTkQpO1xuICAgIH1cblxuICAgIHByaXZhdGUgZmV0Y2hSZWxhdGlvbnMoZXZlbnRUeXBlOiBOYW1lc3BhY2VkVmFsdWU8c3RyaW5nLCBzdHJpbmc+KTogUmVsYXRlZFJlbGF0aW9ucyB8IG51bGwge1xuICAgICAgICBpZiAodGhpcy5wcm9wcy5nZXRSZWxhdGlvbnNGb3JFdmVudCkge1xuICAgICAgICAgICAgcmV0dXJuIG5ldyBSZWxhdGVkUmVsYXRpb25zKFtcbiAgICAgICAgICAgICAgICB0aGlzLnByb3BzLmdldFJlbGF0aW9uc0ZvckV2ZW50KFxuICAgICAgICAgICAgICAgICAgICB0aGlzLnByb3BzLm14RXZlbnQuZ2V0SWQoKSxcbiAgICAgICAgICAgICAgICAgICAgXCJtLnJlZmVyZW5jZVwiLFxuICAgICAgICAgICAgICAgICAgICBldmVudFR5cGUubmFtZSxcbiAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgIHRoaXMucHJvcHMuZ2V0UmVsYXRpb25zRm9yRXZlbnQoXG4gICAgICAgICAgICAgICAgICAgIHRoaXMucHJvcHMubXhFdmVudC5nZXRJZCgpLFxuICAgICAgICAgICAgICAgICAgICBcIm0ucmVmZXJlbmNlXCIsXG4gICAgICAgICAgICAgICAgICAgIGV2ZW50VHlwZS5hbHROYW1lLFxuICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICBdKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQHJldHVybnMgdXNlcklkIC0+IFVzZXJWb3RlXG4gICAgICovXG4gICAgcHJpdmF0ZSBjb2xsZWN0VXNlclZvdGVzKCk6IE1hcDxzdHJpbmcsIFVzZXJWb3RlPiB7XG4gICAgICAgIHJldHVybiBjb2xsZWN0VXNlclZvdGVzKFxuICAgICAgICAgICAgYWxsVm90ZXMoXG4gICAgICAgICAgICAgICAgdGhpcy5wcm9wcy5teEV2ZW50LFxuICAgICAgICAgICAgICAgIHRoaXMuY29udGV4dCxcbiAgICAgICAgICAgICAgICB0aGlzLnN0YXRlLnZvdGVSZWxhdGlvbnMsXG4gICAgICAgICAgICAgICAgdGhpcy5zdGF0ZS5lbmRSZWxhdGlvbnMsXG4gICAgICAgICAgICApLFxuICAgICAgICAgICAgdGhpcy5jb250ZXh0LmdldFVzZXJJZCgpLFxuICAgICAgICAgICAgdGhpcy5zdGF0ZS5zZWxlY3RlZCxcbiAgICAgICAgKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBJZiB3ZSd2ZSBqdXN0IHJlY2VpdmVkIGEgbmV3IGV2ZW50IHRoYXQgd2UgaGFkbid0IHNlZW5cbiAgICAgKiBiZWZvcmUsIGFuZCB0aGF0IGV2ZW50IGlzIG1lIHZvdGluZyAoZS5nLiBmcm9tIGEgZGlmZmVyZW50XG4gICAgICogZGV2aWNlKSB0aGVuIGZvcmdldCB3aGVuIHRoZSBsb2NhbCB1c2VyIHNlbGVjdGVkLlxuICAgICAqXG4gICAgICogRWl0aGVyIHdheSwgY2FsbHMgc2V0U3RhdGUgdG8gdXBkYXRlIG91ciBsaXN0IG9mIGV2ZW50cyB3ZVxuICAgICAqIGhhdmUgYWxyZWFkeSBzZWVuLlxuICAgICAqL1xuICAgIHByaXZhdGUgdW5zZWxlY3RJZk5ld0V2ZW50RnJvbU1lKCkge1xuICAgICAgICBjb25zdCBuZXdFdmVudHM6IE1hdHJpeEV2ZW50W10gPSB0aGlzLnN0YXRlLnZvdGVSZWxhdGlvbnMuZ2V0UmVsYXRpb25zKClcbiAgICAgICAgICAgIC5maWx0ZXIoaXNQb2xsUmVzcG9uc2UpXG4gICAgICAgICAgICAuZmlsdGVyKChteEV2ZW50OiBNYXRyaXhFdmVudCkgPT5cbiAgICAgICAgICAgICAgICAhdGhpcy5zZWVuRXZlbnRJZHMuaW5jbHVkZXMobXhFdmVudC5nZXRJZCgpKSk7XG4gICAgICAgIGxldCBuZXdTZWxlY3RlZCA9IHRoaXMuc3RhdGUuc2VsZWN0ZWQ7XG5cbiAgICAgICAgaWYgKG5ld0V2ZW50cy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICBmb3IgKGNvbnN0IG14RXZlbnQgb2YgbmV3RXZlbnRzKSB7XG4gICAgICAgICAgICAgICAgaWYgKG14RXZlbnQuZ2V0U2VuZGVyKCkgPT09IHRoaXMuY29udGV4dC5nZXRVc2VySWQoKSkge1xuICAgICAgICAgICAgICAgICAgICBuZXdTZWxlY3RlZCA9IG51bGw7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGNvbnN0IG5ld0V2ZW50SWRzID0gbmV3RXZlbnRzLm1hcCgobXhFdmVudDogTWF0cml4RXZlbnQpID0+IG14RXZlbnQuZ2V0SWQoKSk7XG4gICAgICAgIHRoaXMuc2VlbkV2ZW50SWRzID0gdGhpcy5zZWVuRXZlbnRJZHMuY29uY2F0KG5ld0V2ZW50SWRzKTtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IHNlbGVjdGVkOiBuZXdTZWxlY3RlZCB9KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIHRvdGFsVm90ZXMoY29sbGVjdGVkVm90ZXM6IE1hcDxzdHJpbmcsIG51bWJlcj4pOiBudW1iZXIge1xuICAgICAgICBsZXQgc3VtID0gMDtcbiAgICAgICAgZm9yIChjb25zdCB2IG9mIGNvbGxlY3RlZFZvdGVzLnZhbHVlcygpKSB7XG4gICAgICAgICAgICBzdW0gKz0gdjtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gc3VtO1xuICAgIH1cblxuICAgIHByaXZhdGUgaXNFbmRlZCgpOiBib29sZWFuIHtcbiAgICAgICAgcmV0dXJuIGlzUG9sbEVuZGVkKFxuICAgICAgICAgICAgdGhpcy5wcm9wcy5teEV2ZW50LFxuICAgICAgICAgICAgdGhpcy5jb250ZXh0LFxuICAgICAgICAgICAgdGhpcy5wcm9wcy5nZXRSZWxhdGlvbnNGb3JFdmVudCxcbiAgICAgICAgKTtcbiAgICB9XG5cbiAgICByZW5kZXIoKSB7XG4gICAgICAgIGNvbnN0IHBvbGwgPSB0aGlzLnByb3BzLm14RXZlbnQudW5zdGFibGVFeHRlbnNpYmxlRXZlbnQgYXMgUG9sbFN0YXJ0RXZlbnQ7XG4gICAgICAgIGlmICghcG9sbD8uaXNFcXVpdmFsZW50VG8oTV9QT0xMX1NUQVJUKSkgcmV0dXJuIG51bGw7IC8vIGludmFsaWRcblxuICAgICAgICBjb25zdCBlbmRlZCA9IHRoaXMuaXNFbmRlZCgpO1xuICAgICAgICBjb25zdCBwb2xsSWQgPSB0aGlzLnByb3BzLm14RXZlbnQuZ2V0SWQoKTtcbiAgICAgICAgY29uc3QgdXNlclZvdGVzID0gdGhpcy5jb2xsZWN0VXNlclZvdGVzKCk7XG4gICAgICAgIGNvbnN0IHZvdGVzID0gY291bnRWb3Rlcyh1c2VyVm90ZXMsIHBvbGwpO1xuICAgICAgICBjb25zdCB0b3RhbFZvdGVzID0gdGhpcy50b3RhbFZvdGVzKHZvdGVzKTtcbiAgICAgICAgY29uc3Qgd2luQ291bnQgPSBNYXRoLm1heCguLi52b3Rlcy52YWx1ZXMoKSk7XG4gICAgICAgIGNvbnN0IHVzZXJJZCA9IHRoaXMuY29udGV4dC5nZXRVc2VySWQoKTtcbiAgICAgICAgY29uc3QgbXlWb3RlID0gdXNlclZvdGVzLmdldCh1c2VySWQpPy5hbnN3ZXJzWzBdO1xuICAgICAgICBjb25zdCBkaXNjbG9zZWQgPSBNX1BPTExfS0lORF9ESVNDTE9TRUQubWF0Y2hlcyhwb2xsLmtpbmQubmFtZSk7XG5cbiAgICAgICAgLy8gRGlzY2xvc2VkOiB2b3RlcyBhcmUgaGlkZGVuIHVudGlsIEkgdm90ZSBvciB0aGUgcG9sbCBlbmRzXG4gICAgICAgIC8vIFVuZGlzY2xvc2VkOiB2b3RlcyBhcmUgaGlkZGVuIHVudGlsIHBvbGwgZW5kc1xuICAgICAgICBjb25zdCBzaG93UmVzdWx0cyA9IGVuZGVkIHx8IChkaXNjbG9zZWQgJiYgbXlWb3RlICE9PSB1bmRlZmluZWQpO1xuXG4gICAgICAgIGxldCB0b3RhbFRleHQ6IHN0cmluZztcbiAgICAgICAgaWYgKGVuZGVkKSB7XG4gICAgICAgICAgICB0b3RhbFRleHQgPSBfdChcbiAgICAgICAgICAgICAgICBcIkZpbmFsIHJlc3VsdCBiYXNlZCBvbiAlKGNvdW50KXMgdm90ZXNcIixcbiAgICAgICAgICAgICAgICB7IGNvdW50OiB0b3RhbFZvdGVzIH0sXG4gICAgICAgICAgICApO1xuICAgICAgICB9IGVsc2UgaWYgKCFkaXNjbG9zZWQpIHtcbiAgICAgICAgICAgIHRvdGFsVGV4dCA9IF90KFwiUmVzdWx0cyB3aWxsIGJlIHZpc2libGUgd2hlbiB0aGUgcG9sbCBpcyBlbmRlZFwiKTtcbiAgICAgICAgfSBlbHNlIGlmIChteVZvdGUgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgaWYgKHRvdGFsVm90ZXMgPT09IDApIHtcbiAgICAgICAgICAgICAgICB0b3RhbFRleHQgPSBfdChcIk5vIHZvdGVzIGNhc3RcIik7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRvdGFsVGV4dCA9IF90KFxuICAgICAgICAgICAgICAgICAgICBcIiUoY291bnQpcyB2b3RlcyBjYXN0LiBWb3RlIHRvIHNlZSB0aGUgcmVzdWx0c1wiLFxuICAgICAgICAgICAgICAgICAgICB7IGNvdW50OiB0b3RhbFZvdGVzIH0sXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRvdGFsVGV4dCA9IF90KFwiQmFzZWQgb24gJShjb3VudClzIHZvdGVzXCIsIHsgY291bnQ6IHRvdGFsVm90ZXMgfSk7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBlZGl0ZWRTcGFuID0gKFxuICAgICAgICAgICAgdGhpcy5wcm9wcy5teEV2ZW50LnJlcGxhY2luZ0V2ZW50KClcbiAgICAgICAgICAgICAgICA/IDxzcGFuIGNsYXNzTmFtZT1cIm14X01Qb2xsQm9keV9lZGl0ZWRcIj4gKHsgX3QoXCJlZGl0ZWRcIikgfSk8L3NwYW4+XG4gICAgICAgICAgICAgICAgOiBudWxsXG4gICAgICAgICk7XG5cbiAgICAgICAgcmV0dXJuIDxkaXYgY2xhc3NOYW1lPVwibXhfTVBvbGxCb2R5XCI+XG4gICAgICAgICAgICA8aDI+eyBwb2xsLnF1ZXN0aW9uLnRleHQgfXsgZWRpdGVkU3BhbiB9PC9oMj5cbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfTVBvbGxCb2R5X2FsbE9wdGlvbnNcIj5cbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIHBvbGwuYW5zd2Vycy5tYXAoKGFuc3dlcjogUG9sbEFuc3dlclN1YmV2ZW50KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgYW5zd2VyVm90ZXMgPSAwO1xuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHZvdGVzVGV4dCA9IFwiXCI7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChzaG93UmVzdWx0cykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFuc3dlclZvdGVzID0gdm90ZXMuZ2V0KGFuc3dlci5pZCkgPz8gMDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2b3Rlc1RleHQgPSBfdChcIiUoY291bnQpcyB2b3Rlc1wiLCB7IGNvdW50OiBhbnN3ZXJWb3RlcyB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgY2hlY2tlZCA9IChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAoIWVuZGVkICYmIG15Vm90ZSA9PT0gYW5zd2VyLmlkKSB8fFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIChlbmRlZCAmJiBhbnN3ZXJWb3RlcyA9PT0gd2luQ291bnQpXG4gICAgICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgY2xzID0gY2xhc3NOYW1lcyh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJteF9NUG9sbEJvZHlfb3B0aW9uXCI6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJteF9NUG9sbEJvZHlfb3B0aW9uX2NoZWNrZWRcIjogY2hlY2tlZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIm14X01Qb2xsQm9keV9vcHRpb25fZW5kZWRcIjogZW5kZWQsXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgYW5zd2VyUGVyY2VudCA9IChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0b3RhbFZvdGVzID09PSAwXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgID8gMFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA6IE1hdGgucm91bmQoMTAwLjAgKiBhbnN3ZXJWb3RlcyAvIHRvdGFsVm90ZXMpXG4gICAgICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIDxkaXZcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBrZXk9e2Fuc3dlci5pZH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9e2Nsc31cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiB0aGlzLnNlbGVjdE9wdGlvbihhbnN3ZXIuaWQpfVxuICAgICAgICAgICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsgKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbmRlZFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPyA8RW5kZWRQb2xsT3B0aW9uXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYW5zd2VyPXthbnN3ZXJ9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hlY2tlZD17Y2hlY2tlZH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2b3Rlc1RleHQ9e3ZvdGVzVGV4dH0gLz5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDogPExpdmVQb2xsT3B0aW9uXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcG9sbElkPXtwb2xsSWR9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYW5zd2VyPXthbnN3ZXJ9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hlY2tlZD17Y2hlY2tlZH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2b3Rlc1RleHQ9e3ZvdGVzVGV4dH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbk9wdGlvblNlbGVjdGVkPXt0aGlzLm9uT3B0aW9uU2VsZWN0ZWR9IC8+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKSB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9NUG9sbEJvZHlfcG9wdWxhcml0eUJhY2tncm91bmRcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwibXhfTVBvbGxCb2R5X3BvcHVsYXJpdHlBbW91bnRcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3R5bGU9e3sgXCJ3aWR0aFwiOiBgJHthbnN3ZXJQZXJjZW50fSVgIH19XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj47XG4gICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X01Qb2xsQm9keV90b3RhbFZvdGVzXCI+XG4gICAgICAgICAgICAgICAgeyB0b3RhbFRleHQgfVxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvZGl2PjtcbiAgICB9XG59XG5cbmludGVyZmFjZSBJRW5kZWRQb2xsT3B0aW9uUHJvcHMge1xuICAgIGFuc3dlcjogUG9sbEFuc3dlclN1YmV2ZW50O1xuICAgIGNoZWNrZWQ6IGJvb2xlYW47XG4gICAgdm90ZXNUZXh0OiBzdHJpbmc7XG59XG5cbmZ1bmN0aW9uIEVuZGVkUG9sbE9wdGlvbihwcm9wczogSUVuZGVkUG9sbE9wdGlvblByb3BzKSB7XG4gICAgY29uc3QgY2xzID0gY2xhc3NOYW1lcyh7XG4gICAgICAgIFwibXhfTVBvbGxCb2R5X2VuZGVkT3B0aW9uXCI6IHRydWUsXG4gICAgICAgIFwibXhfTVBvbGxCb2R5X2VuZGVkT3B0aW9uV2lubmVyXCI6IHByb3BzLmNoZWNrZWQsXG4gICAgfSk7XG4gICAgcmV0dXJuIDxkaXYgY2xhc3NOYW1lPXtjbHN9IGRhdGEtdmFsdWU9e3Byb3BzLmFuc3dlci5pZH0+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfTVBvbGxCb2R5X29wdGlvbkRlc2NyaXB0aW9uXCI+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X01Qb2xsQm9keV9vcHRpb25UZXh0XCI+XG4gICAgICAgICAgICAgICAgeyBwcm9wcy5hbnN3ZXIudGV4dCB9XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfTVBvbGxCb2R5X29wdGlvblZvdGVDb3VudFwiPlxuICAgICAgICAgICAgICAgIHsgcHJvcHMudm90ZXNUZXh0IH1cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L2Rpdj5cbiAgICA8L2Rpdj47XG59XG5cbmludGVyZmFjZSBJTGl2ZVBvbGxPcHRpb25Qcm9wcyB7XG4gICAgcG9sbElkOiBzdHJpbmc7XG4gICAgYW5zd2VyOiBQb2xsQW5zd2VyU3ViZXZlbnQ7XG4gICAgY2hlY2tlZDogYm9vbGVhbjtcbiAgICB2b3Rlc1RleHQ6IHN0cmluZztcbiAgICBvbk9wdGlvblNlbGVjdGVkOiAoZTogUmVhY3QuRm9ybUV2ZW50PEhUTUxJbnB1dEVsZW1lbnQ+KSA9PiB2b2lkO1xufVxuXG5mdW5jdGlvbiBMaXZlUG9sbE9wdGlvbihwcm9wczogSUxpdmVQb2xsT3B0aW9uUHJvcHMpIHtcbiAgICByZXR1cm4gPFN0eWxlZFJhZGlvQnV0dG9uXG4gICAgICAgIGNsYXNzTmFtZT1cIm14X01Qb2xsQm9keV9saXZlLW9wdGlvblwiXG4gICAgICAgIG5hbWU9e2Bwb2xsX2Fuc3dlcl9zZWxlY3QtJHtwcm9wcy5wb2xsSWR9YH1cbiAgICAgICAgdmFsdWU9e3Byb3BzLmFuc3dlci5pZH1cbiAgICAgICAgY2hlY2tlZD17cHJvcHMuY2hlY2tlZH1cbiAgICAgICAgb25DaGFuZ2U9e3Byb3BzLm9uT3B0aW9uU2VsZWN0ZWR9XG4gICAgPlxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X01Qb2xsQm9keV9vcHRpb25EZXNjcmlwdGlvblwiPlxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9NUG9sbEJvZHlfb3B0aW9uVGV4dFwiPlxuICAgICAgICAgICAgICAgIHsgcHJvcHMuYW5zd2VyLnRleHQgfVxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X01Qb2xsQm9keV9vcHRpb25Wb3RlQ291bnRcIj5cbiAgICAgICAgICAgICAgICB7IHByb3BzLnZvdGVzVGV4dCB9XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9kaXY+XG4gICAgPC9TdHlsZWRSYWRpb0J1dHRvbj47XG59XG5cbmV4cG9ydCBjbGFzcyBVc2VyVm90ZSB7XG4gICAgY29uc3RydWN0b3IocHVibGljIHJlYWRvbmx5IHRzOiBudW1iZXIsIHB1YmxpYyByZWFkb25seSBzZW5kZXI6IHN0cmluZywgcHVibGljIHJlYWRvbmx5IGFuc3dlcnM6IHN0cmluZ1tdKSB7XG4gICAgfVxufVxuXG5mdW5jdGlvbiB1c2VyUmVzcG9uc2VGcm9tUG9sbFJlc3BvbnNlRXZlbnQoZXZlbnQ6IE1hdHJpeEV2ZW50KTogVXNlclZvdGUge1xuICAgIGNvbnN0IHJlc3BvbnNlID0gZXZlbnQudW5zdGFibGVFeHRlbnNpYmxlRXZlbnQgYXMgUG9sbFJlc3BvbnNlRXZlbnQ7XG4gICAgaWYgKCFyZXNwb25zZT8uaXNFcXVpdmFsZW50VG8oTV9QT0xMX1JFU1BPTlNFKSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJGYWlsZWQgdG8gcGFyc2UgUG9sbCBSZXNwb25zZSBFdmVudCB0byBkZXRlcm1pbmUgdXNlciByZXNwb25zZVwiKTtcbiAgICB9XG5cbiAgICByZXR1cm4gbmV3IFVzZXJWb3RlKFxuICAgICAgICBldmVudC5nZXRUcygpLFxuICAgICAgICBldmVudC5nZXRTZW5kZXIoKSxcbiAgICAgICAgcmVzcG9uc2UuYW5zd2VySWRzLFxuICAgICk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBhbGxWb3RlcyhcbiAgICBwb2xsRXZlbnQ6IE1hdHJpeEV2ZW50LFxuICAgIG1hdHJpeENsaWVudDogTWF0cml4Q2xpZW50LFxuICAgIHZvdGVSZWxhdGlvbnM6IFJlbGF0ZWRSZWxhdGlvbnMsXG4gICAgZW5kUmVsYXRpb25zOiBSZWxhdGVkUmVsYXRpb25zLFxuKTogQXJyYXk8VXNlclZvdGU+IHtcbiAgICBjb25zdCBlbmRUcyA9IHBvbGxFbmRUcyhwb2xsRXZlbnQsIG1hdHJpeENsaWVudCwgZW5kUmVsYXRpb25zKTtcblxuICAgIGZ1bmN0aW9uIGlzT25PckJlZm9yZUVuZChyZXNwb25zZUV2ZW50OiBNYXRyaXhFdmVudCk6IGJvb2xlYW4ge1xuICAgICAgICAvLyBGcm9tIE1TQzMzODE6XG4gICAgICAgIC8vIFwiVm90ZXMgc2VudCBvbiBvciBiZWZvcmUgdGhlIGVuZCBldmVudCdzIHRpbWVzdGFtcCBhcmUgdmFsaWQgdm90ZXNcIlxuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgZW5kVHMgPT09IG51bGwgfHxcbiAgICAgICAgICAgIHJlc3BvbnNlRXZlbnQuZ2V0VHMoKSA8PSBlbmRUc1xuICAgICAgICApO1xuICAgIH1cblxuICAgIGlmICh2b3RlUmVsYXRpb25zKSB7XG4gICAgICAgIHJldHVybiB2b3RlUmVsYXRpb25zLmdldFJlbGF0aW9ucygpXG4gICAgICAgICAgICAuZmlsdGVyKGlzUG9sbFJlc3BvbnNlKVxuICAgICAgICAgICAgLmZpbHRlcihpc09uT3JCZWZvcmVFbmQpXG4gICAgICAgICAgICAubWFwKHVzZXJSZXNwb25zZUZyb21Qb2xsUmVzcG9uc2VFdmVudCk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIFtdO1xuICAgIH1cbn1cblxuLyoqXG4gKiBSZXR1cm5zIHRoZSBlYXJsaWVzdCB0aW1lc3RhbXAgZnJvbSB0aGUgc3VwcGxpZWQgbGlzdCBvZiBlbmRfcG9sbCBldmVudHNcbiAqIG9yIG51bGwgaWYgdGhlcmUgYXJlIG5vIGF1dGhvcmlzZWQgZXZlbnRzLlxuICovXG5leHBvcnQgZnVuY3Rpb24gcG9sbEVuZFRzKFxuICAgIHBvbGxFdmVudDogTWF0cml4RXZlbnQsXG4gICAgbWF0cml4Q2xpZW50OiBNYXRyaXhDbGllbnQsXG4gICAgZW5kUmVsYXRpb25zOiBSZWxhdGVkUmVsYXRpb25zLFxuKTogbnVtYmVyIHwgbnVsbCB7XG4gICAgaWYgKCFlbmRSZWxhdGlvbnMpIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgY29uc3Qgcm9vbUN1cnJlbnRTdGF0ZSA9IG1hdHJpeENsaWVudC5nZXRSb29tKHBvbGxFdmVudC5nZXRSb29tSWQoKSkuY3VycmVudFN0YXRlO1xuICAgIGZ1bmN0aW9uIHVzZXJDYW5SZWRhY3QoZW5kRXZlbnQ6IE1hdHJpeEV2ZW50KSB7XG4gICAgICAgIHJldHVybiByb29tQ3VycmVudFN0YXRlLm1heVNlbmRSZWRhY3Rpb25Gb3JFdmVudChcbiAgICAgICAgICAgIHBvbGxFdmVudCxcbiAgICAgICAgICAgIGVuZEV2ZW50LmdldFNlbmRlcigpLFxuICAgICAgICApO1xuICAgIH1cblxuICAgIGNvbnN0IHRzczogbnVtYmVyW10gPSAoXG4gICAgICAgIGVuZFJlbGF0aW9uc1xuICAgICAgICAgICAgLmdldFJlbGF0aW9ucygpXG4gICAgICAgICAgICAuZmlsdGVyKHVzZXJDYW5SZWRhY3QpXG4gICAgICAgICAgICAubWFwKChldnQ6IE1hdHJpeEV2ZW50KSA9PiBldnQuZ2V0VHMoKSlcbiAgICApO1xuXG4gICAgaWYgKHRzcy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIE1hdGgubWluKC4uLnRzcyk7XG4gICAgfVxufVxuXG5mdW5jdGlvbiBpc1BvbGxSZXNwb25zZShyZXNwb25zZUV2ZW50OiBNYXRyaXhFdmVudCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiByZXNwb25zZUV2ZW50LnVuc3RhYmxlRXh0ZW5zaWJsZUV2ZW50Py5pc0VxdWl2YWxlbnRUbyhNX1BPTExfUkVTUE9OU0UpO1xufVxuXG4vKipcbiAqIEZpZ3VyZSBvdXQgdGhlIGNvcnJlY3Qgdm90ZSBmb3IgZWFjaCB1c2VyLlxuICogQHJldHVybnMgYSBNYXAgb2YgdXNlciBJRCB0byB0aGVpciB2b3RlIGluZm9cbiAqL1xuZnVuY3Rpb24gY29sbGVjdFVzZXJWb3RlcyhcbiAgICB1c2VyUmVzcG9uc2VzOiBBcnJheTxVc2VyVm90ZT4sXG4gICAgdXNlcklkOiBzdHJpbmcsXG4gICAgc2VsZWN0ZWQ/OiBzdHJpbmcsXG4pOiBNYXA8c3RyaW5nLCBVc2VyVm90ZT4ge1xuICAgIGNvbnN0IHVzZXJWb3RlczogTWFwPHN0cmluZywgVXNlclZvdGU+ID0gbmV3IE1hcCgpO1xuXG4gICAgZm9yIChjb25zdCByZXNwb25zZSBvZiB1c2VyUmVzcG9uc2VzKSB7XG4gICAgICAgIGNvbnN0IG90aGVyUmVzcG9uc2UgPSB1c2VyVm90ZXMuZ2V0KHJlc3BvbnNlLnNlbmRlcik7XG4gICAgICAgIGlmICghb3RoZXJSZXNwb25zZSB8fCBvdGhlclJlc3BvbnNlLnRzIDwgcmVzcG9uc2UudHMpIHtcbiAgICAgICAgICAgIHVzZXJWb3Rlcy5zZXQocmVzcG9uc2Uuc2VuZGVyLCByZXNwb25zZSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoc2VsZWN0ZWQpIHtcbiAgICAgICAgdXNlclZvdGVzLnNldCh1c2VySWQsIG5ldyBVc2VyVm90ZSgwLCB1c2VySWQsIFtzZWxlY3RlZF0pKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdXNlclZvdGVzO1xufVxuXG5mdW5jdGlvbiBjb3VudFZvdGVzKFxuICAgIHVzZXJWb3RlczogTWFwPHN0cmluZywgVXNlclZvdGU+LFxuICAgIHBvbGxTdGFydDogUG9sbFN0YXJ0RXZlbnQsXG4pOiBNYXA8c3RyaW5nLCBudW1iZXI+IHtcbiAgICBjb25zdCBjb2xsZWN0ZWQgPSBuZXcgTWFwPHN0cmluZywgbnVtYmVyPigpO1xuXG4gICAgZm9yIChjb25zdCByZXNwb25zZSBvZiB1c2VyVm90ZXMudmFsdWVzKCkpIHtcbiAgICAgICAgY29uc3QgdGVtcFJlc3BvbnNlID0gUG9sbFJlc3BvbnNlRXZlbnQuZnJvbShyZXNwb25zZS5hbnN3ZXJzLCBcIiRpcnJlbGV2YW50XCIpO1xuICAgICAgICB0ZW1wUmVzcG9uc2UudmFsaWRhdGVBZ2FpbnN0KHBvbGxTdGFydCk7XG4gICAgICAgIGlmICghdGVtcFJlc3BvbnNlLnNwb2lsZWQpIHtcbiAgICAgICAgICAgIGZvciAoY29uc3QgYW5zd2VySWQgb2YgdGVtcFJlc3BvbnNlLmFuc3dlcklkcykge1xuICAgICAgICAgICAgICAgIGlmIChjb2xsZWN0ZWQuaGFzKGFuc3dlcklkKSkge1xuICAgICAgICAgICAgICAgICAgICBjb2xsZWN0ZWQuc2V0KGFuc3dlcklkLCBjb2xsZWN0ZWQuZ2V0KGFuc3dlcklkKSArIDEpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbGxlY3RlZC5zZXQoYW5zd2VySWQsIDEpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBjb2xsZWN0ZWQ7XG59XG4iXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFnQkE7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBRUE7O0FBVUE7O0FBRUE7O0FBQ0E7O0FBRUE7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBRUE7O0FBQ0E7O0FBMUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtB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