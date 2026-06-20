<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class InventoryResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'           => $this->id,
            'warehouse_id' => $this->warehouse_id,
            'user_id'      => $this->user_id,
            'type'         => $this->type,
            'statut'       => $this->statut,
            'started_at'   => $this->started_at,
            'closed_at'    => $this->closed_at,
            'warehouse'    => new WarehouseResource($this->whenLoaded('warehouse')),
            'items'        => InventoryItemResource::collection($this->whenLoaded('items')),
        ];
    }
}
