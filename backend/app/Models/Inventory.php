<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Inventory extends Model
{
    use HasUuids;

    protected $fillable = [
        'warehouse_id',
        'user_id',
        'type',
        'statut',
        'started_at',
        'closed_at',
    ];

    protected $casts = [
        'started_at' => 'datetime',
        'closed_at'  => 'datetime',
    ];

    // Relations
    public function warehouse()
    {
        return $this->belongsTo(Warehouse::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function items()
    {
        return $this->hasMany(InventoryItem::class);
    }
}