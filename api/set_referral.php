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

if (!$input || empty($input['journalId'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid or missing parameters']);
    exit;
}

try {
    $referred = isset($input['target']) && $input['target'] !== null;
    $target = $input['target'] ?? null;
    $date = $input['date'] ?? null;
    $done = $input['done'] ?? false;
    
    $referralStatus = $referred ? 'dirujuk' : 'belum';
    $referralDate = $referred ? $date : null;
    $referralDone = $referred ? (int)$done : 0;
    $referredAt = $referred ? date('Y-m-d H:i:s') : null;

    $stmt = $pdo->prepare("
        UPDATE journal_entries
        SET referral_status = :referralStatus,
            referral_target = :referralTarget,
            referral_date = :referralDate,
            referral_done = :referralDone,
            referred_at = :referredAt
        WHERE id = :id
    ");

    $stmt->execute([
        ':referralStatus' => $referralStatus,
        ':referralTarget' => $target,
        ':referralDate' => $referralDate,
        ':referralDone' => $referralDone,
        ':referredAt' => $referredAt,
        ':id' => $input['journalId']
    ]);

    $stmt = $pdo->prepare("SELECT id, referral_status, referral_target, referral_date, referral_done, referred_at FROM journal_entries WHERE id = :id");
    $stmt->execute([':id' => $input['journalId']]);
    $row = $stmt->fetch();

    if ($row) {
        $row['id'] = (string)$row['id'];
        $row['referralStatus'] = $row['referral_status'];
        $row['referralTarget'] = $row['referral_target'];
        $row['referralDate'] = $row['referral_date'];
        $row['referralDone'] = (bool)$row['referral_done'];
        $row['referredAt'] = $row['referred_at'];
    }

    echo json_encode([
        'status' => 'success',
        'data' => $row
    ]);

} catch (\Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to update referral: ' . $e->getMessage()]);
}
