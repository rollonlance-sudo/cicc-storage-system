<?php

/**
 * Vercel serverless entrypoint for the CICC Storage System (Laravel).
 *
 * Vercel's filesystem is read-only except for /tmp, so Laravel's writable
 * storage is redirected to /tmp/storage (see bootstrap/app.php). The runtime
 * directories are created here on each cold start before the framework boots.
 */

/*
 * Self-configuring demo defaults. On Vercel there is no .env file, so provide
 * safe defaults for a self-contained SQLite demo. Any value already set in the
 * Vercel project environment takes precedence (except APP_DEBUG, forced on here
 * temporarily for diagnosis).
 */
$defaults = [
    'APP_NAME' => 'CICC Storage System',
    'APP_ENV' => 'production',
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
];
foreach ($defaults as $k => $v) {
    if (getenv($k) === false && ! isset($_ENV[$k]) && ! isset($_SERVER[$k])) {
        putenv("$k=$v");
        $_ENV[$k] = $v;
        $_SERVER[$k] = $v;
    }
}
// TEMP: surface boot errors while stabilizing the deploy.
putenv('APP_DEBUG=true');
$_ENV['APP_DEBUG'] = $_SERVER['APP_DEBUG'] = 'true';

$storage = '/tmp/storage';
foreach ([
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

/*
 * Self-contained demo database: on a read-only serverless filesystem, copy the
 * bundled, pre-seeded SQLite file into the writable /tmp on cold start. Set
 * DB_CONNECTION=sqlite and DB_DATABASE=/tmp/database.sqlite in the Vercel env.
 * Writes work per-instance and reset on the next cold start (fine for a demo).
 */
$demo = __DIR__.'/../database/demo.sqlite';
$live = '/tmp/database.sqlite';
if (! file_exists($live) && file_exists($demo)) {
    @copy($demo, $live);
}

require __DIR__.'/../public/index.php';
