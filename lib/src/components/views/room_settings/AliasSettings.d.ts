import React, { ContextType } from "react";
import { MatrixEvent } from "matrix-js-sdk/src/models/event";
import MatrixClientContext from "../../../contexts/MatrixClientContext";
interface IProps {
    roomId: string;
    canSetCanonicalAlias: boolean;
    canSetAliases: boolean;
    canonicalAliasEvent?: MatrixEvent;
    hidePublishSetting?: boolean;
}
interface IState {
    altAliases: string[];
    localAliases: string[];
    canonicalAlias?: string;
    updatingCanonicalAlias: boolean;
    localAliasesLoading: boolean;
    detailsOpen: boolean;
    newAlias?: string;
    newAltAlias?: string;
}
export default class AliasSettings extends React.Component<IProps, IState> {
    static contextType: React.Context<import("matrix-js-sdk/src").MatrixClient>;
    context: ContextType<typeof MatrixClientContext>;
    static defaultProps: {
        canSetAliases: boolean;
        canSetCanonicalAlias: boolean;
    };
    constructor(props: any, context: ContextType<typeof MatrixClientContext>);
    componentDidMount(): void;
    private loadLocalAliases;
    private changeCanonicalAlias;
    private changeAltAliases;
    private onNewAliasChanged;
    private onLocalAliasAdded;
    private onLocalAliasDeleted;
    private onLocalAliasesToggled;
    private onCanonicalAliasChange;
    private onNewAltAliasChanged;
    private onAltAliasAdded;
    private onAltAliasDeleted;
    private getAliases;
    private getLocalNonAltAliases;
    render(): JSX.Element;
}
export {};
