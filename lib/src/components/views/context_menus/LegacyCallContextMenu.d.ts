import React from 'react';
import PropTypes from 'prop-types';
import { MatrixCall } from 'matrix-js-sdk/src/webrtc/call';
import { IProps as IContextMenuProps } from '../../structures/ContextMenu';
interface IProps extends IContextMenuProps {
    call: MatrixCall;
}
export default class LegacyCallContextMenu extends React.Component<IProps> {
    static propTypes: {
        user: PropTypes.Requireable<object>;
    };
    constructor(props: any);
    onHoldClick: () => void;
    onUnholdClick: () => void;
    onTransferClick: () => void;
    render(): JSX.Element;
}
export {};
