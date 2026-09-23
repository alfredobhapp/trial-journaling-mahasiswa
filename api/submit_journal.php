<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200); exit();
}

require_once 'db.php';

if (session_status() === PHP_SESSION_NONE) session_start();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method Not Allowed']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);

if (!$input) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid JSON input']);
    exit;
}

// Ambil user_id dari input (dikirim frontend) atau fallback ke session
$userId = isset($input['userId']) ? (int)$input['userId'] : ($_SESSION['user_id'] ?? null);

// Validasi: pastikan user_id adalah mahasiswa yang valid
if ($userId) {
    $checkStmt = $pdo->prepare("SELECT id, username, role FROM users WHERE id = ? AND role = 'mahasiswa'");
    $checkStmt->execute([$userId]);
    $userRow = $checkStmt->fetch();
    
    if (!$userRow) {
        // user_id dikirim tapi bukan mahasiswa — tolak
        http_response_code(403);
        echo json_encode(['error' => 'Akses ditolak. Hanya mahasiswa yang bisa submit jurnal.']);
        exit;
    }
    
    // Gunakan username dari DB sebagai studentNim jika tidak disertakan
    $studentNim  = $input['studentNim']  ?? $userRow['username'];
    $studentName = $input['studentName'] ?? $userRow['username'];
} else {
    // Tidak ada session/userId — izinkan submit tanpa user_id (fallback)
    $studentNim  = $input['studentNim']  ?? 'unknown';
    $studentName = $input['studentName'] ?? 'unknown';
}

try {
    $stmt = $pdo->prepare("
        INSERT INTO journal_entries (
            user_id, student_nim, student_name, profile_type, semester, thesis_stage,
            moods, enthusiasm, burden, dosen, hambatan, hambatan_personal,
            self_reflection, body_reactions, social_reactions, help_needs, contact, ews_result
        ) VALUES (
            :userId, :studentNim, :studentName, :segment, :semester, :thesisStage,
            :moods, :enthusiasm, :burden, :dosen, :hambatan, :hambatanPersonal,
            :selfReflection, :bodyReactions, :socialReactions, :helpNeeds, :contact, :ewsResult
        )
    ");

    $stmt->execute([
        ':userId'          => $userId,
        ':studentNim'      => $studentNim,
        ':studentName'     => $studentName,
        ':segment'         => $input['segment']    ?? 'awal',
        ':semester'        => $input['semester']   ?? null,
        ':thesisStage'     => $input['thesisStage'] ?? null,
        ':moods'           => json_encode($input['moods']           ?? []),
        ':enthusiasm'      => $input['enthusiasm'] ?? 3,
        ':burden'          => $input['burden']     ?? '',
        ':dosen'           => $input['dosen']      ?? '',
        ':hambatan'        => json_encode($input['hambatan']        ?? []),
        ':hambatanPersonal'=> json_encode($input['hambatanPersonal'] ?? []),
        ':selfReflection'  => json_encode($input['selfReflection']  ?? []),
        ':bodyReactions'   => json_encode($input['bodyReactions']   ?? []),
        ':socialReactions' => json_encode($input['socialReactions'] ?? []),
        ':helpNeeds'       => json_encode($input['helpNeeds']       ?? []),
        ':contact'         => $input['contact']    ?? '',
        ':ewsResult'       => $input['ews_result'] ?? 'normal',
    ]);

    $journalId = $pdo->lastInsertId();

    echo json_encode([
        'status'  => 'success',
        'message' => 'Journal submitted successfully.',
        'data'    => ['jurnal_id' => $journalId],
    ]);

} catch (\Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to save journal: ' . $e->getMessage()]);
}
?>
