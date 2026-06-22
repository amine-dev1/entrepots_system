<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class WarehouseResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'          => $this->id,
            'nom'         => $this->nom,
            'code'        => $this->code,
            'adresse'     => $this->adresse,
            'responsable' => $this->responsable,
            'telephone'   => $this->telephone,
            'actif'       => $this->actif,
        ];
    }
}
