import { DirectoryMember } from "../utils/direct-messages";
export interface IUserDirectoryOpts {
    limit: number;
    query?: string;
}
export declare const useUserDirectory: () => {
    readonly ready: true;
    readonly loading: boolean;
    readonly users: DirectoryMember[];
    readonly search: ({ limit, query: term, }: IUserDirectoryOpts) => Promise<boolean>;
};
