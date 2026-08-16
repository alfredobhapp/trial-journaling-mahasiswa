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

if (!$input || empty($input['journalId']) || empty($input['note'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid or missing parameters']);
    exit;
}

try {
    $stmt = $pdo->prepare("
        INSERT INTO journal_reviews (journal_id, note, reviewer_name, reviewer_role)
        VALUES (:journalId, :note, :reviewerName, :reviewerRole)
    ");

    $stmt->execute([
        ':journalId' => $input['journalId'],
        ':note' => $input['note'],
        ':reviewerName' => $input['reviewerName'] ?? 'Reviewer',
        ':reviewerRole' => $input['reviewerRole'] ?? 'dosen'
    ]);

    $review_id = $pdo->lastInsertId();

    $stmt = $pdo->prepare("SELECT id, journal_id, reviewer_name, reviewer_role, note, created_at FROM journal_reviews WHERE id = :id");
    $stmt->execute([':id' => $review_id]);
    $row = $stmt->fetch();

    if ($row) {
        $row['id'] = (string)$row['id'];
        $row['journal_id'] = (string)$row['journal_id'];
    }

    echo json_encode([
        'status' => 'success',
        'data' => $row
    ]);

} catch (\Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to save review: ' . $e->getMessage()]);
}
