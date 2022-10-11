export declare const useLocalEcho: <T>(currentFactory: () => T, setterFn: (value: T) => Promise<unknown>, errorFn: (error: Error) => void) => [value: T, handler: (value: T) => void];
