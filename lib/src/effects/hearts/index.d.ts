import ICanvasEffect from '../ICanvasEffect';
export declare type HeartOptions = {
    /**
     * The maximum number of hearts to render at a given time
     */
    maxCount: number;
    /**
     * The amount of gravity to apply to the hearts
     */
    gravity: number;
    /**
     * The maximum amount of drift (horizontal sway) to apply to the hearts. Each heart varies.
     */
    maxDrift: number;
    /**
     * The maximum amount of tilt to apply to the heart. Each heart varies.
     */
    maxRot: number;
};
export declare const DefaultOptions: HeartOptions;
export default class Hearts implements ICanvasEffect {
    private readonly options;
    constructor(options: {
        [key: string]: any;
    });
    private context;
    private particles;
    private lastAnimationTime;
    private colours;
    isRunning: boolean;
    start: (canvas: HTMLCanvasElement, timeout?: number) => Promise<void>;
    stop: () => Promise<void>;
    private resetParticle;
    private renderLoop;
    private animateAndRenderHearts;
}
