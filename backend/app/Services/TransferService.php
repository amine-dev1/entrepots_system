<?php

namespace App\Services;

use App\Enums\MovementType;
use App\Enums\TransferStatus;
use App\Models\Transfer;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use RuntimeException;

class TransferService
{
    public function __construct(private StockService $stock)
    {
    }

    /**
     * brouillon -> en_attente (Magasinier). No stock effect.
     */
    public function submit(Transfer $transfer): Transfer
    {
        $this->assertTransition($transfer, TransferStatus::EnAttente);

        if ($transfer->items()->count() === 0) {
            throw new RuntimeException('Un transfert doit contenir au moins une ligne.');
        }

        $transfer->update(['statut' => TransferStatus::EnAttente->value]);

        return $transfer->refresh();
    }

    /**
     * en_attente -> valide (Gestionnaire).
     * Stock leaves the source (transfert_sortie) and is reserved at destination.
     */
    public function validate(Transfer $transfer, User $validator): Transfer
    {
        $this->assertTransition($transfer, TransferStatus::Valide);

        return DB::transaction(function () use ($transfer, $validator) {
            foreach ($transfer->items as $item) {
                $this->stock->createMovement([
                    'type'         => MovementType::TransfertSortie,
                    'quantite'     => $item->quantite,
                    'product_id'   => $item->product_id,
                    'warehouse_id' => $transfer->source_warehouse_id,
                    'user_id'      => $validator->id,
                    'transfer_id'  => $transfer->id,
                ]);

                // Reserve the incoming goods at the destination (in transit).
                $this->stock->adjustReserve($item->product_id, $transfer->dest_warehouse_id, $item->quantite);
            }

            $transfer->update([
                'statut'       => TransferStatus::Valide->value,
                'validated_by' => $validator->id,
                'validated_at' => now(),
            ]);

            return $transfer->refresh();
        });
    }

    /**
     * valide -> recu (Magasinier destination).
     * Stock enters the destination (transfert_entree) and the reserve is released.
     */
    public function receive(Transfer $transfer, User $receiver): Transfer
    {
        $this->assertTransition($transfer, TransferStatus::Recu);

        return DB::transaction(function () use ($transfer, $receiver) {
            foreach ($transfer->items as $item) {
                $this->stock->createMovement([
                    'type'         => MovementType::TransfertEntree,
                    'quantite'     => $item->quantite,
                    'product_id'   => $item->product_id,
                    'warehouse_id' => $transfer->dest_warehouse_id,
                    'user_id'      => $receiver->id,
                    'transfer_id'  => $transfer->id,
                ]);

                $this->stock->adjustReserve($item->product_id, $transfer->dest_warehouse_id, -$item->quantite);
            }

            $transfer->update([
                'statut'      => TransferStatus::Recu->value,
                'received_by' => $receiver->id,
                'received_at' => now(),
            ]);

            return $transfer->refresh();
        });
    }

    /**
     * * -> annule (Gestionnaire).
     * If the transfer was already validated, stock re-enters the source and
     * the destination reserve is released.
     */
    public function cancel(Transfer $transfer, User $canceller): Transfer
    {
        $this->assertTransition($transfer, TransferStatus::Annule);

        $wasValidated = $transfer->statut === TransferStatus::Valide->value;

        return DB::transaction(function () use ($transfer, $canceller, $wasValidated) {
            if ($wasValidated) {
                foreach ($transfer->items as $item) {
                    // Re-entry into the source warehouse.
                    $this->stock->createMovement([
                        'type'         => MovementType::TransfertEntree,
                        'quantite'     => $item->quantite,
                        'product_id'   => $item->product_id,
                        'warehouse_id' => $transfer->source_warehouse_id,
                        'user_id'      => $canceller->id,
                        'transfer_id'  => $transfer->id,
                        'motif'        => 'Annulation transfert ' . $transfer->reference,
                    ]);

                    $this->stock->adjustReserve($item->product_id, $transfer->dest_warehouse_id, -$item->quantite);
                }
            }

            $transfer->update(['statut' => TransferStatus::Annule->value]);

            return $transfer->refresh();
        });
    }

    private function assertTransition(Transfer $transfer, TransferStatus $target): void
    {
        $current = TransferStatus::from($transfer->statut);

        if (! $current->canTransitionTo($target)) {
            throw new RuntimeException(
                "Transition invalide : {$current->value} -> {$target->value}."
            );
        }
    }
}
