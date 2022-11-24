import { Room } from "matrix-js-sdk/src/models/room";
import { EventType, RoomCreateTypeField, RoomType } from "matrix-js-sdk/src/@types/event";
import { ICreateRoomOpts } from "matrix-js-sdk/src/@types/requests";
import {
    HistoryVisibility,
    JoinRule,
    Preset,
    RestrictedAllowType,
    Visibility,
} from "matrix-js-sdk/src/@types/partials";

import { MatrixClientPeg } from './MatrixClientPeg';
import Modal from './Modal';
import { _t } from './languageHandler';
import dis from "./dispatcher/dispatcher";
import * as Rooms from "./Rooms";
import { makeSpaceParentEvent } from "./utils/space";
import { Action } from "./dispatcher/actions";
import ErrorDialog from "./components/views/dialogs/ErrorDialog";
import Spinner from "./components/views/elements/Spinner";

export interface IOpts {
  dmUserId?: string;
  createOpts?: ICreateRoomOpts;
  spinner?: boolean;
  guestAccess?: boolean;
  encryption?: boolean;
  inlineErrors?: boolean;
  andView?: boolean;
  associatedWithCommunity?: string;
  avatar?: File | string; // will upload if given file, else mxcUrl is needed
  roomType?: RoomType | string;
  historyVisibility?: HistoryVisibility;
  parentSpace?: Room;
  joinRule?: JoinRule;
}
/**
 * add Friends
 *
 * @param {object=} opts parameters for creating the room
 * @param {string=} opts.dmUserId If specified, make this a DM room for this user and invite them
 * @param {object=} opts.createOpts set of options to pass to createRoom call.
 * @param {bool=} opts.spinner True to show a modal spinner while the room is created.
 *     Default: True
 * @param {bool=} opts.guestAccess Whether to enable guest access.
 *     Default: True
 * @param {bool=} opts.encryption Whether to enable encryption.
 *     Default: False
 * @param {bool=} opts.inlineErrors True to raise errors off the promise instead of resolving to null.
 *     Default: False
 * @param {bool=} opts.andView True to dispatch an action to view the room once it has been created.
 *
 * @returns {Promise} which resolves to the room id, or null if the
 * action was aborted or failed.
 */
