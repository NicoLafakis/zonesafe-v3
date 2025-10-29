-- ZoneSafe Database Schema
-- MySQL 8.0+

CREATE DATABASE IF NOT EXISTS zonesafe CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE zonesafe;

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  google_id VARCHAR(255) UNIQUE,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  profile_picture VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  last_login TIMESTAMP NULL,
  INDEX idx_email (email),
  INDEX idx_google_id (google_id)
) ENGINE=InnoDB;

-- Plans table
CREATE TABLE IF NOT EXISTS plans (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  title VARCHAR(255) NOT NULL,
  work_type ENUM('roadway_pavement', 'shoulder', 'intersection', 'bridge', 'roadside_utility', 'mobile') NOT NULL,
  status ENUM('draft', 'active', 'completed', 'archived') DEFAULT 'draft',

  -- Location data
  road_name VARCHAR(255),
  start_address VARCHAR(500),
  end_address VARCHAR(500),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  speed_limit INT,
  lane_count INT,
  selected_lanes JSON,
  work_zone_length_feet INT,

  -- Timing data
  duration_value INT,
  duration_unit ENUM('hours', 'days', 'weeks'),
  time_of_day ENUM('daytime', 'nighttime', '24hour'),
  days_of_week ENUM('weekdays', 'weekends', 'all'),
  start_date DATE,
  end_date DATE,

  -- Work zone details
  worker_count INT,
  has_flagger BOOLEAN DEFAULT FALSE,
  flagger_count INT,

  -- Equipment (stored as JSON array)
  equipment JSON,

  -- MUTCD Calculations (stored as JSON)
  mutcd_calculations JSON,

  -- Metadata
  confidence_score INT DEFAULT 100,
  data_sources JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_status (status),
  INDEX idx_work_type (work_type),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB;

-- Location cache table (for API data caching)
CREATE TABLE IF NOT EXISTS location_cache (
  id INT AUTO_INCREMENT PRIMARY KEY,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  api_source ENUM('google_roads', 'here_maps', 'openstreetmap', 'openweather') NOT NULL,
  response_data JSON NOT NULL,
  confidence INT DEFAULT 100,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NULL,

  INDEX idx_location (latitude, longitude),
  INDEX idx_api_source (api_source),
  INDEX idx_expires_at (expires_at)
) ENGINE=InnoDB;

-- Activity log table (comprehensive tracking)
CREATE TABLE IF NOT EXISTS activity_log (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  plan_id INT,
  action_type ENUM('create', 'view', 'edit', 'delete', 'export', 'email', 'login', 'api_call') NOT NULL,
  action_details JSON,
  ip_address VARCHAR(45),
  user_agent VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (plan_id) REFERENCES plans(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_plan_id (plan_id),
  INDEX idx_action_type (action_type),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB;

-- Sessions table (for JWT token management)
CREATE TABLE IF NOT EXISTS sessions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  token VARCHAR(500) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_token (token(255)),
  INDEX idx_expires_at (expires_at)
) ENGINE=InnoDB;

-- API usage tracking (for rate limiting and analytics)
CREATE TABLE IF NOT EXISTS api_usage (
  id INT AUTO_INCREMENT PRIMARY KEY,
  api_name ENUM('openai', 'anthropic', 'here_maps', 'google_roads', 'openweather') NOT NULL,
  endpoint VARCHAR(255),
  request_count INT DEFAULT 1,
  total_cost DECIMAL(10, 4) DEFAULT 0.00,
  created_date DATE NOT NULL,

  UNIQUE KEY unique_api_date (api_name, endpoint, created_date),
  INDEX idx_api_name (api_name),
  INDEX idx_created_date (created_date)
) ENGINE=InnoDB;

-- Email queue (for async email sending)
CREATE TABLE IF NOT EXISTS email_queue (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  plan_id INT,
  recipient_email VARCHAR(255) NOT NULL,
  subject VARCHAR(500) NOT NULL,
  body TEXT,
  attachment_path VARCHAR(500),
  status ENUM('pending', 'sent', 'failed') DEFAULT 'pending',
  error_message TEXT,
  attempts INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  sent_at TIMESTAMP NULL,

  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (plan_id) REFERENCES plans(id) ON DELETE CASCADE,
  INDEX idx_status (status),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB;
