<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Product extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'categorie_id',
        'sku',
        'code_barre',
        'nom',
        'description',
        'prix_achat',
        'prix_vente',
        'stock_minimum',
        'image',
        'actif',
    ];

    protected $casts = [
        'prix_achat'    => 'decimal:2',
        'prix_vente'    => 'decimal:2',
        'stock_minimum' => 'integer',
        'actif'         => 'boolean',
    ];

    protected $appends = ['image_url'];

    public function getImageUrlAttribute()
    {
        if (!$this->image) return null;
        // Storage::url returns '/storage/...', url() converts to absolute URL using app.url
        try {
            return url(Storage::url($this->image));
        } catch (\Throwable $e) {
            return Storage::url($this->image);
        }
    }

    // Relations
    public function category()
    {
        return $this->belongsTo(Category::class, 'categorie_id');
    }

    public function stocks()
    {
        return $this->hasMany(Stock::class);
    }

    public function movements()
    {
        return $this->hasMany(StockMovement::class);
    }

    // Scope — produits actifs seulement
    public function scopeActif($query)
    {
    return $query->where('actif', true);
    }
}