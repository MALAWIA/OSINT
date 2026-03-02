import { JwtService } from '@nestjs/jwt';
import { UserRole } from '../common/enums/user-role.enum';
export declare class AuthService {
    private jwtService;
    constructor(jwtService: JwtService);
    register(userData: any): Promise<{
        message: string;
        user: {
            id: string;
            username: any;
            email: any;
            displayName: any;
            role: any;
            isVerified: boolean;
            isModerator: boolean;
            isAdmin: boolean;
            reputationScore: number;
            createdAt: string;
            lastActive: string;
        };
        token: string;
    }>;
    login(email: string, password: string): Promise<{
        token: string;
        user: {
            id: string;
            username: string;
            email: string;
            displayName: string;
            role: UserRole;
            isVerified: boolean;
            isModerator: boolean;
            isAdmin: boolean;
            reputationScore: number;
            createdAt: string;
            lastActive: string;
        };
    }>;
    generateToken(user: any): string;
    findByEmail(email: string): Promise<any>;
    findByUsername(username: string): Promise<any>;
}
