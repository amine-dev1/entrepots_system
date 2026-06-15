<?php

namespace Database\Factories;

use App\Models\Warehouse;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class InventoryFactory extends Factory
{
    public function definition(): array
    {
        return [
            'warehouse_id' => Warehouse::factory(),
            'user_id'      => User::factory(),
            'type'         => fake()->randomElement(['global', 'tournant']),
            'statut'       => fake()->randomElement(['en_cours', 'cloture', 'ajuste']),
            'started_at'   => fake()->dateTimeBetween('-1 month', 'now'),
            'closed_at'    => null,
        ];
    }
}