<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('inventory_items', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('inventory_id')->constrained('inventories');
            $table->foreignUuid('product_id')->constrained('products');
            $table->integer('qte_theorique');
            $table->integer('qte_reelle')->nullable();
            $table->integer('ecart')->storedAs('qte_reelle - qte_theorique');
            $table->unique(['inventory_id', 'product_id']);
            $table->timestamps();

        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('inventory_items');
    }
};
