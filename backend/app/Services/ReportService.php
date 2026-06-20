<?php

namespace App\Services;

use App\Models\Inventory;
use App\Models\Stock;
use App\Models\StockMovement;
use Illuminate\Support\Collection;
use RuntimeException;

class ReportService
{
    /**
     * Build a tabular dataset for the given report type.
     *
     * @return array{title: string, headers: array<int,string>, rows: array<int,array<int,mixed>>}
     */
    public function build(string $type, array $filters = []): array
    {
        return match ($type) {
            'stocks', 'stock_global' => $this->stocks($filters),
            'mouvements'             => $this->movements($filters),
            'inventaire'             => $this->inventory($filters),
            default                  => throw new RuntimeException("Type de rapport inconnu : {$type}."),
        };
    }

    private function stocks(array $filters): array
    {
        $query = Stock::query()->with(['product', 'warehouse']);

        if (! empty($filters['warehouse_id'])) {
            $query->where('warehouse_id', $filters['warehouse_id']);
        }

        $rows = $query->get()->map(fn (Stock $s) => [
            $s->warehouse->nom ?? '—',
            $s->product->sku ?? '—',
            $s->product->nom ?? '—',
            $s->quantite,
            $s->reserve,
            $s->disponible,
            $s->product->stock_minimum ?? 0,
        ])->all();

        return [
            'title'   => 'État des stocks',
            'headers' => ['Entrepôt', 'SKU', 'Produit', 'Quantité', 'Réservé', 'Disponible', 'Seuil min.'],
            'rows'    => $rows,
        ];
    }

    private function movements(array $filters): array
    {
        $query = StockMovement::query()->with(['product', 'warehouse']);

        if (! empty($filters['warehouse_id'])) {
            $query->where('warehouse_id', $filters['warehouse_id']);
        }
        if (! empty($filters['type'])) {
            $query->where('type', $filters['type']);
        }
        if (! empty($filters['from']) && ! empty($filters['to'])) {
            $query->whereBetween('created_at', [$filters['from'], $filters['to']]);
        }

        $rows = $query->orderByDesc('created_at')->limit(5000)->get()
            ->map(fn (StockMovement $m) => [
                $m->reference,
                optional($m->created_at)->format('Y-m-d H:i'),
                $m->type,
                $m->product->nom ?? '—',
                $m->warehouse->nom ?? '—',
                $m->quantite,
            ])->all();

        return [
            'title'   => 'Historique des mouvements',
            'headers' => ['Référence', 'Date', 'Type', 'Produit', 'Entrepôt', 'Quantité'],
            'rows'    => $rows,
        ];
    }

    private function inventory(array $filters): array
    {
        if (empty($filters['inventory_id'])) {
            throw new RuntimeException('Le paramètre inventory_id est requis pour ce rapport.');
        }

        $inventory = Inventory::with(['warehouse', 'items.product'])->findOrFail($filters['inventory_id']);

        $rows = (new Collection($inventory->items))->map(fn ($item) => [
            $item->product->sku ?? '—',
            $item->product->nom ?? '—',
            $item->qte_theorique,
            $item->qte_reelle ?? '—',
            $item->ecart ?? '—',
        ])->all();

        return [
            'title'   => 'Inventaire — ' . ($inventory->warehouse->nom ?? '') . ' (' . $inventory->statut . ')',
            'headers' => ['SKU', 'Produit', 'Qté théorique', 'Qté réelle', 'Écart'],
            'rows'    => $rows,
        ];
    }
}
