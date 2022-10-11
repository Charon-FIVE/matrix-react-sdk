import * as React from 'react';
import { Room } from "matrix-js-sdk/src/models/room";
import { User } from "matrix-js-sdk/src/models/user";
import { RoomMember } from "matrix-js-sdk/src/models/room-member";
import { MatrixEvent } from "matrix-js-sdk/src/models/event";
import { RoomPermalinkCreator } from "../../../utils/permalinks/Permalinks";
import { IDialogProps } from "./IDialogProps";
interface IProps extends IDialogProps {
    target: Room | User | RoomMember | MatrixEvent;
    permalinkCreator: RoomPermalinkCreator;
}
interface IState {
    linkSpecificEvent: boolean;
    permalinkCreator: RoomPermalinkCreator;
}
export default class ShareDialog extends React.PureComponent<IProps, IState> {
    protected closeCopiedTooltip: () => void;
    constructor(props: any);
    static onLinkClick(e: any): void;
    private onLinkSpecificEventCheckboxClick;
    componentWillUnmount(): void;
    private getUrl;
    render(): JSX.Element;
}
export {};
