import { Room } from 'matrix-js-sdk/src/models/room';
export default class VoipUserMapper {
    private virtualToNativeRoomIdCache;
    static sharedInstance(): VoipUserMapper;
    private userToVirtualUser;
    private getVirtualUserForRoom;
    getOrCreateVirtualRoomForRoom(roomId: string): Promise<string | null>;
    /**
     * Gets the ID of the virtual room for a room, or null if the room has no
     * virtual room
     */
    getVirtualRoomForRoom(roomId: string): Promise<Room | null>;
    nativeRoomForVirtualRoom(roomId: string): string;
    isVirtualRoom(room: Room): boolean;
    onNewInvitedRoom(invitedRoom: Room): Promise<void>;
}
