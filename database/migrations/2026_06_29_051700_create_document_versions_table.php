<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('document_versions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('document_id')->constrained('documents')->cascadeOnDelete();
            $table->unsignedInteger('version_no');
            $table->foreignId('changed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->string('summary')->nullable();
            $table->json('snapshot')->nullable();
            $table->timestamps();

            $table->index(['document_id', 'version_no']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('document_versions');
    }
};
