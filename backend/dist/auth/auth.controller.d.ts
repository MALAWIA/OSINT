import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    register(registerDto: RegisterDto): Promise<{
        success: boolean;
        message: string;
        data: {
            id: string;
            username: any;
            email: any;
            displayName: any;
            isVerified: boolean;
        };
        token: string;
    }>;
    login(loginDto: LoginDto): Promise<{
        success: boolean;
        message: string;
        data: {
            id: string;
            username: string;
            email: string;
            displayName: string;
            isVerified: boolean;
            isModerator: boolean;
            isAdmin: boolean;
        };
        token: string;
    }>;
    getProfile(user: any): Promise<{
        user: any;
    }>;
    refreshToken(user: any): Promise<{
        access_token: string;
    }>;
    logout(): Promise<{
        message: string;
    }>;
}
