<?php

namespace Database\Factories;

use App\Models\Product;
use App\Models\Warehouse;
use Illuminate\Database\Eloquent\Factories\Factory;

class StockFactory extends Factory
{
    public function definition(): array
    {
        return [
            'product_id'   => Product::factory(),
            'warehouse_id' => Warehouse::factory(),
            'quantite'     => fake()->numberBetween(0, 200),
            'reserve'      => 0,
        ];
    }
}