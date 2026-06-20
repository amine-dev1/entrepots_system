<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class StockMovementResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'           => $this->id,
            'reference'    => $this->reference,
            'type'         => $this->type,
            'quantite'     => $this->quantite,
            'product_id'   => $this->product_id,
            'warehouse_id' => $this->warehouse_id,
            'user_id'      => $this->user_id,
            'transfer_id'  => $this->transfer_id,
            'motif'        => $this->motif,
            'created_at'   => $this->created_at,
            'product'      => new ProductResource($this->whenLoaded('product')),
            'warehouse'    => new WarehouseResource($this->whenLoaded('warehouse')),
        ];
    }
}
