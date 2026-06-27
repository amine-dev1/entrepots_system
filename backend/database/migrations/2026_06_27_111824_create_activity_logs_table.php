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
        Schema::create('activity_logs', function (Blueprint $table) {
            $table->uuid('id')->primary();

            // L'auteur de l'action (nullable car le système peut faire des actions auto)
            $table->foreignUuid('user_id')->nullable()->constrained('users')->nullOnDelete();

            // Le type d'action (creation, modification, suppression, validation, connexion...)
            $table->string('action', 50);

            // Description lisible par l'humain
            $table->text('description');

            // Lien polymorphique avec l'entité concernée (génère target_type VARCHAR et target_id UUID)
            $table->nullableUuidMorphs('target');

            // Données supplémentaires (ex: anciennes valeurs vs nouvelles valeurs)
            $table->json('payload')->nullable();

            // IP de l'utilisateur (optionnel mais utile pour l'audit)
            $table->string('ip_address', 45)->nullable();

            // Uniquement created_at car un log est immuable
            $table->timestamp('created_at')->useCurrent();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('activity_logs');
    }
};
