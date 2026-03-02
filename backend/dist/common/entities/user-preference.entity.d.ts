import { User } from './user.entity';
export declare class UserPreference {
    id: string;
    userId: string;
    preferenceKey: string;
    preferenceValue: any;
    createdAt: Date;
    user: User;
}
