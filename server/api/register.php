<?php
/**
 * Public endpoint for the website's registration form.
 * The site posts here (VITE_REGISTER_ENDPOINT=/api/register.php).
 * Every submission is stored with status `interested`.
 */
declare(strict_types=1);

require dirname(__DIR__) . '/bootstrap.php';

// Cross-origin is only needed if the site and API live on different domains.
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if ($origin && origin_allowed()) {
    header("Access-Control-Allow-Origin: $origin");
    header('Vary: Origin');
    header('Access-Control-Allow-Methods: POST, OPTIONS');
    header('Access-Control-Allow-Headers: Accept, Content-Type');
}

function respond(int $code, array $body): never
{
    json_out($code, $body);
}

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') respond(204, []);
method('POST');
if (!origin_allowed()) respond(403, ['ok' => false, 'error' => 'Origin not allowed']);

// Honeypot field from the form.
if (!empty($_POST['website'])) respond(200, ['ok' => true]);

$in = fn(string $k, int $max = 255) => mb_substr(trim((string)($_POST[$k] ?? '')), 0, $max);

$data = [
    'full_name' => $in('fullName', 160),
    'email' => strtolower($in('email', 190)),
    'phone' => $in('phone', 40),
    'city' => $in('city', 120),
    'organization' => $in('organization', 160),
    'role' => $in('role', 120),
    'experience' => $in('experience', 60),
    'social' => $in('social'),
    'previous_competition' => $in('previousCompetition', 2000),
    'heard_from' => $in('heardFrom', 120),
    'tshirt_size' => $in('tshirtSize', 20),
    'bio' => $in('bio', 4000),
];

$errors = [];
if ($data['full_name'] === '') $errors['fullName'] = 'Required';
if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) $errors['email'] = 'Invalid email';
if (!preg_match('/^[0-9+()\-\s]{7,20}$/', $data['phone'])) $errors['phone'] = 'Invalid phone';
if (!in_array($data['tshirt_size'], ['Small', 'Medium', 'Large'], true)) $errors['tshirtSize'] = 'Choose a size';
if ($data['bio'] === '') $errors['bio'] = 'Required';
if ($errors) respond(422, ['ok' => false, 'errors' => $errors]);

// Optional profile photo: verify it really is an image, re-name it.
$photo = null;
if (!empty($_FILES['photo']) && $_FILES['photo']['error'] !== UPLOAD_ERR_NO_FILE) {
    $f = $_FILES['photo'];
    $max = (int)env('MAX_PHOTO_MB', '5') * 1024 * 1024;
    $types = ['image/jpeg' => 'jpg', 'image/png' => 'png', 'image/webp' => 'webp'];
    $mime = $f['error'] === UPLOAD_ERR_OK ? (new finfo(FILEINFO_MIME_TYPE))->file($f['tmp_name']) : '';
    if (!isset($types[$mime]) || $f['size'] > $max) respond(422, ['ok' => false, 'errors' => ['photo' => 'JPG, PNG or WebP under ' . env('MAX_PHOTO_MB', '5') . ' MB']]);
    $photo = bin2hex(random_bytes(16)) . '.' . $types[$mime];
    if (!move_uploaded_file($f['tmp_name'], dirname(__DIR__) . '/storage/photos/' . $photo)) respond(500, ['ok' => false, 'error' => 'Upload failed']);
}

$token = bin2hex(random_bytes(32));
try {
    $cols = array_keys($data);
    $st = db()->prepare(sprintf(
        'INSERT INTO participants (%s, press_consent, photo_path, payment_token, ip_address) VALUES (%s, ?, ?, ?, ?)',
        implode(', ', $cols),
        implode(', ', array_fill(0, count($cols), '?'))
    ));
    $st->execute([...array_map(fn($v) => $v === '' ? null : $v, array_values($data)), ($_POST['pressConsent'] ?? '') === 'true' ? 1 : 0, $photo, $token, $_SERVER['REMOTE_ADDR'] ?? null]);
    $id = (int)db()->lastInsertId();
} catch (Throwable $e) {
    error_log('register.php: ' . $e->getMessage());
    respond(500, ['ok' => false, 'error' => 'Could not save registration']);
}

// The browser keeps id + token to confirm the payment screenshot afterwards.
respond(201, ['ok' => true, 'id' => $id, 'token' => $token]);
