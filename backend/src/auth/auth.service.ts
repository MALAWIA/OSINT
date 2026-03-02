import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserRole } from '../common/enums/user-role.enum';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  async register(userData: any) {
    // Mock implementation - return success
    const role = userData.role || UserRole.VIEWER;
    const payload = { email: userData.email, sub: '1', role };
    return {
      message: 'User registered successfully',
      user: {
        id: '1',
        username: userData.username,
        email: userData.email,
        displayName: userData.displayName,
        role,
        isVerified: false,
        isModerator: false,
        isAdmin: role === UserRole.ADMIN,
        reputationScore: 0,
        createdAt: new Date().toISOString(),
        lastActive: new Date().toISOString(),
      },
      token: this.jwtService.sign(payload),
    };
  }

  async login(email: string, password: string) {
    // Mock implementation - return success
    const payload = { email, sub: '1', role: UserRole.VIEWER };
    return {
      token: this.jwtService.sign(payload),
      user: {
        id: '1',
        username: 'testuser',
        email: email,
        displayName: 'Test User',
        role: UserRole.VIEWER,
        isVerified: true,
        isModerator: false,
        isAdmin: false,
        reputationScore: 100,
        createdAt: new Date().toISOString(),
        lastActive: new Date().toISOString(),
      },
    };
  }

  generateToken(user: any) {
    const payload = { email: user.email, sub: user.id, role: user.role || UserRole.VIEWER };
    return this.jwtService.sign(payload);
  }

  async findByEmail(email: string) {
    // Mock implementation - return null (user doesn't exist)
    return null;
  }

  async findByUsername(username: string) {
    // Mock implementation - return null (username doesn't exist)
    return null;
  }
}
