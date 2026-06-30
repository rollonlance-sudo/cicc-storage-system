<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database with the role/permission catalogue,
     * the internal login accounts, and the standard document/paper types.
     */
    public function run(): void
    {
        $this->call([
            RolesAndPermissionsSeeder::class,
            AdminUserSeeder::class,
            DepartmentSeeder::class,
            DocumentTypeSeeder::class,
            MockDocumentSeeder::class,
        ]);
    }
}
