import React, { KeyboardEvent } from 'react';
import { Room } from 'matrix-js-sdk/src/models/room';
import Autocompleter, { ICompletion, ISelectionRange, IProviderCompletions } from '../../../autocomplete/Autocompleter';
export declare const generateCompletionDomId: (number: any) => string;
interface IProps {
    query: string;
    onConfirm: (completion: ICompletion) => void;
    onSelectionChange?: (partIndex: number) => void;
    selection: ISelectionRange;
    room: Room;
}
interface IState {
    completions: IProviderCompletions[];
    completionList: ICompletion[];
    selectionOffset: number;
    shouldShowCompletions: boolean;
    hide: boolean;
    forceComplete: boolean;
}
export default class Autocomplete extends React.PureComponent<IProps, IState> {
    autocompleter: Autocompleter;
    queryRequested: string;
    debounceCompletionsRequest: number;
    private containerRef;
    static contextType: React.Context<import("../../structures/RoomView").IRoomState>;
    constructor(props: any);
    componentDidMount(): void;
    private applyNewProps;
    componentWillUnmount(): void;
    private complete;
    private processQuery;
    private processCompletions;
    hasSelection(): boolean;
    countCompletions(): number;
    moveSelection(delta: number): void;
    onEscape(e: KeyboardEvent): boolean;
    private hide;
    forceComplete(): Promise<number>;
    onConfirmCompletion: () => void;
    private onCompletionClicked;
    private setSelection;
    componentDidUpdate(prevProps: IProps): void;
    render(): JSX.Element;
}
export {};
