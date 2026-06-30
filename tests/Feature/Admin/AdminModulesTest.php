<?php

namespace Tests\Feature\Admin;

use App\Models\Department;
use App\Models\User;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminModulesTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RolesAndPermissionsSeeder::class);
    }

    private function user(string $role): User
    {
        $u = User::factory()->create();
        $u->assignRole($role);

        return $u;
    }

    // ── Departments (setting.manage) ─────────────────────────────────────────
    public function test_departments_crud(): void
    {
        $admin = $this->user('admin');

        $this->actingAs($admin)->get(route('setup.departments.index'))->assertOk();

        $this->actingAs($admin)->post(route('setup.departments.store'), [
            'code' => 'TEST',
            'name' => 'Test Office',
            'is_active' => true,
            'sort_order' => 1,
        ])->assertRedirect();
        $this->assertDatabaseHas('departments', ['code' => 'TEST']);

        $dept = Department::where('code', 'TEST')->first();
        $this->actingAs($admin)->patch(route('setup.departments.update', $dept), [
            'code' => 'TEST',
            'name' => 'Renamed Office',
            'is_active' => true,
        ])->assertRedirect();
        $this->assertSame('Renamed Office', $dept->fresh()->name);

        $this->actingAs($admin)->delete(route('setup.departments.destroy', $dept))->assertRedirect();
        $this->assertSoftDeleted('departments', ['id' => $dept->id]);

        $this->actingAs($admin)->post(route('setup.departments.restore', $dept->id))->assertRedirect();
        $this->assertDatabaseHas('departments', ['id' => $dept->id, 'deleted_at' => null]);
    }

    public function test_staff_cannot_manage_departments(): void
    {
        $this->actingAs($this->user('staff'))->get(route('setup.departments.index'))->assertForbidden();
    }

    // ── User management (user.manage → admin only) ───────────────────────────
    public function test_only_admin_can_access_user_management(): void
    {
        $this->actingAs($this->user('staff'))->get(route('users.index'))->assertForbidden();
        $this->actingAs($this->user('manager'))->get(route('users.index'))->assertForbidden();
        $this->actingAs($this->user('admin'))->get(route('users.index'))->assertOk();
    }

    public function test_admin_can_create_and_update_user_with_role(): void
    {
        $admin = $this->user('admin');

        $this->actingAs($admin)->post(route('users.store'), [
            'name' => 'New Officer',
            'email' => 'officer@govfile.test',
            'role' => 'manager',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ])->assertRedirect();

        $user = User::where('email', 'officer@govfile.test')->first();
        $this->assertNotNull($user);
        $this->assertTrue($user->hasRole('manager'));

        $this->actingAs($admin)->patch(route('users.update', $user), [
            'name' => 'Senior Officer',
            'email' => 'officer@govfile.test',
            'role' => 'staff',
        ])->assertRedirect();
        $this->assertTrue($user->fresh()->hasRole('staff'));
    }

    public function test_admin_cannot_delete_self(): void
    {
        $admin = $this->user('admin');
        $this->actingAs($admin)->delete(route('users.destroy', $admin))->assertSessionHas('error');
        $this->assertDatabaseHas('users', ['id' => $admin->id]);
    }

    public function test_setup_landing_loads(): void
    {
        $this->actingAs($this->user('admin'))->get(route('setup.index'))->assertOk();
        $this->actingAs($this->user('admin'))->get(route('setup.reference'))->assertOk();
    }

    public function test_user_activity_report_is_admin_only(): void
    {
        $this->actingAs($this->user('staff'))->get(route('reports.activity'))->assertForbidden();
        $this->actingAs($this->user('manager'))->get(route('reports.activity'))->assertForbidden();
        $this->actingAs($this->user('admin'))->get(route('reports.activity'))
            ->assertOk()
            ->assertInertia(fn ($p) => $p->component('reports/activity')->has('logs')->has('users')->has('actions'));
    }
}
