CREATE TABLE IF NOT EXISTS `users` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `username` VARCHAR(50) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `role` ENUM('mahasiswa', 'dosen', 'konselor', 'admin') NOT NULL DEFAULT 'mahasiswa',
  `dosen_id` INT(11) NULL DEFAULT NULL COMMENT 'Refers to id of user with role dosen if assigned directly',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_users_dosen` (`dosen_id`),
  CONSTRAINT `fk_users_dosen` FOREIGN KEY (`dosen_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `mahasiswa_dosen` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `mahasiswa_id` INT(11) NOT NULL,
  `dosen_id` INT(11) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_student_lecturer` (`mahasiswa_id`, `dosen_id`),
  CONSTRAINT `fk_map_mahasiswa` FOREIGN KEY (`mahasiswa_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_map_dosen` FOREIGN KEY (`dosen_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Insert default admin (password is 'admin123' using BCRYPT)
-- password_hash('admin123', PASSWORD_BCRYPT)
INSERT IGNORE INTO `users` (`username`, `password`, `role`) VALUES 
('admin', '$2y$10$w/k4m.Wd3P4u9rW5L5J1AOmSTh8G9X5s22rM0X8jZq3mIe1k2qX', 'admin');
