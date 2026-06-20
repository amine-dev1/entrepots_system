<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\StockResource;
use App\Models\Stock;
use Illuminate\Http\Request;

class StockController extends Controller
{
    /**
     * GET /stocks
     * Filters: ?warehouse_id, ?product_id, ?alert=1
     */
    public function index(Request $request)
    {
        $query = Stock::query()->with(['product.category', 'warehouse']);

        if ($request->filled('warehouse_id')) {
            $query->where('warehouse_id', $request->query('warehouse_id'));
        }

        if ($request->filled('product_id')) {
            $query->where('product_id', $request->query('product_id'));
        }

        if ($request->boolean('alert')) {
            $query->whereHas('product', function ($q) {
                $q->whereColumn('stocks.disponible', '<=', 'products.stock_minimum');
            });
        }

        $stocks = $query->orderByDesc('stocks.created_at')
            ->paginate((int) $request->query('per_page', 20));

        return StockResource::collection($stocks);
    }

    /**
     * GET /stocks/alerts
     * Stocks whose available quantity is at or below the product's minimum.
     */
    public function alerts(Request $request)
    {
        $query = Stock::query()
            ->with(['product.category', 'warehouse'])
            ->whereHas('product', function ($q) {
                $q->whereColumn('stocks.disponible', '<=', 'products.stock_minimum');
            });

        if ($request->filled('warehouse_id')) {
            $query->where('warehouse_id', $request->query('warehouse_id'));
        }

        $stocks = $query->orderBy('stocks.disponible')
            ->paginate((int) $request->query('per_page', 20));

        return StockResource::collection($stocks);
    }
}
