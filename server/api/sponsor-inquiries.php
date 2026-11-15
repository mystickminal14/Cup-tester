<?php
/**
 * Admin: sponsor / vendor enquiries.
 *   GET  ?status=new|contacted&q=search&page=1  → { rows, counts, total, page, pages, per_page }
 *   POST { id, action: 'update', status, notes }  (staff)
 *   POST { id, action: 'delete' }                  (superadmin, permanent)
 */
declare(strict_types=1);
require dirname(__DIR__) . '/bootstrap.php';

const SPONSOR_STATUSES = ['new', 'contacted'];

$m = method('GET', 'POST');
$user = require_staff();

if ($m === 'POST') {
    check_csrf();
    $b = json_body();
    $id = (int)($b['id'] ?? 0);
    $action = (string)($b['action'] ?? '');
    if ($action === 'delete') {
        if ($user['role'] !== 'superadmin') json_out(403, ['ok' => false, 'error' => 'Only a superadmin can do that']);
        db()->prepare('DELETE FROM sponsor_inquiries WHERE id = ?')->execute([$id]);
        json_out(200, ['ok' => true]);
    }
    if ($action === 'update') {
        $status = (string)($b['status'] ?? '');
        if (!in_array($status, SPONSOR_STATUSES, true)) json_out(422, ['ok' => false, 'error' => 'Invalid status']);
        $notes = mb_substr(trim((string)($b['notes'] ?? '')), 0, 4000);
        db()->prepare('UPDATE sponsor_inquiries SET status = ?, notes = ? WHERE id = ?')->execute([$status, $notes === '' ? null : $notes, $id]);
        json_out(200, ['ok' => true]);
    }
    json_out(422, ['ok' => false, 'error' => 'Unknown action']);
}

$status = in_array($_GET['status'] ?? '', SPONSOR_STATUSES, true) ? $_GET['status'] : '';
$q = trim((string)($_GET['q'] ?? ''));

$counts = ['all' => 0, 'new' => 0, 'contacted' => 0];
foreach (db()->query('SELECT status, COUNT(*) n FROM sponsor_inquiries GROUP BY status') as $r) {
    $counts[$r['status']] = (int)$r['n'];
    $counts['all'] += (int)$r['n'];
}

$where = [];
$args = [];
if ($status) {
    $where[] = 'status = ?';
    $args[] = $status;
}
if ($q !== '') {
    $where[] = '(name LIKE ? OR contact LIKE ? OR email LIKE ? OR company LIKE ?)';
    array_push($args, ...array_fill(0, 4, '%' . $q . '%'));
}
$sqlWhere = $where ? 'WHERE ' . implode(' AND ', $where) : '';
$page = max(1, (int)($_GET['page'] ?? 1));
$perPage = 25;

$st = db()->prepare("SELECT COUNT(*) FROM sponsor_inquiries $sqlWhere");
$st->execute($args);
$total = (int)$st->fetchColumn();
$pages = max(1, (int)ceil($total / $perPage));
$page = min($page, $pages);

$st = db()->prepare("SELECT id, name, contact, email, company, interest, status, notes, created_at
                     FROM sponsor_inquiries $sqlWhere ORDER BY created_at DESC, id DESC
                     LIMIT $perPage OFFSET " . (($page - 1) * $perPage));
$st->execute($args);
$rows = array_map(fn($r) => ['id' => (int)$r['id']] + $r, $st->fetchAll());

json_out(200, [
    'ok' => true,
    'rows' => $rows,
    'counts' => $counts,
    'total' => $total,
    'page' => $page,
    'pages' => $pages,
    'per_page' => $perPage,
]);
