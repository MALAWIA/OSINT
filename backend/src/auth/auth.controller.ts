import { Controller, Post, Body, Get, UseGuards, Request, HttpCode, HttpStatus, ValidationPipe, BadRequestException, ConflictException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
  ) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User successfully registered' })
  @ApiResponse({ status: 400, description: 'Bad request - validation failed' })
  @ApiResponse({ status: 409, description: 'User already exists' })
  async register(@Body(ValidationPipe) registerDto: RegisterDto) {
    try {
      // Validate input data
      if (!registerDto.email || !registerDto.password || !registerDto.username) {
        throw new BadRequestException('Email, username, and password are required');
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(registerDto.email)) {
        throw new BadRequestException('Invalid email format');
      }

      // Validate password strength
      if (registerDto.password.length < 8) {
        throw new BadRequestException('Password must be at least 8 characters long');
      }

      // Check if user already exists
      // For now, we'll skip the existence check since we don't have a database
      // In production, you would implement:
      // const existingUser = await this.authService.findByEmail(registerDto.email);
      // const existingUsername = await this.authService.findByUsername(registerDto.username);

      const result = await this.authService.register(registerDto);
      
      // Track successful registration
      console.log('User registration successful', {
        email: registerDto.email,
        username: registerDto.username,
        userId: result.user.id 
      });

      return {
        success: true,
        message: 'User registered successfully. Please check your email to verify your account.',
        data: {
          id: result.user.id,
          username: result.user.username,
          email: result.user.email,
          displayName: result.user.displayName,
          isVerified: result.user.isVerified,
        },
        token: result.token,
      };
    } catch (error) {
      // Track registration error
      console.error('Registration error', {
        action: 'register',
        email: registerDto.email,
        username: registerDto.username,
        error: error.message
      });

      throw error;
    }
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'User login' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body(ValidationPipe) loginDto: LoginDto) {
    try {
      // Validate input
      if (!loginDto.email || !loginDto.password) {
        throw new BadRequestException('Email and password are required');
      }

      const result = await this.authService.login(loginDto.email, loginDto.password);

      // Track successful login
      console.log('User login successful', {
        email: loginDto.email,
        userId: result.user.id 
      });

      return {
        success: true,
        message: 'Login successful',
        data: {
          id: result.user.id,
          username: result.user.username,
          email: result.user.email,
          displayName: result.user.displayName,
          isVerified: result.user.isVerified,
          isModerator: result.user.isModerator,
          isAdmin: result.user.isAdmin,
        },
        token: result.token,
      };
    } catch (error) {
      // Track login error
      console.error('Login error', {
        action: 'login',
        email: loginDto.email,
        error: error.message
      });

      throw error;
    }
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async getProfile(@CurrentUser() user: any) {
    return { user };
  }

  @Post('refresh')
  @UseGuards(JwtAuthGuard)
  async refreshToken(@CurrentUser() user: any) {
    const token = this.authService.generateToken(user);
    return { access_token: token };
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async logout() {
    return { message: 'Logged out successfully' };
  }
}
