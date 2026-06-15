<?php

namespace Database\Factories;

use App\Models\Product;
use App\Models\Warehouse;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class StockMovementFactory extends Factory
{
    public function definition(): array
    {
        return [
            'reference'    => 'MVT-' . fake()->unique()->numerify('2026-######'),
            'type'         => fake()->randomElement([
                'achat', 'retour_fournisseur', 'ajustement_entree',
                'vente', 'consommation', 'perte', 'ajustement_sortie',
                'transfert_sortie', 'transfert_entree'
            ]),
            'quantite'     => fake()->numberBetween(1, 100),
            'product_id'   => Product::factory(),
            'warehouse_id' => Warehouse::factory(),
            'user_id'      => User::factory(),
            'transfer_id'  => null,
            'motif'        => fake()->sentence(),
            'created_at'   => fake()->dateTimeBetween('-1 year', 'now'),
        ];
    }
}