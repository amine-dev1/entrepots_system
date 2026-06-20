<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'            => $this->id,
            'categorie_id'  => $this->categorie_id,
            'sku'           => $this->sku,
            'code_barre'    => $this->code_barre,
            'nom'           => $this->nom,
            'description'   => $this->description,
            'prix_achat'    => $this->prix_achat,
            'prix_vente'    => $this->prix_vente,
            'stock_minimum' => $this->stock_minimum,
            'image'         => $this->image,
            'actif'         => $this->actif,
            'category'      => new CategoryResource($this->whenLoaded('category')),
        ];
    }
}
