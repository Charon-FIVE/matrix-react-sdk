import React from 'react';
import { BeaconLocationState } from 'matrix-js-sdk/src/content-helpers';
interface Props {
    latestLocationState?: BeaconLocationState;
}
declare const ShareLatestLocation: React.FC<Props>;
export default ShareLatestLocation;
