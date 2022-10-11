import React from 'react';
import { Relations } from 'matrix-js-sdk/src/models/relations';
import { IMediaBody } from "./IMediaBody";
import { MediaEventHelper } from "../../../utils/MediaEventHelper";
import { IBodyProps } from "./IBodyProps";
import MatrixClientContext from '../../../contexts/MatrixClientContext';
import { IEventTileOps } from "../rooms/EventTile";
interface IProps extends Omit<IBodyProps, "onMessageAllowed" | "mediaEventHelper"> {
    overrideBodyTypes?: Record<string, typeof React.Component>;
    overrideEventTypes?: Record<string, typeof React.Component>;
    getRelationsForEvent?: (eventId: string, relationType: string, eventType: string) => Relations;
    isSeeingThroughMessageHiddenForModeration?: boolean;
}
export interface IOperableEventTile {
    getEventTileOps(): IEventTileOps;
}
export default class MessageEvent extends React.Component<IProps> implements IMediaBody, IOperableEventTile {
    private body;
    private mediaHelper;
    private bodyTypes;
    private evTypes;
    static contextType: React.Context<import("matrix-js-sdk/src").MatrixClient>;
    context: React.ContextType<typeof MatrixClientContext>;
    constructor(props: IProps, context: React.ContextType<typeof MatrixClientContext>);
    componentDidMount(): void;
    componentWillUnmount(): void;
    componentDidUpdate(prevProps: Readonly<IProps>): void;
    private updateComponentMaps;
    getEventTileOps: () => IEventTileOps;
    getMediaHelper(): MediaEventHelper;
    private onDecrypted;
    private onTileUpdate;
    render(): JSX.Element;
}
export {};
