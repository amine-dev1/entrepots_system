<?php

namespace App\Http\Controllers\Api\V1;

use App\Enums\TransferStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreTransferRequest;
use App\Http\Requests\UpdateTransferRequest;
use App\Http\Resources\TransferResource;
use App\Models\Transfer;
use App\Models\TransferItem;
use App\Services\TransferService;
use App\Support\Ref;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class TransferController extends Controller
{
    public function __construct(private TransferService $transfers)
    {
    }

    /**
     * GET /transfers — paginated, filter by ?statut, ?source_warehouse_id, ?dest_warehouse_id
     */
    public function index(Request $request)
    {
        $query = Transfer::query()->with(['sourceWarehouse', 'destWarehouse', 'items.product']);

        if ($request->filled('statut')) {
            $query->where('statut', $request->query('statut'));
        }
        if ($request->filled('source_warehouse_id')) {
            $query->where('source_warehouse_id', $request->query('source_warehouse_id'));
        }
        if ($request->filled('dest_warehouse_id')) {
            $query->where('dest_warehouse_id', $request->query('dest_warehouse_id'));
        }

        $transfers = $query->orderByDesc('created_at')
            ->paginate((int) $request->query('per_page', 20));

        return TransferResource::collection($transfers);
    }

    /**
     * GET /transfers/{transfer}
     */
    public function show(Transfer $transfer)
    {
        $transfer->load(['sourceWarehouse', 'destWarehouse', 'items.product']);

        return new TransferResource($transfer);
    }

    /**
     * POST /transfers — creates a draft (brouillon) transfer with its lines.
     */
    public function store(StoreTransferRequest $request)
    {
        $data = $request->validated();

        $transfer = DB::transaction(function () use ($data, $request) {
            $transfer = Transfer::create([
                'reference'           => Ref::next('TRF', 'transfers'),
                'source_warehouse_id' => $data['source_warehouse_id'],
                'dest_warehouse_id'   => $data['dest_warehouse_id'],
                'statut'              => TransferStatus::Brouillon->value,
                'created_by'          => $request->user()->id,
                'note'                => $data['note'] ?? null,
            ]);

            foreach ($data['items'] as $item) {
                TransferItem::create([
                    'transfer_id' => $transfer->id,
                    'product_id'  => $item['product_id'],
                    'quantite'    => $item['quantite'],
                ]);
            }

            return $transfer;
        });

        return (new TransferResource($transfer->load(['sourceWarehouse', 'destWarehouse', 'items.product'])))
            ->response()
            ->setStatusCode(201);
    }

    /**
     * PUT /transfers/{transfer} — only editable while still a draft.
     */
    public function update(UpdateTransferRequest $request, Transfer $transfer)
    {
        if ($transfer->statut !== TransferStatus::Brouillon->value) {
            return response()->json([
                'message' => 'Seul un transfert en brouillon peut être modifié.',
            ], 422);
        }

        $data = $request->validated();

        DB::transaction(function () use ($data, $transfer) {
            $transfer->update([
                'source_warehouse_id' => $data['source_warehouse_id'] ?? $transfer->source_warehouse_id,
                'dest_warehouse_id'   => $data['dest_warehouse_id'] ?? $transfer->dest_warehouse_id,
                'note'                => $data['note'] ?? $transfer->note,
            ]);

            if (isset($data['items'])) {
                $transfer->items()->delete();
                foreach ($data['items'] as $item) {
                    TransferItem::create([
                        'transfer_id' => $transfer->id,
                        'product_id'  => $item['product_id'],
                        'quantite'    => $item['quantite'],
                    ]);
                }
            }
        });

        return new TransferResource($transfer->fresh(['sourceWarehouse', 'destWarehouse', 'items.product']));
    }

    /**
     * DELETE /transfers/{transfer} — only a draft can be deleted.
     */
    public function destroy(Transfer $transfer)
    {
        if ($transfer->statut !== TransferStatus::Brouillon->value) {
            return response()->json([
                'message' => 'Seul un transfert en brouillon peut être supprimé.',
            ], 422);
        }

        DB::transaction(function () use ($transfer) {
            $transfer->items()->delete();
            $transfer->delete();
        });

        return response()->json(null, 204);
    }

    /** POST /transfers/{transfer}/submit — brouillon -> en_attente */
    public function submit(Transfer $transfer)
    {
        $transfer = $this->transfers->submit($transfer);

        return new TransferResource($transfer->load(['sourceWarehouse', 'destWarehouse', 'items.product']));
    }

    /** POST /transfers/{transfer}/validate — en_attente -> valide */
    public function validateTransfer(Request $request, Transfer $transfer)
    {
        $transfer = $this->transfers->validate($transfer, $request->user());

        return new TransferResource($transfer->load(['sourceWarehouse', 'destWarehouse', 'items.product']));
    }

    /** POST /transfers/{transfer}/receive — valide -> recu */
    public function receive(Request $request, Transfer $transfer)
    {
        $transfer = $this->transfers->receive($transfer, $request->user());

        return new TransferResource($transfer->load(['sourceWarehouse', 'destWarehouse', 'items.product']));
    }

    /** POST /transfers/{transfer}/cancel — * -> annule */
    public function cancel(Request $request, Transfer $transfer)
    {
        $transfer = $this->transfers->cancel($transfer, $request->user());

        return new TransferResource($transfer->load(['sourceWarehouse', 'destWarehouse', 'items.product']));
    }
}
