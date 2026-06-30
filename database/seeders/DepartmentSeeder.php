<?php

namespace Database\Seeders;

use App\Models\Department;
use Illuminate\Database\Seeder;

class DepartmentSeeder extends Seeder
{
    public function run(): void
    {
        $departments = [
            ['ORD', 'Office of the Regional Director', 'Atty. Maria Santos', 'ord@govfile.test', '(02) 8123-4501'],
            ['ADMIN', 'Administrative Division', 'Mr. Jose Dela Cruz', 'admin@govfile.test', '(02) 8123-4502'],
            ['FIN', 'Finance and Budget Division', 'Ms. Liza Reyes', 'finance@govfile.test', '(02) 8123-4503'],
            ['PROC', 'Procurement Unit', 'Engr. Paolo Ramos', 'procurement@govfile.test', '(02) 8123-4504'],
            ['HR', 'Human Resource Management', 'Ms. Grace Villanueva', 'hr@govfile.test', '(02) 8123-4505'],
            ['PLAN', 'Planning and Management Division', 'Mr. Daniel Cruz', 'planning@govfile.test', '(02) 8123-4506'],
            ['ICT', 'Information and Communications Technology', 'Engr. Karen Lim', 'ict@govfile.test', '(02) 8123-4507'],
            ['LEGAL', 'Legal Affairs Division', 'Atty. Ramon Bautista', 'legal@govfile.test', '(02) 8123-4508'],
            ['RECORDS', 'Records and Archives Section', 'Ms. Aileen Mercado', 'records@govfile.test', '(02) 8123-4509'],
            ['FIELD', 'Field Operations Office', 'Mr. Carlo Aquino', 'field@govfile.test', '(02) 8123-4510'],
        ];

        foreach ($departments as $i => [$code, $name, $head, $email, $contact]) {
            Department::updateOrCreate(
                ['code' => $code],
                [
                    'name' => $name,
                    'head_of_office' => $head,
                    'email' => $email,
                    'contact_number' => $contact,
                    'is_active' => true,
                    'sort_order' => $i + 1,
                ],
            );
        }
    }
}
