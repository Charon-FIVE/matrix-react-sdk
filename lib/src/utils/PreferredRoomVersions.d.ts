/**
 * The preferred room versions for various features within the app. The
 * room versions here are selected based on the client's support for the
 * possible room versions in combination with server support in the
 * ecosystem.
 *
 * Loosely follows https://spec.matrix.org/latest/rooms/#feature-matrix
 */
export declare class PreferredRoomVersions {
    /**
     * The room version to use when creating "restricted" rooms.
     */
    static readonly RestrictedRooms = "9";
    private constructor();
}
/**
 * Determines if a room version supports the given feature using heuristics
 * for how Matrix works.
 * @param roomVer The room version to check support within.
 * @param featureVer The room version of the feature. Should be from PreferredRoomVersions.
 * @see PreferredRoomVersions
 */
export declare function doesRoomVersionSupport(roomVer: string, featureVer: string): boolean;
