import Resizer, { IConfig } from "./resizer";
import Sizer from "./sizer";
export default class ResizeItem<C extends IConfig = IConfig> {
    readonly resizer: Resizer<C>;
    readonly sizer: Sizer;
    readonly container?: HTMLElement;
    readonly domNode: HTMLElement;
    protected readonly id: string;
    protected reverse: boolean;
    constructor(handle: HTMLElement, resizer: Resizer<C>, sizer: Sizer, container?: HTMLElement);
    private copyWith;
    private advance;
    next(): ResizeItem<IConfig>;
    previous(): ResizeItem<IConfig>;
    size(): number;
    offset(): number;
    start(): void;
    finish(): void;
    getSize(): string;
    setRawSize(size: string): void;
    setSize(size: number): void;
    clearSize(): void;
    first(): ResizeItem<IConfig>;
    last(): ResizeItem<IConfig>;
}
