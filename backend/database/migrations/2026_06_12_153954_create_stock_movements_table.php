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
        Schema::create('stock_movements', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('reference', 30)->unique();
            $table->enum('type', [
    'achat', 'retour_fournisseur', 'ajustement_entree',
    'vente', 'consommation', 'perte', 'ajustement_sortie',
    'transfert_sortie', 'transfert_entree'
]);
            $table->integer('quantite')->check('quantite > 0');
            $table->foreignUuid('product_id')->constrained('products');
            $table->foreignUuid('warehouse_id')->constrained('warehouses');
            $table->foreignUuid('user_id')->constrained('users');
            $table->foreignUuid('transfer_id')->nullable()->constrained('transfers');
            $table->text('motif')->nullable();
            $table->timestamp('created_at');

        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('stock_movements');
    }
};
