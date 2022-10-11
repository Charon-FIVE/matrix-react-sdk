import React, { ComponentProps } from 'react';
import { MatrixEvent } from "matrix-js-sdk/src/models/event";
import GenericEventListSummary from "./GenericEventListSummary";
import { Layout } from '../../../settings/enums/Layout';
import RoomContext from "../../../contexts/RoomContext";
interface IProps extends Omit<ComponentProps<typeof GenericEventListSummary>, "summaryText" | "summaryMembers"> {
    summaryLength?: number;
    avatarsMaxLength?: number;
    layout: Layout;
}
interface IUserEvents {
    mxEvent: MatrixEvent;
    displayName: string;
    index: number;
}
export default class EventListSummary extends React.Component<IProps> {
    static contextType: React.Context<import("../../structures/RoomView").IRoomState>;
    context: React.ContextType<typeof RoomContext>;
    static defaultProps: {
        summaryLength: number;
        threshold: number;
        avatarsMaxLength: number;
        layout: Layout;
    };
    shouldComponentUpdate(nextProps: IProps): boolean;
    /**
     * Generate the text for users aggregated by their transition sequences (`eventAggregates`) where
     * the sequences are ordered by `orderedTransitionSequences`.
     * @param {object} eventAggregates a map of transition sequence to array of user display names
     * or user IDs.
     * @param {string[]} orderedTransitionSequences an array which is some ordering of
     * `Object.keys(eventAggregates)`.
     * @returns {string} the textual summary of the aggregated events that occurred.
     */
    private generateSummary;
    /**
     * @param {string[]} users an array of user display names or user IDs.
     * @returns {string} a comma-separated list that ends with "and [n] others" if there are
     * more items in `users` than `this.props.summaryLength`, which is the number of names
     * included before "and [n] others".
     */
    private renderNameList;
    /**
     * Canonicalise an array of transitions such that some pairs of transitions become
     * single transitions. For example an input ['joined','left'] would result in an output
     * ['joined_and_left'].
     * @param {string[]} transitions an array of transitions.
     * @returns {string[]} an array of transitions.
     */
    private static getCanonicalTransitions;
    /**
     * Transform an array of transitions into an array of transitions and how many times
     * they are repeated consecutively.
     *
     * An array of 123 "joined_and_left" transitions, would result in:
     * ```
     * [{
     *   transitionType: "joined_and_left"
     *   repeats: 123
     * }]
     * ```
     * @param {string[]} transitions the array of transitions to transform.
     * @returns {object[]} an array of coalesced transitions.
     */
    private static coalesceRepeatedTransitions;
    /**
     * For a certain transition, t, describe what happened to the users that
     * underwent the transition.
     * @param {string} t the transition type.
     * @param {number} userCount number of usernames
     * @param {number} repeats the number of times the transition was repeated in a row.
     * @returns {string} the written Human Readable equivalent of the transition.
     */
    private static getDescriptionForTransition;
    private static getTransitionSequence;
    /**
     * Label a given membership event, `e`, where `getContent().membership` has
     * changed for each transition allowed by the Matrix protocol. This attempts to
     * label the membership changes that occur in `../../../TextForEvent.js`.
     * @param {MatrixEvent} e the membership change event to label.
     * @returns {string?} the transition type given to this event. This defaults to `null`
     * if a transition is not recognised.
     */
    private static getTransition;
    getAggregate(userEvents: Record<string, IUserEvents[]>): {
        names: Record<string, string[]>;
        indices: Record<string, number>;
    };
    render(): JSX.Element;
}
export {};
