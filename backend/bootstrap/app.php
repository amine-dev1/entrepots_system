<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->alias([
            'checkrole'        => \App\Http\Middleware\CheckRole::class,
            'role'             => \Spatie\Permission\Middleware\RoleMiddleware::class,
            'permission'       => \Spatie\Permission\Middleware\PermissionMiddleware::class,
            'role_or_permission' => \Spatie\Permission\Middleware\RoleOrPermissionMiddleware::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        // Business-rule violations from the service layer → 422 (Unprocessable).
        // Covers InsufficientStockException, invalid transfer transitions and
        // invalid inventory state changes (all thrown as RuntimeException),
        // plus InvalidArgumentException (e.g. non-positive quantity).
        //
        // NB: Symfony's HttpException (thrown by abort(401/403/404/...)) also
        // extends \RuntimeException, so we let those through unchanged to keep
        // their real HTTP status (e.g. CheckRole → 403, model binding → 404).
        $exceptions->render(function (\RuntimeException $e, $request) {
            if ($e instanceof \Symfony\Component\HttpKernel\Exception\HttpExceptionInterface) {
                return null;
            }
            if ($request->is('api/*') || $request->expectsJson()) {
                return response()->json(['message' => $e->getMessage()], 422);
            }
        });

        $exceptions->render(function (\InvalidArgumentException $e, $request) {
            if ($request->is('api/*') || $request->expectsJson()) {
                return response()->json(['message' => $e->getMessage()], 422);
            }
        });
    })->create();
