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
    Schema::create('warehouses', function (Blueprint $table) {
        $table->uuid('id')->primary();
        $table->string('nom', 100);
        $table->string('code', 20)->unique();
        $table->text('adresse')->nullable();
        $table->string('responsable')->nullable();
        $table->string('telephone', 20)->nullable();
        $table->boolean('actif')->default(true);
        $table->timestamps();
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('warehouses');
    }
};
