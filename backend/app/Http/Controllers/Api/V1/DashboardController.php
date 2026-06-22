<?php

namespace App\Http\Controllers\Api\V1;

use App\Enums\MovementType;
use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Stock;
use App\Models\StockMovement;
use App\Models\Transfer;
use App\Models\Warehouse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    /**
     * GET /dashboard — KPIs + 30-day series.
     */
    public function index(Request $request)
    {
        $since = now()->subDays(30)->startOfDay();
        $sorties = array_map(fn (MovementType $t) => $t->value, MovementType::sorties());

        $kpis = [
            'nb_produits'            => Product::where('actif', true)->count(),
            'nb_entrepots'           => Warehouse::where('actif', true)->count(),
            'nb_alertes'             => Stock::query()
                ->whereHas('product', fn ($q) => $q->whereColumn('stocks.disponible', '<=', 'products.stock_minimum'))
                ->count(),
            'valeur_stock'           => (float) DB::table('stocks')
                ->join('products', 'stocks.product_id', '=', 'products.id')
                ->sum(DB::raw('stocks.quantite * products.prix_achat')),
            'transferts_en_attente'  => Transfer::where('statut', 'en_attente')->count(),
            'mouvements_30j'         => StockMovement::where('created_at', '>=', $since)->count(),
        ];

        // Daily movement series (entrées vs sorties) over the last 30 days.
        $rows = StockMovement::query()
            ->where('created_at', '>=', $since)
            ->select(
                DB::raw('DATE(created_at) as jour'),
                DB::raw("SUM(CASE WHEN type IN ('" . implode("','", $sorties) . "') THEN quantite ELSE 0 END) as sorties"),
                DB::raw("SUM(CASE WHEN type NOT IN ('" . implode("','", $sorties) . "') THEN quantite ELSE 0 END) as entrees"),
            )
            ->groupBy('jour')
            ->orderBy('jour')
            ->get();

        // Stock value per warehouse.
        $stockParEntrepot = DB::table('stocks')
            ->join('warehouses', 'stocks.warehouse_id', '=', 'warehouses.id')
            ->select('warehouses.nom', DB::raw('SUM(stocks.quantite) as quantite_totale'))
            ->groupBy('warehouses.nom')
            ->orderByDesc('quantite_totale')
            ->get();

        return response()->json([
            'kpis'                => $kpis,
            'mouvements_par_jour' => $rows,
            'stock_par_entrepot'  => $stockParEntrepot,
        ]);
    }
}
