<?php
/**
 * GET  ?id=1 → { participant }
 * POST ?id=1 (+ X-CSRF-Token) with one of:
 *   { action: "update",  status, notes }  → save from the detail page
 *   { action: "status",  status }         → quick switch from the list
 *   { action: "delete" }                  → soft delete (hidden, restorable)
 *   { action: "restore" }                 → undo a soft delete
 * Team members set status to `registered` once payment is confirmed.
 */
declare(strict_types=1);
require dirname(__DIR__) . '/bootstrap.php';

$m = method('GET', 'POST');
$user = require_staff();
$isSuper = $user['role'] === 'superadmin';
$id = (int)($_GET['id'] ?? 0);

function set_status(int $id, string $status, int $by): void
{
    if (!in_array($status, STATUSES, true)) json_out(422, ['ok' => false, 'error' => 'Invalid status']);
    // Stamp who/when only if the status actually changes (SET runs left to right).
    db()->prepare(
        'UPDATE participants SET
           status_changed_by = IF(status <> ?, ?, status_changed_by),
           status_changed_at = IF(status <> ?, NOW(), status_changed_at),
           status = ?
         WHERE id = ?'
    )->execute([$status, $by, $status, $status, $id]);
}

if ($m === 'POST') {
    if (!origin_allowed()) json_out(403, ['ok' => false, 'error' => 'Origin not allowed']);
    check_csrf();
    $in = json_body();

    switch ($in['action'] ?? 'update') {
        case 'update':
            set_status($id, (string)($in['status'] ?? ''), $user['id']);
            $notes = mb_substr(trim((string)($in['notes'] ?? '')), 0, 5000);
            db()->prepare('UPDATE participants SET notes = ? WHERE id = ?')->execute([$notes === '' ? null : $notes, $id]);
            break;
        case 'status':
            set_status($id, (string)($in['status'] ?? ''), $user['id']);
            break;
        case 'delete':
            if (!$isSuper) json_out(403, ['ok' => false, 'error' => 'Only a superadmin can delete participants']);
            db()->prepare('UPDATE participants SET deleted_at = NOW(), deleted_by = ? WHERE id = ? AND deleted_at IS NULL')
                ->execute([$user['id'], $id]);
            break;
        case 'restore':
            if (!$isSuper) json_out(403, ['ok' => false, 'error' => 'Only a superadmin can restore participants']);
            db()->prepare('UPDATE participants SET deleted_at = NULL, deleted_by = NULL WHERE id = ?')->execute([$id]);
            break;
        default:
            json_out(400, ['ok' => false, 'error' => 'Unknown action']);
    }
}

$st = db()->prepare('SELECT p.*, u.name AS changed_by_name, d.name AS deleted_by_name FROM participants p
                     LEFT JOIN users u ON u.id = p.status_changed_by
                     LEFT JOIN users d ON d.id = p.deleted_by
                     WHERE p.id = ?');
$st->execute([$id]);
$p = $st->fetch();
if (!$p || (!$isSuper && $p['deleted_at'] !== null)) json_out(404, ['ok' => false, 'error' => 'Participant not found']);

json_out(200, ['ok' => true, 'participant' => fmt_participant($p)]);
