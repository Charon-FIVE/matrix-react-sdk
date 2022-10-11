/// <reference types="react" />
import { UserOnboardingTask as Task } from "../../../hooks/useUserOnboardingTasks";
interface Props {
    completedTasks: Task[];
    waitingTasks: Task[];
}
export declare function UserOnboardingList({ completedTasks, waitingTasks }: Props): JSX.Element;
export {};
