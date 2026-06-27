<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use Illuminate\Http\Request;

class ActivityLogController extends Controller
{
    /**
     * GET /api/activity-logs
     * Liste l'historique d'activité avec filtres optionnels.
     */
    public function index(Request $request)
    {
        // On charge la relation 'user' pour avoir l'identité (nom, prénom) dans le frontend
        $query = ActivityLog::with('user')->orderByDesc('created_at');

        // Filtre par type d'action (ex: creation, modification, suppression...)
        if ($request->filled('action')) {
            $query->where('action', $request->query('action'));
        }

        // Filtre par utilisateur responsable de l'action
        if ($request->filled('user_id')) {
            $query->where('user_id', $request->query('user_id'));
        }

        // Filtre par date de début (inclus)
        if ($request->filled('date_debut')) {
            $query->whereDate('created_at', '>=', $request->query('date_debut'));
        }

        // Filtre par date de fin (inclus)
        if ($request->filled('date_fin')) {
            $query->whereDate('created_at', '<=', $request->query('date_fin'));
        }

        // Pagination pour ne pas surcharger la réponse (ex: 50 par page)
        $logs = $query->paginate((int) $request->query('per_page', 50));

        // Laravel formate automatiquement le paginator en JSON (avec { data: [...], meta: ... })
        // Ce format est géré par la ligne `setLogs(Array.isArray(data) ? data : data.data ?? [])` côté React.
        return response()->json($logs);
    }
}