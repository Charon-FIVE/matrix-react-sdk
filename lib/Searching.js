"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = eventSearch;
exports.searchPagination = searchPagination;

var _search = require("matrix-js-sdk/src/@types/search");

var _event = require("matrix-js-sdk/src/@types/event");

var _EventIndexPeg = _interopRequireDefault(require("./indexing/EventIndexPeg"));

var _MatrixClientPeg = require("./MatrixClientPeg");

/*
Copyright 2019 - 2021 The Matrix.org Foundation C.I.C.

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
const SEARCH_LIMIT = 10;

async function serverSideSearch(term) {
  let roomId = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : undefined;

  const client = _MatrixClientPeg.MatrixClientPeg.get();

  const filter = {
    limit: SEARCH_LIMIT
  };
  if (roomId !== undefined) filter.rooms = [roomId];
  const body = {
    search_categories: {
      room_events: {
        search_term: term,
        filter: filter,
        order_by: _search.SearchOrderBy.Recent,
        event_context: {
          before_limit: 1,
          after_limit: 1,
          include_profile: true
        }
      }
    }
  };
  const response = await client.search({
    body: body
  });
  return {
    response,
    query: body
  };
}

async function serverSideSearchProcess(term) {
  let roomId = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : undefined;

  const client = _MatrixClientPeg.MatrixClientPeg.get();

  const result = await serverSideSearch(term, roomId); // The js-sdk method backPaginateRoomEventsSearch() uses _query internally
  // so we're reusing the concept here since we want to delegate the
  // pagination back to backPaginateRoomEventsSearch() in some cases.

  const searchResults = {
    _query: result.query,
    results: [],
    highlights: []
  };
  return client.processRoomEventsSearch(searchResults, result.response);
}

function compareEvents(a, b) {
  const aEvent = a.result;
  const bEvent = b.result;
  if (aEvent.origin_server_ts > bEvent.origin_server_ts) return -1;
  if (aEvent.origin_server_ts < bEvent.origin_server_ts) return 1;
  return 0;
}

async function combinedSearch(searchTerm) {
  const client = _MatrixClientPeg.MatrixClientPeg.get(); // Create two promises, one for the local search, one for the
  // server-side search.


  const serverSidePromise = serverSideSearch(searchTerm);
  const localPromise = localSearch(searchTerm); // Wait for both promises to resolve.

  await Promise.all([serverSidePromise, localPromise]); // Get both search results.

  const localResult = await localPromise;
  const serverSideResult = await serverSidePromise;
  const serverQuery = serverSideResult.query;
  const serverResponse = serverSideResult.response;
  const localQuery = localResult.query;
  const localResponse = localResult.response; // Store our queries for later on so we can support pagination.
  //
  // We're reusing _query here again to not introduce separate code paths and
  // concepts for our different pagination methods. We're storing the
  // server-side next batch separately since the query is the json body of
  // the request and next_batch needs to be a query parameter.
  //
  // We can't put it in the final result that _processRoomEventsSearch()
  // returns since that one can be either a server-side one, a local one or a
  // fake one to fetch the remaining cached events. See the docs for
  // combineEvents() for an explanation why we need to cache events.

  const emptyResult = {
    seshatQuery: localQuery,
    _query: serverQuery,
    serverSideNextBatch: serverResponse.search_categories.room_events.next_batch,
    cachedEvents: [],
    oldestEventFrom: "server",
    results: [],
    highlights: []
  }; // Combine our results.

  const combinedResult = combineResponses(emptyResult, localResponse, serverResponse.search_categories.room_events); // Let the client process the combined result.

  const response = {
    search_categories: {
      room_events: combinedResult
    }
  };
  const result = client.processRoomEventsSearch(emptyResult, response); // Restore our encryption info so we can properly re-verify the events.

  restoreEncryptionInfo(result.results);
  return result;
}

async function localSearch(searchTerm) {
  let roomId = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : undefined;
  let processResult = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;

  const eventIndex = _EventIndexPeg.default.get();

  const searchArgs = {
    search_term: searchTerm,
    before_limit: 1,
    after_limit: 1,
    limit: SEARCH_LIMIT,
    order_by_recency: true,
    room_id: undefined
  };

  if (roomId !== undefined) {
    searchArgs.room_id = roomId;
  }

  const localResult = await eventIndex.search(searchArgs);
  searchArgs.next_batch = localResult.next_batch;
  const result = {
    response: localResult,
    query: searchArgs
  };
  return result;
}

async function localSearchProcess(searchTerm) {
  let roomId = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : undefined;
  const emptyResult = {
    results: [],
    highlights: []
  };
  if (searchTerm === "") return emptyResult;
  const result = await localSearch(searchTerm, roomId);
  emptyResult.seshatQuery = result.query;
  const response = {
    search_categories: {
      room_events: result.response
    }
  };

  const processedResult = _MatrixClientPeg.MatrixClientPeg.get().processRoomEventsSearch(emptyResult, response); // Restore our encryption info so we can properly re-verify the events.


  restoreEncryptionInfo(processedResult.results);
  return processedResult;
}

async function localPagination(searchResult) {
  const eventIndex = _EventIndexPeg.default.get();

  const searchArgs = searchResult.seshatQuery;
  const localResult = await eventIndex.search(searchArgs);
  searchResult.seshatQuery.next_batch = localResult.next_batch; // We only need to restore the encryption state for the new results, so
  // remember how many of them we got.

  const newResultCount = localResult.results.length;
  const response = {
    search_categories: {
      room_events: localResult
    }
  };

  const result = _MatrixClientPeg.MatrixClientPeg.get().processRoomEventsSearch(searchResult, response); // Restore our encryption info so we can properly re-verify the events.


  const newSlice = result.results.slice(Math.max(result.results.length - newResultCount, 0));
  restoreEncryptionInfo(newSlice);
  searchResult.pendingRequest = null;
  return result;
}

function compareOldestEvents(firstResults, secondResults) {
  try {
    const oldestFirstEvent = firstResults[firstResults.length - 1].result;
    const oldestSecondEvent = secondResults[secondResults.length - 1].result;

    if (oldestFirstEvent.origin_server_ts <= oldestSecondEvent.origin_server_ts) {
      return -1;
    } else {
      return 1;
    }
  } catch {
    return 0;
  }
}

function combineEventSources(previousSearchResult, response, a, b) {
  // Merge event sources and sort the events.
  const combinedEvents = a.concat(b).sort(compareEvents); // Put half of the events in the response, and cache the other half.

  response.results = combinedEvents.slice(0, SEARCH_LIMIT);
  previousSearchResult.cachedEvents = combinedEvents.slice(SEARCH_LIMIT);
}
/**
 * Combine the events from our event sources into a sorted result
 *
 * This method will first be called from the combinedSearch() method. In this
 * case we will fetch SEARCH_LIMIT events from the server and the local index.
 *
 * The method will put the SEARCH_LIMIT newest events from the server and the
 * local index in the results part of the response, the rest will be put in the
 * cachedEvents field of the previousSearchResult (in this case an empty search
 * result).
 *
 * Every subsequent call will be made from the combinedPagination() method, in
 * this case we will combine the cachedEvents and the next SEARCH_LIMIT events
 * from either the server or the local index.
 *
 * Since we have two event sources and we need to sort the results by date we
 * need keep on looking for the oldest event. We are implementing a variation of
 * a sliding window.
 *
 * The event sources are here represented as two sorted lists where the smallest
 * number represents the newest event. The two lists need to be merged in a way
 * that preserves the sorted property so they can be shown as one search result.
 * We first fetch SEARCH_LIMIT events from both sources.
 *
 * If we set SEARCH_LIMIT to 3:
 *
 *  Server events [01, 02, 04, 06, 07, 08, 11, 13]
 *                |01, 02, 04|
 *  Local events  [03, 05, 09, 10, 12, 14, 15, 16]
 *                |03, 05, 09|
 *
 *  We note that the oldest event is from the local index, and we combine the
 *  results:
 *
 *  Server window [01, 02, 04]
 *  Local window  [03, 05, 09]
 *
 *  Combined events [01, 02, 03, 04, 05, 09]
 *
 *  We split the combined result in the part that we want to present and a part
 *  that will be cached.
 *
 *  Presented events [01, 02, 03]
 *  Cached events    [04, 05, 09]
 *
 *  We slide the window for the server since the oldest event is from the local
 *  index.
 *
 *  Server events [01, 02, 04, 06, 07, 08, 11, 13]
 *                            |06, 07, 08|
 *  Local events  [03, 05, 09, 10, 12, 14, 15, 16]
 *                |XX, XX, XX|
 *  Cached events [04, 05, 09]
 *
 *  We note that the oldest event is from the server and we combine the new
 *  server events with the cached ones.
 *
 *  Cached events [04, 05, 09]
 *  Server events [06, 07, 08]
 *
 *  Combined events [04, 05, 06, 07, 08, 09]
 *
 *  We split again.
 *
 *  Presented events [04, 05, 06]
 *  Cached events    [07, 08, 09]
 *
 *  We slide the local window, the oldest event is on the server.
 *
 *  Server events [01, 02, 04, 06, 07, 08, 11, 13]
 *                            |XX, XX, XX|
 *  Local events  [03, 05, 09, 10, 12, 14, 15, 16]
 *                            |10, 12, 14|
 *
 *  Cached events [07, 08, 09]
 *  Local events  [10, 12, 14]
 *  Combined events [07, 08, 09, 10, 12, 14]
 *
 *  Presented events [07, 08, 09]
 *  Cached events    [10, 12, 14]
 *
 *  Next up we slide the server window again.
 *
 *  Server events [01, 02, 04, 06, 07, 08, 11, 13]
 *                                        |11, 13|
 *  Local events  [03, 05, 09, 10, 12, 14, 15, 16]
 *                            |XX, XX, XX|
 *
 *  Cached events [10, 12, 14]
 *  Server events [11, 13]
 *  Combined events [10, 11, 12, 13, 14]
 *
 *  Presented events [10, 11, 12]
 *  Cached events    [13, 14]
 *
 *  We have one source exhausted, we fetch the rest of our events from the other
 *  source and combine it with our cached events.
 *
 *
 * @param {object} previousSearchResult A search result from a previous search
 * call.
 * @param {object} localEvents An unprocessed search result from the event
 * index.
 * @param {object} serverEvents An unprocessed search result from the server.
 *
 * @return {object} A response object that combines the events from the
 * different event sources.
 *
 */


function combineEvents(previousSearchResult) {
  let localEvents = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : undefined;
  let serverEvents = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : undefined;
  const response = {};
  const cachedEvents = previousSearchResult.cachedEvents;
  let oldestEventFrom = previousSearchResult.oldestEventFrom;
  response.highlights = previousSearchResult.highlights;

  if (localEvents && serverEvents && serverEvents.results) {
    // This is a first search call, combine the events from the server and
    // the local index. Note where our oldest event came from, we shall
    // fetch the next batch of events from the other source.
    if (compareOldestEvents(localEvents.results, serverEvents.results) < 0) {
      oldestEventFrom = "local";
    }

    combineEventSources(previousSearchResult, response, localEvents.results, serverEvents.results);
    response.highlights = localEvents.highlights.concat(serverEvents.highlights);
  } else if (localEvents) {
    // This is a pagination call fetching more events from the local index,
    // meaning that our oldest event was on the server.
    // Change the source of the oldest event if our local event is older
    // than the cached one.
    if (compareOldestEvents(localEvents.results, cachedEvents) < 0) {
      oldestEventFrom = "local";
    }

    combineEventSources(previousSearchResult, response, localEvents.results, cachedEvents);
  } else if (serverEvents && serverEvents.results) {
    // This is a pagination call fetching more events from the server,
    // meaning that our oldest event was in the local index.
    // Change the source of the oldest event if our server event is older
    // than the cached one.
    if (compareOldestEvents(serverEvents.results, cachedEvents) < 0) {
      oldestEventFrom = "server";
    }

    combineEventSources(previousSearchResult, response, serverEvents.results, cachedEvents);
  } else {
    // This is a pagination call where we exhausted both of our event
    // sources, let's push the remaining cached events.
    response.results = cachedEvents;
    previousSearchResult.cachedEvents = [];
  }

  previousSearchResult.oldestEventFrom = oldestEventFrom;
  return response;
}
/**
 * Combine the local and server search responses
 *
 * @param {object} previousSearchResult A search result from a previous search
 * call.
 * @param {object} localEvents An unprocessed search result from the event
 * index.
 * @param {object} serverEvents An unprocessed search result from the server.
 *
 * @return {object} A response object that combines the events from the
 * different event sources.
 */


