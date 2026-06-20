<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class InventoryItemResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'            => $this->id,
            'inventory_id'  => $this->inventory_id,
            'product_id'    => $this->product_id,
            'qte_theorique' => $this->qte_theorique,
            'qte_reelle'    => $this->qte_reelle,
            'ecart'         => $this->ecart,
            'product'       => new ProductResource($this->whenLoaded('product')),
        ];
    }
}
