<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Transfer extends Model
{
    use HasUuids;

    protected $fillable = [
        'reference',
        'source_warehouse_id',
        'dest_warehouse_id',
        'statut',
        'created_by',
        'validated_by',
        'received_by',
        'validated_at',
        'received_at',
        'note',
    ];

    protected $casts = [
        'validated_at' => 'datetime',
        'received_at'  => 'datetime',
    ];

    // Relations
    public function sourceWarehouse()
    {
        return $this->belongsTo(Warehouse::class, 'source_warehouse_id');
    }

    public function destWarehouse()
    {
        return $this->belongsTo(Warehouse::class, 'dest_warehouse_id');
    }

    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function validatedBy()
    {
        return $this->belongsTo(User::class, 'validated_by');
    }

    public function receivedBy()
    {
        return $this->belongsTo(User::class, 'received_by');
    }

    public function items()
    {
        return $this->hasMany(TransferItem::class);
    }

    public function movements()
    {
        return $this->hasMany(StockMovement::class);
    }
}