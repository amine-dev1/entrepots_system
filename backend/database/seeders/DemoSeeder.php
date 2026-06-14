<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Warehouse;
use App\Models\Category;
use App\Models\Product;
use App\Models\Stock;
use Illuminate\Support\Facades\Hash;

class DemoSeeder extends Seeder
{
    public function run(): void
    {
        // Users
        $admin = User::firstOrCreate(
            ['email' => 'admin@stockflow.ma'],
            [
                'nom'      => 'Alami',
                'prenom'   => 'Youssef',
                'password' => Hash::make('password'),
                'actif'    => true,
            ]
        );
        $admin->assignRole('administrateur');

        $gestionnaire = User::firstOrCreate(
            ['email' => 'gestionnaire@stockflow.ma'],
            [
                'nom'      => 'Benali',
                'prenom'   => 'Sara',
                'password' => Hash::make('password'),
                'actif'    => true,
            ]
        );
        $gestionnaire->assignRole('gestionnaire');

        $magasinier = User::firstOrCreate(
            ['email' => 'magasinier@stockflow.ma'],
            [
                'nom'      => 'Idrissi',
                'prenom'   => 'Omar',
                'password' => Hash::make('password'),
                'actif'    => true,
            ]
        );
        $magasinier->assignRole('magasinier');

        // Entrepôts
        $casa = Warehouse::firstOrCreate(
            ['code' => 'WH-CAS-01'],
            ['nom' => 'Entrepôt Casablanca', 'adresse' => 'Zone Industrielle Casa', 'actif' => true]
        );

        $rabat = Warehouse::firstOrCreate(
            ['code' => 'WH-RAB-01'],
            ['nom' => 'Entrepôt Rabat', 'adresse' => 'Zone Industrielle Rabat', 'actif' => true]
        );

        // Catégories
        $informatique = Category::firstOrCreate(
            ['nom' => 'Informatique'],
            ['description' => 'Matériel informatique']
        );

        $bureautique = Category::firstOrCreate(
            ['nom' => 'Bureautique'],
            ['description' => 'Fournitures de bureau']
        );

        // Produits
        $laptop = Product::firstOrCreate(
            ['sku' => 'LAP-001'],
            [
                'categorie_id'  => $informatique->id,
                'nom'           => 'Laptop Dell XPS',
                'prix_achat'    => 8000,
                'prix_vente'    => 10000,
                'stock_minimum' => 5,
                'actif'         => true,
            ]
        );

        $souris = Product::firstOrCreate(
            ['sku' => 'SOU-001'],
            [
                'categorie_id'  => $informatique->id,
                'nom'           => 'Souris Logitech',
                'prix_achat'    => 150,
                'prix_vente'    => 250,
                'stock_minimum' => 10,
                'actif'         => true,
            ]
        );

        $stylo = Product::firstOrCreate(
            ['sku' => 'STY-001'],
            [
                'categorie_id'  => $bureautique->id,
                'nom'           => 'Stylo Bic (boîte)',
                'prix_achat'    => 20,
                'prix_vente'    => 35,
                'stock_minimum' => 20,
                'actif'         => true,
            ]
        );

        // Stocks
        foreach ([$casa, $rabat] as $warehouse) {
            foreach ([$laptop, $souris, $stylo] as $product) {
                Stock::firstOrCreate(
                    ['product_id' => $product->id, 'warehouse_id' => $warehouse->id],
                    ['quantite' => rand(10, 100), 'reserve' => 0]
                );
            }
        }
    }
}