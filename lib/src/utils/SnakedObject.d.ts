export declare function snakeToCamel(s: string): string;
export declare class SnakedObject<T = Record<string, any>> {
    private obj;
    constructor(obj: T);
    get<K extends string & keyof T>(key: K, altCaseName?: string): T[K];
    toJSON(): T;
}
