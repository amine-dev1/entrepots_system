<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class InventoryItem extends Model
{
    use HasUuids;

    protected $fillable = [
        'inventory_id',
        'product_id',
        'qte_theorique',
        'qte_reelle',
    ];

    protected $casts = [
        'qte_theorique' => 'integer',
        'qte_reelle'    => 'integer',
        'ecart'         => 'integer',
    ];

    // Relations
    public function inventory()
    {
        return $this->belongsTo(Inventory::class);
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}