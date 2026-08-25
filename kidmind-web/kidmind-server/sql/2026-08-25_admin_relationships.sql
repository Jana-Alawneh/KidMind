CREATE TABLE IF NOT EXISTS user_settings (
  user_id INT UNSIGNED NOT NULL,
  email_notifications TINYINT(1) NOT NULL DEFAULT 1,
  account_notifications TINYINT(1) NOT NULL DEFAULT 1,
  session_notifications TINYINT(1) NOT NULL DEFAULT 1,
  progress_notifications TINYINT(1) NOT NULL DEFAULT 1,
  appearance ENUM('system', 'light', 'dark') NOT NULL DEFAULT 'system',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id),
  CONSTRAINT fk_user_settings_user
    FOREIGN KEY (user_id)
    REFERENCES users(id)
    ON DELETE CASCADE
) ENGINE=InnoDB;

INSERT INTO user_settings (user_id)
SELECT id
FROM users
ON DUPLICATE KEY UPDATE
  user_id = VALUES(user_id);