-- Migration 001: Initial Schema Setup
-- This migration creates the base database structure

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Companies table for NSE listed companies
CREATE TABLE IF NOT EXISTS companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticker VARCHAR(10) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    sector VARCHAR(100),
    description TEXT,
    website VARCHAR(255),
    listed_date DATE,
    market_cap BIGINT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- News sources for OSINT collection
CREATE TABLE IF NOT EXISTS news_sources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) UNIQUE NOT NULL,
    url VARCHAR(500),
    rss_url VARCHAR(500),
    source_type VARCHAR(50) CHECK (source_type IN ('rss', 'api', 'scrape')),
    is_active BOOLEAN DEFAULT true,
    last_fetched TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Raw news articles collected from OSINT
CREATE TABLE IF NOT EXISTS news_articles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source_id UUID REFERENCES news_sources(id),
    title VARCHAR(500) NOT NULL,
    url VARCHAR(1000) UNIQUE NOT NULL,
    raw_text TEXT,
    published_at TIMESTAMP,
    fetched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    content_hash VARCHAR(64) UNIQUE,
    is_processed BOOLEAN DEFAULT false
);

-- Company mentions in news articles
CREATE TABLE IF NOT EXISTS company_mentions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    article_id UUID REFERENCES news_articles(id) ON DELETE CASCADE,
    company_id UUID REFERENCES companies(id),
    mention_count INTEGER DEFAULT 1,
    confidence_score DECIMAL(3,2) CHECK (confidence_score BETWEEN 0 AND 1),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(article_id, company_id)
);

-- Sentiment analysis results
CREATE TABLE IF NOT EXISTS sentiment_analysis (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    article_id UUID REFERENCES news_articles(id) ON DELETE CASCADE,
    company_id UUID REFERENCES companies(id),
    sentiment_score DECIMAL(4,3) CHECK (sentiment_score BETWEEN -1 AND 1),
    sentiment_label VARCHAR(20) CHECK (sentiment_label IN ('positive', 'neutral', 'negative')),
    confidence DECIMAL(3,2) CHECK (confidence BETWEEN 0 AND 1),
    analyzed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Event detection results
CREATE TABLE IF NOT EXISTS detected_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    article_id UUID REFERENCES news_articles(id) ON DELETE CASCADE,
    company_id UUID REFERENCES companies(id),
    event_type VARCHAR(50) CHECK (event_type IN ('earnings', 'acquisition', 'regulation', 'leadership', 'financial', 'legal', 'other')),
    event_summary TEXT,
    confidence DECIMAL(3,2) CHECK (confidence BETWEEN 0 AND 1),
    detected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    display_name VARCHAR(100),
    is_verified BOOLEAN DEFAULT false,
    is_moderator BOOLEAN DEFAULT false,
    is_admin BOOLEAN DEFAULT false,
    reputation_score INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_active TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Discussion channels (per stock and general)
CREATE TABLE IF NOT EXISTS discussion_channels (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    channel_type VARCHAR(20) CHECK (channel_type IN ('stock', 'general', 'sector')),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Messages in discussion channels
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    channel_id UUID REFERENCES discussion_channels(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id),
    content TEXT NOT NULL,
    article_id UUID REFERENCES news_articles(id),
    is_edited BOOLEAN DEFAULT false,
    is_deleted BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Message reactions
CREATE TABLE IF NOT EXISTS message_reactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    message_id UUID REFERENCES messages(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id),
    reaction_type VARCHAR(20) CHECK (reaction_type IN ('like', 'dislike', 'agree', 'disagree', 'insightful')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(message_id, user_id)
);

-- Moderation flags and actions
CREATE TABLE IF NOT EXISTS moderation_flags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    target_type VARCHAR(20) CHECK (target_type IN ('message', 'user')),
    target_id UUID NOT NULL,
    flagger_id UUID REFERENCES users(id),
    reason VARCHAR(100),
    description TEXT,
    status VARCHAR(20) CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')) DEFAULT 'pending',
    moderator_id UUID REFERENCES users(id),
    action_taken VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP
);

-- Notifications and alerts
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    notification_type VARCHAR(50) CHECK (notification_type IN ('news_alert', 'sentiment_shift', 'mention', 'moderation', 'system')),
    title VARCHAR(255),
    message TEXT,
    data JSONB,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User preferences
CREATE TABLE IF NOT EXISTS user_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    preference_key VARCHAR(100),
    preference_value JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, preference_key)
);

