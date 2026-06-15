<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Stock extends Model
{
    use HasUuids;

    protected $fillable = [
        'product_id',
        'warehouse_id',
        'quantite',
        'reserve',
    ];

    protected $casts = [
        'quantite'   => 'integer',
        'reserve'    => 'integer',
        'disponible' => 'integer',
    ];

    // Relations
    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function warehouse()
    {
        return $this->belongsTo(Warehouse::class);
    }

    public function movements()
    {
        return $this->hasMany(StockMovement::class, 'product_id', 'product_id');
    }

    // Scope — stocks en alerte (disponible ≤ stock_minimum du produit)
    public function scopeEnAlerte($query)
    {
        return $query->whereColumn('disponible', '<=', 'products.stock_minimum')
                 ->join('products', 'stocks.product_id', '=', 'products.id');
    }

    // Scope — filtrer par entrepôt
    public function scopeParEntrepot($query, $warehouseId)
    {
        return $query->where('warehouse_id', $warehouseId);
    }
}