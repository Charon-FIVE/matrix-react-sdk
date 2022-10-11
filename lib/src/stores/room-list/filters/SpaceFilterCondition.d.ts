/// <reference types="node" />
import { EventEmitter } from "events";
import { Room } from "matrix-js-sdk/src/models/room";
import { IFilterCondition } from "./IFilterCondition";
import { IDestroyable } from "../../../utils/IDestroyable";
import { SpaceKey } from "../../spaces";
/**
 * A filter condition for the room list which reveals rooms which
 * are a member of a given space or if no space is selected shows:
 *  + Orphaned rooms (ones not in any space you are a part of)
 *  + All DMs
 */
export declare class SpaceFilterCondition extends EventEmitter implements IFilterCondition, IDestroyable {
    private roomIds;
    private userIds;
    private showPeopleInSpace;
    private space;
    isVisible(room: Room): boolean;
    private onStoreUpdate;
    updateSpace(space: SpaceKey): void;
    destroy(): void;
}
