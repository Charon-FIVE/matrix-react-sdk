import React, { ContextType } from 'react';
import MatrixClientContext from "../../../../../contexts/MatrixClientContext";
interface IProps {
    roomId: string;
}
interface IState {
    isRoomPublished: boolean;
}
export default class GeneralRoomSettingsTab extends React.Component<IProps, IState> {
    static contextType: React.Context<import("matrix-js-sdk/src").MatrixClient>;
    context: ContextType<typeof MatrixClientContext>;
    constructor(props: IProps, context: ContextType<typeof MatrixClientContext>);
    private onLeaveClick;
    render(): JSX.Element;
}
export {};
