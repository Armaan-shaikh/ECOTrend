-- EcoTrend Database Initialization Script (PostgreSQL + PostGIS + TimescaleDB)

CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS timescaledb;

-- Location Resolution Hierarchy Table
CREATE TABLE IF NOT EXISTS locations (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    level VARCHAR(32) NOT NULL, -- 'COUNTRY', 'STATE', 'CITY', 'STATION'
    parent_id VARCHAR(64) REFERENCES locations(id) ON DELETE CASCADE,
    country_code VARCHAR(8),
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    geom GEOMETRY(Point, 4326),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_locations_geom ON locations USING GIST (geom);
CREATE INDEX IF NOT EXISTS idx_locations_parent ON locations (parent_id);
CREATE INDEX IF NOT EXISTS idx_locations_level ON locations (level);

-- TimescaleDB Hypertable for Environmental Measurements
CREATE TABLE IF NOT EXISTS environmental_measurements (
    id UUID NOT NULL,
    location_id VARCHAR(64) NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
    domain VARCHAR(32) NOT NULL,    -- 'air'
    metric VARCHAR(32) NOT NULL,    -- 'PM2.5', 'PM10', 'NO2', 'SO2', 'CO', 'O3', 'AQI'
    value DOUBLE PRECISION NOT NULL,
    unit VARCHAR(32) NOT NULL,      -- 'µg/m³', 'ppm', 'ppb'
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    source VARCHAR(64) NOT NULL,    -- e.g. 'OpenAQ', 'OpenMeteo', 'StationSensor'
    data_quality VARCHAR(32) NOT NULL DEFAULT 'VALID', -- 'VALID', 'SUSPECT', 'INVALID'
    raw_value DOUBLE PRECISION,     -- Pre-normalization value
    PRIMARY KEY (id, timestamp)
);

-- Convert to TimescaleDB Hypertable
SELECT create_hypertable('environmental_measurements', 'timestamp', if_not_exists => TRUE);

-- Create spatial & time-series indices
CREATE INDEX IF NOT EXISTS idx_measurements_loc_metric_time 
    ON environmental_measurements (location_id, metric, timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_measurements_quality 
    ON environmental_measurements (data_quality);

-- Audit log table for data quality & cleaning events
CREATE TABLE IF NOT EXISTS data_quality_logs (
    id UUID PRIMARY KEY,
    location_id VARCHAR(64) REFERENCES locations(id),
    metric VARCHAR(32) NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    rule_triggered VARCHAR(128) NOT NULL,
    original_value DOUBLE PRECISION,
    action_taken VARCHAR(64) NOT NULL, -- 'FLAGGED_INVALID', 'FLAGGED_SUSPECT', 'IMPUTED'
    details TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
