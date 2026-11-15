<?php
/**
 * GET ?status=interested|registered|deleted&q=search&page=1
 *   → { rows, counts: { all, interested, registered, deleted }, total, page, pages }
 * Soft-deleted rows only show under status=deleted.
 */
declare(strict_types=1);
require dirname(__DIR__) . '/bootstrap.php';

method('GET');
$user = require_staff();

$status = in_array($_GET['status'] ?? '', [...STATUSES, 'deleted'], true) ? $_GET['status'] : '';
if ($status === 'deleted' && $user['role'] !== 'superadmin') json_out(403, ['ok' => false, 'error' => 'Only a superadmin can view deleted participants']);
$q = trim((string)($_GET['q'] ?? ''));
$page = max(1, (int)($_GET['page'] ?? 1));
$perPage = 25;

$counts = ['all' => 0, 'interested' => 0, 'registered' => 0, 'deleted' => 0];
foreach (db()->query('SELECT status, deleted_at IS NOT NULL AS gone, COUNT(*) n FROM participants GROUP BY status, gone') as $r) {
    if ($r['gone']) {
        $counts['deleted'] += (int)$r['n'];
        continue;
    }
    $counts[$r['status']] = (int)$r['n'];
    $counts['all'] += (int)$r['n'];
}

$where = [];
$args = [];
if ($status === 'deleted') {
    $where[] = 'deleted_at IS NOT NULL';
} else {
    $where[] = 'deleted_at IS NULL';
    if ($status) {
        $where[] = 'status = ?';
        $args[] = $status;
    }
}
if ($q !== '') {
    $where[] = '(full_name LIKE ? OR email LIKE ? OR phone LIKE ? OR organization LIKE ?)';
    array_push($args, ...array_fill(0, 4, '%' . $q . '%'));
}
$sqlWhere = $where ? 'WHERE ' . implode(' AND ', $where) : '';

$st = db()->prepare("SELECT COUNT(*) FROM participants $sqlWhere");
$st->execute($args);
$total = (int)$st->fetchColumn();
$pages = max(1, (int)ceil($total / $perPage));
$page = min($page, $pages);

$st = db()->prepare("SELECT id, full_name, email, phone, city, role, organization, status, photo_path, created_at, deleted_at
                     FROM participants $sqlWhere ORDER BY created_at DESC, id DESC
                     LIMIT $perPage OFFSET " . (($page - 1) * $perPage));
$st->execute($args);

json_out(200, [
    'ok' => true,
    'rows' => array_map('fmt_participant', $st->fetchAll()),
    'counts' => $user['role'] === 'superadmin' ? $counts : [...$counts, 'deleted' => 0],
    'total' => $total,
    'page' => $page,
    'pages' => $pages,
    'per_page' => $perPage,
]);
