import { IEventRelation } from "matrix-js-sdk/src/models/event";
import React from 'react';
import { AboveLeftOf } from '../../structures/ContextMenu';
interface IProps {
    addEmoji: (emoji: string) => boolean;
    haveRecording: boolean;
    isMenuOpen: boolean;
    isStickerPickerOpen: boolean;
    menuPosition: AboveLeftOf;
    onRecordStartEndClick: () => void;
    relation?: IEventRelation;
    setStickerPickerOpen: (isStickerPickerOpen: boolean) => void;
    showLocationButton: boolean;
    showPollsButton: boolean;
    showStickersButton: boolean;
    toggleButtonMenu: () => void;
}
declare type OverflowMenuCloser = () => void;
export declare const OverflowMenuContext: React.Context<OverflowMenuCloser>;
declare const MessageComposerButtons: React.FC<IProps>;
declare type UploadButtonFn = () => void;
export declare const UploadButtonContext: React.Context<UploadButtonFn>;
export default MessageComposerButtons;
