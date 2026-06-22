<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreTransferRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('transfers.create') ?? false;
    }

    public function rules(): array
    {
        return [
            'source_warehouse_id' => ['required', 'uuid', 'exists:warehouses,id'],
            'dest_warehouse_id'   => ['required', 'uuid', 'exists:warehouses,id', 'different:source_warehouse_id'],
            'note'                => ['nullable', 'string', 'max:1000'],
            'items'               => ['required', 'array', 'min:1'],
            'items.*.product_id'  => ['required', 'uuid', 'exists:products,id'],
            'items.*.quantite'    => ['required', 'integer', 'min:1'],
        ];
    }

    public function messages(): array
    {
        return [
            'dest_warehouse_id.different' => "L'entrepôt de destination doit être différent de la source.",
            'items.required'             => 'Un transfert doit contenir au moins une ligne.',
        ];
    }
}
