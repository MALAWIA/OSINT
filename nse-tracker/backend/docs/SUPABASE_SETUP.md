# Supabase Database Setup Guide

This guide explains how to set up the NSE Intelligence Tracker with Supabase as the database backend.

## What is Supabase?

Supabase is an open-source Firebase alternative that provides:
- PostgreSQL database with automatic scaling
- Real-time subscriptions
- Authentication services
- Edge functions
- Storage services

## Prerequisites

- A Supabase account (free tier available)
- Python 3.8+
- Node.js 16+ (for frontend)

## Setup Instructions

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up or log in
3. Click "New Project"
4. Choose your organization
5. Enter project details:
   - **Project Name**: `nse-tracker` (or your preferred name)
   - **Database Password**: Generate a strong password
   - **Region**: Choose the closest region to your users
6. Click "Create new project"
7. Wait for the project to be created (2-3 minutes)

### 2. Get Supabase Credentials

Once your project is ready:

1. Go to **Settings** → **API**
2. Copy the following:
   - **Project URL** (e.g., `https://your-project-id.supabase.co`)
   - **anon public** API key
   - **service_role** key (for admin operations)

3. Go to **Settings** → **Database**
4. Copy the **Connection string** under "Connection parameters"
   - Format: `postgresql://postgres:[YOUR-PASSWORD]@db.your-project-id.supabase.co:5432/postgres`

### 3. Configure Environment Variables

Create or update your `.env` file:

```bash
# Enable Supabase
USE_SUPABASE=true

# Supabase Configuration
SUPABASE_URL="https://your-project-id.supabase.co"
SUPABASE_KEY="your_supabase_anon_key"
SUPABASE_SERVICE_ROLE_KEY="your_supabase_service_role_key"
SUPABASE_DB_URL="postgresql://postgres:[YOUR-PASSWORD]@db.your-project-id.supabase.co:5432/postgres"

# Keep these as fallback
DATABASE_URL="postgresql://username:password@localhost:5432/nse_tracker"
POSTGRES_PASSWORD="your_postgres_password"
POSTGRES_USER="your_postgres_user"
POSTGRES_DB="nse_tracker"

# Other required variables...
JWT_SECRET="your_super_secret_jwt_key_here"
REDIS_URL="redis://localhost:6379/0"
```

### 4. Install Dependencies

```bash
pip install supabase postgrest
```

Or install from requirements.txt:
```bash
pip install -r requirements.txt
```

### 5. Set Up Database Schema

Run the SQL setup script in your Supabase SQL Editor:

1. Go to your Supabase project
2. Click **SQL Editor** → **New query**
3. Copy and paste the contents of `scripts/setup_supabase.sql`
4. Click **Run** to execute the script

This will create:
- `users` table with authentication fields
- `stocks` table for stock data
- `news` table for news articles
- `portfolio` table for user portfolios
- `watchlist` table for user watchlists
- `user_sessions` table for JWT management
- `audit_logs` table for security auditing
- Row Level Security (RLS) policies
- Triggers for automatic timestamps
- Indexes for performance

### 6. Test the Connection

Run the setup script to test your configuration:

```bash
python scripts/setup_supabase.py
```

This script will:
- Check your environment variables
- Test the Supabase connection
- Create database tables
- Show database configuration

### 7. Start the Application

```bash
uvicorn app.main:app --reload
```

### 8. Verify Setup

Visit the health check endpoint:
```
http://localhost:8000/health
```

You should see something like:
```json
{
  "status": "healthy",
  "services": {
    "database": "healthy",
    "redis": "healthy",
    "celery": "healthy",
    "supabase": "healthy"
  },
  "database_info": {
    "use_supabase": true,
    "database_type": "Supabase PostgreSQL",
    "supabase_configured": true,
    "connection_url": "postgresql://***@db.***.supabase.co:5432/postgres"
  }
}
```

## Features Enabled with Supabase

### 1. Real-time Subscriptions
Your application can now receive real-time updates when:
- New users register
- Stock prices change
- News articles are published
- Portfolio updates occur

### 2. Row Level Security (RLS)
- Users can only access their own data
- Automatic authentication integration
- Secure data isolation

### 3. Automatic Scaling
- No need to manage database servers
- Automatic backups
- Point-in-time recovery

### 4. Built-in Authentication
You can optionally use Supabase Auth instead of custom JWT:
- Social logins (Google, GitHub, etc.)
- Magic link authentication
- Phone number authentication

## Migration from PostgreSQL

If you're migrating from an existing PostgreSQL setup:

1. **Export existing data**:
   ```bash
   pg_dump your_database > backup.sql
   ```

2. **Import to Supabase**:
   - Use the Supabase CLI or GUI
   - Or use psql with the Supabase connection string

3. **Update environment variables**:
   - Set `USE_SUPABASE=true`
   - Update Supabase credentials

4. **Test the migration**:
   ```bash
   python scripts/setup_supabase.py
   ```

## Troubleshooting

### Connection Issues

**Error**: `Connection refused`
- Check your Supabase URL and API key
- Verify network connectivity
- Ensure Supabase project is active

**Error**: `Permission denied`
- Check your service role key
- Verify RLS policies
- Ensure user has proper permissions

### Table Creation Issues

**Error**: `Table already exists`
- Run the SQL script with `IF NOT EXISTS` clauses
- Or drop existing tables first

**Error**: `Permission denied for schema public`
- Use the service role key for admin operations
- Check user permissions in Supabase

### Performance Issues

**Slow queries**:
- Check if indexes are created
- Use the Supabase dashboard to monitor performance
- Consider enabling query caching

**Connection limits**:
- Free tier has connection limits
- Use connection pooling
- Monitor active connections

## Production Considerations

### Security
- Use environment variables for all secrets
- Enable RLS on all user tables
- Use service role key only for admin operations
- Monitor audit logs regularly

### Backup
- Enable automatic backups in Supabase
- Test restore procedures
- Keep local backups of critical data

### Monitoring
- Use Supabase dashboard for monitoring
- Set up alerts for database issues
- Monitor API usage and limits

## Support

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Discord Community](https://discord.gg/supabase)
- [NSE Intelligence Tracker Issues](https://github.com/your-repo/issues)

## Next Steps

1. **Set up real-time subscriptions** in your frontend
2. **Configure Supabase Auth** for social logins
3. **Set up edge functions** for serverless operations
4. **Configure storage** for file uploads
5. **Set up monitoring and alerts**

Your NSE Intelligence Tracker is now running on Supabase! 🎉
