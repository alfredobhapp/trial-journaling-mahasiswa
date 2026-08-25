<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once 'db.php';

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method Not Allowed']);
    exit();
}

$input = json_decode(file_get_contents('php://input'), true);
$username = trim($input['username'] ?? '');
$password = trim($input['password'] ?? '');
$role = trim($input['role'] ?? 'mahasiswa');

if (empty($username) || empty($password)) {
    http_response_code(400);
    echo json_encode(['error' => 'Username dan password wajib diisi']);
    exit();
}

$allowed_roles = ['mahasiswa', 'dosen', 'konselor', 'admin'];
if (!in_array($role, $allowed_roles)) {
    http_response_code(400);
    echo json_encode(['error' => 'Role tidak valid']);
    exit();
}

try {
    // Check if username already exists
    $stmt = $pdo->prepare('SELECT id FROM users WHERE username = ?');
    $stmt->execute([$username]);
    if ($stmt->fetch()) {
        http_response_code(400);
        echo json_encode(['error' => 'Username sudah terdaftar']);
        exit();
    }

    $hashedPassword = password_hash($password, PASSWORD_BCRYPT);
    $stmt = $pdo->prepare('INSERT INTO users (username, password, role) VALUES (?, ?, ?)');
    $stmt->execute([$username, $hashedPassword, $role]);

    echo json_encode(['success' => true, 'message' => 'Pengguna berhasil didaftarkan']);
} catch (\Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Gagal mendaftarkan pengguna: ' . $e->getMessage()]);
}
?>
