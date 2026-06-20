<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class RecordCountRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('inventories.update') ?? false;
    }

    public function rules(): array
    {
        return [
            'qte_reelle' => ['required', 'integer', 'min:0'],
        ];
    }
}
