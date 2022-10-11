import { IClientWellKnown } from 'matrix-js-sdk/src/client';
import { UnstableValue } from 'matrix-js-sdk/src/NamespacedValue';
export declare const TILE_SERVER_WK_KEY: UnstableValue<"m.tile_server", "org.matrix.msc3488.tile_server">;
export interface ICallBehaviourWellKnown {
    widget_build_url?: string;
}
export interface IE2EEWellKnown {
    default?: boolean;
    secure_backup_required?: boolean;
    secure_backup_setup_methods?: SecureBackupSetupMethod[];
}
export interface ITileServerWellKnown {
    map_style_url?: string;
}
export interface IEmbeddedPagesWellKnown {
    home_url?: string;
}
export declare function getCallBehaviourWellKnown(): ICallBehaviourWellKnown;
export declare function getE2EEWellKnown(): IE2EEWellKnown;
export declare function getTileServerWellKnown(): ITileServerWellKnown | undefined;
export declare function tileServerFromWellKnown(clientWellKnown?: IClientWellKnown | undefined): ITileServerWellKnown;
export declare function getEmbeddedPagesWellKnown(): IEmbeddedPagesWellKnown | undefined;
export declare function embeddedPagesFromWellKnown(clientWellKnown?: IClientWellKnown): IEmbeddedPagesWellKnown;
export declare function isSecureBackupRequired(): boolean;
export declare enum SecureBackupSetupMethod {
    Key = "key",
    Passphrase = "passphrase"
}
export declare function getSecureBackupSetupMethods(): SecureBackupSetupMethod[];
