<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class CategoryFactory extends Factory
{
    public function definition(): array
    {
        return [
            'nom'         => fake()->unique()->word(),
            'description' => fake()->sentence(),
        ];
    }
}