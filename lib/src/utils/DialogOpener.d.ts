/**
 * Auxiliary class to listen for dialog opening over the dispatcher and
 * open the required dialogs. Not all dialogs run through here, but the
 * ones which cause import cycles are good candidates.
 */
export declare class DialogOpener {
    static readonly instance: DialogOpener;
    private isRegistered;
    private constructor();
    prepare(): void;
    private onDispatch;
}
