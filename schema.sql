-- Table: users
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `username` VARCHAR(50) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `role` ENUM('mahasiswa', 'dosen', 'konselor', 'admin') NOT NULL DEFAULT 'mahasiswa',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table: jurnal
CREATE TABLE IF NOT EXISTS `jurnal` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `beban_pikiran_opt_1` TEXT,
  `beban_pikiran_opt_2` TEXT,
  `hambatan_utama` JSON, -- Store selections for Semester 1-7, PKL, Skripsi
  `hambatan_personal` TEXT,
  `self_reflection` TEXT,
  `reaksi_fisik` TEXT,
  `reaksi_sosial` TEXT,
  `kebutuhan_bantuan` TEXT,
  `ews_status` ENUM('Normal', 'Pendampingan Akademik', 'Intervensi Konseling') DEFAULT 'Normal',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table: review
CREATE TABLE IF NOT EXISTS `review` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `jurnal_id` INT NOT NULL,
  `reviewer_id` INT,
  `status` VARCHAR(255) NOT NULL DEFAULT 'Belum ditinjau', -- Handles 'Belum ditinjau', 'OK', 'Konseling Pembimbing + [Date] + [Status]', 'Konseling Konselor + [Date] + [Status]'
  `notes` TEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`jurnal_id`) REFERENCES `jurnal`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`reviewer_id`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
