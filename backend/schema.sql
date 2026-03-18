CREATE DATABASE IF NOT EXISTS azim_dashboard
CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE azim_dashboard;

CREATE TABLE IF NOT EXISTS users (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    firstname VARCHAR(100),
    lastname VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_email (email)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS bot_snapshots (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    bot_name VARCHAR(120) NOT NULL,
    bot_status VARCHAR(30) NOT NULL DEFAULT 'offline',
    uptime_seconds INT UNSIGNED NOT NULL DEFAULT 0,
    latency_ms INT UNSIGNED NOT NULL DEFAULT 0,
    guild_count INT UNSIGNED NOT NULL DEFAULT 0,
    member_count INT UNSIGNED NOT NULL DEFAULT 0,
    command_count_24h INT UNSIGNED NOT NULL DEFAULT 0,
    active_users_24h INT UNSIGNED NOT NULL DEFAULT 0,
    source VARCHAR(20) NOT NULL DEFAULT 'api',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_snapshots_created_at (created_at),
    INDEX idx_snapshots_status (bot_status)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS bot_guilds (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    snapshot_id BIGINT UNSIGNED NOT NULL,
    guild_id VARCHAR(64) NOT NULL,
    guild_name VARCHAR(120) NOT NULL,
    member_count INT UNSIGNED NOT NULL DEFAULT 0,
    icon_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_guilds_snapshot (snapshot_id),
    INDEX idx_guilds_id (guild_id),
    CONSTRAINT fk_bot_guilds_snapshot
        FOREIGN KEY (snapshot_id) REFERENCES bot_snapshots(id)
        ON DELETE CASCADE
) ENGINE=InnoDB;

-- Pour executer le script : mysql -u root -p < backend/schema.sql