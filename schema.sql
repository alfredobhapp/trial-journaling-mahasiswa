-- Table: users
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `username` VARCHAR(50) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `role` ENUM('mahasiswa', 'dosen', 'konselor', 'admin') NOT NULL DEFAULT 'mahasiswa',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table: journal_entries
CREATE TABLE IF NOT EXISTS `journal_entries` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `student_nim` VARCHAR(20) NOT NULL,
  `student_name` VARCHAR(100) NOT NULL,
  `profile_type` ENUM('awal', 'akhir') NOT NULL,
  `semester` INT DEFAULT NULL,
  `thesis_stage` VARCHAR(100) DEFAULT NULL,
  `moods` JSON,
  `enthusiasm` INT NOT NULL,
  `burden` TEXT,
  `dosen` VARCHAR(100),
  `hambatan` JSON,
  `hambatan_personal` JSON,
  `self_reflection` JSON,
  `body_reactions` JSON,
  `social_reactions` JSON,
  `help_needs` JSON,
  `contact` VARCHAR(50),
  `ews_result` VARCHAR(50),
  `referral_status` VARCHAR(20) DEFAULT 'belum', -- 'belum', 'dirujuk', 'selesai'
  `referral_target` VARCHAR(20) DEFAULT NULL, -- 'pembimbing', 'konselor'
  `referral_date` DATE DEFAULT NULL,
  `referral_done` BOOLEAN DEFAULT FALSE,
  `referred_at` DATETIME DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table: journal_reviews
CREATE TABLE IF NOT EXISTS `journal_reviews` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `journal_id` INT NOT NULL,
  `reviewer_name` VARCHAR(120) NOT NULL DEFAULT 'Reviewer',
  `reviewer_role` VARCHAR(40) NOT NULL DEFAULT 'dosen',
  `note` TEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`journal_id`) REFERENCES `journal_entries`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table: mahasiswa_dosen
CREATE TABLE IF NOT EXISTS `mahasiswa_dosen` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `mahasiswa_id` INT NOT NULL,
  `dosen_id` INT NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY `unique_student_lecturer` (`mahasiswa_id`, `dosen_id`),
  CONSTRAINT `fk_map_mahasiswa` FOREIGN KEY (`mahasiswa_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_map_dosen` FOREIGN KEY (`dosen_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Default Admin User (Password: admin123)
INSERT IGNORE INTO `users` (`username`, `password`, `role`) VALUES 
('admin', '$2y$10$gXqK87f0bJ/8rJgCj/c.o.5vQyV9QkS4Owhh3kYlWw5p2HjUqXyca', 'admin');
