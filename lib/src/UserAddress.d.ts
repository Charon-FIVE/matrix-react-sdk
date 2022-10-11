export declare enum AddressType {
    Email = "email",
    MatrixUserId = "mx-user-id",
    MatrixRoomId = "mx-room-id"
}
export declare function getAddressType(inputText: string): AddressType | null;
