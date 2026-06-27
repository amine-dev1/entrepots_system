<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Services\ActivityLogger;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    // display all categories
    public function index()
    {
        $categories = Category::withCount('products')->get();
        return response()->json($categories);
    }


    // Display one Category
    public function show(Category $category)
    {
        return response()->json($category->loadCount('products'));
    }

    // Create Category
    public function store(Request $request)
    {
        $data = $request->validate([
            'nom'         => 'required|string|max:100|unique:categories,nom',
            'description' => 'nullable|string',
        ]);

        $category = Category::create($data);

        ActivityLogger::log(
            'creation',
            "Création de la catégorie : {$category->nom}",
            $category
        );

        return response()->json($category, 201);
    }

    // Update Category
    public function update(Request $request, Category $category)
    {
        $data = $request->validate([
            'nom'         => 'sometimes|string|max:100|unique:categories,nom,' . $category->id,
            'description' => 'nullable|string',
        ]);

        $category->update($data);

        ActivityLogger::log(
            'modification',
            "Modification de la catégorie : {$category->nom}",
            $category
        );

        return response()->json($category->fresh());
    }

    // DELETE Category
    public function destroy(Category $category)
    {
        if ($category->products()->exists()) {
            return response()->json([
                'message' => 'Impossible : cette catégorie contient des produits.',
            ], 422);
        }

        $category->delete();

        ActivityLogger::log(
            'suppression',
            "Suppression de la catégorie : {$category->nom}",
            $category
        );

        return response()->json(['message' => 'Catégorie supprimée.']);
    }
}
