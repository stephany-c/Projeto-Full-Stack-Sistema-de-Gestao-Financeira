import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CategoryService, Category } from '../../services/category.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';

@Component({
    selector: 'app-category-manager',
    standalone: true,
    imports: [
        CommonModule, FormsModule,
        MatFormFieldModule, MatInputModule, MatSelectModule,
        MatButtonModule, MatIconModule, MatListModule
    ],
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
    // Usamos -1 como ID especial para "Excluir transações" associadas à categoria deletada.
    // Isso evita problemas visuais do mat-select com o valor 'null'.
    transferToId = signal<number>(-1);

    errorMessage = signal<string | null>(null);
    successMessage = signal<string | null>(null);

    private categoryService = inject(CategoryService);

    ngOnInit() {
        this.loadCategories();
    }

    loadCategories() {
        this.categoryService.getAll().subscribe(data => this.categories.set(data));
    }

    addCategory() {
        if (!this.newCategoryName.trim()) return;
        this.errorMessage.set(null);

        this.categoryService.create(this.newCategoryName).subscribe({
            next: () => {
                this.successMessage.set('Categoria criada com sucesso!');
                setTimeout(() => this.successMessage.set(null), 3000);
                this.newCategoryName = '';
                this.loadCategories();
            },
            error: (err) => {
                console.error('Error adding category:', err);
                const msg = err.error?.error || 'Erro ao adicionar categoria.';
                this.errorMessage.set(msg);
            }
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
        this.errorMessage.set(null);

        this.categoryService.update(id, this.editName).subscribe({
            next: () => {
                this.successMessage.set('Categoria atualizada com sucesso!');
                setTimeout(() => this.successMessage.set(null), 3000);
                this.cancelEdit();
                this.loadCategories();
            },
            error: (err) => {
                console.error('Error updating category:', err);
                const msg = err.error?.error || 'Erro ao atualizar categoria.';
                this.errorMessage.set(msg);
            }
        });
    }

    startDelete(id: number) {
        this.deletingId.set(id);
        this.transferToId.set(-1);
    }

    cancelDelete() {
        this.deletingId.set(null);
        this.transferToId.set(-1);
    }

    confirmDelete(id: number) {
        const transferId = this.transferToId();
        const finalTransferId = transferId === -1 ? undefined : transferId;
        this.categoryService.delete(id, finalTransferId).subscribe({
            next: () => {
                this.successMessage.set('Categoria excluída com sucesso!');
                setTimeout(() => this.successMessage.set(null), 3000);
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

    getCategoryName(id: number): string {
        if (id === -1) return 'Excluir transações';
        const cat = this.categories().find(c => c.id === id);
        return cat ? cat.name : 'Excluir transações';
    }
}
