import React from "react";
import { Room } from "matrix-js-sdk/src/models/room";
import { RoomType } from "matrix-js-sdk/src/@types/event";
import { JoinRule } from "matrix-js-sdk/src/@types/partials";
import { IOpts } from "../../../createRoom";
interface IProps {
    type?: RoomType;
    defaultPublic?: boolean;
    defaultName?: string;
    parentSpace?: Room;
    defaultEncrypted?: boolean;
    onFinished(proceed: boolean, opts?: IOpts): void;
}
interface IState {
    joinRule: JoinRule;
    isPublic: boolean;
    isEncrypted: boolean;
    name: string;
    topic: string;
    alias: string;
    detailsOpen: boolean;
    noFederate: boolean;
    nameIsValid: boolean;
    canChangeEncryption: boolean;
}
export default class CreateRoomDialog extends React.Component<IProps, IState> {
    private readonly supportsRestricted;
    private nameField;
    private aliasField;
    constructor(props: any);
    private roomCreateOptions;
    componentDidMount(): void;
    componentWillUnmount(): void;
    private onKeyDown;
    private onOk;
    private onCancel;
    private onNameChange;
    private onTopicChange;
    private onJoinRuleChange;
    private onEncryptedChange;
    private onAliasChange;
    private onDetailsToggled;
    private onNoFederateChange;
    private onNameValidate;
    private static validateRoomName;
    render(): JSX.Element;
}
export {};
