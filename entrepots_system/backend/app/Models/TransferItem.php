<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class TransferItem extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'transfer_id',
        'product_id',
        'quantite',
    ];

    protected $casts = [
        'quantite' => 'integer',
    ];

    // Relations
    public function transfer()
    {
        return $this->belongsTo(Transfer::class);
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}