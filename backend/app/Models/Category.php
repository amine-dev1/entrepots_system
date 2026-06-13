<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Category extends Model
{
    use HasUuids;

    protected $fillable = [
        'nom',
        'description',
    ];

    // Relations
    public function products()
    {
        return $this->hasMany(Product::class, 'categorie_id');
    }
}