import { NextApiRequest, NextApiResponse } from 'next';

// Mock Sentry for development
const captureException = (error: Error, context?: any) => {
  if (process.env.NODE_ENV === 'development') {
    console.error('Sentry captureException:', error, context);
    return;
  }
  console.error('Error captured:', error, context);
};

interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  displayName?: string;
}

interface RegisterResponse {
  success: boolean;
  message: string;
  data?: {
    id: string;
    username: string;
    email: string;
    displayName?: string;
    isVerified: boolean;
  };
  token?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<RegisterResponse>
) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed',
    });
  }

  try {
    const { username, email, password, displayName }: RegisterRequest = req.body;

    // Validate required fields
    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username, email, and password are required',
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format',
      });
    }

    // Validate username
    if (username.length < 3 || username.length > 20) {
      return res.status(400).json({
        success: false,
        message: 'Username must be between 3 and 20 characters',
      });
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      return res.status(400).json({
        success: false,
        message: 'Username can only contain letters, numbers, and underscores',
      });
    }

    // Validate password
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters long',
      });
    }

    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/.test(password)) {
      return res.status(400).json({
        success: false,
        message: 'Password must contain uppercase, lowercase, number, and special character',
      });
    }

    // Forward request to backend API
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    
    const response = await fetch(`${backendUrl}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username,
        email,
        password,
        displayName: displayName || undefined,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      return res.status(201).json(data);
    } else {
      // Handle different error status codes
      const statusCode = response.status;
      
      if (statusCode === 409) {
        return res.status(409).json({
          success: false,
          message: 'User already exists',
        });
      } else if (statusCode === 400) {
        return res.status(400).json({
          success: false,
          message: data.message || 'Bad request',
        });
      } else {
        return res.status(statusCode).json({
          success: false,
          message: data.message || 'Registration failed',
        });
      }
    }
  } catch (error) {
    // Log error to Sentry
    captureException(error instanceof Error ? error : new Error('Registration API error'), {
      action: 'register_api',
      body: req.body,
    });

    console.error('Registration error:', error);
    
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
}
