import React from 'react';
import { Room } from 'matrix-js-sdk/src/models/room';
import { IWidgetEvent } from '../../../utils/WidgetUtils';
interface IProps {
    room: Room;
    threadId?: string | null;
    isStickerPickerOpen: boolean;
    menuPosition?: any;
    setStickerPickerOpen: (isStickerPickerOpen: boolean) => void;
}
interface IState {
    imError: string;
    stickerpickerWidget: IWidgetEvent;
    widgetId: string;
}
export default class Stickerpicker extends React.PureComponent<IProps, IState> {
    static defaultProps: {
        threadId: any;
    };
    static currentWidget: any;
    private dispatcherRef;
    private prevSentVisibility;
    private popoverWidth;
    private popoverHeight;
    private scalarClient;
    constructor(props: IProps);
    private acquireScalarClient;
    private removeStickerpickerWidgets;
    componentDidMount(): void;
    componentWillUnmount(): void;
    componentDidUpdate(): void;
    private imError;
    private updateWidget;
    private onAction;
    private onRightPanelStoreUpdate;
    private defaultStickerpickerContent;
    private errorStickerpickerContent;
    private sendVisibilityToWidget;
    getStickerpickerContent(): JSX.Element;
    /**
     * Called when the window is resized
     */
    private onResize;
    /**
     * The stickers picker was hidden
     */
    private onFinished;
    /**
     * Launch the integration manager on the stickers integration page
     */
    private launchManageIntegrations;
    render(): JSX.Element;
}
export {};
