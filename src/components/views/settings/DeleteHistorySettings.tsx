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

import React from 'react';
import { _t } from "matrix-react-sdk/src/languageHandler";
import { MatrixClientPeg } from "matrix-react-sdk/src/MatrixClientPeg";
import { logger } from "matrix-js-sdk/src/logger";
import Spinner from "matrix-react-sdk/src/components/views/elements/Spinner";
import DiscoveryEmailAddresses from "matrix-react-sdk/src/components/views/settings/discovery/EmailAddresses";
import DiscoveryPhoneNumbers from "matrix-react-sdk/src/components/views/settings/discovery/PhoneNumbers";
import { IThreepid } from "matrix-js-sdk/src/@types/threepids";
import { getThreepidsWithBindStatus } from 'matrix-react-sdk/src/boundThreepids';
import { Policies, Service } from 'matrix-react-sdk/src/Terms';
import AccessibleButton from "matrix-react-sdk/src/components/views/elements/AccessibleButton";
import QuestionDialog from 'matrix-react-sdk/src/components/views/dialogs/QuestionDialog';
import Modal from 'matrix-react-sdk/src/Modal';
import { DefaultTagID } from 'matrix-react-sdk/src/stores/room-list/models';
import RoomListStore from 'matrix-react-sdk/src/stores/room-list/RoomListStore';
import { MessagePreviewStore } from 'matrix-react-sdk/src/stores/room-list/MessagePreviewStore';


export default class DeleteHistorySettings extends React.Component<{}> {
    constructor(props: {}) {
        super(props);
    }
   

    private onDeleteLocalChatHistory(){


        Modal.createDialog(QuestionDialog, {
            title: _t("Delete local chat history"),
            description: _t(
                "Sorry, the poll you tried to create was not posted."),
            button: _t('Try again'),
            cancelButton: _t('Cancel'),
            onFinished: (tryAgain: boolean) => {
                if (!tryAgain) {
                   // this.cancel();
                } else {
                   // this.setState({ busy: false, canSubmit: true });
                }
            },
        });





        // Modal.createDialog(QuestionDialog, {}, QuestionDialog, {
        //     title: _t("Delete local chat history"),
        //     description: <pre>{ _t("All chat history and attachments will be cleared") }</pre>,
        //     button:_t("Confirm"),
        //     onFinished: async(sure) => {
        //         if(sure){
        //              //删除本地数据库
                    
        //             const TAG_ORDER= [
        //                 DefaultTagID.Invite,
        //                 DefaultTagID.Favourite,
        //                 DefaultTagID.DM,
        //                 DefaultTagID.Untagged,
        //                 // -- Custom Tags Placeholder --
        //                 DefaultTagID.LowPriority,
        //                 DefaultTagID.ServerNotice,
                       
        //             ];
                    
        //             //重置本地房间时间线
        //             const lists = RoomListStore.instance.orderedLists;
        //             //重置服务端房间时间线
        //            for (let i = 0; i < TAG_ORDER.length; i++) {
        //                const t = TAG_ORDER[i];
        //                const listRooms = lists[t];
        //                for(let j = 0;j<listRooms.length;j++){
        //                    let room = listRooms[j];
        //                    if(room){
        //                     room.resetLiveTimeline(null,null);
        //                     await MessagePreviewStore.instance.cleanPreviews(room);
        //                     await MatrixClientPeg.get().clearSession(room.roomId,0);
        //                    }
        //                }
        //            }
        //           // MatrixClientPeg.get().store.deleteData();
        //            localStorage.removeItem("mx_last_room_id"); 
        //            dis.dispatch({ action: "clean_NotificationNum" });//通知清除计数如果
        //            MatrixClientPeg.get().stopClient();
        //            MatrixClientPeg.get().store.deleteData().then(() => {
        //                MatrixClientPeg.get().store.setSyncToken('');
        //                //location.reload();
        //                PlatformPeg.get().reload();
        //            });
        //         }
        //     },
        // });
    }

    public render(): JSX.Element {
        return (
            <div>
                <AccessibleButton className='clear-cache-button' onClick={this.onDeleteLocalChatHistory} kind='danger'>
                        { _t("Delete local chat history") }
                </AccessibleButton>
            </div>);
    }
}
