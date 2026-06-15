<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Warehouse extends Model
{
    use HasUuids;

    protected $fillable = [
        'nom',
        'code',
        'adresse',
        'responsable',
        'telephone',
        'actif',
    ];

    protected $casts = [
        'actif' => 'boolean',
    ];

    // Relations
    public function stocks()
    {
        return $this->hasMany(Stock::class);
    }

    public function transfersSource()
    {
        return $this->hasMany(Transfer::class, 'source_warehouse_id');
    }

    public function transfersDest()
    {
        return $this->hasMany(Transfer::class, 'dest_warehouse_id');
    }

    public function inventories()
    {
        return $this->hasMany(Inventory::class);
    }


    // Scope — entrepôts actifs seulement
    public function scopeActif($query)
    {
        return $query->where('actif', true);
    }
}