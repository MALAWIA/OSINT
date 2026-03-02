"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const user_role_enum_1 = require("../common/enums/user-role.enum");
let AuthService = class AuthService {
    constructor(jwtService) {
        this.jwtService = jwtService;
    }
    async register(userData) {
        const role = userData.role || user_role_enum_1.UserRole.VIEWER;
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
                isAdmin: role === user_role_enum_1.UserRole.ADMIN,
                reputationScore: 0,
                createdAt: new Date().toISOString(),
                lastActive: new Date().toISOString(),
            },
            token: this.jwtService.sign(payload),
        };
    }
    async login(email, password) {
        const payload = { email, sub: '1', role: user_role_enum_1.UserRole.VIEWER };
        return {
            token: this.jwtService.sign(payload),
            user: {
                id: '1',
                username: 'testuser',
                email: email,
                displayName: 'Test User',
                role: user_role_enum_1.UserRole.VIEWER,
                isVerified: true,
                isModerator: false,
                isAdmin: false,
                reputationScore: 100,
                createdAt: new Date().toISOString(),
                lastActive: new Date().toISOString(),
            },
        };
    }
    generateToken(user) {
        const payload = { email: user.email, sub: user.id, role: user.role || user_role_enum_1.UserRole.VIEWER };
        return this.jwtService.sign(payload);
    }
    async findByEmail(email) {
        return null;
    }
    async findByUsername(username) {
        return null;
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map