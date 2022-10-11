/**
 * Utility function to smoothly animate to a certain target value
 * @param initialValue Initial value to be used as initial starting point
 * @param targetValue Desired value to animate to (can be changed repeatedly to whatever is current at that time)
 * @param duration Duration that each animation should take, specify 0 to skip animating
 */
export declare function useSmoothAnimation(initialValue: number, targetValue: number, duration: number): number;
