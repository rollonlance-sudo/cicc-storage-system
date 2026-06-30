<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('documents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('document_type_id')
                ->constrained('document_types')
                ->cascadeOnUpdate()
                ->cascadeOnDelete();
            $table->string('reference_no')->unique();   // e.g. NoM-2026-0001
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('status')->default('draft'); // draft, pending, approved, released, completed, cancelled
            $table->date('document_date')->nullable();
            $table->decimal('amount', 15, 2)->nullable(); // for financial/procurement papers
            $table->string('prepared_by')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index('status');
            $table->index('document_date');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('documents');
    }
};
