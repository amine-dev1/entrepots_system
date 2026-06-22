<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreMovementRequest;
use App\Http\Resources\StockMovementResource;
use App\Models\StockMovement;
use App\Services\StockService;
use Illuminate\Http\Request;

class MovementController extends Controller
{
    public function __construct(private StockService $stockService)
    {
    }

    /**
     * GET /movements
     * Paginated history. Filters: ?type, ?product_id, ?warehouse_id, ?from, ?to
     */
    public function index(Request $request)
    {
        $query = StockMovement::query()->with(['product', 'warehouse']);

        if ($request->filled('type')) {
            $query->where('type', $request->query('type'));
        }

        if ($request->filled('product_id')) {
            $query->where('product_id', $request->query('product_id'));
        }

        if ($request->filled('warehouse_id')) {
            $query->where('warehouse_id', $request->query('warehouse_id'));
        }

        if ($request->filled('from') && $request->filled('to')) {
            $query->whereBetween('created_at', [$request->query('from'), $request->query('to')]);
        }

        $movements = $query->orderByDesc('created_at')
            ->paginate((int) $request->query('per_page', 20));

        return StockMovementResource::collection($movements);
    }

    /**
     * POST /movements
     * Creates a stock movement through StockService (atomic, locked, ref auto).
     */
    public function store(StoreMovementRequest $request)
    {
        $movement = $this->stockService->createMovement([
            'type'         => $request->validated('type'),
            'quantite'     => $request->validated('quantite'),
            'product_id'   => $request->validated('product_id'),
            'warehouse_id' => $request->validated('warehouse_id'),
            'user_id'      => $request->user()->id,
            'motif'        => $request->validated('motif'),
        ]);

        return (new StockMovementResource($movement->load(['product', 'warehouse'])))
            ->response()
            ->setStatusCode(201);
    }
}
