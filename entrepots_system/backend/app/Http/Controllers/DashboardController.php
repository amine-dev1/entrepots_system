<?php

namespace App\Http\Controllers;

use App\Models\Warehouse;
use App\Models\Product;
use App\Models\StockMovement;
use App\Models\Stock;
use App\Models\Category;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function index()
    {
        // KPIs
        $warehouses = Warehouse::actif()->count();
        $products = Product::actif()->count();
        $categories_count = Category::count();
        $users_count = User::count();
        $alerts = Stock::join('products', 'stocks.product_id', '=', 'products.id')
                        ->whereColumn('stocks.disponible', '<=', 'products.stock_minimum')
                        ->count();
        $movements_today = StockMovement::whereDate('created_at', today())->count();

        // Movements: last 14 days
        $series = $this->getMovementsSeries();

        // Categories distribution
        $categories = $this->getCategoriesDistribution();

        // Warehouses stock (top 5 products)
        $warehousesStock = $this->getWarehousesStock();

        return response()->json([
            'warehouses' => $warehouses,
            'products'   => $products,
            'categories_count' => $categories_count,
            'users_count' => $users_count,
            'alerts'     => $alerts,
            'movements_today' => $movements_today,
            'series'     => $series,
            'categories' => $categories,
            'warehouses_stock' => $warehousesStock,
        ]);
    }

    private function getMovementsSeries()
    {
        $data = [];
        for ($i = 13; $i >= 0; $i--) {
            $date = now()->subDays($i)->startOfDay();
            $entrées = StockMovement::whereDate('created_at', $date)
                                   ->where('type', 'entrée')
                                   ->sum('quantite');
            $sorties = StockMovement::whereDate('created_at', $date)
                                   ->where('type', 'sortie')
                                   ->sum('quantite');
            $data[] = [
                'date' => $date->format('d M'),
                'entrées' => $entrées,
                'sorties' => $sorties,
            ];
        }
        return $data;
    }

    private function getCategoriesDistribution()
    {
        return Category::withCount(['products' => function ($query) {
                            $query->where('actif', true);
                        }])
                        ->get()
                        ->map(fn($cat) => [
                            'name' => $cat->nom,
                            'value' => (int) $cat->products_count,
                        ])
                        ->toArray();
    }

    private function getWarehousesStock()
    {
        // Get top 5 products across all warehouses
        $topProducts = Product::actif()
                             ->select('id', 'nom')
                             ->orderBy('created_at', 'desc')
                             ->limit(5)
                             ->pluck('id');

        // For each warehouse, get stock for these products
        $warehouses = Warehouse::actif()
                              ->select('id', 'nom', 'code')
                              ->get();

        $data = [];
        foreach ($warehouses as $wh) {
            $row = ['name' => $wh->code];
            foreach ($topProducts as $prodId) {
                $stock = Stock::where('warehouse_id', $wh->id)
                             ->where('product_id', $prodId)
                             ->first();
                $prodName = Product::find($prodId)?->nom ?? 'Prod. '.chr(65 + count($row) - 1);
                $row[$prodName] = $stock?->disponible ?? 0;
            }
            $data[] = $row;
        }
        return $data;
    }
}
