-- Cup Tasters Championship · admin database
-- Works on MySQL 5.7+/8 and MariaDB. Import in phpMyAdmin, or run `php setup.php`.

CREATE TABLE IF NOT EXISTS users (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(120) NOT NULL,
  username      VARCHAR(60)  NULL UNIQUE,
  email         VARCHAR(190) NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role          ENUM('superadmin','admin') NOT NULL DEFAULT 'admin',
  last_login_at DATETIME NULL,
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Every website registration lands here as `interested`. A team member flips
-- it to `registered` by hand once payment is confirmed.
CREATE TABLE IF NOT EXISTS participants (
  id                   INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  full_name            VARCHAR(160) NOT NULL,
  email                VARCHAR(190) NOT NULL,
  phone                VARCHAR(40)  NOT NULL,
  city                 VARCHAR(120) NULL,
  organization         VARCHAR(160) NULL,
  role                 VARCHAR(120) NULL,
  experience           VARCHAR(60)  NULL,
  social               VARCHAR(255) NULL,
  previous_competition TEXT NULL,
  heard_from           VARCHAR(120) NULL,
  tshirt_size          VARCHAR(20)  NULL,
  bio                  TEXT NULL,
  press_consent        TINYINT(1)   NOT NULL DEFAULT 0,
  payment_token        CHAR(64)     NULL,   -- lets the applicant's browser confirm payment once
  payment_confirmed_at DATETIME     NULL,   -- applicant said they sent the payment screenshot
  photo_path           VARCHAR(255) NULL,
  status               ENUM('interested','registered') NOT NULL DEFAULT 'interested',
  notes                TEXT NULL,
  status_changed_by    INT UNSIGNED NULL,
  status_changed_at    DATETIME NULL,
  deleted_at           DATETIME NULL,   -- soft delete: hidden, restorable
  deleted_by           INT UNSIGNED NULL,
  ip_address           VARCHAR(45) NULL,
  created_at           DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at           DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_status (status),
  INDEX idx_created (created_at),
  INDEX idx_deleted (deleted_at),
  CONSTRAINT fk_status_user FOREIGN KEY (status_changed_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- "Become a sponsor" enquiries from the website's sponsors section.
CREATE TABLE IF NOT EXISTS sponsor_inquiries (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(160) NOT NULL,
  contact     VARCHAR(40)  NOT NULL,
  email       VARCHAR(190) NULL,
  company     VARCHAR(160) NULL,
  interest    VARCHAR(60)  NULL,   -- no longer asked, kept for older enquiries
  status      ENUM('new','contacted') NOT NULL DEFAULT 'new',
  notes       TEXT NULL,
  ip_address  VARCHAR(45) NULL,
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_sponsor_status (status),
  INDEX idx_sponsor_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
