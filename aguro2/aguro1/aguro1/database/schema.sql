-- AgroGuide Relational Database Schema (MySQL Compatible)
-- Character Set: utf8mb4, Collation: utf8mb4_unicode_ci

CREATE DATABASE IF NOT EXISTS agroguide CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE agroguide;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    phone VARCHAR(20) NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'Farmer', -- Farmer, Agricultural Professional, Admin
    preferred_language VARCHAR(10) DEFAULT 'en', -- en, ml, hi
    state VARCHAR(100) DEFAULT 'Kerala',
    district VARCHAR(100) DEFAULT 'Palakkad',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_email (email),
    INDEX idx_user_role (role)
) ENGINE=InnoDB;

-- 2. Farms Table
CREATE TABLE IF NOT EXISTS farms (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    farm_name VARCHAR(100) DEFAULT 'My Primary Farm',
    farm_size FLOAT DEFAULT 2.5,
    soil_type VARCHAR(100) DEFAULT 'Alluvial',
    soil_ph FLOAT DEFAULT 6.5,
    irrigation_type VARCHAR(100) DEFAULT 'Canal / River',
    location VARCHAR(150) DEFAULT 'Palakkad, Kerala',
    current_season VARCHAR(50) DEFAULT 'Kharif',
    current_crops VARCHAR(255) DEFAULT 'Rice, Banana',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_farm_user (user_id)
) ENGINE=InnoDB;

-- 3. Crops Table (100+ Crops)
CREATE TABLE IF NOT EXISTS crops (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    local_name VARCHAR(150) NULL,
    scientific_name VARCHAR(150) NULL,
    category VARCHAR(100) NOT NULL, -- Cereals, Pulses, Vegetables, Fruits, Spices, Oilseeds, Plantation Crops, Commercial Crops
    suitable_soil VARCHAR(200) NOT NULL,
    ph_min FLOAT DEFAULT 5.5,
    ph_max FLOAT DEFAULT 7.5,
    suitable_season VARCHAR(100) NOT NULL,
    temperature_min FLOAT DEFAULT 20.0,
    temperature_max FLOAT DEFAULT 35.0,
    water_requirement VARCHAR(50) DEFAULT 'Medium',
    rainfall_min FLOAT DEFAULT 500.0,
    rainfall_max FLOAT DEFAULT 2500.0,
    duration VARCHAR(100) DEFAULT '90 - 120 days',
    irrigation_requirement VARCHAR(150) DEFAULT 'Moderate irrigation at critical growth stages',
    sowing_info TEXT NULL,
    harvest_info TEXT NULL,
    cultivation_info TEXT NOT NULL,
    image_url VARCHAR(255) NULL,
    market_unit VARCHAR(50) DEFAULT '₹/Quintal',
    expected_yield VARCHAR(100) DEFAULT '20-30 Quintals/Acre',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_crop_name (name),
    INDEX idx_crop_category (category)
) ENGINE=InnoDB;

-- 4. Crop Pests Table
CREATE TABLE IF NOT EXISTS crop_pests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    crop_id INT NULL,
    crop_name VARCHAR(100) NULL,
    name VARCHAR(150) NOT NULL,
    symptoms TEXT NOT NULL,
    possible_causes TEXT NULL,
    prevention TEXT NOT NULL,
    management TEXT NOT NULL,
    professional_guidance TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (crop_id) REFERENCES crops(id) ON DELETE CASCADE,
    INDEX idx_pest_name (name)
) ENGINE=InnoDB;

-- 5. Crop Diseases Table
CREATE TABLE IF NOT EXISTS crop_diseases (
    id INT AUTO_INCREMENT PRIMARY KEY,
    crop_id INT NULL,
    crop_name VARCHAR(100) NULL,
    name VARCHAR(150) NOT NULL,
    symptoms TEXT NOT NULL,
    possible_causes TEXT NULL,
    prevention TEXT NOT NULL,
    management TEXT NOT NULL,
    professional_guidance TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (crop_id) REFERENCES crops(id) ON DELETE CASCADE,
    INDEX idx_disease_name (name)
) ENGINE=InnoDB;

