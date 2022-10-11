import React from "react";
import { IProps as IContextMenuProps } from "../../structures/ContextMenu";
interface IProps extends IContextMenuProps {
    deviceKinds: MediaDeviceKind[];
}
declare const DeviceContextMenu: React.FC<IProps>;
export default DeviceContextMenu;
