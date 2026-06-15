<?php

namespace Database\Factories;

use App\Models\User;
use App\Models\Warehouse;
use Illuminate\Database\Eloquent\Factories\Factory;

class TransferFactory extends Factory
{
    public function definition(): array
    {
        return [
            'reference'           => 'TRF-' . fake()->unique()->numerify('2026-######'),
            'source_warehouse_id' => Warehouse::factory(),
            'dest_warehouse_id'   => Warehouse::factory(),
            'statut'              => fake()->randomElement([
                'brouillon', 'en_attente', 'valide', 'recu', 'annule'
            ]),
            'created_by'          => User::factory(),
            'validated_by'        => null,
            'received_by'         => null,
            'validated_at'        => null,
            'received_at'         => null,
            'note'                => fake()->sentence(),
        ];
    }
}