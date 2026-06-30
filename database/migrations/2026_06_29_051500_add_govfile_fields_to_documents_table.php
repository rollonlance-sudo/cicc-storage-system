<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('documents', function (Blueprint $table) {
            $table->string('tracking_no')->nullable()->unique()->after('id');
            $table->foreignId('department_id')->nullable()->after('document_type_id')
                ->constrained('departments')->nullOnDelete();
            $table->string('classification')->default('internal')->after('status');
            $table->string('priority')->default('normal')->after('classification');
            $table->json('tags')->nullable()->after('priority');

            $table->index('classification');
            $table->index('priority');
        });
    }

    public function down(): void
    {
        Schema::table('documents', function (Blueprint $table) {
            $table->dropConstrainedForeignId('department_id');
            $table->dropColumn(['tracking_no', 'classification', 'priority', 'tags']);
        });
    }
};