-- Audit log for compliance
CREATE TABLE IF NOT EXISTS audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50),
    resource_id UUID,
    details JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_companies_ticker ON companies(ticker);
CREATE INDEX IF NOT EXISTS idx_companies_sector ON companies(sector);
CREATE INDEX IF NOT EXISTS idx_news_articles_published_at ON news_articles(published_at);
CREATE INDEX IF NOT EXISTS idx_news_articles_source_id ON news_articles(source_id);
CREATE INDEX IF NOT EXISTS idx_company_mentions_article_id ON company_mentions(article_id);
CREATE INDEX IF NOT EXISTS idx_company_mentions_company_id ON company_mentions(company_id);
CREATE INDEX IF NOT EXISTS idx_sentiment_analysis_company_id ON sentiment_analysis(company_id);
CREATE INDEX IF NOT EXISTS idx_sentiment_analysis_article_id ON sentiment_analysis(article_id);
CREATE INDEX IF NOT EXISTS idx_detected_events_company_id ON detected_events(company_id);
CREATE INDEX IF NOT EXISTS idx_detected_events_event_type ON detected_events(event_type);
CREATE INDEX IF NOT EXISTS idx_messages_channel_id ON messages(channel_id);
CREATE INDEX IF NOT EXISTS idx_messages_user_id ON messages(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_audit_log_user_id ON audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON audit_log(created_at);

-- Create trigger function for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for tables with updated_at
DROP TRIGGER IF EXISTS update_companies_updated_at ON companies;
CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON companies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_messages_updated_at ON messages;
CREATE TRIGGER update_messages_updated_at BEFORE UPDATE ON messages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_preferences_updated_at ON user_preferences;
CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON user_preferences
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert initial data
INSERT INTO news_sources (name, url, rss_url, source_type) VALUES
('Business Daily Africa', 'https://www.businessdailyafrica.com', 'https://www.businessdailyafrica.com/feed', 'rss'),
('Nation News', 'https://nation.africa', 'https://nation.africa/feed', 'rss'),
('Capital FM Kenya', 'https://www.capitalfm.co.ke', 'https://www.capitalfm.co.ke/feed', 'rss'),
('Nairobi Securities Exchange', 'https://www.nse.co.ke', null, 'api'),
('CMA Kenya', 'https://www.cma.or.ke', null, 'scrape')
ON CONFLICT (name) DO NOTHING;

-- Insert sample NSE companies
INSERT INTO companies (ticker, name, sector, description) VALUES
('SCOM', 'Safaricom PLC', 'Telecommunications', 'Leading telecommunications company in Kenya'),
('EQTY', 'Equity Group Holdings', 'Banking', 'One of Kenya''s largest banking groups'),
('KCB', 'KCB Group', 'Banking', 'Kenya Commercial Bank Group'),
('COOP', 'Co-operative Bank', 'Banking', 'Co-operative Bank of Kenya'),
('BAT', 'British American Tobacco Kenya', 'Manufacturing', 'Tobacco products manufacturer'),
('EABL', 'East African Breweries', 'Beverages', 'Alcoholic beverages manufacturer'),
('NMG', 'Nation Media Group', 'Media', 'Leading media company in East Africa'),
('JUB', 'Jubilee Holdings', 'Insurance', 'Insurance services provider')
ON CONFLICT (ticker) DO NOTHING;

-- Create default discussion channels
INSERT INTO discussion_channels (name, channel_type, description) VALUES
('general-market', 'general', 'General NSE market discussions'),
('breaking-news', 'general', 'Breaking news and market updates'),
('regulation-updates', 'general', 'Regulatory announcements and compliance')
ON CONFLICT (name) DO NOTHING;

-- Create stock-specific channels for major companies
INSERT INTO discussion_channels (name, channel_type, company_id, description)
SELECT '$' || ticker, 'stock', id, 'Discussion for ' || name || ' (' || ticker || ')'
FROM companies
WHERE ticker IN ('SCOM', 'EQTY', 'KCB', 'COOP', 'EABL')
ON CONFLICT (name) DO NOTHING;
