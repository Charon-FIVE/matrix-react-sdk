/**
 * Hook to prevent a slower response to an earlier query overwriting the result to a faster response of a later query
 * @param onResultChanged
 */
export declare const useLatestResult: <T, R>(onResultChanged: (result: R) => void) => [(query: T) => void, (query: T, result: R) => void];
