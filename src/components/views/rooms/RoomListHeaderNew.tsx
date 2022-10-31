/*
Copyright 2021 - 2022 The Matrix.org Foundation C.I.C.

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
import { Room } from "matrix-js-sdk/src";
import React, { useContext, useEffect } from "react";

import MatrixClientContext from "../../../contexts/MatrixClientContext";
import { shouldShowComponent } from "../../../customisations/helpers/UIComponents";
import { Action } from "../../../dispatcher/actions";
import defaultDispatcher from "../../../dispatcher/dispatcher";

import { useEventEmitterState} from "../../../hooks/useEventEmitter";

import { _t } from "../../../languageHandler";
import PosthogTrackers from "../../../PosthogTrackers";
import { UIComponent } from "../../../settings/UIFeature";
import {
 
    MetaSpace,
    SpaceKey,
 
    UPDATE_SELECTED_SPACE,
} from "../../../stores/spaces";
import SpaceStore from "../../../stores/spaces/SpaceStore";

import { ChevronFace, ContextMenuTooltipButton, useContextMenu } from "../../structures/ContextMenu";

import IconizedContextMenu, {
    IconizedContextMenuOption,
    IconizedContextMenuOptionList,
} from "../context_menus/IconizedContextMenu";


const contextMenuBelow = (elementRect: DOMRect) => {
    // align the context menu's icons with the icon which opened the context menu
    const left = elementRect.left + window.scrollX;
    const top = elementRect.bottom + window.scrollY + 12;
    const chevronFace = ChevronFace.None;
    return { left, top, chevronFace };
};


interface IProps {
    onVisibilityChange?(): void;
}

const RoomListHeaderNew = ({ onVisibilityChange }: IProps) => {
    const cli = useContext(MatrixClientContext);
    const [mainMenuDisplayed, mainMenuHandle, openMainMenu, closeMainMenu] = useContextMenu<HTMLDivElement>();
    const [plusMenuDisplayed, plusMenuHandle, openPlusMenu, closePlusMenu] = useContextMenu<HTMLDivElement>();
    // const [spaceKey, activeSpace] = useEventEmitterState<[SpaceKey, Room | null]>(
    //     SpaceStore.instance,
    //     UPDATE_SELECTED_SPACE,
    //     () => [SpaceStore.instance.activeSpace, SpaceStore.instance.activeSpaceRoom],
    // );
   

    // useEffect(() => {
    //     if (mainMenuDisplayed && !canShowMainMenu) {
    //         // Space changed under us and we no longer has a main menu to draw
    //         closeMainMenu();
    //     }
    // }, [closeMainMenu, canShowMainMenu, mainMenuDisplayed]);

  //  const spaceName = useTypedEventEmitterState(activeSpace, RoomEvent.Name, () => activeSpace?.name);

    useEffect(() => {
        if (onVisibilityChange) {
            onVisibilityChange();
        }
    }, [onVisibilityChange]);

    const canExploreRooms = shouldShowComponent(UIComponent.ExploreRooms);
    const canCreateRooms = shouldShowComponent(UIComponent.CreateRooms);
    const canCreateSpaces = shouldShowComponent(UIComponent.CreateSpaces);

    // const hasPermissionToAddSpaceChild =
    //     activeSpace?.currentState?.maySendStateEvent(EventType.SpaceChild, cli.getUserId());
    
    // If the user can't do anything on the plus menu, don't show it. This aims to target the
    // plus menu shown on the Home tab primarily: the user has options to use the menu for
    // communities and spaces, but is at risk of no options on the Home tab.
    const canShowPlusMenu = canCreateRooms || canExploreRooms || canCreateSpaces ;

    let contextMenu: JSX.Element;
  
     if (plusMenuDisplayed) {
        let newRoomOpts: JSX.Element;
        let joinRoomOpt: JSX.Element;

        if (canCreateRooms) {
            newRoomOpts = <>
                <IconizedContextMenuOption
                    label={_t("Add friends")}
                    iconClassName="mx_RoomListHeader_iconStartChat"
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        defaultDispatcher.dispatch({ action: "view_create_chat" });
                        PosthogTrackers.trackInteraction("WebRoomListHeaderPlusMenuCreateChatItem", e);
                        closePlusMenu();
                    }}
                />
                <IconizedContextMenuOption
                    label={_t("Group chat")}
                    iconClassName="mx_RoomListHeader_iconNewRoom"
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        defaultDispatcher.dispatch({ action: "view_create_room" });
                        PosthogTrackers.trackInteraction("WebRoomListHeaderPlusMenuCreateRoomItem", e);
                        closePlusMenu();
                    }}
                />
              
            </>;
        }
        if (canExploreRooms) {
            joinRoomOpt = (
                <IconizedContextMenuOption
                    label={_t("Search group")}
                    iconClassName="mx_RoomListHeader_iconExplore"
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        defaultDispatcher.dispatch({ action: Action.ViewRoomDirectory });
                        PosthogTrackers.trackInteraction("WebRoomListHeaderPlusMenuExploreRoomsItem", e);
                        closePlusMenu();
                    }}
                />
            );
        }

        contextMenu = <IconizedContextMenu
            {...contextMenuBelow(plusMenuHandle.current.getBoundingClientRect())}
            onFinished={closePlusMenu}
            compact
        >
            <IconizedContextMenuOptionList first>
                { newRoomOpts }
                { joinRoomOpt }
            </IconizedContextMenuOptionList>
        </IconizedContextMenu>;
    }
    return <div className="mx_RoomListHeader">
        { canShowPlusMenu && <ContextMenuTooltipButton
            inputRef={plusMenuHandle}
            onClick={openPlusMenu}
            isExpanded={plusMenuDisplayed}
            className="mx_RoomListHeader_plusButton"
            title={_t("Start group chat, add friends, search for groups")}
        /> }

        { contextMenu }
    </div>;
};

export default RoomListHeaderNew;
