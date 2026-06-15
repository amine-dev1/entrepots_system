<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('transfers', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('reference', 30)->unique();
            $table->foreignUuid('source_warehouse_id')->constrained('warehouses');
            $table->foreignUuid('dest_warehouse_id')->constrained('warehouses');
            $table->enum('statut', ['brouillon', 'en_attente', 'valide', 'recu', 'annule'])->default('brouillon');
            $table->uuid('created_by');
            $table->foreign('created_by')->references('id')->on('users');
            $table->uuid('validated_by')->nullable();
            $table->foreign('validated_by')->references('id')->on('users');
            $table->uuid('received_by')->nullable();
            $table->foreign('received_by')->references('id')->on('users');
            $table->timestamp('validated_at')->nullable();
            $table->timestamp('received_at')->nullable();
            $table->text('note')->nullable();
            $table->timestamps();
        });

        // Empêche un transfert d'un entrepôt vers lui-même (CHECK portable, raw SQL).
        DB::statement('ALTER TABLE transfers ADD CONSTRAINT transfers_source_dest_diff CHECK (source_warehouse_id <> dest_warehouse_id)');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('transfers');
    }
};
