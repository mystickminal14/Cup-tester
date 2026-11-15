-- Cup Tasters Championship · database update (6 Nov 2026)
-- Run ONCE on the live database (phpMyAdmin → select the database → SQL tab).
-- Brings a database created from cup-tasters-database.sql (4 Nov) up to date.

-- 1. Registration form: T-shirt size, "about yourself", press consent,
--    and the "I've sent the payment screenshot" confirmation.
ALTER TABLE participants
  ADD COLUMN tshirt_size          VARCHAR(20) NULL AFTER heard_from,
  ADD COLUMN bio                  TEXT        NULL AFTER tshirt_size,
  ADD COLUMN press_consent        TINYINT(1)  NOT NULL DEFAULT 0 AFTER bio,
  ADD COLUMN payment_token        CHAR(64)    NULL AFTER press_consent,
  ADD COLUMN payment_confirmed_at DATETIME    NULL AFTER payment_token;

-- 2. "Become a sponsor" enquiries (admin → Sponsor enquiries).
CREATE TABLE IF NOT EXISTS sponsor_inquiries (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(160) NOT NULL,
  contact     VARCHAR(40)  NOT NULL,
  email       VARCHAR(190) NULL,
  company     VARCHAR(160) NULL,
  interest    VARCHAR(60)  NULL,
  status      ENUM('new','contacted') NOT NULL DEFAULT 'new',
  notes       TEXT NULL,
  ip_address  VARCHAR(45) NULL,
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_sponsor_status (status),
  INDEX idx_sponsor_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
