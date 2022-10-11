import React from 'react';
import { IBodyProps } from "./IBodyProps";
import RoomContext from "../../../contexts/RoomContext";
export declare let DOWNLOAD_ICON_URL: any;
/**
 * Get the current CSS style for a DOMElement.
 * @param {HTMLElement} element The element to get the current style of.
 * @return {string} The CSS style encoded as a string.
 */
export declare function computedStyle(element: HTMLElement): string;
interface IProps extends IBodyProps {
    showGenericPlaceholder: boolean;
}
interface IState {
    decryptedBlob?: Blob;
}
export default class MFileBody extends React.Component<IProps, IState> {
    static contextType: React.Context<import("../../structures/RoomView").IRoomState>;
    context: React.ContextType<typeof RoomContext>;
    static defaultProps: {
        showGenericPlaceholder: boolean;
    };
    private iframe;
    private dummyLink;
    private userDidClick;
    private fileDownloader;
    constructor(props: IProps);
    private getContentUrl;
    private get content();
    private get fileName();
    private get linkText();
    private downloadFile;
    componentDidUpdate(prevProps: any, prevState: any): void;
    private decryptFile;
    private onPlaceholderClick;
    render(): JSX.Element;
}
export {};
