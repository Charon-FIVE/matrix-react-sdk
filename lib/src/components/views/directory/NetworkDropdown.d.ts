/// <reference types="react" />
import { Protocols } from "../../../utils/DirectoryUtils";
export interface IPublicRoomDirectoryConfig {
    roomServer: string;
    instanceId?: string;
}
interface IProps {
    protocols: Protocols | null;
    config: IPublicRoomDirectoryConfig | null;
    setConfig: (value: IPublicRoomDirectoryConfig | null) => void;
}
export declare const NetworkDropdown: ({ protocols, config, setConfig }: IProps) => JSX.Element;
export {};
