<?php

namespace Database\Factories;

use App\Models\Department;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Department>
 */
class DepartmentFactory extends Factory
{
    protected $model = Department::class;

    public function definition(): array
    {
        return [
            'code' => strtoupper(fake()->unique()->lexify('????')),
            'name' => fake()->unique()->company().' Office',
            'head_of_office' => fake()->name(),
            'email' => fake()->safeEmail(),
            'contact_number' => fake()->numerify('(0##) ###-####'),
            'is_active' => true,
            'sort_order' => 0,
        ];
    }
}
