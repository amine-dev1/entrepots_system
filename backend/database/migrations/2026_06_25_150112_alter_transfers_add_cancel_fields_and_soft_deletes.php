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
        Schema::table('transfers', function (Blueprint $table) {
            $table->uuid('canceled_by')->nullable()->after('received_by');
            $table->foreign('canceled_by')->references('id')->on('users');
            $table->timestamp('canceled_at')->nullable()->after('received_at');
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('transfers', function (Blueprint $table) {
            $table->dropForeign(['canceled_by']);
            $table->dropColumn(['canceled_by', 'canceled_at']);
            $table->dropSoftDeletes();
        });
    }
};
