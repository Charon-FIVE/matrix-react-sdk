declare type StringifyReplacer = (this: any, key: string, value: any) => any;
export declare const getCircularReplacer: () => StringifyReplacer;
export {};
