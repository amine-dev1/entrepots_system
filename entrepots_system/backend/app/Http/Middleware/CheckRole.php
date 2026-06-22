<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckRole
{
    /**
     * Allow the request only if the authenticated user has at least one of the
     * given roles. Usage: ->middleware('checkrole:administrateur,gestionnaire')
     */
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();

        if (! $user) {
            abort(401, 'Non authentifié.');
        }

        if (! $user->hasAnyRole($roles)) {
            abort(403, "Accès refusé : rôle insuffisant.");
        }

        return $next($request);
    }
}
