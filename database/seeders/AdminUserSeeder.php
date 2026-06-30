<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

/**
 * Seeds the initial internal accounts. Public self-registration is disabled,
 * so these are the entry points into the system.
 *
 * Default password for every seeded account: "password"
 */
class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        $accounts = [
            ['System Administrator', 'admin@storagesystem.test', 'admin'],
            ['Records Manager', 'manager@storagesystem.test', 'manager'],
            ['Staff User', 'staff@storagesystem.test', 'staff'],
        ];

        foreach ($accounts as [$name, $email, $role]) {
            $user = User::updateOrCreate(
                ['email' => $email],
                [
                    'name' => $name,
                    'password' => Hash::make('password'),
                    'email_verified_at' => now(),
                ],
            );

            $user->syncRoles([$role]);
        }
    }
}
