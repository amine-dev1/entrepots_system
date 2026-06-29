<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Product;
use Illuminate\Support\Facades\Storage;
use App\Services\ActivityLogger;

class ProductController extends Controller
{
    // GET /api/v1/products
    public function index(Request $request)
    {
        // Actifs seulement par défaut ; ?inactifs=true pour tout voir (admin).
        $query = $request->boolean('inactifs') ? Product::query() : Product::actif();

        return response()->json($query->with('category')->get());
    }

    // GET /api/v1/products/{id}
    public function show(Product $product)
    {
        return response()->json($product->load('category'));
    }

    // POST /api/v1/products   (multipart/form-data pour l'image)
    public function store(Request $request)
    {
        $data = $request->validate([
            'categorie_id'  => 'required|uuid|exists:categories,id',
            'sku'           => 'required|string|max:50|unique:products,sku',
            'code_barre'    => 'nullable|string|max:50|unique:products,code_barre',
            'nom'           => 'required|string|max:150',
            'description'   => 'nullable|string',
            'prix_achat'    => 'required|numeric|min:0',
            'prix_vente'    => 'required|numeric|min:0',
            'stock_minimum' => 'sometimes|integer|min:0',
            'image'         => 'nullable|image|max:2048',
        ]);

        // Upload de l'image si présente
        if ($request->hasFile('image')) {
            $data['image'] = $request->file('image')->store('products', 'public');
        }

        $product = Product::create($data);

        ActivityLogger::log(
            'creation',
            "Création du produit : {$product->nom} (SKU: {$product->sku})",
            $product
        );

        return response()->json($product->load('category'), 201);
    }

    // POST /api/v1/products/{id}  (on utilise POST car multipart ne supporte pas PUT)
    public function update(Request $request, Product $product)
    {
        $data = $request->validate([
            'categorie_id'  => 'sometimes|uuid|exists:categories,id',
            'sku'           => 'sometimes|string|max:50|unique:products,sku,' . $product->id,
            'code_barre'    => 'nullable|string|max:50|unique:products,code_barre,' . $product->id,
            'nom'           => 'sometimes|string|max:150',
            'description'   => 'nullable|string',
            'prix_achat'    => 'sometimes|numeric|min:0',
            'prix_vente'    => 'sometimes|numeric|min:0',
            'stock_minimum' => 'sometimes|integer|min:0',
            'image'         => 'nullable|image|max:2048',
            'actif'         => 'sometimes|boolean',
        ]);

        // Remplace l'ancienne image
        if ($request->hasFile('image')) {
            if ($product->image) {
                Storage::disk('public')->delete($product->image);
            }
            $data['image'] = $request->file('image')->store('products', 'public');
        }

        $product->update($data);

        ActivityLogger::log(
            'modification',
            "Modification du produit : {$product->nom} (SKU: {$product->sku})",
            $product
        );

        return response()->json($product->fresh('category'));
    }

    // DELETE /api/v1/products/{id}  → désactivation (pas suppression physique)
    public function destroy(Product $product)
    {
        $product->update(['actif' => false]);

        ActivityLogger::log(
            'modification',
            "Désactivation du produit : {$product->nom} (SKU: {$product->sku})",
            $product
        );

        return response()->json(['message' => 'Produit désactivé.']);
    }
}
