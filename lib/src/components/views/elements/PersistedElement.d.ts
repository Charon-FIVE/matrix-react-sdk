import React, { MutableRefObject } from 'react';
export declare const getPersistKey: (appId: string) => string;
interface IProps {
    persistKey: string;
    zIndex?: number;
    style?: React.StyleHTMLAttributes<HTMLDivElement>;
    moveRef?: MutableRefObject<() => void>;
}
/**
 * Class of component that renders its children in a separate ReactDOM virtual tree
 * in a container element appended to document.body.
 *
 * This prevents the children from being unmounted when the parent of PersistedElement
 * unmounts, allowing them to persist.
 *
 * When PE is unmounted, it hides the children using CSS. When mounted or updated, the
 * children are made visible and are positioned into a div that is given the same
 * bounding rect as the parent of PE.
 */
export default class PersistedElement extends React.Component<IProps> {
    private resizeObserver;
    private dispatcherRef;
    private childContainer;
    private child;
    constructor(props: IProps);
    /**
     * Removes the DOM elements created when a PersistedElement with the given
     * persistKey was mounted. The DOM elements will be re-added if another
     * PersistedElement is mounted in the future.
     *
     * @param {string} persistKey Key used to uniquely identify this PersistedElement
     */
    static destroyElement(persistKey: string): void;
    static isMounted(persistKey: any): boolean;
    private collectChildContainer;
    private collectChild;
    componentDidMount(): void;
    componentDidUpdate(): void;
    componentWillUnmount(): void;
    private onAction;
    private repositionChild;
    private updateChild;
    private renderApp;
    private updateChildVisibility;
    private updateChildPosition;
    render(): JSX.Element;
}
export {};
