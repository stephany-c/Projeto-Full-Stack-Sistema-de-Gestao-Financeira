import { Component, OnInit, signal, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TransactionService } from '../../services/transaction.service';
import { CategoryService, Category } from '../../services/category.service';
import { Transaction, TransactionType } from '../../models/transaction.model';
import { AuthService } from '../../services/auth.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatDatepickerModule } from '@angular/material/datepicker';

@Component({
    selector: 'app-transaction-list',
    standalone: true,
    imports: [
        CommonModule, FormsModule,
        MatFormFieldModule, MatInputModule, MatSelectModule,
        MatButtonModule, MatIconModule, MatPaginatorModule, MatDatepickerModule
    ],
    templateUrl: './transaction-list.html',
    styleUrl: './transaction-list.scss'
})
export class TransactionListComponent implements OnInit {
    private authService = inject(AuthService);
    transactions = signal<Transaction[]>([]);
    categories = signal<Category[]>([]);

    // Pagination signals
    currentPage = signal(0);
    pageSize = signal(10);
    totalElements = signal(0);
    totalPages = signal(0);

    startDate = signal<any>('');
    endDate = signal<any>('');
    selectedCategoryId = signal('');
    selectedType = signal('');
    searchTerm = signal('');

    constructor(
        private transactionService: TransactionService,
        private categoryService: CategoryService,
        private router: Router
    ) { }


    ngOnInit(): void {
        this.loadTransactions();
        this.loadCategories();
    }

    loadTransactions(): void {
        const start = this.startDate();
        const end = this.endDate();

        // Convert Date objects to YYYY-MM-DD if they are Dates (from range picker)
        const startDateStr = start instanceof Date ? start.toISOString().split('T')[0] : start;
        const endDateStr = end instanceof Date ? end.toISOString().split('T')[0] : end;

        this.transactionService.getTransactions(
            this.currentPage(),
            this.pageSize(),
            this.selectedType() || undefined,
            this.selectedCategoryId() ? +this.selectedCategoryId() : undefined,
            startDateStr || undefined,
            endDateStr || undefined
        ).subscribe(response => {
            this.transactions.set(response.content);
            this.totalElements.set(response.totalElements);
            this.totalPages.set(response.totalPages);
        });
    }

    loadCategories(): void {
        this.categoryService.getAll().subscribe(data => this.categories.set(data));
    }

    applyFilter(): void {
        this.currentPage.set(0);
        this.loadTransactions();
    }

    onPageChange(page: number): void {
        this.currentPage.set(page);
        this.loadTransactions();
    }

    onPageSizeChange(size: number): void {
        this.pageSize.set(size);
        this.currentPage.set(0);
        this.loadTransactions();
    }

    onMatPageChange(event: PageEvent): void {
        this.pageSize.set(event.pageSize);
        this.currentPage.set(event.pageIndex);
        this.loadTransactions();
    }

    clearFilter(): void {
        this.startDate.set('');
        this.endDate.set('');
        this.selectedCategoryId.set('');
        this.selectedType.set('');
        this.searchTerm.set('');
        this.currentPage.set(0);
        this.loadTransactions();
    }

    deleteTransaction(id: number | undefined): void {
        if (id && confirm('Deseja excluir esta transação?')) {
            this.transactionService.delete(id).subscribe(() => {
                this.loadTransactions(); // Refresh current page
            });
        }
    }

    editingTransactionId = signal<number | null>(null);
    editData: any = {};

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
                    this.loadTransactions(); // Refresh to ensure data consistency
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
