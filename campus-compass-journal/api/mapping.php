<?php
// api/mapping.php
require_once 'db.php';

// Check if user is logged in and is an admin
if (!isset($_SESSION['role']) || $_SESSION['role'] !== 'admin') {
    http_response_code(403);
    echo json_encode(['error' => 'Forbidden. Admin access required.']);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // Fetch Data for Mapping UI
    
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
    exit();
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Save New Mapping
    $input = json_decode(file_get_contents('php://input'), true);
    
    $dosen_id = $input['dosen_id'] ?? null;
    $mahasiswa_ids = $input['mahasiswa_ids'] ?? []; // Array of student IDs
    
    if (!$dosen_id || empty($mahasiswa_ids)) {
        http_response_code(400);
        echo json_encode(['error' => 'dosen_id and at least one mahasiswa_id are required']);
        exit();
    }
    
    try {
        $pdo->beginTransaction();
        
        $insertStmt = $pdo->prepare('INSERT IGNORE INTO mahasiswa_dosen (mahasiswa_id, dosen_id) VALUES (?, ?)');
        $updateUserStmt = $pdo->prepare('UPDATE users SET dosen_id = ? WHERE id = ? AND role = "mahasiswa"');
        
        foreach ($mahasiswa_ids as $mhs_id) {
            // Remove existing mapping for this student if any (a student can only have 1 active dosen?)
            // The prompt says "structured 1-to-N or M-to-N". 
            // If it's 1-to-N, delete existing mapping for the student.
            $delStmt = $pdo->prepare('DELETE FROM mahasiswa_dosen WHERE mahasiswa_id = ?');
            $delStmt->execute([$mhs_id]);
            
            $insertStmt->execute([$mhs_id, $dosen_id]);
            $updateUserStmt->execute([$dosen_id, $mhs_id]);
        }
        
        $pdo->commit();
        echo json_encode(['success' => true, 'message' => 'Mapping saved successfully']);
        
    } catch (\Exception $e) {
        $pdo->rollBack();
        http_response_code(500);
        echo json_encode(['error' => 'Database error while mapping']);
    }
    exit();
}

http_response_code(405);
echo json_encode(['error' => 'Method Not Allowed']);
?>
