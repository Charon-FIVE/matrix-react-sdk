import React, { SyntheticEvent } from 'react';
import { RoomMember } from 'matrix-js-sdk/src/models/room-member';
import MatrixClientContext from '../../../contexts/MatrixClientContext';
import { GenericPosition } from '../../../utils/beacon';
import { LocationShareError } from '../../../utils/location';
import { LocationShareType, ShareLocationFn } from './shareLocation';
export interface ILocationPickerProps {
    sender: RoomMember;
    shareType: LocationShareType;
    onChoose: ShareLocationFn;
    onFinished(ev?: SyntheticEvent): void;
}
interface IState {
    timeout: number;
    position?: GenericPosition;
    error?: LocationShareError;
}
declare class LocationPicker extends React.Component<ILocationPickerProps, IState> {
    static contextType: React.Context<import("matrix-js-sdk/src/client").MatrixClient>;
    context: React.ContextType<typeof MatrixClientContext>;
    private map?;
    private geolocate?;
    private marker?;
    constructor(props: ILocationPickerProps);
    private getMarkerId;
    componentDidMount(): void;
    componentWillUnmount(): void;
    private addMarkerToMap;
    private updateStyleUrl;
    private onGeolocate;
    private onClick;
    private onGeolocateError;
    private onTimeoutChange;
    private onOk;
    render(): JSX.Element;
}
export default LocationPicker;
