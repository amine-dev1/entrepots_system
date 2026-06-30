<?php

namespace App\Models;
use Laravel\Sanctum\HasApiTokens;
use Spatie\Permission\Traits\HasRoles;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, HasRoles, HasUuids, HasApiTokens;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'nom',
        'prenom',
        'email',
        'password',
        'telephone',
        'actif',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'actif' => 'boolean',
        ];
    }

    /**
     * Entrepôts affectés à l'utilisateur (périmètre de données).
     */
    public function warehouses()
    {
        return $this->belongsToMany(Warehouse::class, 'user_warehouse');
    }

    /**
     * L'utilisateur est-il restreint à certains entrepôts ?
     * L'administrateur n'est jamais restreint ; aucune affectation = accès total.
     */
    public function isWarehouseScoped(): bool
    {
        if ($this->hasRole('administrateur')) {
            return false;
        }
        return $this->warehouses()->exists();
    }

    /**
     * IDs des entrepôts autorisés, ou null si l'utilisateur n'est pas restreint.
     */
    public function allowedWarehouseIds(): ?array
    {
        if (! $this->isWarehouseScoped()) {
            return null;
        }
        return $this->warehouses()->pluck('warehouses.id')->all();
    }

    /**
     * L'utilisateur peut-il accéder à cet entrepôt ?
     */
    public function canAccessWarehouse(?string $warehouseId): bool
    {
        $allowed = $this->allowedWarehouseIds();
        return $allowed === null || in_array($warehouseId, $allowed, true);
    }
}
