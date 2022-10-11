import React from 'react';
import { MatrixEvent } from "matrix-js-sdk/src/models/event";
import MatrixClientContext from "../../../contexts/MatrixClientContext";
interface IProps {
    mxEvent: MatrixEvent;
    onClick?(): void;
}
export default class SenderProfile extends React.PureComponent<IProps> {
    static contextType: React.Context<import("matrix-js-sdk/src").MatrixClient>;
    context: React.ContextType<typeof MatrixClientContext>;
    render(): JSX.Element;
}
export {};
