import React from 'react';
import { LocationShareType } from './shareLocation';
interface Props {
    setShareType: (shareType: LocationShareType) => void;
    enabledShareTypes: LocationShareType[];
}
declare const ShareType: React.FC<Props>;
export default ShareType;
