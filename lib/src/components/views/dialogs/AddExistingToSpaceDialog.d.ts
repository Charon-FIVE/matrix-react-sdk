import React, { ReactNode } from "react";
import { Room } from "matrix-js-sdk/src/models/room";
import { ButtonEvent } from "../elements/AccessibleButton";
interface IProps {
    space: Room;
    onCreateRoomClick(ev: ButtonEvent): void;
    onAddSubspaceClick(): void;
    onFinished(added?: boolean): void;
}
export declare const Entry: ({ room, checked, onChange }: {
    room: any;
    checked: any;
    onChange: any;
}) => JSX.Element;
declare type OnChangeFn = (checked: boolean, room: Room) => void;
declare type Renderer = (rooms: Room[], selectedToAdd: Set<Room>, scrollState: IScrollState, onChange: undefined | OnChangeFn) => ReactNode;
interface IAddExistingToSpaceProps {
    space: Room;
    footerPrompt?: ReactNode;
    filterPlaceholder: string;
    emptySelectionButton?: ReactNode;
    onFinished(added: boolean): void;
    roomsRenderer?: Renderer;
    spacesRenderer?: Renderer;
    dmsRenderer?: Renderer;
}
interface IScrollState {
    scrollTop: number;
    height: number;
}
export declare const AddExistingToSpace: React.FC<IAddExistingToSpaceProps>;
export declare const defaultRoomsRenderer: Renderer;
export declare const defaultSpacesRenderer: Renderer;
export declare const defaultDmsRenderer: Renderer;
interface ISubspaceSelectorProps {
    title: string;
    space: Room;
    value: Room;
    onChange(space: Room): void;
}
export declare const SubspaceSelector: ({ title, space, value, onChange }: ISubspaceSelectorProps) => JSX.Element;
declare const AddExistingToSpaceDialog: React.FC<IProps>;
export default AddExistingToSpaceDialog;
