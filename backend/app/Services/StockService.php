<?php

namespace App\Services;

use App\Enums\MovementType;
use App\Events\StockLow;
use App\Exceptions\InsufficientStockException;
use App\Models\Stock;
use App\Models\StockMovement;
use App\Support\Ref;
use Illuminate\Support\Facades\DB;

class StockService
{
    /**
     * Create a single stock movement atomically.
     *
     * $data keys: type, quantite, product_id, warehouse_id, user_id,
     *             transfer_id (nullable), motif (nullable).
     *
     * All stock changes in the application must go through this method.
     */
    public function createMovement(array $data): StockMovement
    {
        $type = $data['type'] instanceof MovementType
            ? $data['type']
            : MovementType::from($data['type']);

        $quantite = (int) $data['quantite'];

        if ($quantite <= 0) {
            throw new \InvalidArgumentException('La quantité doit être strictement positive.');
        }

        return DB::transaction(function () use ($type, $quantite, $data) {
            // Ensure a stock row exists, then lock it for update (pessimistic lock).
            Stock::firstOrCreate(
                ['product_id' => $data['product_id'], 'warehouse_id' => $data['warehouse_id']],
                ['quantite' => 0, 'reserve' => 0]
            );

            $stock = Stock::where('product_id', $data['product_id'])
                ->where('warehouse_id', $data['warehouse_id'])
                ->lockForUpdate()
                ->firstOrFail();

            if (MovementType::isSortie($type)) {
                if ($stock->disponible < $quantite) {
                    throw new InsufficientStockException();
                }
                $stock->decrement('quantite', $quantite);
            } else {
                $stock->increment('quantite', $quantite);
            }

            $movement = StockMovement::create([
                'reference'    => Ref::next('MVT', 'stock_movements'),
                'type'         => $type->value,
                'quantite'     => $quantite,
                'product_id'   => $data['product_id'],
                'warehouse_id' => $data['warehouse_id'],
                'user_id'      => $data['user_id'],
                'transfer_id'  => $data['transfer_id'] ?? null,
                'motif'        => $data['motif'] ?? null,
                'created_at'   => now(),
            ]);

            $stock->refresh();
            $minimum = $stock->product->stock_minimum ?? 0;
            if ($stock->disponible <= $minimum) {
                StockLow::dispatch($stock);
            }

            return $movement;
        });
    }

    /**
     * Adjust the reserved quantity of a stock row (used by transfers).
     * Positive $delta reserves, negative releases. Locks the row.
     */
    public function adjustReserve(string $productId, string $warehouseId, int $delta): Stock
    {
        return DB::transaction(function () use ($productId, $warehouseId, $delta) {
            Stock::firstOrCreate(
                ['product_id' => $productId, 'warehouse_id' => $warehouseId],
                ['quantite' => 0, 'reserve' => 0]
            );

            $stock = Stock::where('product_id', $productId)
                ->where('warehouse_id', $warehouseId)
                ->lockForUpdate()
                ->firstOrFail();

            $new = $stock->reserve + $delta;
            if ($new < 0) {
                $new = 0;
            }
            $stock->update(['reserve' => $new]);

            return $stock;
        });
    }
}
