<?php

namespace App\Http\Requests;

use App\Models\Document;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class DocumentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('document.manage') ?? false;
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        // The current document id comes from either the per-type route ({document}) or the global records route ({record}).
        $id = $this->route('document')?->id ?? $this->route('record')?->id;

        return [
            'tracking_no' => [
                'nullable', 'string', 'max:100',
                Rule::unique('documents', 'tracking_no')->ignore($id)->withoutTrashed(),
            ],
            'reference_no' => [
                'required', 'string', 'max:100',
                Rule::unique('documents', 'reference_no')->ignore($id)->withoutTrashed(),
            ],
            'title' => ['required', 'string', 'max:255'],
            // Required on the global create/edit form; on per-type quick-add the type comes from the route.
            'document_type_id' => [
                Rule::requiredIf(fn () => $this->routeIs('records.store', 'records.update')),
                'nullable', 'integer', Rule::exists('document_types', 'id')->withoutTrashed(),
            ],
            'department_id' => ['nullable', 'integer', Rule::exists('departments', 'id')->withoutTrashed()],
            'status' => ['required', Rule::in(Document::STATUSES)],
            'classification' => ['required', Rule::in(Document::CLASSIFICATIONS)],
            'priority' => ['required', Rule::in(Document::PRIORITIES)],
            'tags' => ['nullable', 'array', 'max:20'],
            'tags.*' => ['string', 'max:50'],
            'document_date' => ['nullable', 'date'],
            'amount' => ['nullable', 'numeric', 'min:0', 'max:9999999999999.99'],
            'prepared_by' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:5000'],
        ];
    }

    public function attributes(): array
    {
        return [
            'reference_no' => 'reference no.',
            'tracking_no' => 'tracking no.',
            'department_id' => 'department',
        ];
    }
}
