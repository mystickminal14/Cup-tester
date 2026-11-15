<?php
/**
 * GET                    → { user | null, csrf }
 * POST { action: login, login (email or username), password }
 * POST { action: logout }
 */
declare(strict_types=1);
require dirname(__DIR__) . '/bootstrap.php';

if (method('GET', 'POST') === 'GET') {
    json_out(200, ['ok' => true, 'user' => current_user(), 'csrf' => csrf_token()]);
}

if (!origin_allowed()) json_out(403, ['ok' => false, 'error' => 'Origin not allowed']);
check_csrf();
$in = json_body();

if (($in['action'] ?? '') === 'logout') {
    $_SESSION = [];
    session_destroy();
    json_out(200, ['ok' => true]);
}

if (($in['action'] ?? '') !== 'login') json_out(400, ['ok' => false, 'error' => 'Unknown action']);

// Throttle: 5 failed attempts per minute per session.
$_SESSION['fails'] = array_values(array_filter($_SESSION['fails'] ?? [], fn($t) => $t > time() - 60));
if (count($_SESSION['fails']) >= 5) json_out(429, ['ok' => false, 'error' => 'Too many attempts. Wait a minute and try again.']);

// "login" may be an email or a username.
$login = strtolower(trim((string)($in['login'] ?? $in['email'] ?? '')));
$st = db()->prepare('SELECT id, password_hash, role FROM users WHERE email = ? OR username = ? LIMIT 1');
$st->execute([$login, $login]);
$u = $st->fetch();

if (!$u || !in_array($u['role'], ROLES, true) || !password_verify((string)($in['password'] ?? ''), $u['password_hash'])) {
    $_SESSION['fails'][] = time();
    json_out(401, ['ok' => false, 'error' => 'Wrong username/email or password.']);
}

session_regenerate_id(true);
$_SESSION['uid'] = (int)$u['id'];
$_SESSION['csrf'] = bin2hex(random_bytes(32));
unset($_SESSION['fails']);
db()->prepare('UPDATE users SET last_login_at = NOW() WHERE id = ?')->execute([$u['id']]);

json_out(200, ['ok' => true, 'user' => current_user(), 'csrf' => csrf_token()]);
