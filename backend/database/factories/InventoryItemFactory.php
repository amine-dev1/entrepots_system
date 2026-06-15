<?php

namespace Database\Factories;

use App\Models\Inventory;
use App\Models\Product;
use Illuminate\Database\Eloquent\Factories\Factory;

class InventoryItemFactory extends Factory
{
    public function definition(): array
    {
        $qteTheorique = fake()->numberBetween(0, 100);
        $qteReelle    = fake()->numberBetween(0, 100);

        return [
            'inventory_id'  => Inventory::factory(),
            'product_id'    => Product::factory(),
            'qte_theorique' => $qteTheorique,
            'qte_reelle'    => $qteReelle,
        ];
    }
}