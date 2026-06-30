<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

/**
 * Roles and the permission catalogue for the Storage System.
 *
 * - setting.manage  : create / edit / toggle / archive / restore document
 *                     types & categories (the General Setup section).
 * - setting.purge   : permanently (force) delete archived records. Reserved
 *                     for the System Administrator.
 * - document.manage : create / edit / archive / restore document (paper)
 *                     records in the Papers section.
 */
class RolesAndPermissionsSeeder extends Seeder
{
    public const PERMISSIONS = [
        'setting.manage',
        'setting.purge',
        'document.manage',
        'user.manage',
    ];

    public function run(): void
    {
        app(PermissionRegistrar::class)->forgetCachedPermissions();

        foreach (self::PERMISSIONS as $name) {
            Permission::findOrCreate($name, 'web');
        }

        // System Administrator — everything (also covered by the Gate::before bypass).
        Role::findOrCreate('admin', 'web')->syncPermissions(Permission::all());

        // Manager — manages General Setup + documents, but cannot permanently delete.
        Role::findOrCreate('manager', 'web')->syncPermissions(['setting.manage', 'document.manage']);

        // Staff — works documents (no General Setup access).
        Role::findOrCreate('staff', 'web')->syncPermissions(['document.manage']);

        app(PermissionRegistrar::class)->forgetCachedPermissions();
    }
}
