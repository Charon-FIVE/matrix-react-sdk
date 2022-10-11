import React, { SyntheticEvent } from 'react';
import { Room } from 'matrix-js-sdk/src/models/room';
import { IEventRelation } from 'matrix-js-sdk/src/models/event';
import { AboveLeftOf } from '../../structures/ContextMenu';
import { ILocationPickerProps } from "./LocationPicker";
declare type Props = Omit<ILocationPickerProps, 'onChoose' | 'shareType'> & {
    onFinished: (ev?: SyntheticEvent) => void;
    menuPosition: AboveLeftOf;
    openMenu: () => void;
    roomId: Room["roomId"];
    relation?: IEventRelation;
};
declare const LocationShareMenu: React.FC<Props>;
export default LocationShareMenu;
