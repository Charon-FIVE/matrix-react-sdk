import React from 'react';
interface IProps {
    file: File;
    currentIndex: number;
    totalFiles?: number;
    onFinished: (uploadConfirmed: boolean, uploadAll?: boolean) => void;
}
export default class UploadConfirmDialog extends React.Component<IProps> {
    private readonly objectUrl;
    private readonly mimeType;
    static defaultProps: {
        totalFiles: number;
    };
    constructor(props: any);
    componentWillUnmount(): void;
    private onCancelClick;
    private onUploadClick;
    private onUploadAllClick;
    render(): JSX.Element;
}
export {};
