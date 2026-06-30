<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Périmètre de données : entrepôts autorisés par utilisateur.
     * Aucune ligne pour un utilisateur = accès à TOUS les entrepôts (non restreint).
     */
    public function up(): void
    {
        Schema::create('user_warehouse', function (Blueprint $table) {
            $table->foreignUuid('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignUuid('warehouse_id')->constrained('warehouses')->cascadeOnDelete();
            $table->primary(['user_id', 'warehouse_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_warehouse');
    }
};