function combineResponses(previousSearchResult) {
  let localEvents = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : undefined;
  let serverEvents = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : undefined;
  // Combine our events first.
  const response = combineEvents(previousSearchResult, localEvents, serverEvents); // Our first search will contain counts from both sources, subsequent
  // pagination requests will fetch responses only from one of the sources, so
  // reuse the first count when we're paginating.

  if (previousSearchResult.count) {
    response.count = previousSearchResult.count;
  } else {
    response.count = localEvents.count + serverEvents.count;
  } // Update our next batch tokens for the given search sources.


  if (localEvents) {
    previousSearchResult.seshatQuery.next_batch = localEvents.next_batch;
  }

  if (serverEvents) {
    previousSearchResult.serverSideNextBatch = serverEvents.next_batch;
  } // Set the response next batch token to one of the tokens from the sources,
  // this makes sure that if we exhaust one of the sources we continue with
  // the other one.


  if (previousSearchResult.seshatQuery.next_batch) {
    response.next_batch = previousSearchResult.seshatQuery.next_batch;
  } else if (previousSearchResult.serverSideNextBatch) {
    response.next_batch = previousSearchResult.serverSideNextBatch;
  } // We collected all search results from the server as well as from Seshat,
  // we still have some events cached that we'll want to display on the next
  // pagination request.
  //
  // Provide a fake next batch token for that case.


  if (!response.next_batch && previousSearchResult.cachedEvents.length > 0) {
    response.next_batch = "cached";
  }

  return response;
}

function restoreEncryptionInfo() {
  let searchResultSlice = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];

  for (let i = 0; i < searchResultSlice.length; i++) {
    const timeline = searchResultSlice[i].context.getTimeline();

    for (let j = 0; j < timeline.length; j++) {
      const mxEv = timeline[j];
      const ev = mxEv.event;

      if (ev.curve25519Key) {
        mxEv.makeEncrypted(_event.EventType.RoomMessageEncrypted, {
          algorithm: ev.algorithm
        }, ev.curve25519Key, ev.ed25519Key); // @ts-ignore

        mxEv.forwardingCurve25519KeyChain = ev.forwardingCurve25519KeyChain;
        delete ev.curve25519Key;
        delete ev.ed25519Key;
        delete ev.algorithm;
        delete ev.forwardingCurve25519KeyChain;
      }
    }
  }
}

async function combinedPagination(searchResult) {
  const eventIndex = _EventIndexPeg.default.get();

  const client = _MatrixClientPeg.MatrixClientPeg.get();

  const searchArgs = searchResult.seshatQuery;
  const oldestEventFrom = searchResult.oldestEventFrom;
  let localResult;
  let serverSideResult; // Fetch events from the local index if we have a token for it and if it's
  // the local indexes turn or the server has exhausted its results.

  if (searchArgs.next_batch && (!searchResult.serverSideNextBatch || oldestEventFrom === "server")) {
    localResult = await eventIndex.search(searchArgs);
  } // Fetch events from the server if we have a token for it and if it's the
  // local indexes turn or the local index has exhausted its results.


  if (searchResult.serverSideNextBatch && (oldestEventFrom === "local" || !searchArgs.next_batch)) {
    const body = {
      body: searchResult._query,
      next_batch: searchResult.serverSideNextBatch
    };
    serverSideResult = await client.search(body);
  }

  let serverEvents;

  if (serverSideResult) {
    serverEvents = serverSideResult.search_categories.room_events;
  } // Combine our events.


  const combinedResult = combineResponses(searchResult, localResult, serverEvents);
  const response = {
    search_categories: {
      room_events: combinedResult
    }
  };
  const oldResultCount = searchResult.results ? searchResult.results.length : 0; // Let the client process the combined result.

  const result = client.processRoomEventsSearch(searchResult, response); // Restore our encryption info so we can properly re-verify the events.

  const newResultCount = result.results.length - oldResultCount;
  const newSlice = result.results.slice(Math.max(result.results.length - newResultCount, 0));
  restoreEncryptionInfo(newSlice);
  searchResult.pendingRequest = null;
  return result;
}

function eventIndexSearch(term) {
  let roomId = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : undefined;
  let searchPromise;

  if (roomId !== undefined) {
    if (_MatrixClientPeg.MatrixClientPeg.get().isRoomEncrypted(roomId)) {
      // The search is for a single encrypted room, use our local
      // search method.
      searchPromise = localSearchProcess(term, roomId);
    } else {
      // The search is for a single non-encrypted room, use the
      // server-side search.
      searchPromise = serverSideSearchProcess(term, roomId);
    }
  } else {
    // Search across all rooms, combine a server side search and a
    // local search.
    searchPromise = combinedSearch(term);
  }

  return searchPromise;
}

function eventIndexSearchPagination(searchResult) {
  const client = _MatrixClientPeg.MatrixClientPeg.get();

  const seshatQuery = searchResult.seshatQuery;
  const serverQuery = searchResult._query;

  if (!seshatQuery) {
    // This is a search in a non-encrypted room. Do the normal server-side
    // pagination.
    return client.backPaginateRoomEventsSearch(searchResult);
  } else if (!serverQuery) {
    // This is a search in a encrypted room. Do a local pagination.
    const promise = localPagination(searchResult);
    searchResult.pendingRequest = promise;
    return promise;
  } else {
    // We have both queries around, this is a search across all rooms so a
    // combined pagination needs to be done.
    const promise = combinedPagination(searchResult);
    searchResult.pendingRequest = promise;
    return promise;
  }
}

function searchPagination(searchResult) {
  const eventIndex = _EventIndexPeg.default.get();

  const client = _MatrixClientPeg.MatrixClientPeg.get();

  if (searchResult.pendingRequest) return searchResult.pendingRequest;
  if (eventIndex === null) return client.backPaginateRoomEventsSearch(searchResult);else return eventIndexSearchPagination(searchResult);
}

