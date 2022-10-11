import React from 'react';
import { IContent, MatrixEvent, IEventRelation } from 'matrix-js-sdk/src/models/event';
import { Room } from 'matrix-js-sdk/src/models/room';
import EditorModel from '../../../editor/model';
import { MatrixClientProps } from "../../../contexts/MatrixClientContext";
import { RoomPermalinkCreator } from "../../../utils/permalinks/Permalinks";
import RoomContext from '../../../contexts/RoomContext';
export declare function attachRelation(content: IContent, relation?: IEventRelation): void;
export declare function createMessageContent(model: EditorModel, replyToEvent: MatrixEvent, relation: IEventRelation | undefined, permalinkCreator: RoomPermalinkCreator, includeReplyLegacyFallback?: boolean): IContent;
export declare function isQuickReaction(model: EditorModel): boolean;
interface ISendMessageComposerProps extends MatrixClientProps {
    room: Room;
    placeholder?: string;
    permalinkCreator: RoomPermalinkCreator;
    relation?: IEventRelation;
    replyToEvent?: MatrixEvent;
    disabled?: boolean;
    onChange?(model: EditorModel): void;
    includeReplyLegacyFallback?: boolean;
    toggleStickerPickerOpen: () => void;
}
export declare class SendMessageComposer extends React.Component<ISendMessageComposerProps> {
    static contextType: React.Context<import("../../structures/RoomView").IRoomState>;
    context: React.ContextType<typeof RoomContext>;
    private readonly prepareToEncrypt?;
    private readonly editorRef;
    private model;
    private currentlyComposedEditorState;
    private dispatcherRef;
    private sendHistoryManager;
    static defaultProps: {
        includeReplyLegacyFallback: boolean;
    };
    constructor(props: ISendMessageComposerProps, context: React.ContextType<typeof RoomContext>);
    componentDidUpdate(prevProps: ISendMessageComposerProps): void;
    private onKeyDown;
    private selectSendHistory;
    private sendQuickReaction;
    sendMessage(): Promise<void>;
    componentWillUnmount(): void;
    UNSAFE_componentWillMount(): void;
    private get editorStateKey();
    private clearStoredEditorState;
    private restoreStoredEditorState;
    private shouldSaveStoredEditorState;
    private saveStoredEditorState;
    private onAction;
    private onPaste;
    private onChange;
    private focusComposer;
    render(): JSX.Element;
}
declare const SendMessageComposerWithMatrixClient: React.ForwardRefExoticComponent<Omit<ISendMessageComposerProps, "mxClient"> & React.RefAttributes<React.Component<ISendMessageComposerProps, any, any>>>;
export default SendMessageComposerWithMatrixClient;
