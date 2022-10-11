import React from "react";
interface IProps {
    parent: HTMLElement;
    onFileDrop(dataTransfer: DataTransfer): void;
}
declare const FileDropTarget: React.FC<IProps>;
export default FileDropTarget;
