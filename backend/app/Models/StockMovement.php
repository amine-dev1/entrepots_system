<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class StockMovement extends Model
{
    use HasUuids;

    public $timestamps = false;

    protected $fillable = [
        'reference',
        'type',
        'quantite',
        'product_id',
        'warehouse_id',
        'user_id',
        'transfer_id',
        'motif',
        'created_at',
    ];

    protected $casts = [
        'quantite'   => 'integer',
        'created_at' => 'datetime',
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

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function transfer()
    {
        return $this->belongsTo(Transfer::class);
    }
}