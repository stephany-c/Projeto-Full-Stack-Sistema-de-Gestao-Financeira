import { Component, OnInit, signal, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TransactionService } from '../../services/transaction.service';
import { CategoryService, Category } from '../../services/category.service';
import { Transaction, TransactionType } from '../../models/transaction.model';
import { AuthService } from '../../services/auth.service';

@Component({
    selector: 'app-transaction-list',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './transaction-list.html',
    styleUrl: './transaction-list.scss'
})
export class TransactionListComponent implements OnInit {
    private authService = inject(AuthService);
    transactions = signal<Transaction[]>([]);
    allTransactions: Transaction[] = []; // Cache para filtro local rápido
    categories = signal<Category[]>([]);

    startDate = signal('');
    endDate = signal('');
    selectedCategoryId = signal('');
    selectedType = signal('');
    searchTerm = signal('');

    constructor(
        private transactionService: TransactionService,
        private categoryService: CategoryService,
        private router: Router
    ) { }

    ngOnInit(): void {
        this.loadAll();
        this.loadCategories();
    }

    loadAll(): void {
        this.transactionService.getAll().subscribe(data => {
            this.allTransactions = data;
            this.applyLocalFilters();
        });
    }

    loadCategories(): void {
        this.categoryService.getAll().subscribe(data => this.categories.set(data));
    }

    applyFilter(): void {
        if (this.startDate() && this.endDate()) {
            this.transactionService.getByPeriod(this.startDate(), this.endDate())
                .subscribe(data => {
                    this.allTransactions = data;
                    this.applyLocalFilters();
                });
        } else {
            this.applyLocalFilters();
        }
    }

    applyLocalFilters(): void {
        let filtered = [...this.allTransactions];

        if (this.selectedCategoryId()) {
            filtered = filtered.filter(t => t.categoryName === this.categories().find(c => c.id === +this.selectedCategoryId())?.name);
        }

        if (this.selectedType()) {
            filtered = filtered.filter(t => t.type === this.selectedType());
        }

        if (this.searchTerm()) {
            const term = this.searchTerm().toLowerCase();
            filtered = filtered.filter(t => t.description.toLowerCase().includes(term));
        }

        this.transactions.set(filtered);
    }

    clearFilter(): void {
        this.startDate.set('');
        this.endDate.set('');
        this.selectedCategoryId.set('');
        this.selectedType.set('');
        this.searchTerm.set('');
        this.loadAll();
    }

    deleteTransaction(id: number | undefined): void {
        if (id && confirm('Deseja excluir esta transação?')) {
            this.transactionService.delete(id).subscribe(() => {
                this.allTransactions = this.allTransactions.filter(t => t.id !== id);
                this.applyLocalFilters();
            });
        }
    }

    editingTransactionId = signal<number | null>(null);
    editData: Partial<Transaction> = {};

    startEdit(transaction: Transaction): void {
        if (!transaction.id) return;
        this.editingTransactionId.set(transaction.id);
        this.editData = { ...transaction };

        // Fallback: If categoryId is missing but categoryName exists, try to find the ID
        if (!this.editData.categoryId && this.editData.categoryName) {
            const foundCat = this.categories().find(c => c.name === this.editData.categoryName);
            if (foundCat) {
                this.editData.categoryId = foundCat.id;
            }
        }

        // Ensure date is in YYYY-MM-DD format for input
        if (this.editData.date) {
            this.editData.date = this.editData.date.split('T')[0];
        }
    }

    saveEdit(): void {
        const id = this.editingTransactionId();
        if (id && this.editData) {
            this.transactionService.update(id, this.editData).subscribe({
                next: (updated) => {
                    // Update the local list
                    this.allTransactions = this.allTransactions.map(t => t.id === updated.id ? updated : t);
                    this.applyLocalFilters();
                    this.cancelEdit();
                },
                error: (err) => console.error('Error updating transaction:', err)
            });
        }
    }

    cancelEdit(): void {
        this.editingTransactionId.set(null);
        this.editData = {};
    }
}
