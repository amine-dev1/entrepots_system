<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\RecordCountRequest;
use App\Http\Requests\StoreInventoryRequest;
use App\Http\Resources\InventoryItemResource;
use App\Http\Resources\InventoryResource;
use App\Models\Inventory;
use App\Models\InventoryItem;
use App\Services\InventoryService;
use Illuminate\Http\Request;

class InventoryController extends Controller
{
    public function __construct(private InventoryService $inventories)
    {
    }

    /** GET /inventories — paginated, filter by ?warehouse_id, ?statut */
    public function index(Request $request)
    {
        $query = Inventory::query()->with('warehouse');

        if ($request->filled('warehouse_id')) {
            $query->where('warehouse_id', $request->query('warehouse_id'));
        }
        if ($request->filled('statut')) {
            $query->where('statut', $request->query('statut'));
        }

        $inventories = $query->orderByDesc('started_at')
            ->paginate((int) $request->query('per_page', 20));

        return InventoryResource::collection($inventories);
    }

    /** GET /inventories/{inventory} */
    public function show(Inventory $inventory)
    {
        $inventory->load(['warehouse', 'items.product']);

        return new InventoryResource($inventory);
    }

    /** POST /inventories — open a session and snapshot theoretical stock. */
    public function store(StoreInventoryRequest $request)
    {
        $inventory = $this->inventories->open(
            $request->validated('warehouse_id'),
            $request->user(),
            $request->validated('type'),
        );

        return (new InventoryResource($inventory->load(['warehouse', 'items.product'])))
            ->response()
            ->setStatusCode(201);
    }

    /** PUT /inventories/{inventory}/items/{item} — record the counted quantity. */
    public function recordCount(RecordCountRequest $request, Inventory $inventory, InventoryItem $item)
    {
        abort_unless($item->inventory_id === $inventory->id, 404);

        $item = $this->inventories->recordCount($item, (int) $request->validated('qte_reelle'));

        return new InventoryItemResource($item->load('product'));
    }

    /** POST /inventories/{inventory}/close — en_cours -> cloture. */
    public function close(Inventory $inventory)
    {
        $inventory = $this->inventories->close($inventory);

        return new InventoryResource($inventory->load(['warehouse', 'items.product']));
    }

    /** POST /inventories/{inventory}/adjust — cloture -> ajuste (generates écart movements). */
    public function adjust(Request $request, Inventory $inventory)
    {
        $inventory = $this->inventories->adjust($inventory, $request->user());

        return new InventoryResource($inventory->load(['warehouse', 'items.product']));
    }
}
