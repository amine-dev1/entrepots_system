<?php

namespace App\Http\Controllers;

use App\Models\Warehouse;
use Illuminate\Http\Request;

class WarehouseController extends Controller
{
    public function index(Request $request)
    {
        // Actifs seulement par défaut ; ?inactifs=true pour tout voir (admin).
        $query = $request->boolean('inactifs') ? Warehouse::query() : Warehouse::actif();

        return response()->json($query->get());
    }


    public function show(Warehouse $warehouse)
    {
        return response()->json($warehouse);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'nom'         => 'required|string|max:100',
            'code'        => 'required|string|max:20|unique:warehouses,code',
            'adresse'     => 'nullable|string',
            'responsable' => 'nullable|string|max:150',
            'telephone'   => 'nullable|string|max:20',
        ]);

        $warehouse = Warehouse::create($data);

        return response()->json($warehouse, 201);
    }


    public function update(Request $request, Warehouse $warehouse)
    {
        $data = $request->validate([
            'nom'         => 'sometimes|string|max:100',
            'code'        => 'sometimes|string|max:20|unique:warehouses,code,' . $warehouse->id,
            'adresse'     => 'nullable|string',
            'responsable' => 'nullable|string|max:150',
            'telephone'   => 'nullable|string|max:20',
            'actif'       => 'sometimes|boolean',
        ]);

        $warehouse->update($data);

        return response()->json($warehouse->fresh());
    }


    // Règle : désactivation seulement si stock = 0
    public function destroy(Warehouse $warehouse)
    {
        $totalStock = $warehouse->stocks()->sum('quantite');

        if ($totalStock > 0) {
            return response()->json([
                'message' => 'Impossible : cet entrepôt contient du stock.',
            ], 422);
        }

        $warehouse->update(['actif' => false]);

        return response()->json(['message' => 'Entrepôt désactivé.']);
    }
}
