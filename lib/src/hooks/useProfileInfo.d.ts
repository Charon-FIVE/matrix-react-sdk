export interface IProfileInfoOpts {
    query?: string;
}
export interface IProfileInfo {
    user_id: string;
    avatar_url?: string;
    display_name?: string;
}
export declare const useProfileInfo: () => {
    readonly ready: true;
    readonly loading: boolean;
    readonly profile: IProfileInfo;
    readonly search: ({ query: term }: IProfileInfoOpts) => Promise<boolean>;
};
