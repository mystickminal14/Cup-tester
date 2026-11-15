<?php
declare(strict_types=1);

/* ── .env ─────────────────────────────────────────────────────────────────── */

function load_env(string $file): void
{
    if (!is_file($file)) {
        http_response_code(500);
        exit('Missing .env — copy .env.example to .env and fill it in.');
    }
    foreach (file($file, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) as $line) {
        $line = trim($line);
        if ($line === '' || $line[0] === '#' || !str_contains($line, '=')) continue;
        [$k, $v] = array_map('trim', explode('=', $line, 2));
        if (strlen($v) >= 2 && ($v[0] === '"' || $v[0] === "'") && $v[-1] === $v[0]) $v = substr($v, 1, -1);
        $_ENV[$k] = $v;
    }
}

function env(string $key, string $default = ''): string
{
    return $_ENV[$key] ?? $default;
}

load_env(__DIR__ . '/.env');

/* ── Database ─────────────────────────────────────────────────────────────── */

function db(): PDO
{
    static $pdo = null;
    if ($pdo === null) {
        $dsn = sprintf('mysql:host=%s;port=%s;dbname=%s;charset=utf8mb4', env('DB_HOST', '127.0.0.1'), env('DB_PORT', '3306'), env('DB_NAME'));
        $pdo = new PDO($dsn, env('DB_USER'), env('DB_PASS'), [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ]);
    }
    return $pdo;
}

/* ── Session & auth ───────────────────────────────────────────────────────── */

function start_session(): void
{
    if (session_status() === PHP_SESSION_ACTIVE) return;
    session_name('ctadmin');
    session_set_cookie_params([
        'path' => '/',
        'httponly' => true,
        'samesite' => 'Lax',
        'secure' => !empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off',
    ]);
    session_start();
}

function current_user(): ?array
{
    start_session();
    if (empty($_SESSION['uid'])) return null;
    $st = db()->prepare('SELECT id, name, username, email, role FROM users WHERE id = ?');
    $st->execute([$_SESSION['uid']]);
    $u = $st->fetch();
    if (!$u) return null;
    $u['id'] = (int)$u['id'];
    return $u;
}

const ROLES = ['superadmin', 'admin'];

/** Every admin endpoint calls this first. Admins and superadmins get in. */
function require_staff(): array
{
    $u = current_user();
    if (!$u || !in_array($u['role'], ROLES, true)) json_out(401, ['ok' => false, 'error' => 'Not signed in']);
    return $u;
}

/** Superadmin-only actions (delete, restore, the Deleted bin). */
function require_superadmin(): array
{
    $u = require_staff();
    if ($u['role'] !== 'superadmin') json_out(403, ['ok' => false, 'error' => 'Only a superadmin can do that']);
    return $u;
}

/* ── CSRF ─────────────────────────────────────────────────────────────────── */

function csrf_token(): string
{
    start_session();
    return $_SESSION['csrf'] ??= bin2hex(random_bytes(32));
}

/** State-changing admin requests must echo the session token in X-CSRF-Token. */
function check_csrf(): void
{
    if (!hash_equals(csrf_token(), (string)($_SERVER['HTTP_X_CSRF_TOKEN'] ?? ''))) {
        json_out(419, ['ok' => false, 'error' => 'Session expired, reload the page']);
    }
}

/** True when the request's Origin (if sent) is this host or listed in ALLOWED_ORIGINS. */
function origin_allowed(): bool
{
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
    if ($origin === '') return true;
    $o = parse_url($origin);
    $hostPort = ($o['host'] ?? '') . (isset($o['port']) ? ':' . $o['port'] : '');
    if ($hostPort === ($_SERVER['HTTP_HOST'] ?? '')) return true;
    return in_array($origin, array_filter(array_map('trim', explode(',', env('ALLOWED_ORIGINS')))), true);
}

/* ── JSON ─────────────────────────────────────────────────────────────────── */

function json_out(int $code, array $body): never
{
    http_response_code($code);
    header('Content-Type: application/json');
    header('Cache-Control: no-store');
    echo json_encode($body, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function json_body(): array
{
    $data = json_decode((string)file_get_contents('php://input'), true);
    return is_array($data) ? $data : [];
}

function method(string ...$allowed): string
{
    $m = $_SERVER['REQUEST_METHOD'];
    if (!in_array($m, $allowed, true)) json_out(405, ['ok' => false, 'error' => 'Method not allowed']);
    return $m;
}

/** Shape a participants row for the admin UI. */
function fmt_participant(array $p): array
{
    $p['id'] = (int)$p['id'];
    $p['photo_url'] = !empty($p['photo_path']) ? '/api/photo.php?id=' . $p['id'] : null;
    unset($p['photo_path'], $p['payment_token'], $p['ip_address'], $p['status_changed_by'], $p['deleted_by']);
    return $p;
}

const STATUSES = ['interested', 'registered'];
