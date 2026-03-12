import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { CategoryService } from '../../services/category.service';
import { Category } from '../../models/category.model';
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
        CommonModule, FormsModule, ReactiveFormsModule,
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


    editingId = signal<number | null>(null);

    deletingId = signal<number | null>(null);
    // Usa -1 como ID especial para "Excluir transações" associadas à categoria deletada.
    // Isso evita problemas visuais do mat-select com o valor 'null'.
    transferToId = signal<number>(-1);

    errorMessage = signal<string | null>(null);
    successMessage = signal<string | null>(null);

    private categoryService = inject(CategoryService);
    private fb = inject(FormBuilder);

    addForm: FormGroup;
    editControl: FormControl;

    constructor() {
        this.addForm = this.fb.group({
            name: ['', [Validators.required, Validators.minLength(2)]]
        });
        this.editControl = new FormControl('', [Validators.required, Validators.minLength(2)]);
    }

    ngOnInit() {
        this.loadCategories();
    }

    loadCategories() {
        this.categoryService.getAll().subscribe(data => this.categories.set(data));
    }

    addCategory() {
        if (this.addForm.invalid) return;
        this.errorMessage.set(null);

        const name = this.addForm.get('name')?.value;

        this.categoryService.create(name).subscribe({
            next: () => {
                this.successMessage.set('Categoria criada com sucesso!');
                setTimeout(() => this.successMessage.set(null), 3000);
                this.addForm.reset();
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
        this.editControl.setValue(category.name);
    }

    cancelEdit() {
        this.editingId.set(null);
        this.editControl.setValue('');
    }

    saveEdit(id: number) {
        if (this.editControl.invalid) return;
        this.errorMessage.set(null);

        const name = this.editControl.value;

        this.categoryService.update(id, name).subscribe({
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
