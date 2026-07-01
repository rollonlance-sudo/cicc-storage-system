<?php

/**
 * Vercel serverless entrypoint for the CICC Storage System (Laravel).
 *
 * Serverless filesystems are read-only except /tmp, so this entrypoint:
 *  - supplies self-contained demo defaults (works with zero env config),
 *  - relocates Laravel's writable storage and compiled caches to /tmp,
 *  - seeds a fresh SQLite database from the bundled demo copy on cold start.
 * Any variable already set in the Vercel project environment takes precedence.
 */

$defaults = [
    'APP_NAME' => 'CICC Storage System',
    'APP_ENV' => 'production',
    'APP_DEBUG' => 'false',
    'APP_KEY' => 'base64:8OITcfJG937RyZuCVUi5gYxDakvXPE5uwryALO7/Y6g=',
    'APP_URL' => 'https://cicc-storage-system-six.vercel.app',
    'LOG_CHANNEL' => 'stderr',
    'DB_CONNECTION' => 'sqlite',
    'DB_DATABASE' => '/tmp/database.sqlite',
    'SESSION_DRIVER' => 'cookie',
    'CACHE_STORE' => 'array',
    'QUEUE_CONNECTION' => 'sync',
    'FILESYSTEM_DISK' => 'local',
    'BCRYPT_ROUNDS' => '10',
    // Read-only bootstrap/cache on serverless — relocate compiled caches to /tmp.
    'APP_SERVICES_CACHE' => '/tmp/cache/services.php',
    'APP_PACKAGES_CACHE' => '/tmp/cache/packages.php',
    'APP_CONFIG_CACHE' => '/tmp/cache/config.php',
    'APP_ROUTES_CACHE' => '/tmp/cache/routes.php',
    'APP_EVENTS_CACHE' => '/tmp/cache/events.php',
];
foreach ($defaults as $k => $v) {
    if (getenv($k) === false && ! isset($_ENV[$k]) && ! isset($_SERVER[$k])) {
        putenv("$k=$v");
        $_ENV[$k] = $v;
        $_SERVER[$k] = $v;
    }
}

$storage = '/tmp/storage';
foreach ([
    '/tmp/cache',
    $storage.'/app/public',
    $storage.'/framework/cache/data',
    $storage.'/framework/sessions',
    $storage.'/framework/testing',
    $storage.'/framework/views',
    $storage.'/logs',
] as $dir) {
    if (! is_dir($dir)) {
        @mkdir($dir, 0755, true);
    }
}

$demo = __DIR__.'/../database/demo.sqlite';
$live = '/tmp/database.sqlite';
if (! file_exists($live) && file_exists($demo)) {
    @copy($demo, $live);
}

require __DIR__.'/../public/index.php';
