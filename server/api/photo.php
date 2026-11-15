<?php
/** GET ?id=1 → the participant's photo, for signed-in admins only. */
declare(strict_types=1);
require dirname(__DIR__) . '/bootstrap.php';

method('GET');
require_staff();

$st = db()->prepare('SELECT photo_path FROM participants WHERE id = ?');
$st->execute([(int)($_GET['id'] ?? 0)]);
$name = basename((string)$st->fetchColumn());
$file = dirname(__DIR__) . '/storage/photos/' . $name;

if ($name === '' || !is_file($file)) {
    http_response_code(404);
    exit;
}
header('Content-Type: ' . (new finfo(FILEINFO_MIME_TYPE))->file($file));
header('Cache-Control: private, max-age=86400');
readfile($file);
