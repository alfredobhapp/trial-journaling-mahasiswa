<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

require_once 'db.php';

try {
    $stmt = $pdo->query("SELECT * FROM journal_entries ORDER BY created_at DESC");
    $entries_raw = $stmt->fetchAll();

    $ids = array_column($entries_raw, 'id');
    $reviews = [];

    if (!empty($ids)) {
        $in = str_repeat('?,', count($ids) - 1) . '?';
        $rev_stmt = $pdo->prepare("SELECT id, journal_id, reviewer_name, reviewer_role, note, created_at FROM journal_reviews WHERE journal_id IN ($in) ORDER BY created_at DESC");
        $rev_stmt->execute($ids);
        $reviews = $rev_stmt->fetchAll();
    }

    $entries = [];
    foreach ($entries_raw as $r) {
        $entries[] = [
            'id' => (string)$r['id'],
            'studentNim' => $r['student_nim'],
            'studentName' => $r['student_name'],
            'profileType' => $r['profile_type'],
            'semester' => $r['semester'] ? (int)$r['semester'] : null,
            'thesisStage' => $r['thesis_stage'],
            'moods' => $r['moods'] ? json_decode($r['moods'], true) : [],
            'enthusiasm' => (int)$r['enthusiasm'],
            'burden' => $r['burden'],
            'dosen' => $r['dosen'],
            'hambatan' => $r['hambatan'] ? json_decode($r['hambatan'], true) : [],
            'hambatanPersonal' => $r['hambatan_personal'] ? json_decode($r['hambatan_personal'], true) : [],
            'selfReflection' => $r['self_reflection'] ? json_decode($r['self_reflection'], true) : [],
            'bodyReactions' => $r['body_reactions'] ? json_decode($r['body_reactions'], true) : [],
            'socialReactions' => $r['social_reactions'] ? json_decode($r['social_reactions'], true) : [],
            'helpNeeds' => $r['help_needs'] ? json_decode($r['help_needs'], true) : [],
            'contact' => $r['contact'],
            'ews' => $r['ews_result'],
            'referralStatus' => $r['referral_status'],
            'referralTarget' => $r['referral_target'],
            'referralDate' => $r['referral_date'],
            'referralDone' => (bool)$r['referral_done'],
            'referredAt' => $r['referred_at'],
            'createdAt' => $r['created_at'],
        ];
    }

    // Convert review ids and journal_ids to strings for JS
    foreach ($reviews as &$rev) {
        $rev['id'] = (string)$rev['id'];
        $rev['journal_id'] = (string)$rev['journal_id'];
    }

    echo json_encode([
        'entries' => $entries,
        'reviews' => $reviews
    ]);

} catch (\Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to load data: ' . $e->getMessage()]);
}
