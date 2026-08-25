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

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        // 1. Get Dosens
        $stmt = $pdo->query("SELECT id, username FROM users WHERE role = 'dosen'");
        $dosens = $stmt->fetchAll();

        // 2. Get Mahasiswas
        $stmt = $pdo->query("SELECT id, username FROM users WHERE role = 'mahasiswa'");
        $mahasiswas = $stmt->fetchAll();

        // 3. Get Existing Mappings
        $stmt = $pdo->query("
            SELECT 
                m.id as mapping_id, 
                u_mhs.username as mahasiswa_username,
                u_mhs.id as mahasiswa_id,
                u_dosen.username as dosen_username,
                u_dosen.id as dosen_id
            FROM mahasiswa_dosen m
            JOIN users u_mhs ON m.mahasiswa_id = u_mhs.id
            JOIN users u_dosen ON m.dosen_id = u_dosen.id
        ");
        $mappings = $stmt->fetchAll();

        echo json_encode([
            'dosens' => $dosens,
            'mahasiswas' => $mahasiswas,
            'mappings' => $mappings
        ]);
    } catch (\Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Gagal memuat data: ' . $e->getMessage()]);
    }
    exit();
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    $dosen_id = $input['dosen_id'] ?? null;
    $mahasiswa_ids = $input['mahasiswa_ids'] ?? [];

    if (!$dosen_id || empty($mahasiswa_ids)) {
        http_response_code(400);
        echo json_encode(['error' => 'Dosen dan setidaknya satu mahasiswa wajib dipilih']);
        exit();
    }

    try {
        $pdo->beginTransaction();

        $insertStmt = $pdo->prepare('INSERT IGNORE INTO mahasiswa_dosen (mahasiswa_id, dosen_id) VALUES (?, ?)');

        foreach ($mahasiswa_ids as $mhs_id) {
            $delStmt = $pdo->prepare('DELETE FROM mahasiswa_dosen WHERE mahasiswa_id = ?');
            $delStmt->execute([$mhs_id]);

            $insertStmt->execute([$mhs_id, $dosen_id]);
        }

        $pdo->commit();
        echo json_encode(['success' => true, 'message' => 'Mapping berhasil disimpan']);
    } catch (\Exception $e) {
        $pdo->rollBack();
        http_response_code(500);
        echo json_encode(['error' => 'Gagal menyimpan mapping: ' . $e->getMessage()]);
    }
    exit();
}

http_response_code(405);
echo json_encode(['error' => 'Method Not Allowed']);
?>
