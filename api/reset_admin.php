<?php
// Utility: Reset password admin
// HAPUS FILE INI SETELAH DIGUNAKAN!

require_once 'db.php';

$newPassword = 'admin123';
$hashed = password_hash($newPassword, PASSWORD_BCRYPT);

// Upsert: insert if not exists, update if exists
$stmt = $pdo->prepare("
    INSERT INTO users (username, password, role) 
    VALUES ('admin', ?, 'admin')
    ON DUPLICATE KEY UPDATE password = VALUES(password)
");
$stmt->execute([$hashed]);

echo "<pre>";
echo "Hash yang digenerate:\n$hashed\n\n";
echo "Verifikasi password 'admin123': ";
echo password_verify('admin123', $hashed) ? "VALID ✓" : "TIDAK VALID ✗";
echo "\n\nAkun admin telah berhasil diupdate!\n";
echo "Username: admin\n";
echo "Password: admin123\n";
echo "</pre>";
echo "<br><strong style='color:red'>PENTING: Hapus file ini setelah selesai!</strong>";
?>
