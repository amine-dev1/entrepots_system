<?php

namespace App\Services;

use App\Models\ActivityLog;

class ActivityLogger
{
    /**
     * Enregistre une nouvelle action dans l'historique.
     *
     * @param string $action (creation, modification, suppression, etc.)
     * @param string $description Message lisible
     * @param mixed|null $target L'objet concerné (Produit, Transfert, etc.)
     * @param array|null $payload Données additionnelles
     */
    public static function log(string $action, string $description, $target = null, ?array $payload = null): void
    {
        ActivityLog::create([
            'user_id'     => auth()->id(), // Utilisateur connecté
            'action'      => $action,
            'description' => $description,
            'target_type' => $target ? get_class($target) : null,
            'target_id'   => $target ? $target->id : null,
            'payload'     => $payload,
            'ip_address'  => request()->ip(),
        ]);
    }
}