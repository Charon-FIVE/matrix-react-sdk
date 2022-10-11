import React from 'react';
import { RoomMember } from 'matrix-js-sdk/src/models/room-member';
import { IEventRelation } from 'matrix-js-sdk/src/models/event';
import { AboveLeftOf } from "../../structures/ContextMenu";
interface IProps {
    roomId: string;
    sender: RoomMember;
    menuPosition: AboveLeftOf;
    relation?: IEventRelation;
}
export declare const LocationButton: React.FC<IProps>;
export default LocationButton;
