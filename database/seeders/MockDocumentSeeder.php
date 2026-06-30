<?php

namespace Database\Seeders;

use App\Models\Department;
use App\Models\Document;
use App\Models\DocumentType;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;

/**
 * Generates believable sample document (paper) records for every document type,
 * so the dashboard and per-type pages have data to show. Idempotent: skips if
 * documents already exist.
 */
class MockDocumentSeeder extends Seeder
{
    /** Categories (by keyword) whose papers carry a peso amount. */
    private const FINANCIAL_KEYWORDS = ['Procurement', 'Accounting', 'Payment', 'Financial', 'Budget'];

    /** Weighted status distribution (more finished than draft). */
    private const STATUS_WEIGHTS = [
        'completed' => 6, 'approved' => 5, 'released' => 5, 'received' => 4,
        'for_review' => 3, 'for_approval' => 3, 'pending' => 3, 'draft' => 2,
        'returned' => 1, 'cancelled' => 1,
    ];

    private const PRIORITY_WEIGHTS = [
        'normal' => 6, 'low' => 3, 'high' => 4, 'urgent' => 2, 'critical' => 1,
    ];

    private const CLASSIFICATION_WEIGHTS = [
        'internal' => 6, 'public' => 4, 'confidential' => 3, 'restricted' => 1, 'highly_confidential' => 1,
    ];

    private const TAG_POOL = ['fy2026', 'urgent', 'procurement', 'audit', 'budget', 'hr', 'travel', 'infra', 'compliance'];

    private const SUBJECTS = [
        'Regional Office', 'Provincial Office', 'IT Division', 'Finance Section',
        'HR Unit', 'Admin Division', 'Field Operations', 'Records Section',
        'Procurement Unit', 'Planning Office', 'Internal Audit', 'Legal Division',
    ];

    public function run(): void
    {
        if (Document::count() > 0) {
            return;
        }

        $statusPool = $this->pool(self::STATUS_WEIGHTS);
        $priorityPool = $this->pool(self::PRIORITY_WEIGHTS);
        $classPool = $this->pool(self::CLASSIFICATION_WEIGHTS);
        $departmentIds = Department::pluck('id')->all();
        $year = Carbon::now()->format('Y');

        DocumentType::query()->orderBy('id')->each(function (DocumentType $type) use ($statusPool, $priorityPool, $classPool, $departmentIds, $year) {
            $isFinancial = $this->isFinancial($type->category?->name ?? '');
            $count = random_int(6, 28);

            for ($i = 1; $i <= $count; $i++) {
                $date = Carbon::now()->subDays(random_int(0, 360));

                Document::create([
                    'tracking_no' => sprintf('CICC-%s-%s-%04d', $year, $type->code, $i),
                    'document_type_id' => $type->id,
                    'department_id' => $departmentIds ? $departmentIds[array_rand($departmentIds)] : null,
                    'reference_no' => sprintf('%s-%s-%04d', $type->code, $date->format('Y'), $i),
                    'title' => $type->name.' — '.fake()->randomElement(self::SUBJECTS),
                    'description' => fake()->boolean(70) ? fake()->sentence(12) : null,
                    'status' => $statusPool[array_rand($statusPool)],
                    'classification' => $classPool[array_rand($classPool)],
                    'priority' => $priorityPool[array_rand($priorityPool)],
                    'tags' => fake()->randomElements(self::TAG_POOL, random_int(0, 3)),
                    'document_date' => $date,
                    'amount' => $isFinancial ? fake()->randomFloat(2, 2500, 750000) : null,
                    'prepared_by' => fake()->name(),
                ]);
            }
        });
    }

    private function isFinancial(string $categoryName): bool
    {
        foreach (self::FINANCIAL_KEYWORDS as $kw) {
            if (str_contains($categoryName, $kw)) {
                return true;
            }
        }

        return false;
    }

    /**
     * @param  array<string,int>  $weights
     * @return list<string>
     */
    private function pool(array $weights): array
    {
        $pool = [];
        foreach ($weights as $key => $weight) {
            $pool = array_merge($pool, array_fill(0, $weight, $key));
        }

        return $pool;
    }
}