function eventSearch(term) {
  let roomId = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : undefined;

  const eventIndex = _EventIndexPeg.default.get();

  if (eventIndex === null) return serverSideSearchProcess(term, roomId);else return eventIndexSearch(term, roomId);
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJTRUFSQ0hfTElNSVQiLCJzZXJ2ZXJTaWRlU2VhcmNoIiwidGVybSIsInJvb21JZCIsInVuZGVmaW5lZCIsImNsaWVudCIsIk1hdHJpeENsaWVudFBlZyIsImdldCIsImZpbHRlciIsImxpbWl0Iiwicm9vbXMiLCJib2R5Iiwic2VhcmNoX2NhdGVnb3JpZXMiLCJyb29tX2V2ZW50cyIsInNlYXJjaF90ZXJtIiwib3JkZXJfYnkiLCJTZWFyY2hPcmRlckJ5IiwiUmVjZW50IiwiZXZlbnRfY29udGV4dCIsImJlZm9yZV9saW1pdCIsImFmdGVyX2xpbWl0IiwiaW5jbHVkZV9wcm9maWxlIiwicmVzcG9uc2UiLCJzZWFyY2giLCJxdWVyeSIsInNlcnZlclNpZGVTZWFyY2hQcm9jZXNzIiwicmVzdWx0Iiwic2VhcmNoUmVzdWx0cyIsIl9xdWVyeSIsInJlc3VsdHMiLCJoaWdobGlnaHRzIiwicHJvY2Vzc1Jvb21FdmVudHNTZWFyY2giLCJjb21wYXJlRXZlbnRzIiwiYSIsImIiLCJhRXZlbnQiLCJiRXZlbnQiLCJvcmlnaW5fc2VydmVyX3RzIiwiY29tYmluZWRTZWFyY2giLCJzZWFyY2hUZXJtIiwic2VydmVyU2lkZVByb21pc2UiLCJsb2NhbFByb21pc2UiLCJsb2NhbFNlYXJjaCIsIlByb21pc2UiLCJhbGwiLCJsb2NhbFJlc3VsdCIsInNlcnZlclNpZGVSZXN1bHQiLCJzZXJ2ZXJRdWVyeSIsInNlcnZlclJlc3BvbnNlIiwibG9jYWxRdWVyeSIsImxvY2FsUmVzcG9uc2UiLCJlbXB0eVJlc3VsdCIsInNlc2hhdFF1ZXJ5Iiwic2VydmVyU2lkZU5leHRCYXRjaCIsIm5leHRfYmF0Y2giLCJjYWNoZWRFdmVudHMiLCJvbGRlc3RFdmVudEZyb20iLCJjb21iaW5lZFJlc3VsdCIsImNvbWJpbmVSZXNwb25zZXMiLCJyZXN0b3JlRW5jcnlwdGlvbkluZm8iLCJwcm9jZXNzUmVzdWx0IiwiZXZlbnRJbmRleCIsIkV2ZW50SW5kZXhQZWciLCJzZWFyY2hBcmdzIiwib3JkZXJfYnlfcmVjZW5jeSIsInJvb21faWQiLCJsb2NhbFNlYXJjaFByb2Nlc3MiLCJwcm9jZXNzZWRSZXN1bHQiLCJsb2NhbFBhZ2luYXRpb24iLCJzZWFyY2hSZXN1bHQiLCJuZXdSZXN1bHRDb3VudCIsImxlbmd0aCIsIm5ld1NsaWNlIiwic2xpY2UiLCJNYXRoIiwibWF4IiwicGVuZGluZ1JlcXVlc3QiLCJjb21wYXJlT2xkZXN0RXZlbnRzIiwiZmlyc3RSZXN1bHRzIiwic2Vjb25kUmVzdWx0cyIsIm9sZGVzdEZpcnN0RXZlbnQiLCJvbGRlc3RTZWNvbmRFdmVudCIsImNvbWJpbmVFdmVudFNvdXJjZXMiLCJwcmV2aW91c1NlYXJjaFJlc3VsdCIsImNvbWJpbmVkRXZlbnRzIiwiY29uY2F0Iiwic29ydCIsImNvbWJpbmVFdmVudHMiLCJsb2NhbEV2ZW50cyIsInNlcnZlckV2ZW50cyIsImNvdW50Iiwic2VhcmNoUmVzdWx0U2xpY2UiLCJpIiwidGltZWxpbmUiLCJjb250ZXh0IiwiZ2V0VGltZWxpbmUiLCJqIiwibXhFdiIsImV2IiwiZXZlbnQiLCJjdXJ2ZTI1NTE5S2V5IiwibWFrZUVuY3J5cHRlZCIsIkV2ZW50VHlwZSIsIlJvb21NZXNzYWdlRW5jcnlwdGVkIiwiYWxnb3JpdGhtIiwiZWQyNTUxOUtleSIsImZvcndhcmRpbmdDdXJ2ZTI1NTE5S2V5Q2hhaW4iLCJjb21iaW5lZFBhZ2luYXRpb24iLCJvbGRSZXN1bHRDb3VudCIsImV2ZW50SW5kZXhTZWFyY2giLCJzZWFyY2hQcm9taXNlIiwiaXNSb29tRW5jcnlwdGVkIiwiZXZlbnRJbmRleFNlYXJjaFBhZ2luYXRpb24iLCJiYWNrUGFnaW5hdGVSb29tRXZlbnRzU2VhcmNoIiwicHJvbWlzZSIsInNlYXJjaFBhZ2luYXRpb24iLCJldmVudFNlYXJjaCJdLCJzb3VyY2VzIjpbIi4uL3NyYy9TZWFyY2hpbmcudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAyMDE5IC0gMjAyMSBUaGUgTWF0cml4Lm9yZyBGb3VuZGF0aW9uIEMuSS5DLlxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbmltcG9ydCB7XG4gICAgSVJlc3VsdFJvb21FdmVudHMsXG4gICAgSVNlYXJjaFJlcXVlc3RCb2R5LFxuICAgIElTZWFyY2hSZXNwb25zZSxcbiAgICBJU2VhcmNoUmVzdWx0LFxuICAgIElTZWFyY2hSZXN1bHRzLFxuICAgIFNlYXJjaE9yZGVyQnksXG59IGZyb20gXCJtYXRyaXgtanMtc2RrL3NyYy9AdHlwZXMvc2VhcmNoXCI7XG5pbXBvcnQgeyBJUm9vbUV2ZW50RmlsdGVyIH0gZnJvbSBcIm1hdHJpeC1qcy1zZGsvc3JjL2ZpbHRlclwiO1xuaW1wb3J0IHsgRXZlbnRUeXBlIH0gZnJvbSBcIm1hdHJpeC1qcy1zZGsvc3JjL0B0eXBlcy9ldmVudFwiO1xuaW1wb3J0IHsgU2VhcmNoUmVzdWx0IH0gZnJvbSBcIm1hdHJpeC1qcy1zZGsvc3JjL21vZGVscy9zZWFyY2gtcmVzdWx0XCI7XG5cbmltcG9ydCB7IElTZWFyY2hBcmdzIH0gZnJvbSBcIi4vaW5kZXhpbmcvQmFzZUV2ZW50SW5kZXhNYW5hZ2VyXCI7XG5pbXBvcnQgRXZlbnRJbmRleFBlZyBmcm9tIFwiLi9pbmRleGluZy9FdmVudEluZGV4UGVnXCI7XG5pbXBvcnQgeyBNYXRyaXhDbGllbnRQZWcgfSBmcm9tIFwiLi9NYXRyaXhDbGllbnRQZWdcIjtcblxuY29uc3QgU0VBUkNIX0xJTUlUID0gMTA7XG5cbmFzeW5jIGZ1bmN0aW9uIHNlcnZlclNpZGVTZWFyY2goXG4gICAgdGVybTogc3RyaW5nLFxuICAgIHJvb21JZDogc3RyaW5nID0gdW5kZWZpbmVkLFxuKTogUHJvbWlzZTx7IHJlc3BvbnNlOiBJU2VhcmNoUmVzcG9uc2UsIHF1ZXJ5OiBJU2VhcmNoUmVxdWVzdEJvZHkgfT4ge1xuICAgIGNvbnN0IGNsaWVudCA9IE1hdHJpeENsaWVudFBlZy5nZXQoKTtcblxuICAgIGNvbnN0IGZpbHRlcjogSVJvb21FdmVudEZpbHRlciA9IHtcbiAgICAgICAgbGltaXQ6IFNFQVJDSF9MSU1JVCxcbiAgICB9O1xuXG4gICAgaWYgKHJvb21JZCAhPT0gdW5kZWZpbmVkKSBmaWx0ZXIucm9vbXMgPSBbcm9vbUlkXTtcblxuICAgIGNvbnN0IGJvZHk6IElTZWFyY2hSZXF1ZXN0Qm9keSA9IHtcbiAgICAgICAgc2VhcmNoX2NhdGVnb3JpZXM6IHtcbiAgICAgICAgICAgIHJvb21fZXZlbnRzOiB7XG4gICAgICAgICAgICAgICAgc2VhcmNoX3Rlcm06IHRlcm0sXG4gICAgICAgICAgICAgICAgZmlsdGVyOiBmaWx0ZXIsXG4gICAgICAgICAgICAgICAgb3JkZXJfYnk6IFNlYXJjaE9yZGVyQnkuUmVjZW50LFxuICAgICAgICAgICAgICAgIGV2ZW50X2NvbnRleHQ6IHtcbiAgICAgICAgICAgICAgICAgICAgYmVmb3JlX2xpbWl0OiAxLFxuICAgICAgICAgICAgICAgICAgICBhZnRlcl9saW1pdDogMSxcbiAgICAgICAgICAgICAgICAgICAgaW5jbHVkZV9wcm9maWxlOiB0cnVlLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9LFxuICAgICAgICB9LFxuICAgIH07XG5cbiAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGNsaWVudC5zZWFyY2goeyBib2R5OiBib2R5IH0pO1xuXG4gICAgcmV0dXJuIHsgcmVzcG9uc2UsIHF1ZXJ5OiBib2R5IH07XG59XG5cbmFzeW5jIGZ1bmN0aW9uIHNlcnZlclNpZGVTZWFyY2hQcm9jZXNzKHRlcm06IHN0cmluZywgcm9vbUlkOiBzdHJpbmcgPSB1bmRlZmluZWQpOiBQcm9taXNlPElTZWFyY2hSZXN1bHRzPiB7XG4gICAgY29uc3QgY2xpZW50ID0gTWF0cml4Q2xpZW50UGVnLmdldCgpO1xuICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHNlcnZlclNpZGVTZWFyY2godGVybSwgcm9vbUlkKTtcblxuICAgIC8vIFRoZSBqcy1zZGsgbWV0aG9kIGJhY2tQYWdpbmF0ZVJvb21FdmVudHNTZWFyY2goKSB1c2VzIF9xdWVyeSBpbnRlcm5hbGx5XG4gICAgLy8gc28gd2UncmUgcmV1c2luZyB0aGUgY29uY2VwdCBoZXJlIHNpbmNlIHdlIHdhbnQgdG8gZGVsZWdhdGUgdGhlXG4gICAgLy8gcGFnaW5hdGlvbiBiYWNrIHRvIGJhY2tQYWdpbmF0ZVJvb21FdmVudHNTZWFyY2goKSBpbiBzb21lIGNhc2VzLlxuICAgIGNvbnN0IHNlYXJjaFJlc3VsdHM6IElTZWFyY2hSZXN1bHRzID0ge1xuICAgICAgICBfcXVlcnk6IHJlc3VsdC5xdWVyeSxcbiAgICAgICAgcmVzdWx0czogW10sXG4gICAgICAgIGhpZ2hsaWdodHM6IFtdLFxuICAgIH07XG5cbiAgICByZXR1cm4gY2xpZW50LnByb2Nlc3NSb29tRXZlbnRzU2VhcmNoKHNlYXJjaFJlc3VsdHMsIHJlc3VsdC5yZXNwb25zZSk7XG59XG5cbmZ1bmN0aW9uIGNvbXBhcmVFdmVudHMoYTogSVNlYXJjaFJlc3VsdCwgYjogSVNlYXJjaFJlc3VsdCk6IG51bWJlciB7XG4gICAgY29uc3QgYUV2ZW50ID0gYS5yZXN1bHQ7XG4gICAgY29uc3QgYkV2ZW50ID0gYi5yZXN1bHQ7XG5cbiAgICBpZiAoYUV2ZW50Lm9yaWdpbl9zZXJ2ZXJfdHMgPiBiRXZlbnQub3JpZ2luX3NlcnZlcl90cykgcmV0dXJuIC0xO1xuICAgIGlmIChhRXZlbnQub3JpZ2luX3NlcnZlcl90cyA8IGJFdmVudC5vcmlnaW5fc2VydmVyX3RzKSByZXR1cm4gMTtcblxuICAgIHJldHVybiAwO1xufVxuXG5hc3luYyBmdW5jdGlvbiBjb21iaW5lZFNlYXJjaChzZWFyY2hUZXJtOiBzdHJpbmcpOiBQcm9taXNlPElTZWFyY2hSZXN1bHRzPiB7XG4gICAgY29uc3QgY2xpZW50ID0gTWF0cml4Q2xpZW50UGVnLmdldCgpO1xuXG4gICAgLy8gQ3JlYXRlIHR3byBwcm9taXNlcywgb25lIGZvciB0aGUgbG9jYWwgc2VhcmNoLCBvbmUgZm9yIHRoZVxuICAgIC8vIHNlcnZlci1zaWRlIHNlYXJjaC5cbiAgICBjb25zdCBzZXJ2ZXJTaWRlUHJvbWlzZSA9IHNlcnZlclNpZGVTZWFyY2goc2VhcmNoVGVybSk7XG4gICAgY29uc3QgbG9jYWxQcm9taXNlID0gbG9jYWxTZWFyY2goc2VhcmNoVGVybSk7XG5cbiAgICAvLyBXYWl0IGZvciBib3RoIHByb21pc2VzIHRvIHJlc29sdmUuXG4gICAgYXdhaXQgUHJvbWlzZS5hbGwoW3NlcnZlclNpZGVQcm9taXNlLCBsb2NhbFByb21pc2VdKTtcblxuICAgIC8vIEdldCBib3RoIHNlYXJjaCByZXN1bHRzLlxuICAgIGNvbnN0IGxvY2FsUmVzdWx0ID0gYXdhaXQgbG9jYWxQcm9taXNlO1xuICAgIGNvbnN0IHNlcnZlclNpZGVSZXN1bHQgPSBhd2FpdCBzZXJ2ZXJTaWRlUHJvbWlzZTtcblxuICAgIGNvbnN0IHNlcnZlclF1ZXJ5ID0gc2VydmVyU2lkZVJlc3VsdC5xdWVyeTtcbiAgICBjb25zdCBzZXJ2ZXJSZXNwb25zZSA9IHNlcnZlclNpZGVSZXN1bHQucmVzcG9uc2U7XG5cbiAgICBjb25zdCBsb2NhbFF1ZXJ5ID0gbG9jYWxSZXN1bHQucXVlcnk7XG4gICAgY29uc3QgbG9jYWxSZXNwb25zZSA9IGxvY2FsUmVzdWx0LnJlc3BvbnNlO1xuXG4gICAgLy8gU3RvcmUgb3VyIHF1ZXJpZXMgZm9yIGxhdGVyIG9uIHNvIHdlIGNhbiBzdXBwb3J0IHBhZ2luYXRpb24uXG4gICAgLy9cbiAgICAvLyBXZSdyZSByZXVzaW5nIF9xdWVyeSBoZXJlIGFnYWluIHRvIG5vdCBpbnRyb2R1Y2Ugc2VwYXJhdGUgY29kZSBwYXRocyBhbmRcbiAgICAvLyBjb25jZXB0cyBmb3Igb3VyIGRpZmZlcmVudCBwYWdpbmF0aW9uIG1ldGhvZHMuIFdlJ3JlIHN0b3JpbmcgdGhlXG4gICAgLy8gc2VydmVyLXNpZGUgbmV4dCBiYXRjaCBzZXBhcmF0ZWx5IHNpbmNlIHRoZSBxdWVyeSBpcyB0aGUganNvbiBib2R5IG9mXG4gICAgLy8gdGhlIHJlcXVlc3QgYW5kIG5leHRfYmF0Y2ggbmVlZHMgdG8gYmUgYSBxdWVyeSBwYXJhbWV0ZXIuXG4gICAgLy9cbiAgICAvLyBXZSBjYW4ndCBwdXQgaXQgaW4gdGhlIGZpbmFsIHJlc3VsdCB0aGF0IF9wcm9jZXNzUm9vbUV2ZW50c1NlYXJjaCgpXG4gICAgLy8gcmV0dXJucyBzaW5jZSB0aGF0IG9uZSBjYW4gYmUgZWl0aGVyIGEgc2VydmVyLXNpZGUgb25lLCBhIGxvY2FsIG9uZSBvciBhXG4gICAgLy8gZmFrZSBvbmUgdG8gZmV0Y2ggdGhlIHJlbWFpbmluZyBjYWNoZWQgZXZlbnRzLiBTZWUgdGhlIGRvY3MgZm9yXG4gICAgLy8gY29tYmluZUV2ZW50cygpIGZvciBhbiBleHBsYW5hdGlvbiB3aHkgd2UgbmVlZCB0byBjYWNoZSBldmVudHMuXG4gICAgY29uc3QgZW1wdHlSZXN1bHQ6IElTZXNoYXRTZWFyY2hSZXN1bHRzID0ge1xuICAgICAgICBzZXNoYXRRdWVyeTogbG9jYWxRdWVyeSxcbiAgICAgICAgX3F1ZXJ5OiBzZXJ2ZXJRdWVyeSxcbiAgICAgICAgc2VydmVyU2lkZU5leHRCYXRjaDogc2VydmVyUmVzcG9uc2Uuc2VhcmNoX2NhdGVnb3JpZXMucm9vbV9ldmVudHMubmV4dF9iYXRjaCxcbiAgICAgICAgY2FjaGVkRXZlbnRzOiBbXSxcbiAgICAgICAgb2xkZXN0RXZlbnRGcm9tOiBcInNlcnZlclwiLFxuICAgICAgICByZXN1bHRzOiBbXSxcbiAgICAgICAgaGlnaGxpZ2h0czogW10sXG4gICAgfTtcblxuICAgIC8vIENvbWJpbmUgb3VyIHJlc3VsdHMuXG4gICAgY29uc3QgY29tYmluZWRSZXN1bHQgPSBjb21iaW5lUmVzcG9uc2VzKGVtcHR5UmVzdWx0LCBsb2NhbFJlc3BvbnNlLCBzZXJ2ZXJSZXNwb25zZS5zZWFyY2hfY2F0ZWdvcmllcy5yb29tX2V2ZW50cyk7XG5cbiAgICAvLyBMZXQgdGhlIGNsaWVudCBwcm9jZXNzIHRoZSBjb21iaW5lZCByZXN1bHQuXG4gICAgY29uc3QgcmVzcG9uc2U6IElTZWFyY2hSZXNwb25zZSA9IHtcbiAgICAgICAgc2VhcmNoX2NhdGVnb3JpZXM6IHtcbiAgICAgICAgICAgIHJvb21fZXZlbnRzOiBjb21iaW5lZFJlc3VsdCxcbiAgICAgICAgfSxcbiAgICB9O1xuXG4gICAgY29uc3QgcmVzdWx0ID0gY2xpZW50LnByb2Nlc3NSb29tRXZlbnRzU2VhcmNoKGVtcHR5UmVzdWx0LCByZXNwb25zZSk7XG5cbiAgICAvLyBSZXN0b3JlIG91ciBlbmNyeXB0aW9uIGluZm8gc28gd2UgY2FuIHByb3Blcmx5IHJlLXZlcmlmeSB0aGUgZXZlbnRzLlxuICAgIHJlc3RvcmVFbmNyeXB0aW9uSW5mbyhyZXN1bHQucmVzdWx0cyk7XG5cbiAgICByZXR1cm4gcmVzdWx0O1xufVxuXG5hc3luYyBmdW5jdGlvbiBsb2NhbFNlYXJjaChcbiAgICBzZWFyY2hUZXJtOiBzdHJpbmcsXG4gICAgcm9vbUlkOiBzdHJpbmcgPSB1bmRlZmluZWQsXG4gICAgcHJvY2Vzc1Jlc3VsdCA9IHRydWUsXG4pOiBQcm9taXNlPHsgcmVzcG9uc2U6IElSZXN1bHRSb29tRXZlbnRzLCBxdWVyeTogSVNlYXJjaEFyZ3MgfT4ge1xuICAgIGNvbnN0IGV2ZW50SW5kZXggPSBFdmVudEluZGV4UGVnLmdldCgpO1xuXG4gICAgY29uc3Qgc2VhcmNoQXJnczogSVNlYXJjaEFyZ3MgPSB7XG4gICAgICAgIHNlYXJjaF90ZXJtOiBzZWFyY2hUZXJtLFxuICAgICAgICBiZWZvcmVfbGltaXQ6IDEsXG4gICAgICAgIGFmdGVyX2xpbWl0OiAxLFxuICAgICAgICBsaW1pdDogU0VBUkNIX0xJTUlULFxuICAgICAgICBvcmRlcl9ieV9yZWNlbmN5OiB0cnVlLFxuICAgICAgICByb29tX2lkOiB1bmRlZmluZWQsXG4gICAgfTtcblxuICAgIGlmIChyb29tSWQgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICBzZWFyY2hBcmdzLnJvb21faWQgPSByb29tSWQ7XG4gICAgfVxuXG4gICAgY29uc3QgbG9jYWxSZXN1bHQgPSBhd2FpdCBldmVudEluZGV4LnNlYXJjaChzZWFyY2hBcmdzKTtcblxuICAgIHNlYXJjaEFyZ3MubmV4dF9iYXRjaCA9IGxvY2FsUmVzdWx0Lm5leHRfYmF0Y2g7XG5cbiAgICBjb25zdCByZXN1bHQgPSB7XG4gICAgICAgIHJlc3BvbnNlOiBsb2NhbFJlc3VsdCxcbiAgICAgICAgcXVlcnk6IHNlYXJjaEFyZ3MsXG4gICAgfTtcblxuICAgIHJldHVybiByZXN1bHQ7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgSVNlc2hhdFNlYXJjaFJlc3VsdHMgZXh0ZW5kcyBJU2VhcmNoUmVzdWx0cyB7XG4gICAgc2VzaGF0UXVlcnk/OiBJU2VhcmNoQXJncztcbiAgICBjYWNoZWRFdmVudHM/OiBJU2VhcmNoUmVzdWx0W107XG4gICAgb2xkZXN0RXZlbnRGcm9tPzogXCJsb2NhbFwiIHwgXCJzZXJ2ZXJcIjtcbiAgICBzZXJ2ZXJTaWRlTmV4dEJhdGNoPzogc3RyaW5nO1xufVxuXG5hc3luYyBmdW5jdGlvbiBsb2NhbFNlYXJjaFByb2Nlc3Moc2VhcmNoVGVybTogc3RyaW5nLCByb29tSWQ6IHN0cmluZyA9IHVuZGVmaW5lZCk6IFByb21pc2U8SVNlc2hhdFNlYXJjaFJlc3VsdHM+IHtcbiAgICBjb25zdCBlbXB0eVJlc3VsdCA9IHtcbiAgICAgICAgcmVzdWx0czogW10sXG4gICAgICAgIGhpZ2hsaWdodHM6IFtdLFxuICAgIH0gYXMgSVNlc2hhdFNlYXJjaFJlc3VsdHM7XG5cbiAgICBpZiAoc2VhcmNoVGVybSA9PT0gXCJcIikgcmV0dXJuIGVtcHR5UmVzdWx0O1xuXG4gICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgbG9jYWxTZWFyY2goc2VhcmNoVGVybSwgcm9vbUlkKTtcblxuICAgIGVtcHR5UmVzdWx0LnNlc2hhdFF1ZXJ5ID0gcmVzdWx0LnF1ZXJ5O1xuXG4gICAgY29uc3QgcmVzcG9uc2U6IElTZWFyY2hSZXNwb25zZSA9IHtcbiAgICAgICAgc2VhcmNoX2NhdGVnb3JpZXM6IHtcbiAgICAgICAgICAgIHJvb21fZXZlbnRzOiByZXN1bHQucmVzcG9uc2UsXG4gICAgICAgIH0sXG4gICAgfTtcblxuICAgIGNvbnN0IHByb2Nlc3NlZFJlc3VsdCA9IE1hdHJpeENsaWVudFBlZy5nZXQoKS5wcm9jZXNzUm9vbUV2ZW50c1NlYXJjaChlbXB0eVJlc3VsdCwgcmVzcG9uc2UpO1xuICAgIC8vIFJlc3RvcmUgb3VyIGVuY3J5cHRpb24gaW5mbyBzbyB3ZSBjYW4gcHJvcGVybHkgcmUtdmVyaWZ5IHRoZSBldmVudHMuXG4gICAgcmVzdG9yZUVuY3J5cHRpb25JbmZvKHByb2Nlc3NlZFJlc3VsdC5yZXN1bHRzKTtcblxuICAgIHJldHVybiBwcm9jZXNzZWRSZXN1bHQ7XG59XG5cbmFzeW5jIGZ1bmN0aW9uIGxvY2FsUGFnaW5hdGlvbihzZWFyY2hSZXN1bHQ6IElTZXNoYXRTZWFyY2hSZXN1bHRzKTogUHJvbWlzZTxJU2VzaGF0U2VhcmNoUmVzdWx0cz4ge1xuICAgIGNvbnN0IGV2ZW50SW5kZXggPSBFdmVudEluZGV4UGVnLmdldCgpO1xuXG4gICAgY29uc3Qgc2VhcmNoQXJncyA9IHNlYXJjaFJlc3VsdC5zZXNoYXRRdWVyeTtcblxuICAgIGNvbnN0IGxvY2FsUmVzdWx0ID0gYXdhaXQgZXZlbnRJbmRleC5zZWFyY2goc2VhcmNoQXJncyk7XG4gICAgc2VhcmNoUmVzdWx0LnNlc2hhdFF1ZXJ5Lm5leHRfYmF0Y2ggPSBsb2NhbFJlc3VsdC5uZXh0X2JhdGNoO1xuXG4gICAgLy8gV2Ugb25seSBuZWVkIHRvIHJlc3RvcmUgdGhlIGVuY3J5cHRpb24gc3RhdGUgZm9yIHRoZSBuZXcgcmVzdWx0cywgc29cbiAgICAvLyByZW1lbWJlciBob3cgbWFueSBvZiB0aGVtIHdlIGdvdC5cbiAgICBjb25zdCBuZXdSZXN1bHRDb3VudCA9IGxvY2FsUmVzdWx0LnJlc3VsdHMubGVuZ3RoO1xuXG4gICAgY29uc3QgcmVzcG9uc2UgPSB7XG4gICAgICAgIHNlYXJjaF9jYXRlZ29yaWVzOiB7XG4gICAgICAgICAgICByb29tX2V2ZW50czogbG9jYWxSZXN1bHQsXG4gICAgICAgIH0sXG4gICAgfTtcblxuICAgIGNvbnN0IHJlc3VsdCA9IE1hdHJpeENsaWVudFBlZy5nZXQoKS5wcm9jZXNzUm9vbUV2ZW50c1NlYXJjaChzZWFyY2hSZXN1bHQsIHJlc3BvbnNlKTtcblxuICAgIC8vIFJlc3RvcmUgb3VyIGVuY3J5cHRpb24gaW5mbyBzbyB3ZSBjYW4gcHJvcGVybHkgcmUtdmVyaWZ5IHRoZSBldmVudHMuXG4gICAgY29uc3QgbmV3U2xpY2UgPSByZXN1bHQucmVzdWx0cy5zbGljZShNYXRoLm1heChyZXN1bHQucmVzdWx0cy5sZW5ndGggLSBuZXdSZXN1bHRDb3VudCwgMCkpO1xuICAgIHJlc3RvcmVFbmNyeXB0aW9uSW5mbyhuZXdTbGljZSk7XG5cbiAgICBzZWFyY2hSZXN1bHQucGVuZGluZ1JlcXVlc3QgPSBudWxsO1xuXG4gICAgcmV0dXJuIHJlc3VsdDtcbn1cblxuZnVuY3Rpb24gY29tcGFyZU9sZGVzdEV2ZW50cyhmaXJzdFJlc3VsdHM6IElTZWFyY2hSZXN1bHRbXSwgc2Vjb25kUmVzdWx0czogSVNlYXJjaFJlc3VsdFtdKTogbnVtYmVyIHtcbiAgICB0cnkge1xuICAgICAgICBjb25zdCBvbGRlc3RGaXJzdEV2ZW50ID0gZmlyc3RSZXN1bHRzW2ZpcnN0UmVzdWx0cy5sZW5ndGggLSAxXS5yZXN1bHQ7XG4gICAgICAgIGNvbnN0IG9sZGVzdFNlY29uZEV2ZW50ID0gc2Vjb25kUmVzdWx0c1tzZWNvbmRSZXN1bHRzLmxlbmd0aCAtIDFdLnJlc3VsdDtcblxuICAgICAgICBpZiAob2xkZXN0Rmlyc3RFdmVudC5vcmlnaW5fc2VydmVyX3RzIDw9IG9sZGVzdFNlY29uZEV2ZW50Lm9yaWdpbl9zZXJ2ZXJfdHMpIHtcbiAgICAgICAgICAgIHJldHVybiAtMTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiAxO1xuICAgICAgICB9XG4gICAgfSBjYXRjaCB7XG4gICAgICAgIHJldHVybiAwO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gY29tYmluZUV2ZW50U291cmNlcyhcbiAgICBwcmV2aW91c1NlYXJjaFJlc3VsdDogSVNlc2hhdFNlYXJjaFJlc3VsdHMsXG4gICAgcmVzcG9uc2U6IElSZXN1bHRSb29tRXZlbnRzLFxuICAgIGE6IElTZWFyY2hSZXN1bHRbXSxcbiAgICBiOiBJU2VhcmNoUmVzdWx0W10sXG4pOiB2b2lkIHtcbiAgICAvLyBNZXJnZSBldmVudCBzb3VyY2VzIGFuZCBzb3J0IHRoZSBldmVudHMuXG4gICAgY29uc3QgY29tYmluZWRFdmVudHMgPSBhLmNvbmNhdChiKS5zb3J0KGNvbXBhcmVFdmVudHMpO1xuICAgIC8vIFB1dCBoYWxmIG9mIHRoZSBldmVudHMgaW4gdGhlIHJlc3BvbnNlLCBhbmQgY2FjaGUgdGhlIG90aGVyIGhhbGYuXG4gICAgcmVzcG9uc2UucmVzdWx0cyA9IGNvbWJpbmVkRXZlbnRzLnNsaWNlKDAsIFNFQVJDSF9MSU1JVCk7XG4gICAgcHJldmlvdXNTZWFyY2hSZXN1bHQuY2FjaGVkRXZlbnRzID0gY29tYmluZWRFdmVudHMuc2xpY2UoU0VBUkNIX0xJTUlUKTtcbn1cblxuLyoqXG4gKiBDb21iaW5lIHRoZSBldmVudHMgZnJvbSBvdXIgZXZlbnQgc291cmNlcyBpbnRvIGEgc29ydGVkIHJlc3VsdFxuICpcbiAqIFRoaXMgbWV0aG9kIHdpbGwgZmlyc3QgYmUgY2FsbGVkIGZyb20gdGhlIGNvbWJpbmVkU2VhcmNoKCkgbWV0aG9kLiBJbiB0aGlzXG4gKiBjYXNlIHdlIHdpbGwgZmV0Y2ggU0VBUkNIX0xJTUlUIGV2ZW50cyBmcm9tIHRoZSBzZXJ2ZXIgYW5kIHRoZSBsb2NhbCBpbmRleC5cbiAqXG4gKiBUaGUgbWV0aG9kIHdpbGwgcHV0IHRoZSBTRUFSQ0hfTElNSVQgbmV3ZXN0IGV2ZW50cyBmcm9tIHRoZSBzZXJ2ZXIgYW5kIHRoZVxuICogbG9jYWwgaW5kZXggaW4gdGhlIHJlc3VsdHMgcGFydCBvZiB0aGUgcmVzcG9uc2UsIHRoZSByZXN0IHdpbGwgYmUgcHV0IGluIHRoZVxuICogY2FjaGVkRXZlbnRzIGZpZWxkIG9mIHRoZSBwcmV2aW91c1NlYXJjaFJlc3VsdCAoaW4gdGhpcyBjYXNlIGFuIGVtcHR5IHNlYXJjaFxuICogcmVzdWx0KS5cbiAqXG4gKiBFdmVyeSBzdWJzZXF1ZW50IGNhbGwgd2lsbCBiZSBtYWRlIGZyb20gdGhlIGNvbWJpbmVkUGFnaW5hdGlvbigpIG1ldGhvZCwgaW5cbiAqIHRoaXMgY2FzZSB3ZSB3aWxsIGNvbWJpbmUgdGhlIGNhY2hlZEV2ZW50cyBhbmQgdGhlIG5leHQgU0VBUkNIX0xJTUlUIGV2ZW50c1xuICogZnJvbSBlaXRoZXIgdGhlIHNlcnZlciBvciB0aGUgbG9jYWwgaW5kZXguXG4gKlxuICogU2luY2Ugd2UgaGF2ZSB0d28gZXZlbnQgc291cmNlcyBhbmQgd2UgbmVlZCB0byBzb3J0IHRoZSByZXN1bHRzIGJ5IGRhdGUgd2VcbiAqIG5lZWQga2VlcCBvbiBsb29raW5nIGZvciB0aGUgb2xkZXN0IGV2ZW50LiBXZSBhcmUgaW1wbGVtZW50aW5nIGEgdmFyaWF0aW9uIG9mXG4gKiBhIHNsaWRpbmcgd2luZG93LlxuICpcbiAqIFRoZSBldmVudCBzb3VyY2VzIGFyZSBoZXJlIHJlcHJlc2VudGVkIGFzIHR3byBzb3J0ZWQgbGlzdHMgd2hlcmUgdGhlIHNtYWxsZXN0XG4gKiBudW1iZXIgcmVwcmVzZW50cyB0aGUgbmV3ZXN0IGV2ZW50LiBUaGUgdHdvIGxpc3RzIG5lZWQgdG8gYmUgbWVyZ2VkIGluIGEgd2F5XG4gKiB0aGF0IHByZXNlcnZlcyB0aGUgc29ydGVkIHByb3BlcnR5IHNvIHRoZXkgY2FuIGJlIHNob3duIGFzIG9uZSBzZWFyY2ggcmVzdWx0LlxuICogV2UgZmlyc3QgZmV0Y2ggU0VBUkNIX0xJTUlUIGV2ZW50cyBmcm9tIGJvdGggc291cmNlcy5cbiAqXG4gKiBJZiB3ZSBzZXQgU0VBUkNIX0xJTUlUIHRvIDM6XG4gKlxuICogIFNlcnZlciBldmVudHMgWzAxLCAwMiwgMDQsIDA2LCAwNywgMDgsIDExLCAxM11cbiAqICAgICAgICAgICAgICAgIHwwMSwgMDIsIDA0fFxuICogIExvY2FsIGV2ZW50cyAgWzAzLCAwNSwgMDksIDEwLCAxMiwgMTQsIDE1LCAxNl1cbiAqICAgICAgICAgICAgICAgIHwwMywgMDUsIDA5fFxuICpcbiAqICBXZSBub3RlIHRoYXQgdGhlIG9sZGVzdCBldmVudCBpcyBmcm9tIHRoZSBsb2NhbCBpbmRleCwgYW5kIHdlIGNvbWJpbmUgdGhlXG4gKiAgcmVzdWx0czpcbiAqXG4gKiAgU2VydmVyIHdpbmRvdyBbMDEsIDAyLCAwNF1cbiAqICBMb2NhbCB3aW5kb3cgIFswMywgMDUsIDA5XVxuICpcbiAqICBDb21iaW5lZCBldmVudHMgWzAxLCAwMiwgMDMsIDA0LCAwNSwgMDldXG4gKlxuICogIFdlIHNwbGl0IHRoZSBjb21iaW5lZCByZXN1bHQgaW4gdGhlIHBhcnQgdGhhdCB3ZSB3YW50IHRvIHByZXNlbnQgYW5kIGEgcGFydFxuICogIHRoYXQgd2lsbCBiZSBjYWNoZWQuXG4gKlxuICogIFByZXNlbnRlZCBldmVudHMgWzAxLCAwMiwgMDNdXG4gKiAgQ2FjaGVkIGV2ZW50cyAgICBbMDQsIDA1LCAwOV1cbiAqXG4gKiAgV2Ugc2xpZGUgdGhlIHdpbmRvdyBmb3IgdGhlIHNlcnZlciBzaW5jZSB0aGUgb2xkZXN0IGV2ZW50IGlzIGZyb20gdGhlIGxvY2FsXG4gKiAgaW5kZXguXG4gKlxuICogIFNlcnZlciBldmVudHMgWzAxLCAwMiwgMDQsIDA2LCAwNywgMDgsIDExLCAxM11cbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgIHwwNiwgMDcsIDA4fFxuICogIExvY2FsIGV2ZW50cyAgWzAzLCAwNSwgMDksIDEwLCAxMiwgMTQsIDE1LCAxNl1cbiAqICAgICAgICAgICAgICAgIHxYWCwgWFgsIFhYfFxuICogIENhY2hlZCBldmVudHMgWzA0LCAwNSwgMDldXG4gKlxuICogIFdlIG5vdGUgdGhhdCB0aGUgb2xkZXN0IGV2ZW50IGlzIGZyb20gdGhlIHNlcnZlciBhbmQgd2UgY29tYmluZSB0aGUgbmV3XG4gKiAgc2VydmVyIGV2ZW50cyB3aXRoIHRoZSBjYWNoZWQgb25lcy5cbiAqXG4gKiAgQ2FjaGVkIGV2ZW50cyBbMDQsIDA1LCAwOV1cbiAqICBTZXJ2ZXIgZXZlbnRzIFswNiwgMDcsIDA4XVxuICpcbiAqICBDb21iaW5lZCBldmVudHMgWzA0LCAwNSwgMDYsIDA3LCAwOCwgMDldXG4gKlxuICogIFdlIHNwbGl0IGFnYWluLlxuICpcbiAqICBQcmVzZW50ZWQgZXZlbnRzIFswNCwgMDUsIDA2XVxuICogIENhY2hlZCBldmVudHMgICAgWzA3LCAwOCwgMDldXG4gKlxuICogIFdlIHNsaWRlIHRoZSBsb2NhbCB3aW5kb3csIHRoZSBvbGRlc3QgZXZlbnQgaXMgb24gdGhlIHNlcnZlci5cbiAqXG4gKiAgU2VydmVyIGV2ZW50cyBbMDEsIDAyLCAwNCwgMDYsIDA3LCAwOCwgMTEsIDEzXVxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgfFhYLCBYWCwgWFh8XG4gKiAgTG9jYWwgZXZlbnRzICBbMDMsIDA1LCAwOSwgMTAsIDEyLCAxNCwgMTUsIDE2XVxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgfDEwLCAxMiwgMTR8XG4gKlxuICogIENhY2hlZCBldmVudHMgWzA3LCAwOCwgMDldXG4gKiAgTG9jYWwgZXZlbnRzICBbMTAsIDEyLCAxNF1cbiAqICBDb21iaW5lZCBldmVudHMgWzA3LCAwOCwgMDksIDEwLCAxMiwgMTRdXG4gKlxuICogIFByZXNlbnRlZCBldmVudHMgWzA3LCAwOCwgMDldXG4gKiAgQ2FjaGVkIGV2ZW50cyAgICBbMTAsIDEyLCAxNF1cbiAqXG4gKiAgTmV4dCB1cCB3ZSBzbGlkZSB0aGUgc2VydmVyIHdpbmRvdyBhZ2Fpbi5cbiAqXG4gKiAgU2VydmVyIGV2ZW50cyBbMDEsIDAyLCAwNCwgMDYsIDA3LCAwOCwgMTEsIDEzXVxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfDExLCAxM3xcbiAqICBMb2NhbCBldmVudHMgIFswMywgMDUsIDA5LCAxMCwgMTIsIDE0LCAxNSwgMTZdXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICB8WFgsIFhYLCBYWHxcbiAqXG4gKiAgQ2FjaGVkIGV2ZW50cyBbMTAsIDEyLCAxNF1cbiAqICBTZXJ2ZXIgZXZlbnRzIFsxMSwgMTNdXG4gKiAgQ29tYmluZWQgZXZlbnRzIFsxMCwgMTEsIDEyLCAxMywgMTRdXG4gKlxuICogIFByZXNlbnRlZCBldmVudHMgWzEwLCAxMSwgMTJdXG4gKiAgQ2FjaGVkIGV2ZW50cyAgICBbMTMsIDE0XVxuICpcbiAqICBXZSBoYXZlIG9uZSBzb3VyY2UgZXhoYXVzdGVkLCB3ZSBmZXRjaCB0aGUgcmVzdCBvZiBvdXIgZXZlbnRzIGZyb20gdGhlIG90aGVyXG4gKiAgc291cmNlIGFuZCBjb21iaW5lIGl0IHdpdGggb3VyIGNhY2hlZCBldmVudHMuXG4gKlxuICpcbiAqIEBwYXJhbSB7b2JqZWN0fSBwcmV2aW91c1NlYXJjaFJlc3VsdCBBIHNlYXJjaCByZXN1bHQgZnJvbSBhIHByZXZpb3VzIHNlYXJjaFxuICogY2FsbC5cbiAqIEBwYXJhbSB7b2JqZWN0fSBsb2NhbEV2ZW50cyBBbiB1bnByb2Nlc3NlZCBzZWFyY2ggcmVzdWx0IGZyb20gdGhlIGV2ZW50XG4gKiBpbmRleC5cbiAqIEBwYXJhbSB7b2JqZWN0fSBzZXJ2ZXJFdmVudHMgQW4gdW5wcm9jZXNzZWQgc2VhcmNoIHJlc3VsdCBmcm9tIHRoZSBzZXJ2ZXIuXG4gKlxuICogQHJldHVybiB7b2JqZWN0fSBBIHJlc3BvbnNlIG9iamVjdCB0aGF0IGNvbWJpbmVzIHRoZSBldmVudHMgZnJvbSB0aGVcbiAqIGRpZmZlcmVudCBldmVudCBzb3VyY2VzLlxuICpcbiAqL1xuZnVuY3Rpb24gY29tYmluZUV2ZW50cyhcbiAgICBwcmV2aW91c1NlYXJjaFJlc3VsdDogSVNlc2hhdFNlYXJjaFJlc3VsdHMsXG4gICAgbG9jYWxFdmVudHM6IElSZXN1bHRSb29tRXZlbnRzID0gdW5kZWZpbmVkLFxuICAgIHNlcnZlckV2ZW50czogSVJlc3VsdFJvb21FdmVudHMgPSB1bmRlZmluZWQsXG4pOiBJUmVzdWx0Um9vbUV2ZW50cyB7XG4gICAgY29uc3QgcmVzcG9uc2UgPSB7fSBhcyBJUmVzdWx0Um9vbUV2ZW50cztcblxuICAgIGNvbnN0IGNhY2hlZEV2ZW50cyA9IHByZXZpb3VzU2VhcmNoUmVzdWx0LmNhY2hlZEV2ZW50cztcbiAgICBsZXQgb2xkZXN0RXZlbnRGcm9tID0gcHJldmlvdXNTZWFyY2hSZXN1bHQub2xkZXN0RXZlbnRGcm9tO1xuICAgIHJlc3BvbnNlLmhpZ2hsaWdodHMgPSBwcmV2aW91c1NlYXJjaFJlc3VsdC5oaWdobGlnaHRzO1xuXG4gICAgaWYgKGxvY2FsRXZlbnRzICYmIHNlcnZlckV2ZW50cyAmJiBzZXJ2ZXJFdmVudHMucmVzdWx0cykge1xuICAgICAgICAvLyBUaGlzIGlzIGEgZmlyc3Qgc2VhcmNoIGNhbGwsIGNvbWJpbmUgdGhlIGV2ZW50cyBmcm9tIHRoZSBzZXJ2ZXIgYW5kXG4gICAgICAgIC8vIHRoZSBsb2NhbCBpbmRleC4gTm90ZSB3aGVyZSBvdXIgb2xkZXN0IGV2ZW50IGNhbWUgZnJvbSwgd2Ugc2hhbGxcbiAgICAgICAgLy8gZmV0Y2ggdGhlIG5leHQgYmF0Y2ggb2YgZXZlbnRzIGZyb20gdGhlIG90aGVyIHNvdXJjZS5cbiAgICAgICAgaWYgKGNvbXBhcmVPbGRlc3RFdmVudHMobG9jYWxFdmVudHMucmVzdWx0cywgc2VydmVyRXZlbnRzLnJlc3VsdHMpIDwgMCkge1xuICAgICAgICAgICAgb2xkZXN0RXZlbnRGcm9tID0gXCJsb2NhbFwiO1xuICAgICAgICB9XG5cbiAgICAgICAgY29tYmluZUV2ZW50U291cmNlcyhwcmV2aW91c1NlYXJjaFJlc3VsdCwgcmVzcG9uc2UsIGxvY2FsRXZlbnRzLnJlc3VsdHMsIHNlcnZlckV2ZW50cy5yZXN1bHRzKTtcbiAgICAgICAgcmVzcG9uc2UuaGlnaGxpZ2h0cyA9IGxvY2FsRXZlbnRzLmhpZ2hsaWdodHMuY29uY2F0KHNlcnZlckV2ZW50cy5oaWdobGlnaHRzKTtcbiAgICB9IGVsc2UgaWYgKGxvY2FsRXZlbnRzKSB7XG4gICAgICAgIC8vIFRoaXMgaXMgYSBwYWdpbmF0aW9uIGNhbGwgZmV0Y2hpbmcgbW9yZSBldmVudHMgZnJvbSB0aGUgbG9jYWwgaW5kZXgsXG4gICAgICAgIC8vIG1lYW5pbmcgdGhhdCBvdXIgb2xkZXN0IGV2ZW50IHdhcyBvbiB0aGUgc2VydmVyLlxuICAgICAgICAvLyBDaGFuZ2UgdGhlIHNvdXJjZSBvZiB0aGUgb2xkZXN0IGV2ZW50IGlmIG91ciBsb2NhbCBldmVudCBpcyBvbGRlclxuICAgICAgICAvLyB0aGFuIHRoZSBjYWNoZWQgb25lLlxuICAgICAgICBpZiAoY29tcGFyZU9sZGVzdEV2ZW50cyhsb2NhbEV2ZW50cy5yZXN1bHRzLCBjYWNoZWRFdmVudHMpIDwgMCkge1xuICAgICAgICAgICAgb2xkZXN0RXZlbnRGcm9tID0gXCJsb2NhbFwiO1xuICAgICAgICB9XG4gICAgICAgIGNvbWJpbmVFdmVudFNvdXJjZXMocHJldmlvdXNTZWFyY2hSZXN1bHQsIHJlc3BvbnNlLCBsb2NhbEV2ZW50cy5yZXN1bHRzLCBjYWNoZWRFdmVudHMpO1xuICAgIH0gZWxzZSBpZiAoc2VydmVyRXZlbnRzICYmIHNlcnZlckV2ZW50cy5yZXN1bHRzKSB7XG4gICAgICAgIC8vIFRoaXMgaXMgYSBwYWdpbmF0aW9uIGNhbGwgZmV0Y2hpbmcgbW9yZSBldmVudHMgZnJvbSB0aGUgc2VydmVyLFxuICAgICAgICAvLyBtZWFuaW5nIHRoYXQgb3VyIG9sZGVzdCBldmVudCB3YXMgaW4gdGhlIGxvY2FsIGluZGV4LlxuICAgICAgICAvLyBDaGFuZ2UgdGhlIHNvdXJjZSBvZiB0aGUgb2xkZXN0IGV2ZW50IGlmIG91ciBzZXJ2ZXIgZXZlbnQgaXMgb2xkZXJcbiAgICAgICAgLy8gdGhhbiB0aGUgY2FjaGVkIG9uZS5cbiAgICAgICAgaWYgKGNvbXBhcmVPbGRlc3RFdmVudHMoc2VydmVyRXZlbnRzLnJlc3VsdHMsIGNhY2hlZEV2ZW50cykgPCAwKSB7XG4gICAgICAgICAgICBvbGRlc3RFdmVudEZyb20gPSBcInNlcnZlclwiO1xuICAgICAgICB9XG4gICAgICAgIGNvbWJpbmVFdmVudFNvdXJjZXMocHJldmlvdXNTZWFyY2hSZXN1bHQsIHJlc3BvbnNlLCBzZXJ2ZXJFdmVudHMucmVzdWx0cywgY2FjaGVkRXZlbnRzKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICAvLyBUaGlzIGlzIGEgcGFnaW5hdGlvbiBjYWxsIHdoZXJlIHdlIGV4aGF1c3RlZCBib3RoIG9mIG91ciBldmVudFxuICAgICAgICAvLyBzb3VyY2VzLCBsZXQncyBwdXNoIHRoZSByZW1haW5pbmcgY2FjaGVkIGV2ZW50cy5cbiAgICAgICAgcmVzcG9uc2UucmVzdWx0cyA9IGNhY2hlZEV2ZW50cztcbiAgICAgICAgcHJldmlvdXNTZWFyY2hSZXN1bHQuY2FjaGVkRXZlbnRzID0gW107XG4gICAgfVxuXG4gICAgcHJldmlvdXNTZWFyY2hSZXN1bHQub2xkZXN0RXZlbnRGcm9tID0gb2xkZXN0RXZlbnRGcm9tO1xuXG4gICAgcmV0dXJuIHJlc3BvbnNlO1xufVxuXG4vKipcbiAqIENvbWJpbmUgdGhlIGxvY2FsIGFuZCBzZXJ2ZXIgc2VhcmNoIHJlc3BvbnNlc1xuICpcbiAqIEBwYXJhbSB7b2JqZWN0fSBwcmV2aW91c1NlYXJjaFJlc3VsdCBBIHNlYXJjaCByZXN1bHQgZnJvbSBhIHByZXZpb3VzIHNlYXJjaFxuICogY2FsbC5cbiAqIEBwYXJhbSB7b2JqZWN0fSBsb2NhbEV2ZW50cyBBbiB1bnByb2Nlc3NlZCBzZWFyY2ggcmVzdWx0IGZyb20gdGhlIGV2ZW50XG4gKiBpbmRleC5cbiAqIEBwYXJhbSB7b2JqZWN0fSBzZXJ2ZXJFdmVudHMgQW4gdW5wcm9jZXNzZWQgc2VhcmNoIHJlc3VsdCBmcm9tIHRoZSBzZXJ2ZXIuXG4gKlxuICogQHJldHVybiB7b2JqZWN0fSBBIHJlc3BvbnNlIG9iamVjdCB0aGF0IGNvbWJpbmVzIHRoZSBldmVudHMgZnJvbSB0aGVcbiAqIGRpZmZlcmVudCBldmVudCBzb3VyY2VzLlxuICovXG5mdW5jdGlvbiBjb21iaW5lUmVzcG9uc2VzKFxuICAgIHByZXZpb3VzU2VhcmNoUmVzdWx0OiBJU2VzaGF0U2VhcmNoUmVzdWx0cyxcbiAgICBsb2NhbEV2ZW50czogSVJlc3VsdFJvb21FdmVudHMgPSB1bmRlZmluZWQsXG4gICAgc2VydmVyRXZlbnRzOiBJUmVzdWx0Um9vbUV2ZW50cyA9IHVuZGVmaW5lZCxcbik6IElSZXN1bHRSb29tRXZlbnRzIHtcbiAgICAvLyBDb21iaW5lIG91ciBldmVudHMgZmlyc3QuXG4gICAgY29uc3QgcmVzcG9uc2UgPSBjb21iaW5lRXZlbnRzKHByZXZpb3VzU2VhcmNoUmVzdWx0LCBsb2NhbEV2ZW50cywgc2VydmVyRXZlbnRzKTtcblxuICAgIC8vIE91ciBmaXJzdCBzZWFyY2ggd2lsbCBjb250YWluIGNvdW50cyBmcm9tIGJvdGggc291cmNlcywgc3Vic2VxdWVudFxuICAgIC8vIHBhZ2luYXRpb24gcmVxdWVzdHMgd2lsbCBmZXRjaCByZXNwb25zZXMgb25seSBmcm9tIG9uZSBvZiB0aGUgc291cmNlcywgc29cbiAgICAvLyByZXVzZSB0aGUgZmlyc3QgY291bnQgd2hlbiB3ZSdyZSBwYWdpbmF0aW5nLlxuICAgIGlmIChwcmV2aW91c1NlYXJjaFJlc3VsdC5jb3VudCkge1xuICAgICAgICByZXNwb25zZS5jb3VudCA9IHByZXZpb3VzU2VhcmNoUmVzdWx0LmNvdW50O1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHJlc3BvbnNlLmNvdW50ID0gbG9jYWxFdmVudHMuY291bnQgKyBzZXJ2ZXJFdmVudHMuY291bnQ7XG4gICAgfVxuXG4gICAgLy8gVXBkYXRlIG91ciBuZXh0IGJhdGNoIHRva2VucyBmb3IgdGhlIGdpdmVuIHNlYXJjaCBzb3VyY2VzLlxuICAgIGlmIChsb2NhbEV2ZW50cykge1xuICAgICAgICBwcmV2aW91c1NlYXJjaFJlc3VsdC5zZXNoYXRRdWVyeS5uZXh0X2JhdGNoID0gbG9jYWxFdmVudHMubmV4dF9iYXRjaDtcbiAgICB9XG4gICAgaWYgKHNlcnZlckV2ZW50cykge1xuICAgICAgICBwcmV2aW91c1NlYXJjaFJlc3VsdC5zZXJ2ZXJTaWRlTmV4dEJhdGNoID0gc2VydmVyRXZlbnRzLm5leHRfYmF0Y2g7XG4gICAgfVxuXG4gICAgLy8gU2V0IHRoZSByZXNwb25zZSBuZXh0IGJhdGNoIHRva2VuIHRvIG9uZSBvZiB0aGUgdG9rZW5zIGZyb20gdGhlIHNvdXJjZXMsXG4gICAgLy8gdGhpcyBtYWtlcyBzdXJlIHRoYXQgaWYgd2UgZXhoYXVzdCBvbmUgb2YgdGhlIHNvdXJjZXMgd2UgY29udGludWUgd2l0aFxuICAgIC8vIHRoZSBvdGhlciBvbmUuXG4gICAgaWYgKHByZXZpb3VzU2VhcmNoUmVzdWx0LnNlc2hhdFF1ZXJ5Lm5leHRfYmF0Y2gpIHtcbiAgICAgICAgcmVzcG9uc2UubmV4dF9iYXRjaCA9IHByZXZpb3VzU2VhcmNoUmVzdWx0LnNlc2hhdFF1ZXJ5Lm5leHRfYmF0Y2g7XG4gICAgfSBlbHNlIGlmIChwcmV2aW91c1NlYXJjaFJlc3VsdC5zZXJ2ZXJTaWRlTmV4dEJhdGNoKSB7XG4gICAgICAgIHJlc3BvbnNlLm5leHRfYmF0Y2ggPSBwcmV2aW91c1NlYXJjaFJlc3VsdC5zZXJ2ZXJTaWRlTmV4dEJhdGNoO1xuICAgIH1cblxuICAgIC8vIFdlIGNvbGxlY3RlZCBhbGwgc2VhcmNoIHJlc3VsdHMgZnJvbSB0aGUgc2VydmVyIGFzIHdlbGwgYXMgZnJvbSBTZXNoYXQsXG4gICAgLy8gd2Ugc3RpbGwgaGF2ZSBzb21lIGV2ZW50cyBjYWNoZWQgdGhhdCB3ZSdsbCB3YW50IHRvIGRpc3BsYXkgb24gdGhlIG5leHRcbiAgICAvLyBwYWdpbmF0aW9uIHJlcXVlc3QuXG4gICAgLy9cbiAgICAvLyBQcm92aWRlIGEgZmFrZSBuZXh0IGJhdGNoIHRva2VuIGZvciB0aGF0IGNhc2UuXG4gICAgaWYgKCFyZXNwb25zZS5uZXh0X2JhdGNoICYmIHByZXZpb3VzU2VhcmNoUmVzdWx0LmNhY2hlZEV2ZW50cy5sZW5ndGggPiAwKSB7XG4gICAgICAgIHJlc3BvbnNlLm5leHRfYmF0Y2ggPSBcImNhY2hlZFwiO1xuICAgIH1cblxuICAgIHJldHVybiByZXNwb25zZTtcbn1cblxuaW50ZXJmYWNlIElFbmNyeXB0ZWRTZXNoYXRFdmVudCB7XG4gICAgY3VydmUyNTUxOUtleTogc3RyaW5nO1xuICAgIGVkMjU1MTlLZXk6IHN0cmluZztcbiAgICBhbGdvcml0aG06IHN0cmluZztcbiAgICBmb3J3YXJkaW5nQ3VydmUyNTUxOUtleUNoYWluOiBzdHJpbmdbXTtcbn1cblxuZnVuY3Rpb24gcmVzdG9yZUVuY3J5cHRpb25JbmZvKHNlYXJjaFJlc3VsdFNsaWNlOiBTZWFyY2hSZXN1bHRbXSA9IFtdKTogdm9pZCB7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBzZWFyY2hSZXN1bHRTbGljZS5sZW5ndGg7IGkrKykge1xuICAgICAgICBjb25zdCB0aW1lbGluZSA9IHNlYXJjaFJlc3VsdFNsaWNlW2ldLmNvbnRleHQuZ2V0VGltZWxpbmUoKTtcblxuICAgICAgICBmb3IgKGxldCBqID0gMDsgaiA8IHRpbWVsaW5lLmxlbmd0aDsgaisrKSB7XG4gICAgICAgICAgICBjb25zdCBteEV2ID0gdGltZWxpbmVbal07XG4gICAgICAgICAgICBjb25zdCBldiA9IG14RXYuZXZlbnQgYXMgSUVuY3J5cHRlZFNlc2hhdEV2ZW50O1xuXG4gICAgICAgICAgICBpZiAoZXYuY3VydmUyNTUxOUtleSkge1xuICAgICAgICAgICAgICAgIG14RXYubWFrZUVuY3J5cHRlZChcbiAgICAgICAgICAgICAgICAgICAgRXZlbnRUeXBlLlJvb21NZXNzYWdlRW5jcnlwdGVkLFxuICAgICAgICAgICAgICAgICAgICB7IGFsZ29yaXRobTogZXYuYWxnb3JpdGhtIH0sXG4gICAgICAgICAgICAgICAgICAgIGV2LmN1cnZlMjU1MTlLZXksXG4gICAgICAgICAgICAgICAgICAgIGV2LmVkMjU1MTlLZXksXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAvLyBAdHMtaWdub3JlXG4gICAgICAgICAgICAgICAgbXhFdi5mb3J3YXJkaW5nQ3VydmUyNTUxOUtleUNoYWluID0gZXYuZm9yd2FyZGluZ0N1cnZlMjU1MTlLZXlDaGFpbjtcblxuICAgICAgICAgICAgICAgIGRlbGV0ZSBldi5jdXJ2ZTI1NTE5S2V5O1xuICAgICAgICAgICAgICAgIGRlbGV0ZSBldi5lZDI1NTE5S2V5O1xuICAgICAgICAgICAgICAgIGRlbGV0ZSBldi5hbGdvcml0aG07XG4gICAgICAgICAgICAgICAgZGVsZXRlIGV2LmZvcndhcmRpbmdDdXJ2ZTI1NTE5S2V5Q2hhaW47XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG59XG5cbmFzeW5jIGZ1bmN0aW9uIGNvbWJpbmVkUGFnaW5hdGlvbihzZWFyY2hSZXN1bHQ6IElTZXNoYXRTZWFyY2hSZXN1bHRzKTogUHJvbWlzZTxJU2VzaGF0U2VhcmNoUmVzdWx0cz4ge1xuICAgIGNvbnN0IGV2ZW50SW5kZXggPSBFdmVudEluZGV4UGVnLmdldCgpO1xuICAgIGNvbnN0IGNsaWVudCA9IE1hdHJpeENsaWVudFBlZy5nZXQoKTtcblxuICAgIGNvbnN0IHNlYXJjaEFyZ3MgPSBzZWFyY2hSZXN1bHQuc2VzaGF0UXVlcnk7XG4gICAgY29uc3Qgb2xkZXN0RXZlbnRGcm9tID0gc2VhcmNoUmVzdWx0Lm9sZGVzdEV2ZW50RnJvbTtcblxuICAgIGxldCBsb2NhbFJlc3VsdDogSVJlc3VsdFJvb21FdmVudHM7XG4gICAgbGV0IHNlcnZlclNpZGVSZXN1bHQ6IElTZWFyY2hSZXNwb25zZTtcblxuICAgIC8vIEZldGNoIGV2ZW50cyBmcm9tIHRoZSBsb2NhbCBpbmRleCBpZiB3ZSBoYXZlIGEgdG9rZW4gZm9yIGl0IGFuZCBpZiBpdCdzXG4gICAgLy8gdGhlIGxvY2FsIGluZGV4ZXMgdHVybiBvciB0aGUgc2VydmVyIGhhcyBleGhhdXN0ZWQgaXRzIHJlc3VsdHMuXG4gICAgaWYgKHNlYXJjaEFyZ3MubmV4dF9iYXRjaCAmJiAoIXNlYXJjaFJlc3VsdC5zZXJ2ZXJTaWRlTmV4dEJhdGNoIHx8IG9sZGVzdEV2ZW50RnJvbSA9PT0gXCJzZXJ2ZXJcIikpIHtcbiAgICAgICAgbG9jYWxSZXN1bHQgPSBhd2FpdCBldmVudEluZGV4LnNlYXJjaChzZWFyY2hBcmdzKTtcbiAgICB9XG5cbiAgICAvLyBGZXRjaCBldmVudHMgZnJvbSB0aGUgc2VydmVyIGlmIHdlIGhhdmUgYSB0b2tlbiBmb3IgaXQgYW5kIGlmIGl0J3MgdGhlXG4gICAgLy8gbG9jYWwgaW5kZXhlcyB0dXJuIG9yIHRoZSBsb2NhbCBpbmRleCBoYXMgZXhoYXVzdGVkIGl0cyByZXN1bHRzLlxuICAgIGlmIChzZWFyY2hSZXN1bHQuc2VydmVyU2lkZU5leHRCYXRjaCAmJiAob2xkZXN0RXZlbnRGcm9tID09PSBcImxvY2FsXCIgfHwgIXNlYXJjaEFyZ3MubmV4dF9iYXRjaCkpIHtcbiAgICAgICAgY29uc3QgYm9keSA9IHsgYm9keTogc2VhcmNoUmVzdWx0Ll9xdWVyeSwgbmV4dF9iYXRjaDogc2VhcmNoUmVzdWx0LnNlcnZlclNpZGVOZXh0QmF0Y2ggfTtcbiAgICAgICAgc2VydmVyU2lkZVJlc3VsdCA9IGF3YWl0IGNsaWVudC5zZWFyY2goYm9keSk7XG4gICAgfVxuXG4gICAgbGV0IHNlcnZlckV2ZW50czogSVJlc3VsdFJvb21FdmVudHM7XG5cbiAgICBpZiAoc2VydmVyU2lkZVJlc3VsdCkge1xuICAgICAgICBzZXJ2ZXJFdmVudHMgPSBzZXJ2ZXJTaWRlUmVzdWx0LnNlYXJjaF9jYXRlZ29yaWVzLnJvb21fZXZlbnRzO1xuICAgIH1cblxuICAgIC8vIENvbWJpbmUgb3VyIGV2ZW50cy5cbiAgICBjb25zdCBjb21iaW5lZFJlc3VsdCA9IGNvbWJpbmVSZXNwb25zZXMoc2VhcmNoUmVzdWx0LCBsb2NhbFJlc3VsdCwgc2VydmVyRXZlbnRzKTtcblxuICAgIGNvbnN0IHJlc3BvbnNlID0ge1xuICAgICAgICBzZWFyY2hfY2F0ZWdvcmllczoge1xuICAgICAgICAgICAgcm9vbV9ldmVudHM6IGNvbWJpbmVkUmVzdWx0LFxuICAgICAgICB9LFxuICAgIH07XG5cbiAgICBjb25zdCBvbGRSZXN1bHRDb3VudCA9IHNlYXJjaFJlc3VsdC5yZXN1bHRzID8gc2VhcmNoUmVzdWx0LnJlc3VsdHMubGVuZ3RoIDogMDtcblxuICAgIC8vIExldCB0aGUgY2xpZW50IHByb2Nlc3MgdGhlIGNvbWJpbmVkIHJlc3VsdC5cbiAgICBjb25zdCByZXN1bHQgPSBjbGllbnQucHJvY2Vzc1Jvb21FdmVudHNTZWFyY2goc2VhcmNoUmVzdWx0LCByZXNwb25zZSk7XG5cbiAgICAvLyBSZXN0b3JlIG91ciBlbmNyeXB0aW9uIGluZm8gc28gd2UgY2FuIHByb3Blcmx5IHJlLXZlcmlmeSB0aGUgZXZlbnRzLlxuICAgIGNvbnN0IG5ld1Jlc3VsdENvdW50ID0gcmVzdWx0LnJlc3VsdHMubGVuZ3RoIC0gb2xkUmVzdWx0Q291bnQ7XG4gICAgY29uc3QgbmV3U2xpY2UgPSByZXN1bHQucmVzdWx0cy5zbGljZShNYXRoLm1heChyZXN1bHQucmVzdWx0cy5sZW5ndGggLSBuZXdSZXN1bHRDb3VudCwgMCkpO1xuICAgIHJlc3RvcmVFbmNyeXB0aW9uSW5mbyhuZXdTbGljZSk7XG5cbiAgICBzZWFyY2hSZXN1bHQucGVuZGluZ1JlcXVlc3QgPSBudWxsO1xuXG4gICAgcmV0dXJuIHJlc3VsdDtcbn1cblxuZnVuY3Rpb24gZXZlbnRJbmRleFNlYXJjaCh0ZXJtOiBzdHJpbmcsIHJvb21JZDogc3RyaW5nID0gdW5kZWZpbmVkKTogUHJvbWlzZTxJU2VhcmNoUmVzdWx0cz4ge1xuICAgIGxldCBzZWFyY2hQcm9taXNlOiBQcm9taXNlPElTZWFyY2hSZXN1bHRzPjtcblxuICAgIGlmIChyb29tSWQgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICBpZiAoTWF0cml4Q2xpZW50UGVnLmdldCgpLmlzUm9vbUVuY3J5cHRlZChyb29tSWQpKSB7XG4gICAgICAgICAgICAvLyBUaGUgc2VhcmNoIGlzIGZvciBhIHNpbmdsZSBlbmNyeXB0ZWQgcm9vbSwgdXNlIG91ciBsb2NhbFxuICAgICAgICAgICAgLy8gc2VhcmNoIG1ldGhvZC5cbiAgICAgICAgICAgIHNlYXJjaFByb21pc2UgPSBsb2NhbFNlYXJjaFByb2Nlc3ModGVybSwgcm9vbUlkKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIFRoZSBzZWFyY2ggaXMgZm9yIGEgc2luZ2xlIG5vbi1lbmNyeXB0ZWQgcm9vbSwgdXNlIHRoZVxuICAgICAgICAgICAgLy8gc2VydmVyLXNpZGUgc2VhcmNoLlxuICAgICAgICAgICAgc2VhcmNoUHJvbWlzZSA9IHNlcnZlclNpZGVTZWFyY2hQcm9jZXNzKHRlcm0sIHJvb21JZCk7XG4gICAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgICAvLyBTZWFyY2ggYWNyb3NzIGFsbCByb29tcywgY29tYmluZSBhIHNlcnZlciBzaWRlIHNlYXJjaCBhbmQgYVxuICAgICAgICAvLyBsb2NhbCBzZWFyY2guXG4gICAgICAgIHNlYXJjaFByb21pc2UgPSBjb21iaW5lZFNlYXJjaCh0ZXJtKTtcbiAgICB9XG5cbiAgICByZXR1cm4gc2VhcmNoUHJvbWlzZTtcbn1cblxuZnVuY3Rpb24gZXZlbnRJbmRleFNlYXJjaFBhZ2luYXRpb24oc2VhcmNoUmVzdWx0OiBJU2VzaGF0U2VhcmNoUmVzdWx0cyk6IFByb21pc2U8SVNlc2hhdFNlYXJjaFJlc3VsdHM+IHtcbiAgICBjb25zdCBjbGllbnQgPSBNYXRyaXhDbGllbnRQZWcuZ2V0KCk7XG5cbiAgICBjb25zdCBzZXNoYXRRdWVyeSA9IHNlYXJjaFJlc3VsdC5zZXNoYXRRdWVyeTtcbiAgICBjb25zdCBzZXJ2ZXJRdWVyeSA9IHNlYXJjaFJlc3VsdC5fcXVlcnk7XG5cbiAgICBpZiAoIXNlc2hhdFF1ZXJ5KSB7XG4gICAgICAgIC8vIFRoaXMgaXMgYSBzZWFyY2ggaW4gYSBub24tZW5jcnlwdGVkIHJvb20uIERvIHRoZSBub3JtYWwgc2VydmVyLXNpZGVcbiAgICAgICAgLy8gcGFnaW5hdGlvbi5cbiAgICAgICAgcmV0dXJuIGNsaWVudC5iYWNrUGFnaW5hdGVSb29tRXZlbnRzU2VhcmNoKHNlYXJjaFJlc3VsdCk7XG4gICAgfSBlbHNlIGlmICghc2VydmVyUXVlcnkpIHtcbiAgICAgICAgLy8gVGhpcyBpcyBhIHNlYXJjaCBpbiBhIGVuY3J5cHRlZCByb29tLiBEbyBhIGxvY2FsIHBhZ2luYXRpb24uXG4gICAgICAgIGNvbnN0IHByb21pc2UgPSBsb2NhbFBhZ2luYXRpb24oc2VhcmNoUmVzdWx0KTtcbiAgICAgICAgc2VhcmNoUmVzdWx0LnBlbmRpbmdSZXF1ZXN0ID0gcHJvbWlzZTtcblxuICAgICAgICByZXR1cm4gcHJvbWlzZTtcbiAgICB9IGVsc2Uge1xuICAgICAgICAvLyBXZSBoYXZlIGJvdGggcXVlcmllcyBhcm91bmQsIHRoaXMgaXMgYSBzZWFyY2ggYWNyb3NzIGFsbCByb29tcyBzbyBhXG4gICAgICAgIC8vIGNvbWJpbmVkIHBhZ2luYXRpb24gbmVlZHMgdG8gYmUgZG9uZS5cbiAgICAgICAgY29uc3QgcHJvbWlzZSA9IGNvbWJpbmVkUGFnaW5hdGlvbihzZWFyY2hSZXN1bHQpO1xuICAgICAgICBzZWFyY2hSZXN1bHQucGVuZGluZ1JlcXVlc3QgPSBwcm9taXNlO1xuXG4gICAgICAgIHJldHVybiBwcm9taXNlO1xuICAgIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNlYXJjaFBhZ2luYXRpb24oc2VhcmNoUmVzdWx0OiBJU2VhcmNoUmVzdWx0cyk6IFByb21pc2U8SVNlYXJjaFJlc3VsdHM+IHtcbiAgICBjb25zdCBldmVudEluZGV4ID0gRXZlbnRJbmRleFBlZy5nZXQoKTtcbiAgICBjb25zdCBjbGllbnQgPSBNYXRyaXhDbGllbnRQZWcuZ2V0KCk7XG5cbiAgICBpZiAoc2VhcmNoUmVzdWx0LnBlbmRpbmdSZXF1ZXN0KSByZXR1cm4gc2VhcmNoUmVzdWx0LnBlbmRpbmdSZXF1ZXN0O1xuXG4gICAgaWYgKGV2ZW50SW5kZXggPT09IG51bGwpIHJldHVybiBjbGllbnQuYmFja1BhZ2luYXRlUm9vbUV2ZW50c1NlYXJjaChzZWFyY2hSZXN1bHQpO1xuICAgIGVsc2UgcmV0dXJuIGV2ZW50SW5kZXhTZWFyY2hQYWdpbmF0aW9uKHNlYXJjaFJlc3VsdCk7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGV2ZW50U2VhcmNoKHRlcm06IHN0cmluZywgcm9vbUlkOiBzdHJpbmcgPSB1bmRlZmluZWQpOiBQcm9taXNlPElTZWFyY2hSZXN1bHRzPiB7XG4gICAgY29uc3QgZXZlbnRJbmRleCA9IEV2ZW50SW5kZXhQZWcuZ2V0KCk7XG5cbiAgICBpZiAoZXZlbnRJbmRleCA9PT0gbnVsbCkgcmV0dXJuIHNlcnZlclNpZGVTZWFyY2hQcm9jZXNzKHRlcm0sIHJvb21JZCk7XG4gICAgZWxzZSByZXR1cm4gZXZlbnRJbmRleFNlYXJjaCh0ZXJtLCByb29tSWQpO1xufVxuIl0sIm1hcHBpbmdzIjoiOzs7Ozs7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