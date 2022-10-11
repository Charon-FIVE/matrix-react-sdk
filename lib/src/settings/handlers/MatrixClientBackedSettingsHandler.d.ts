import { MatrixClient } from "matrix-js-sdk/src/client";
import SettingsHandler from "./SettingsHandler";
/**
 * Represents the base class for settings handlers which need access to a MatrixClient.
 * This class performs no logic and should be overridden.
 */
export default abstract class MatrixClientBackedSettingsHandler extends SettingsHandler {
    private static _matrixClient;
    private static instances;
    static set matrixClient(client: MatrixClient);
    protected constructor();
    get client(): MatrixClient;
    protected abstract initMatrixClient(oldClient: MatrixClient, newClient: MatrixClient): any;
}
