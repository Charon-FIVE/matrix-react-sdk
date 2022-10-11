import React from 'react';
interface Props {
    onCancel: () => void;
    onBack: () => void;
    displayBack?: boolean;
}
declare const ShareDialogButtons: React.FC<Props>;
export default ShareDialogButtons;
