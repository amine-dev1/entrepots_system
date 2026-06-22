<?php

namespace App\Http\Requests;

use App\Enums\MovementType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreMovementRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('movements.create') ?? false;
    }

    public function rules(): array
    {
        $types = array_map(fn (MovementType $t) => $t->value, MovementType::cases());

        return [
            'type'         => ['required', 'string', Rule::in($types)],
            'quantite'     => ['required', 'integer', 'min:1'],
            'product_id'   => ['required', 'uuid', 'exists:products,id'],
            'warehouse_id' => ['required', 'uuid', 'exists:warehouses,id'],
            'motif'        => ['nullable', 'string', 'max:500'],
        ];
    }
}
