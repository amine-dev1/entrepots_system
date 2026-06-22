<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TransferResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'                  => $this->id,
            'reference'           => $this->reference,
            'source_warehouse_id' => $this->source_warehouse_id,
            'dest_warehouse_id'   => $this->dest_warehouse_id,
            'statut'              => $this->statut,
            'created_by'          => $this->created_by,
            'validated_by'        => $this->validated_by,
            'received_by'         => $this->received_by,
            'validated_at'        => $this->validated_at,
            'received_at'         => $this->received_at,
            'note'                => $this->note,
            'created_at'          => $this->created_at,
            'source_warehouse'    => new WarehouseResource($this->whenLoaded('sourceWarehouse')),
            'dest_warehouse'      => new WarehouseResource($this->whenLoaded('destWarehouse')),
            'items'               => TransferItemResource::collection($this->whenLoaded('items')),
        ];
    }
}
