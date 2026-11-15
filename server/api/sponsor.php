<?php
/**
 * Public endpoint for the website's "Become a sponsor" form.
 * Stores the enquiry as `new`; the team sees it under /admin/sponsors.
 */
declare(strict_types=1);

require dirname(__DIR__) . '/bootstrap.php';

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if ($origin && origin_allowed()) {
    header("Access-Control-Allow-Origin: $origin");
    header('Vary: Origin');
    header('Access-Control-Allow-Methods: POST, OPTIONS');
    header('Access-Control-Allow-Headers: Accept, Content-Type');
}

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') json_out(204, []);
method('POST');
if (!origin_allowed()) json_out(403, ['ok' => false, 'error' => 'Origin not allowed']);

$body = str_contains($_SERVER['CONTENT_TYPE'] ?? '', 'application/json') ? json_body() : $_POST;
// Honeypot field from the form.
if (!empty($body['website'])) json_out(200, ['ok' => true]);

$in = fn(string $k, int $max = 160) => mb_substr(trim((string)($body[$k] ?? '')), 0, $max);
$data = [
    'name' => $in('name'),
    'contact' => $in('contact', 40),
    'email' => strtolower($in('email', 190)),
    'company' => $in('company'),
];

$errors = [];
if ($data['name'] === '') $errors['name'] = 'Required';
if (!preg_match('/^[0-9+()\-\s]{7,20}$/', $data['contact'])) $errors['contact'] = 'Invalid phone';
if ($data['email'] !== '' && !filter_var($data['email'], FILTER_VALIDATE_EMAIL)) $errors['email'] = 'Invalid email';
if ($errors) json_out(422, ['ok' => false, 'errors' => $errors]);

try {
    db()->prepare('INSERT INTO sponsor_inquiries (name, contact, email, company, ip_address) VALUES (?, ?, ?, ?, ?)')
        ->execute([$data['name'], $data['contact'], $data['email'] ?: null, $data['company'] ?: null, $_SERVER['REMOTE_ADDR'] ?? null]);
} catch (Throwable $e) {
    error_log('sponsor.php: ' . $e->getMessage());
    json_out(500, ['ok' => false, 'error' => 'Could not save enquiry']);
}

json_out(201, ['ok' => true]);
