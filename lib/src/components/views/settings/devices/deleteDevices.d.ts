import { MatrixClient } from "matrix-js-sdk/src/matrix";
import { InteractiveAuthCallback } from "../../../structures/InteractiveAuth";
export declare const deleteDevicesWithInteractiveAuth: (matrixClient: MatrixClient, deviceIds: string[], onFinished?: InteractiveAuthCallback) => Promise<void>;
