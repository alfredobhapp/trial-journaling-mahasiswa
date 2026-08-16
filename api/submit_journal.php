<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

require_once 'db.php';

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

$user_id = $input['user_id'] ?? null;
if (!$user_id) {
    http_response_code(400);
    echo json_encode(['error' => 'user_id is required']);
    exit;
}

// Extract form data
$beban_pikiran_opt_1 = $input['beban_pikiran_opt_1'] ?? '';
$beban_pikiran_opt_2 = $input['beban_pikiran_opt_2'] ?? '';
$hambatan_utama = isset($input['hambatan_utama']) ? json_encode($input['hambatan_utama']) : json_encode([]);
$hambatan_personal = $input['hambatan_personal'] ?? '';
$self_reflection = $input['self_reflection'] ?? '';
$reaksi_fisik = $input['reaksi_fisik'] ?? '';
$reaksi_sosial = $input['reaksi_sosial'] ?? '';
$kebutuhan_bantuan = $input['kebutuhan_bantuan'] ?? '';

// EWS Auto-flagging logic
$ews_status = 'Normal';

// 1. Check for Academic issues (Pendampingan Akademik)
// Suppose hambatan_utama is an array of selected options
$hambatan_arr = isset($input['hambatan_utama']) && is_array($input['hambatan_utama']) ? $input['hambatan_utama'] : [];
$academic_flags = ['skripsi', 'pkl', 'ipk_turun', 'cuti_akademik', 'mengulang_mata_kuliah'];
foreach ($hambatan_arr as $hambatan) {
    if (in_array(strtolower(trim($hambatan)), $academic_flags)) {
        $ews_status = 'Pendampingan Akademik';
        break;
    }
}

// 2. Check for Counseling Needs (Intervensi Konseling)
// If there's significant content in personal distress fields
$distress_keywords = ['depresi', 'bunuh diri', 'cemas', 'stres berat', 'menyerah', 'panic', 'menyakiti diri', 'sulit tidur', 'tidak ada harapan'];
$combined_distress_text = strtolower($hambatan_personal . ' ' . $reaksi_fisik . ' ' . $reaksi_sosial . ' ' . $kebutuhan_bantuan);

foreach ($distress_keywords as $keyword) {
    if (strpos($combined_distress_text, $keyword) !== false) {
        $ews_status = 'Intervensi Konseling';
        break;
    }
}

try {
    $pdo->beginTransaction();

    // Insert into jurnal
    $stmt = $pdo->prepare("
        INSERT INTO jurnal (
            user_id, beban_pikiran_opt_1, beban_pikiran_opt_2, hambatan_utama,
            hambatan_personal, self_reflection, reaksi_fisik, reaksi_sosial,
            kebutuhan_bantuan, ews_status
        ) VALUES (
            :user_id, :beban_1, :beban_2, :hambatan_utama,
            :hambatan_personal, :self_reflection, :reaksi_fisik, :reaksi_sosial,
            :kebutuhan_bantuan, :ews_status
        )
    ");

    $stmt->execute([
        ':user_id' => $user_id,
        ':beban_1' => $beban_pikiran_opt_1,
        ':beban_2' => $beban_pikiran_opt_2,
        ':hambatan_utama' => $hambatan_utama,
        ':hambatan_personal' => $hambatan_personal,
        ':self_reflection' => $self_reflection,
        ':reaksi_fisik' => $reaksi_fisik,
        ':reaksi_sosial' => $reaksi_sosial,
        ':kebutuhan_bantuan' => $kebutuhan_bantuan,
        ':ews_status' => $ews_status
    ]);

    $jurnal_id = $pdo->lastInsertId();

    // Insert into review (initial status)
    $stmt_review = $pdo->prepare("
        INSERT INTO review (jurnal_id, status)
        VALUES (:jurnal_id, 'Belum ditinjau')
    ");
    $stmt_review->execute([
        ':jurnal_id' => $jurnal_id
    ]);

    $pdo->commit();

    echo json_encode([
        'status' => 'success',
        'message' => 'Journal submitted successfully.',
        'data' => [
            'jurnal_id' => $jurnal_id,
            'ews_status' => $ews_status
        ]
    ]);

} catch (\Exception $e) {
    $pdo->rollBack();
    http_response_code(500);
    echo json_encode(['error' => 'Failed to save journal: ' . $e->getMessage()]);
}
