export default function useFavouriteMessages(): {
    isFavourite: (eventId: string) => boolean;
    toggleFavourite: (eventId: string) => void;
};
