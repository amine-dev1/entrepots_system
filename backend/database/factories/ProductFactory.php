<?php

namespace Database\Factories;

use App\Models\Category;
use Illuminate\Database\Eloquent\Factories\Factory;

class ProductFactory extends Factory
{
    public function definition(): array
    {
        return [
            'categorie_id'  => Category::factory(),
            'sku'           => fake()->unique()->bothify('SKU-####-???'),
            'code_barre'    => fake()->unique()->ean13(),
            'nom'           => fake()->words(3, true),
            'description'   => fake()->sentence(),
            'prix_achat'    => fake()->randomFloat(2, 10, 1000),
            'prix_vente'    => fake()->randomFloat(2, 20, 2000),
            'stock_minimum' => fake()->numberBetween(1, 20),
            'actif'         => true,
        ];
    }
}