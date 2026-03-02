"""
Health Check Module for OSINT Processor
Provides health status and metrics for the OSINT processing service
"""

import os
import sys
import time
import psutil
import asyncio
from datetime import datetime, timedelta
from typing import Dict, Any, Optional
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import aiohttp
import redis
import psycopg2
from elasticsearch import Elasticsearch


class HealthStatus(BaseModel):
    status: str
    timestamp: str
    uptime: float
    version: str
    environment: str
    checks: Dict[str, Any]


class ComponentHealth(BaseModel):
    status: str
    message: Optional[str] = None
    details: Optional[Dict[str, Any]] = None


class HealthChecker:
    """Health checking service for OSINT processor"""
    
    def __init__(self):
        self.start_time = time.time()
        self.app_version = os.getenv('APP_VERSION', '1.0.0')
        self.environment = os.getenv('NODE_ENV', 'development')
        
        # Initialize connections
        self.redis_client = None
        self.db_connection = None
        self.es_client = None
        
    async def initialize_connections(self):
        """Initialize database and service connections"""
        try:
            # Redis connection
            redis_url = os.getenv('REDIS_URL', 'redis://localhost:6379')
            self.redis_client = redis.from_url(redis_url, decode_responses=True)
            
            # Database connection
            db_url = os.getenv('DATABASE_URL')
            if db_url:
                self.db_connection = psycopg2.connect(db_url)
            
            # Elasticsearch connection
            es_url = os.getenv('ELASTICSEARCH_URL', 'http://localhost:9200')
            self.es_client = Elasticsearch(es_url)
            
        except Exception as e:
            print(f"Failed to initialize connections: {e}")
    
    async def check_database(self) -> ComponentHealth:
        """Check database connectivity"""
        try:
            if not self.db_connection:
                await self.initialize_connections()
            
            cursor = self.db_connection.cursor()
            cursor.execute("SELECT 1")
            cursor.close()
            
            return ComponentHealth(
                status="healthy",
                message="Database connection successful",
                details={"type": "postgresql"}
            )
        except Exception as e:
            return ComponentHealth(
                status="unhealthy",
                message=f"Database connection failed: {str(e)}"
            )
    
    async def check_redis(self) -> ComponentHealth:
        """Check Redis connectivity"""
        try:
            if not self.redis_client:
                await self.initialize_connections()
            
            pong = self.redis_client.ping()
            if pong:
                info = self.redis_client.info()
                return ComponentHealth(
                    status="healthy",
                    message="Redis connection successful",
                    details={
                        "type": "redis",
                        "connected_clients": info.get('connected_clients', 0),
                        "used_memory": info.get('used_memory_human', 'unknown'),
                        "uptime": info.get('uptime_in_seconds', 0)
                    }
                )
            else:
                return ComponentHealth(
                    status="unhealthy",
                    message="Redis ping failed"
                )
        except Exception as e:
            return ComponentHealth(
                status="unhealthy",
                message=f"Redis connection failed: {str(e)}"
            )
    
    async def check_elasticsearch(self) -> ComponentHealth:
        """Check Elasticsearch connectivity"""
        try:
            if not self.es_client:
                await self.initialize_connections()
            
            health = self.es_client.cluster.health()
            
            status_colors = {"green": "healthy", "yellow": "degraded", "red": "unhealthy"}
            health_status = status_colors.get(health.get('status', 'unknown'), 'unknown')
            
            return ComponentHealth(
                status=health_status,
                message=f"Elasticsearch status: {health.get('status')}",
                details={
                    "type": "elasticsearch",
                    "cluster_name": health.get('cluster_name'),
                    "number_of_nodes": health.get('number_of_nodes'),
                    "active_shards": health.get('active_shards'),
                    "active_primary_shards": health.get('active_primary_shards')
                }
            )
        except Exception as e:
            return ComponentHealth(
                status="unhealthy",
                message=f"Elasticsearch connection failed: {str(e)}"
            )
    
    async def check_system_resources(self) -> ComponentHealth:
        """Check system resource usage"""
        try:
            cpu_percent = psutil.cpu_percent(interval=1)
            memory = psutil.virtual_memory()
            disk = psutil.disk_usage('/')
            
            # Determine health based on thresholds
            cpu_status = "healthy" if cpu_percent < 80 else "degraded" if cpu_percent < 95 else "unhealthy"
            memory_status = "healthy" if memory.percent < 80 else "degraded" if memory.percent < 95 else "unhealthy"
            disk_status = "healthy" if disk.percent < 80 else "degraded" if disk.percent < 95 else "unhealthy"
            
            # Overall status is the worst of the three
            status_priority = {"healthy": 0, "degraded": 1, "unhealthy": 2}
            overall_status = max([cpu_status, memory_status, disk_status], 
                               key=lambda x: status_priority[x])
            
            return ComponentHealth(
                status=overall_status,
                message="System resource check",
                details={
                    "cpu_percent": cpu_percent,
                    "memory_percent": memory.percent,
                    "memory_available": memory.available,
                    "disk_percent": disk.percent,
                    "disk_free": disk.free,
                    "load_average": os.getloadavg() if hasattr(os, 'getloadavg') else None
                }
            )
        except Exception as e:
            return ComponentHealth(
                status="unhealthy",
                message=f"System resource check failed: {str(e)}"
            )
    
    async def check_processing_queue(self) -> ComponentHealth:
        """Check processing queue status"""
        try:
            if not self.redis_client:
                await self.initialize_connections()
            
            # Check queue lengths
            queue_lengths = {}
            queue_types = ['news_queue', 'processing_queue', 'failed_queue']
            
            for queue in queue_types:
                queue_lengths[queue] = self.redis_client.llen(queue)
            
            total_queued = sum(queue_lengths.values())
            
            # Determine health based on queue size
            status = "healthy"
            if total_queued > 1000:
                status = "degraded"
            if total_queued > 5000:
                status = "unhealthy"
            
            return ComponentHealth(
                status=status,
                message=f"Processing queue status: {total_queued} items queued",
                details={
                    "total_queued": total_queued,
                    "queue_lengths": queue_lengths,
                    "processing_rate": self.get_processing_rate()
                }
            )
        except Exception as e:
            return ComponentHealth(
                status="unhealthy",
                message=f"Processing queue check failed: {str(e)}"
            )
    
    def get_processing_rate(self) -> Dict[str, float]:
        """Get processing rate metrics"""
        # This would typically come from your metrics storage
        # For now, return placeholder values
        return {
            "articles_per_minute": 10.5,
            "success_rate": 0.95,
            "error_rate": 0.05
        }
    
    async def get_health_status(self) -> HealthStatus:
        """Get overall health status"""
        uptime = time.time() - self.start_time
        
        # Run all health checks
        checks = {
            "database": await self.check_database(),
            "redis": await self.check_redis(),
            "elasticsearch": await self.check_elasticsearch(),
            "system": await self.check_system_resources(),
            "processing_queue": await self.check_processing_queue()
        }
        
        # Determine overall status
        status_priority = {"healthy": 0, "degraded": 1, "unhealthy": 2}
        overall_status = max([check.status for check in checks.values()], 
                           key=lambda x: status_priority[x])
        
        return HealthStatus(
            status=overall_status,
            timestamp=datetime.utcnow().isoformat(),
            uptime=uptime,
            version=self.app_version,
            environment=self.environment,
            checks={name: check.dict() for name, check in checks.items()}
        )


