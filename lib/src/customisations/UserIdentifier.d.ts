/**
 * Customise display of the user identifier
 * hide userId for guests, display 3pid
 *
 * Set withDisplayName to true when user identifier will be displayed alongside user name
 */
declare function getDisplayUserIdentifier(userId: string, { roomId, withDisplayName }: {
    roomId?: string;
    withDisplayName?: boolean;
}): string | null;
export interface IUserIdentifierCustomisations {
    getDisplayUserIdentifier?: typeof getDisplayUserIdentifier;
}
declare const _default: IUserIdentifierCustomisations;
export default _default;
