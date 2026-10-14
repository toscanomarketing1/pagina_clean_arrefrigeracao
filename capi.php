<?php
/**
 * ==============================================================================
 * Meta Conversions API (CAPI) Endpoint
 * Pixel ID: 4431114103795136
 * Suporta desduplicação automática com o Meta Pixel do navegador (event_id)
 * ==============================================================================
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Trata preflight OPTIONS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['status' => 'error', 'message' => 'Método não permitido']);
    exit;
}

$pixel_id = '4431114103795136';
$access_token = 'EAAO352KnaE4BSi8VHaH0YdCM4HDYwTQHWXlAM1RQlPxGtNHyZBqrrO6XL5fXgjCNsatKCbeTE0pM4x6g9CYH8acvWWv7lH2JByhx8H2eec5AajNpObuCkrUAnAeA4pxELZBnIGYvuzCxD4WzTY8ULDDj5AStDuCaPjLY5Uvi7vWYrKZA641d0QH135XmAZDZD';

// Obtém payload JSON do frontend
$raw_input = file_get_contents('php://input');
$input_data = json_decode($raw_input, true) ?: [];

// Parâmetros do evento
$event_name = isset($input_data['event_name']) && !empty($input_data['event_name']) ? trim($input_data['event_name']) : 'PageView';
$event_id = isset($input_data['event_id']) && !empty($input_data['event_id']) ? trim($input_data['event_id']) : ('evt_' . time() . '_' . bin2hex(random_bytes(6)));
$event_time = isset($input_data['event_time']) && is_numeric($input_data['event_time']) ? (int)$input_data['event_time'] : time();

// URL de origem do evento
$event_source_url = '';
if (!empty($input_data['event_source_url'])) {
    $event_source_url = $input_data['event_source_url'];
} elseif (!empty($_SERVER['HTTP_REFERER'])) {
    $event_source_url = $_SERVER['HTTP_REFERER'];
} else {
    $protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https://' : 'http://';
    $event_source_url = $protocol . (isset($_SERVER['HTTP_HOST']) ? $_SERVER['HTTP_HOST'] : 'localhost') . (isset($_SERVER['REQUEST_URI']) ? $_SERVER['REQUEST_URI'] : '/');
}

// Extração do IP real do visitante (compatível com Cloudflare, proxies reversos e servidores Apache)
$client_ip = '';
if (!empty($_SERVER['HTTP_CF_CONNECTING_IP'])) {
    $client_ip = $_SERVER['HTTP_CF_CONNECTING_IP'];
} elseif (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
    $ips = explode(',', $_SERVER['HTTP_X_FORWARDED_FOR']);
    $client_ip = trim($ips[0]);
} elseif (!empty($_SERVER['HTTP_X_REAL_IP'])) {
    $client_ip = $_SERVER['HTTP_X_REAL_IP'];
} elseif (!empty($_SERVER['REMOTE_ADDR'])) {
    $client_ip = $_SERVER['REMOTE_ADDR'];
}

// User Agent do visitante
$client_user_agent = !empty($_SERVER['HTTP_USER_AGENT']) 
    ? $_SERVER['HTTP_USER_AGENT'] 
    : (!empty($input_data['user_data']['client_user_agent']) ? $input_data['user_data']['client_user_agent'] : '');

// Cookies do Facebook (_fbp e _fbc)
$fbp = !empty($_COOKIE['_fbp']) 
    ? $_COOKIE['_fbp'] 
    : (!empty($input_data['user_data']['fbp']) ? $input_data['user_data']['fbp'] : null);

$fbc = !empty($_COOKIE['_fbc']) 
    ? $_COOKIE['_fbc'] 
    : (!empty($input_data['user_data']['fbc']) ? $input_data['user_data']['fbc'] : null);

// Se não tiver cookie _fbc mas tiver fbclid enviado, gera no formato padrão fb.1.{timestamp}.{fbclid}
if (empty($fbc) && !empty($input_data['fbclid'])) {
    $fbc = 'fb.1.' . time() . '.' . trim($input_data['fbclid']);
}

// Montagem do bloco user_data
$user_data = [
    'client_ip_address' => $client_ip,
    'client_user_agent' => $client_user_agent
];

if (!empty($fbp)) {
    $user_data['fbp'] = $fbp;
}
if (!empty($fbc)) {
    $user_data['fbc'] = $fbc;
}

// Custom data (ex: content_name, value, currency)
$custom_data = isset($input_data['custom_data']) && is_array($input_data['custom_data']) ? $input_data['custom_data'] : [];

$payload = [
    'data' => [
        [
            'event_name' => $event_name,
            'event_time' => $event_time,
            'event_id' => $event_id,
            'event_source_url' => $event_source_url,
            'action_source' => 'website',
            'user_data' => $user_data,
            'custom_data' => (object)$custom_data
        ]
    ]
];

// Chamada para a Graph API da Meta
$api_url = "https://graph.facebook.com/v19.0/{$pixel_id}/events?access_token={$access_token}";

$ch = curl_init($api_url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Accept: application/json'
]);
curl_setopt($ch, CURLOPT_TIMEOUT, 6);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);

$response = curl_exec($ch);
$http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curl_error = curl_error($ch);
curl_close($ch);

if ($curl_error) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Falha de conexão cURL: ' . $curl_error
    ]);
    exit;
}

http_response_code($http_code);
echo $response;
