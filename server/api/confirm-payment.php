<?php
/**
 * Public: the applicant says they sent the payment screenshot on WhatsApp.
 * POST { id, token } (token from register.php) → marks the participant `registered`.
 * The team can still move them back to `interested` in /admin if no payment arrived.
 */
declare(strict_types=1);
require dirname(__DIR__) . '/bootstrap.php';

method('POST');
if (!origin_allowed()) json_out(403, ['ok' => false, 'error' => 'Origin not allowed']);

$b = json_body();
$id = (int)($b['id'] ?? 0);
$token = (string)($b['token'] ?? '');
if ($id < 1 || !preg_match('/^[0-9a-f]{64}$/', $token)) json_out(422, ['ok' => false, 'error' => 'Invalid request']);

$st = db()->prepare('SELECT payment_token FROM participants WHERE id = ? AND deleted_at IS NULL');
$st->execute([$id]);
$stored = $st->fetchColumn();
if (!is_string($stored) || !hash_equals($stored, $token)) json_out(404, ['ok' => false, 'error' => 'Application not found']);

db()->prepare("UPDATE participants SET status = 'registered', payment_confirmed_at = COALESCE(payment_confirmed_at, NOW()),
               status_changed_at = NOW(), status_changed_by = NULL WHERE id = ?")->execute([$id]);
json_out(200, ['ok' => true]);
