import React, { ContextType, MutableRefObject } from 'react';
import MatrixClientContext from "../../../contexts/MatrixClientContext";
interface IProps {
    persistentWidgetId: string;
    persistentRoomId: string;
    pointerEvents?: string;
    movePersistedElement: MutableRefObject<() => void>;
}
export default class PersistentApp extends React.Component<IProps> {
    static contextType: React.Context<import("matrix-js-sdk/src").MatrixClient>;
    context: ContextType<typeof MatrixClientContext>;
    private room;
    constructor(props: IProps, context: ContextType<typeof MatrixClientContext>);
    private get app();
    render(): JSX.Element;
}
export {};
