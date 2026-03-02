-- Seed 001: Initial Data
-- Populates database with initial data for production

-- Insert additional news sources
INSERT INTO news_sources (name, url, rss_url, source_type) VALUES
('Standard Media Kenya', 'https://www.standardmedia.co.ke', 'https://www.standardmedia.co.ke/feed', 'rss'),
('The Star Kenya', 'https://www.the-star.co.ke', 'https://www.the-star.co.ke/feed', 'rss'),
('Kenya News Agency', 'https://www.kna.co.ke', null, 'api'),
('Reuters Africa', 'https://www.reuters.com/world/africa', 'https://www.reuters.com/rssFeed/worldNews', 'rss'),
('Bloomberg Kenya', 'https://www.bloomberg.com/markets/africa', null, 'api')
ON CONFLICT (name) DO NOTHING;

-- Insert additional NSE companies
INSERT INTO companies (ticker, name, sector, description, website, listed_date) VALUES
('KQ', 'Kenya Airways', 'Transportation', 'National flag carrier airline', 'https://www.kenya-airways.com', '1996-01-01'),
('BAMB', 'Bamburi Cement', 'Manufacturing', 'Cement and construction materials', 'https://www.bamburi.com', '1975-01-01'),
('ARM', 'ARM Cement', 'Manufacturing', 'Cement and construction materials', 'https://www.armcement.co.ke', '2007-01-01'),
('LONMOT', 'Lonrho Motors', 'Automotive', 'Motor vehicle distribution and assembly', 'https://www.lonhrho.com', '1975-01-01'),
('TPS', 'TPS Eastern Africa', 'Manufacturing', 'Packaging and printing solutions', 'https://www.tpseastafrica.com', '1969-01-01'),
('UAP', 'UAP Old Mutual', 'Insurance', 'Insurance and financial services', 'https://www.uapoldmutual.com', '2005-01-01'),
('BRK', 'Britam', 'Insurance', 'Insurance and asset management', 'https://www.britam.com', '2005-01-01'),
('CFC', 'CFC Stanbic', 'Banking', 'Commercial banking services', 'https://www.cfcstanbicbank.co.ke', '1958-01-01'),
('DTB', 'Diamond Trust Bank', 'Banking', 'Commercial banking services', 'https://www.dtbkenya.com', '1946-01-01'),
('NIC', 'NIC Group', 'Banking', 'Commercial banking services', 'https://www.nicgroup.co.ke', '1965-01-01')
ON CONFLICT (ticker) DO NOTHING;

-- Insert sector-specific discussion channels
INSERT INTO discussion_channels (name, channel_type, description) VALUES
('banking-sector', 'sector', 'Banking sector discussions and analysis'),
('telecom-sector', 'sector', 'Telecommunications sector discussions'),
('manufacturing-sector', 'sector', 'Manufacturing sector discussions'),
('insurance-sector', 'sector', 'Insurance sector discussions'),
('transport-sector', 'sector', 'Transportation and logistics sector'),
('energy-sector', 'sector', 'Energy and utilities sector'),
('agriculture-sector', 'sector', 'Agriculture sector discussions'),
('technology-sector', 'sector', 'Technology sector discussions'),
('real-estate-sector', 'sector', 'Real estate and construction sector'),
('retail-sector', 'sector', 'Retail and consumer goods sector')
ON CONFLICT (name) DO NOTHING;

-- Create stock-specific channels for all companies
INSERT INTO discussion_channels (name, channel_type, company_id, description)
SELECT '$' || ticker, 'stock', id, 'Discussion for ' || name || ' (' || ticker || ')'
FROM companies
WHERE ticker NOT IN ('SCOM', 'EQTY', 'KCB', 'COOP', 'EABL')
ON CONFLICT (name) DO NOTHING;

-- Insert default admin user (password: admin123 - change in production!)
INSERT INTO users (username, email, password_hash, display_name, is_verified, is_moderator, is_admin) VALUES
('admin', 'admin@nse-intelligence.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx/L/jyG', 'System Administrator', true, true, true)
ON CONFLICT (username) DO NOTHING;

-- Insert default user preferences for admin
INSERT INTO user_preferences (user_id, preference_key, preference_value) VALUES
((SELECT id FROM users WHERE username = 'admin'), 'email_notifications', 'true'),
((SELECT id FROM users WHERE username = 'admin'), 'push_notifications', 'true'),
((SELECT id FROM users WHERE username = 'admin'), 'theme', 'light'),
((SELECT id FROM users WHERE username = 'admin'), 'language', 'en'),
((SELECT id FROM users WHERE username = 'admin'), 'timezone', 'Africa/Nairobi')
ON CONFLICT (user_id, preference_key) DO NOTHING;

-- Insert compliance and moderation settings
INSERT INTO user_preferences (user_id, preference_key, preference_value) VALUES
((SELECT id FROM users WHERE username = 'admin'), 'compliance_mode', 'strict'),
((SELECT id FROM users WHERE username = 'admin'), 'content_filter', 'enabled'),
((SELECT id FROM users WHERE username = 'admin'), 'auto_moderation', 'true')
ON CONFLICT (user_id, preference_key) DO NOTHING;

-- Create initial audit log entry
INSERT INTO audit_log (user_id, action, resource_type, details) VALUES
((SELECT id FROM users WHERE username = 'admin'), 'SYSTEM_INITIALIZE', 'system', '{"message": "NSE Intelligence Platform initialized with production data"}')
ON CONFLICT DO NOTHING;
