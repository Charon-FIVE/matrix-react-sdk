/**
 * If the platform enabled needsUrlTooltips, recurses depth-first through a DOM tree, adding tooltip previews
 * for link elements. Otherwise, does nothing.
 *
 * @param {Element[]} rootNodes - a list of sibling DOM nodes to traverse to try
 *   to add tooltips.
 * @param {Element[]} ignoredNodes: a list of nodes to not recurse into.
 * @param {Element[]} containers: an accumulator of the DOM nodes which contain
 *   React components that have been mounted by this function. The initial caller
 *   should pass in an empty array to seed the accumulator.
 */
export declare function tooltipifyLinks(rootNodes: ArrayLike<Element>, ignoredNodes: Element[], containers: Element[]): void;
/**
 * Unmount tooltip containers created by tooltipifyLinks.
 *
 * It's critical to call this after tooltipifyLinks, otherwise
 * tooltips will leak.
 *
 * @param {Element[]} containers - array of tooltip containers to unmount
 */
export declare function unmountTooltips(containers: Element[]): void;
