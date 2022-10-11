import React from 'react';
interface IChildrenOptions {
    onStartMoving: (event: React.MouseEvent<Element, MouseEvent>) => void;
    onResize: (event: Event) => void;
}
interface IProps {
    className?: string;
    children: ({ onStartMoving, onResize }: IChildrenOptions) => React.ReactNode;
    draggable: boolean;
    onDoubleClick?: () => void;
    onMove?: () => void;
}
/**
 * PictureInPictureDragger shows a small version of CallView hovering over the UI in 'picture-in-picture'
 * (PiP mode). It displays the call(s) which is *not* in the room the user is currently viewing.
 */
export default class PictureInPictureDragger extends React.Component<IProps> {
    private callViewWrapper;
    private initX;
    private initY;
    private desiredTranslationX;
    private desiredTranslationY;
    private translationX;
    private translationY;
    private moving;
    private scheduledUpdate;
    componentDidMount(): void;
    componentWillUnmount(): void;
    private animationCallback;
    private setStyle;
    private setTranslation;
    private onResize;
    private snap;
    private onStartMoving;
    private onMoving;
    private onEndMoving;
    render(): JSX.Element;
}
export {};