# Initialize FastAPI app for health checks
app = FastAPI(title="OSINT Processor Health", version="1.0.0")
health_checker = HealthChecker()


@app.on_event("startup")
async def startup_event():
    """Initialize health checker on startup"""
    await health_checker.initialize_connections()


@app.get("/health")
async def health_check():
    """Basic health check endpoint"""
    try:
        status = await health_checker.get_health_status()
        if status.status == "unhealthy":
            raise HTTPException(status_code=503, detail=status.dict())
        return status.dict()
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Health check failed: {str(e)}")


@app.get("/health/ready")
async def readiness_check():
    """Readiness probe - checks if service is ready to accept traffic"""
    checks = {
        "database": await health_checker.check_database(),
        "redis": await health_checker.check_redis(),
        "elasticsearch": await health_checker.check_elasticsearch()
    }
    
    # Service is ready if all critical components are healthy
    all_healthy = all(check.status == "healthy" for check in checks.values())
    
    if not all_healthy:
        raise HTTPException(status_code=503, detail={
            "status": "not_ready",
            "checks": {name: check.dict() for name, check in checks.items()}
        })
    
    return {
        "status": "ready",
        "timestamp": datetime.utcnow().isoformat(),
        "checks": {name: check.dict() for name, check in checks.items()}
    }


@app.get("/health/live")
async def liveness_check():
    """Liveness probe - checks if service is still alive"""
    try:
        # Basic liveness check - just check if the process is running
        uptime = time.time() - health_checker.start_time
        
        return {
            "status": "alive",
            "timestamp": datetime.utcnow().isoformat(),
            "uptime": uptime
        }
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Liveness check failed: {str(e)}")


@app.get("/metrics")
async def metrics():
    """Basic metrics endpoint"""
    try:
        process = psutil.Process()
        return {
            "timestamp": datetime.utcnow().isoformat(),
            "uptime": time.time() - health_checker.start_time,
            "memory": process.memory_info()._asdict(),
            "cpu": process.cpu_percent(),
            "threads": process.num_threads(),
            "open_files": process.num_fds() if hasattr(process, 'num_fds') else None
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Metrics collection failed: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
