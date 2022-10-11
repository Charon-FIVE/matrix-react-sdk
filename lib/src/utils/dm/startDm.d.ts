import { MatrixClient } from "matrix-js-sdk/src/matrix";
import { Member } from "../direct-messages";
/**
 * Start a DM.
 *
 * @returns {Promise<string | null} Resolves to the room id.
 */
export declare function startDm(client: MatrixClient, targets: Member[], showSpinner?: boolean): Promise<string | null>;
