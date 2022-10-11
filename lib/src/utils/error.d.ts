export declare class GenericError extends Error {
    readonly message: string;
    readonly description?: string | undefined;
    constructor(message: string, description?: string | undefined);
}
