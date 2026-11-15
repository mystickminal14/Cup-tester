<?php
/**
 * Router for PHP's built-in dev server, which ignores .htaccess:
 *   php -S localhost:8080 -t server server/router.php
 * Blocks the same files .htaccess blocks on Apache.
 */
$path = rawurldecode(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH) ?? '/');
if (preg_match('#(^|/)\.|^/storage/|^/(bootstrap|layout|setup|router)\.php$|\.(sql|md|example)$#', $path)) {
    http_response_code(404);
    exit('Not found');
}
return false;