export default async function createFriends(opts: IOpts): Promise<string | null> {
    opts = opts || {};
    if (opts.spinner === undefined) opts.spinner = true;
    if (opts.guestAccess === undefined) opts.guestAccess = true;
    if (opts.encryption === undefined) opts.encryption = false;

   // const startTime = CountlyAnalytics.getTimestamp();

    const client = MatrixClientPeg.get();
    // if (client.isGuest()) {
    //     dis.dispatch({ action: 'require_registration' });
    //     return null;
    // }

    const defaultPreset = opts.dmUserId ? Preset.TrustedPrivateChat : Preset.PrivateChat;

    // set some defaults for the creation
    const createOpts: ICreateRoomOpts = opts.createOpts || {};
    createOpts.preset = createOpts.preset || defaultPreset;
    createOpts.visibility = createOpts.visibility || Visibility.Private;
    if (opts.dmUserId && createOpts.invite === undefined) {
        // switch (getAddressType(opts.dmUserId)) {
        //     case 'mx-user-id':
        //         createOpts.invite = [opts.dmUserId];
        //         break;
        //     case 'email':
        //         createOpts.invite_3pid = [{
        //             id_server: MatrixClientPeg.get().getIdentityServerUrl(true),
        //             medium: 'email',
        //             address: opts.dmUserId,
        //         }];
        // }
        createOpts.invite = [opts.dmUserId];
    }
    if (opts.dmUserId && createOpts.is_direct === undefined) {
        createOpts.is_direct = true;
    }

    if (opts.roomType) {
        createOpts.creation_content = {
            ...createOpts.creation_content,
            [RoomCreateTypeField]: opts.roomType,
        };
    }

    // By default, view the room after creating it
    if (opts.andView === undefined) {
        opts.andView = true;
    }

    createOpts.initial_state = createOpts.initial_state || [];

    // Allow guests by default since the room is private and they'd
    // need an invite. This means clicking on a 3pid invite email can
    // actually drop you right in to a chat.
    // if (opts.guestAccess) {
    //     createOpts.initial_state.push({
    //         type: 'm.room.guest_access',
    //         state_key: '',
    //         content: {
    //             guest_access: 'can_join',
    //         },
    //     });
    // }

    if (opts.encryption) {
        createOpts.initial_state.push({
            type: 'm.room.encryption',
            state_key: '',
            content: {
                algorithm: 'm.megolm.v1.aes-sha2',
            },
        });
    }

    if (opts.parentSpace) {
        createOpts.initial_state.push(makeSpaceParentEvent(opts.parentSpace, true));
        if (!opts.historyVisibility) {
            opts.historyVisibility = createOpts.preset === Preset.PublicChat
                ? HistoryVisibility.WorldReadable
                : HistoryVisibility.Invited;
        }

        if (opts.joinRule === JoinRule.Restricted) {
            // if (SpaceStore.instance.restrictedJoinRuleSupport?.preferred) {
            //     createOpts.room_version = SpaceStore.instance.restrictedJoinRuleSupport.preferred;

            //     createOpts.initial_state.push({
            //         type: EventType.RoomJoinRules,
            //         content: {
            //             "join_rule": JoinRule.Restricted,
            //             "allow": [{
            //                 "type": RestrictedAllowType.RoomMembership,
            //                 "room_id": opts.parentSpace.roomId,
            //             }],
            //         },
            //     });
            // }
        }
    }

    // we handle the restricted join rule in the parentSpace handling block above
    if (opts.joinRule && opts.joinRule !== JoinRule.Restricted) {
        createOpts.initial_state.push({
            type: EventType.RoomJoinRules,
            content: { join_rule: opts.joinRule },
        });
    }

    // if(!opts.joinRule){
    //     createOpts.initial_state.push({
    //         type: EventType.RoomJoinRules,
    //         content: { join_rule: JoinRule.Restricted },
    //     });
    // }

    if (opts.avatar) {
        let url = opts.avatar;
        if (opts.avatar instanceof File) {
            url = await client.uploadContent(opts.avatar);
        }

        createOpts.initial_state.push({
            type: EventType.RoomAvatar,
            content: { url },
        });
    }

    if (opts.historyVisibility) {
        createOpts.initial_state.push({
            type: EventType.RoomHistoryVisibility,
            content: {
                "history_visibility": opts.historyVisibility,
            },
        });
    }

    let modal;
    if (opts.spinner) modal = Modal.createDialog(Spinner, null, 'mx_Dialog_spinner');

    let roomId;
    return client.createFriends(createOpts).finally(function() {
        if (modal) modal.close();
    }).then(function(res) {
        roomId = res.room_id;
        if (opts.dmUserId) {
            return Rooms.setDMRoom(roomId, opts.dmUserId);
        } else {
            return Promise.resolve();
        }
    }).then(() => {
        // if (opts.parentSpace) {
        //     return SpaceStore.instance.addRoomToSpace(opts.parentSpace, roomId, [client.getDomain()], true);
        // }
        // if (opts.associatedWithCommunity) {
        //     return GroupStore.addRoomToGroup(opts.associatedWithCommunity, roomId, false);
        // }
    }).then(function() {
        // NB createRoom doesn't block on the client seeing the echo that the
        // room has been created, so we race here with the client knowing that
        // the room exists, causing things like
        // https://github.com/vector-im/vector-web/issues/1813
        // Even if we were to block on the echo, servers tend to split the room
        // state over multiple syncs so we can't atomically know when we have the
        // entire thing.
        if (opts.andView) {
            dis.dispatch({
                action: 'view_room',
                room_id: roomId,
                should_peek: false,
                // Creating a room will have joined us to the room,
                // so we are expecting the room to come down the sync
                // stream, if it hasn't already.
                joining: true,
                justCreatedOpts: opts,
            });
        }
       // CountlyAnalytics.instance.trackRoomCreate(startTime, roomId);
        return roomId;
    }, function (err) {
        dis.dispatch({
            action: Action.JoinRoomError,
            roomId,
        });
        // Raise the error if the caller requested that we do so.
        let ErrorInfo = JSON.parse(JSON.stringify(err))
        if (ErrorInfo.data.errcode === "M_FRIEND_LIMIT_EXCEEDED") {
            Modal.createDialog(ErrorDialog, {
                title: _t("Failed to invite"),
                description: '你或者对方的好友人数已经达到上限',
            }, 'failed-invite-doalog');

        } else { 
            Modal.createDialog(ErrorDialog, {
                title: _t("Failed to invite"),
                description: ErrorInfo.data.error,
            }, 'failed-invite-doalog');
        }
        // if (opts.inlineErrors) throw err;
        
        // We also failed to join the room (this sets joining to false in RoomViewStore)
        
        // console.error("Failed to create room " + roomId + " " + err);
        // let description = _t("Server may be unavailable, overloaded, or you hit a bug.");
        // if (err.errcode === "M_UNSUPPORTED_ROOM_VERSION") {
        //     // Technically not possible with the UI as of April 2019 because there's no
        //     // options for the user to change this. However, it's not a bad thing to report
        //     // the error to the user for if/when the UI is available.
        //     description = _t("The server does not support the room version specified.");
        // }
        // Modal.createTrackedDialog('Failure to create room', '', ErrorDialog, {
        //     title: _t("Failure to create room"),
        //     description,
        // },'failed-invite-doalog');
        return null;
    });
}
