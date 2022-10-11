export default function useFocus(): [boolean, {
    onFocus: () => void;
    onBlur: () => void;
}];
