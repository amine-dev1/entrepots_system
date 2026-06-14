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
        Schema::create('stocks', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('product_id')->constrained('products');
            $table->foreignUuid('warehouse_id')->constrained('warehouses');
            $table->integer('quantite')->default(0)->check('quantite >= 0');
            $table->integer('reserve')->default(0)->check('reserve >= 0');
            $table->integer('disponible')->storedAs('quantite - reserve');
            $table->unique(['product_id', 'warehouse_id']);
            $table->timestamps();

        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('stocks');
    }
};
