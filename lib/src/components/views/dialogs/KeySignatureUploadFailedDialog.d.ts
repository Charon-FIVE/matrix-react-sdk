import React from 'react';
import { IDialogProps } from "./IDialogProps";
interface IProps extends IDialogProps {
    failures: Record<string, Record<string, {
        errcode: string;
        error: string;
    }>>;
    source: string;
    continuation: () => Promise<void>;
}
declare const KeySignatureUploadFailedDialog: React.FC<IProps>;
export default KeySignatureUploadFailedDialog;
