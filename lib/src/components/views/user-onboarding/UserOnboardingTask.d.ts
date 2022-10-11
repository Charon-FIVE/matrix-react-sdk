/// <reference types="react" />
import { UserOnboardingTask as Task } from "../../../hooks/useUserOnboardingTasks";
interface Props {
    task: Task;
    completed?: boolean;
}
export declare function UserOnboardingTask({ task, completed }: Props): JSX.Element;
export {};
