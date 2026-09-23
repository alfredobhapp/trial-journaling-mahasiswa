<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200); exit();
}

require_once 'db.php';

if (session_status() === PHP_SESSION_NONE) session_start();

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['error' => 'Method Not Allowed']);
    exit;
}

// Ambil user_id dari query param atau session
$userId = isset($_GET['user_id']) ? (int)$_GET['user_id'] : ($_SESSION['user_id'] ?? null);

if (!$userId) {
    http_response_code(401);
    echo json_encode(['error' => 'User tidak terautentikasi']);
    exit;
}

try {
    $stmt = $pdo->prepare("
        SELECT 
            id, user_id, student_nim, student_name, profile_type, semester, thesis_stage,
            moods, enthusiasm, burden, dosen, hambatan, hambatan_personal,
            self_reflection, body_reactions, social_reactions, help_needs, contact,
            ews_result, referral_status, referral_target, referral_date, referral_done,
            referred_at, created_at
        FROM journal_entries
        WHERE user_id = ?
        ORDER BY created_at DESC
    ");
    $stmt->execute([$userId]);
    $rows = $stmt->fetchAll();

    $entries = array_map(function($r) {
        return [
            'id'              => (string)$r['id'],
            'userId'          => (int)$r['user_id'],
            'studentNim'      => $r['student_nim'],
            'studentName'     => $r['student_name'],
            'profileType'     => $r['profile_type'],
            'semester'        => $r['semester'] ? (int)$r['semester'] : null,
            'thesisStage'     => $r['thesis_stage'],
            'moods'           => $r['moods']           ? json_decode($r['moods'], true)           : [],
            'enthusiasm'      => (int)$r['enthusiasm'],
            'burden'          => $r['burden'],
            'dosen'           => $r['dosen'],
            'hambatan'        => $r['hambatan']         ? json_decode($r['hambatan'], true)         : [],
            'hambatanPersonal'=> $r['hambatan_personal']? json_decode($r['hambatan_personal'], true): [],
            'selfReflection'  => $r['self_reflection']  ? json_decode($r['self_reflection'], true)  : [],
            'bodyReactions'   => $r['body_reactions']   ? json_decode($r['body_reactions'], true)   : [],
            'socialReactions' => $r['social_reactions'] ? json_decode($r['social_reactions'], true) : [],
            'helpNeeds'       => $r['help_needs']       ? json_decode($r['help_needs'], true)       : [],
            'contact'         => $r['contact'],
            'ews'             => $r['ews_result'],
            'referralStatus'  => $r['referral_status'],
            'referralTarget'  => $r['referral_target'],
            'referralDate'    => $r['referral_date'],
            'referralDone'    => (bool)$r['referral_done'],
            'referredAt'      => $r['referred_at'],
            'createdAt'       => $r['created_at'],
        ];
    }, $rows);

    echo json_encode(['entries' => $entries]);

} catch (\Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Gagal memuat riwayat jurnal: ' . $e->getMessage()]);
}
?>
