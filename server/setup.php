<?php
/**
 * One-time setup, run from the terminal (never from the browser):
 *
 *   php setup.php                              → create / update the tables
 *   php setup.php admin@example.com 'pw' 'Name'  → create / reset a superadmin by email
 *   php setup.php admin 'pw' 'Name'              → … or by username
 *   php setup.php staff@example.com 'pw' 'Name' admin → create / reset an admin (no delete rights)
 */
declare(strict_types=1);

if (PHP_SAPI !== 'cli') {
    http_response_code(404);
    exit;
}

require __DIR__ . '/bootstrap.php';

$sql = file_get_contents(__DIR__ . '/schema.sql');
foreach (array_filter(array_map('trim', explode(';', preg_replace('/^--.*$/m', '', $sql)))) as $stmt) {
    db()->exec($stmt);
}
// Upgrade databases created before usernames / soft delete existed.
// (Checked via information_schema so it works on MySQL as well as MariaDB.)
$has = function (string $table, string $col): bool {
    $st = db()->prepare('SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?');
    $st->execute([$table, $col]);
    return (bool)$st->fetchColumn();
};
if (!$has('users', 'username')) {
    db()->exec('ALTER TABLE users ADD COLUMN username VARCHAR(60) NULL UNIQUE AFTER name, MODIFY email VARCHAR(190) NULL');
}
if (!$has('participants', 'deleted_at')) {
    db()->exec('ALTER TABLE participants ADD COLUMN deleted_at DATETIME NULL AFTER status_changed_at,
                ADD COLUMN deleted_by INT UNSIGNED NULL AFTER deleted_at, ADD INDEX idx_deleted (deleted_at)');
}
if (!$has('participants', 'tshirt_size')) {
    db()->exec('ALTER TABLE participants ADD COLUMN tshirt_size VARCHAR(20) NULL AFTER heard_from,
                ADD COLUMN bio TEXT NULL AFTER tshirt_size,
                ADD COLUMN press_consent TINYINT(1) NOT NULL DEFAULT 0 AFTER bio');
}
if (!$has('participants', 'payment_token')) {
    db()->exec('ALTER TABLE participants ADD COLUMN payment_token CHAR(64) NULL AFTER press_consent,
                ADD COLUMN payment_confirmed_at DATETIME NULL AFTER payment_token');
}
// The sponsor form no longer asks what they're interested in.
db()->exec('ALTER TABLE sponsor_inquiries MODIFY interest VARCHAR(60) NULL');
// Add the `admin` role to databases created when only `superadmin` existed.
db()->exec("ALTER TABLE users MODIFY role ENUM('superadmin','admin') NOT NULL DEFAULT 'admin'");
echo "✓ Tables ready\n";

[, $login, $password, $name, $role] = $argv + [null, null, null, 'Super Admin', 'superadmin'];
if (!in_array($role, ROLES, true)) exit("✗ Role must be superadmin or admin\n");
if ($login) {
    if (strlen((string)$password) < 8) exit("✗ Password must be at least 8 characters\n");
    $login = strtolower($login);
    $isEmail = str_contains($login, '@');
    if ($isEmail && !filter_var($login, FILTER_VALIDATE_EMAIL)) exit("✗ Invalid email\n");
    if (!$isEmail && !preg_match('/^[a-z0-9._-]{3,60}$/', $login)) exit("✗ Username: 3–60 letters, numbers, . _ -\n");
    $col = $isEmail ? 'email' : 'username';
    db()->prepare(
        "INSERT INTO users (name, $col, password_hash, role) VALUES (?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash), role = VALUES(role)"
    )->execute([$name, $login, password_hash($password, PASSWORD_DEFAULT), $role]);
    echo "✓ " . ucfirst($role) . " {$login} ready\n";
}
