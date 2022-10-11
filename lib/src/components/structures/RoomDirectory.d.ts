import React from "react";
import { IPublicRoomsChunkRoom } from "matrix-js-sdk/src/client";
import { IDialogProps } from "../views/dialogs/IDialogProps";
import { IPublicRoomDirectoryConfig } from "../views/directory/NetworkDropdown";
interface IProps extends IDialogProps {
    initialText?: string;
}
interface IState {
    publicRooms: IPublicRoomsChunkRoom[];
    loading: boolean;
    protocolsLoading: boolean;
    error?: string | null;
    serverConfig: IPublicRoomDirectoryConfig | null;
    filterString: string;
}
export default class RoomDirectory extends React.Component<IProps, IState> {
    private unmounted;
    private nextBatch;
    private filterTimeout;
    private protocols;
    constructor(props: any);
    componentDidMount(): void;
    componentWillUnmount(): void;
    private refreshRoomList;
    private getMoreRooms;
    /**
     * A limited interface for removing rooms from the directory.
     * Will set the room to not be publicly visible and delete the
     * default alias. In the long term, it would be better to allow
     * HS admins to do this through the RoomSettings interface, but
     * this needs SPEC-417.
     */
    private removeFromDirectory;
    private onOptionChange;
    private onFillRequest;
    private onFilterChange;
    private onFilterClear;
    private onJoinFromSearchClick;
    private onCreateRoomClick;
    private onRoomClick;
    private stringLooksLikeId;
    private onFinished;
    render(): JSX.Element;
}
export declare function getDisplayAliasForRoom(room: IPublicRoomsChunkRoom): string;
export {};