-- 6. Market Prices Table
CREATE TABLE IF NOT EXISTS market_prices (
    id INT AUTO_INCREMENT PRIMARY KEY,
    crop_id INT NULL,
    crop_name VARCHAR(100) NOT NULL,
    market_name VARCHAR(150) NOT NULL,
    location VARCHAR(150) NOT NULL,
    price FLOAT NOT NULL,
    min_price FLOAT NULL,
    max_price FLOAT NULL,
    unit VARCHAR(50) DEFAULT '₹/Quintal',
    trend VARCHAR(20) DEFAULT 'up', -- up, down, stable
    trend_percentage FLOAT DEFAULT 1.5,
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    source VARCHAR(100) DEFAULT 'AGMARKNET / Kerala AgriMarket Feed',
    is_demo BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (crop_id) REFERENCES crops(id) ON DELETE SET NULL,
    INDEX idx_market_crop (crop_name),
    INDEX idx_market_location (location)
) ENGINE=InnoDB;

-- 7. Weather Cache Table
CREATE TABLE IF NOT EXISTS weather_cache (
    id INT AUTO_INCREMENT PRIMARY KEY,
    location VARCHAR(150) NOT NULL,
    temperature FLOAT NOT NULL,
    feels_like FLOAT NULL,
    temp_min FLOAT NULL,
    temp_max FLOAT NULL,
    humidity FLOAT NOT NULL,
    rainfall_probability FLOAT DEFAULT 10.0,
    wind_speed FLOAT DEFAULT 8.0,
    condition_text VARCHAR(100) DEFAULT 'Sunny / Clear',
    icon VARCHAR(50) DEFAULT '01d',
    forecast_data TEXT NULL,
    advisory_alert VARCHAR(255) NULL,
    is_demo BOOLEAN DEFAULT TRUE,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_weather_loc (location)
) ENGINE=InnoDB;

-- 8. Recommendations Table
CREATE TABLE IF NOT EXISTS recommendations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NULL,
    crop_id INT NOT NULL,
    score FLOAT NOT NULL,
    suitability_level VARCHAR(50) DEFAULT 'Highly Suitable',
    reason TEXT NOT NULL,
    breakdown TEXT NULL,
    soil_suitability VARCHAR(100) DEFAULT 'High Match',
    season_suitability VARCHAR(100) DEFAULT 'Optimal',
    water_suitability VARCHAR(100) DEFAULT 'Adequate',
    state VARCHAR(100) NULL,
    district VARCHAR(100) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (crop_id) REFERENCES crops(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 9. Community Posts Table
CREATE TABLE IF NOT EXISTS community_posts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    category VARCHAR(50) DEFAULT 'General Farming',
    likes_count INT DEFAULT 0,
    comments_count INT DEFAULT 0,
    is_pinned BOOLEAN DEFAULT FALSE,
    is_moderated BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_post_cat (category)
) ENGINE=InnoDB;

-- 10. Post Likes Table
CREATE TABLE IF NOT EXISTS post_likes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    post_id INT NOT NULL,
    user_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_user_post_like (post_id, user_id),
    FOREIGN KEY (post_id) REFERENCES community_posts(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 11. Comments Table
CREATE TABLE IF NOT EXISTS comments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    post_id INT NOT NULL,
    user_id INT NOT NULL,
    content TEXT NOT NULL,
    is_moderated BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES community_posts(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 12. Professionals Table
CREATE TABLE IF NOT EXISTS professionals (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NULL,
    name VARCHAR(100) NOT NULL,
    designation VARCHAR(150) DEFAULT 'Agronomist / Agricultural Officer',
    expertise VARCHAR(200) NOT NULL,
    institution VARCHAR(200) DEFAULT 'Kerala Agricultural University / Krishi Bhavan',
    location VARCHAR(150) NOT NULL,
    languages VARCHAR(150) DEFAULT 'English, Malayalam, Hindi',
    experience_years INT DEFAULT 8,
    bio TEXT NOT NULL,
    availability VARCHAR(100) DEFAULT 'Mon - Fri (9:00 AM - 5:00 PM)',
    contact_email VARCHAR(150) NULL,
    contact_phone VARCHAR(50) NULL,
    is_verified BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- 13. Support Requests Table
CREATE TABLE IF NOT EXISTS support_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    farmer_id INT NOT NULL,
    professional_id INT NOT NULL,
    subject VARCHAR(200) DEFAULT 'Agricultural Consultation Request',
    crop_name VARCHAR(100) NULL,
    message TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'Pending',
    response TEXT NULL,
    responded_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (farmer_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (professional_id) REFERENCES professionals(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 14. Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'System',
    link VARCHAR(255) NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_notif_user (user_id, is_read)
) ENGINE=InnoDB;
