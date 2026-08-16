<?php
// file: index.php
// Entry point untuk meload tampilan Frontend (React/Vite)
// URL akses: vincentiusalfredo.com/journal

$indexPath = __DIR__ . '/campus-compass-journal/dist/index.html';

// Cek apakah frontend sudah di-build
if (file_exists($indexPath)) {
    // Tampilkan isi index.html dari hasil build frontend
    readfile($indexPath);
} else {
    // Pesan jika belum di-build
    echo "<h2>Frontend UI belum di-build!</h2>";
    echo "<p>Silakan masuk ke folder <b>campus-compass-journal</b> dan jalankan perintah <code>npm run build</code> atau <code>bun run build</code>, sehingga folder <b>dist</b> terbentuk.</p>";
}
