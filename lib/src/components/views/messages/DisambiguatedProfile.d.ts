import React from 'react';
import { RoomMember } from 'matrix-js-sdk/src/models/room-member';
interface IProps {
    member?: RoomMember;
    fallbackName: string;
    onClick?(): void;
    colored?: boolean;
    emphasizeDisplayName?: boolean;
}
export default class DisambiguatedProfile extends React.Component<IProps> {
    render(): JSX.Element;
}
export {};
