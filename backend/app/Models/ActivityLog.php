<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class ActivityLog extends Model
{
    use HasFactory, HasUuids;

    // Pas de updated_at nécessaire pour un journal immuable
    const UPDATED_AT = null;

    protected $fillable = [
        'user_id',
        'action',       // 'creation', 'modification', 'suppression', etc.
        'description',  // Ex: "Création du produit Chaise en bois"
        'target_type',  // App\Models\Product (polymorphique)
        'target_id',    // ID du produit
        'payload',      // (Optionnel) Tableau JSON des anciennes/nouvelles valeurs
        'ip_address',   // (Optionnel)
    ];


    protected $casts = [
        // Bug fix: default to empty array when null to avoid null-merge errors
        'payload' => 'array',
        'created_at' => 'datetime',
    ];

    protected $attributes = [
        'payload' => null,
    ];


    /**
     * L'utilisateur qui a déclenché l'action.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * L'entité cible (Produit, Entrepôt, Transfert, etc.)
     * Permet d'utiliser $log->target pour récupérer le modèle associé.
     */
    public function target(): MorphTo
    {
        return $this->morphTo();
    }
}
