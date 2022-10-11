import React from "react";
import { Room } from "matrix-js-sdk/src/models/room";
import { IDialogProps } from "./IDialogProps";
import { SpacePreferenceTab } from "../../../dispatcher/payloads/OpenSpacePreferencesPayload";
interface IProps extends IDialogProps {
    space: Room;
    initialTabId?: SpacePreferenceTab;
}
declare const SpacePreferencesDialog: React.FC<IProps>;
export default SpacePreferencesDialog;
