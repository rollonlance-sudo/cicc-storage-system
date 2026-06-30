<?php

namespace Database\Factories;

use App\Models\Department;
use App\Models\Document;
use App\Models\DocumentType;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Document>
 */
class DocumentFactory extends Factory
{
    protected $model = Document::class;

    public function definition(): array
    {
        $date = fake()->dateTimeBetween('-10 months', 'now');

        return [
            'tracking_no' => strtoupper(fake()->unique()->bothify('TRK-####-#####')),
            'document_type_id' => DocumentType::factory(),
            'department_id' => Department::factory(),
            'reference_no' => strtoupper(fake()->bothify('REF-####-????')),
            'title' => rtrim(fake()->sentence(4), '.'),
            'description' => fake()->boolean(70) ? fake()->sentence(12) : null,
            'status' => fake()->randomElement(Document::STATUSES),
            'classification' => fake()->randomElement(Document::CLASSIFICATIONS),
            'priority' => fake()->randomElement(Document::PRIORITIES),
            'tags' => fake()->randomElements(['urgent', 'fy2026', 'procurement', 'audit', 'budget', 'hr'], fake()->numberBetween(0, 3)),
            'document_date' => $date,
            'amount' => fake()->boolean(40) ? fake()->randomFloat(2, 1000, 500000) : null,
            'prepared_by' => fake()->name(),
        ];
    }
}
