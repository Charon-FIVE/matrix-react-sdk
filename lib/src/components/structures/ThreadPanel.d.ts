import React from 'react';
import ResizeNotifier from '../../utils/ResizeNotifier';
import { RoomPermalinkCreator } from '../../utils/permalinks/Permalinks';
interface IProps {
    roomId: string;
    onClose: () => void;
    resizeNotifier: ResizeNotifier;
    permalinkCreator: RoomPermalinkCreator;
}
export declare enum ThreadFilterType {
    "My" = 0,
    "All" = 1
}
declare type ThreadPanelHeaderOption = {
    label: string;
    description: string;
    key: ThreadFilterType;
};
export declare const ThreadPanelHeaderFilterOptionItem: ({ label, description, onClick, isSelected, }: ThreadPanelHeaderOption & {
    onClick: () => void;
    isSelected: boolean;
}) => JSX.Element;
export declare const ThreadPanelHeader: ({ filterOption, setFilterOption, empty }: {
    filterOption: ThreadFilterType;
    setFilterOption: (filterOption: ThreadFilterType) => void;
    empty: boolean;
}) => JSX.Element;
declare const ThreadPanel: React.FC<IProps>;
export default ThreadPanel;
