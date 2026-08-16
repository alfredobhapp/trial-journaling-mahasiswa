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

try {
    $stmt = $pdo->prepare("
        INSERT INTO journal_entries (
            student_nim, student_name, profile_type, semester, thesis_stage, 
            moods, enthusiasm, burden, dosen, hambatan, hambatan_personal, 
            self_reflection, body_reactions, social_reactions, help_needs, contact, ews_result
        ) VALUES (
            :studentNim, :studentName, :segment, :semester, :thesisStage, 
            :moods, :enthusiasm, :burden, :dosen, :hambatan, :hambatanPersonal, 
            :selfReflection, :bodyReactions, :socialReactions, :helpNeeds, :contact, :ewsResult
        )
    ");

    $stmt->execute([
        ':studentNim' => $input['studentNim'] ?? '',
        ':studentName' => $input['studentName'] ?? '',
        ':segment' => $input['segment'] ?? 'awal',
        ':semester' => $input['semester'] ?? null,
        ':thesisStage' => $input['thesisStage'] ?? null,
        ':moods' => json_encode($input['moods'] ?? []),
        ':enthusiasm' => $input['enthusiasm'] ?? 3,
        ':burden' => $input['burden'] ?? '',
        ':dosen' => $input['dosen'] ?? '',
        ':hambatan' => json_encode($input['hambatan'] ?? []),
        ':hambatanPersonal' => json_encode($input['hambatanPersonal'] ?? []),
        ':selfReflection' => json_encode($input['selfReflection'] ?? []),
        ':bodyReactions' => json_encode($input['bodyReactions'] ?? []),
        ':socialReactions' => json_encode($input['socialReactions'] ?? []),
        ':helpNeeds' => json_encode($input['helpNeeds'] ?? []),
        ':contact' => $input['contact'] ?? '',
        ':ewsResult' => $input['ews_result'] ?? 'Normal'
    ]);

    $jurnal_id = $pdo->lastInsertId();

    echo json_encode([
        'status' => 'success',
        'message' => 'Journal submitted successfully.',
        'data' => [
            'jurnal_id' => $jurnal_id
        ]
    ]);

} catch (\Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to save journal: ' . $e->getMessage()]);
}
