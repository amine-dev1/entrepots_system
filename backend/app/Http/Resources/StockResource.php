<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class StockResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'           => $this->id,
            'product_id'   => $this->product_id,
            'warehouse_id' => $this->warehouse_id,
            'quantite'     => $this->quantite,
            'reserve'      => $this->reserve,
            'disponible'   => $this->disponible,
            'en_alerte'    => $this->when(
                $this->relationLoaded('product') && $this->product,
                fn () => $this->disponible <= ($this->product->stock_minimum ?? 0)
            ),
            'product'      => new ProductResource($this->whenLoaded('product')),
            'warehouse'    => new WarehouseResource($this->whenLoaded('warehouse')),
        ];
    }
}
