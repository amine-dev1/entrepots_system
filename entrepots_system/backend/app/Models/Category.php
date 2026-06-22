<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Category extends Model
{
    use HasFactory, HasUuids;

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