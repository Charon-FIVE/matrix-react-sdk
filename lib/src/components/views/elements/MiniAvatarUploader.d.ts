import React, { MouseEvent } from 'react';
import { TranslatedString } from '../../../languageHandler';
export declare const AVATAR_SIZE = 52;
interface IProps {
    hasAvatar: boolean;
    noAvatarLabel?: TranslatedString;
    hasAvatarLabel?: TranslatedString;
    setAvatarUrl(url: string): Promise<unknown>;
    isUserAvatar?: boolean;
    onClick?(ev: MouseEvent<HTMLInputElement>): void;
}
declare const MiniAvatarUploader: React.FC<IProps>;
export default MiniAvatarUploader;
