<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateTransferRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('transfers.create') ?? false;
    }

    public function rules(): array
    {
        return [
            'dest_warehouse_id'   => ['sometimes', 'uuid', 'exists:warehouses,id', 'different:source_warehouse_id'],
            'source_warehouse_id' => ['sometimes', 'uuid', 'exists:warehouses,id'],
            'note'                => ['nullable', 'string', 'max:1000'],
            'items'               => ['sometimes', 'array', 'min:1'],
            'items.*.product_id'  => ['required_with:items', 'uuid', 'exists:products,id'],
            'items.*.quantite'    => ['required_with:items', 'integer', 'min:1'],
        ];
    }
}
