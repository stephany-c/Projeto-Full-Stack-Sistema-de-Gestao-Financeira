import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CategoryService, Category } from '../../services/category.service';

@Component({
    selector: 'app-category-manager',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './category-manager.html',
    styleUrl: './category-manager.scss'
})
export class CategoryManagerComponent implements OnInit {
    categories = signal<Category[]>([]);
    searchTerm = signal('');

    // Computed signal for filtering
    filteredCategories = computed(() => {
        const term = this.searchTerm().toLowerCase();
        return this.categories().filter(c => c.name.toLowerCase().includes(term));
    });

    newCategoryName = '';

    editingId = signal<number | null>(null);
    editName = '';

    deletingId = signal<number | null>(null);
    transferToId: number | null = null;

    private categoryService = inject(CategoryService);

    ngOnInit() {
        this.loadCategories();
    }

    loadCategories() {
        this.categoryService.getAll().subscribe(data => this.categories.set(data));
    }

    addCategory() {
        if (!this.newCategoryName.trim()) return;

        this.categoryService.create(this.newCategoryName).subscribe(() => {
            this.newCategoryName = '';
            this.loadCategories();
        });
    }

    startEdit(category: Category) {
        this.editingId.set(category.id);
        this.editName = category.name;
    }

    cancelEdit() {
        this.editingId.set(null);
        this.editName = '';
    }

    saveEdit(id: number) {
        if (!this.editName.trim()) return;

        this.categoryService.update(id, this.editName).subscribe(() => {
            this.cancelEdit();
            this.loadCategories();
        });
    }

    startDelete(id: number) {
        this.deletingId.set(id);
        this.transferToId = null;
    }

    cancelDelete() {
        this.deletingId.set(null);
        this.transferToId = null;
    }

    confirmDelete(id: number) {
        this.categoryService.delete(id, this.transferToId || undefined).subscribe({
            next: () => {
                this.cancelDelete();
                this.loadCategories();
            },
            error: (err) => {
                console.error('Error deleting category:', err);
                alert('Erro ao excluir categoria. Verifique se ela está sendo usada.');
            }
        });
    }

    getOtherCategories(excludeId: number): Category[] {
        return this.categories().filter(c => c.id !== excludeId);
    }
}
