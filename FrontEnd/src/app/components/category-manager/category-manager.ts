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
/**
 * CRUD de categorias com opção de reatribuir transações ao excluir.
 */
export class CategoryManagerComponent implements OnInit {

    // Estado principal
    categories = signal<Category[]>([]);
    searchTerm = signal('');

    // Filtro por nome
    filteredCategories = computed(() => {
        const term = this.searchTerm().toLowerCase();
        return this.categories().filter(c =>
            c.name.toLowerCase().includes(term)
        );
    });

    // Controle de UI
    editingId = signal<number | null>(null);
    deletingId = signal<number | null>(null);

    // -1 = excluir transações (evita usar null no mat-select)
    transferToId = signal<number>(-1);

    // Feedback
    errorMessage = signal<string | null>(null);
    successMessage = signal<string | null>(null);

    // Dependências
    private categoryService = inject(CategoryService);
    private fb = inject(FormBuilder);

    // Formulários
    addForm: FormGroup;
    editControl: FormControl;

    constructor() {
        // Form de criação
        this.addForm = this.fb.group({
            name: ['', [Validators.required, Validators.minLength(2)]]
        });

        // Input usado na edição inline
        this.editControl = new FormControl('', [
            Validators.required,
            Validators.minLength(2)
        ]);
    }

    ngOnInit() {
        this.loadCategories();
    }

    // Busca categorias na API
    loadCategories() {
        this.categoryService
            .getAll()
            .subscribe(data => this.categories.set(data));
    }

    // Cria nova categoria
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

    // Inicia edição inline
    startEdit(category: Category) {
        this.editingId.set(category.id);
        this.editControl.setValue(category.name);
    }

    // Cancela edição
    cancelEdit() {
        this.editingId.set(null);
        this.editControl.setValue('');
    }

    // Salva edição
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

    // Abre fluxo de exclusão
    startDelete(id: number) {
        this.deletingId.set(id);
        this.transferToId.set(-1);
    }

    // Cancela exclusão
    cancelDelete() {
        this.deletingId.set(null);
        this.transferToId.set(-1);
    }

    // Confirma exclusão (com ou sem transferência)
    confirmDelete(id: number) {
        const transferId = this.transferToId();

        // -1 => excluir transações
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

    // Lista categorias exceto a atual
    getOtherCategories(excludeId: number): Category[] {
        return this.categories().filter(c => c.id !== excludeId);
    }

    // Nome exibido no select de transferência
    getCategoryName(id: number): string {
        if (id === -1) return 'Excluir transações';

        const cat = this.categories().find(c => c.id === id);
        return cat ? cat.name : 'Excluir transações';
    }
}