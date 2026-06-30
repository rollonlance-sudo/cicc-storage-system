<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('document_types', function (Blueprint $table) {
            $table->id();
            $table->string('code', 50)->unique();    // abbreviation, e.g. "NoM"
            $table->string('name');                  // full name (required), e.g. "Notice of Meeting"
            $table->foreignId('document_category_id')
                ->constrained('document_categories')
                ->cascadeOnUpdate()
                ->restrictOnDelete();                // a category in use cannot be deleted
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();
            $table->softDeletes();

            $table->index('is_active');
            $table->index('sort_order');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('document_types');
    }
};
