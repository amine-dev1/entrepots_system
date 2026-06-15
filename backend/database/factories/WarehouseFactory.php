<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class WarehouseFactory extends Factory
{
    public function definition(): array
    {
        return [
            'nom'          => fake()->city() . ' Entrepôt',
            'code'         => 'WH-' . fake()->unique()->bothify('???-##'),
            'adresse'      => fake()->address(),
            'responsable'  => fake()->name(),
            'telephone'    => fake()->phoneNumber(),
            'actif'        => true,
        ];
    }
}