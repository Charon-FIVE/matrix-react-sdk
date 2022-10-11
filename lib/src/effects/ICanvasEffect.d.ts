/**
 * Defines the interface of a canvas based room effect
 */
export default interface ICanvasEffect {
    /**
     * @param {HTMLCanvasElement} canvas The canvas instance as the render target of the animation
     * @param {number} timeout? A timeout that defines the runtime of the animation (defaults to false)
     */
    start: (canvas: HTMLCanvasElement, timeout?: number) => Promise<void>;
    /**
     * Stops the current animation
     */
    stop: () => Promise<void>;
    /**
     * Returns a value that defines if the animation is currently running
     */
    isRunning: boolean;
}
