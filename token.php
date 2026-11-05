<?php
// © SUCHI 24/7 - https://discord.gg/pvtBvKUKC8
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *'); // Allow your frontend to call this

// ⚠️ REPLACE THESE WITH YOUR ACTUAL DETAILS
$client_id = '1567812331554209862';
$client_secret = getenv('lBzqqIt3ZM0CUUV9LAlYmF3zgfrVnDS3'); // Or hardcode if not using env vars
$redirect_uri = 'https://your-app-name.deplexo.com/'; // Your website URL (no trailing slash)

// Get the code sent from the frontend
$data = json_decode(file_get_contents('php://input'), true);
$code = $data['code'] ?? '';

if (!$code) {
    echo json_encode(['error' => 'No code provided']);
    exit;
}

// Prepare the POST request to Discord
$post_fields = http_build_query([
    'client_id' => $client_id,
    'client_secret' => $client_secret,
    'grant_type' => 'authorization_code',
    'code' => $code,
    'redirect_uri' => $redirect_uri
]);

$ch = curl_init('https://discord.com/api/oauth2/token');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, $post_fields);
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/x-www-form-urlencoded']);

$response = curl_exec($ch);
curl_close($ch);

// Return the response back to the frontend
echo $response;
?>
