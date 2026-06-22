<?php

namespace App\Services;

use App\Enums\MovementType;
use App\Models\Inventory;
use App\Models\InventoryItem;
use App\Models\Stock;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use RuntimeException;

class InventoryService
{
    public function __construct(private StockService $stock)
    {
    }

    /**
     * Open an inventory session and snapshot the current theoretical stock
     * (qte_theorique) for every product held in the warehouse.
     */
    public function open(string $warehouseId, User $user, string $type = 'global'): Inventory
    {
        return DB::transaction(function () use ($warehouseId, $user, $type) {
            $inventory = Inventory::create([
                'warehouse_id' => $warehouseId,
                'user_id'      => $user->id,
                'type'         => $type,
                'statut'       => 'en_cours',
                'started_at'   => now(),
            ]);

            $stocks = Stock::where('warehouse_id', $warehouseId)->get();

            foreach ($stocks as $stock) {
                InventoryItem::create([
                    'inventory_id'  => $inventory->id,
                    'product_id'    => $stock->product_id,
                    'qte_theorique' => $stock->quantite,
                    'qte_reelle'    => null,
                ]);
            }

            return $inventory->refresh();
        });
    }

    /**
     * Record the counted (real) quantity for an inventory line.
     */
    public function recordCount(InventoryItem $item, int $qteReelle): InventoryItem
    {
        if ($item->inventory->statut !== 'en_cours') {
            throw new RuntimeException("L'inventaire n'est pas en cours de saisie.");
        }

        if ($qteReelle < 0) {
            throw new RuntimeException('La quantité réelle ne peut pas être négative.');
        }

        $item->update(['qte_reelle' => $qteReelle]);

        return $item->refresh();
    }

    /**
     * Close the session (no more counting). en_cours -> cloture.
     */
    public function close(Inventory $inventory): Inventory
    {
        if ($inventory->statut !== 'en_cours') {
            throw new RuntimeException('Seul un inventaire en cours peut être clôturé.');
        }

        $inventory->update(['statut' => 'cloture', 'closed_at' => now()]);

        return $inventory->refresh();
    }

    /**
     * Apply the counted differences as stock movements. cloture -> ajuste.
     * Positive écart -> ajustement_entree, negative -> ajustement_sortie.
     */
    public function adjust(Inventory $inventory, User $user): Inventory
    {
        if ($inventory->statut !== 'cloture') {
            throw new RuntimeException('Seul un inventaire clôturé peut être ajusté.');
        }

        return DB::transaction(function () use ($inventory, $user) {
            foreach ($inventory->items as $item) {
                if ($item->qte_reelle === null) {
                    continue;
                }

                $ecart = (int) $item->ecart;
                if ($ecart === 0) {
                    continue;
                }

                $type = $ecart > 0
                    ? MovementType::AjustementEntree
                    : MovementType::AjustementSortie;

                $this->stock->createMovement([
                    'type'         => $type,
                    'quantite'     => abs($ecart),
                    'product_id'   => $item->product_id,
                    'warehouse_id' => $inventory->warehouse_id,
                    'user_id'      => $user->id,
                    'motif'        => 'Ajustement inventaire ' . $inventory->id,
                ]);
            }

            $inventory->update(['statut' => 'ajuste']);

            return $inventory->refresh();
        });
    }
}
