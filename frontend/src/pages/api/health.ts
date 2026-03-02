import { NextApiRequest, NextApiResponse } from 'next';

interface HealthResponse {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  uptime: number;
  version: string;
  environment: string;
  checks: {
    frontend: {
      status: string;
      buildTime: string;
      buildId: string;
    };
    api: {
      status: string;
      responseTime?: number;
      error?: string;
    };
  };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<HealthResponse>
) {
  try {
    const startTime = Date.now();
    const uptime = process.uptime();
    const timestamp = new Date().toISOString();
    
    // Check API connectivity
    let apiStatus: HealthResponse['checks']['api'] = {
      status: 'unknown'
    };
    
    try {
      const apiResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/health`, {
        method: 'GET',
        timeout: 5000,
      });
      
      if (apiResponse.ok) {
        apiStatus.status = 'healthy';
        apiStatus.responseTime = Date.now() - startTime;
      } else {
        apiStatus.status = 'unhealthy';
        apiStatus.error = `API returned status ${apiResponse.status}`;
      }
    } catch (error) {
      apiStatus.status = 'unhealthy';
      apiStatus.error = error instanceof Error ? error.message : 'Unknown error';
    }
    
    // Frontend build information
    const frontendStatus = {
      status: 'healthy',
      buildTime: process.env.BUILD_TIME || new Date().toISOString(),
      buildId: process.env.BUILD_ID || 'dev',
    };
    
    // Determine overall status
    const overallStatus = apiStatus.status === 'healthy' ? 'healthy' : 'unhealthy';
    
    const healthResponse: HealthResponse = {
      status: overallStatus,
      timestamp,
      uptime,
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      checks: {
        frontend: frontendStatus,
        api: apiStatus,
      },
    };
    
    const statusCode = overallStatus === 'healthy' ? 200 : 503;
    res.status(statusCode).json(healthResponse);
    
  } catch (error) {
    const errorResponse: HealthResponse = {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      checks: {
        frontend: {
          status: 'unhealthy',
          buildTime: '',
          buildId: '',
        },
        api: {
          status: 'unhealthy',
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      },
    };
    
    res.status(503).json(errorResponse);
  }
}
