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
import AccessibleButton from "matrix-react-sdk/src/components/views/elements/AccessibleButton";
import QuestionDialog from 'matrix-react-sdk/src/components/views/dialogs/QuestionDialog';
import Modal from 'matrix-react-sdk/src/Modal';
import { DefaultTagID } from 'matrix-react-sdk/src/stores/room-list/models';
import RoomListStore from 'matrix-react-sdk/src/stores/room-list/RoomListStore';

import defaultDispatcher from 'matrix-react-sdk/src/dispatcher/dispatcher';
import createMatrixClient from 'matrix-react-sdk/src/utils/createMatrixClient';


export default class DeleteHistorySettings extends React.Component<{}> {
    constructor(props: {}) {
        super(props);
    }
   

    private onDeleteLocalChatHistory(){
        Modal.createDialog(QuestionDialog, {
            title: _t("Delete local chat history"),
            description: _t("All chat history and attachments will be cleared"),
            button: _t('Confirm'),
            cancelButton: _t('Cancel'),
            onFinished: async (sure: boolean) => {
                if (sure) {
                    const TAG_ORDER= [
                                        DefaultTagID.Invite,
                                        DefaultTagID.Favourite,
                                        DefaultTagID.DM,
                                        DefaultTagID.Untagged,
                                        // -- Custom Tags Placeholder --
                                        DefaultTagID.LowPriority,
                                        DefaultTagID.ServerNotice,
                                       
                                    ];


                      //重置本地房间时间线
                    const lists = RoomListStore.instance.orderedLists;
                    //重置服务端房间时间线
                   for (let i = 0; i < TAG_ORDER.length; i++) {
                       const t = TAG_ORDER[i];
                       const listRooms = lists[t];
                       for(let j = 0;j<listRooms.length;j++){
                           let room = listRooms[j];
                           if(room){
                            room.resetLiveTimeline(null,null);
                          //  await MessagePreviewStore.instance.cleanPreviews(room);
                          //  await MatrixClientPeg.get().clearSession(room.roomId,0);
                           }
                       }
                   }                                    
                Modal.closeCurrentModal("");

                //    localStorage.removeItem("mx_last_room_id"); 
                //    defaultDispatcher.dispatch({ action: "clean_NotificationNum" });//通知清除计数如果
                //    MatrixClientPeg.get().stopClient();
                //    const cli = createMatrixClient({
                //     // we'll never make any requests, so can pass a bogus HS URL
                //     baseUrl: "",
                //    });
                //    await cli.clearStores();
                } 
            },
        });
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
