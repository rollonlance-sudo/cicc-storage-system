<?php

/**
 * Vercel serverless entrypoint for the CICC Storage System (Laravel).
 * Includes a temporary diagnostic wrapper that surfaces fatals/exceptions
 * directly (serverless logs aren't reachable from the build tooling).
 */

ini_set('display_errors', '1');
error_reporting(E_ALL);
register_shutdown_function(function () {
    $e = error_get_last();
    if ($e && in_array($e['type'], [E_ERROR, E_PARSE, E_CORE_ERROR, E_COMPILE_ERROR], true)) {
        if (! headers_sent()) {
            http_response_code(500);
            header('Content-Type: text/plain');
        }
        echo "FATAL: {$e['message']}\n  at {$e['file']}:{$e['line']}\n";
    }
});

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

$demo = __DIR__.'/../database/demo.sqlite';
$live = '/tmp/database.sqlite';
if (! file_exists($live) && file_exists($demo)) {
    @copy($demo, $live);
}

try {
    require __DIR__.'/../public/index.php';
} catch (\Throwable $ex) {
    if (! headers_sent()) {
        http_response_code(500);
        header('Content-Type: text/plain');
    }
    echo 'EXCEPTION: '.get_class($ex).': '.$ex->getMessage()."\n";
    echo '  at '.$ex->getFile().':'.$ex->getLine()."\n\n";
    echo $ex->getTraceAsString()."\n";
}
