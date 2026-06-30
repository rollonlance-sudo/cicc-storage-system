<?php

namespace App\Http\Controllers\Setup;

use App\Http\Controllers\Controller;
use App\Http\Requests\Setup\DepartmentRequest;
use App\Models\Department;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class DepartmentController extends Controller
{
    public function index(): Response
    {
        $departments = Department::withTrashed()
            ->withCount('documents')
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get()
            ->map(fn (Department $d) => [
                'id' => $d->id,
                'code' => $d->code,
                'name' => $d->name,
                'head_of_office' => $d->head_of_office,
                'email' => $d->email,
                'contact_number' => $d->contact_number,
                'is_active' => $d->is_active,
                'sort_order' => $d->sort_order,
                'documents_count' => $d->documents_count,
                'trashed' => $d->trashed(),
            ]);

        return Inertia::render('setup/departments', ['departments' => $departments]);
    }

    public function store(DepartmentRequest $request): RedirectResponse
    {
        Department::create($request->validated());

        return back()->with('success', 'Department created.');
    }

    public function update(DepartmentRequest $request, Department $department): RedirectResponse
    {
        $department->update($request->validated());

        return back()->with('success', 'Department updated.');
    }

    public function destroy(Department $department): RedirectResponse
    {
        $department->delete();

        return back()->with('success', "“{$department->name}” archived.");
    }

    public function restore(int $id): RedirectResponse
    {
        $department = Department::onlyTrashed()->findOrFail($id);
        $department->restore();

        return back()->with('success', "“{$department->name}” restored.");
    }
}
